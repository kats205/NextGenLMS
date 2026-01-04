using LMS.Domain.Common;
using LMS.Domain.Entities.Content;
using LMS.Domain.Entities.Users;

namespace LMS.Domain.Entities.Assessment
{
    // Question Bank
    public class QuestionTopic : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public Guid LecturerId { get; set; }
    }

    public enum QuestionType
    {
        MultipleChoice = 1,
        Essay = 2,
        TrueFalse = 3
    }

    public class Question : BaseEntity
    {
        public Guid TopicId { get; set; }
        public string ContentText { get; set; } = string.Empty;
        public string? MediaUrl { get; set; }
        public QuestionType Type { get; set; }

        public ICollection<Answer> Answers { get; set; } = new List<Answer>();
    }

    public class Answer : BaseEntity
    {
        public Guid QuestionId { get; set; }
        public string ContentText { get; set; } = string.Empty;
        public bool IsCorrect { get; set; }
    }

    // Quiz Linking
    public class QuizQuestion : BaseEntity
    {
        public Guid QuizId { get; set; }
        public Guid QuestionId { get; set; }
        public int Points { get; set; }
        
        public LMS.Domain.Entities.Content.Quiz? Quiz { get; set; }
        public Question? Question { get; set; }
    }

    // Student Progress & Submissions
    public class LessonProgress : BaseEntity
    {
        public Guid UserId { get; set; }
        public Guid LessonId { get; set; }
        public bool IsCompleted { get; set; }
        public DateTime LastAccess { get; set; } = DateTime.UtcNow;
        public int VideoProgressSeconds { get; set; }

        public AppUser? User { get; set; }
        public LMS.Domain.Entities.Content.Lesson? Lesson { get; set; }
    }

    public class QuizSubmission : BaseEntity
    {
        public Guid QuizId { get; set; }
        public Guid StudentId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public double Score { get; set; }
        public string Status { get; set; } = "InProgress"; // InProgress, Submitted, Graded
        public string? TempData { get; set; } // JSON

        public AppUser? Student { get; set; }
        public LMS.Domain.Entities.Content.Quiz? Quiz { get; set; }
    }
}
