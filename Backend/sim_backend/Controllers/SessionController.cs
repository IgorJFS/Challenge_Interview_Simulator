using Microsoft.AspNetCore.Mvc;
using sim_backend.Dtos;
using sim_backend.Services;

namespace sim_backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SessionController : ControllerBase
{
    private readonly SessionService _sessionService;

    public SessionController(SessionService sessionService)
    {
        _sessionService = sessionService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateSession([FromBody] CreateSessionRequest request)
    {
        var session = await _sessionService.CreateSessionAsync(request.JobRole);
        return Ok(new SessionResponse
        {
            SessionId = session.SessionId,
            JobRole = session.JobRole,
            BuggyCode = session.BuggyCode,
            IsActive = session.IsActive,
            CreatedAt = session.CreatedAt
        });
    }

    [HttpGet("{sessionId}")]
    public async Task<IActionResult> GetSession(Guid sessionId)
    {
        var session = await _sessionService.GetSessionAsync(sessionId);
        if (session is null) return NotFound();

        return Ok(new SessionResponse
        {
            SessionId = session.SessionId,
            JobRole = session.JobRole,
            BuggyCode = session.BuggyCode,
            IsActive = session.IsActive,
            CreatedAt = session.CreatedAt
        });
    }

    [HttpDelete("{sessionId}")]
    public async Task<IActionResult> DeleteSession(Guid sessionId)
    {
        await _sessionService.DeleteSessionAsync(sessionId);
        return NoContent();
    }
}