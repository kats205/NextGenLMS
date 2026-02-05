using System;

namespace LMS.Application.Common
{
    public class CourseProgressDto
    {
        public string CourseId { get; set; } = string.Empty;
        public int TotalLessons { get; set; }
        public int CompletedLessons { get; set; }
        public double ProgressPercentage { get; set; }
        public DateTime? LastAccessedAt { get; set; }
    }
}
