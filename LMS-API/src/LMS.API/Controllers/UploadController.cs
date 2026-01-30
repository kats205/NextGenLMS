using LMS.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UploadController : ControllerBase
    {
        private readonly IFileStorageService _fileStorageService;

        public UploadController(IFileStorageService fileStorageService)
        {
            _fileStorageService = fileStorageService;
        }

        /// <summary>
        /// Upload an image file
        /// </summary>
        /// <param name="file">The image file to upload</param>
        /// <param name="folder">Optional folder name (default: images)</param>
        /// <returns>The URL of the uploaded image</returns>
        [HttpPost("image")]
        public async Task<IActionResult> UploadImage(IFormFile file, [FromQuery] string folder = "images")
        {
            try
            {
                if (file == null || file.Length == 0)
                    return BadRequest(new { success = false, message = "No file provided" });

                // Validate file type
                var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp" };
                if (!allowedTypes.Contains(file.ContentType.ToLower()))
                    return BadRequest(new { success = false, message = "Invalid image format. Allowed: JPG, PNG, GIF, WebP" });

                // Validate file size (max 10MB)
                if (file.Length > 10 * 1024 * 1024)
                    return BadRequest(new { success = false, message = "File size exceeds 10MB limit" });

                var url = await _fileStorageService.UploadImageAsync(file, folder);

                return Ok(new
                {
                    success = true,
                    message = "Image uploaded successfully",
                    data = new { url }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Upload a video file
        /// </summary>
        /// <param name="file">The video file to upload</param>
        /// <param name="folder">Optional folder name (default: videos)</param>
        /// <returns>The URL of the uploaded video</returns>
        [HttpPost("video")]
        public async Task<IActionResult> UploadVideo(IFormFile file, [FromQuery] string folder = "videos")
        {
            try
            {
                if (file == null || file.Length == 0)
                    return BadRequest(new { success = false, message = "No file provided" });

                // Validate file type
                var allowedTypes = new[] { "video/mp4", "video/mpeg", "video/quicktime", "video/x-msvideo", "video/webm" };
                if (!allowedTypes.Contains(file.ContentType.ToLower()))
                    return BadRequest(new { success = false, message = "Invalid video format. Allowed: MP4, MPEG, MOV, AVI, WebM" });

                // Validate file size (max 100MB)
                if (file.Length > 100 * 1024 * 1024)
                    return BadRequest(new { success = false, message = "File size exceeds 100MB limit" });

                var url = await _fileStorageService.UploadVideoAsync(file, folder);

                return Ok(new
                {
                    success = true,
                    message = "Video uploaded successfully",
                    data = new { url }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Upload a document/file (PDF, DOC, etc.)
        /// </summary>
        /// <param name="file">The file to upload</param>
        /// <param name="folder">Optional folder name (default: documents)</param>
        /// <returns>The URL of the uploaded file</returns>
        [HttpPost("document")]
        public async Task<IActionResult> UploadDocument(IFormFile file, [FromQuery] string folder = "documents")
        {
            try
            {
                if (file == null || file.Length == 0)
                    return BadRequest(new { success = false, message = "No file provided" });

                // Validate file type
                var allowedTypes = new[] { 
                    "application/pdf", 
                    "application/msword", 
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    "application/vnd.ms-excel",
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    "application/vnd.ms-powerpoint",
                    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                    "text/plain"
                };
                if (!allowedTypes.Contains(file.ContentType.ToLower()))
                    return BadRequest(new { success = false, message = "Invalid document format. Allowed: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT" });

                // Validate file size (max 50MB)
                if (file.Length > 50 * 1024 * 1024)
                    return BadRequest(new { success = false, message = "File size exceeds 50MB limit" });

                var url = await _fileStorageService.UploadFileAsync(file, folder);

                return Ok(new
                {
                    success = true,
                    message = "Document uploaded successfully",
                    data = new { url }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Delete a file by its public ID
        /// </summary>
        /// <param name="publicId">The Cloudinary public ID of the file</param>
        [HttpDelete]
        public async Task<IActionResult> DeleteFile([FromQuery] string publicId)
        {
            try
            {
                if (string.IsNullOrEmpty(publicId))
                    return BadRequest(new { success = false, message = "Public ID is required" });

                await _fileStorageService.DeleteFileAsync(publicId);

                return Ok(new
                {
                    success = true,
                    message = "File deleted successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
    }
}
