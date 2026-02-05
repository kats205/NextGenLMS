using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Application.DTOs.Admin
{
        public class CreateUserDto
        {
            public string Email { get; set; } = string.Empty;
            public string FullName { get; set; } = string.Empty;
            public string? Phone { get; set; }
            public DateTime? DateOfBirth { get; set; }
            public string RoleName { get; set; } = string.Empty; // "Admin", "Lecturer", "Student"
            public Guid? DepartmentId { get; set; }
            public string? StudentCode { get; set; }
            public string? TeacherCode { get; set; }
            public string? Password { get; set; } // Optional, if null -> auto-generate
        }

        public class UpdateUserDto
        {
            public Guid UserId { get; set; }
            public string Email { get; set; } = string.Empty;
            public string FullName { get; set; } = string.Empty;
            public DateTime? DateOfBirth { get; set; }
            public string? Phone { get; set; }
            public string RoleName { get; set; } = string.Empty;
            public Guid? DepartmentId { get; set; }
            public string? StudentCode { get; set; }
            public string? TeacherCode { get; set; }
            public bool IsActive { get; set; } = true;
        }

        public class UserDetailDto
        {
            public Guid Id { get; set; }
            public string Email { get; set; } = string.Empty;
            public string FullName { get; set; } = string.Empty;
            public string? Phone { get; set; }
            public DateTime? DateOfBirth { get; set; }
            public string? AvatarUrl { get; set; }
            public string? StudentCode { get; set; }
            public string? TeacherCode { get; set; }
            public string RoleName { get; set; } = string.Empty;
            public Guid RoleId { get; set; }
            public Guid? DepartmentId { get; set; }
            public string? DepartmentName { get; set; }
            public bool IsActive { get; set; }
            public bool MustChangePassword { get; set; }
            public DateTime CreatedAt { get; set; }
            public DateTime? UpdatedAt { get; set; }
        }

        public class DeleteUserDto
        {
            public Guid UserId { get; set; }
        }

        public class ToggleUserStatusDto
        {
            public Guid UserId { get; set; }
            public bool IsActive { get; set; }
        }

        public class ImportUserResultDto
        {
            public int CreatedCount { get; set; }
            public int UpdatedCount { get; set; }
            public List<string> Errors { get; set; } = new List<string>();
        }

        public class DashboardStatsDto
        {
            public int TotalUsers { get; set; }
            public int TotalLecturers { get; set; }
            public int TotalStudents { get; set; }
            public int TotalCourses { get; set; }
            public int ActiveCourses { get; set; }
            public List<RecentActivityDto> RecentActivities { get; set; } = new List<RecentActivityDto>();
        }

        public class RecentActivityDto
        {
            public string Type { get; set; } // "user", "course", "system"
            public string Action { get; set; }
            public DateTime Time { get; set; }
            public string TimeFormatted { get; set; }
        }
}
