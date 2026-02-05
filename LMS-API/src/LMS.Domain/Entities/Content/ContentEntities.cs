using LMS.Domain.Common;
using LMS.Domain.Entities.Courses;

namespace LMS.Domain.Entities.Content
{
    public enum ContentType
    {
        Lesson = 1,
        Assignment = 2,  // Tự luận
        Quiz = 3,        // Trắc nghiệm  
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
        public string? Instructions { get; set; }
        public string? AttachmentsJson { get; set; } // JSON array of reference files
        public bool AllowLateSubmission { get; set; } = true;
        public int LatePenaltyPercent { get; set; } = 0; // Percentage penalty per day late
        public int MaxAttempts { get; set; } = 1; // -1 for unlimited
        public bool RequireTextSubmission { get; set; } = false;
        public bool AllowFileSubmission { get; set; } = true;
        public bool AllowLinkSubmission { get; set; } = true;
        public string? AllowedFileTypes { get; set; } // JSON array of allowed file extensions
        public long MaxFileSize { get; set; } = 10485760; // 10MB default

        // We'll use EssaySubmission table for assignment submissions
        // Each assignment will have a corresponding "virtual question" for submissions
        public Guid? VirtualQuestionId { get; set; } // Links to a Question that represents this assignment
    }

    public class Announcement : CourseContent
    {
        public string? ContentHtml { get; set; }
        public string? AttachmentsJson { get; set; } // JSON string for multiple file attachments
    }
}
