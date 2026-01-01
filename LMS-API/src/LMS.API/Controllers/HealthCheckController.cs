using Microsoft.AspNetCore.Mvc;
using LMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthCheckController : ControllerBase
{
    private readonly AppDbContext _context;

    public HealthCheckController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var canConnect = await _context.Database.CanConnectAsync();
        return Ok(new 
        { 
            Status = "Healthy", 
            DatabaseConnection = canConnect ? "Success" : "Failed",
            Timestamp = DateTime.UtcNow 
        });
    }
}
