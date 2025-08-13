using CloudBoard.ApiService.Data;

namespace CloudBoard.ApiService.Services.Contracts;

public interface ISortingApplicationRepository
{
    Task<SortingApplication?> GetSortingApplicationByIdAsync(Guid sortingApplicationId);
    Task<IEnumerable<SortingApplication>> GetAllSortingApplicationsAsync();
    Task<SortingApplication> AddSortingApplicationAsync(SortingApplication sortingApplication);
    Task<SortingApplication> UpdateSortingApplicationAsync(SortingApplication sortingApplication);
    Task<bool> DeleteSortingApplicationAsync(Guid sortingApplicationId);
}

public interface IMarketSegmentRepository
{
    Task<MarketSegment?> GetMarketSegmentByIdAsync(Guid marketSegmentId);
    Task<IEnumerable<MarketSegment>> GetAllMarketSegmentsAsync();
    Task<IEnumerable<MarketSegment>> GetMarketSegmentsByCountryAsync(string country);
    Task<MarketSegment> AddMarketSegmentAsync(MarketSegment marketSegment);
    Task<MarketSegment> UpdateMarketSegmentAsync(MarketSegment marketSegment);
    Task<bool> DeleteMarketSegmentAsync(Guid marketSegmentId);
}

public interface ITargetMaterialRepository
{
    Task<TargetMaterial?> GetTargetMaterialByIdAsync(Guid targetMaterialId);
    Task<IEnumerable<TargetMaterial>> GetAllTargetMaterialsAsync();
    Task<IEnumerable<TargetMaterial>> GetTargetMaterialsByCategoryAsync(MaterialCategory category);
    Task<TargetMaterial> AddTargetMaterialAsync(TargetMaterial targetMaterial);
    Task<TargetMaterial> UpdateTargetMaterialAsync(TargetMaterial targetMaterial);
    Task<bool> DeleteTargetMaterialAsync(Guid targetMaterialId);
}
