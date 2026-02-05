using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using LMS.Application.Common;

namespace LMS.Application.Interfaces
{
    public interface ICourseProgressService
    {
        Task<ServiceResult<CourseProgressDto>> GetCourseProgressAsync(string courseId, string userId);
        Task<ServiceResult<List<CourseProgressDto>>> GetMyCoursesProgressAsync(string userId);
    }
}