using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Application.DTOs.Common
{
    public class DepartmentDto
    {
        public Guid id { get; set; }

        public string departmentName { get; set; } = string.Empty;

        public string departmentCode { get; set; } = string.Empty;

    };

    public class MajorDto
    {
        public Guid id { get; set; }

        public string name { get; set; } = string.Empty;

        public Guid departmentId { get; set; }

        public string departmentName { get; set; } = string.Empty;
    }
}
