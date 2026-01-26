using LMS.Application.DTOs.Admin; // Import DTOs namespace
using LMS.Application.DTOs.Common;
using LMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace LMS.Infrastructure.Services
{
    public class CourseConfigService : ICourseConfigService
    {
        private readonly AppDbContext _db;

        public CourseConfigService(AppDbContext db) => _db = db;

        // 1. Get Department List
        public async Task<ServiceResult<List<DepartmentDto>>> getDepartmentList()
        {
            try
            {
                if (!await _db.Departments.AnyAsync())
                {
                    return ServiceResult<List<DepartmentDto>>.Failure("Hệ thống chưa có khoa nào");
                }

                var list = await _db.Departments
                    .AsNoTracking() 
                    .OrderBy(d => d.Name) 
                    .Select(d => new DepartmentDto
                    {
                        id = d.Id,
                        departmentCode = d.Code,
                        departmentName = d.Name
                    }).ToListAsync();

                return ServiceResult<List<DepartmentDto>>.Success(list);
            }
            catch (Exception ex)
            {
                return ServiceResult<List<DepartmentDto>>.Failure("Lỗi tải danh sách khoa", ex.Message);
            }
        }

        // 2. Get Major List
        public async Task<ServiceResult<List<MajorDto>>> getMajorList()
        {
            try
            {
                if (!await _db.Majors.AnyAsync())
                {
                    return ServiceResult<List<MajorDto>>.Failure("No majors");
                }

                var list = await _db.Majors
                    .AsNoTracking()
                    .Include(m => m.Department)
                    .OrderBy(m => m.Name)
                    .Select(m => new MajorDto
                    {
                        id = m.Id,
                        name = m.Name,
                        departmentId = m.DepartmentId,
                        departmentName = m.Department.Name != null ? m.Name : "N/A"
                    })
                    .ToListAsync();
                return ServiceResult<List<MajorDto>>.Success(list);
            }

            catch(Exception ex)
            {
                return ServiceResult<List<MajorDto>>.Failure("Error when uploading majors", ex.Message);
            }
        }

        // 3. Get Semester List (Đã hoàn thiện)
        public async Task<ServiceResult<List<SemesterDto>>> getSemesterList()
        {
            try
            {
                if (!await _db.Semesters.AnyAsync())
                {
                    return ServiceResult<List<SemesterDto>>.Failure("Hệ thống chưa có học kỳ nào");
                }

                var list = await _db.Semesters
                    .AsNoTracking()
                    // Giả sử sắp xếp theo tên hoặc logic business (ví dụ: Học kỳ 1, 2, 3)
                    .OrderBy(s => s.Name)
                    .Select(s => new SemesterDto
                    {
                        Id = s.Id,
                        Name = s.Name
                    })
                    .ToListAsync();

                return ServiceResult<List<SemesterDto>>.Success(list);
            }
            catch (Exception ex)
            {
                return ServiceResult<List<SemesterDto>>.Failure("Lỗi khi tải danh sách học kỳ", ex.Message);
            }
        }

        // 4. Get Academic Year List (Đã hoàn thiện)
        public async Task<ServiceResult<List<AcademicYearDto>>> getAcademicYearList()
        {
            try
            {
                if (!await _db.AcademicYears.AnyAsync())
                {
                    return ServiceResult<List<AcademicYearDto>>.Failure("Hệ thống chưa có năm học nào");
                }

                var list = await _db.AcademicYears
                    .AsNoTracking()
                    .OrderByDescending(y => y.StartDate) // Năm học mới nhất lên đầu
                    .Select(y => new AcademicYearDto
                    {
                        Id = y.Id,
                        Name = y.Name,
                        StartDate = y.StartDate,
                        EndDate = y.EndDate
                    })
                    .ToListAsync();

                return ServiceResult<List<AcademicYearDto>>.Success(list);
            }
            catch (Exception ex)
            {
                return ServiceResult<List<AcademicYearDto>>.Failure("Lỗi khi tải danh sách năm học", ex.Message);
            }
        }
    }
}