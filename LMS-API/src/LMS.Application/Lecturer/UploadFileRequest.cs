using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Application.Lecturer
{
    public class UploadFileRequest
    {
        public IFormFile File { get; set; } = default!;
        public string Type { get; set; } = string.Empty;
    }
}
