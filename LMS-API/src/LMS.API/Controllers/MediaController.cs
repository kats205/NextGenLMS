using LMS.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using static LMS.Application.Common.ServiceResult;

namespace LMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MediaController : ControllerBase
    {
        private readonly IFileStorageService _fileStorageService;

        public MediaController(IFileStorageService fileStorageService)
        {
            _fileStorageService = fileStorageService;
        }

        /// <summary>
        /// Get optimized URL for media files
        /// </summary>
        [HttpGet("optimize")]
        public async Task<IActionResult> GetOptimizedUrl(
            [FromQuery] string originalUrl,
            [FromQuery] int? width = null,
            [FromQuery] int? height = null,
            [FromQuery] int? quality = null)
        {
            if (string.IsNullOrEmpty(originalUrl))
            {
                return BadRequest(ApiResponse.FailureResponse("Original URL is required"));
            }

            try
            {
                var optimizedUrl = await _fileStorageService.GetOptimizedUrlAsync(originalUrl, width, height, quality);
                
                return Ok(ApiResponse<object>.SuccessResponse(new
                {
                    originalUrl,
                    optimizedUrl,
                    transformations = new
                    {
                        width,
                        height,
                        quality
                    }
                }));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.FailureResponse("Failed to optimize URL", ex.Message));
            }
        }

        /// <summary>
        /// Upload and get optimized URLs for different sizes
        /// </summary>
        [HttpPost("upload-with-variants")]
        public async Task<IActionResult> UploadWithVariants(IFormFile file, [FromQuery] string folderName = "media")
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(ApiResponse.FailureResponse("File is required"));
            }

            try
            {
                string originalUrl;

                // Determine file type and upload accordingly
                var contentType = file.ContentType.ToLower();
                if (contentType.StartsWith("image/"))
                {
                    originalUrl = await _fileStorageService.UploadImageAsync(file, folderName);
                }
                else if (contentType.StartsWith("video/"))
                {
                    originalUrl = await _fileStorageService.UploadVideoAsync(file, folderName);
                }
                else
                {
                    originalUrl = await _fileStorageService.UploadFileAsync(file, folderName);
                }

                // Generate optimized variants
                var variants = new
                {
                    original = originalUrl,
                    thumbnail = await _fileStorageService.GetOptimizedUrlAsync(originalUrl, 150, 150, 80),
                    small = await _fileStorageService.GetOptimizedUrlAsync(originalUrl, 400, 300, 85),
                    medium = await _fileStorageService.GetOptimizedUrlAsync(originalUrl, 800, 600, 90),
                    large = await _fileStorageService.GetOptimizedUrlAsync(originalUrl, 1200, 900, 95)
                };

                return Ok(ApiResponse<object>.SuccessResponse(variants, "File uploaded successfully with variants"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.FailureResponse("Upload failed", ex.Message));
            }
        }
    }
}