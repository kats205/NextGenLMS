using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Application.Lecturer
{
    public class ChapterDto
    {
        public Guid Id { get; set; }
        public Guid CourseId { get; set; }
        public string Title { get; set; } = string.Empty;
        public int OrderIndex { get; set; }

        // Optional: Include contents when needed
        public List<CourseContentDto>? Contents { get; set; }

        // Statistics
        public int TotalLessons { get; set; }
        public int TotalQuizzes { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
    public class CreateChapterDto
    {
        [Required]
        public Guid CourseId { get; set; }

        [Required]
        [StringLength(255)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public int OrderIndex { get; set; }
    }

    public class UpdateChapterDto
    {
        public string? Title { get; set; }
        public int? OrderIndex { get; set; }
    }
}
