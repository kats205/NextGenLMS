using LMS.Application.Interfaces;
using LMS.Domain.Entities.System;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using static LMS.Application.DTOs.Common.ServiceResult;

namespace LMS.API.Controllers
{
    [ApiController]
    [Route("api/master-data")]
    public class MasterDataController : ControllerBase
    {
        private readonly IMasterDataService _service;

        public MasterDataController(IMasterDataService service)
        {
            _service = service;
        }

        // Departments
        [HttpGet("departments")]
        public async Task<IActionResult> GetDepartments()
        {
            var data = await _service.GetDepartmentsAsync();
            return Ok(new ApiResponse<List<Department>> { Success = true, Data = data });
        }

        [HttpGet("departments/{id}")]
        public async Task<IActionResult> GetDepartment(Guid id)
        {
            var data = await _service.GetDepartmentByIdAsync(id);
            if (data == null) 
                return NotFound(new ApiResponse<object> { Success = false, Message = "Không tìm thấy khoa/bộ môn" });
                
            return Ok(new ApiResponse<Department> { Success = true, Data = data });
        }

        [HttpPost("departments")]
        public async Task<IActionResult> CreateDepartment([FromBody] Department department)
        {
            var data = await _service.CreateDepartmentAsync(department);
            return Ok(new ApiResponse<Department> { Success = true, Data = data, Message = "Tạo khoa thành công" });
        }

        [HttpPut("departments/{id}")]
        public async Task<IActionResult> UpdateDepartment(Guid id, [FromBody] Department department)
        {
            if (id != department.Id) 
                return BadRequest(new ApiResponse<object> { Success = false, Message = "ID không khớp" });

            try 
            {
                await _service.UpdateDepartmentAsync(department);
                return Ok(new ApiResponse<object> { Success = true, Message = "Cập nhật thành công" });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new ApiResponse<object> { Success = false, Message = ex.Message });
            }
        }

        [HttpDelete("departments/{id}")]
        public async Task<IActionResult> DeleteDepartment(Guid id)
        {
            await _service.DeleteDepartmentAsync(id);
            return Ok(new ApiResponse<object> { Success = true, Message = "Xóa thành công" });
        }

        // Majors
        [HttpGet("majors")]
        public async Task<IActionResult> GetMajors()
        {
            var data = await _service.GetMajorsAsync();
            return Ok(new ApiResponse<List<Major>> { Success = true, Data = data });
        }

        [HttpGet("departments/{departmentId}/majors")]
        public async Task<IActionResult> GetMajorsByDepartment(Guid departmentId)
        {
            var data = await _service.GetMajorsByDepartmentAsync(departmentId);
            return Ok(new ApiResponse<List<Major>> { Success = true, Data = data });
        }

        [HttpPost("majors")]
        public async Task<IActionResult> CreateMajor([FromBody] Major major)
        {
            var data = await _service.CreateMajorAsync(major);
            return Ok(new ApiResponse<Major> { Success = true, Data = data });
        }

        [HttpPut("majors/{id}")]
        public async Task<IActionResult> UpdateMajor(Guid id, [FromBody] Major major)
        {
            if (id != major.Id) return BadRequest();
            await _service.UpdateMajorAsync(major);
            return Ok(new ApiResponse<object> { Success = true });
        }

        [HttpDelete("majors/{id}")]
        public async Task<IActionResult> DeleteMajor(Guid id)
        {
            await _service.DeleteMajorAsync(id);
            return Ok(new ApiResponse<object> { Success = true });
        }

        // Academic Years
        [HttpGet("academic-years")]
        public async Task<IActionResult> GetAcademicYears()
        {
            var data = await _service.GetAcademicYearsAsync();
            return Ok(new ApiResponse<List<AcademicYear>> { Success = true, Data = data });
        }

        [HttpPost("academic-years")]
        public async Task<IActionResult> CreateAcademicYear([FromBody] AcademicYear year)
        {
            var data = await _service.CreateAcademicYearAsync(year);
            return Ok(new ApiResponse<AcademicYear> { Success = true, Data = data });
        }

        [HttpDelete("academic-years/{id}")]
        public async Task<IActionResult> DeleteAcademicYear(Guid id)
        {
            await _service.DeleteAcademicYearAsync(id);
            return Ok(new ApiResponse<object> { Success = true, Message = "Xóa năm học thành công" });
        }

        // Semesters
        [HttpGet("semesters")]
        public async Task<IActionResult> GetSemesters()
        {
            var data = await _service.GetSemestersAsync();
            return Ok(new ApiResponse<List<Semester>> { Success = true, Data = data });
        }

        [HttpPost("semesters")]
        public async Task<IActionResult> CreateSemester([FromBody] Semester semester)
        {
            var data = await _service.CreateSemesterAsync(semester);
            return Ok(new ApiResponse<Semester> { Success = true, Data = data });
        }

        [HttpDelete("semesters/{id}")]
        public async Task<IActionResult> DeleteSemester(Guid id)
        {
            await _service.DeleteSemesterAsync(id);
            return Ok(new ApiResponse<object> { Success = true, Message = "Xóa học kỳ thành công" });
        }
    }
}
