using System.ComponentModel.DataAnnotations;

namespace LMS.Application.Common
{
    public class LessonProgressDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public Guid LessonId { get; set; }
        public bool IsCompleted { get; set; }
        public DateTime LastAccess { get; set; }
        public int VideoProgressSeconds { get; set; }
        public int DurationLastAccessSeconds { get; set; } // Thời điểm cuối cùng trong video khi reload
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class UpdateLessonProgressDto
    {
        [Range(0, int.MaxValue, ErrorMessage = "Thời gian xem phải >= 0")]
        public int VideoProgressSeconds { get; set; }

        [Range(0, int.MaxValue, ErrorMessage = "Thời điểm video phải >= 0")]
        public int DurationLastAccessSeconds { get; set; } // Vị trí hiện tại trong video

        public bool? IsCompleted { get; set; }
    }
}
