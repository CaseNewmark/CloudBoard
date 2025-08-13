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
    
    // Sorting Application entities
    public DbSet<SortingApplication> SortingApplications { get; set; }
    public DbSet<ProcessStep> ProcessSteps { get; set; }
    public DbSet<MarketSegment> MarketSegments { get; set; }
    public DbSet<TargetMaterial> TargetMaterials { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        modelBuilder.Entity<CloudBoard>(entity =>
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
            entity.ToTable("Connectors");
        });

        // Configure SortingApplication entities
        modelBuilder.Entity<SortingApplication>(entity =>
        {
            entity.Property(s => s.Name).IsRequired().HasMaxLength(200);
            entity.Property(s => s.CreatedBy).HasMaxLength(100);
            entity.HasMany(s => s.ProcessSteps)
                .WithOne(p => p.SortingApplication)
                .HasForeignKey(p => p.SortingApplicationId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ProcessStep>(entity =>
        {
            entity.Property(p => p.ProcessStepId).IsRequired().HasMaxLength(50);
            entity.Property(p => p.ProcessStepName).IsRequired().HasMaxLength(200);
            entity.Property(p => p.StepCode).IsRequired().HasMaxLength(10);
            
            entity.HasOne(p => p.MarketSegment)
                .WithMany(m => m.ProcessSteps)
                .HasForeignKey(p => p.MarketSegmentId);

            // Many-to-many relationship with TargetMaterials
            entity.HasMany(p => p.TargetMaterials)
                .WithMany(t => t.ProcessSteps)
                .UsingEntity(j => j.ToTable("ProcessStepTargetMaterials"));
        });

        modelBuilder.Entity<MarketSegment>(entity =>
        {
            entity.Property(m => m.SegmentCode).IsRequired().HasMaxLength(10);
            entity.Property(m => m.SegmentName).IsRequired().HasMaxLength(200);
            entity.Property(m => m.Country).HasMaxLength(5);

            // Many-to-many relationship with TargetMaterials
            entity.HasMany(m => m.TargetMaterials)
                .WithMany(t => t.MarketSegments)
                .UsingEntity(j => j.ToTable("MarketSegmentTargetMaterials"));
        });

        modelBuilder.Entity<TargetMaterial>(entity =>
        {
            entity.Property(t => t.MaterialCode).IsRequired().HasMaxLength(50);
            entity.Property(t => t.MaterialName).HasMaxLength(200);
            entity.Property(t => t.Color).HasMaxLength(50);
        });
    }
}