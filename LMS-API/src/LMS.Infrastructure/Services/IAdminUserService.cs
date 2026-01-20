using LMS.Application.Admin;
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
    }
}
