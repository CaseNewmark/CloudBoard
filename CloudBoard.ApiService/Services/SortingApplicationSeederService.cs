using CloudBoard.ApiService.Data;
using Microsoft.EntityFrameworkCore;

namespace CloudBoard.ApiService.Services;

public class SortingApplicationSeederService
{
    private readonly CloudBoardDbContext _context;
    private readonly ILogger<SortingApplicationSeederService> _logger;

    public SortingApplicationSeederService(
        CloudBoardDbContext context,
        ILogger<SortingApplicationSeederService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task SeedSampleDataAsync()
    {
        try
        {
            // Check if data already exists
            if (await _context.SortingApplications.AnyAsync())
            {
                _logger.LogInformation("Sample data already exists, skipping seeding");
                return;
            }

            // Create Market Segments
            var mixedLightPackaging = new MarketSegment
            {
                Id = Guid.NewGuid(),
                SegmentCode = "W01",
                SegmentName = "Mixed Light Packaging",
                Country = "DE",
                BusinessUnit = BusinessUnit.WasteRecycling,
                Description = "Post-consumer mixed packaging waste from various collection systems"
            };

            var municipalSolidWaste = new MarketSegment
            {
                Id = Guid.NewGuid(),
                SegmentCode = "W02",
                SegmentName = "Municipal Solid Waste",
                Country = "DE",
                BusinessUnit = BusinessUnit.WasteRecycling,
                Description = "Waste collected from households that usually ends up at landfill or incinerator"
            };

            _context.MarketSegments.AddRange(mixedLightPackaging, municipalSolidWaste);

            // Create Target Materials
            var materials = new List<TargetMaterial>
            {
                new TargetMaterial { Id = Guid.NewGuid(), MaterialCode = "FKN", MaterialName = "Fiber-based Cartons (Tetrapack)", Category = MaterialCategory.Paper, Form = MaterialForm.Other },
                new TargetMaterial { Id = Guid.NewGuid(), MaterialCode = "PE-LD", MaterialName = "Low Density Polyethylene", Category = MaterialCategory.Plastic, Form = MaterialForm.Film },
                new TargetMaterial { Id = Guid.NewGuid(), MaterialCode = "PE-HD", MaterialName = "High Density Polyethylene", Category = MaterialCategory.Plastic, Form = MaterialForm.Rigid },
                new TargetMaterial { Id = Guid.NewGuid(), MaterialCode = "PP", MaterialName = "Polypropylene", Category = MaterialCategory.Plastic, Form = MaterialForm.Rigid },
                new TargetMaterial { Id = Guid.NewGuid(), MaterialCode = "PET", MaterialName = "Polyethylene Terephthalate", Category = MaterialCategory.Plastic, Form = MaterialForm.Bottle },
                new TargetMaterial { Id = Guid.NewGuid(), MaterialCode = "ALU", MaterialName = "Aluminum", Category = MaterialCategory.Metal, Form = MaterialForm.Other },
                new TargetMaterial { Id = Guid.NewGuid(), MaterialCode = "PAPER", MaterialName = "Paper", Category = MaterialCategory.Paper, Form = MaterialForm.Other },
                new TargetMaterial { Id = Guid.NewGuid(), MaterialCode = "PS", MaterialName = "Polystyrene", Category = MaterialCategory.Plastic, Form = MaterialForm.Rigid },
                new TargetMaterial { Id = Guid.NewGuid(), MaterialCode = "PVC", MaterialName = "Polyvinyl Chloride", Category = MaterialCategory.Plastic, Form = MaterialForm.Rigid, IsContaminant = true }
            };

            _context.TargetMaterials.AddRange(materials);

            // Create Sample Sorting Applications
            var app1 = new SortingApplication
            {
                Id = Guid.NewGuid(),
                Name = "German Mixed Light Packaging Plant",
                Description = "Complete sorting solution for German EPR mixed light packaging waste stream",
                CreatedBy = "System Administrator",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                ProcessSteps = new List<ProcessStep>
                {
                    new ProcessStep
                    {
                        Id = Guid.NewGuid(),
                        ProcessStepId = "DE-W01-001",
                        StepCode = "001",
                        ProcessStepName = "FKN Rougher",
                        StepType = ProcessStepType.Rougher,
                        InfeedMaterialDescription = "Typically first machine in a plant after some pre treatment of material. Shooting all sort of Tetrapack material",
                        MainMaterialForEjection = "FKN",
                        ConflictingMaterials = "PE-LD, ALU, PAPER",
                        Order = 1,
                        MarketSegmentId = mixedLightPackaging.Id,
                        TargetMaterials = new List<TargetMaterial> { materials.First(m => m.MaterialCode == "FKN") }
                    },
                    new ProcessStep
                    {
                        Id = Guid.NewGuid(),
                        ProcessStepId = "DE-W01-002",
                        StepCode = "002",
                        ProcessStepName = "FKN Cleaner",
                        StepType = ProcessStepType.Cleaner,
                        InfeedMaterialDescription = "Material from FKN machine (typically FKN positive stream)",
                        MainMaterialForEjection = "All materials except FKN",
                        ConflictingMaterials = "",
                        Order = 2,
                        MarketSegmentId = mixedLightPackaging.Id,
                        TargetMaterials = new List<TargetMaterial> { materials.First(m => m.MaterialCode == "FKN") }
                    },
                    new ProcessStep
                    {
                        Id = Guid.NewGuid(),
                        ProcessStepId = "DE-W01-005",
                        StepCode = "005",
                        ProcessStepName = "PE Rigid Rougher",
                        StepType = ProcessStepType.Rougher,
                        InfeedMaterialDescription = "Sorting rigid PE containers from mixed stream",
                        MainMaterialForEjection = "PE-HD",
                        ConflictingMaterials = "",
                        Order = 3,
                        MarketSegmentId = mixedLightPackaging.Id,
                        TargetMaterials = new List<TargetMaterial> { materials.First(m => m.MaterialCode == "PE-HD") }
                    },
                    new ProcessStep
                    {
                        Id = Guid.NewGuid(),
                        ProcessStepId = "DE-W01-011",
                        StepCode = "011",
                        ProcessStepName = "PP-Rigid",
                        StepType = ProcessStepType.Rougher,
                        InfeedMaterialDescription = "Sorting rigid PP containers from mixed stream",
                        MainMaterialForEjection = "PP",
                        ConflictingMaterials = "",
                        Order = 4,
                        MarketSegmentId = mixedLightPackaging.Id,
                        TargetMaterials = new List<TargetMaterial> { materials.First(m => m.MaterialCode == "PP") }
                    },
                    new ProcessStep
                    {
                        Id = Guid.NewGuid(),
                        ProcessStepId = "DE-W01-028",
                        StepCode = "028",
                        ProcessStepName = "SCAVENGER Rigid PLASTICS",
                        StepType = ProcessStepType.Scavenger,
                        InfeedMaterialDescription = "Recovery of remaining rigid plastics from waste stream",
                        MainMaterialForEjection = "PP HDPE PET PS",
                        ConflictingMaterials = "",
                        Order = 5,
                        MarketSegmentId = mixedLightPackaging.Id,
                        TargetMaterials = materials.Where(m => new[] { "PP", "PE-HD", "PET", "PS" }.Contains(m.MaterialCode)).ToList()
                    }
                }
            };

            var app2 = new SortingApplication
            {
                Id = Guid.NewGuid(),
                Name = "PET Bottle Upgrading Plant",
                Description = "Specialized plant for upgrading PET bottles to food-grade recycled content",
                CreatedBy = "Plant Engineer",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                ProcessSteps = new List<ProcessStep>
                {
                    new ProcessStep
                    {
                        Id = Guid.NewGuid(),
                        ProcessStepId = "DE-W05-001",
                        StepCode = "001",
                        ProcessStepName = "PET Clear",
                        StepType = ProcessStepType.Rougher,
                        InfeedMaterialDescription = "Sorting clear PET bottles from mixed PET stream",
                        MainMaterialForEjection = "PET Clear",
                        ConflictingMaterials = "PET Colored, Labels",
                        Order = 1,
                        MarketSegmentId = mixedLightPackaging.Id,
                        TargetMaterials = new List<TargetMaterial> { materials.First(m => m.MaterialCode == "PET") }
                    },
                    new ProcessStep
                    {
                        Id = Guid.NewGuid(),
                        ProcessStepId = "DE-W05-002",
                        StepCode = "002",
                        ProcessStepName = "PET Clear Cleaner",
                        StepType = ProcessStepType.Cleaner,
                        InfeedMaterialDescription = "Final cleaning of clear PET bottles",
                        MainMaterialForEjection = "All materials except clear PET",
                        ConflictingMaterials = "Colored PET, Labels, Caps",
                        Order = 2,
                        MarketSegmentId = mixedLightPackaging.Id,
                        TargetMaterials = new List<TargetMaterial> { materials.First(m => m.MaterialCode == "PET") }
                    }
                }
            };

            _context.SortingApplications.AddRange(app1, app2);

            await _context.SaveChangesAsync();

            _logger.LogInformation("Successfully seeded sample sorting application data");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error seeding sample sorting application data");
            throw;
        }
    }
}
