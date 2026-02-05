using LMS.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LMS.API.Controllers
{
    /// <summary>
    /// Controller cho chức năng xuất điểm bài kiểm tra và bài tập
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Lecturer")]
    public class ExportController : ControllerBase
    {
        private readonly IScoreExportService _scoreExportService;
        private readonly ILogger<ExportController> _logger;

        public ExportController(
            IScoreExportService scoreExportService,
            ILogger<ExportController> logger)
        {
            _scoreExportService = scoreExportService;
            _logger = logger;
        }

        /// <summary>
        /// Xuất điểm bài kiểm tra trắc nghiệm (Quiz) dưới dạng HTML
        /// </summary>
        /// <param name="quizId">ID của bài kiểm tra</param>
        /// <returns>HTML page để in/xuất PDF</returns>
        [HttpGet("quiz/{quizId}")]
        public async Task<IActionResult> ExportQuizScores(Guid quizId)
        {
            try
            {
                var result = await _scoreExportService.ExportQuizScoresAsync(quizId);
                return File(result.FileContent, "application/pdf", result.FileName);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Quiz not found: {QuizId}", quizId);
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting quiz scores for {QuizId}", quizId);
                return StatusCode(500, new { message = "Có lỗi xảy ra khi xuất điểm" });
            }
        }

        /// <summary>
        /// Xuất điểm bài tập nộp file (Assignment) - PDF
        /// </summary>
        /// <param name="assignmentId">ID của bài tập</param>
        /// <returns>File PDF</returns>
        [HttpGet("assignment/{assignmentId}")]
        public async Task<IActionResult> ExportAssignmentScores(Guid assignmentId)
        {
            try
            {
                var result = await _scoreExportService.ExportAssignmentScoresAsync(assignmentId);
                return File(result.FileContent, "application/pdf", result.FileName);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Assignment not found: {AssignmentId}", assignmentId);
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting assignment scores for {AssignmentId}", assignmentId);
                return StatusCode(500, new { message = "Có lỗi xảy ra khi xuất điểm" });
            }
        }

        /// <summary>
        /// Lấy dữ liệu điểm Quiz dạng JSON
        /// </summary>
        [HttpGet("quiz/{quizId}/data")]
        public async Task<IActionResult> GetQuizScoreData(Guid quizId)
        {
            try
            {
                var data = await _scoreExportService.GetQuizScoreDataAsync(quizId);
                return Ok(data);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting quiz score data for {QuizId}", quizId);
                return StatusCode(500, new { message = "Có lỗi xảy ra" });
            }
        }

        /// <summary>
        /// Lấy dữ liệu điểm Assignment dạng JSON
        /// </summary>
        [HttpGet("assignment/{assignmentId}/data")]
        public async Task<IActionResult> GetAssignmentScoreData(Guid assignmentId)
        {
            try
            {
                var data = await _scoreExportService.GetAssignmentScoreDataAsync(assignmentId);
                return Ok(data);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting assignment score data for {AssignmentId}", assignmentId);
                return StatusCode(500, new { message = "Có lỗi xảy ra" });
            }
        }
    }
}
