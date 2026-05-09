using Microsoft.EntityFrameworkCore;
using sim_backend.Data;
using sim_backend.Dtos;
using sim_backend.Models;

namespace sim_backend.Services;

public class ChatService
{
    private readonly AppDbContext _db;

    public ChatService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<ChatMessage> PostMessageAsync(Guid sessionId, PostMessageRequest request, bool isFromCandidate)
    {
        var message = new ChatMessage
        {
            SessionId = sessionId,
            SenderName = request.SenderName,
            MessageContent = request.MessageContent,
            IsFromCandidate = isFromCandidate,
            SentAt = DateTime.UtcNow
        };

        _db.ChatMessages.Add(message);
        await _db.SaveChangesAsync();

        return message;
    }

    public async Task<List<ChatMessage>> GetMessagesAsync(Guid sessionId)
    {
        return await _db.ChatMessages
            .Where(m => m.SessionId == sessionId)
            .OrderBy(m => m.SentAt)
            .ToListAsync();
    }
}