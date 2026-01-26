using LMS.Application.DTOs.Admin;
using LMS.Application.DTOs.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Infrastructure.Services
{
    public interface IAdminCourseService
    {
        Task<ServiceResult<PagedResultDto<CourseDto>>> GetCoursesAsync(CourseFilterDto filter);
        Task<ServiceResult<CourseDetailDto>> GetCourseByIdAsync(Guid id);
        Task<ServiceResult<CourseDto>> CreateCourseAsync(CreateCourseDto dto);
        Task<ServiceResult<CourseDto>> UpdateCourseAsync(Guid id, UpdateCourseDto dto);
        Task<ServiceResult> DeleteCourseAsync(Guid id);
        Task<ServiceResult> AssignLecturerAsync(Guid courseId, Guid lecturerId);
        Task<ServiceResult<CourseStatisticsDto>> GetCourseStatisticsAsync(Guid courseId);
    }
}
