using LMS.Domain.Common;

namespace LMS.Domain.Entities.System
{
    public class Department : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;

        // Navigation
        public ICollection<Major> Majors { get; set; } = new List<Major>();
        public ICollection<LMS.Domain.Entities.Users.AppUser> Users { get; set; } = new List<LMS.Domain.Entities.Users.AppUser>();
    }

    public class Major : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public Guid DepartmentId { get; set; }
        
        // Navigation
        public Department? Department { get; set; }
        public ICollection<LMS.Domain.Entities.Courses.Course> Courses { get; set; } = new List<LMS.Domain.Entities.Courses.Course>();
    }

    public class AcademicYear : BaseEntity
    {
        public string Name { get; set; } = string.Empty; // e.g., "2023-2024"
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        
        public ICollection<LMS.Domain.Entities.Courses.Course> Courses { get; set; } = new List<LMS.Domain.Entities.Courses.Course>();
    }

    public class Semester : BaseEntity
    {
        public string Name { get; set; } = string.Empty; // e.g., "Spring 2024"
        
        public ICollection<LMS.Domain.Entities.Courses.Course> Courses { get; set; } = new List<LMS.Domain.Entities.Courses.Course>();
    }

    public class SystemConfig : BaseEntity
    {
        public string ConfigKey { get; set; } = string.Empty;
        public string ConfigValue { get; set; } = string.Empty;
    }
}
