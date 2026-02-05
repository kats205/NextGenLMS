using LMS.Application.Common;

namespace LMS.Application.Interfaces
{
    public interface ILessonProgressService
    {
        Task<ServiceResult<LessonProgressDto>> GetLessonProgressAsync(Guid lessonId, Guid userId);
        Task<ServiceResult<LessonProgressDto?>> CheckLessonProgressAsync(Guid lessonId, Guid userId); // New method - only check, don't create
        Task<ServiceResult<LessonProgressDto>> UpdateProgressAsync(Guid lessonId, UpdateLessonProgressDto updateDto, Guid userId);
        Task<ServiceResult<LessonProgressDto>> MarkLessonCompleteAsync(Guid lessonId, Guid userId);
        Task<ServiceResult<bool>> DeleteProgressAsync(Guid lessonId, Guid userId);
    }
}
