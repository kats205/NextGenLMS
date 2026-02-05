using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using LMS.Application.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using System.Text.RegularExpressions;

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

        public async Task<string> GetOptimizedUrlAsync(string originalUrl, int? width = null, int? height = null, int? quality = null)
        {
            if (string.IsNullOrEmpty(originalUrl))
                return originalUrl;

            // Check if URL is from Cloudinary
            if (!IsCloudinaryUrl(originalUrl))
                return originalUrl;

            try
            {
                // Extract public ID from Cloudinary URL
                var publicId = ExtractPublicIdFromUrl(originalUrl);
                if (string.IsNullOrEmpty(publicId))
                    return originalUrl;

                // Build transformation
                var transformation = new Transformation();

                // Apply quality optimization
                if (quality.HasValue && quality.Value > 0 && quality.Value <= 100)
                {
                    transformation = transformation.Quality(quality.Value);
                }
                else
                {
                    transformation = transformation.Quality("auto");
                }

                // Apply dimensions
                if (width.HasValue && height.HasValue)
                {
                    transformation = transformation.Width(width.Value).Height(height.Value).Crop("fill");
                }
                else if (width.HasValue)
                {
                    transformation = transformation.Width(width.Value).Crop("scale");
                }
                else if (height.HasValue)
                {
                    transformation = transformation.Height(height.Value).Crop("scale");
                }

                // Apply format optimization
                transformation = transformation.FetchFormat("auto");

                // Determine resource type from URL
                var resourceType = DetermineResourceType(originalUrl);

                // Generate optimized URL
                string optimizedUrl;
                if (resourceType == "video")
                {
                    optimizedUrl = _cloudinary.Api.UrlVideoUp.Transform(transformation).BuildUrl(publicId);
                }
                else
                {
                    optimizedUrl = _cloudinary.Api.UrlImgUp.Transform(transformation).BuildUrl(publicId);
                }

                return await Task.FromResult(optimizedUrl);
            }
            catch (Exception ex)
            {
                // Log error and return original URL as fallback
                Console.WriteLine($"Error optimizing URL: {ex.Message}");
                return originalUrl;
            }
        }

        private static bool IsCloudinaryUrl(string url)
        {
            return url.Contains("cloudinary.com") || url.Contains("res.cloudinary.com");
        }

        private static string ExtractPublicIdFromUrl(string url)
        {
            try
            {
                // Pattern to extract public ID from Cloudinary URL
                // Example: https://res.cloudinary.com/demo/image/upload/v1234567890/folder/filename.jpg
                var pattern = @"(?:image|video|raw)/upload/(?:v\d+/)?(.+?)(?:\.[^.]+)?$";
                var match = Regex.Match(url, pattern);
                
                if (match.Success)
                {
                    return match.Groups[1].Value;
                }

                return string.Empty;
            }
            catch
            {
                return string.Empty;
            }
        }

        private static string DetermineResourceType(string url)
        {
            if (url.Contains("/video/upload/"))
                return "video";
            else if (url.Contains("/image/upload/"))
                return "image";
            else if (url.Contains("/raw/upload/"))
                return "raw";
            
            return "image"; // Default to image
        }
    }
}
