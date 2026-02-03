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
    }
}
