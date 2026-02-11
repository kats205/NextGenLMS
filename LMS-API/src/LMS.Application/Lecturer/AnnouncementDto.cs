using System.ComponentModel.DataAnnotations;

namespace LMS.Application.Lecturer
{
    public class AnnouncementDto : CourseContentDto
    {
        public string? ContentHtml { get; set; }
        public string? AttachmentsJson { get; set; }
        
        // Statistics
        public int ViewCount { get; set; }
    }

    public class CreateAnnouncementDto
    {
        [Required]
        public Guid ChapterId { get; set; }
        
        [Required]
        public string Title { get; set; } = string.Empty;
        
        public int OrderIndex { get; set; }
        public string? ContentHtml { get; set; }
        public string? AttachmentsJson { get; set; }
    }

    public class UpdateAnnouncementDto
    {
        public string? Title { get; set; }
        public int? OrderIndex { get; set; }
        public string? ContentHtml { get; set; }
        public string? AttachmentsJson { get; set; }
    }
}