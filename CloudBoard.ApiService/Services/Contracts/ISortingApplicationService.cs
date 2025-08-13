using CloudBoard.ApiService.Dtos;

namespace CloudBoard.ApiService.Services.Contracts;

public interface ISortingApplicationService
{
    Task<SortingApplicationDto?> GetSortingApplicationByIdAsync(string sortingApplicationId);
    Task<IEnumerable<SortingApplicationDto>> GetAllSortingApplicationsAsync();
    Task<SortingApplicationDto> CreateSortingApplicationAsync(SortingApplicationDto sortingApplicationDto);
    Task<SortingApplicationDto?> UpdateSortingApplicationAsync(SortingApplicationDto sortingApplicationDto);
    Task<bool> DeleteSortingApplicationAsync(string sortingApplicationId);
    Task<IEnumerable<ProcessStepDto>> GetProcessStepsBySortingApplicationIdAsync(string sortingApplicationId);
}

public interface IMarketSegmentService
{
    Task<MarketSegmentDto?> GetMarketSegmentByIdAsync(string marketSegmentId);
    Task<IEnumerable<MarketSegmentDto>> GetAllMarketSegmentsAsync();
    Task<MarketSegmentDto> CreateMarketSegmentAsync(MarketSegmentDto marketSegmentDto);
    Task<MarketSegmentDto?> UpdateMarketSegmentAsync(MarketSegmentDto marketSegmentDto);
    Task<bool> DeleteMarketSegmentAsync(string marketSegmentId);
    Task<IEnumerable<MarketSegmentDto>> GetMarketSegmentsByCountryAsync(string country);
}

public interface ITargetMaterialService
{
    Task<TargetMaterialDto?> GetTargetMaterialByIdAsync(string targetMaterialId);
    Task<IEnumerable<TargetMaterialDto>> GetAllTargetMaterialsAsync();
    Task<TargetMaterialDto> CreateTargetMaterialAsync(TargetMaterialDto targetMaterialDto);
    Task<TargetMaterialDto?> UpdateTargetMaterialAsync(TargetMaterialDto targetMaterialDto);
    Task<bool> DeleteTargetMaterialAsync(string targetMaterialId);
    Task<IEnumerable<TargetMaterialDto>> GetTargetMaterialsByCategoryAsync(string category);
}
