using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using LMS.Application.Common;
using LMS.Application.Interfaces;
using System.Security.Claims;

namespace LMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [AllowAnonymous]
    public class LessonProgressController : ControllerBase
    {
        private readonly ILessonProgressService _lessonProgressService;

        public LessonProgressController(ILessonProgressService lessonProgressService)
        {
            _lessonProgressService = lessonProgressService;
        }

        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim != null && Guid.TryParse(userIdClaim.Value, out var userId))
            {
                return userId;
            }
            
            // For testing purposes, return a hardcoded user ID
            // TODO: Remove this in production
            return Guid.Parse("11111111-1111-1111-1111-111111111111");
        }

        [HttpGet("{lessonId}")]
        public async Task<IActionResult> GetProgress(Guid lessonId)
        {
            var userId = GetCurrentUserId();

            var result = await _lessonProgressService.GetLessonProgressAsync(lessonId, userId);
            
            var apiResponse = new
            {
                success = result.IsSuccess,
                message = result.Message,
                data = result.Data,
                errors = result.Errors?.Count > 0 ? result.Errors : null
            };
            
            return result.IsSuccess ? Ok(apiResponse) : BadRequest(apiResponse);
        }

        [HttpGet("{lessonId}/check")]
        public async Task<IActionResult> CheckProgress(Guid lessonId)
        {
            var userId = GetCurrentUserId();

            var result = await _lessonProgressService.CheckLessonProgressAsync(lessonId, userId);
            
            var apiResponse = new
            {
                success = result.IsSuccess,
                message = result.Message,
                data = result.Data,
                errors = result.Errors?.Count > 0 ? result.Errors : null
            };
            
            return result.IsSuccess ? Ok(apiResponse) : BadRequest(apiResponse);
        }

        [HttpPut("{lessonId}")]
        public async Task<IActionResult> UpdateProgress(Guid lessonId, [FromBody] UpdateLessonProgressDto updateDto)
        {
            var userId = GetCurrentUserId();

            var result = await _lessonProgressService.UpdateProgressAsync(lessonId, updateDto, userId);
            
            var apiResponse = new
            {
                success = result.IsSuccess,
                message = result.Message,
                data = result.Data,
                errors = result.Errors?.Count > 0 ? result.Errors : null
            };
            
            return result.IsSuccess ? Ok(apiResponse) : BadRequest(apiResponse);
        }

        [HttpPost("{lessonId}/complete")]
        public async Task<IActionResult> MarkComplete(Guid lessonId)
        {
            var userId = GetCurrentUserId();

            var result = await _lessonProgressService.MarkLessonCompleteAsync(lessonId, userId);
            
            // Convert ServiceResult to ApiResponse to match frontend expectations
            var apiResponse = new
            {
                success = result.IsSuccess,
                message = result.Message,
                data = result.Data,
                errors = result.Errors?.Count > 0 ? result.Errors : null
            };
            
            return result.IsSuccess ? Ok(apiResponse) : BadRequest(apiResponse);
        }

        [HttpDelete("{lessonId}")]
        public async Task<IActionResult> DeleteProgress(Guid lessonId)
        {
            var userId = GetCurrentUserId();

            var result = await _lessonProgressService.DeleteProgressAsync(lessonId, userId);
            
            var apiResponse = new
            {
                success = result.IsSuccess,
                message = result.Message,
                data = result.Data,
                errors = result.Errors?.Count > 0 ? result.Errors : null
            };
            
            return result.IsSuccess ? Ok(apiResponse) : BadRequest(apiResponse);
        }
    }
}
