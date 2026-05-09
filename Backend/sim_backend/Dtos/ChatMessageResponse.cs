namespace sim_backend.Dtos;

public class ChatMessageResponse
{
    public int MessageId { get; set; }
    public string SenderName { get; set; } = string.Empty;
    public string MessageContent { get; set; } = string.Empty;
    public bool IsFromCandidate { get; set; }
    public DateTime SentAt { get; set; }
}