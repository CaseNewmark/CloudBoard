using Microsoft.EntityFrameworkCore;

namespace CloudBoard.ApiService.Data;

public class CloudBoardDbContext : DbContext
{
    public CloudBoardDbContext(DbContextOptions<CloudBoardDbContext> options)
        : base(options)
    {
    }

    public DbSet<CloudBoardDocument> CloudBoardDocuments { get; set; }
    public DbSet<Node> Nodes { get; set; }
    public DbSet<Connector> Connectors { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        modelBuilder.Entity<CloudBoardDocument>(entity =>
        {
            entity.HasKey(s => s.Id);
            entity.Property(s => s.Name).IsRequired().HasMaxLength(100);
            entity.HasMany(s => s.Nodes)
                .WithOne(n => n.CloudBoardDocument)
                .HasForeignKey(n => n.CloudBoardDocumentId)
                .OnDelete(DeleteBehavior.Cascade);
            
            entity.HasMany(s => s.Connectors)
                .WithOne(c => c.CloudBoardDocument)
                .HasForeignKey(c => c.CloudBoardDocumentId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Node>(entity =>
        {
            entity.HasKey(n => n.Id);
            entity.Property(n => n.Name).IsRequired().HasMaxLength(100);
            entity.OwnsOne(n => n.Position);
        });

        modelBuilder.Entity<Connector>(entity =>
        {
            entity.HasKey(c => c.Id);
            entity.Property(c => c.FromNodeId).IsRequired();
            entity.Property(c => c.ToNodeId).IsRequired();
        });
    }
}