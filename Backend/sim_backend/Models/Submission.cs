namespace sim_backend.Models;

public class Submission
{
    public int SubmissionId { get; set; }
    public Guid SessionId { get; set; }
    public string CandidateCode { get; set; } = string.Empty;
    public string CandidateExplanation { get; set; } = string.Empty;
    public DateTime SubmittedAt { get; set; }

    public Session Session { get; set; } = null!;
}