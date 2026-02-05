using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Application.Lecturer
{
    public class LessonDto : CourseContentDto
    {
        public string? FileUrl { get; set; }
        public string? FileType { get; set; } // "PDF", "Video", "Document"
        public long FileSize { get; set; } // in bytes
        public int DurationSeconds { get; set; }
        public string? ContentHtml { get; set; } // Rich text content

        // Statistics
        public int TotalViews { get; set; }
        public int CompletedStudents { get; set; }
        public double CompletionRate { get; set; } // percentage
    }
    public class CreateLessonDto
    {
        [Required]
        public Guid ChapterId { get; set; }

        [Required]
        [StringLength(255)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public int OrderIndex { get; set; }

        public string? FileUrl { get; set; }
        public string? FileType { get; set; }
        public long? FileSize { get; set; }
        public int? DurationSeconds { get; set; }
        public string? ContentHtml { get; set; }
    }

    public class UpdateLessonDto
    {
        public string? Title { get; set; }
        public int? OrderIndex { get; set; }
        public string? FileUrl { get; set; }
        public string? FileType { get; set; }
        public long? FileSize { get; set; }
        public int? DurationSeconds { get; set; }
        public string? ContentHtml { get; set; }
    }
    public class LessonProgressDetailDto
    {
        public Guid LessonId { get; set; }
        public string LessonTitle { get; set; } = string.Empty;
        public bool IsCompleted { get; set; }
        public int VideoProgressSeconds { get; set; }
        public DateTime? LastAccess { get; set; }
    }
}
