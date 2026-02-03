using LMS.Domain.Common;

namespace LMS.Domain.Entities.System
{
    public class AuditLog : BaseEntity
    {
        public Guid UserId { get; set; } // Who performed action
        public string Action { get; set; } = string.Empty; // Create, Update, Delete
        public string ResourceType { get; set; } = string.Empty; // User, Course, Assessment
        public string ResourceId { get; set; } = string.Empty;
        public string? OldValue { get; set; } // JSON
        public string? NewValue { get; set; } // JSON
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }

    public class ActivityLog : BaseEntity
    {
        public Guid UserId { get; set; }
        public string ActivityType { get; set; } = string.Empty; // Login, ViewLecture, SubmitQuiz
        public string? Details { get; set; }
        public string? IpAddress { get; set; }
        public string? UserAgent { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}
