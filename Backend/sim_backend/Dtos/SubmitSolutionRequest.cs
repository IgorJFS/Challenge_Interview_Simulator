namespace sim_backend.Dtos;

public class SubmitSolutionRequest
{
    public string CandidateCode { get; set; } = string.Empty;
    public string CandidateExplanation { get; set; } = string.Empty;
}