using System.Text.Json;
using LMS.Application.Common;
using LMS.Application.DTOs.Common;
using LMS.Application.Interfaces;
using LMS.Domain.Entities.Assessment;
using LMS.Domain.Entities.Content;
using LMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace LMS.Infrastructure.Services
{
    public class AnswerSnapshot
    {
        public Guid Id { get; set; }
        public string ContentText { get; set; } = string.Empty;
        public int DisplayOrder { get; set; }
        public bool IsCorrect { get; set; }
    }

}
namespace LMS.Infrastructure.Services
{
    public class QuizService : IQuizService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<QuizService> _logger;

        public QuizService(AppDbContext context, ILogger<QuizService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<ServiceResult<QuizDto>> GetQuizAsync(Guid quizId, string userId)
        {
            try
            {
                var quiz = await _context.CourseContents
                    .OfType<Quiz>()
                    .Include(q => q.Questions)
                        .ThenInclude(qq => qq.Question)
                            .ThenInclude(q => q.Answers)
                    .FirstOrDefaultAsync(q => q.Id == quizId);

                if (quiz == null)
                    return ServiceResult<QuizDto>.Failure("Quiz không tồn tại");

                // Check if quiz is available
                var now = DateTime.UtcNow;
                if (quiz.OpenTime.HasValue && now < quiz.OpenTime.Value)
                    return ServiceResult<QuizDto>.Failure("Quiz chưa mở");

                if (quiz.CloseTime.HasValue && now > quiz.CloseTime.Value)
                    return ServiceResult<QuizDto>.Failure("Quiz đã đóng");

                var quizDto = new QuizDto
                {
                    Id = quiz.Id,
                    Title = quiz.Title,
                    OpenTime = quiz.OpenTime,
                    CloseTime = quiz.CloseTime,
                    DurationMinutes = quiz.DurationMinutes,
                    ShuffleQuestions = quiz.ShuffleQuestions,
                    ShuffleAnswers = quiz.ShuffleAnswers,
                    Questions = quiz.Questions.Select(qq => new QuizQuestionDto
                    {
                        Id = qq.Id,
                        QuestionId = qq.QuestionId,
                        Points = qq.Points,
                        Type = qq.Question.Type,
                        ContentText = qq.Question.ContentText,
                        MediaUrl = qq.Question.MediaUrl,
                        Answers = qq.Question.Answers.Select(a => new AnswerDto
                        {
                            Id = a.Id,
                            ContentText = a.ContentText,
                            IsCorrect = a.IsCorrect // Will be filtered out in frontend response
                        }).ToList()
                    }).ToList()
                };

                return ServiceResult<QuizDto>.Success(quizDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting quiz {QuizId}", quizId);
                return ServiceResult<QuizDto>.Failure("Có lỗi xảy ra khi tải quiz");
            }
        }

        public async Task<ServiceResult<QuizSubmissionDto>> StartQuizAsync(Guid quizId, string userId)
        {
            try
            {
                _logger.LogInformation("Starting quiz {QuizId} for user {UserId}", quizId, userId);

                if (!Guid.TryParse(userId, out var userGuid))
                {
                    _logger.LogWarning("Invalid user ID: {UserId}", userId);
                    return ServiceResult<QuizSubmissionDto>.Failure("ID người dùng không hợp lệ");
                }

                // Check if user already has a submission for this quiz
                var existingSubmission = await _context.QuizSubmissions
                    .Include(qs => qs.Snapshots)
                    .FirstOrDefaultAsync(qs => qs.QuizId == quizId && qs.StudentId == userGuid);

                if (existingSubmission != null && existingSubmission.Status != "InProgress")
                {
                    _logger.LogWarning("User {UserId} already completed quiz {QuizId} with status {Status}", 
                        userId, quizId, existingSubmission.Status);
                    return ServiceResult<QuizSubmissionDto>.Failure($"Bạn đã hoàn thành quiz này (Trạng thái: {existingSubmission.Status}). Liên hệ giảng viên nếu cần làm lại.");
                }

                if (existingSubmission != null)
                {
                    _logger.LogInformation("Returning existing submission {SubmissionId} for quiz {QuizId}", existingSubmission.Id, quizId);
                    // Return existing in-progress submission
                    return await GetQuizSubmissionAsync(existingSubmission.Id, userId);
                }

                // Get quiz with questions
                _logger.LogInformation("Looking for quiz {QuizId} in database", quizId);
                var quiz = await _context.CourseContents
                    .OfType<Quiz>()
                    .Include(q => q.Questions)
                        .ThenInclude(qq => qq.Question)
                            .ThenInclude(q => q.Answers)
                    .FirstOrDefaultAsync(q => q.Id == quizId);

                if (quiz == null)
                {
                    _logger.LogWarning("Quiz {QuizId} not found in database", quizId);
                    return ServiceResult<QuizSubmissionDto>.Failure("Quiz không tồn tại");
                }

                _logger.LogInformation("Found quiz {QuizId} with {QuestionCount} questions", quizId, quiz.Questions.Count);

                if (quiz.Questions.Count == 0)
                {
                    _logger.LogWarning("Quiz {QuizId} has no questions", quizId);
                    return ServiceResult<QuizSubmissionDto>.Failure("Quiz không có câu hỏi nào");
                }

                // Create new submission
                _logger.LogInformation("Creating new submission for quiz {QuizId}", quizId);
                var submission = new QuizSubmission
                {
                    Id = Guid.NewGuid(),
                    QuizId = quizId,
                    StudentId = userGuid,
                    StartTime = DateTime.UtcNow,
                    Status = "InProgress",
                    Score = 0
                };

                _context.QuizSubmissions.Add(submission);

                // Create snapshots for all questions
                var questions = quiz.Questions.ToList();
                
                // FILTER: Only include Multiple Choice questions
                questions = questions.Where(q => q.Question.Type == QuestionType.MultipleChoice).ToList();
                
                if (questions.Count == 0)
                {
                    _logger.LogWarning("Quiz {QuizId} has no multiple choice questions", quizId);
                    return ServiceResult<QuizSubmissionDto>.Failure("Quiz không có câu hỏi trắc nghiệm nào");
                }
                
                // Shuffle multiple choice questions if enabled
                if (quiz.ShuffleQuestions)
                {
                    questions = questions.OrderBy(x => Guid.NewGuid()).ToList();
                    _logger.LogInformation("Shuffled {QuestionCount} multiple choice questions", questions.Count);
                }

                _logger.LogInformation("Creating snapshots for {QuestionCount} multiple choice questions", questions.Count);

                for (int i = 0; i < questions.Count; i++)
                {
                    var qq = questions[i];
                    var answers = qq.Question.Answers.ToList();
                    
                    _logger.LogInformation("Processing question {QuestionIndex}: {QuestionId} (Type: {QuestionType}) with {AnswerCount} answers", 
                        i, qq.QuestionId, qq.Question.Type, answers.Count);
                    
                    // Shuffle answers for multiple choice questions
                    if (quiz.ShuffleAnswers)
                    {
                        answers = answers.OrderBy(x => Guid.NewGuid()).ToList();
                        _logger.LogInformation("Shuffled answers for question {QuestionId}", qq.QuestionId);
                    }

                    var snapshot = new AttemptQuestionSnapshot
                    {
                        Id = Guid.NewGuid(),
                        QuizSubmissionId = submission.Id,
                        QuestionId = qq.QuestionId,
                        OrderIndex = i,
                        QuestionTextSnapshot = qq.Question.ContentText,
                        AnswersSnapshotJson = JsonSerializer.Serialize(answers.Select((a, index) => new AnswerSnapshot
                        {
                            Id = a.Id,
                            ContentText = a.ContentText,
                            DisplayOrder = index,
                            IsCorrect = a.IsCorrect
                        })),
                        PointsAchieved = 0,
                        IsCorrect = false
                    };

                    _context.AttemptQuestionSnapshots.Add(snapshot);

                    // Note: No essay submissions needed since we only have multiple choice questions
                }

                _logger.LogInformation("Saving changes to database");
                await _context.SaveChangesAsync();
                _logger.LogInformation("Successfully created submission {SubmissionId}", submission.Id);

                return await GetQuizSubmissionAsync(submission.Id, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error starting quiz {QuizId} for user {UserId}", quizId, userId);
                return ServiceResult<QuizSubmissionDto>.Failure("Có lỗi xảy ra khi bắt đầu quiz");
            }
        }

        public async Task<ServiceResult<QuizSubmissionDto>> GetQuizSubmissionAsync(Guid submissionId, string userId)
        {
            try
            {
                if (!Guid.TryParse(userId, out var userGuid))
                    return ServiceResult<QuizSubmissionDto>.Failure("ID người dùng không hợp lệ");

                var submission = await _context.QuizSubmissions
                    .Include(qs => qs.Quiz)
                    .Include(qs => qs.Snapshots)
                        .ThenInclude(s => s.Question)
                    .FirstOrDefaultAsync(qs => qs.Id == submissionId && qs.StudentId == userGuid);

                if (submission == null)
                    return ServiceResult<QuizSubmissionDto>.Failure("Bài làm không tồn tại");

                // Calculate remaining time
                var remainingMinutes = 0;
                if (submission.Quiz.DurationMinutes > 0)
                {
                    var elapsed = DateTime.UtcNow - submission.StartTime;
                    remainingMinutes = Math.Max(0, submission.Quiz.DurationMinutes - (int)elapsed.TotalMinutes);
                }

                var submissionDto = new QuizSubmissionDto
                {
                    Id = submission.Id,
                    QuizId = submission.QuizId,
                    StudentId = submission.StudentId,
                    StartTime = submission.StartTime,
                    EndTime = submission.EndTime,
                    Score = submission.Score,
                    Status = submission.Status,
                    RemainingTimeMinutes = remainingMinutes,
                    Questions = submission.Snapshots.OrderBy(s => s.OrderIndex).Select(s =>
                    {
                        return new QuestionSnapshotDto
                        {
                            Id = s.Id,
                            QuestionId = s.QuestionId,
                            OrderIndex = s.OrderIndex,
                            Type = s.Question.Type,
                            QuestionText = s.QuestionTextSnapshot,
                            MediaUrl = s.Question.MediaUrl,
                            Answers = JsonSerializer.Deserialize<List<AnswerSnapshot>>(s.AnswersSnapshotJson)?
                                .Select(a => new SnapshotAnswerDto
                                {
                                    Id = a.Id,
                                    ContentText = a.ContentText,
                                    DisplayOrder = a.DisplayOrder
                                }).ToList() ?? new List<SnapshotAnswerDto>(),
                            StudentAnswer = s.StudentAnswerJson,
                            PointsAchieved = s.PointsAchieved,
                            IsCorrect = s.IsCorrect
                        };
                    }).ToList()
                };

                return ServiceResult<QuizSubmissionDto>.Success(submissionDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting quiz submission {SubmissionId}", submissionId);
                return ServiceResult<QuizSubmissionDto>.Failure("Có lỗi xảy ra khi tải bài làm");
            }
        }

        public async Task<ServiceResult<bool>> SubmitAnswerAsync(Guid submissionId, Guid questionId, string answer, string userId)
        {
            try
            {
                if (!Guid.TryParse(userId, out var userGuid))
                    return ServiceResult<bool>.Failure("ID người dùng không hợp lệ");

                var submission = await _context.QuizSubmissions
                    .FirstOrDefaultAsync(qs => qs.Id == submissionId && qs.StudentId == userGuid);

                if (submission == null)
                    return ServiceResult<bool>.Failure("Bài làm không tồn tại");

                if (submission.Status != "InProgress")
                    return ServiceResult<bool>.Failure("Bài làm đã được nộp");

                var snapshot = await _context.AttemptQuestionSnapshots
                    .Include(s => s.Question)
                    .FirstOrDefaultAsync(s => s.QuizSubmissionId == submissionId && s.QuestionId == questionId);

                if (snapshot == null)
                    return ServiceResult<bool>.Failure("Câu hỏi không tồn tại trong bài làm");

                // For multiple choice questions, auto-grade immediately
                if (snapshot.Question.Type == QuestionType.MultipleChoice)
                {
                    snapshot.StudentAnswerJson = answer;
                    
                    // Auto-grade multiple choice
                    var answersData = JsonSerializer.Deserialize<List<AnswerSnapshot>>(snapshot.AnswersSnapshotJson) ?? new List<AnswerSnapshot>();
                    var selectedAnswerIds = JsonSerializer.Deserialize<List<Guid>>(answer) ?? new List<Guid>();
                    
                    var correctAnswerIds = answersData
                        .Where(a => a.IsCorrect)
                        .Select(a => a.Id)
                        .ToList();

                    var isCorrect = selectedAnswerIds.Count == correctAnswerIds.Count && 
                                   selectedAnswerIds.All(correctAnswerIds.Contains);

                    snapshot.IsCorrect = isCorrect;
                    snapshot.PointsAchieved = isCorrect ? await GetQuestionPointsAsync(snapshot.QuizSubmissionId, questionId) : 0;
                }

                // Update auto-save timestamp
                submission.AutoSavedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return ServiceResult<bool>.Success(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error submitting answer for question {QuestionId}", questionId);
                return ServiceResult<bool>.Failure("Có lỗi xảy ra khi lưu câu trả lời");
            }
        }

        public async Task<ServiceResult<bool>> SubmitEssayAsync(Guid submissionId, Guid questionId, string? text, string? fileUrl, string userId)
        {
            try
            {
                if (!Guid.TryParse(userId, out var userGuid))
                    return ServiceResult<bool>.Failure("ID người dùng không hợp lệ");

                var submission = await _context.QuizSubmissions
                    .FirstOrDefaultAsync(qs => qs.Id == submissionId && qs.StudentId == userGuid);

                if (submission == null)
                    return ServiceResult<bool>.Failure("Bài làm không tồn tại");

                if (submission.Status != "InProgress")
                    return ServiceResult<bool>.Failure("Bài làm đã được nộp");

                var essaySubmission = await _context.EssaySubmissions
                    .FirstOrDefaultAsync(es => es.QuizSubmissionId == submissionId && es.QuestionId == questionId);

                if (essaySubmission == null)
                    return ServiceResult<bool>.Failure("Câu hỏi tự luận không tồn tại");

                essaySubmission.SubmissionText = text;
                essaySubmission.FileUrl = fileUrl;
                essaySubmission.UpdatedAt = DateTime.UtcNow;

                // Update auto-save timestamp
                submission.AutoSavedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return ServiceResult<bool>.Success(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error submitting essay for question {QuestionId}", questionId);
                return ServiceResult<bool>.Failure("Có lỗi xảy ra khi lưu bài tự luận");
            }
        }

        public async Task<ServiceResult<QuizSubmissionDto>> SubmitQuizAsync(Guid submissionId, string userId)
        {
            try
            {
                if (!Guid.TryParse(userId, out var userGuid))
                    return ServiceResult<QuizSubmissionDto>.Failure("ID người dùng không hợp lệ");

                var submission = await _context.QuizSubmissions
                    .Include(qs => qs.Snapshots)
                    .FirstOrDefaultAsync(qs => qs.Id == submissionId && qs.StudentId == userGuid);

                if (submission == null)
                    return ServiceResult<QuizSubmissionDto>.Failure("Bài làm không tồn tại");

                if (submission.Status != "InProgress")
                    return ServiceResult<QuizSubmissionDto>.Failure("Bài làm đã được nộp");

                // VALIDATION: Check if all questions are answered
                var unansweredQuestions = submission.Snapshots
                    .Where(s => string.IsNullOrEmpty(s.StudentAnswerJson))
                    .ToList();

                if (unansweredQuestions.Any())
                {
                    var unansweredCount = unansweredQuestions.Count;
                    return ServiceResult<QuizSubmissionDto>.Failure($"Bạn cần trả lời tất cả {submission.Snapshots.Count} câu hỏi trước khi nộp bài. Còn lại {unansweredCount} câu chưa trả lời.");
                }

                // Calculate total score from multiple choice questions (essays will be graded later)
                var totalScore = submission.Snapshots.Sum(s => s.PointsAchieved);

                submission.EndTime = DateTime.UtcNow;
                submission.Score = totalScore;
                submission.Status = "Submitted";

                await _context.SaveChangesAsync();

                return await GetQuizSubmissionAsync(submissionId, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error submitting quiz {SubmissionId}", submissionId);
                return ServiceResult<QuizSubmissionDto>.Failure("Có lỗi xảy ra khi nộp bài");
            }
        }

        public async Task<ServiceResult<List<EssaySubmissionDto>>> GetEssaySubmissionsAsync(Guid submissionId, string userId)
        {
            try
            {
                if (!Guid.TryParse(userId, out var userGuid))
                    return ServiceResult<List<EssaySubmissionDto>>.Failure("ID người dùng không hợp lệ");

                var submission = await _context.QuizSubmissions
                    .FirstOrDefaultAsync(qs => qs.Id == submissionId && qs.StudentId == userGuid);

                if (submission == null)
                    return ServiceResult<List<EssaySubmissionDto>>.Failure("Bài làm không tồn tại");

                var essaySubmissions = await _context.EssaySubmissions
                    .Where(es => es.QuizSubmissionId == submissionId)
                    .Select(es => new EssaySubmissionDto
                    {
                        Id = es.Id,
                        QuizSubmissionId = es.QuizSubmissionId,
                        QuestionId = es.QuestionId,
                        SubmissionText = es.SubmissionText,
                        FileUrl = es.FileUrl,
                        Score = es.Score,
                        Feedback = es.Feedback,
                        GradedAt = es.GradedAt
                    })
                    .ToListAsync();

                return ServiceResult<List<EssaySubmissionDto>>.Success(essaySubmissions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting essay submissions for {SubmissionId}", submissionId);
                return ServiceResult<List<EssaySubmissionDto>>.Failure("Có lỗi xảy ra khi tải bài tự luận");
            }
        }

        public async Task<ServiceResult<bool>> AutoSaveProgressAsync(Guid submissionId, string userId)
        {
            try
            {
                if (!Guid.TryParse(userId, out var userGuid))
                    return ServiceResult<bool>.Failure("ID người dùng không hợp lệ");

                var submission = await _context.QuizSubmissions
                    .FirstOrDefaultAsync(qs => qs.Id == submissionId && qs.StudentId == userGuid);

                if (submission == null)
                    return ServiceResult<bool>.Failure("Bài làm không tồn tại");

                submission.AutoSavedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                return ServiceResult<bool>.Success(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error auto-saving progress for {SubmissionId}", submissionId);
                return ServiceResult<bool>.Failure("Có lỗi xảy ra khi tự động lưu");
            }
        }

        public async Task<ServiceResult<QuizCompletionStatusDto>> GetQuizCompletionStatusAsync(Guid quizId, string userId)
        {
            try
            {
                if (!Guid.TryParse(userId, out var userGuid))
                    return ServiceResult<QuizCompletionStatusDto>.Failure("ID người dùng không hợp lệ");

                var submissions = await _context.QuizSubmissions
                    .Where(qs => qs.QuizId == quizId && qs.StudentId == userGuid)
                    .OrderByDescending(qs => qs.StartTime)
                    .ToListAsync();

                var completedSubmission = submissions.FirstOrDefault(s => s.Status == "Submitted");
                var inProgressSubmission = submissions.FirstOrDefault(s => s.Status == "InProgress");

                var status = new QuizCompletionStatusDto
                {
                    QuizId = quizId,
                    IsCompleted = completedSubmission != null,
                    HasInProgress = inProgressSubmission != null,
                    Score = completedSubmission?.Score,
                    CompletedAt = completedSubmission?.EndTime,
                    CanRetake = false // Single attempt only
                };

                return ServiceResult<QuizCompletionStatusDto>.Success(status);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting quiz completion status for quiz {QuizId}", quizId);
                return ServiceResult<QuizCompletionStatusDto>.Failure("Có lỗi xảy ra khi kiểm tra trạng thái quiz");
            }
        }

        private async Task<double> GetQuestionPointsAsync(Guid submissionId, Guid questionId)
        {
            var quizQuestion = await _context.QuizSubmissions
                .Where(qs => qs.Id == submissionId)
                .SelectMany(qs => qs.Quiz.Questions)
                .FirstOrDefaultAsync(qq => qq.QuestionId == questionId);

            return quizQuestion?.Points ?? 0;
        }
    }
}