using Microsoft.AspNetCore.Http;

namespace LMS.Application.Interfaces
{
    public interface IFileStorageService
    {
        /// <summary>
        /// Upload an image file to cloud storage
        /// </summary>
        /// <param name="file">The image file to upload</param>
        /// <param name="folderName">The folder/category name in cloud storage</param>
        /// <returns>The public URL of the uploaded image</returns>
        Task<string> UploadImageAsync(IFormFile file, string folderName);

        /// <summary>
        /// Upload a video file to cloud storage
        /// </summary>
        /// <param name="file">The video file to upload</param>
        /// <param name="folderName">The folder/category name in cloud storage</param>
        /// <returns>The public URL of the uploaded video</returns>
        Task<string> UploadVideoAsync(IFormFile file, string folderName);

        /// <summary>
        /// Upload any file (PDF, document, etc.) to cloud storage
        /// </summary>
        /// <param name="file">The file to upload</param>
        /// <param name="folderName">The folder/category name in cloud storage</param>
        /// <returns>The public URL of the uploaded file</returns>
        Task<string> UploadFileAsync(IFormFile file, string folderName);

        /// <summary>
        /// Delete a file from cloud storage by its public ID
        /// </summary>
        /// <param name="publicId">The public ID of the file in cloud storage</param>
        Task DeleteFileAsync(string publicId);

        /// <summary>
        /// Get optimized URL for media files with optional transformations
        /// </summary>
        /// <param name="originalUrl">The original URL from cloud storage</param>
        /// <param name="width">Optional width for image/video optimization</param>
        /// <param name="height">Optional height for image/video optimization</param>
        /// <param name="quality">Optional quality setting (1-100)</param>
        /// <returns>Optimized URL with transformations applied</returns>
        Task<string> GetOptimizedUrlAsync(string originalUrl, int? width = null, int? height = null, int? quality = null);
    }
}
