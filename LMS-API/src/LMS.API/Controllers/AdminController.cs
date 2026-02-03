using LMS.Application.DTOs.Admin;
using LMS.Application.DTOs.Common;
using LMS.Domain.Constant;
using LMS.Domain.Entities.Users;
using LMS.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors.Infrastructure;
using Microsoft.AspNetCore.Mvc;
using static LMS.Application.DTOs.Common.ServiceResult;

namespace LMS.API.Controllers
{
    [Authorize(Roles = UserRoles.Admin)]
    [ApiController]
    [Route("api/admin/users")]
    public class AdminController: ControllerBase
    {
        private readonly IAdminUserService _service;

        public AdminController(IAdminUserService service) => _service = service;

        [HttpGet]
        public async Task<IActionResult> GetUsers([FromQuery] UserQueryParams query)
        {
            var result = await _service.GetUserAsync(query);
            return Ok(result);
        }
        [HttpGet("{userId}")]
        public async Task<IActionResult> GetUserById(Guid userId)
        {
            var result = await _service.GetUserByIdAsync(userId);

            if (!result.IsSuccess)
            {
                return NotFound(new ApiResponse<UserDetailDto>
                {
                    Success = false,
                    Message = result.Message
                });
            }

            return Ok(new ApiResponse<UserDetailDto>
            {
                Success = true,
                Message = "Lấy thông tin người dùng thành công",
                Data = result.Data
            });
        }

        [HttpPost]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Dữ liệu không hợp lệ",
                    Errors = ModelState
                });
            }

            var result = await _service.CreateUserAsync(dto);

            if (!result.IsSuccess)
            {
                return BadRequest(new ApiResponse<UserDetailDto>
                {
                    Success = false,
                    Message = result.Message
                });
            }

            return Ok(new ApiResponse<UserDetailDto>
            {
                Success = true,
                Message = result.Message,
                Data = result.Data
            });
        }

        [HttpPut("{userId}")]
        public async Task<IActionResult> UpdateUser(Guid userId, [FromBody] UpdateUserDto dto)
        {
            if (userId != dto.UserId)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "User ID không khớp"
                });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Dữ liệu không hợp lệ",
                    Errors = ModelState
                });
            }

            var result = await _service.UpdateUserAsync(dto);

            if (!result.IsSuccess)
            {
                return BadRequest(new ApiResponse<UserDetailDto>
                {
                    Success = false,
                    Message = result.Message
                });
            }

            return Ok(new ApiResponse<UserDetailDto>
            {
                Success = true,
                Message = result.Message,
                Data = result.Data
            });
        }

        [HttpDelete("{userId}")]
        public async Task<IActionResult> DeleteUser(Guid userId)
        {
            var result = await _service.DeleteUserAsync(userId);

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
                Message = result.Message,
                Data = true
            });
        }

        [HttpPatch("{userId}/toggle-status")]
        public async Task<IActionResult> ToggleUserStatus(Guid userId, [FromBody] ToggleUserStatusDto dto)
        {
            if (userId != dto.UserId)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "User ID không khớp"
                });
            }

            var result = await _service.ToggleUserStatusAsync(dto);

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
                Message = result.Message,
                Data = true
            });
        }

        [HttpPost("{userId}/reset-password")]
        public async Task<IActionResult> ResetPassword(Guid userId)
        {
            var result = await _service.ResetPasswordAsync(userId);

            if (!result.IsSuccess)
            {
                return BadRequest(new ApiResponse<string>
                {
                    Success = false,
                    Message = result.Message
                });
            }

            return Ok(new ApiResponse<string>
            {
                Success = true,
                Message = result.Message,
                Data = result.Data // New password
            });
        }
    }
    [Route("api/admin/system-config")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class SystemConfigController : ControllerBase
    {
        private readonly ISystemConfigService _configService;

        public SystemConfigController(ISystemConfigService configService)
        {
            _configService = configService;
        }

        /// <summary>
        /// Lấy tất cả cấu hình hệ thống
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAllConfigs()
        {
            var result = await _configService.GetAllConfigsAsync();

            if (!result.IsSuccess)
            {
                return BadRequest(new ApiResponse<SystemConfigResponse>
                {
                    Success = false,
                    Message = result.Message,
                    Errors = result.Errors
                });
            }

            return Ok(new ApiResponse<SystemConfigResponse>
            {
                Success = true,
                Message = "Lấy cấu hình thành công",
                Data = result.Data
            });
        }

        /// <summary>
        /// Lấy cấu hình theo key
        /// </summary>
        [HttpGet("{key}")]
        public async Task<IActionResult> GetConfigByKey(string key)
        {
            var result = await _configService.GetConfigByKeyAsync(key);

            if (!result.IsSuccess)
            {
                return NotFound(new ApiResponse<SystemConfigDto>
                {
                    Success = false,
                    Message = result.Message
                });
            }

            return Ok(new ApiResponse<SystemConfigDto>
            {
                Success = true,
                Message = "Lấy cấu hình thành công",
                Data = result.Data
            });
        }

        /// <summary>
        /// Cập nhật cấu hình hệ thống
        /// </summary>
        [HttpPut]
        public async Task<IActionResult> UpdateConfigs([FromBody] SystemConfigUpdateRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Dữ liệu không hợp lệ",
                    Errors = ModelState
                });
            }

            var result = await _configService.UpdateMultipleConfigsAsync(request);

            if (!result.IsSuccess)
            {
                return BadRequest(new ApiResponse<bool>
                {
                    Success = false,
                    Message = result.Message,
                    Errors = result.Errors
                });
            }

            return Ok(new ApiResponse<bool>
            {
                Success = true,
                Message = result.Message,
                Data = true
            });
        }

        /// <summary>
        /// Lấy danh sách năm học
        /// </summary>
        [HttpGet("academic-years")]
        public async Task<IActionResult> GetAcademicYears()
        {
            var result = await _configService.GetAcademicYearsAsync();

            if (!result.IsSuccess)
            {
                return BadRequest(new ApiResponse<List<AcademicYearDto>>
                {
                    Success = false,
                    Message = result.Message
                });
            }

            return Ok(new ApiResponse<List<AcademicYearDto>>
            {
                Success = true,
                Message = "Lấy danh sách năm học thành công",
                Data = result.Data
            });
        }

        /// <summary>
        /// Lấy danh sách học kỳ
        /// </summary>
        [HttpGet("semesters")]
        public async Task<IActionResult> GetSemesters()
        {
            var result = await _configService.GetSemestersAsync();

            if (!result.IsSuccess)
            {
                return BadRequest(new ApiResponse<List<SemesterDto>>
                {
                    Success = false,
                    Message = result.Message
                });
            }

            return Ok(new ApiResponse<List<SemesterDto>>
            {
                Success = true,
                Message = "Lấy danh sách học kỳ thành công",
                Data = result.Data
            });
        }

        /// <summary>
        /// Sao lưu dữ liệu ngay
        /// </summary>
        [HttpPost("backup")]
        public async Task<IActionResult> BackupNow()
        {
            var result = await _configService.BackupNowAsync();

            if (!result.IsSuccess)
            {
                return BadRequest(new ApiResponse<string>
                {
                    Success = false,
                    Message = result.Message
                });
            }

            return Ok(new ApiResponse<string>
            {
                Success = true,
                Message = result.Message,
                Data = result.Data
            });
        }

        /// <summary>
        /// Test cấu hình email
        /// </summary>
        [HttpPost("test-email")]
        public async Task<IActionResult> TestEmail()
        {
            var result = await _configService.TestEmailConfigAsync();

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
                Message = result.Message,
                Data = true
            });
        }
    }
    [ApiController]
    [Route("api/admin/[controller]")]
    [Authorize(Roles = "Admin")]
    public class CoursesController : ControllerBase
    {
        private readonly IAdminCourseService _courseService;
        private readonly ICourseConfigService _ccfs;
        public CoursesController(IAdminCourseService courseService, ICourseConfigService ccfs)
        {
            _courseService = courseService;
            _ccfs = ccfs;
        }

        /// <summary>
        /// Lấy danh sách khóa học với phân trang và tìm kiếm
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetCourses([FromQuery] CourseFilterDto filter)
        {
            var result = await _courseService.GetCoursesAsync(filter);
            var response = ApiResponse<PagedResultDto<CourseDto>>.FromServiceResult(result);

            return result.IsSuccess ? Ok(response) : BadRequest(response);
        }

        /// <summary>
        /// Lấy chi tiết khóa học theo ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetCourseById(Guid id)
        {
            var result = await _courseService.GetCourseByIdAsync(id);
            var response = ApiResponse<CourseDetailDto>.FromServiceResult(result);

            return result.IsSuccess ? Ok(response) : NotFound(response);
        }

        /// <summary>
        /// Tạo khóa học mới
        /// </summary>
        [HttpPost]
        [Authorize(Roles = UserRoles.Admin)]
        public async Task<IActionResult> CreateCourse([FromBody] CreateCourseDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<CourseDto>.FailureResponse(
                    "Dữ liệu không hợp lệ",
                    ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)).ToList()
                ));
            }

            var result = await _courseService.CreateCourseAsync(dto);
            var response = ApiResponse<CourseDto>.FromServiceResult(result);

            if (result.IsSuccess)
            {
                return CreatedAtAction(
                    nameof(GetCourseById),
                    new { id = result.Data!.Id },
                    response
                );
            }

            return BadRequest(response);
        }

        /// <summary>
        /// Cập nhật thông tin khóa học
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Lecturer")]
        public async Task<IActionResult> UpdateCourse(Guid id, [FromBody] UpdateCourseDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<CourseDto>.FailureResponse(
                    "Dữ liệu không hợp lệ",
                    ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)).ToList()
                ));
            }

            var result = await _courseService.UpdateCourseAsync(id, dto);
            var response = ApiResponse<CourseDto>.FromServiceResult(result);

            return result.IsSuccess ? Ok(response) : BadRequest(response);
        }

        /// <summary>
        /// Xóa khóa học (soft delete)
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = UserRoles.Admin)]
        public async Task<IActionResult> DeleteCourse(Guid id)
        {
            var result = await _courseService.DeleteCourseAsync(id);
            var response = ApiResponse.SuccessResponse(result.Message);

            if (!result.IsSuccess)
            {
                response = ApiResponse.FailureResponse(result.Message, result.Errors);
            }

            return result.IsSuccess ? Ok(response) : NotFound(response);
        }

        /// <summary>
        /// Phân quyền giảng viên cho khóa học
        /// </summary>
        [HttpPut("{courseId}/lecturer/{lecturerId}")]
        [Authorize(Roles = UserRoles.Admin)]
        public async Task<IActionResult> AssignLecturer(Guid courseId, Guid lecturerId)
        {
            var result = await _courseService.AssignLecturerAsync(courseId, lecturerId);
            var response = ApiResponse.SuccessResponse(result.Message);

            if (!result.IsSuccess)
            {
                response = ApiResponse.FailureResponse(result.Message, result.Errors);
            }

            return result.IsSuccess ? Ok(response) : BadRequest(response);
        }

        /// <summary>
        /// Lấy báo cáo thống kê khóa học
        /// </summary>
        [HttpGet("{id}/statistics")]
        public async Task<IActionResult> GetCourseStatistics(Guid id)
        {
            var result = await _courseService.GetCourseStatisticsAsync(id);
            var response = ApiResponse<CourseStatisticsDto>.FromServiceResult(result);

            return result.IsSuccess ? Ok(response) : BadRequest(response);
        }

        /// <summary>
        /// Lấy danh sach khoa
        /// </summary>
        /// 
        [HttpGet("departments")]
        [Authorize(Roles = UserRoles.Admin + "," + UserRoles.Lecturer + "," + UserRoles.Student)]
        public async Task<IActionResult> GetDepartmentList()
        {
            var result = await _ccfs.getDepartmentList();

            if (result.IsSuccess) {
                return Ok(new ApiResponse<List<DepartmentDto>>
                {
                    Data = result.Data,
                    Success = true
                });
            }
            return BadRequest(new ApiResponse<List<DepartmentDto>>
            {
                Success = false,
                Message = result.Message
            });
            
        }

        /// <summary>
        /// Lấy danh sách ngành
        /// </summary>

        [HttpGet("majors")]
        [Authorize(Roles = UserRoles.Admin + "," + UserRoles.Lecturer + "," + UserRoles.Student )]
        public async Task<IActionResult> GetMajorList()
        {
            var result = await _ccfs.getMajorList();
            if (result.IsSuccess)
            {
                return Ok(new ApiResponse<List<MajorDto>>
                {
                    Data = result.Data,
                    Success = true
                });
            }
            return BadRequest(new ApiResponse<List<MajorDto>>
            {
                Success = false,
                Message = result.Message
            });
        }
    }
}
