using LMS.Application.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Infrastructure.Services
{
    public class BackupWorker : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;

        public BackupWorker(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                var now = DateTime.Now;

                // Kiểm tra: Nếu là 2:00 AM (có thể cho sai số trong 1 phút)
                if (now.Hour == 2 && now.Minute == 0)
                {
                    using (var scope = _serviceProvider.CreateScope())
                    {
                        var configService = scope.ServiceProvider.GetRequiredService<ISystemConfigService>();
                        var backupService = scope.ServiceProvider.GetRequiredService<IBackUpService>();

                        // Lấy cấu hình từ DB xem có đang BẬT không
                        var configResult = await configService.GetConfigByKeyAsync("AutoBackupEnabled");
                        var isAutoBackupOn = configResult.IsSuccess ? configResult.Data.ConfigValue : "false";

                        if (isAutoBackupOn == "true")
                        {
                            await backupService.PerformBackupAsync();
                            // Chờ 61 giây để tránh backup lặp lại trong cùng 1 phút đó
                            await Task.Delay(TimeSpan.FromSeconds(61), stoppingToken);
                        }
                    }
                }

                // Mỗi 30 giây kiểm tra 1 lần
                await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
            }
        }
    }
}
