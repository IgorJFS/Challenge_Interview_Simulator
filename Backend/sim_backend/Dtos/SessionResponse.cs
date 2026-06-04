namespace sim_backend.Dtos;

public class SessionResponse
{
    public Guid SessionId { get; set; }
    public string JobRole { get; set; } = string.Empty;
    public string Language { get; set; } = string.Empty;
    public string BuggyCode { get; set; } = string.Empty;
    public string FixedCode { get; set; } = string.Empty;
    public string BugExplanation { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? Stage1StartedAt { get; set; }
}