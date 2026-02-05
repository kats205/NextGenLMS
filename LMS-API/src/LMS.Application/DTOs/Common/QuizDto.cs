using LMS.Domain.Entities.Assessment;

namespace LMS.Application.Common
{
    public class QuizDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public DateTime? OpenTime { get; set; }
        public DateTime? CloseTime { get; set; }
        public int DurationMinutes { get; set; }
        public bool ShuffleQuestions { get; set; }
        public bool ShuffleAnswers { get; set; }
        public List<QuizQuestionDto> Questions { get; set; } = new();
    }

    public class QuizQuestionDto
    {
        public Guid Id { get; set; }
        public Guid QuestionId { get; set; }
        public int Points { get; set; }
        public int OrderIndex { get; set; }
        public QuestionType Type { get; set; }
        public string ContentText { get; set; } = string.Empty;
        public string? MediaUrl { get; set; }
        public List<AnswerDto> Answers { get; set; } = new();
    }

    public class AnswerDto
    {
        public Guid Id { get; set; }
        public string ContentText { get; set; } = string.Empty;
        public bool IsCorrect { get; set; } // Only for backend use, not sent to frontend
    }

    public class QuizSubmissionDto
    {
        public Guid Id { get; set; }
        public Guid QuizId { get; set; }
        public Guid StudentId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public double Score { get; set; }
        public string Status { get; set; } = string.Empty;
        public int RemainingTimeMinutes { get; set; }
        public List<QuestionSnapshotDto> Questions { get; set; } = new();
    }

    public class QuizCompletionStatusDto
    {
        public Guid QuizId { get; set; }
        public bool IsCompleted { get; set; }
        public bool HasInProgress { get; set; }
        public double? Score { get; set; }
        public DateTime? CompletedAt { get; set; }
        public bool CanRetake { get; set; }
    }

    public class QuestionSnapshotDto
    {
        public Guid Id { get; set; }
        public Guid QuestionId { get; set; }
        public int OrderIndex { get; set; }
        public QuestionType Type { get; set; }
        public string QuestionText { get; set; } = string.Empty;
        public string? MediaUrl { get; set; }
        public List<SnapshotAnswerDto> Answers { get; set; } = new();
        public string? StudentAnswer { get; set; } // For multiple choice: selected answer IDs, for essay: text
        public double PointsAchieved { get; set; }
        public bool IsCorrect { get; set; }
    }

    public class SnapshotAnswerDto
    {
        public Guid Id { get; set; }
        public string ContentText { get; set; } = string.Empty;
        public int DisplayOrder { get; set; }
    }

    public class StartQuizRequest
    {
        public Guid QuizId { get; set; }
    }

    public class SubmitAnswerRequest
    {
        public Guid QuizSubmissionId { get; set; }
        public Guid QuestionId { get; set; }
        public string Answer { get; set; } = string.Empty; // JSON for multiple choice, plain text for essay
    }

    public class SubmitQuizRequest
    {
        public Guid QuizSubmissionId { get; set; }
    }

    public class EssaySubmissionDto
    {
        public Guid Id { get; set; }
        public Guid QuizSubmissionId { get; set; }
        public Guid QuestionId { get; set; }
        public string? SubmissionText { get; set; }
        public string? FileUrl { get; set; }
        public double? Score { get; set; }
        public string? Feedback { get; set; }
        public DateTime? GradedAt { get; set; }
    }
}