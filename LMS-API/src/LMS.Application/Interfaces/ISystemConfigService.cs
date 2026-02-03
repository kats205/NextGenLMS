using LMS.Application.DTOs.Admin;
using LMS.Application.DTOs.Common;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LMS.Application.Interfaces
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
