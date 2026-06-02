using Microsoft.EntityFrameworkCore;
using sim_backend.Data;
using sim_backend.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddHttpClient<GeminiService>();
builder.Services.AddScoped<SessionService>();
builder.Services.AddScoped<ChatService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();
app.MapControllers();

// Apply migrations on startup with a retry mechanism for database readiness in containerized environments
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
            logger.LogWarning("Database migration attempt {Attempt} failed. SQL Server might not be ready yet. Retrying in 5 seconds...", retry + 1);
            if (retry == 5)
            {
                logger.LogError(ex, "Database migrations failed after maximum retries.");
                throw;
            }
            System.Threading.Thread.Sleep(5000);
        }
    }
}

app.Run();