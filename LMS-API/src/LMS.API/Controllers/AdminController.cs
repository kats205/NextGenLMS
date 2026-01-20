using LMS.Application.Admin;
using LMS.Domain.Constant;
using LMS.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using static LMS.Application.Common.ServiceResult;

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
}
