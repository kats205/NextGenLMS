using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using LMS.Application.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

namespace LMS.Infrastructure.Services
{
    public class CloudinaryService : IFileStorageService
    {
        private readonly Cloudinary _cloudinary;

        public CloudinaryService(IConfiguration configuration)
        {
            var cloudName = configuration["Cloudinary:CloudName"];
            var apiKey = configuration["Cloudinary:ApiKey"];
            var apiSecret = configuration["Cloudinary:ApiSecret"];

            var account = new Account(cloudName, apiKey, apiSecret);
            _cloudinary = new Cloudinary(account);
            _cloudinary.Api.Secure = true;
        }

        public async Task<string> UploadImageAsync(IFormFile file, string folderName)
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("File is empty or null");

            await using var stream = file.OpenReadStream();
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(file.FileName, stream),
                Folder = $"nextgenlms/{folderName}",
                Transformation = new Transformation()
                    .Quality("auto")
                    .FetchFormat("auto")
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams);

            if (uploadResult.Error != null)
                throw new Exception($"Upload failed: {uploadResult.Error.Message}");

            return uploadResult.SecureUrl.ToString();
        }

        public async Task<string> UploadVideoAsync(IFormFile file, string folderName)
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("File is empty or null");

            await using var stream = file.OpenReadStream();
            var uploadParams = new VideoUploadParams
            {
                File = new FileDescription(file.FileName, stream),
                Folder = $"nextgenlms/{folderName}",
                EagerTransforms = new List<Transformation>
                {
                    new Transformation().Quality("auto")
                }
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams);

            if (uploadResult.Error != null)
                throw new Exception($"Upload failed: {uploadResult.Error.Message}");

            return uploadResult.SecureUrl.ToString();
        }

        public async Task<string> UploadFileAsync(IFormFile file, string folderName)
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("File is empty or null");

            await using var stream = file.OpenReadStream();
            var uploadParams = new RawUploadParams
            {
                File = new FileDescription(file.FileName, stream),
                Folder = $"nextgenlms/{folderName}"
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams);

            if (uploadResult.Error != null)
                throw new Exception($"Upload failed: {uploadResult.Error.Message}");

            return uploadResult.SecureUrl.ToString();
        }

        public async Task DeleteFileAsync(string publicId)
        {
            if (string.IsNullOrEmpty(publicId))
                throw new ArgumentException("Public ID is required");

            var deleteParams = new DeletionParams(publicId);
            var result = await _cloudinary.DestroyAsync(deleteParams);

            if (result.Error != null)
                throw new Exception($"Delete failed: {result.Error.Message}");
        }
    }
}
