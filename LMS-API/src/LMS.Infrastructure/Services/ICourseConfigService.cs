using LMS.Application.DTOs.Admin;
using LMS.Application.DTOs.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Infrastructure.Services
{
    public interface ICourseConfigService
    {
        public Task<ServiceResult<List<DepartmentDto>>> getDepartmentList();

        public Task<ServiceResult<List<MajorDto>>> getMajorList();

        public Task<ServiceResult<List<SemesterDto>>> getSemesterList();

        public Task<ServiceResult<List<AcademicYearDto>>> getAcademicYearList();

    }
}
