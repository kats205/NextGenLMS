using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Application.DTOs.Admin
{
    public class SystemConfigDto
    {
        public Guid Id { get; set; }
        public string ConfigKey { get; set; } = string.Empty;
        public string ConfigValue { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class UpdateSystemConfigDto
    {
        public string ConfigKey { get; set; } = string.Empty;
        public string ConfigValue { get; set; } = string.Empty;
    }

    public class AcademicYearConfigDto
    {
        public string CurrentAcademicYear { get; set; } = string.Empty;
        public string CurrentSemester { get; set; } = string.Empty;
    }

    public class FileUploadConfigDto
    {
        public int MaxFileSizeMB { get; set; } = 10;
        public List<string> AllowedFileTypes { get; set; } = new();
    }

    public class EmailConfigDto
    {
        public string SmtpHost { get; set; } = string.Empty;
        public int SmtpPort { get; set; } = 587;
        public string EmailSender { get; set; } = string.Empty;
        public string SmtpPassword { get; set; } = string.Empty;
        public bool EnableSsl { get; set; } = true;
    }

    public class BackupConfigDto
    {
        public bool AutoBackupEnabled { get; set; } = false;
        public string BackupTime { get; set; } = "02:00"; // 2:00 AM
    }

    public class SystemConfigUpdateRequest
    {
        public AcademicYearConfigDto? AcademicYear { get; set; }
        public FileUploadConfigDto? FileUpload { get; set; }
        public EmailConfigDto? Email { get; set; }
        public BackupConfigDto? Backup { get; set; }
    }

    public class SystemConfigResponse
    {
        public AcademicYearConfigDto AcademicYear { get; set; } = new();
        public FileUploadConfigDto FileUpload { get; set; } = new();
        public EmailConfigDto Email { get; set; } = new();
        public BackupConfigDto Backup { get; set; } = new();
    }

    public class AcademicYearDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
    }

    public class SemesterDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }
}
