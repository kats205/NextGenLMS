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
    [AllowAnonymous]
    public class CourseController : ControllerBase
    {
        private readonly ICourseService _courseService;

        public CourseController(ICourseService courseService)
        {
            _courseService = courseService;
        }

        /// <summary>
        /// Tạo khóa học mới (Admin/Lecturer)
        /// </summary>
        [HttpPost]
        [Authorize(Policy = "AdminOrLecturer")]
        public async Task<IActionResult> CreateCourse([FromBody] CreateCourseDto createDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<object>.FailureResponse("Dữ liệu không hợp lệ", ModelState));
            }

            var currentUserId = GetCurrentUserId();
            var result = await _courseService.CreateCourseAsync(createDto, currentUserId);

            if (result.IsSuccess)
            {
                return Ok(ApiResponse<CourseDto>.FromServiceResult(result));
            }

            return BadRequest(ApiResponse<CourseDto>.FromServiceResult(result));
        }

        /// <summary>
        /// Cập nhật khóa học (Admin/Lecturer sở hữu)
        /// </summary>
        [HttpPut("{courseId}")]
        [Authorize(Policy = "AdminOrLecturer")]
        public async Task<IActionResult> UpdateCourse(Guid courseId, [FromBody] UpdateCourseDto updateDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<object>.FailureResponse("Dữ liệu không hợp lệ", ModelState));
            }

            var currentUserId = GetCurrentUserId();
            var result = await _courseService.UpdateCourseAsync(courseId, updateDto, currentUserId);

            if (result.IsSuccess)
            {
                return Ok(ApiResponse<CourseDto>.FromServiceResult(result));
            }

            return BadRequest(ApiResponse<CourseDto>.FromServiceResult(result));
        }

        /// <summary>
        /// Xóa khóa học (Admin/Lecturer sở hữu)
        /// </summary>
        [HttpDelete("{courseId}")]
        [Authorize(Policy = "AdminOrLecturer")]
        public async Task<IActionResult> DeleteCourse(Guid courseId)
        {
            var currentUserId = GetCurrentUserId();
            var result = await _courseService.DeleteCourseAsync(courseId, currentUserId);

            if (result.IsSuccess)
            {
                return Ok(ApiResponse<bool>.FromServiceResult(result));
            }

            return BadRequest(ApiResponse<bool>.FromServiceResult(result));
        }

        /// <summary>
        /// Lấy thông tin chi tiết khóa học
        /// </summary>
        [HttpGet("{courseId}")]
        public async Task<IActionResult> GetCourseById(Guid courseId)
        {
            var currentUserId = GetCurrentUserId();
            var result = await _courseService.GetCourseByIdAsync(courseId, currentUserId);

            if (result.IsSuccess)
            {
                return Ok(ApiResponse<CourseDetailDto>.FromServiceResult(result));
            }

            return BadRequest(ApiResponse<CourseDetailDto>.FromServiceResult(result));
        }

        /// <summary>
        /// Lấy tất cả khóa học (Admin only)
        /// </summary>
        [HttpGet]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> GetAllCourses()
        {
            var currentUserId = GetCurrentUserId();
            var result = await _courseService.GetAllCoursesAsync(currentUserId);

            if (result.IsSuccess)
            {
                return Ok(ApiResponse<List<CourseDto>>.FromServiceResult(result));
            }

            return BadRequest(ApiResponse<List<CourseDto>>.FromServiceResult(result));
        }

        /// <summary>
        /// Lấy khóa học theo giảng viên
        /// </summary>
        [HttpGet("lecturer/{lecturerId}")]
        [Authorize(Policy = "AdminOrLecturer")]
        public async Task<IActionResult> GetCoursesByLecturer(Guid lecturerId)
        {
            var currentUserId = GetCurrentUserId();
            var result = await _courseService.GetCoursesByLecturerAsync(lecturerId, currentUserId);

            if (result.IsSuccess)
            {
                return Ok(ApiResponse<List<CourseDto>>.FromServiceResult(result));
            }

            return BadRequest(ApiResponse<List<CourseDto>>.FromServiceResult(result));
        }

        /// <summary>
        /// Lấy khóa học của giảng viên hiện tại
        /// </summary>
        [HttpGet("my-courses")]
        [Authorize(Policy = "LecturerOnly")]
        public async Task<IActionResult> GetMyCourses()
        {
            var currentUserId = GetCurrentUserId();
            var result = await _courseService.GetCoursesByLecturerAsync(currentUserId, currentUserId);

            if (result.IsSuccess)
            {
                return Ok(ApiResponse<List<CourseDto>>.FromServiceResult(result));
            }

            return BadRequest(ApiResponse<List<CourseDto>>.FromServiceResult(result));
        }

        /// <summary>
        /// Lấy khóa học theo sinh viên
        /// </summary>
        [HttpGet("student/{studentId}")]
        public async Task<IActionResult> GetCoursesByStudent(Guid studentId)
        {
            var currentUserId = GetCurrentUserId();
            var currentUserRole = GetCurrentUserRole();

            // Chỉ Admin hoặc chính sinh viên đó mới có thể xem
            if (currentUserRole != UserRoles.Admin && currentUserId != studentId)
            {
                return Forbid("Bạn không có quyền xem khóa học của sinh viên khác");
            }

            var result = await _courseService.GetCoursesByStudentAsync(studentId);

            if (result.IsSuccess)
            {
                return Ok(ApiResponse<List<CourseDto>>.FromServiceResult(result));
            }

            return BadRequest(ApiResponse<List<CourseDto>>.FromServiceResult(result));
        }

        /// <summary>
        /// Lấy khóa học của sinh viên hiện tại
        /// </summary>
        [HttpGet("my-enrolled-courses")]
        [Authorize(Policy = "StudentOnly")]
        public async Task<IActionResult> GetMyEnrolledCourses()
        {
            var currentUserId = GetCurrentUserId();
            var result = await _courseService.GetCoursesByStudentAsync(currentUserId);

            if (result.IsSuccess)
            {
                return Ok(ApiResponse<List<CourseDto>>.FromServiceResult(result));
            }

            return BadRequest(ApiResponse<List<CourseDto>>.FromServiceResult(result));
        }

        /// <summary>
        /// Đăng ký sinh viên vào khóa học (Admin/Lecturer sở hữu)
        /// </summary>
        [HttpPost("{courseId}/enroll-students")]
        [Authorize(Policy = "AdminOrLecturer")]
        public async Task<IActionResult> EnrollStudents(Guid courseId, [FromBody] EnrollStudentDto enrollDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<object>.FailureResponse("Dữ liệu không hợp lệ", ModelState));
            }

            var currentUserId = GetCurrentUserId();
            var result = await _courseService.EnrollStudentsAsync(courseId, enrollDto, currentUserId);

            if (result.IsSuccess)
            {
                return Ok(ApiResponse<bool>.FromServiceResult(result));
            }

            return BadRequest(ApiResponse<bool>.FromServiceResult(result));
        }

        /// <summary>
        /// Xóa sinh viên khỏi khóa học (Admin/Lecturer sở hữu)
        /// </summary>
        [HttpDelete("{courseId}/students/{studentId}")]
        [Authorize(Policy = "AdminOrLecturer")]
        public async Task<IActionResult> RemoveStudentFromCourse(Guid courseId, Guid studentId)
        {
            var currentUserId = GetCurrentUserId();
            var result = await _courseService.RemoveStudentFromCourseAsync(courseId, studentId, currentUserId);

            if (result.IsSuccess)
            {
                return Ok(ApiResponse<bool>.FromServiceResult(result));
            }

            return BadRequest(ApiResponse<bool>.FromServiceResult(result));
        }

        /// <summary>
        /// Kiểm tra khóa học có tồn tại không
        /// </summary>
        [HttpGet("{courseId}/exists")]
        public async Task<IActionResult> CheckCourseExists(Guid courseId)
        {
            var exists = await _courseService.IsCourseExistsAsync(courseId);
            return Ok(ApiResponse<bool>.SuccessResponse(exists));
        }

        /// <summary>
        /// Kiểm tra sinh viên có đăng ký khóa học không
        /// </summary>
        [HttpGet("{courseId}/students/{studentId}/enrolled")]
        public async Task<IActionResult> CheckStudentEnrolled(Guid courseId, Guid studentId)
        {
            var currentUserId = GetCurrentUserId();
            var currentUserRole = GetCurrentUserRole();

            // Kiểm tra quyền truy cập
            if (currentUserRole == UserRoles.Student && currentUserId != studentId)
            {
                return Forbid("Bạn chỉ có thể kiểm tra trạng thái đăng ký của chính mình");
            }

            if (currentUserRole == UserRoles.Lecturer)
            {
                var canAccess = await _courseService.CanUserAccessCourseAsync(courseId, currentUserId, currentUserRole);
                if (!canAccess)
                {
                    return Forbid("Bạn không có quyền truy cập khóa học này");
                }
            }

            var enrolled = await _courseService.IsUserEnrolledInCourseAsync(courseId, studentId);
            return Ok(ApiResponse<bool>.SuccessResponse(enrolled));
        }

        // Helper methods
        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (Guid.TryParse(userIdClaim, out var userId))
            {
                return userId;
            }
            // For testing purposes, return a hardcoded user ID
            return Guid.Parse("11111111-1111-1111-1111-111111111111");
        }

        private string GetCurrentUserRole()
        {
            return User.FindFirst(ClaimTypes.Role)?.Value ?? string.Empty;
        }
    }
}