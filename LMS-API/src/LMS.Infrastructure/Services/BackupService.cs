using LMS.Application.Interfaces;
using LMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Infrastructure.Services
{
    public class BackupService : IBackUpService
    {
        private readonly AppDbContext _context;

        public BackupService(AppDbContext context)
        {
            _context = context;
        }
        public async Task<string> PerformBackupAsync()
        {
            // 1. Tạo tên file và đường dẫn
            string backupFolder = @"D:\NextGenLMS_Backups"; // Đường dẫn tuyệt đối trên Server
            if (!Directory.Exists(backupFolder)) Directory.CreateDirectory(backupFolder);

            string fileName = $"Backup_NextGenLMS_{DateTime.Now:yyyyMMdd_HHmmss}.bak";
            string backupPath = Path.Combine(backupFolder, fileName);
            string dbName = "NextGenLMS_Db"; // Tên database của bạn trong SQL Server

            // 2. Câu lệnh SQL Backup
            // WITH FORMAT: Ghi đè file nếu trùng tên (dù ta đã random tên)
            // WITH INIT: Khởi tạo lại media set
            string sqlCommand = $@"
            BACKUP DATABASE [{dbName}] 
            TO DISK = '{backupPath}' 
            WITH FORMAT, MEDIANAME = 'Z_SQLServerBackups', NAME = 'Full Backup of {dbName}';";

            // 3. Thực thi lệnh
            // Lưu ý: Cần dùng ExecuteSqlRawAsync vì đây là lệnh DDL/Admin
            await _context.Database.ExecuteSqlRawAsync(sqlCommand);

            return backupPath;
        }
    }
}
