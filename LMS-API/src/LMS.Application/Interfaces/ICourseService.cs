using LMS.Application.Common;
using LMS.Application.DTOs.Common;

namespace LMS.Application.Interfaces
{
    public interface ICourseService
    {
        // CRUD Operations
        Task<ServiceResult<CourseDto>> CreateCourseAsync(CreateCourseDto createDto, Guid currentUserId);
        Task<ServiceResult<CourseDto>> UpdateCourseAsync(Guid courseId, UpdateCourseDto updateDto, Guid currentUserId);
        Task<ServiceResult<bool>> DeleteCourseAsync(Guid courseId, Guid currentUserId);
        Task<ServiceResult<CourseDetailDto>> GetCourseByIdAsync(Guid courseId, Guid currentUserId);

        // List Operations
        Task<ServiceResult<List<CourseDto>>> GetAllCoursesAsync(Guid currentUserId);
        Task<ServiceResult<List<CourseDto>>> GetCoursesByLecturerAsync(Guid lecturerId, Guid currentUserId);
        Task<ServiceResult<List<CourseDto>>> GetCoursesByStudentAsync(Guid studentId);

        // Student Enrollment
        Task<ServiceResult<bool>> EnrollStudentsAsync(Guid courseId, EnrollStudentDto enrollDto, Guid currentUserId);
        Task<ServiceResult<bool>> RemoveStudentFromCourseAsync(Guid courseId, Guid studentId, Guid currentUserId);

        // Validation
        Task<bool> IsCourseExistsAsync(Guid courseId);
        Task<bool> IsUserEnrolledInCourseAsync(Guid courseId, Guid studentId);
        Task<bool> CanUserAccessCourseAsync(Guid courseId, Guid userId, string userRole);
    }
}