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
        TrueFalse = 3,
        FillInTheBlank = 4
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
        public int VideoProgressSeconds { get; set; } // Tổng thời gian đã xem (để tính 70%)
        public int DurationLastAccesstSeconds { get; set; } // Vị trí hiện tại trong video (để restore position) - match với DB
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
        
        public DateTime? AutoSavedAt { get; set; }
        public ICollection<AttemptQuestionSnapshot> Snapshots { get; set; } = new List<AttemptQuestionSnapshot>();
    }

    public class AttemptQuestionSnapshot : BaseEntity
    {
        public Guid QuizSubmissionId { get; set; }
        public Guid QuestionId { get; set; }
        public int OrderIndex { get; set; } // The order presented to student
        public string QuestionTextSnapshot { get; set; } = string.Empty; // Store copy of question text
        public string AnswersSnapshotJson { get; set; } = string.Empty; // Store shuffled answers order
        public string? StudentAnswerJson { get; set; } // What student selected/typed
        public double PointsAchieved { get; set; }
        public bool IsCorrect { get; set; }

        public QuizSubmission? QuizSubmission { get; set; }
        public Question? Question { get; set; }
    }

    public class EssaySubmission : BaseEntity
    {
        public Guid QuizSubmissionId { get; set; }
        public Guid QuestionId { get; set; }
        public string? SubmissionText { get; set; }
        public string? FileUrl { get; set; } // If file upload
        
        public double? Score { get; set; }
        public string? Feedback { get; set; }
        public DateTime? GradedAt { get; set; }
        public Guid? GradedBy { get; set; }

        public QuizSubmission? QuizSubmission { get; set; }
        public Question? Question { get; set; }
    }
}
