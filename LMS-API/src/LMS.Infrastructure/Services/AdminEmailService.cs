using LMS.Application.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Infrastructure.Services
{
    public class AdminEmailService : IAdminEmailService
    {
        private readonly ISystemConfigService _systemConfigService;

        public AdminEmailService(ISystemConfigService systemConfigService)
        {
            _systemConfigService = systemConfigService;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            // 1. Get Configs
            var host = (await _systemConfigService.GetConfigByKeyAsync("SmtpHost")).Data?.ConfigValue;
            var portVal = (await _systemConfigService.GetConfigByKeyAsync("SmtpPort")).Data?.ConfigValue;
            var sender = (await _systemConfigService.GetConfigByKeyAsync("EmailSender")).Data?.ConfigValue;
            var pass = (await _systemConfigService.GetConfigByKeyAsync("SmtpPassword")).Data?.ConfigValue;
            var sslVal = (await _systemConfigService.GetConfigByKeyAsync("EnableSsl")).Data?.ConfigValue;

            if (string.IsNullOrEmpty(host) || string.IsNullOrEmpty(sender) || string.IsNullOrEmpty(pass))
            {
                // Config not ready, skip
                return;
            }

            int port = int.TryParse(portVal, out var p) ? p : 587;
            bool enableSsl = bool.TryParse(sslVal, out var s) ? s : true;

            // 2. Send Email
            using (var client = new System.Net.Mail.SmtpClient(host, port))
            {
                client.EnableSsl = enableSsl;
                client.Credentials = new System.Net.NetworkCredential(sender, pass);
                
                var mailMessage = new System.Net.Mail.MailMessage
                {
                    From = new System.Net.Mail.MailAddress(sender),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = true
                };

                mailMessage.To.Add(toEmail);

                await client.SendMailAsync(mailMessage);
            }
        }
    }
}
