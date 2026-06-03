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

    public async Task<(string BuggyCode, string FixedCode, string BugExplanation)> GenerateBugChallengeAsync(string jobRole, string language)
    {
        var prompt = $"""
            Generate a small {language} code snippet with an intentional bug appropriate for a '{jobRole}' position.
            
            IMPORTANT:
            At the very first line of the 'buggy_code', you MUST include a single-line comment in the language's native comment syntax (e.g., '//' for JS/C#/Java/TS, '#' for Python) in English describing the symptom of the bug and asking the candidate how to solve it.
            Examples:
            - // The output in this example returns undefined, why and how to solve?
            - // This code is causing a memory leak, why and how to solve?
            - // This function throws an unhandled NullReferenceException, why and how to solve?
            Keep the comment concise, simple, and direct.

            Return ONLY a JSON object with exactly these three fields:
            - buggy_code: the code with the bug (containing the symptom comment at the very first line)
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