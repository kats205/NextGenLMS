# CloudinaryService Documentation

## Overview
CloudinaryService provides cloud-based file storage and optimization capabilities using Cloudinary CDN. It supports uploading images, videos, and documents with automatic optimization and transformation features.

## Features

### File Upload
- **Images**: Automatic format optimization (WebP, AVIF) and quality adjustment
- **Videos**: Automatic compression and format optimization
- **Documents**: Raw file upload for PDFs and other documents

### URL Optimization
- **Dynamic Resizing**: On-the-fly image and video resizing
- **Quality Control**: Automatic or manual quality settings
- **Format Optimization**: Automatic format selection based on browser support
- **Responsive Images**: Generate multiple sizes for different devices

## Methods

### GetOptimizedUrlAsync
Transforms existing Cloudinary URLs with optimization parameters.

```csharp
Task<string> GetOptimizedUrlAsync(string originalUrl, int? width = null, int? height = null, int? quality = null)
```

#### Parameters
- `originalUrl`: The original Cloudinary URL
- `width`: Optional width in pixels
- `height`: Optional height in pixels  
- `quality`: Optional quality (1-100, or "auto")

#### Examples

```csharp
// Basic optimization (auto quality and format)
var optimized = await _fileStorageService.GetOptimizedUrlAsync(originalUrl);

// Resize to specific dimensions
var resized = await _fileStorageService.GetOptimizedUrlAsync(originalUrl, 800, 600);

// Resize with quality control
var compressed = await _fileStorageService.GetOptimizedUrlAsync(originalUrl, 400, 300, 80);

// Thumbnail generation
var thumbnail = await _fileStorageService.GetOptimizedUrlAsync(originalUrl, 150, 150, 70);
```

## URL Transformation Examples

### Original URL
```
https://res.cloudinary.com/demo/image/upload/v1234567890/nextgenlms/courses/sample.jpg
```

### Optimized Variants

#### Thumbnail (150x150, quality 70)
```
https://res.cloudinary.com/demo/image/upload/c_fill,h_150,q_70,w_150,f_auto/v1234567890/nextgenlms/courses/sample.jpg
```

#### Medium (800x600, quality 85)
```
https://res.cloudinary.com/demo/image/upload/c_fill,h_600,q_85,w_800,f_auto/v1234567890/nextgenlms/courses/sample.jpg
```

#### Auto-optimized (no dimensions)
```
https://res.cloudinary.com/demo/image/upload/q_auto,f_auto/v1234567890/nextgenlms/courses/sample.jpg
```

## Usage in CourseService

The CourseService automatically optimizes media URLs when returning course content:

```csharp
// Optimize thumbnail URLs
if (!string.IsNullOrEmpty(dto.ThumbnailUrl))
{
    dto.ThumbnailUrl = await _fileStorageService.GetOptimizedUrlAsync(dto.ThumbnailUrl, 400, 300);
}

// Optimize lesson media files
if (!string.IsNullOrEmpty(lesson.FileUrl) && (lesson.FileType == "Video" || lesson.FileType == "Image"))
{
    contentDto.FileUrl = await _fileStorageService.GetOptimizedUrlAsync(lesson.FileUrl);
}
```

## Supported Transformations

### Image Transformations
- **Resize**: `width`, `height` with `crop: fill`
- **Quality**: Auto or manual (1-100)
- **Format**: Auto-selection (WebP, AVIF, JPEG, PNG)
- **Compression**: Automatic optimization

### Video Transformations
- **Resize**: Video dimensions
- **Quality**: Bitrate optimization
- **Format**: Auto-selection (MP4, WebM)
- **Streaming**: Adaptive bitrate streaming

### Crop Modes
- **fill**: Resize and crop to exact dimensions
- **scale**: Resize maintaining aspect ratio
- **fit**: Fit within dimensions without cropping

## Error Handling

The service includes robust error handling:

```csharp
try
{
    var optimizedUrl = await _fileStorageService.GetOptimizedUrlAsync(originalUrl, 800, 600);
    // Use optimized URL
}
catch (Exception ex)
{
    // Falls back to original URL
    Console.WriteLine($"Optimization failed: {ex.Message}");
    // Use originalUrl as fallback
}
```

## Performance Benefits

### Bandwidth Savings
- **Auto Format**: Up to 50% smaller file sizes with WebP/AVIF
- **Quality Optimization**: 20-40% reduction with minimal quality loss
- **Responsive Images**: Serve appropriate sizes for different devices

### Loading Speed
- **CDN Delivery**: Global edge locations for fast delivery
- **Lazy Loading**: Progressive image loading
- **Caching**: Automatic browser and CDN caching

## Configuration

Ensure Cloudinary credentials are configured in `appsettings.json`:

```json
{
  "Cloudinary": {
    "CloudName": "your-cloud-name",
    "ApiKey": "your-api-key",
    "ApiSecret": "your-api-secret"
  }
}
```

## Best Practices

### Image Optimization
```csharp
// Course thumbnails
var thumbnail = await GetOptimizedUrlAsync(url, 400, 300, 85);

// User avatars
var avatar = await GetOptimizedUrlAsync(url, 150, 150, 80);

// Hero images
var hero = await GetOptimizedUrlAsync(url, 1200, 600, 90);
```

### Video Optimization
```csharp
// Video previews
var preview = await GetOptimizedUrlAsync(videoUrl, 800, 450, 80);

// Mobile videos
var mobile = await GetOptimizedUrlAsync(videoUrl, 480, 270, 75);
```

### Responsive Images
Generate multiple variants for responsive design:

```csharp
var variants = new
{
    small = await GetOptimizedUrlAsync(url, 400, 300),
    medium = await GetOptimizedUrlAsync(url, 800, 600),
    large = await GetOptimizedUrlAsync(url, 1200, 900)
};
```

## Testing

Use the MediaController endpoints to test optimization:

```http
GET /api/Media/optimize?originalUrl=https://res.cloudinary.com/demo/image/upload/sample.jpg&width=400&height=300&quality=80
```

This will return both original and optimized URLs for comparison.