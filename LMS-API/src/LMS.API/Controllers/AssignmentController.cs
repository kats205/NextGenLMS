using LMS.Application.Common;
using LMS.Application.Interfaces;
using LMS.Domain.Constant;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using static LMS.Application.Common.ServiceResult;

namespace LMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AssignmentController : ControllerBase
    {
        private readonly IAssignmentService _assignmentService;

        public AssignmentController(IAssignmentService assignmentService)
        {
            _assignmentService = assignmentService;
        }

        /// <summary>
        /// Get assignment details
        /// </summary>
        [HttpGet("{assignmentId}")]
        public async Task<IActionResult> GetAssignment(Guid assignmentId)
        {
            var currentUserId = GetCurrentUserId();
            var result = await _assignmentService.GetAssignmentAsync(assignmentId, currentUserId);

            if (result.IsSuccess)
            {
                return Ok(ApiResponse<AssignmentDetailDto>.FromServiceResult(result));
            }

            return BadRequest(ApiResponse<AssignmentDetailDto>.FromServiceResult(result));
        }

        /// <summary>
        /// Create new submission (Student only)
        /// </summary>
        [HttpPost("submissions")]
        [Authorize(Policy = "StudentOnly")]
        public async Task<IActionResult> CreateSubmission([FromForm] CreateSubmissionDto createDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<object>.FailureResponse("Dữ liệu không hợp lệ", ModelState));
            }

            var currentUserId = GetCurrentUserId();
            var result = await _assignmentService.CreateSubmissionAsync(createDto, currentUserId);

            if (result.IsSuccess)
            {
                return Ok(ApiResponse<AssignmentSubmissionDto>.FromServiceResult(result));
            }

            return BadRequest(ApiResponse<AssignmentSubmissionDto>.FromServiceResult(result));
        }

        /// <summary>
        /// Update submission (Student only)
        /// </summary>
        [HttpPut("submissions/{submissionId}")]
        [Authorize(Policy = "StudentOnly")]
        public async Task<IActionResult> UpdateSubmission(Guid submissionId, [FromForm] UpdateSubmissionDto updateDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<object>.FailureResponse("Dữ liệu không hợp lệ", ModelState));
            }

            var currentUserId = GetCurrentUserId();
            var result = await _assignmentService.UpdateSubmissionAsync(submissionId, updateDto, currentUserId);

            if (result.IsSuccess)
            {
                return Ok(ApiResponse<AssignmentSubmissionDto>.FromServiceResult(result));
            }

            return BadRequest(ApiResponse<AssignmentSubmissionDto>.FromServiceResult(result));
        }

        /// <summary>
        /// Delete submission (Student only)
        /// </summary>
        [HttpDelete("submissions/{submissionId}")]
        [Authorize(Policy = "StudentOnly")]
        public async Task<IActionResult> DeleteSubmission(Guid submissionId)
        {
            var currentUserId = GetCurrentUserId();
            var result = await _assignmentService.DeleteSubmissionAsync(submissionId, currentUserId);

            if (result.IsSuccess)
            {
                return Ok(ApiResponse<bool>.FromServiceResult(result));
            }

            return BadRequest(ApiResponse<bool>.FromServiceResult(result));
        }

        /// <summary>
        /// Get submission details
        /// </summary>
        [HttpGet("submissions/{submissionId}")]
        public async Task<IActionResult> GetSubmission(Guid submissionId)
        {
            var currentUserId = GetCurrentUserId();
            var result = await _assignmentService.GetSubmissionAsync(submissionId, currentUserId);

            if (result.IsSuccess)
            {
                return Ok(ApiResponse<AssignmentSubmissionDto>.FromServiceResult(result));
            }

            return BadRequest(ApiResponse<AssignmentSubmissionDto>.FromServiceResult(result));
        }

        /// <summary>
        /// Submit assignment (Student only)
        /// </summary>
        [HttpPost("submissions/{submissionId}/submit")]
        [Authorize(Policy = "StudentOnly")]
        public async Task<IActionResult> SubmitAssignment(Guid submissionId)
        {
            var submitDto = new SubmitAssignmentDto { SubmissionId = submissionId };
            var currentUserId = GetCurrentUserId();
            var result = await _assignmentService.SubmitAssignmentAsync(submitDto, currentUserId);

            if (result.IsSuccess)
            {
                return Ok(ApiResponse<AssignmentSubmissionDto>.FromServiceResult(result));
            }

            return BadRequest(ApiResponse<AssignmentSubmissionDto>.FromServiceResult(result));
        }

        /// <summary>
        /// Unsubmit assignment (Student only)
        /// </summary>
        [HttpPost("submissions/{submissionId}/unsubmit")]
        [Authorize(Policy = "StudentOnly")]
        public async Task<IActionResult> UnsubmitAssignment(Guid submissionId)
        {
            var currentUserId = GetCurrentUserId();
            var result = await _assignmentService.UnsubmitAssignmentAsync(submissionId, currentUserId);

            if (result.IsSuccess)
            {
                return Ok(ApiResponse<AssignmentSubmissionDto>.FromServiceResult(result));
            }

            return BadRequest(ApiResponse<AssignmentSubmissionDto>.FromServiceResult(result));
        }

        /// <summary>
        /// Grade submission (Lecturer/Admin only)
        /// </summary>
        [HttpPost("submissions/{submissionId}/grade")]
        [Authorize(Policy = "AdminOrLecturer")]
        public async Task<IActionResult> GradeSubmission(Guid submissionId, [FromBody] GradeSubmissionDto gradeDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<object>.FailureResponse("Dữ liệu không hợp lệ", ModelState));
            }

            gradeDto.SubmissionId = submissionId;
            var currentUserId = GetCurrentUserId();
            var result = await _assignmentService.GradeSubmissionAsync(gradeDto, currentUserId);

            if (result.IsSuccess)
            {
                return Ok(ApiResponse<AssignmentSubmissionDto>.FromServiceResult(result));
            }

            return BadRequest(ApiResponse<AssignmentSubmissionDto>.FromServiceResult(result));
        }

        /// <summary>
        /// Get my submission for assignment (Student only)
        /// </summary>
        [HttpGet("{assignmentId}/my-submission")]
        [Authorize(Policy = "StudentOnly")]
        public async Task<IActionResult> GetMySubmission(Guid assignmentId)
        {
            var currentUserId = GetCurrentUserId();
            var result = await _assignmentService.GetMySubmissionAsync(assignmentId, currentUserId);

            if (result.IsSuccess)
            {
                return Ok(ApiResponse<AssignmentSubmissionDto>.FromServiceResult(result));
            }

            return BadRequest(ApiResponse<AssignmentSubmissionDto>.FromServiceResult(result));
        }

        /// <summary>
        /// Get my submission history for assignment (Student only)
        /// </summary>
        [HttpGet("{assignmentId}/my-submission-history")]
        [Authorize(Policy = "StudentOnly")]
        public async Task<IActionResult> GetMySubmissionHistory(Guid assignmentId)
        {
            var currentUserId = GetCurrentUserId();
            var result = await _assignmentService.GetMySubmissionHistoryAsync(assignmentId, currentUserId);

            if (result.IsSuccess)
            {
                return Ok(ApiResponse<List<AssignmentSubmissionDto>>.FromServiceResult(result));
            }

            return BadRequest(ApiResponse<List<AssignmentSubmissionDto>>.FromServiceResult(result));
        }

        /// <summary>
        /// Get all submissions for assignment (Lecturer/Admin only)
        /// </summary>
        [HttpGet("{assignmentId}/submissions")]
        [Authorize(Policy = "AdminOrLecturer")]
        public async Task<IActionResult> GetAssignmentSubmissions(Guid assignmentId)
        {
            var currentUserId = GetCurrentUserId();
            var result = await _assignmentService.GetAssignmentSubmissionsAsync(assignmentId, currentUserId);

            if (result.IsSuccess)
            {
                return Ok(ApiResponse<List<AssignmentSubmissionListDto>>.FromServiceResult(result));
            }

            return BadRequest(ApiResponse<List<AssignmentSubmissionListDto>>.FromServiceResult(result));
        }

        /// <summary>
        /// Get specific student's submission (Lecturer/Admin only)
        /// </summary>
        [HttpGet("{assignmentId}/students/{studentId}/submission")]
        [Authorize(Policy = "AdminOrLecturer")]
        public async Task<IActionResult> GetStudentSubmission(Guid assignmentId, Guid studentId)
        {
            var currentUserId = GetCurrentUserId();
            var result = await _assignmentService.GetStudentSubmissionAsync(assignmentId, studentId, currentUserId);

            if (result.IsSuccess)
            {
                return Ok(ApiResponse<AssignmentSubmissionDto>.FromServiceResult(result));
            }

            return BadRequest(ApiResponse<AssignmentSubmissionDto>.FromServiceResult(result));
        }

        /// <summary>
        /// Create comment on submission
        /// </summary>
        [HttpPost("submissions/{submissionId}/comments")]
        public async Task<IActionResult> CreateComment(Guid submissionId, [FromForm] CreateCommentDto createDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<object>.FailureResponse("Dữ liệu không hợp lệ", ModelState));
            }

            createDto.SubmissionId = submissionId;
            var currentUserId = GetCurrentUserId();
            var result = await _assignmentService.CreateCommentAsync(createDto, currentUserId);

            if (result.IsSuccess)
            {
                return Ok(ApiResponse<SubmissionCommentDto>.FromServiceResult(result));
            }

            return BadRequest(ApiResponse<SubmissionCommentDto>.FromServiceResult(result));
        }

        /// <summary>
        /// Update comment
        /// </summary>
        [HttpPut("comments/{commentId}")]
        public async Task<IActionResult> UpdateComment(Guid commentId, [FromForm] UpdateCommentDto updateDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<object>.FailureResponse("Dữ liệu không hợp lệ", ModelState));
            }

            var currentUserId = GetCurrentUserId();
            var result = await _assignmentService.UpdateCommentAsync(commentId, updateDto, currentUserId);

            if (result.IsSuccess)
            {
                return Ok(ApiResponse<SubmissionCommentDto>.FromServiceResult(result));
            }

            return BadRequest(ApiResponse<SubmissionCommentDto>.FromServiceResult(result));
        }

        /// <summary>
        /// Delete comment
        /// </summary>
        [HttpDelete("comments/{commentId}")]
        public async Task<IActionResult> DeleteComment(Guid commentId)
        {
            var currentUserId = GetCurrentUserId();
            var result = await _assignmentService.DeleteCommentAsync(commentId, currentUserId);

            if (result.IsSuccess)
            {
                return Ok(ApiResponse<bool>.FromServiceResult(result));
            }

            return BadRequest(ApiResponse<bool>.FromServiceResult(result));
        }

        /// <summary>
        /// Get comments for submission
        /// </summary>
        [HttpGet("submissions/{submissionId}/comments")]
        public async Task<IActionResult> GetSubmissionComments(Guid submissionId)
        {
            var currentUserId = GetCurrentUserId();
            var result = await _assignmentService.GetSubmissionCommentsAsync(submissionId, currentUserId);

            if (result.IsSuccess)
            {
                return Ok(ApiResponse<List<SubmissionCommentDto>>.FromServiceResult(result));
            }

            return BadRequest(ApiResponse<List<SubmissionCommentDto>>.FromServiceResult(result));
        }

        // Helper methods
        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.TryParse(userIdClaim, out var userId) ? userId : Guid.Empty;
        }

        private string GetCurrentUserRole()
        {
            return User.FindFirst(ClaimTypes.Role)?.Value ?? string.Empty;
        }
    }
}