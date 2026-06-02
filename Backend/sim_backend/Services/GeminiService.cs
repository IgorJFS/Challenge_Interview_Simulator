using System.Text;
using System.Text.Json;

namespace sim_backend.Services;

public class GeminiService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;

    public GeminiService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _apiKey = configuration["Gemini:ApiKey"] ?? throw new Exception("Gemini API key not found");
    }

    public async Task<(string BuggyCode, string FixedCode, string BugExplanation)> GenerateBugChallengeAsync(string jobRole)
    {
        var prompt = $"""
            Generate a small JavaScript code snippet with an intentional bug appropriate for a '{jobRole}' position.
            Return ONLY a JSON object with exactly these three fields:
            - buggy_code: the code with the bug
            - fixed_code: the corrected code
            - bug_explanation: a clear explanation of what the bug is and why it happens
            No markdown, no extra text, just the raw JSON object.
            """;

        var requestBody = new
        {
            contents = new[]
            {
                new { parts = new[] { new { text = prompt } } }
            }
        };

        var json = JsonSerializer.Serialize(requestBody);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await _httpClient.PostAsync(
            $"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key={_apiKey}",
            content);

        response.EnsureSuccessStatusCode();

        var responseString = await response.Content.ReadAsStringAsync();
        var responseJson = JsonDocument.Parse(responseString);

        var text = responseJson
            .RootElement
            .GetProperty("candidates")[0]
            .GetProperty("content")
            .GetProperty("parts")[0]
            .GetProperty("text")
            .GetString() ?? throw new Exception("Empty response from Gemini");

        var result = JsonSerializer.Deserialize<JsonElement>(text);

        return (
            result.GetProperty("buggy_code").GetString() ?? "",
            result.GetProperty("fixed_code").GetString() ?? "",
            result.GetProperty("bug_explanation").GetString() ?? ""
        );
    }
}