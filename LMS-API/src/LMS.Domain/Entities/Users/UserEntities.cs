using LMS.Domain.Common;

namespace LMS.Domain.Entities.Users
{
    public class AppRole : BaseEntity
    {
        public string RoleName { get; set; } = string.Empty; // Admin, Lecturer, Student
        public string Description { get; set; } = string.Empty;
    }

    public class AppUser : BaseEntity
    {
        public string Email { get; set; } = string.Empty; // Username
        public string PasswordHash { get; set; } = string.Empty;
        
        public string FullName { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? AvatarUrl { get; set; }
        public string? Bio { get; set; }
        public string? StudentCode { get; set; } // For Student
        public string? TeacherCode { get; set; } // For Lecturer
        public DateTime? DateOfBirth { get; set; }
        public bool MustChangePassword { get; set; } = true;
        public string Status { get; set; } = "Active"; // Active, Inactive, Suspended
        public bool IsActive { get; set; } = true; // Keep for backward compatibility or simple checks

        public Guid RoleId { get; set; }
        public Guid? DepartmentId { get; set; }

        // Navigation
        public AppRole? Role { get; set; }
        public LMS.Domain.Entities.System.Department? Department { get; set; }
        
        // As Student
        public ICollection<LMS.Domain.Entities.Courses.CourseStudent> EnrolledCourses { get; set; } = new List<LMS.Domain.Entities.Courses.CourseStudent>();
        public ICollection<LMS.Domain.Entities.Assessment.QuizSubmission> QuizSubmissions { get; set; } = new List<LMS.Domain.Entities.Assessment.QuizSubmission>();
        public ICollection<LMS.Domain.Entities.Assessment.LessonProgress> LessonProgresses { get; set; } = new List<LMS.Domain.Entities.Assessment.LessonProgress>();
        
        // As Lecturer
        public ICollection<LMS.Domain.Entities.Courses.CourseLecturer> CoLecturedCourses { get; set; } = new List<LMS.Domain.Entities.Courses.CourseLecturer>();
    }

    public class PasswordResetToken : BaseEntity
    {
        public string Email { get; set; } = string.Empty;
        public string Token { get; set; } = string.Empty;
        public DateTime ExpiryDate { get; set; }
        public bool IsUsed { get; set; }
    }
}
