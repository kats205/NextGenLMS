using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using LMS.Application.Common;
using LMS.Application.Interfaces;
using LMS.Infrastructure.Data;
using LMS.Domain.Entities.Content;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using LMS.Application.DTOs.Common;

namespace LMS.Infrastructure.Services
{
    public class CourseProgressService : ICourseProgressService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<CourseProgressService> _logger;

        public CourseProgressService(AppDbContext context, ILogger<CourseProgressService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<ServiceResult<CourseProgressDto>> GetCourseProgressAsync(string courseId, string userId)
        {
            try
            {
                _logger.LogInformation("Getting course progress for course {CourseId} and user {UserId}", courseId, userId);

                // Parse string IDs to Guid
                if (!Guid.TryParse(courseId, out var courseGuid))
                {
                    return ServiceResult<CourseProgressDto>.Failure("ID khóa học không hợp lệ");
                }

                if (!Guid.TryParse(userId, out var userGuid))
                {
                    return ServiceResult<CourseProgressDto>.Failure("ID người dùng không hợp lệ");
                }

                // Get total lessons in the course
                var totalLessons = await _context.CourseContents
                    .Where(c => c.Chapter.CourseId == courseGuid && c.Type == ContentType.Lesson)
                    .CountAsync();

                _logger.LogInformation("Found {TotalLessons} total lessons in course {CourseId}", totalLessons, courseId);

                if (totalLessons == 0)
                {
                    return ServiceResult<CourseProgressDto>.Success(new CourseProgressDto
                    {
                        CourseId = courseId,
                        TotalLessons = 0,
                        CompletedLessons = 0,
                        ProgressPercentage = 0,
                        LastAccessedAt = null
                    });
                }

                // Get completed lessons for this user
                var completedLessons = await _context.LessonProgresses
                    .Where(lp => lp.UserId == userGuid && 
                                lp.IsCompleted == true &&
                                lp.Lesson.Chapter.CourseId == courseGuid)
                    .CountAsync();

                _logger.LogInformation("Found {CompletedLessons} completed lessons for user {UserId} in course {CourseId}", 
                    completedLessons, userId, courseId);

                // Get last accessed time
                var lastAccessed = await _context.LessonProgresses
                    .Where(lp => lp.UserId == userGuid && 
                                lp.Lesson.Chapter.CourseId == courseGuid)
                    .OrderByDescending(lp => lp.UpdatedAt)
                    .Select(lp => lp.UpdatedAt)
                    .FirstOrDefaultAsync();

                var progressPercentage = totalLessons > 0 ? 
                    Math.Round((double)completedLessons / totalLessons * 100, 1) : 0;

                _logger.LogInformation("Calculated progress: {CompletedLessons}/{TotalLessons} = {ProgressPercentage}%", 
                    completedLessons, totalLessons, progressPercentage);

                var result = new CourseProgressDto
                {
                    CourseId = courseId,
                    TotalLessons = totalLessons,
                    CompletedLessons = completedLessons,
                    ProgressPercentage = progressPercentage,
                    LastAccessedAt = lastAccessed
                };

                return ServiceResult<CourseProgressDto>.Success(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting course progress for course {CourseId} and user {UserId}", courseId, userId);
                return ServiceResult<CourseProgressDto>.Failure("Có lỗi xảy ra khi lấy tiến độ khóa học");
            }
        }

        public async Task<ServiceResult<List<CourseProgressDto>>> GetMyCoursesProgressAsync(string userId)
        {
            try
            {
                _logger.LogInformation("Getting courses progress for user {UserId}", userId);

                // Parse string ID to Guid
                if (!Guid.TryParse(userId, out var userGuid))
                {
                    return ServiceResult<List<CourseProgressDto>>.Failure("ID người dùng không hợp lệ");
                }

                // Get all courses the user is enrolled in
                var enrolledCourses = await _context.CourseStudents
                    .Where(cs => cs.StudentId == userGuid)
                    .Select(cs => cs.CourseId.ToString())
                    .ToListAsync();

                _logger.LogInformation("Found {CourseCount} enrolled courses for user {UserId}: {CourseIds}", 
                    enrolledCourses.Count, userId, string.Join(", ", enrolledCourses));

                var progressList = new List<CourseProgressDto>();

                foreach (var courseId in enrolledCourses)
                {
                    var progressResult = await GetCourseProgressAsync(courseId, userId);
                    if (progressResult.IsSuccess && progressResult.Data != null)
                    {
                        progressList.Add(progressResult.Data);
                        _logger.LogInformation("Added progress for course {CourseId}: {Progress}%", 
                            courseId, progressResult.Data.ProgressPercentage);
                    }
                    else
                    {
                        _logger.LogWarning("Failed to get progress for course {CourseId}: {Message}", 
                            courseId, progressResult.Message);
                    }
                }

                _logger.LogInformation("Returning {ProgressCount} course progress records", progressList.Count);
                return ServiceResult<List<CourseProgressDto>>.Success(progressList);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting courses progress for user {UserId}", userId);
                return ServiceResult<List<CourseProgressDto>>.Failure("Có lỗi xảy ra khi lấy tiến độ các khóa học");
            }
        }
    }
}