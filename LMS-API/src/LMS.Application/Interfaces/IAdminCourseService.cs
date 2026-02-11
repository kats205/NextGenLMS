using LMS.Application.DTOs.Admin;
using LMS.Application.DTOs.Common;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LMS.Application.Interfaces
{
    public interface IAdminCourseService
    {
        Task<ServiceResult<PagedResultDto<AdminCourseDto>>> GetCoursesAsync(AdminCourseFilterDto filter);
        Task<ServiceResult<AdminCourseDetailDto>> GetCourseByIdAsync(Guid id);
        Task<ServiceResult<AdminCourseDto>> CreateCourseAsync(AdminCreateCourseDto dto);
        Task<ServiceResult<AdminCourseDto>> UpdateCourseAsync(Guid id, AdminUpdateCourseDto dto);
        Task<ServiceResult> DeleteCourseAsync(Guid id);
        Task<ServiceResult> AssignLecturerAsync(Guid courseId, Guid lecturerId);
        Task<ServiceResult<AdminCourseStatisticsDto>> GetCourseStatisticsAsync(Guid courseId);
        Task<ServiceResult> RemoveLecturerAsync(Guid courseId, Guid lecturerId);
        Task<ServiceResult> SetPrimaryLecturerAsync(Guid courseId, Guid lecturerId);
        Task<ServiceResult<byte[]>> ExportStudentsExcelAsync(LMS.Application.DTOs.Admin.ExportStudentsRequestDto request);
    }
}
