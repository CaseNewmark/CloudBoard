using Microsoft.EntityFrameworkCore;

namespace CloudBoard.ApiService.Data;

public class CloudBoardDbContext : DbContext
{
    public CloudBoardDbContext(DbContextOptions<CloudBoardDbContext> options)
        : base(options)
    {
    }
    
    public DbSet<CloudBoard> CloudBoardDocuments { get; set; }
    public DbSet<Node> Nodes { get; set; }
    public DbSet<Connection> Connections { get; set; }
    public DbSet<Connector> Connectors { get; set; }
    public DbSet<CloudBoardMember> CloudBoardMembers { get; set; }
    public DbSet<BoardImage> BoardImages { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        modelBuilder.Entity<CloudBoard>(entity =>
        {
            entity.Property(s => s.Name).IsRequired().HasMaxLength(100);
            entity.Property(s => s.Description).HasMaxLength(1000);
            entity.HasMany(s => s.Nodes)
                .WithOne(n => n.CloudBoardDocument)
                .HasForeignKey(n => n.CloudBoardDocumentId)
                .OnDelete(DeleteBehavior.Cascade);
            
            entity.HasMany(s => s.Connections)
                .WithOne(c => c.CloudBoardDocument)
                .HasForeignKey(c => c.CloudBoardDocumentId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<BoardImage>(entity =>
        {
            entity.Property(i => i.ContentType).IsRequired().HasMaxLength(100);
            entity.Property(i => i.CreatedBy).IsRequired();
            entity.HasIndex(i => i.CloudBoardDocumentId);
            entity.HasOne<CloudBoard>()
                .WithMany()
                .HasForeignKey(i => i.CloudBoardDocumentId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<CloudBoardMember>(entity =>
        {
            entity.HasKey(m => new { m.CloudBoardDocumentId, m.Email });
            entity.Property(m => m.Email).IsRequired().HasMaxLength(320);
            entity.HasIndex(m => m.Email);
            entity.HasOne(m => m.CloudBoardDocument)
                .WithMany(b => b.Members)
                .HasForeignKey(m => m.CloudBoardDocumentId)
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
            entity.Property(c => c.Label).HasMaxLength(200);
            entity.ToTable("Connections");
        });

        modelBuilder.Entity<Connector>(entity =>
        {
            entity.ToTable("Connectors");
        });
    }
}