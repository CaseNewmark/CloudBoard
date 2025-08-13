namespace CloudBoard.ApiService.Dtos;

public class SortingApplicationDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<ProcessStepDto> ProcessSteps { get; set; } = new List<ProcessStepDto>();
}

public class ProcessStepDto
{
    public string Id { get; set; } = string.Empty;
    public string ProcessStepId { get; set; } = string.Empty;
    public string StepCode { get; set; } = string.Empty;
    public string ProcessStepName { get; set; } = string.Empty;
    public string StepType { get; set; } = string.Empty;
    public string InfeedMaterialDescription { get; set; } = string.Empty;
    public string MainMaterialForEjection { get; set; } = string.Empty;
    public string ConflictingMaterials { get; set; } = string.Empty;
    public int Order { get; set; }
    public MarketSegmentDto MarketSegment { get; set; } = new MarketSegmentDto();
    public List<TargetMaterialDto> TargetMaterials { get; set; } = new List<TargetMaterialDto>();
}

public class MarketSegmentDto
{
    public string Id { get; set; } = string.Empty;
    public string SegmentCode { get; set; } = string.Empty;
    public string SegmentName { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string BusinessUnit { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public class TargetMaterialDto
{
    public string Id { get; set; } = string.Empty;
    public string MaterialCode { get; set; } = string.Empty;
    public string MaterialName { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public string Form { get; set; } = string.Empty;
    public bool IsContaminant { get; set; } = false;
}
