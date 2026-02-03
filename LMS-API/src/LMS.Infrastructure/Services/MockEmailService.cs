using LMS.Application.Common.Interfaces;
using System;
using System.Threading.Tasks;

namespace LMS.Infrastructure.Services
{
    public class MockEmailService : IEmailService
    {
        public Task SendEmailAsync(string to, string subject, string body)
        {
            // Mock: Chỉ log ra console thay vì gửi thật
            Console.WriteLine("================= SENDING EMAIL =================");
            Console.WriteLine($"To: {to}");
            Console.WriteLine($"Subject: {subject}");
            Console.WriteLine($"Body: {body}");
            Console.WriteLine("=================================================");
            return Task.CompletedTask;
        }
    }
}
