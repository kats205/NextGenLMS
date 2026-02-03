using LMS.Application.Common.Interfaces;
using LMS.Domain.Entities.System;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LMS.API.Controllers
{
    [ApiController]
    [Route("api/master-data")]
    [Authorize(Policy = "AdminOnly")] // Only Admin can manage Master Data
    public class MasterDataController : ControllerBase
    {
        private readonly IMasterDataService _service;

        public MasterDataController(IMasterDataService service)
        {
            _service = service;
        }

        #region Departments
        [HttpGet("departments")]
        public async Task<IActionResult> GetDepartments()
        {
            var data = await _service.GetDepartmentsAsync();
            return Ok(new { success = true, data });
        }

        [HttpPost("departments")]
        public async Task<IActionResult> CreateDepartment([FromBody] Department dept)
        {
            var data = await _service.CreateDepartmentAsync(dept);
            return Ok(new { success = true, data });
        }

        [HttpPut("departments/{id}")]
        public async Task<IActionResult> UpdateDepartment(Guid id, [FromBody] Department dept)
        {
            dept.Id = id;
            await _service.UpdateDepartmentAsync(dept);
            return Ok(new { success = true, message = "Updated successfully" });
        }

        [HttpDelete("departments/{id}")]
        public async Task<IActionResult> DeleteDepartment(Guid id)
        {
            await _service.DeleteDepartmentAsync(id);
            return Ok(new { success = true, message = "Deleted successfully" });
        }
        #endregion

        #region Majors
        [HttpGet("majors")]
        public async Task<IActionResult> GetMajors()
        {
            var data = await _service.GetMajorsAsync();
            return Ok(new { success = true, data });
        }

        [HttpPost("majors")]
        public async Task<IActionResult> CreateMajor([FromBody] Major major)
        {
            var data = await _service.CreateMajorAsync(major);
            return Ok(new { success = true, data });
        }

        [HttpPut("majors/{id}")]
        public async Task<IActionResult> UpdateMajor(Guid id, [FromBody] Major major)
        {
            major.Id = id;
            await _service.UpdateMajorAsync(major);
            return Ok(new { success = true, message = "Updated successfully" });
        }

        [HttpDelete("majors/{id}")]
        public async Task<IActionResult> DeleteMajor(Guid id)
        {
            await _service.DeleteMajorAsync(id);
            return Ok(new { success = true, message = "Deleted successfully" });
        }
        #endregion

        #region AcademicYears
        [HttpGet("academic-years")]
        public async Task<IActionResult> GetAcademicYears()
        {
            var data = await _service.GetAcademicYearsAsync();
            return Ok(new { success = true, data });
        }

        [HttpPost("academic-years")]
        public async Task<IActionResult> CreateAcademicYear([FromBody] AcademicYear year)
        {
            var data = await _service.CreateAcademicYearAsync(year);
            return Ok(new { success = true, data });
        }

        [HttpPut("academic-years/{id}")]
        public async Task<IActionResult> UpdateAcademicYear(Guid id, [FromBody] AcademicYear year)
        {
            year.Id = id;
            await _service.UpdateAcademicYearAsync(year);
            return Ok(new { success = true, message = "Updated successfully" });
        }

        [HttpDelete("academic-years/{id}")]
        public async Task<IActionResult> DeleteAcademicYear(Guid id)
        {
            await _service.DeleteAcademicYearAsync(id);
            return Ok(new { success = true, message = "Deleted successfully" });
        }
        #endregion

        #region Semesters
        [HttpGet("semesters")]
        public async Task<IActionResult> GetSemesters()
        {
            var data = await _service.GetSemestersAsync();
            return Ok(new { success = true, data });
        }

        [HttpPost("semesters")]
        public async Task<IActionResult> CreateSemester([FromBody] Semester semester)
        {
            var data = await _service.CreateSemesterAsync(semester);
            return Ok(new { success = true, data });
        }

        [HttpPut("semesters/{id}")]
        public async Task<IActionResult> UpdateSemester(Guid id, [FromBody] Semester semester)
        {
            semester.Id = id;
            await _service.UpdateSemesterAsync(semester);
            return Ok(new { success = true, message = "Updated successfully" });
        }

        [HttpDelete("semesters/{id}")]
        public async Task<IActionResult> DeleteSemester(Guid id)
        {
            await _service.DeleteSemesterAsync(id);
            return Ok(new { success = true, message = "Deleted successfully" });
        }
        #endregion
    }
}
