using LMS.Application.Common;
using LMS.Application.DTOs.Common;


namespace LMS.Application.Interfaces
{
    public interface IAssignmentService
    {
        // Assignment Operations
        Task<ServiceResult<AssignmentDetailDto>> GetAssignmentAsync(Guid assignmentId, Guid currentUserId);

        // Submission CRUD Operations
        Task<ServiceResult<AssignmentSubmissionDto>> CreateSubmissionAsync(CreateSubmissionDto createDto, Guid currentUserId);
        Task<ServiceResult<AssignmentSubmissionDto>> UpdateSubmissionAsync(Guid submissionId, UpdateSubmissionDto updateDto, Guid currentUserId);
        Task<ServiceResult<bool>> DeleteSubmissionAsync(Guid submissionId, Guid currentUserId);
        Task<ServiceResult<AssignmentSubmissionDto>> GetSubmissionAsync(Guid submissionId, Guid currentUserId);

        // Submission Actions
        Task<ServiceResult<AssignmentSubmissionDto>> SubmitAssignmentAsync(SubmitAssignmentDto submitDto, Guid currentUserId);
        Task<ServiceResult<AssignmentSubmissionDto>> UnsubmitAssignmentAsync(Guid submissionId, Guid currentUserId);
        Task<ServiceResult<AssignmentSubmissionDto>> GradeSubmissionAsync(GradeSubmissionDto gradeDto, Guid currentUserId);

        // Student Operations
        Task<ServiceResult<AssignmentSubmissionDto>> GetMySubmissionAsync(Guid assignmentId, Guid currentUserId);
        Task<ServiceResult<List<AssignmentSubmissionDto>>> GetMySubmissionHistoryAsync(Guid assignmentId, Guid currentUserId);

        // Instructor Operations
        Task<ServiceResult<List<AssignmentSubmissionListDto>>> GetAssignmentSubmissionsAsync(Guid assignmentId, Guid currentUserId);
        Task<ServiceResult<AssignmentSubmissionDto>> GetStudentSubmissionAsync(Guid assignmentId, Guid studentId, Guid currentUserId);

        // Comment Operations
        Task<ServiceResult<SubmissionCommentDto>> CreateCommentAsync(CreateCommentDto createDto, Guid currentUserId);
        Task<ServiceResult<SubmissionCommentDto>> UpdateCommentAsync(Guid commentId, UpdateCommentDto updateDto, Guid currentUserId);
        Task<ServiceResult<bool>> DeleteCommentAsync(Guid commentId, Guid currentUserId);
        Task<ServiceResult<List<SubmissionCommentDto>>> GetSubmissionCommentsAsync(Guid submissionId, Guid currentUserId);

        // Validation
        Task<bool> CanUserAccessAssignmentAsync(Guid assignmentId, Guid userId);
        Task<bool> CanUserSubmitAssignmentAsync(Guid assignmentId, Guid userId);
        Task<bool> CanUserGradeAssignmentAsync(Guid assignmentId, Guid userId);
    }
}