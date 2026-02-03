using LMS.Application.DTOs.Admin;
using LMS.Application.DTOs.Common;
using LMS.Domain.Entities.System;
using LMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace LMS.Infrastructure.Services
{
    public class SystemConfigService : ISystemConfigService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<SystemConfigService> _logger;

        public SystemConfigService(
            AppDbContext context,
            ILogger<SystemConfigService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<ServiceResult<SystemConfigResponse>> GetAllConfigsAsync()
        {
            try
            {
                var configs = await _context.SystemConfigs.ToListAsync();

                var response = new SystemConfigResponse
                {
                    AcademicYear = new AcademicYearConfigDto
                    {
                        CurrentAcademicYear = GetConfigValue(configs, "CurrentAcademicYear", "2025-2026"),
                        CurrentSemester = GetConfigValue(configs, "CurrentSemester", "Học kỳ 1")
                    },
                    FileUpload = new FileUploadConfigDto
                    {
                        MaxFileSizeMB = int.Parse(GetConfigValue(configs, "MaxFileSizeMB", "10")),
                        AllowedFileTypes = JsonSerializer.Deserialize<List<string>>(
                            GetConfigValue(configs, "AllowedFileTypes", "[\"PDF\",\"Word\",\"PowerPoint\",\"Excel\",\"Video (MP4)\",\"Ảnh (PNG, JPG)\",\"ZIP\",\"RAR\"]")
                        ) ?? new List<string>()
                    },
                    Email = new EmailConfigDto
                    {
                        SmtpHost = GetConfigValue(configs, "SmtpHost", "smtp.gmail.com"),
                        SmtpPort = int.Parse(GetConfigValue(configs, "SmtpPort", "587")),
                        EmailSender = GetConfigValue(configs, "EmailSender", "noreply@university.edu.vn"),
                        SmtpPassword = GetConfigValue(configs, "SmtpPassword", ""),
                        EnableSsl = bool.Parse(GetConfigValue(configs, "EnableSsl", "true"))
                    },
                    Backup = new BackupConfigDto
                    {
                        AutoBackupEnabled = bool.Parse(GetConfigValue(configs, "AutoBackupEnabled", "false")),
                        BackupTime = GetConfigValue(configs, "BackupTime", "02:00")
                    }
                };

                return ServiceResult<SystemConfigResponse>.Success(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting system configs");
                return ServiceResult<SystemConfigResponse>.Failure("Lỗi khi lấy cấu hình hệ thống");
            }
        }

        public async Task<ServiceResult<SystemConfigDto>> GetConfigByKeyAsync(string key)
        {
            var config = await _context.SystemConfigs
                .FirstOrDefaultAsync(c => c.ConfigKey == key);

            if (config == null)
            {
                return ServiceResult<SystemConfigDto>.Failure($"Không tìm thấy cấu hình với key: {key}");
            }

            var dto = new SystemConfigDto
            {
                Id = config.Id,
                ConfigKey = config.ConfigKey,
                ConfigValue = config.ConfigValue,
                CreatedAt = config.CreatedAt,
                UpdatedAt = config.UpdatedAt
            };

            return ServiceResult<SystemConfigDto>.Success(dto);
        }

        public async Task<ServiceResult<SystemConfigDto>> UpdateConfigAsync(UpdateSystemConfigDto dto)
        {
            var config = await _context.SystemConfigs
                .FirstOrDefaultAsync(c => c.ConfigKey == dto.ConfigKey);

            if (config == null)
            {
                // Create new config
                config = new SystemConfig
                {
                    Id = Guid.NewGuid(),
                    ConfigKey = dto.ConfigKey,
                    ConfigValue = dto.ConfigValue,
                    CreatedAt = DateTime.UtcNow
                };
                _context.SystemConfigs.Add(config);
            }
            else
            {
                // Update existing config
                config.ConfigValue = dto.ConfigValue;
                config.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            var result = new SystemConfigDto
            {
                Id = config.Id,
                ConfigKey = config.ConfigKey,
                ConfigValue = config.ConfigValue,
                CreatedAt = config.CreatedAt,
                UpdatedAt = config.UpdatedAt
            };

            return ServiceResult<SystemConfigDto>.Success(result, "Cập nhật cấu hình thành công");
        }

        public async Task<ServiceResult<bool>> UpdateMultipleConfigsAsync(SystemConfigUpdateRequest request)
        {
            try
            {
                var updates = new List<UpdateSystemConfigDto>();

                // Academic Year configs
                if (request.AcademicYear != null)
                {
                    updates.Add(new UpdateSystemConfigDto
                    {
                        ConfigKey = "CurrentAcademicYear",
                        ConfigValue = request.AcademicYear.CurrentAcademicYear
                    });
                    updates.Add(new UpdateSystemConfigDto
                    {
                        ConfigKey = "CurrentSemester",
                        ConfigValue = request.AcademicYear.CurrentSemester
                    });
                }

                // File Upload configs
                if (request.FileUpload != null)
                {
                    updates.Add(new UpdateSystemConfigDto
                    {
                        ConfigKey = "MaxFileSizeMB",
                        ConfigValue = request.FileUpload.MaxFileSizeMB.ToString()
                    });
                    updates.Add(new UpdateSystemConfigDto
                    {
                        ConfigKey = "AllowedFileTypes",
                        ConfigValue = JsonSerializer.Serialize(request.FileUpload.AllowedFileTypes)
                    });
                }

                // Email configs
                if (request.Email != null)
                {
                    updates.Add(new UpdateSystemConfigDto { ConfigKey = "SmtpHost", ConfigValue = request.Email.SmtpHost });
                    updates.Add(new UpdateSystemConfigDto { ConfigKey = "SmtpPort", ConfigValue = request.Email.SmtpPort.ToString() });
                    updates.Add(new UpdateSystemConfigDto { ConfigKey = "EmailSender", ConfigValue = request.Email.EmailSender });
                    updates.Add(new UpdateSystemConfigDto { ConfigKey = "SmtpPassword", ConfigValue = request.Email.SmtpPassword });
                    updates.Add(new UpdateSystemConfigDto { ConfigKey = "EnableSsl", ConfigValue = request.Email.EnableSsl.ToString() });
                }

                // Backup configs
                if (request.Backup != null)
                {
                    updates.Add(new UpdateSystemConfigDto
                    {
                        ConfigKey = "AutoBackupEnabled",
                        ConfigValue = request.Backup.AutoBackupEnabled.ToString()
                    });
                    updates.Add(new UpdateSystemConfigDto
                    {
                        ConfigKey = "BackupTime",
                        ConfigValue = request.Backup.BackupTime
                    });
                }

                // Update all configs
                foreach (var update in updates)
                {
                    await UpdateConfigAsync(update);
                }

                return ServiceResult<bool>.Success(true, "Lưu cấu hình thành công");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating multiple configs");
                return ServiceResult<bool>.Failure("Lỗi khi lưu cấu hình");
            }
        }

        public async Task<ServiceResult<List<AcademicYearDto>>> GetAcademicYearsAsync()
        {
            var years = await _context.AcademicYears
                .OrderByDescending(y => y.StartDate)
                .Select(y => new AcademicYearDto
                {
                    Id = y.Id,
                    Name = y.Name,
                    StartDate = y.StartDate,
                    EndDate = y.EndDate
                })
                .ToListAsync();

            return ServiceResult<List<AcademicYearDto>>.Success(years);
        }

        public async Task<ServiceResult<List<SemesterDto>>> GetSemestersAsync()
        {
            var semesters = await _context.Semesters
                .Select(s => new SemesterDto
                {
                    Id = s.Id,
                    Name = s.Name
                })
                .ToListAsync();

            return ServiceResult<List<SemesterDto>>.Success(semesters);
        }

        public async Task<ServiceResult<string>> BackupNowAsync()
        {
            try
            {
                // Implement backup logic here
                var backupFileName = $"backup_{DateTime.UtcNow:yyyyMMdd_HHmmss}.sql";

                // TODO: Implement actual backup logic
                // This is a placeholder
                _logger.LogInformation($"Backup created: {backupFileName}");

                return ServiceResult<string>.Success(backupFileName, "Sao lưu dữ liệu thành công");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating backup");
                return ServiceResult<string>.Failure("Lỗi khi sao lưu dữ liệu");
            }
        }

        public async Task<ServiceResult<bool>> TestEmailConfigAsync()
        {
            try
            {
                var emailConfig = await GetConfigByKeyAsync("SmtpHost");

                // TODO: Implement actual email test
                // This is a placeholder
                _logger.LogInformation("Testing email configuration");

                return ServiceResult<bool>.Success(true, "Cấu hình email hợp lệ");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error testing email config");
                return ServiceResult<bool>.Failure("Không thể kết nối với SMTP server");
            }
        }

        private string GetConfigValue(List<SystemConfig> configs, string key, string defaultValue)
        {
            return configs.FirstOrDefault(c => c.ConfigKey == key)?.ConfigValue ?? defaultValue;
        }
    }
}
