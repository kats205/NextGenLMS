using LMS.Domain.Entities.Users;
using LMS.Domain.Entities.Courses;
using LMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using LMS.Domain.Entities.System;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace LMS.Infrastructure.Data
{
    public sealed class DataSeeder
    {
        private readonly AppDbContext _db;

        public DataSeeder(AppDbContext db) => _db = db;

        public async Task SeedAsync(CancellationToken ct = default)
        {
            try 
            {
                Console.WriteLine("[SEED] Running database seeding...");

                var now = DateTime.UtcNow;
                var passwordHash = BCrypt.Net.BCrypt.HashPassword("123456");

                // 1. SEED ROLES
                var roleAdminId = Guid.Parse("FDE15712-68ED-4720-9C7D-8153A0DF70D5");
                var roleLecturerId = Guid.Parse("8E3CDE01-4C8B-4F26-AD27-41E8DF3B64E7");
                var roleStudentId = Guid.Parse("7F6A5FB8-10D6-4B31-9F64-0AE904225071");

                if (!await _db.AppRoles.AnyAsync(ct))
                {
                    await _db.AppRoles.AddRangeAsync(new List<AppRole>
                    {
                        new AppRole { Id = roleAdminId, RoleName = "Admin", Description = "Quản trị viên", CreatedAt = now },
                        new AppRole { Id = roleLecturerId, RoleName = "Lecturer", Description = "Giảng viên", CreatedAt = now },
                        new AppRole { Id = roleStudentId, RoleName = "Student", Description = "Sinh viên", CreatedAt = now },
                    }, ct);
                    await _db.SaveChangesAsync(ct);
                    Console.WriteLine("  - Roles seeded.");
                }

                // 2. SEED DEPARTMENTS
                var deptFitId = Guid.Parse("68D2BA61-E3E8-42FE-BD96-542C0FC033C3");
                if (!await _db.Departments.AnyAsync(ct))
                {
                    await _db.Departments.AddAsync(new Department
                    {
                        Id = deptFitId,
                        Name = "Khoa Công nghệ Thông tin",
                        Code = "FIT",
                        CreatedAt = now
                    }, ct);
                    await _db.SaveChangesAsync(ct);
                    Console.WriteLine("  - Departments seeded.");
                }

                // 3. SEED USERS
                var adminUserId = Guid.Parse("F2CD183C-ECD7-4297-9237-BD306017E8AA");
                var lecturerUserId = Guid.Parse("50ED565D-C2A9-4B86-81FF-D42C3290D4B8");
                var studentUserId = Guid.Parse("48C6A748-4B43-4EAA-9AA7-A610D3423139");

                var usersToSeed = new List<AppUser>
                {
                    new AppUser
                    {
                        Id = adminUserId,
                        Email = "admintest@gmail.com",
                        PasswordHash = passwordHash,
                        FullName = "System Admin",
                        Status = "Active",
                        IsActive = true,
                        RoleId = roleAdminId,
                        CreatedAt = now
                    },
                    new AppUser
                    {
                        Id = lecturerUserId,
                        Email = "gv01test@gmail.com",
                        PasswordHash = passwordHash,
                        FullName = "Giảng viên 01",
                        TeacherCode = "GV001",
                        Status = "Active",
                        IsActive = true,
                        RoleId = roleLecturerId,
                        DepartmentId = deptFitId,
                        CreatedAt = now
                    },
                    new AppUser
                    {
                        Id = studentUserId,
                        Email = "sv01test@gmail.com",
                        PasswordHash = passwordHash,
                        FullName = "Sinh viên 01",
                        StudentCode = "SV001",
                        Status = "Active",
                        IsActive = true,
                        RoleId = roleStudentId,
                        DepartmentId = deptFitId,
                        CreatedAt = now
                    }
                };

                int seededCount = 0;
                foreach (var user in usersToSeed)
                {
                    if (!await _db.AppUsers.AnyAsync(u => u.Id == user.Id || u.Email == user.Email, ct))
                    {
                        await _db.AppUsers.AddAsync(user, ct);
                        seededCount++;
                    }
                }

                if (seededCount > 0)
                {
                    await _db.SaveChangesAsync(ct);
                    Console.WriteLine($"  - {seededCount} Users seeded.");
                }

                Console.WriteLine("[SEED] Completed successfully!");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] Seed failed: {ex.Message}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"[INNER ERROR] {ex.InnerException.Message}");
                }
            }
        }
    }
}
