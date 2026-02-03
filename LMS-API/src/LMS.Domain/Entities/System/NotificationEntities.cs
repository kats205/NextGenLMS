using LMS.Domain.Common;

namespace LMS.Domain.Entities.System
{
    public class EmailTemplate : BaseEntity
    {
        public string TemplateCode { get; set; } = string.Empty; // WELCOME, RESET_PASS, QUIZ_REMINDER
        public string SubjectTemplate { get; set; } = string.Empty;
        public string BodyTemplateHtml { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class EmailQueue : BaseEntity
    {
        public string RecipientEmail { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string BodyHtml { get; set; } = string.Empty;
        public string Status { get; set; } = "Pending"; // Pending, Sent, Failed
        public int RetryCount { get; set; }
        public DateTime ScheduledAt { get; set; } = DateTime.UtcNow;
        public DateTime? SentAt { get; set; }
        public string? ErrorMessage { get; set; }
    }

    public class EmailLog : BaseEntity
    {
        public Guid EmailQueueId { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? Details { get; set; }
        public DateTime LoggedAt { get; set; } = DateTime.UtcNow;
    }
}
