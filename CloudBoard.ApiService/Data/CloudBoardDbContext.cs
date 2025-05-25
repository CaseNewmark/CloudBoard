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
    public DbSet<Connection> Connections { get; set; }
    public DbSet<Connector> Connectors { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        modelBuilder.Entity<CloudBoardDocument>(entity =>
        {
            entity.Property(s => s.Name).IsRequired().HasMaxLength(100);
            entity.HasMany(s => s.Nodes)
                .WithOne(n => n.CloudBoardDocument)
                .HasForeignKey(n => n.CloudBoardDocumentId)
                .OnDelete(DeleteBehavior.Cascade);
            
            entity.HasMany(s => s.Connections)
                .WithOne(c => c.CloudBoardDocument)
                .HasForeignKey(c => c.CloudBoardDocumentId)
                .OnDelete(DeleteBehavior.Cascade);
        });
        
        modelBuilder.Entity<Node>(entity =>
        {
            entity.Property(n => n.Name).IsRequired().HasMaxLength(100);
            
            // Configure NodePosition as an owned entity with explicit column names
            entity.OwnsOne(n => n.Position, position =>
            {
                position.Property(p => p.X).HasColumnName("PositionX");
                position.Property(p => p.Y).HasColumnName("PositionY");
            });
            
            entity.Property(n => n.Properties)
                .HasColumnType("jsonb");

            entity.HasMany(n => n.Connectors)
                .WithOne(c => c.Node)
                .HasForeignKey(c => c.NodeId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Connection>(entity =>
        {
            entity.Property(c => c.FromConnectorId).IsRequired();
            entity.Property(c => c.ToConnectorId).IsRequired();
            entity.ToTable("Connections");
        });

        modelBuilder.Entity<Connector>(entity =>
        {
            entity.Property(c => c.Name).IsRequired();
            entity.ToTable("Connectors");
        });
    }
}