using LMS.Application.Admin;
using LMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Infrastructure.Services
{
    public class AdminUserService : IAdminUserService
    {
        private readonly AppDbContext _db;

        public AdminUserService(AppDbContext db) => _db = db;

        public async Task<PagedResultDto<UserListItemDto>> GetUserAsync(UserQueryParams q)
        {
            var query = _db.AppUsers.AsQueryable();

            if (!string.IsNullOrWhiteSpace(q.Search))
            {
                var s = q.Search.Trim().ToLower();
                query = query.Where(u =>
                u.FullName.ToLower().Contains(s)
                || u.Email.ToLower().Contains(s)
                );
            }

            if(!string.IsNullOrWhiteSpace(q.Role) && q.Role != "all")
            {
                query = query.Where(u => u.Role.ToString().ToLower() == q.Role.ToLower());
            }

            var totalItems = await query.CountAsync();

            var page = Math.Max(q.Page, 1);
            var pageSize = Math.Clamp(q.PageSize, 1, 100);
            var skip = (page - 1) * pageSize;

            var items = await query
                .OrderByDescending(u => u.FullName)
                .Skip(skip)
                .Take(pageSize)
                .Select(u => new UserListItemDto
                {
                    Id = u.Id,
                    FullName = u.FullName,
                    Email = u.Email,
                    Role = u.Role.RoleName.ToString(),
                    Department = u.Department.Name,
                    Status = u.IsActive ? "active" : "inactive"
                }).ToListAsync();

            return new PagedResultDto<UserListItemDto>
            {
                Items = items,
                Page = page,
                PageSize = pageSize,
                TotalItems = totalItems
            };
        }
    }
}
