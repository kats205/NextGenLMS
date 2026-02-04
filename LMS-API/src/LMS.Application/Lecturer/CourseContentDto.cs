using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Application.Lecturer
{
    public class CourseContentDto
    {
        public Guid Id { get; set; }
        public Guid ChapterId { get; set; }
        public string Title { get; set; } = string.Empty;
        public int OrderIndex { get; set; }
        public string ContentType { get; set; } = string.Empty; // "Lesson" or "Quiz"
        public bool IsPublished { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
