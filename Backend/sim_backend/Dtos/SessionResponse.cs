namespace sim_backend.Dtos;

public class SessionResponse
{
    public Guid SessionId { get; set; }
    public string JobRole { get; set; } = string.Empty;
    public string BuggyCode { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}