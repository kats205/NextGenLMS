using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Application.Lecturer
{
    public class PublishDto
    {
        public bool IsPublished { get; set; }
    }

    public class ReorderDto
    {
        [Required]
        public List<Guid> Ids { get; set; } = new();
    }

    public class EnrollStudentDto
    {
        [Required]
        [EmailAddress]
        public string StudentEmail { get; set; } = string.Empty;
    }

    public class CourseFilterDto : PaginationDto
    {
        public Guid? SemesterId { get; set; }
        public Guid? AcademicYearId { get; set; }
        public string? Search { get; set; }
    }

    public class PaginationDto
    {
        public int Page { get; set; } = 1;
        public int Limit { get; set; } = 10;
        public string? SortBy { get; set; }
        public string? SortOrder { get; set; } = "asc";
    }
}
