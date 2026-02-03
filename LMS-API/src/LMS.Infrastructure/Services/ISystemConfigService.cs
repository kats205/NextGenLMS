using LMS.Application.DTOs.Admin;
using LMS.Application.DTOs.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Infrastructure.Services
{
    public interface ISystemConfigService
    {
        Task<ServiceResult<SystemConfigResponse>> GetAllConfigsAsync();

        Task<ServiceResult<SystemConfigDto>> GetConfigByKeyAsync(string key);

        Task<ServiceResult<SystemConfigDto>> UpdateConfigAsync(UpdateSystemConfigDto dto);

        Task<ServiceResult<bool>> UpdateMultipleConfigsAsync(SystemConfigUpdateRequest request);

        Task<ServiceResult<List<AcademicYearDto>>> GetAcademicYearsAsync();
        Task<ServiceResult<List<SemesterDto>>> GetSemestersAsync();

        Task<ServiceResult<string>> BackupNowAsync();
        Task<ServiceResult<bool>> TestEmailConfigAsync();
    }
}
