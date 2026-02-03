using LMS.Application.DTOs.Admin;
using LMS.Application.DTOs.Common;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LMS.Application.Interfaces
{
    public interface ICourseConfigService
    {
        Task<ServiceResult<List<DepartmentDto>>> getDepartmentList();
        Task<ServiceResult<List<MajorDto>>> getMajorList();
        Task<ServiceResult<List<SemesterDto>>> getSemesterList();
        Task<ServiceResult<List<AcademicYearDto>>> getAcademicYearList();
    }
}
