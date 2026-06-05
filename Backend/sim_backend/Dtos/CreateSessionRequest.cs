namespace sim_backend.Dtos;

public class CreateSessionRequest
{
    public string JobRole { get; set; } = string.Empty;
    public string Language { get; set; } = string.Empty;
    public string? ApiKey { get; set; }
}