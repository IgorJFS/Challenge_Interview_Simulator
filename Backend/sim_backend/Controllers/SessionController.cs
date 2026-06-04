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
        var session = await _sessionService.CreateSessionAsync(request.JobRole, request.Language);
        return Ok(new SessionResponse
        {
            SessionId = session.SessionId,
            JobRole = session.JobRole,
            Language = session.Language,
            BuggyCode = session.BuggyCode,
            FixedCode = session.FixedCode,
            BugExplanation = session.BugExplanation,
            IsActive = session.IsActive,
            CreatedAt = DateTime.SpecifyKind(session.CreatedAt, DateTimeKind.Utc),
            Stage1StartedAt = session.Stage1StartedAt.HasValue
                ? DateTime.SpecifyKind(session.Stage1StartedAt.Value, DateTimeKind.Utc)
                : null
        });
    }

    [HttpGet("{sessionId}")]
    public async Task<IActionResult> GetSession(Guid sessionId, [FromQuery] bool start = false)
    {
        var session = await _sessionService.GetSessionAsync(sessionId, start);
        if (session is null) return NotFound();

        return Ok(new SessionResponse
        {
            SessionId = session.SessionId,
            JobRole = session.JobRole,
            Language = session.Language,
            BuggyCode = session.BuggyCode,
            FixedCode = session.FixedCode,
            BugExplanation = session.BugExplanation,
            IsActive = session.IsActive,
            CreatedAt = DateTime.SpecifyKind(session.CreatedAt, DateTimeKind.Utc),
            Stage1StartedAt = session.Stage1StartedAt.HasValue
                ? DateTime.SpecifyKind(session.Stage1StartedAt.Value, DateTimeKind.Utc)
                : null
        });
    }

    [HttpDelete("{sessionId}")]
    public async Task<IActionResult> DeleteSession(Guid sessionId)
    {
        await _sessionService.DeleteSessionAsync(sessionId);
        return NoContent();
    }
}