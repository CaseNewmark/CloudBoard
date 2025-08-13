using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;

namespace CloudBoard.ApiService.Data;

public class SortingApplication
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public List<ProcessStep> ProcessSteps { get; set; } = new List<ProcessStep>();
}

public class ProcessStep
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public Guid Id { get; set; }
    public string ProcessStepId { get; set; } = string.Empty; // DE-W01-001
    public string StepCode { get; set; } = string.Empty; // 001
    public string ProcessStepName { get; set; } = string.Empty; // FKN Rougher
    public ProcessStepType StepType { get; set; } = ProcessStepType.Rougher;
    public string InfeedMaterialDescription { get; set; } = string.Empty;
    public string MainMaterialForEjection { get; set; } = string.Empty;
    public string ConflictingMaterials { get; set; } = string.Empty;
    public int Order { get; set; }
    
    // Foreign Keys
    public Guid SortingApplicationId { get; set; }
    public SortingApplication SortingApplication { get; set; } = null!;
    
    public Guid MarketSegmentId { get; set; }
    public MarketSegment MarketSegment { get; set; } = null!;
    
    public List<TargetMaterial> TargetMaterials { get; set; } = new List<TargetMaterial>();
}

public class MarketSegment
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public Guid Id { get; set; }
    public string SegmentCode { get; set; } = string.Empty; // W01
    public string SegmentName { get; set; } = string.Empty; // Mixed Light Packaging
    public string Country { get; set; } = string.Empty; // DE
    public BusinessUnit BusinessUnit { get; set; } = BusinessUnit.WasteRecycling;
    public string Description { get; set; } = string.Empty;
    public List<ProcessStep> ProcessSteps { get; set; } = new List<ProcessStep>();
    public List<TargetMaterial> TargetMaterials { get; set; } = new List<TargetMaterial>();
}

public class TargetMaterial
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public Guid Id { get; set; }
    public string MaterialCode { get; set; } = string.Empty; // PE-HD, PP, PET
    public string MaterialName { get; set; } = string.Empty; // Polyethylene High Density
    public MaterialCategory Category { get; set; } = MaterialCategory.Plastic;
    public string Color { get; set; } = string.Empty;
    public MaterialForm Form { get; set; } = MaterialForm.Rigid;
    public bool IsContaminant { get; set; } = false;
    
    // Navigation properties
    public List<ProcessStep> ProcessSteps { get; set; } = new List<ProcessStep>();
    public List<MarketSegment> MarketSegments { get; set; } = new List<MarketSegment>();
}

public enum ProcessStepType
{
    Rougher,
    Cleaner,
    Scavenger
}

public enum BusinessUnit
{
    WasteRecycling,
    MetalRecycling
}

public enum MaterialCategory
{
    Plastic,
    Paper,
    Metal,
    Glass,
    Wood,
    Textile,
    Other
}

public enum MaterialForm
{
    Rigid,
    Film,
    Flexible,
    Bottle,
    Tray,
    Other
}
