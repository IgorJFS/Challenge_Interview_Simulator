namespace sim_backend.Models;

public class Session
{
    public Guid SessionId { get; set; }
    public string JobRole { get; set; } = string.Empty;
    public string BuggyCode { get; set; } = string.Empty;
    public string FixedCode { get; set; } = string.Empty;
    public string BugExplanation { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? Stage1StartedAt { get; set; }
    public DateTime? Stage1SubmittedAt { get; set; }
    public DateTime? Stage2StartedAt { get; set; }
    public DateTime? Stage2EndedAt { get; set; }
    public bool IsActive { get; set; }

    public ICollection<Submission> Submissions { get; set; } = new List<Submission>();
    public ICollection<ChatMessage> ChatMessages { get; set; } = new List<ChatMessage>();
}