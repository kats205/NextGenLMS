using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Application.DTOs.Admin
{
    public class AdminCourseLecturerDto
    {
        public Guid Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? AvatarUrl { get; set; }
        public bool IsPrimary { get; set; }
    }

    public class AdminCourseDto
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
        public Guid? PrimaryLecturerId { get; set; }
        public string? PrimaryLecturerName { get; set; }
        public List<AdminCourseLecturerDto> Lecturers { get; set; } = new();
        public int StudentCount { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class AdminCourseDetailDto : AdminCourseDto
    {
        public List<AdminStudentDto> Students { get; set; } = new();
        public int ChapterCount { get; set; }
        public int ContentCount { get; set; }
    }

    public class AdminStudentDto
    {
        public Guid Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? StudentCode { get; set; }
        public DateTime EnrolledDate { get; set; }
    }

    public class AdminCreateCourseDto
    {
        public string CourseCode { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public Guid SemesterId { get; set; }
        public Guid AcademicYearId { get; set; }
        public Guid MajorId { get; set; }
        public string? ThumbnailUrl { get; set; }
        public List<Guid>? LecturerId { get; set; }
    }

    public class AdminUpdateCourseDto
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public Guid? SemesterId { get; set; }
        public Guid? AcademicYearId { get; set; }
        public Guid? MajorId { get; set; }
    }

    public class AdminCourseFilterDto
    {
        public string? SearchTerm { get; set; }
        public Guid? SemesterId { get; set; }
        public Guid? AcademicYearId { get; set; }
        public Guid? MajorId { get; set; }
        public List<Guid>? LecturerId { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }

    public class AdminCourseStatisticsDto
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
