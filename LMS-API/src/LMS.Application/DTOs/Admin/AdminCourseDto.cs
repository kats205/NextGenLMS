using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Application.DTOs.Admin
{
    public class CourseDto
    {
        public Guid Id { get; set; }
        public string CourseCode { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? ThumbnailUrl { get; set; }
        public Guid SemesterId { get; set; }
        public string SemesterName { get; set; } = string.Empty;
        public Guid AcademicYearId { get; set; }
        public string AcademicYearName { get; set; } = string.Empty;
        public Guid MajorId { get; set; }
        public string MajorName { get; set; } = string.Empty;
        public Guid LecturerId { get; set; }
        public string LecturerName { get; set; } = string.Empty;
        public int StudentCount { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CourseDetailDto : CourseDto
    {
        public string? LecturerEmail { get; set; }
        public string? LecturerPhone { get; set; }
        public string? LecturerAvatarUrl { get; set; }
        public List<StudentDto> Students { get; set; } = new();
        public int ChapterCount { get; set; }
        public int ContentCount { get; set; }
    }

    public class StudentDto
    {
        public Guid Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? StudentCode { get; set; }
        public DateTime EnrolledDate { get; set; }
    }

    public class CreateCourseDto
    {
        public string CourseCode { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int Credits { get; set; }
        public Guid SemesterId { get; set; }
        public Guid AcademicYearId { get; set; }
        public Guid MajorId { get; set; }
        public Guid? LecturerId { get; set; }
    }

    public class UpdateCourseDto
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public int? Credits { get; set; }
        public Guid? SemesterId { get; set; }
        public Guid? AcademicYearId { get; set; }
        public Guid? MajorId { get; set; }
    }

    public class CourseFilterDto
    {
        public string? SearchTerm { get; set; }
        public Guid? SemesterId { get; set; }
        public Guid? AcademicYearId { get; set; }
        public Guid? MajorId { get; set; }
        public Guid? LecturerId { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }

    public class CourseStatisticsDto
    {
        public Guid CourseId { get; set; }
        public string CourseName { get; set; } = string.Empty;
        public int TotalStudents { get; set; }
        public int TotalChapters { get; set; }
        public int TotalLessons { get; set; }
        public int TotalQuizzes { get; set; }
        public int TotalAssignments { get; set; }
        public double AverageProgress { get; set; }
        public int CompletedStudents { get; set; }
    }
}
