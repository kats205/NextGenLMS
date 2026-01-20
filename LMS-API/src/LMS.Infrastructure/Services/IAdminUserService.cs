using LMS.Application.Admin;
using LMS.Application.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Infrastructure.Services
{
    public interface IAdminUserService
    {
        Task<PagedResultDto<UserListItemDto>> GetUserAsync(UserQueryParams query);
        Task<ServiceResult<UserDetailDto>> GetUserByIdAsync(Guid userId);
        Task<ServiceResult<UserDetailDto>> CreateUserAsync(CreateUserDto dto);
        Task<ServiceResult<UserDetailDto>> UpdateUserAsync(UpdateUserDto dto);
        Task<ServiceResult<bool>> DeleteUserAsync(Guid userId);
        Task<ServiceResult<bool>> ToggleUserStatusAsync(ToggleUserStatusDto dto);
        Task<ServiceResult<string>> ResetPasswordAsync(Guid userId);
    }
}
