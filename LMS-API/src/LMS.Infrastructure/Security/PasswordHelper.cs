using Microsoft.AspNetCore.Identity;

namespace LMS.Infrastructure.Security;

public static class PasswordHelper
{
    private static readonly PasswordHasher<object> _hasher = new();

    // Hash mật khẩu (dùng khi tạo user, seed data, reset password)
    public static string Hash(string plainPassword)
    {
        return _hasher.HashPassword(null!, plainPassword);
    }

    // Verify khi login
    public static bool Verify(string hashedPassword, string inputPassword)
    {
        var result = _hasher.VerifyHashedPassword(
            null!,
            hashedPassword,
            inputPassword
        );

        return result == PasswordVerificationResult.Success
            || result == PasswordVerificationResult.SuccessRehashNeeded;
    }
}
