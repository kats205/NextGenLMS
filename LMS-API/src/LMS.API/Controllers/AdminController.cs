using LMS.Application.Admin;
using LMS.Application.Common;
using LMS.Application.Interfaces;
using LMS.Domain.Constant;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using static LMS.Application.Common.ServiceResult;

namespace LMS.API.Controllers
{
    [ApiController]
    [Route("api/admin")]
    [Authorize(Policy = "AdminOnly")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminUserService _service;

        public AdminController(IAdminUserService service) => _service = service;

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers([FromQuery] UserQueryParams query)
        {
            var result = await _service.GetUserAsync(query);
            return Ok(new ApiResponse<PagedResultDto<UserListItemDto>>
            {
                Success = true,
                Data = result
            });
        }

        [HttpGet("users/{id}")]
        public async Task<IActionResult> GetUser(Guid id)
        {
            var result = await _service.GetUserByIdAsync(id);
            if (!result.IsSuccess) return NotFound(new ApiResponse<UserDetailDto> { Success = false, Message = result.Message });

            return Ok(new ApiResponse<UserDetailDto>
            {
                Success = true,
                Data = result.Data
            });
        }

        [HttpPost("users")]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(new ApiResponse<object> { Success = false, Message = "D? li?u không h?p l?", Errors = ModelState });

            var result = await _service.CreateUserAsync(dto);
            if (!result.IsSuccess)
                return BadRequest(new ApiResponse<object> { Success = false, Message = result.Message });

            return Ok(new ApiResponse<UserDetailDto>
            {
                Success = true,
                Message = result.Message,
                Data = result.Data
            });
        }

        [HttpPut("users/{id}")]
        public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UpdateUserDto dto)
        {
            if (id != dto.UserId)
                return BadRequest(new ApiResponse<object> { Success = false, Message = "User ID không kh?p" });

            if (!ModelState.IsValid)
                return BadRequest(new ApiResponse<object> { Success = false, Message = "D? li?u không h?p l?", Errors = ModelState });

            var result = await _service.UpdateUserAsync(dto);
            if (!result.IsSuccess)
                return BadRequest(new ApiResponse<object> { Success = false, Message = result.Message });

            return Ok(new ApiResponse<UserDetailDto>
            {
                Success = true,
                Message = result.Message,
                Data = result.Data
            });
        }

        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            var result = await _service.DeleteUserAsync(id);
            if (!result.IsSuccess)
                return BadRequest(new ApiResponse<object> { Success = false, Message = result.Message });

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = result.Message
            });
        }

        [HttpPost("users/toggle-status")]
        public async Task<IActionResult> ToggleStatus([FromBody] ToggleUserStatusDto dto)
        {
            var result = await _service.ToggleUserStatusAsync(dto);
            if (!result.IsSuccess)
                return BadRequest(new ApiResponse<object> { Success = false, Message = result.Message });

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = result.Message
            });
        }

        [HttpPost("users/{userId}/reset-password")]
        public async Task<IActionResult> ResetPassword(Guid userId)
        {
            var result = await _service.ResetPasswordAsync(userId);
            if (!result.IsSuccess)
                return BadRequest(new ApiResponse<string> { Success = false, Message = result.Message });

            return Ok(new ApiResponse<string>
            {
                Success = true,
                Message = result.Message,
                Data = result.Data // M?t kh?u m?i
            });
        }

        [HttpPost("users/import")]
        public async Task<IActionResult> ImportUsers(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new ApiResponse<object> { Success = false, Message = "Vui lòng ch?n file Excel." });

            if (!file.FileName.EndsWith(".xlsx"))
                return BadRequest(new ApiResponse<object> { Success = false, Message = "Ch? ch?p nh?n file .xlsx" });

            using var stream = file.OpenReadStream();
            var result = await _service.ImportUsersFromExcelAsync(stream);

            if (!result.IsSuccess)
                return BadRequest(new ApiResponse<object> { Success = false, Message = result.Message });

            return Ok(new ApiResponse<ImportUserResultDto>
            {
                Success = true,
                Message = result.Message,
                Data = result.Data
            });
        }
    }
}
