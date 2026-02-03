using System.ComponentModel.DataAnnotations;

namespace LMS.Application.Common
{
    public class CreateCourseDto
    {
        [Required(ErrorMessage = "Mã khóa học là bắt buộc")]
        [StringLength(20, ErrorMessage = "Mã khóa học không được vượt quá 20 ký tự")]
        public string CourseCode { get; set; } = string.Empty;

        [Required(ErrorMessage = "Tên khóa học là bắt buộc")]
        [StringLength(200, ErrorMessage = "Tên khóa học không được vượt quá 200 ký tự")]
        public string Name { get; set; } = string.Empty;

        [StringLength(1000, ErrorMessage = "Mô tả không được vượt quá 1000 ký tự")]
        public string? Description { get; set; }

        public string? ThumbnailUrl { get; set; }

        [Required(ErrorMessage = "Học kỳ là bắt buộc")]
        public Guid SemesterId { get; set; }

        [Required(ErrorMessage = "Năm học là bắt buộc")]
        public Guid AcademicYearId { get; set; }

        [Required(ErrorMessage = "Chuyên ngành là bắt buộc")]
        public Guid MajorId { get; set; }

        public List<Guid>? LecturerIds { get; set; } = new();
    }

    public class UpdateCourseDto
    {
        [Required(ErrorMessage = "Mã khóa học là bắt buộc")]
        [StringLength(20, ErrorMessage = "Mã khóa học không được vượt quá 20 ký tự")]
        public string CourseCode { get; set; } = string.Empty;

        [Required(ErrorMessage = "Tên khóa học là bắt buộc")]
        [StringLength(200, ErrorMessage = "Tên khóa học không được vượt quá 200 ký tự")]
        public string Name { get; set; } = string.Empty;

        [StringLength(1000, ErrorMessage = "Mô tả không được vượt quá 1000 ký tự")]
        public string? Description { get; set; }

        public string? ThumbnailUrl { get; set; }

        [Required(ErrorMessage = "Học kỳ là bắt buộc")]
        public Guid SemesterId { get; set; }

        [Required(ErrorMessage = "Năm học là bắt buộc")]
        public Guid AcademicYearId { get; set; }

        [Required(ErrorMessage = "Chuyên ngành là bắt buộc")]
        public Guid MajorId { get; set; }

        public List<Guid>? LecturerIds { get; set; } = new();
    }

    public class CourseDto
    {
        public Guid Id { get; set; }
        public string CourseCode { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? ThumbnailUrl { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Related entities
        public Guid SemesterId { get; set; }
        public string? SemesterName { get; set; }

        public Guid AcademicYearId { get; set; }
        public string? AcademicYearName { get; set; }

        public Guid MajorId { get; set; }
        public string? MajorName { get; set; }

        public List<LecturerInCourseDto> Lecturers { get; set; } = new();
        public int StudentCount { get; set; }
        public int ChapterCount { get; set; }
    }

    public class CourseDetailDto : CourseDto
    {
        public List<StudentInCourseDto> Students { get; set; } = new();
        public List<ChapterDetailDto> Chapters { get; set; } = new();
    }

    public class LecturerInCourseDto
    {
        public Guid LecturerId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public bool IsPrimary { get; set; }
    }

    public class StudentInCourseDto
    {
        public Guid StudentId { get; set; }
        public string StudentCode { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public DateTime EnrolledDate { get; set; }
        public string Source { get; set; } = string.Empty;
    }

    public class ChapterDetailDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public int OrderIndex { get; set; }
        public List<CourseContentDto> Contents { get; set; } = new();
    }

    public class CourseContentDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty; // Lesson, Quiz, Assignment, Announcement
        public int OrderIndex { get; set; }
        public DateTime CreatedAt { get; set; }

        // Lesson specific
        public string? FileUrl { get; set; }
        public string? FileType { get; set; }
        public long FileSize { get; set; }
        public int DurationSeconds { get; set; }
        public string? ContentHtml { get; set; }

        // Quiz specific
        public DateTime? OpenTime { get; set; }
        public DateTime? CloseTime { get; set; }
        public int DurationMinutes { get; set; }
        public bool ShuffleQuestions { get; set; }
        public bool ShuffleAnswers { get; set; }

        // Assignment specific
        public DateTime? DueDate { get; set; }
        public int MaxScore { get; set; }
        public string? Description { get; set; }

        // Announcement specific
        public string? AttachmentsJson { get; set; }
    }

    public class ChapterDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public int OrderIndex { get; set; }
        public int ContentCount { get; set; }
    }

    public class EnrollStudentDto
    {
        [Required(ErrorMessage = "Danh sách sinh viên là bắt buộc")]
        public List<Guid> StudentIds { get; set; } = new();
    }
}