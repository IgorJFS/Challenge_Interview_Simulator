using Microsoft.EntityFrameworkCore;
using sim_backend.Models;

namespace sim_backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Session> Sessions { get; set; }
    public DbSet<Submission> Submissions { get; set; }
    public DbSet<ChatMessage> ChatMessages { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Session>().HasKey(s => s.SessionId);
        modelBuilder.Entity<Submission>().HasKey(s => s.SubmissionId);
        modelBuilder.Entity<ChatMessage>().HasKey(c => c.MessageId);
    }
}