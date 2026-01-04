using LMS.Domain.Common;
using LMS.Domain.Entities.Courses;

namespace LMS.Domain.Entities.Content
{
    public enum ContentType
    {
        Lesson = 1,
        Quiz = 2,
        Assignment = 3,
        Announcement = 4
    }

    // Base Class for Polymorphism
    public abstract class CourseContent : BaseEntity
    {
        public Guid ChapterId { get; set; }
        public string Title { get; set; } = string.Empty;
        public ContentType Type { get; set; }
        public int OrderIndex { get; set; }

        // Navigation
        public Chapter? Chapter { get; set; }
    }

    public class Lesson : CourseContent
    {
        public string? FileUrl { get; set; }
        public string? FileType { get; set; } // PDF, Video
        public long FileSize { get; set; }
        public int DurationSeconds { get; set; }
        public string? ContentHtml { get; set; } // For text lessons
    }

    public class Quiz : CourseContent
    {
        public DateTime? OpenTime { get; set; }
        public DateTime? CloseTime { get; set; }
        public int DurationMinutes { get; set; } // -1 for unlimited
        public bool ShuffleQuestions { get; set; }
        public bool ShuffleAnswers { get; set; }
        
        public ICollection<LMS.Domain.Entities.Assessment.QuizQuestion> Questions { get; set; } = new List<LMS.Domain.Entities.Assessment.QuizQuestion>();
    }

    public class Assignment : CourseContent
    {
        public DateTime? DueDate { get; set; }
        public int MaxScore { get; set; }
        public string? Description { get; set; }
    }
}
