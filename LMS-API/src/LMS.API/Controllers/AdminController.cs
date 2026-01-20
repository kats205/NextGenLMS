using LMS.Application.Admin;
using LMS.Domain.Constant;
using LMS.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LMS.API.Controllers
{
    [Authorize(Roles = UserRoles.Admin)]
    [ApiController]
    [Route("api/admin/users")]
    public class AdminController: ControllerBase
    {
        private readonly IAdminUserService _service;

        public AdminController(IAdminUserService service) => _service = service;

        [HttpGet]
        public async Task<IActionResult> GetUsers([FromQuery] UserQueryParams query)
        {
            var result = await _service.GetUserAsync(query);
            return Ok(result);
        }
    }
}
