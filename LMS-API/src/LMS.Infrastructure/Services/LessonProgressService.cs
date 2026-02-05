using LMS.Application.Common;
using LMS.Application.Interfaces;
using LMS.Domain.Entities.Assessment;
using LMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using static LMS.Application.Common.ServiceResult;

namespace LMS.Infrastructure.Services
{
    public class LessonProgressService : ILessonProgressService
    {
        private readonly AppDbContext _context;

        public LessonProgressService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ServiceResult<LessonProgressDto?>> CheckLessonProgressAsync(Guid lessonId, Guid userId)
        {
            try
            {
                var lesson = await _context.Lessons
                    .FirstOrDefaultAsync(l => l.Id == lessonId && !l.IsDeleted);

                if (lesson == null)
                {
                    return ServiceResult<LessonProgressDto?>.Failure("Không tìm thấy bài giảng");
                }

                var progress = await _context.LessonProgresses
                    .FirstOrDefaultAsync(lp => lp.LessonId == lessonId && lp.UserId == userId && !lp.IsDeleted);

                // Return null if no progress exists (don't create)
                if (progress == null)
                {
                    return ServiceResult<LessonProgressDto?>.Success(null);
                }

                return ServiceResult<LessonProgressDto?>.Success(MapToDto(progress));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] CheckLessonProgressAsync: {ex.Message}");
                Console.WriteLine($"[ERROR] Stack Trace: {ex.StackTrace}");
                return ServiceResult<LessonProgressDto?>.Failure("Có lỗi xảy ra khi kiểm tra tiến độ bài giảng", ex.Message);
            }
        }

        public async Task<ServiceResult<LessonProgressDto>> GetLessonProgressAsync(Guid lessonId, Guid userId)
        {
            try
            {
                var lesson = await _context.Lessons
                    .FirstOrDefaultAsync(l => l.Id == lessonId && !l.IsDeleted);

                if (lesson == null)
                {
                    return ServiceResult<LessonProgressDto>.Failure("Không tìm thấy bài giảng");
                }

                var progress = await _context.LessonProgresses
                    .FirstOrDefaultAsync(lp => lp.LessonId == lessonId && lp.UserId == userId && !lp.IsDeleted);

                if (progress == null)
                {
                    // Tạo record mới nếu chưa tồn tại (lần đầu mở lesson)
                    progress = new LessonProgress
                    {
                        Id = Guid.NewGuid(),
                        LessonId = lessonId,
                        UserId = userId,
                        VideoProgressSeconds = 0,
                        DurationLastAccesstSeconds = 0,
                        IsCompleted = false,
                        LastAccess = DateTime.UtcNow,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = null,
                        IsDeleted = false
                    };

                    _context.LessonProgresses.Add(progress);
                    await _context.SaveChangesAsync();
                }
                else
                {
                    // Cập nhật LastAccess khi truy cập
                    progress.LastAccess = DateTime.UtcNow;
                    _context.LessonProgresses.Update(progress);
                    await _context.SaveChangesAsync();
                }

                return ServiceResult<LessonProgressDto>.Success(MapToDto(progress));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] GetLessonProgressAsync: {ex.Message}");
                Console.WriteLine($"[ERROR] Stack Trace: {ex.StackTrace}");
                return ServiceResult<LessonProgressDto>.Failure("Có lỗi xảy ra khi lấy tiến độ bài giảng", ex.Message);
            }
        }

        public async Task<ServiceResult<LessonProgressDto>> UpdateProgressAsync(Guid lessonId, UpdateLessonProgressDto updateDto, Guid userId)
        {
            try
            {
                var lesson = await _context.Lessons
                    .FirstOrDefaultAsync(l => l.Id == lessonId && !l.IsDeleted);

                if (lesson == null)
                {
                    return ServiceResult<LessonProgressDto>.Failure("Không tìm thấy bài giảng");
                }

                var progress = await _context.LessonProgresses
                    .FirstOrDefaultAsync(lp => lp.LessonId == lessonId && lp.UserId == userId && !lp.IsDeleted);

                if (progress == null)
                {
                    // Tạo record mới nếu chưa tồn tại
                    progress = new LessonProgress
                    {
                        Id = Guid.NewGuid(),
                        LessonId = lessonId,
                        UserId = userId,
                        VideoProgressSeconds = updateDto.VideoProgressSeconds,
                        DurationLastAccesstSeconds = updateDto.DurationLastAccessSeconds,
                        IsCompleted = updateDto.IsCompleted ?? false,
                        LastAccess = DateTime.UtcNow,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow,
                        IsDeleted = false
                    };

                    _context.LessonProgresses.Add(progress);
                    await _context.SaveChangesAsync();
                }
                else
                {
                    // Cập nhật record hiện tại
                    progress.VideoProgressSeconds = updateDto.VideoProgressSeconds;
                    progress.DurationLastAccesstSeconds = updateDto.DurationLastAccessSeconds;
                    progress.LastAccess = DateTime.UtcNow;
                    if (updateDto.IsCompleted.HasValue)
                    {
                        progress.IsCompleted = updateDto.IsCompleted.Value;
                    }
                    progress.UpdatedAt = DateTime.UtcNow;
                    
                    _context.LessonProgresses.Update(progress);
                    await _context.SaveChangesAsync();
                }

                return ServiceResult<LessonProgressDto>.Success(MapToDto(progress), "Cập nhật tiến độ thành công");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] UpdateProgressAsync: {ex.Message}");
                Console.WriteLine($"[ERROR] Stack Trace: {ex.StackTrace}");
                return ServiceResult<LessonProgressDto>.Failure("Có lỗi xảy ra khi cập nhật tiến độ", ex.Message);
            }
        }

        public async Task<ServiceResult<LessonProgressDto>> MarkLessonCompleteAsync(Guid lessonId, Guid userId)
        {
            try
            {
                var lesson = await _context.Lessons
                    .FirstOrDefaultAsync(l => l.Id == lessonId && !l.IsDeleted);

                if (lesson == null)
                {
                    return ServiceResult<LessonProgressDto>.Failure("Không tìm thấy bài giảng");
                }

                var progress = await _context.LessonProgresses
                    .FirstOrDefaultAsync(lp => lp.LessonId == lessonId && lp.UserId == userId && !lp.IsDeleted);

                if (progress == null)
                {
                    // Tạo record mới nếu chưa tồn tại
                    progress = new LessonProgress
                    {
                        Id = Guid.NewGuid(),
                        LessonId = lessonId,
                        UserId = userId,
                        VideoProgressSeconds = lesson.DurationSeconds,
                        IsCompleted = true,
                        LastAccess = DateTime.UtcNow,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow,
                        IsDeleted = false
                    };

                    _context.LessonProgresses.Add(progress);
                    await _context.SaveChangesAsync();
                }
                else
                {
                    // Cập nhật record hiện tại
                    progress.IsCompleted = true;
                    progress.VideoProgressSeconds = lesson.DurationSeconds;
                    progress.LastAccess = DateTime.UtcNow;
                    progress.UpdatedAt = DateTime.UtcNow;
                    
                    _context.LessonProgresses.Update(progress);
                    await _context.SaveChangesAsync();
                }

                return ServiceResult<LessonProgressDto>.Success(MapToDto(progress), "Đánh dấu hoàn thành thành công");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] MarkLessonCompleteAsync: {ex.Message}");
                Console.WriteLine($"[ERROR] Stack Trace: {ex.StackTrace}");
                return ServiceResult<LessonProgressDto>.Failure("Có lỗi xảy ra khi đánh dấu hoàn thành", ex.Message);
            }
        }

        public async Task<ServiceResult<bool>> DeleteProgressAsync(Guid lessonId, Guid userId)
        {
            try
            {
                var progress = await _context.LessonProgresses
                    .FirstOrDefaultAsync(lp => lp.LessonId == lessonId && lp.UserId == userId && !lp.IsDeleted);

                if (progress == null)
                {
                    return ServiceResult<bool>.Failure("Không tìm thấy tiến độ bài giảng");
                }

                progress.IsDeleted = true;
                progress.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return ServiceResult<bool>.Success(true, "Xóa tiến độ thành công");
            }
            catch (Exception ex)
            {
                return ServiceResult<bool>.Failure("Có lỗi xảy ra khi xóa tiến độ", ex.Message);
            }
        }

        private LessonProgressDto MapToDto(LessonProgress progress)
        {
            return new LessonProgressDto
            {
                Id = progress.Id,
                UserId = progress.UserId,
                LessonId = progress.LessonId,
                VideoProgressSeconds = progress.VideoProgressSeconds,
                DurationLastAccessSeconds = progress.DurationLastAccesstSeconds, // Match với property name
                IsCompleted = progress.IsCompleted,
                LastAccess = progress.LastAccess,
                CreatedAt = progress.CreatedAt,
                UpdatedAt = progress.UpdatedAt
            };
        }
    }
}
