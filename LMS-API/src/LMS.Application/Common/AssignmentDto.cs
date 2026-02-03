using System.ComponentModel.DataAnnotations;

namespace LMS.Application.Common
{
    public class AssignmentDetailDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Instructions { get; set; }
        public DateTime? DueDate { get; set; }
        public int MaxScore { get; set; }
        public bool AllowLateSubmission { get; set; }
        public int LatePenaltyPercent { get; set; }
        public int MaxAttempts { get; set; }
        public bool RequireTextSubmission { get; set; }
        public bool AllowFileSubmission { get; set; }
        public bool AllowLinkSubmission { get; set; }
        public List<string> AllowedFileTypes { get; set; } = new();
        public long MaxFileSize { get; set; }
        public List<AttachmentDto> Attachments { get; set; } = new();
        public DateTime CreatedAt { get; set; }

        // Student-specific data
        public AssignmentSubmissionDto? MySubmission { get; set; }
        public bool CanSubmit { get; set; }
        public bool IsOverdue { get; set; }
        public TimeSpan? TimeRemaining { get; set; }
    }

    public class AssignmentSubmissionDto
    {
        public Guid Id { get; set; }
        public Guid AssignmentId { get; set; }
        public Guid StudentId { get; set; }
        public string? StudentName { get; set; }
        public string? StudentCode { get; set; }
        public string? TextContent { get; set; }
        public List<AttachmentDto> Attachments { get; set; } = new();
        public List<LinkDto> Links { get; set; } = new();
        public string Type { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime? SubmittedAt { get; set; }
        public DateTime? GradedAt { get; set; }
        public int? Score { get; set; }
        public string? Feedback { get; set; }
        public string? GraderName { get; set; }
        public bool IsLate { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public List<SubmissionCommentDto> Comments { get; set; } = new();
        public int AttemptNumber { get; set; }
    }

    public class CreateSubmissionDto
    {
        public Guid AssignmentId { get; set; }
        
        [StringLength(10000, ErrorMessage = "Nội dung văn bản không được vượt quá 10000 ký tự")]
        public string? TextContent { get; set; }
        
        public List<Microsoft.AspNetCore.Http.IFormFile>? Files { get; set; }
        public List<string>? Links { get; set; }
        public bool SaveAsDraft { get; set; } = true;
    }

    public class UpdateSubmissionDto
    {
        [StringLength(10000, ErrorMessage = "Nội dung văn bản không được vượt quá 10000 ký tự")]
        public string? TextContent { get; set; }
        
        public List<Microsoft.AspNetCore.Http.IFormFile>? Files { get; set; }
        public List<string>? Links { get; set; }
        public List<Guid>? RemoveAttachmentIds { get; set; }
        public bool SaveAsDraft { get; set; } = true;
    }

    public class SubmitAssignmentDto
    {
        [Required(ErrorMessage = "ID bài nộp là bắt buộc")]
        public Guid SubmissionId { get; set; }
    }

    public class GradeSubmissionDto
    {
        [Required(ErrorMessage = "ID bài nộp là bắt buộc")]
        public Guid SubmissionId { get; set; }
        
        [Range(0, int.MaxValue, ErrorMessage = "Điểm phải lớn hơn hoặc bằng 0")]
        public int Score { get; set; }
        
        [StringLength(2000, ErrorMessage = "Phản hồi không được vượt quá 2000 ký tự")]
        public string? Feedback { get; set; }
    }

    public class SubmissionCommentDto
    {
        public Guid Id { get; set; }
        public Guid SubmissionId { get; set; }
        public Guid AuthorId { get; set; }
        public string AuthorName { get; set; } = string.Empty;
        public string AuthorRole { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public List<AttachmentDto> Attachments { get; set; } = new();
        public bool IsPrivate { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool CanEdit { get; set; }
        public bool CanDelete { get; set; }
    }

    public class CreateCommentDto
    {
        [Required(ErrorMessage = "ID bài nộp là bắt buộc")]
        public Guid SubmissionId { get; set; }
        
        [Required(ErrorMessage = "Nội dung bình luận là bắt buộc")]
        [StringLength(1000, ErrorMessage = "Nội dung bình luận không được vượt quá 1000 ký tự")]
        public string Content { get; set; } = string.Empty;
        
        public List<Microsoft.AspNetCore.Http.IFormFile>? Files { get; set; }
        public bool IsPrivate { get; set; } = false;
    }

    public class UpdateCommentDto
    {
        [Required(ErrorMessage = "Nội dung bình luận là bắt buộc")]
        [StringLength(1000, ErrorMessage = "Nội dung bình luận không được vượt quá 1000 ký tự")]
        public string Content { get; set; } = string.Empty;
        
        public List<Microsoft.AspNetCore.Http.IFormFile>? Files { get; set; }
        public List<Guid>? RemoveAttachmentIds { get; set; }
        public bool IsPrivate { get; set; } = false;
    }

    public class AttachmentDto
    {
        public Guid Id { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string FileUrl { get; set; } = string.Empty;
        public string FileType { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class LinkDto
    {
        public string Url { get; set; } = string.Empty;
        public string? Title { get; set; }
        public string? Description { get; set; }
    }

    public class SubmissionHistoryDto
    {
        public Guid Id { get; set; }
        public string Action { get; set; } = string.Empty;
        public string? Details { get; set; }
        public string UserName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class AssignmentSubmissionListDto
    {
        public Guid Id { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public string StudentCode { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime? SubmittedAt { get; set; }
        public int? Score { get; set; }
        public bool IsLate { get; set; }
        public int AttemptNumber { get; set; }
        public bool HasComments { get; set; }
    }

    // Enums for JSON storage
    public enum SubmissionType
    {
        Text,
        File,
        Link,
        Mixed
    }

    public enum SubmissionStatus
    {
        Draft,
        Submitted,
        Graded
    }
}