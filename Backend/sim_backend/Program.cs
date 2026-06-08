using Microsoft.EntityFrameworkCore;
using sim_backend.Data;
using sim_backend.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173",
                "https://interview-challenge-simulator.igormp-dev.workers.dev")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var databaseUrl = Environment.GetEnvironmentVariable("DATABASE_URL");
var connectionString = !string.IsNullOrEmpty(databaseUrl)
    ? BuildNpgsqlConnectionString(databaseUrl)
    : builder.Configuration.GetConnectionString("DefaultConnection")!;

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddHttpClient<GeminiService>();
builder.Services.AddScoped<SessionService>();
builder.Services.AddScoped<ChatService>();

var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");
var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();
app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();
    var context = services.GetRequiredService<AppDbContext>();

    for (int retry = 0; retry < 6; retry++)
    {
        try
        {
            logger.LogInformation("Attempting to apply database migrations (Attempt {Attempt}/6)...", retry + 1);
            context.Database.Migrate();
            logger.LogInformation("Database migrations applied successfully.");
            break;
        }
        catch (Exception ex)
        {
            logger.LogWarning("Database migration attempt {Attempt} failed. Retrying in 5 seconds...", retry + 1);
            if (retry == 5)
            {
                logger.LogError(ex, "Database migrations failed after maximum retries.");
                throw;
            }
            Thread.Sleep(5000);
        }
    }
}

app.Run();

// Converte URI estilo postgresql:// para formato aceito pelo Npgsql
static string BuildNpgsqlConnectionString(string databaseUrl)
{
    var uri   = new Uri(databaseUrl);
    var parts = uri.UserInfo.Split(':');
    return $"Host={uri.Host};Port={uri.Port};"
         + $"Database={uri.AbsolutePath.TrimStart('/')};"
         + $"Username={parts[0]};Password={parts[1]};"
         + "SSL Mode=Require;Trust Server Certificate=true";
}