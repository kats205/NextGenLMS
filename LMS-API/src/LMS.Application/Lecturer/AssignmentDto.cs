using System.ComponentModel.DataAnnotations;

namespace LMS.Application.Lecturer
{
    public class AssignmentDto : CourseContentDto
    {
        public DateTime? DueDate { get; set; }
        public int MaxScore { get; set; }
        public string? Description { get; set; }
        public string? Instructions { get; set; }
        public string? AttachmentsJson { get; set; }
        public bool AllowLateSubmission { get; set; } = true;
        public int LatePenaltyPercent { get; set; } = 0;
        public int MaxAttempts { get; set; } = 1;
        public bool RequireTextSubmission { get; set; } = false;
        public bool AllowFileSubmission { get; set; } = true;
        public bool AllowLinkSubmission { get; set; } = true;
        public string? AllowedFileTypes { get; set; }
        public long MaxFileSize { get; set; } = 10485760; // 10MB default
        
        // Statistics
        public int TotalSubmissions { get; set; }
        public int CompletedSubmissions { get; set; }
        public double AverageScore { get; set; }
        public int PassedCount { get; set; }
        public int FailedCount { get; set; }
    }

    public class CreateAssignmentDto
    {
        [Required]
        public Guid ChapterId { get; set; }
        
        [Required]
        public string Title { get; set; } = string.Empty;
        
        public int OrderIndex { get; set; }
        public DateTime? DueDate { get; set; }
        public int MaxScore { get; set; } = 10;
        public string? Description { get; set; }
        public string? Instructions { get; set; }
        public string? AttachmentsJson { get; set; }
        public bool AllowLateSubmission { get; set; } = true;
        public int LatePenaltyPercent { get; set; } = 0;
        public int MaxAttempts { get; set; } = 1;
        public bool RequireTextSubmission { get; set; } = false;
        public bool AllowFileSubmission { get; set; } = true;
        public bool AllowLinkSubmission { get; set; } = true;
        public string? AllowedFileTypes { get; set; }
        public long MaxFileSize { get; set; } = 10485760; // 10MB default
    }

    public class UpdateAssignmentDto
    {
        public string? Title { get; set; }
        public int? OrderIndex { get; set; }
        public DateTime? DueDate { get; set; }
        public int? MaxScore { get; set; }
        public string? Description { get; set; }
        public string? Instructions { get; set; }
        public string? AttachmentsJson { get; set; }
        public bool? AllowLateSubmission { get; set; }
        public int? LatePenaltyPercent { get; set; }
        public int? MaxAttempts { get; set; }
        public bool? RequireTextSubmission { get; set; }
        public bool? AllowFileSubmission { get; set; }
        public bool? AllowLinkSubmission { get; set; }
        public string? AllowedFileTypes { get; set; }
        public long? MaxFileSize { get; set; }
    }
}