using LMS.Application.DTOs.Export;

namespace LMS.Application.Interfaces
{
    /// <summary>
    /// Service interface cho việc xuất điểm bài kiểm tra và bài tập
    /// </summary>
    public interface IScoreExportService
    {
        /// <summary>
        /// Xuất điểm bài kiểm tra trắc nghiệm (Quiz) - PDF
        /// </summary>
        /// <param name="quizId">ID của bài kiểm tra</param>
        /// <returns>Tuple (File Content, File Name)</returns>
        Task<(byte[] FileContent, string FileName)> ExportQuizScoresAsync(Guid quizId);

        /// <summary>
        /// Xuất điểm bài tập nộp file (Assignment) - PDF
        /// </summary>
        /// <param name="assignmentId">ID của bài tập</param>
        /// <returns>Tuple (File Content, File Name)</returns>
        Task<(byte[] FileContent, string FileName)> ExportAssignmentScoresAsync(Guid assignmentId);

        /// <summary>
        /// Lấy dữ liệu điểm Quiz để xử lý
        /// </summary>
        Task<ScoreExportDto> GetQuizScoreDataAsync(Guid quizId);

        /// <summary>
        /// Lấy dữ liệu điểm Assignment để xử lý
        /// </summary>
        Task<ScoreExportDto> GetAssignmentScoreDataAsync(Guid assignmentId);
    }
}
