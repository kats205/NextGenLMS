using LMS.Application.DTOs.Admin;
using LMS.Application.DTOs.Common;
using LMS.Domain.Entities.Users;
using LMS.Infrastructure.Data;
using LMS.Infrastructure.Security;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Infrastructure.Services
{
    public class AdminUserService : IAdminUserService
    {
        private readonly AppDbContext _db;

        public AdminUserService(AppDbContext db) => _db = db;


        public async Task<PagedResultDto<UserListItemDto>> GetUserAsync(UserQueryParams q)
        {
            var query = _db.AppUsers.AsQueryable();

            if (!string.IsNullOrWhiteSpace(q.Search))
            {
                var s = q.Search.Trim().ToLower();
                query = query.Where(u =>
                u.FullName.ToLower().Contains(s)
                || u.Email.ToLower().Contains(s)
                );
            }

            if(!string.IsNullOrWhiteSpace(q.Role) && q.Role != "all")
            {
                query = query.Where(u => u.Role.RoleName.ToString().ToLower() == q.Role.ToLower());
            }

            var totalItems = await query.CountAsync();

            var page = Math.Max(q.Page, 1);
            var pageSize = Math.Clamp(q.PageSize, 1, 100);
            var skip = (page - 1) * pageSize;

            var items = await query
                .OrderByDescending(u => u.FullName)
                .Skip(skip)
                .Take(pageSize)
                .Select(u => new UserListItemDto
                {
                    Id = u.Id,
                    FullName = u.FullName,
                    Email = u.Email,
                    Role = u.Role.RoleName.ToString(),
                    Department = u.Department.Name,
                    Status = u.IsActive ? "active" : "inactive"
                }).ToListAsync();

            return new PagedResultDto<UserListItemDto>
            {
                Items = items,
                Page = page,
                PageSize = pageSize,
                TotalItems = totalItems
            };
        }
        public async Task<ServiceResult<UserDetailDto>> GetUserByIdAsync(Guid userId)
        {
            var user = await _db.AppUsers
                .Include(u => u.Role)
                .Include(u => u.Department)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                return ServiceResult<UserDetailDto>.Failure("Không tìm thấy người dùng");
            }

            var userDetail = new UserDetailDto
            {
                Id = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                Phone = user.Phone,
                AvatarUrl = user.AvatarUrl,
                StudentCode = user.StudentCode,
                RoleName = user.Role?.RoleName ?? string.Empty,
                RoleId = user.RoleId,
                DepartmentId = user.DepartmentId,
                DepartmentName = user.Department?.Name,
                IsActive = user.IsActive,
                IsFirstLogin = user.IsFirstLogin,
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.UpdatedAt
            };

            return ServiceResult<UserDetailDto>.Success(userDetail);
        }

        public async Task<ServiceResult<UserDetailDto>> CreateUserAsync(CreateUserDto dto)
        {
            // Check if email exists
            if (await _db.AppUsers.AnyAsync(u => u.Email == dto.Email))
            {
                return ServiceResult<UserDetailDto>.Failure("Email đã tồn tại trong hệ thống");
            }

            // Get role
            var role = await _db.AppRoles.FirstOrDefaultAsync(r => r.RoleName.ToLower() == dto.RoleName.ToLower());
            if (role == null)
            {
                return ServiceResult<UserDetailDto>.Failure("Vai trò không hợp lệ");
            }

            // Validate department if provided
            if (dto.DepartmentId.HasValue)
            {
                var departmentExists = await _db.Departments.AnyAsync(d => d.Id == dto.DepartmentId.Value);
                if (!departmentExists)
                {
                    return ServiceResult<UserDetailDto>.Failure("Khoa/Bộ môn không tồn tại");
                }
            }

            // Generate password if not provided
            var password = dto.Password ?? GenerateRandomPassword();
            var passwordHash = PasswordHelper.Hash(password);

            var newUser = new AppUser
            {
                Id = Guid.NewGuid(),
                Email = dto.Email,
                FullName = dto.FullName,
                Phone = dto.Phone,
                PasswordHash = passwordHash,
                RoleId = role.Id,
                DepartmentId = dto.DepartmentId,
                StudentCode = dto.StudentCode,
                IsActive = true,
                IsFirstLogin = true,
                CreatedAt = DateTime.UtcNow
            };

            _db.AppUsers.Add(newUser);
            await _db.SaveChangesAsync();

            // Load navigation properties
            await _db.Entry(newUser).Reference(u => u.Role).LoadAsync();
            await _db.Entry(newUser).Reference(u => u.Department).LoadAsync();

            var result = new UserDetailDto
            {
                Id = newUser.Id,
                Email = newUser.Email,
                FullName = newUser.FullName,
                Phone = newUser.Phone,
                StudentCode = newUser.StudentCode,
                RoleName = newUser.Role?.RoleName ?? string.Empty,
                RoleId = newUser.RoleId,
                DepartmentId = newUser.DepartmentId,
                DepartmentName = newUser.Department?.Name,
                IsActive = newUser.IsActive,
                IsFirstLogin = newUser.IsFirstLogin,
                CreatedAt = newUser.CreatedAt
            };

            return ServiceResult<UserDetailDto>.Success(result, "Tạo người dùng thành công");
        }

        public async Task<ServiceResult<UserDetailDto>> UpdateUserAsync(UpdateUserDto dto)
        {
            var user = await _db.AppUsers
                .Include(u => u.Role)
                .Include(u => u.Department)
                .FirstOrDefaultAsync(u => u.Id == dto.UserId);

            if (user == null)
            {
                return ServiceResult<UserDetailDto>.Failure("Không tìm thấy người dùng");
            }

            // Check email uniqueness (excluding current user)
            if (await _db.AppUsers.AnyAsync(u => u.Email == dto.Email && u.Id != dto.UserId))
            {
                return ServiceResult<UserDetailDto>.Failure("Email đã được sử dụng bởi người dùng khác");
            }

            // Get role
            var role = await _db.AppRoles.FirstOrDefaultAsync(r => r.RoleName.ToLower() == dto.RoleName.ToLower());
            if (role == null)
            {
                return ServiceResult<UserDetailDto>.Failure("Vai trò không hợp lệ");
            }

            // Validate department if provided
            if (dto.DepartmentId.HasValue)
            {
                var departmentExists = await _db.Departments.AnyAsync(d => d.Id == dto.DepartmentId.Value);
                if (!departmentExists)
                {
                    return ServiceResult<UserDetailDto>.Failure("Khoa/Bộ môn không tồn tại");
                }
            }

            // Update user
            user.Email = dto.Email;
            user.FullName = dto.FullName;
            user.Phone = dto.Phone;
            user.RoleId = role.Id;
            user.DepartmentId = dto.DepartmentId;
            user.StudentCode = dto.StudentCode;
            user.IsActive = dto.IsActive;
            user.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            // Reload navigation properties
            await _db.Entry(user).Reference(u => u.Role).LoadAsync();
            await _db.Entry(user).Reference(u => u.Department).LoadAsync();

            var result = new UserDetailDto
            {
                Id = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                Phone = user.Phone,
                StudentCode = user.StudentCode,
                RoleName = user.Role?.RoleName ?? string.Empty,
                RoleId = user.RoleId,
                DepartmentId = user.DepartmentId,
                DepartmentName = user.Department?.Name,
                IsActive = user.IsActive,
                IsFirstLogin = user.IsFirstLogin,
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.UpdatedAt
            };

            return ServiceResult<UserDetailDto>.Success(result, "Cập nhật người dùng thành công");
        }

        public async Task<ServiceResult<bool>> DeleteUserAsync(Guid userId)
        {
            var user = await _db.AppUsers.FindAsync(userId);
            if (user == null)
            {
                return ServiceResult<bool>.Failure("Không tìm thấy người dùng");
            }

            // Check if user has related data (courses, submissions, etc.)
            var hasEnrollments = await _db.Set<Domain.Entities.Courses.CourseStudent>()
                .AnyAsync(cs => cs.StudentId == userId);

            var hasManagedCourses = await _db.Set<Domain.Entities.Courses.Course>()
                .AnyAsync(c => c.LecturerId == userId);

            if (hasEnrollments || hasManagedCourses)
            {
                return ServiceResult<bool>.Failure("Không thể xóa người dùng đã có dữ liệu liên quan. Vui lòng vô hiệu hóa thay vì xóa.");
            }

            _db.AppUsers.Remove(user);
            await _db.SaveChangesAsync();

            return ServiceResult<bool>.Success(true, "Xóa người dùng thành công");
        }

        public async Task<ServiceResult<bool>> ToggleUserStatusAsync(ToggleUserStatusDto dto)
        {
            var user = await _db.AppUsers.FindAsync(dto.UserId);
            if (user == null)
            {
                return ServiceResult<bool>.Failure("Không tìm thấy người dùng");
            }

            user.IsActive = dto.IsActive;
            user.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            var message = dto.IsActive ? "Kích hoạt người dùng thành công" : "Vô hiệu hóa người dùng thành công";
            return ServiceResult<bool>.Success(true, message);
        }

        public async Task<ServiceResult<string>> ResetPasswordAsync(Guid userId)
        {
            var user = await _db.AppUsers.FindAsync(userId);
            if (user == null)
            {
                return ServiceResult<string>.Failure("Không tìm thấy người dùng");
            }

            var newPassword = GenerateRandomPassword();
            user.PasswordHash = PasswordHelper.Hash(newPassword);
            user.IsFirstLogin = true;
            user.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            return ServiceResult<string>.Success(newPassword, "Reset mật khẩu thành công");
        }

        private string GenerateRandomPassword()
        {
            // Generate 8-character password with letters and numbers
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            var random = new Random();
            return new string(Enumerable.Repeat(chars, 8)
                .Select(s => s[random.Next(s.Length)]).ToArray());
        }
    }
}
