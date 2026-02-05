using LMS.Application.DTOs.Authentication;
using LMS.Application.Interfaces;
using LMS.Infrastructure.Data;
using LMS.Infrastructure.Security;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Infrastructure.Services
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _db;
        private readonly IConfiguration _config;
        private readonly IEmailService _emailService;

        public AuthService(AppDbContext db, IConfiguration config, IEmailService emailService)
        {
            _db = db;
            _config = config;
            _emailService = emailService;
        }

        public async Task<LoginResponse> LoginAsync(LoginRequest request)
        {
            // 1. Tìm user theo email
            var user = await _db.AppUsers
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Email == request.Email && !u.IsDeleted);

            if (user == null)
            {
                throw new UnauthorizedAccessException("Email hoặc mật khẩu không đúng");
            }

            // 2. Kiểm tra account có active không
            if (!user.IsActive)
            {
                throw new UnauthorizedAccessException("Tài khoản đã bị khóa");
            }

            // 3. Verify password
            Console.WriteLine($"[AUTH] Verifying password for {user.Email}...");
            var isPasswordValid = PasswordHelper.Verify(user.PasswordHash, request.Password);
            
            if (!isPasswordValid)
            {
                Console.WriteLine($"[AUTH] Password validation failed for {user.Email}.");
                Console.WriteLine($"[AUTH] Stored Hash: {user.PasswordHash}");
                throw new UnauthorizedAccessException("Email hoặc mật khẩu không đúng");
            }
            Console.WriteLine($"[AUTH] Password validation success for {user.Email}.");

            // 4. Generate tokens
            var token = GenerateJwtToken(user);
            var refreshTokenValue = GenerateRefreshToken();

            // 5. Lưu refresh token vào database
            var refreshTokenEntity = new LMS.Domain.Entities.Users.RefreshToken
            {
                Token = refreshTokenValue,
                UserId = user.Id,
                Expires = DateTime.UtcNow.AddDays(7), // Refresh Token valid for 7 days
                Created = DateTime.UtcNow
            };
            
            _db.RefreshTokens.Add(refreshTokenEntity);
            await _db.SaveChangesAsync();

            // 6. Return response
            return new LoginResponse
            {
                Token = token,
                RefreshToken = refreshTokenValue,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role?.RoleName ?? "Student",
                UserId = user.Id,
                MustChangePassword = user.MustChangePassword
            };
        }

        public async Task<bool> ValidateTokenAsync(string token)
        {
            if (string.IsNullOrEmpty(token))
                return false;

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_config["Jwt:Secret"] ?? "your-super-secret-key-min-32-characters-long");

            try
            {
                tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidIssuer = _config["Jwt:Issuer"],
                    ValidateAudience = true,
                    ValidAudience = _config["Jwt:Audience"],
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                }, out SecurityToken validatedToken);

                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<LoginResponse> RefreshTokenAsync(string oldRefreshToken)
        {
            // 1. Tìm refresh token trong DB
            var existingToken = await _db.RefreshTokens
                .Include(r => r.User)
                .ThenInclude(u => u.Role)
                .FirstOrDefaultAsync(r => r.Token == oldRefreshToken);

            // 2. Validate token
            if (existingToken == null)
                throw new UnauthorizedAccessException("Invalid refresh token");

            if (existingToken.IsExpired)
                throw new UnauthorizedAccessException("Refresh token has expired");

            if (existingToken.Revoked != null)
                throw new UnauthorizedAccessException("Refresh token has been revoked");

            // 3. Mark old token as revoked
            existingToken.Revoked = DateTime.UtcNow;

            // 4. Generate new pair of tokens
            var newAccessToken = GenerateJwtToken(existingToken.User!);
            var newRefreshTokenValue = GenerateRefreshToken();

            // 5. Save new refresh token
            var newRefreshTokenEntity = new LMS.Domain.Entities.Users.RefreshToken
            {
                Token = newRefreshTokenValue,
                UserId = existingToken.UserId,
                Expires = DateTime.UtcNow.AddDays(7),
                Created = DateTime.UtcNow
            };

            _db.RefreshTokens.Add(newRefreshTokenEntity);
            await _db.SaveChangesAsync();

            return new LoginResponse
            {
                Token = newAccessToken,
                RefreshToken = newRefreshTokenValue,
                FullName = existingToken.User!.FullName,
                Email = existingToken.User.Email,
                Role = existingToken.User.Role?.RoleName ?? "Student",
                UserId = existingToken.UserId,
                MustChangePassword = existingToken.User.MustChangePassword
            };
        }

        public async Task RevokeTokenAsync(string refreshToken)
        {
            var token = await _db.RefreshTokens.FirstOrDefaultAsync(r => r.Token == refreshToken);
            if (token != null)
            {
                token.Revoked = DateTime.UtcNow;
                await _db.SaveChangesAsync();
            }
        }

        #region Private Methods

        private string GenerateJwtToken(LMS.Domain.Entities.Users.AppUser user)
        {
            var key = Encoding.UTF8.GetBytes(_config["Jwt:Secret"] ?? "your-super-secret-key-min-32-characters-long");
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Name, user.FullName),
                    new Claim(ClaimTypes.Role, user.Role?.RoleName ?? "Student"),
                    new Claim("RoleId", user.RoleId.ToString()),
                    new Claim("StudentCode", user.StudentCode ?? "")
                }),
                Expires = DateTime.UtcNow.AddMinutes(30), // Access Token 30 mins
                Issuer = _config["Jwt:Issuer"],
                Audience = _config["Jwt:Audience"],
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature
                )
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        private string GenerateRefreshToken()
        {
            var randomNumber = new byte[64];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }

        #endregion
        public async Task ChangePasswordAsync(Guid userId, string currentPassword, string newPassword)
        {
            var user = await _db.AppUsers.FindAsync(userId);
            if (user == null)
                throw new KeyNotFoundException("User not found");

            if (!PasswordHelper.Verify(user.PasswordHash, currentPassword))
                throw new UnauthorizedAccessException("Mật khẩu hiện tại không đúng");

            user.PasswordHash = PasswordHelper.Hash(newPassword);
            user.MustChangePassword = false; // Reset flag if set
            
            await _db.SaveChangesAsync();
        }

        public async Task ForgotPasswordAsync(string email)
        {
            var user = await _db.AppUsers.FirstOrDefaultAsync(u => u.Email == email && !u.IsDeleted);
            if (user == null) return; // Silent return for security

            // 1. Create Token
            var token = Guid.NewGuid().ToString("N");
            var resetToken = new LMS.Domain.Entities.Users.PasswordResetToken
            {
                Email = email,
                Token = token,
                ExpiryDate = DateTime.UtcNow.AddMinutes(15),
                IsUsed = false,
                CreatedAt = DateTime.UtcNow
            };

            _db.PasswordResetTokens.Add(resetToken);
            await _db.SaveChangesAsync();

            // 2. Send Email
            var resetLink = $"http://localhost:5173/reset-password?email={email}&token={token}";
            var subject = "Yêu cầu đặt lại mật khẩu - NextGenLMS";
            var body = $"<h1>Đặt lại mật khẩu</h1><p>Nhấn vào link sau để đặt lại mật khẩu:</p><p><a href=\"{resetLink}\">{resetLink}</a></p><p>Link có hiệu lực trong 15 phút.</p>";

            await _emailService.SendEmailAsync(email, subject, body);
        }

        public async Task ResetPasswordAsync(string email, string token, string newPassword)
        {
            var resetToken = await _db.PasswordResetTokens
                .FirstOrDefaultAsync(t => t.Token == token && t.Email == email && !t.IsUsed);

            if (resetToken == null || resetToken.ExpiryDate < DateTime.UtcNow)
                throw new UnauthorizedAccessException("Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn");

            var user = await _db.AppUsers.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null)
                throw new KeyNotFoundException("User not found");

            // Update user password
            user.PasswordHash = PasswordHelper.Hash(newPassword);
            user.MustChangePassword = false;

            // Mark token as used
            resetToken.IsUsed = true;
            resetToken.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
        }
    }
}
