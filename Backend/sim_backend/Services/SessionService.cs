using Microsoft.EntityFrameworkCore;
using sim_backend.Data;
using sim_backend.Dtos;
using sim_backend.Models;
using System.Text;
using System.Text.Json;

namespace sim_backend.Services;

public class SessionService
{
    private readonly AppDbContext _db;
    private readonly GeminiService _geminiService;

    public SessionService(AppDbContext db, GeminiService geminiService)
    {
        _db = db;
        _geminiService = geminiService;
    }

    public async Task<Session> CreateSessionAsync(string jobRole, string language)
    {
        var (buggyCode, fixedCode, bugExplanation) = await _geminiService.GenerateBugChallengeAsync(jobRole, language);

        var session = new Session
        {
            SessionId = Guid.NewGuid(),
            JobRole = jobRole,
            Language = language,
            BuggyCode = buggyCode,
            FixedCode = fixedCode,
            BugExplanation = bugExplanation,
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        _db.Sessions.Add(session);
        await _db.SaveChangesAsync();

        return session;
    }

    public async Task<Session?> GetSessionAsync(Guid sessionId, bool start = false)
    {
        var session = await _db.Sessions
            .Include(s => s.Submissions)
            .Include(s => s.ChatMessages)
            .FirstOrDefaultAsync(s => s.SessionId == sessionId);

        if (session is not null && start && session.Stage1StartedAt is null)
        {
            session.Stage1StartedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
        }

        return session;
    }

    public async Task DeleteSessionAsync(Guid sessionId)
    {
        var session = await _db.Sessions.FindAsync(sessionId);
        if (session is not null)
        {
            _db.Sessions.Remove(session);
            await _db.SaveChangesAsync();
        }
    }
}