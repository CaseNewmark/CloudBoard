using CloudBoard.ApiService.Data;
using CloudBoard.ApiService.Services.Contracts;
using Microsoft.EntityFrameworkCore;

namespace CloudBoard.ApiService.Services;

public class SortingApplicationRepository : ISortingApplicationRepository
{
    private readonly CloudBoardDbContext _context;

    public SortingApplicationRepository(CloudBoardDbContext context)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
    }

    public async Task<SortingApplication?> GetSortingApplicationByIdAsync(Guid sortingApplicationId)
    {
        return await _context.SortingApplications
            .Include(s => s.ProcessSteps)
                .ThenInclude(p => p.MarketSegment)
            .Include(s => s.ProcessSteps)
                .ThenInclude(p => p.TargetMaterials)
            .FirstOrDefaultAsync(s => s.Id == sortingApplicationId);
    }

    public async Task<IEnumerable<SortingApplication>> GetAllSortingApplicationsAsync()
    {
        return await _context.SortingApplications
            .Include(s => s.ProcessSteps)
                .ThenInclude(p => p.MarketSegment)
            .Include(s => s.ProcessSteps)
                .ThenInclude(p => p.TargetMaterials)
            .OrderBy(s => s.Name)
            .ToListAsync();
    }

    public async Task<SortingApplication> AddSortingApplicationAsync(SortingApplication sortingApplication)
    {
        _context.SortingApplications.Add(sortingApplication);
        await _context.SaveChangesAsync();
        return sortingApplication;
    }

    public async Task<SortingApplication> UpdateSortingApplicationAsync(SortingApplication sortingApplication)
    {
        _context.SortingApplications.Update(sortingApplication);
        await _context.SaveChangesAsync();
        return sortingApplication;
    }

    public async Task<bool> DeleteSortingApplicationAsync(Guid sortingApplicationId)
    {
        var application = await _context.SortingApplications.FindAsync(sortingApplicationId);
        if (application == null)
            return false;

        _context.SortingApplications.Remove(application);
        await _context.SaveChangesAsync();
        return true;
    }
}

public class MarketSegmentRepository : IMarketSegmentRepository
{
    private readonly CloudBoardDbContext _context;

    public MarketSegmentRepository(CloudBoardDbContext context)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
    }

    public async Task<MarketSegment?> GetMarketSegmentByIdAsync(Guid marketSegmentId)
    {
        return await _context.MarketSegments
            .Include(m => m.TargetMaterials)
            .FirstOrDefaultAsync(m => m.Id == marketSegmentId);
    }

    public async Task<IEnumerable<MarketSegment>> GetAllMarketSegmentsAsync()
    {
        return await _context.MarketSegments
            .Include(m => m.TargetMaterials)
            .OrderBy(m => m.SegmentName)
            .ToListAsync();
    }

    public async Task<IEnumerable<MarketSegment>> GetMarketSegmentsByCountryAsync(string country)
    {
        return await _context.MarketSegments
            .Include(m => m.TargetMaterials)
            .Where(m => m.Country == country)
            .OrderBy(m => m.SegmentName)
            .ToListAsync();
    }

    public async Task<MarketSegment> AddMarketSegmentAsync(MarketSegment marketSegment)
    {
        _context.MarketSegments.Add(marketSegment);
        await _context.SaveChangesAsync();
        return marketSegment;
    }

    public async Task<MarketSegment> UpdateMarketSegmentAsync(MarketSegment marketSegment)
    {
        _context.MarketSegments.Update(marketSegment);
        await _context.SaveChangesAsync();
        return marketSegment;
    }

    public async Task<bool> DeleteMarketSegmentAsync(Guid marketSegmentId)
    {
        var segment = await _context.MarketSegments.FindAsync(marketSegmentId);
        if (segment == null)
            return false;

        _context.MarketSegments.Remove(segment);
        await _context.SaveChangesAsync();
        return true;
    }
}

public class TargetMaterialRepository : ITargetMaterialRepository
{
    private readonly CloudBoardDbContext _context;

    public TargetMaterialRepository(CloudBoardDbContext context)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
    }

    public async Task<TargetMaterial?> GetTargetMaterialByIdAsync(Guid targetMaterialId)
    {
        return await _context.TargetMaterials.FindAsync(targetMaterialId);
    }

    public async Task<IEnumerable<TargetMaterial>> GetAllTargetMaterialsAsync()
    {
        return await _context.TargetMaterials
            .OrderBy(t => t.MaterialName)
            .ToListAsync();
    }

    public async Task<IEnumerable<TargetMaterial>> GetTargetMaterialsByCategoryAsync(MaterialCategory category)
    {
        return await _context.TargetMaterials
            .Where(t => t.Category == category)
            .OrderBy(t => t.MaterialName)
            .ToListAsync();
    }

    public async Task<TargetMaterial> AddTargetMaterialAsync(TargetMaterial targetMaterial)
    {
        _context.TargetMaterials.Add(targetMaterial);
        await _context.SaveChangesAsync();
        return targetMaterial;
    }

    public async Task<TargetMaterial> UpdateTargetMaterialAsync(TargetMaterial targetMaterial)
    {
        _context.TargetMaterials.Update(targetMaterial);
        await _context.SaveChangesAsync();
        return targetMaterial;
    }

    public async Task<bool> DeleteTargetMaterialAsync(Guid targetMaterialId)
    {
        var material = await _context.TargetMaterials.FindAsync(targetMaterialId);
        if (material == null)
            return false;

        _context.TargetMaterials.Remove(material);
        await _context.SaveChangesAsync();
        return true;
    }
}
