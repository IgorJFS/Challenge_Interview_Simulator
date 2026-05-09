namespace sim_backend.Models;

public class ChatMessage
{
    public int MessageId { get; set; }
    public Guid SessionId { get; set; }
    public string SenderName { get; set; } = string.Empty;
    public string MessageContent { get; set; } = string.Empty;
    public bool IsFromCandidate { get; set; }
    public DateTime SentAt { get; set; }

    public Session Session { get; set; } = null!;
}