using LMS.Application.Common;
using LMS.Application.DTOs.Common;

namespace LMS.Application.Interfaces
{
    public interface IQuizService
    {
        // Student Quiz Taking
        Task<ServiceResult<QuizDto>> GetQuizAsync(Guid quizId, string userId);
        Task<ServiceResult<QuizSubmissionDto>> StartQuizAsync(Guid quizId, string userId);
        Task<ServiceResult<QuizSubmissionDto>> GetQuizSubmissionAsync(Guid submissionId, string userId);
        Task<ServiceResult<bool>> SubmitAnswerAsync(Guid submissionId, Guid questionId, string answer, string userId);
        Task<ServiceResult<QuizSubmissionDto>> SubmitQuizAsync(Guid submissionId, string userId);
        
        // Essay Submissions
        Task<ServiceResult<bool>> SubmitEssayAsync(Guid submissionId, Guid questionId, string? text, string? fileUrl, string userId);
        Task<ServiceResult<List<EssaySubmissionDto>>> GetEssaySubmissionsAsync(Guid submissionId, string userId);
        
        // Auto-save functionality
        Task<ServiceResult<bool>> AutoSaveProgressAsync(Guid submissionId, string userId);
        
        // Quiz completion status
        Task<ServiceResult<QuizCompletionStatusDto>> GetQuizCompletionStatusAsync(Guid quizId, string userId);
    }
}