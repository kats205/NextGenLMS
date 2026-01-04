using LMS.Domain.Common;
using LMS.Domain.Entities.Users;
using LMS.Domain.Entities.System;
using LMS.Domain.Entities.Content;

namespace LMS.Domain.Entities.Courses
{
    public class Course : BaseEntity
    {
        public string CourseCode { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? ThumbnailUrl { get; set; }

        public Guid SemesterId { get; set; }
        public Guid AcademicYearId { get; set; }
        public Guid MajorId { get; set; }
        public Guid LecturerId { get; set; }

        // Navigation
        public Semester? Semester { get; set; }
        public AcademicYear? AcademicYear { get; set; }
        public Major? Major { get; set; }
        public AppUser? Lecturer { get; set; }

        public ICollection<CourseStudent> Students { get; set; } = new List<CourseStudent>();
        public ICollection<Chapter> Chapters { get; set; } = new List<Chapter>();
    }

    public class CourseStudent : BaseEntity
    {
        public Guid CourseId { get; set; }
        public Guid StudentId { get; set; }
        public DateTime EnrolledDate { get; set; } = DateTime.UtcNow;

        // Navigation
        public Course? Course { get; set; }
        public AppUser? Student { get; set; }
    }

    public class Chapter : BaseEntity
    {
        public Guid CourseId { get; set; }
        public string Title { get; set; } = string.Empty;
        public int OrderIndex { get; set; }

        // Navigation
        public Course? Course { get; set; }
        public ICollection<CourseContent> Contents { get; set; } = new List<CourseContent>();
    }
}
