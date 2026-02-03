using LMS.Application.Interfaces;
using LMS.Domain.Entities.System;
using LMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace LMS.Infrastructure.Services
{
    public class MasterDataService : IMasterDataService
    {
        private readonly AppDbContext _db;

        public MasterDataService(AppDbContext db)
        {
            _db = db;
        }

        #region Departments
        public async Task<List<Department>> GetDepartmentsAsync()
        {
            return await _db.Departments
                .Where(d => !d.IsDeleted)
                .Include(d => d.Majors.Where(m => !m.IsDeleted))
                .ToListAsync();
        }

        public async Task<Department?> GetDepartmentByIdAsync(Guid id)
        {
            return await _db.Departments
                .Include(d => d.Majors.Where(m => !m.IsDeleted))
                .FirstOrDefaultAsync(d => d.Id == id && !d.IsDeleted);
        }

        public async Task<Department> CreateDepartmentAsync(Department department)
        {
            department.CreatedAt = DateTime.UtcNow;
            _db.Departments.Add(department);
            await _db.SaveChangesAsync();
            return department;
        }

        public async Task UpdateDepartmentAsync(Department department)
        {
            var existing = await _db.Departments.FindAsync(department.Id);
            if (existing != null)
            {
                existing.Name = department.Name;
                existing.Code = department.Code;
                existing.UpdatedAt = DateTime.UtcNow;
                await _db.SaveChangesAsync();
            }
        }

        public async Task DeleteDepartmentAsync(Guid id)
        {
            var dept = await _db.Departments.FindAsync(id);
            if (dept != null)
            {
                dept.IsDeleted = true;
                await _db.SaveChangesAsync();
            }
        }
        #endregion

        #region Majors
        public async Task<List<Major>> GetMajorsAsync()
        {
            return await _db.Majors
                .Include(m => m.Department)
                .Where(m => !m.IsDeleted && !m.Department.IsDeleted)
                .ToListAsync();
        }

        public async Task<List<Major>> GetMajorsByDepartmentAsync(Guid departmentId)
        {
            return await _db.Majors
                .Where(m => m.DepartmentId == departmentId && !m.IsDeleted)
                .ToListAsync();
        }

        public async Task<Major> CreateMajorAsync(Major major)
        {
            major.CreatedAt = DateTime.UtcNow;
            _db.Majors.Add(major);
            await _db.SaveChangesAsync();
            return major;
        }

        public async Task UpdateMajorAsync(Major major)
        {
            var existing = await _db.Majors.FindAsync(major.Id);
            if (existing != null)
            {
                existing.Name = major.Name;
                existing.DepartmentId = major.DepartmentId;
                existing.UpdatedAt = DateTime.UtcNow;
                await _db.SaveChangesAsync();
            }
        }

        public async Task DeleteMajorAsync(Guid id)
        {
            var major = await _db.Majors.FindAsync(id);
            if (major != null)
            {
                major.IsDeleted = true;
                await _db.SaveChangesAsync();
            }
        }
        #endregion

        #region Academic Years
        public async Task<List<AcademicYear>> GetAcademicYearsAsync()
        {
            return await _db.AcademicYears
                .Where(a => !a.IsDeleted)
                .OrderByDescending(a => a.StartDate)
                .ToListAsync();
        }

        public async Task<AcademicYear> CreateAcademicYearAsync(AcademicYear year)
        {
            year.CreatedAt = DateTime.UtcNow;
            _db.AcademicYears.Add(year);
            await _db.SaveChangesAsync();
            return year;
        }

        public async Task UpdateAcademicYearAsync(AcademicYear year)
        {
            var existing = await _db.AcademicYears.FindAsync(year.Id);
            if (existing != null)
            {
                existing.Name = year.Name;
                existing.StartDate = year.StartDate;
                existing.EndDate = year.EndDate;
                existing.UpdatedAt = DateTime.UtcNow;
                await _db.SaveChangesAsync();
            }
        }

        public async Task DeleteAcademicYearAsync(Guid id)
        {
            var year = await _db.AcademicYears.FindAsync(id);
            if (year != null)
            {
                year.IsDeleted = true;
                await _db.SaveChangesAsync();
            }
        }
        #endregion

        #region Semesters
        public async Task<List<Semester>> GetSemestersAsync()
        {
            return await _db.Semesters
                .Where(s => !s.IsDeleted)
                .ToListAsync();
        }

        public async Task<Semester> CreateSemesterAsync(Semester semester)
        {
            semester.CreatedAt = DateTime.UtcNow;
            _db.Semesters.Add(semester);
            await _db.SaveChangesAsync();
            return semester;
        }

        public async Task UpdateSemesterAsync(Semester semester)
        {
            var existing = await _db.Semesters.FindAsync(semester.Id);
            if (existing != null)
            {
                existing.Name = semester.Name;
                existing.UpdatedAt = DateTime.UtcNow;
                await _db.SaveChangesAsync();
            }
        }

        public async Task DeleteSemesterAsync(Guid id)
        {
            var sem = await _db.Semesters.FindAsync(id);
            if (sem != null)
            {
                sem.IsDeleted = true; // Make sure BaseEntity has IsDeleted
                await _db.SaveChangesAsync();
            }
        }
        #endregion
    }
}
