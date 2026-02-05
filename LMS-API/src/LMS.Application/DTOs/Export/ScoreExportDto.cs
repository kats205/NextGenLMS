namespace LMS.Application.DTOs.Export
{
    /// <summary>
    /// DTO chứa thông tin xuất điểm của một sinh viên
    /// </summary>
    public class StudentScoreDto
    {
        public int RowNumber { get; set; }
        public string StudentCode { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string ClassName { get; set; } = string.Empty;
        public double Score { get; set; }
    }

    /// <summary>
    /// DTO chứa thông tin tổng quan của bài kiểm tra/bài tập
    /// </summary>
    public class ScoreExportHeaderDto
    {
        public string SystemName { get; set; } = "HỆ THỐNG HỌC TRỰC TUYẾN NEXTGENLMS";
        public string ReportTitle { get; set; } = string.Empty; // VD: KẾT QUẢ [KIỂM TRA] NĂM HỌC [2025-2026]
        public string ContentTitle { get; set; } = string.Empty; // VD: Quiz 1
        public string Semester { get; set; } = string.Empty; // VD: [HKI] [2025-2026]
        public string CourseName { get; set; } = string.Empty; // VD: SQL SERVER
        public string CourseCode { get; set; } = string.Empty; // VD: NET101_FALL24
        public DateTime GradingDate { get; set; } = DateTime.UtcNow;
        public int CurrentPage { get; set; } = 1;
        public int TotalStudents { get; set; }
        public double CompletionRate { get; set; } // Tỷ lệ hoàn thành (%)
    }

    /// <summary>
    /// DTO tổng hợp cho việc xuất điểm
    /// </summary>
    public class ScoreExportDto
    {
        public ScoreExportHeaderDto Header { get; set; } = new();
        public List<StudentScoreDto> Students { get; set; } = new();
    }

    /// <summary>
    /// Request DTO để lọc/xuất điểm
    /// </summary>
    public class ScoreExportRequestDto
    {
        public Guid ContentId { get; set; } // Quiz ID hoặc Assignment ID
        public string ContentType { get; set; } = string.Empty; // "Quiz" hoặc "Assignment"
    }
}
