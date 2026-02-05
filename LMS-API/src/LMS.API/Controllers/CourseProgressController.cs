using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using LMS.Application.Common;
using LMS.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [AllowAnonymous]
    public class CourseProgressController : ControllerBase
    {
        private readonly ICourseProgressService _courseProgressService;

        public CourseProgressController(ICourseProgressService courseProgressService)
        {
            _courseProgressService = courseProgressService;
        }

        [HttpGet("{courseId}")]
        public async Task<ActionResult> GetCourseProgress(string courseId)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    // For testing purposes, use a hardcoded user ID
                    userId = "11111111-1111-1111-1111-111111111111";
                }

                var result = await _courseProgressService.GetCourseProgressAsync(courseId, userId);
                
                if (result.IsSuccess)
                {
                    return Ok(new { success = true, message = result.Message, data = result.Data });
                }
                
                return BadRequest(new { success = false, message = result.Message, data = (object?)null });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}", data = (object?)null });
            }
        }

        [HttpGet("my-courses")]
        public async Task<ActionResult> GetMyCoursesProgress()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    // For testing purposes, use a hardcoded user ID
                    userId = "11111111-1111-1111-1111-111111111111";
                }

                var result = await _courseProgressService.GetMyCoursesProgressAsync(userId);
                
                if (result.IsSuccess)
                {
                    return Ok(new { success = true, message = result.Message, data = result.Data });
                }
                
                return BadRequest(new { success = false, message = result.Message, data = (object?)null });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}", data = (object?)null });
            }
        }
    }
}