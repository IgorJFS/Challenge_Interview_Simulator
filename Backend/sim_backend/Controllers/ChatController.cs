using Microsoft.AspNetCore.Mvc;
using sim_backend.Dtos;
using sim_backend.Services;

namespace sim_backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ChatController : ControllerBase
{
    private readonly ChatService _chatService;

    public ChatController(ChatService chatService)
    {
        _chatService = chatService;
    }

    [HttpPost("{sessionId}")]
    public async Task<IActionResult> PostMessage(Guid sessionId, [FromBody] PostMessageRequest request)
    {
        var message = await _chatService.PostMessageAsync(sessionId, request, isFromCandidate: true);
        return Ok(new ChatMessageResponse
        {
            MessageId = message.MessageId,
            SenderName = message.SenderName,
            MessageContent = message.MessageContent,
            IsFromCandidate = message.IsFromCandidate,
            SentAt = message.SentAt
        });
    }

    [HttpGet("{sessionId}")]
    public async Task<IActionResult> GetMessages(Guid sessionId)
    {
        var messages = await _chatService.GetMessagesAsync(sessionId);
        return Ok(messages.Select(m => new ChatMessageResponse
        {
            MessageId = m.MessageId,
            SenderName = m.SenderName,
            MessageContent = m.MessageContent,
            IsFromCandidate = m.IsFromCandidate,
            SentAt = m.SentAt
        }));
    }
}