namespace sim_backend.Dtos;

public class PostMessageRequest
{
    public string SenderName { get; set; } = string.Empty;
    public string MessageContent { get; set; } = string.Empty;
}