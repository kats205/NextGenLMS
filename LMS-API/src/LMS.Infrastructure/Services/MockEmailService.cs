using LMS.Application.Interfaces;
using System.Threading.Tasks;
using System;

namespace LMS.Infrastructure.Services
{
    public class MockEmailService : IEmailService
    {
        public Task SendEmailAsync(string to, string subject, string body)
        {
            Console.WriteLine("------------------------------------------");
            Console.WriteLine($"[MOCK EMAIL SENT TO: {to}]");
            Console.WriteLine($"Subject: {subject}");
            Console.WriteLine($"Body: {body}");
            Console.WriteLine("------------------------------------------");
            return Task.CompletedTask;
        }
    }
}
