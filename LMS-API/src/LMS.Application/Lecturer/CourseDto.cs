using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Application.Lecturer
{
    public class CourseDto
    {
        public Guid Id { get; set; }
        public string CourseCode { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? ThumbnailUrl { get; set; }

        // Foreign Keys
        public Guid SemesterId { get; set; }
        public Guid AcademicYearId { get; set; }
        public Guid MajorId { get; set; }
        public Guid LecturerId { get; set; }

        // Navigation properties (optional, based on includes)
        public string? SemesterName { get; set; }
        public string? AcademicYearName { get; set; }
        public string? MajorName { get; set; }
        public string? LecturerName { get; set; }

        // Computed statistics
        public int TotalStudents { get; set; }
        public int TotalChapters { get; set; }
        public int TotalLessons { get; set; }
        public int TotalQuizzes { get; set; }
        public double AverageProgress { get; set; } // 0-100

        // Timestamps
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
    public class CreateCourseDto
    {
        [Required]
        [StringLength(50)]
        public string CourseCode { get; set; } = string.Empty;

        [Required]
        [StringLength(255)]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }
        public string? ThumbnailUrl { get; set; }

        [Required]
        public Guid SemesterId { get; set; }

        [Required]
        public Guid AcademicYearId { get; set; }

        [Required]
        public Guid MajorId { get; set; }
    }

    public class UpdateCourseDto
    {
        public string? CourseCode { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? ThumbnailUrl { get; set; }
        public Guid? SemesterId { get; set; }
        public Guid? AcademicYearId { get; set; }
        public Guid? MajorId { get; set; }
    }
    public class CourseReportDto
    {
        public Guid CourseId { get; set; }
        public string CourseName { get; set; } = string.Empty;
        public string CourseCode { get; set; } = string.Empty;

        // Overall statistics
        public int TotalStudents { get; set; }
        public double AverageProgress { get; set; } // 0-100
        public double AverageQuizScore { get; set; } // 0-10
        public double AverageAssignmentScore { get; set; } // 0-10
        public double CompletionRate { get; set; } // Percentage of students who completed
        public int StudentsAtRisk { get; set; } // Students with progress < 50% or score < 5

        // Top performers (top 5)
        public List<StudentDto> TopPerformers { get; set; } = new();

        // Content statistics
        public int TotalLessons { get; set; }
        public int TotalQuizzes { get; set; }
        public int TotalChapters { get; set; }

        // Engagement metrics
        public double AverageLessonCompletionRate { get; set; }
        public double AverageQuizCompletionRate { get; set; }

        // Time metrics
        public double AverageTimeSpentHours { get; set; }
    }
}
