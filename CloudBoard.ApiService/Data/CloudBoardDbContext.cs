using Microsoft.EntityFrameworkCore;

namespace CloudBoard.ApiService.Data;

public class CloudBoardDbContext : DbContext
{
    public CloudBoardDbContext(DbContextOptions<CloudBoardDbContext> options)
        : base(options)
    {
    }

    public DbSet<CloudBoardDocument> CloudBoardDocuments { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<CloudBoardDocument>(entity =>
        {
            entity.HasKey(s => s.Id);
            entity.Property(s => s.Name).IsRequired().HasMaxLength(100);
            entity.Property(s => s.Content).IsRequired();
        });
    }
}