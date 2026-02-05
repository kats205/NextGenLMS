using System.Collections.Generic;

namespace LMS.Application.DTOs.Admin
{
    public class ExportStudentsRequestDto
    {
        // If true, export all courses. Otherwise use CourseCodes.
        public bool ExportAll { get; set; }
        public List<string> CourseCodes { get; set; } = new List<string>();
    }
}
