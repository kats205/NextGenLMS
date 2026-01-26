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
            public string RoleName { get; set; } = string.Empty; // "Admin", "Lecturer", "Student"
            public Guid? DepartmentId { get; set; }
            public string? StudentCode { get; set; }
            public string? Password { get; set; } // Optional, if null -> auto-generate
        }

        public class UpdateUserDto
        {
            public Guid UserId { get; set; }
            public string Email { get; set; } = string.Empty;
            public string FullName { get; set; } = string.Empty;
            public string? Phone { get; set; }
            public string RoleName { get; set; } = string.Empty;
            public Guid? DepartmentId { get; set; }
            public string? StudentCode { get; set; }
            public bool IsActive { get; set; } = true;
        }

        public class UserDetailDto
        {
            public Guid Id { get; set; }
            public string Email { get; set; } = string.Empty;
            public string FullName { get; set; } = string.Empty;
            public string? Phone { get; set; }
            public string? AvatarUrl { get; set; }
            public string? StudentCode { get; set; }
            public string RoleName { get; set; } = string.Empty;
            public Guid RoleId { get; set; }
            public Guid? DepartmentId { get; set; }
            public string? DepartmentName { get; set; }
            public bool IsActive { get; set; }
            public bool IsFirstLogin { get; set; }
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
}
