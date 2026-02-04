using LMS.Domain.Entities.Users;
using Microsoft.EntityFrameworkCore;
using System;

namespace LMS.Infrastructure.Data
{
    public static class DataSeeder
    {
        public static void Seed(this ModelBuilder modelBuilder)
        {
            // 1. Roles
            var adminRoleId = new Guid("11111111-1111-1111-1111-111111111111");
            var lecturerRoleId = new Guid("22222222-2222-2222-2222-222222222222");
            var studentRoleId = new Guid("33333333-3333-3333-3333-333333333333");

            modelBuilder.Entity<AppRole>().HasData(
                new AppRole
                {
                    Id = adminRoleId,
                    RoleName = "Admin",
                    Description = "Administrator with full access",
                    CreatedAt = new DateTime(2024, 1, 1),
                    UpdatedAt = new DateTime(2024, 1, 1),
                    IsDeleted = false
                },
                new AppRole
                {
                    Id = lecturerRoleId,
                    RoleName = "Lecturer",
                    Description = "Teacher/Lecturer",
                    CreatedAt = new DateTime(2024, 1, 1),
                    UpdatedAt = new DateTime(2024, 1, 1),
                    IsDeleted = false
                },
                new AppRole
                {
                    Id = studentRoleId,
                    RoleName = "Student",
                    Description = "Student/Learner",
                    CreatedAt = new DateTime(2024, 1, 1),
                    UpdatedAt = new DateTime(2024, 1, 1),
                    IsDeleted = false
                }
            );

            // 2. Users (Admin, Lecturer, Student)
            // Password: Admin@123
            // Important: Using BCrypt.HashPassword() directly here is convenient but will cause 
            // a new hash to be generated every time you run 'add-migration', creating unnecessary changes.
            // However, it ensures the hash is always valid regardless of the library version.
            
            var passwordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"); 

            modelBuilder.Entity<AppUser>().HasData(
                new AppUser
                {
                    Id = new Guid("99999999-9999-9999-9999-999999999999"),
                    FullName = "System Admin",
                    Email = "admin@utc.edu.vn",
                    PasswordHash = passwordHash, 
                    RoleId = adminRoleId,
                    Status = "Active",
                    IsActive = true,
                    CreatedAt = new DateTime(2024, 1, 1),
                    UpdatedAt = new DateTime(2024, 1, 1),
                    IsDeleted = false
                },
                new AppUser
                {
                    Id = new Guid("88888888-8888-8888-8888-888888888888"),
                    FullName = "Giảng viên mẫu",
                    Email = "giangvien@utc.edu.vn",
                    TeacherCode = "GV001",
                    PasswordHash = passwordHash,
                    RoleId = lecturerRoleId,
                    Status = "Active",
                    IsActive = true,
                    CreatedAt = new DateTime(2024, 1, 1),
                    UpdatedAt = new DateTime(2024, 1, 1),
                    IsDeleted = false
                },
                new AppUser
                {
                    Id = new Guid("77777777-7777-7777-7777-777777777777"),
                    FullName = "Sinh viên mẫu",
                    Email = "sinhvien@utc.edu.vn",
                    StudentCode = "SV001",
                    PasswordHash = passwordHash,
                    RoleId = studentRoleId,
                    Status = "Active",
                    IsActive = true,
                    CreatedAt = new DateTime(2024, 1, 1),
                    UpdatedAt = new DateTime(2024, 1, 1),
                    IsDeleted = false
                }
            );
        }
    }
}
