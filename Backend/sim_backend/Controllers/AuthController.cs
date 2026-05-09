using Microsoft.AspNetCore.Mvc;

namespace sim_backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _configuration;

    public AuthController(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] string password)
    {
        var correctPassword = _configuration["Auth:Password"];
        if (password != correctPassword)
            return Unauthorized();

        return Ok(new { token = "interviewer-authenticated" });
    }
}