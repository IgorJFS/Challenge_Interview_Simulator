using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using sim_backend.Data;
using sim_backend.Dtos;
using sim_backend.Models;

namespace sim_backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SubmissionController : ControllerBase
{
    private readonly AppDbContext _db;

    public SubmissionController(AppDbContext db)
    {
        _db = db;
    }

    [HttpPost("{sessionId}")]
    public async Task<IActionResult> Submit(Guid sessionId, [FromBody] SubmitSolutionRequest request)
    {
        var submission = new Submission
        {
            SessionId = sessionId,
            CandidateCode = request.CandidateCode,
            CandidateExplanation = request.CandidateExplanation,
            SubmittedAt = DateTime.UtcNow
        };

        _db.Submissions.Add(submission);
        await _db.SaveChangesAsync();

        return Ok(submission);
    }

    [HttpGet("{sessionId}")]
    public async Task<IActionResult> GetSubmission(Guid sessionId)
    {
        var submission = await _db.Submissions
            .Where(s => s.SessionId == sessionId)
            .OrderByDescending(s => s.SubmittedAt)
            .FirstOrDefaultAsync();

        if (submission is null) return NotFound();
        return Ok(submission);
    }
}