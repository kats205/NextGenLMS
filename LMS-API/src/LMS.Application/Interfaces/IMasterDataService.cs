using LMS.Domain.Entities.System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LMS.Application.Interfaces
{
    public interface IMasterDataService
    {
        // Departments
        Task<List<Department>> GetDepartmentsAsync();
        Task<Department?> GetDepartmentByIdAsync(Guid id);
        Task<Department> CreateDepartmentAsync(Department department);
        Task UpdateDepartmentAsync(Department department);
        Task DeleteDepartmentAsync(Guid id);

        // Majors
        Task<List<Major>> GetMajorsAsync();
        Task<List<Major>> GetMajorsByDepartmentAsync(Guid departmentId);
        Task<Major> CreateMajorAsync(Major major);
        Task UpdateMajorAsync(Major major);
        Task DeleteMajorAsync(Guid id);

        // Academic Years
        Task<List<AcademicYear>> GetAcademicYearsAsync();
        Task<AcademicYear> CreateAcademicYearAsync(AcademicYear year);
        Task UpdateAcademicYearAsync(AcademicYear year);
        Task DeleteAcademicYearAsync(Guid id);

        // Semesters
        Task<List<Semester>> GetSemestersAsync();
        Task<Semester> CreateSemesterAsync(Semester semester);
        Task UpdateSemesterAsync(Semester semester);
        Task DeleteSemesterAsync(Guid id);
    }
}
