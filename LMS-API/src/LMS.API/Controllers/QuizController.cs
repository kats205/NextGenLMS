using LMS.Application.Common;
using LMS.Application.Interfaces;
using LMS.Domain.Entities.Content;
using LMS.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using static LMS.Application.Common.ServiceResult;

namespace LMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [AllowAnonymous]
    public class QuizController : ControllerBase
    {
        private readonly IQuizService _quizService;
        private readonly ILogger<QuizController> _logger;
        private readonly AppDbContext _context;

        public QuizController(IQuizService quizService, ILogger<QuizController> logger, AppDbContext context)
        {
            _quizService = quizService;
            _logger = logger;
            _context = context;
        }

        private string GetUserId()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                // For testing purposes, return a hardcoded user ID
                return "11111111-1111-1111-1111-111111111111";
            }
            return userId;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<List<QuizDto>>>> GetAllQuizzes()
        {
            try
            {
                var quizzes = await _context.CourseContents
                    .OfType<Quiz>()
                    .Select(q => new QuizDto
                    {
                        Id = q.Id,
                        Title = q.Title,
                        OpenTime = q.OpenTime,
                        CloseTime = q.CloseTime,
                        DurationMinutes = q.DurationMinutes,
                        ShuffleQuestions = q.ShuffleQuestions,
                        ShuffleAnswers = q.ShuffleAnswers
                    })
                    .ToListAsync();

                return Ok(new ApiResponse<List<QuizDto>>
                {
                    Success = true,
                    Data = quizzes,
                    Message = $"Found {quizzes.Count} quizzes"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all quizzes");
                return StatusCode(500, new ApiResponse<List<QuizDto>>
                {
                    Success = false,
                    Message = $"Server error: {ex.Message}"
                });
            }
        }

        [HttpGet("{quizId}")]
        [AllowAnonymous]
        public async Task<ActionResult<ApiResponse<QuizDto>>> GetQuiz(Guid quizId)
        {
            var result = await _quizService.GetQuizAsync(quizId, GetUserId());
            
            if (!result.IsSuccess)
            {
                return BadRequest(new ApiResponse<QuizDto>
                {
                    Success = false,
                    Message = result.Message
                });
            }

            // Remove correct answers from response for security
            var quiz = result.Data;
            foreach (var question in quiz.Questions)
            {
                foreach (var answer in question.Answers)
                {
                    answer.IsCorrect = false; // Hide correct answers from students
                }
            }

            return Ok(new ApiResponse<QuizDto>
            {
                Success = true,
                Data = quiz
            });
        }

        [HttpPost("{quizId}/start")]
        [AllowAnonymous]
        public async Task<ActionResult<ApiResponse<QuizSubmissionDto>>> StartQuiz(Guid quizId)
        {
            var result = await _quizService.StartQuizAsync(quizId, GetUserId());
            
            if (!result.IsSuccess)
            {
                return BadRequest(new ApiResponse<QuizSubmissionDto>
                {
                    Success = false,
                    Message = result.Message
                });
            }

            return Ok(new ApiResponse<QuizSubmissionDto>
            {
                Success = true,
                Data = result.Data
            });
        }

        [HttpGet("submissions/{submissionId}")]
        [AllowAnonymous]
        public async Task<ActionResult<ApiResponse<QuizSubmissionDto>>> GetQuizSubmission(Guid submissionId)
        {
            var result = await _quizService.GetQuizSubmissionAsync(submissionId, GetUserId());
            
            if (!result.IsSuccess)
            {
                return BadRequest(new ApiResponse<QuizSubmissionDto>
                {
                    Success = false,
                    Message = result.Message
                });
            }

            return Ok(new ApiResponse<QuizSubmissionDto>
            {
                Success = true,
                Data = result.Data
            });
        }

        [HttpPost("submissions/{submissionId}/answers")]
        [AllowAnonymous]
        public async Task<ActionResult<ApiResponse<bool>>> SubmitAnswer(
            Guid submissionId, 
            [FromBody] SubmitAnswerRequest request)
        {
            if (submissionId != request.QuizSubmissionId)
            {
                return BadRequest(new ApiResponse<bool>
                {
                    Success = false,
                    Message = "ID bài làm không khớp"
                });
            }

            var result = await _quizService.SubmitAnswerAsync(
                request.QuizSubmissionId, 
                request.QuestionId, 
                request.Answer, 
                GetUserId());
            
            if (!result.IsSuccess)
            {
                return BadRequest(new ApiResponse<bool>
                {
                    Success = false,
                    Message = result.Message
                });
            }

            return Ok(new ApiResponse<bool>
            {
                Success = true,
                Data = result.Data
            });
        }

        [HttpPost("submissions/{submissionId}/essays")]
        [AllowAnonymous]
        public async Task<ActionResult<ApiResponse<bool>>> SubmitEssay(
            Guid submissionId,
            [FromBody] SubmitEssayRequest request)
        {
            var result = await _quizService.SubmitEssayAsync(
                submissionId,
                request.QuestionId,
                request.Text,
                request.FileUrl,
                GetUserId());
            
            if (!result.IsSuccess)
            {
                return BadRequest(new ApiResponse<bool>
                {
                    Success = false,
                    Message = result.Message
                });
            }

            return Ok(new ApiResponse<bool>
            {
                Success = true,
                Data = result.Data
            });
        }

        [HttpPost("submissions/{submissionId}/submit")]
        [AllowAnonymous]
        public async Task<ActionResult<ApiResponse<QuizSubmissionDto>>> SubmitQuiz(Guid submissionId)
        {
            var result = await _quizService.SubmitQuizAsync(submissionId, GetUserId());
            
            if (!result.IsSuccess)
            {
                return BadRequest(new ApiResponse<QuizSubmissionDto>
                {
                    Success = false,
                    Message = result.Message
                });
            }

            return Ok(new ApiResponse<QuizSubmissionDto>
            {
                Success = true,
                Data = result.Data
            });
        }

        [HttpGet("submissions/{submissionId}/essays")]
        [AllowAnonymous]
        public async Task<ActionResult<ApiResponse<List<EssaySubmissionDto>>>> GetEssaySubmissions(Guid submissionId)
        {
            var result = await _quizService.GetEssaySubmissionsAsync(submissionId, GetUserId());
            
            if (!result.IsSuccess)
            {
                return BadRequest(new ApiResponse<List<EssaySubmissionDto>>
                {
                    Success = false,
                    Message = result.Message
                });
            }

            return Ok(new ApiResponse<List<EssaySubmissionDto>>
            {
                Success = true,
                Data = result.Data
            });
        }

        [HttpPost("submissions/{submissionId}/autosave")]
        [AllowAnonymous]
        public async Task<ActionResult<ApiResponse<bool>>> AutoSave(Guid submissionId)
        {
            var result = await _quizService.AutoSaveProgressAsync(submissionId, GetUserId());
            
            if (!result.IsSuccess)
            {
                return BadRequest(new ApiResponse<bool>
                {
                    Success = false,
                    Message = result.Message
                });
            }

            return Ok(new ApiResponse<bool>
            {
                Success = true,
                Data = result.Data
            });
        }

        [HttpGet("{quizId}/completion-status")]
        [AllowAnonymous]
        public async Task<ActionResult<ApiResponse<QuizCompletionStatusDto>>> GetQuizCompletionStatus(Guid quizId)
        {
            var result = await _quizService.GetQuizCompletionStatusAsync(quizId, GetUserId());
            
            if (!result.IsSuccess)
            {
                return BadRequest(new ApiResponse<QuizCompletionStatusDto>
                {
                    Success = false,
                    Message = result.Message
                });
            }

            return Ok(new ApiResponse<QuizCompletionStatusDto>
            {
                Success = true,
                Data = result.Data
            });
        }

        [HttpPost("create-test-quiz")]
        public async Task<ActionResult<ApiResponse<QuizDto>>> CreateTestQuiz()
        {
            try
            {
                // Create a test quiz
                var quiz = new Quiz
                {
                    Id = Guid.NewGuid(),
                    ChapterId = Guid.NewGuid(), // Dummy chapter ID
                    Title = "Test Quiz",
                    Type = ContentType.Quiz,
                    OrderIndex = 1,
                    DurationMinutes = 30,
                    ShuffleQuestions = false,
                    ShuffleAnswers = false,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.CourseContents.Add(quiz);
                await _context.SaveChangesAsync();

                var quizDto = new QuizDto
                {
                    Id = quiz.Id,
                    Title = quiz.Title,
                    DurationMinutes = quiz.DurationMinutes,
                    ShuffleQuestions = quiz.ShuffleQuestions,
                    ShuffleAnswers = quiz.ShuffleAnswers
                };

                return Ok(new ApiResponse<QuizDto>
                {
                    Success = true,
                    Data = quizDto,
                    Message = "Test quiz created successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating test quiz");
                return StatusCode(500, new ApiResponse<QuizDto>
                {
                    Success = false,
                    Message = $"Server error: {ex.Message}"
                });
            }
        }

        [HttpPost("submissions/{submissionId}/reset")]
        public async Task<ActionResult<ApiResponse<bool>>> ResetQuiz(Guid submissionId)
        {
            try
            {
                var submission = await _context.QuizSubmissions
                    .Include(qs => qs.Snapshots)
                    .FirstOrDefaultAsync(qs => qs.Id == submissionId);

                if (submission == null)
                {
                    return NotFound(new ApiResponse<bool>
                    {
                        Success = false,
                        Message = "Bài làm không tồn tại"
                    });
                }

                // Delete related data
                _context.AttemptQuestionSnapshots.RemoveRange(submission.Snapshots);

                var essaySubmissions = await _context.EssaySubmissions
                    .Where(es => es.QuizSubmissionId == submissionId)
                    .ToListAsync();
                _context.EssaySubmissions.RemoveRange(essaySubmissions);

                _context.QuizSubmissions.Remove(submission);

                await _context.SaveChangesAsync();

                return Ok(new ApiResponse<bool>
                {
                    Success = true,
                    Data = true,
                    Message = "Quiz đã được reset thành công"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resetting quiz submission {SubmissionId}", submissionId);
                return StatusCode(500, new ApiResponse<bool>
                {
                    Success = false,
                    Message = $"Lỗi server: {ex.Message}"
                });
            }
        }

        [HttpDelete("reset-user-quiz/{quizId}")]
        public async Task<ActionResult<ApiResponse<bool>>> ResetUserQuiz(Guid quizId)
        {
            try
            {
                var userId = GetUserId();
                if (!Guid.TryParse(userId, out var userGuid))
                {
                    return BadRequest(new ApiResponse<bool>
                    {
                        Success = false,
                        Message = "ID người dùng không hợp lệ"
                    });
                }

                var submissions = await _context.QuizSubmissions
                    .Include(qs => qs.Snapshots)
                    .Where(qs => qs.QuizId == quizId && qs.StudentId == userGuid)
                    .ToListAsync();

                foreach (var submission in submissions)
                {
                    // Delete snapshots
                    _context.AttemptQuestionSnapshots.RemoveRange(submission.Snapshots);

                    // Delete essay submissions
                    var essaySubmissions = await _context.EssaySubmissions
                        .Where(es => es.QuizSubmissionId == submission.Id)
                        .ToListAsync();
                    _context.EssaySubmissions.RemoveRange(essaySubmissions);
                }

                _context.QuizSubmissions.RemoveRange(submissions);
                await _context.SaveChangesAsync();

                return Ok(new ApiResponse<bool>
                {
                    Success = true,
                    Data = true,
                    Message = $"Đã reset {submissions.Count} bài làm cho quiz này"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resetting user quiz {QuizId}", quizId);
                return StatusCode(500, new ApiResponse<bool>
                {
                    Success = false,
                    Message = $"Lỗi server: {ex.Message}"
                });
            }
        }
    }

    public class SubmitEssayRequest
    {
        public Guid QuestionId { get; set; }
        public string? Text { get; set; }
        public string? FileUrl { get; set; }
    }
}
        
        