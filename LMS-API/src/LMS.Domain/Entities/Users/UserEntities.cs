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
        public string? StudentCode { get; set; } // Nullable if Lecturer
        public bool IsFirstLogin { get; set; } = true;
        public bool IsActive { get; set; } = true;

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
        public ICollection<LMS.Domain.Entities.Courses.Course> ManagedCourses { get; set; } = new List<LMS.Domain.Entities.Courses.Course>();
    }
}
