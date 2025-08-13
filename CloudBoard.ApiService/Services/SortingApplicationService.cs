using AutoMapper;
using CloudBoard.ApiService.Data;
using CloudBoard.ApiService.Dtos;
using CloudBoard.ApiService.Services.Contracts;
using Microsoft.EntityFrameworkCore;

namespace CloudBoard.ApiService.Services;

public class SortingApplicationService : ISortingApplicationService
{
    private readonly CloudBoardDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<SortingApplicationService> _logger;

    public SortingApplicationService(
        CloudBoardDbContext context,
        IMapper mapper,
        ILogger<SortingApplicationService> logger)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<SortingApplicationDto?> GetSortingApplicationByIdAsync(string sortingApplicationId)
    {
        var id = Guid.Parse(sortingApplicationId);
        try
        {
            var application = await _context.SortingApplications
                .Include(s => s.ProcessSteps)
                    .ThenInclude(p => p.MarketSegment)
                .Include(s => s.ProcessSteps)
                    .ThenInclude(p => p.TargetMaterials)
                .FirstOrDefaultAsync(s => s.Id == id);

            return application != null ? _mapper.Map<SortingApplicationDto>(application) : null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving sorting application with ID {SortingApplicationId}", id);
            throw;
        }
    }

    public async Task<IEnumerable<SortingApplicationDto>> GetAllSortingApplicationsAsync()
    {
        try
        {
            var applications = await _context.SortingApplications
                .Include(s => s.ProcessSteps)
                    .ThenInclude(p => p.MarketSegment)
                .Include(s => s.ProcessSteps)
                    .ThenInclude(p => p.TargetMaterials)
                .OrderBy(s => s.Name)
                .ToListAsync();

            return _mapper.Map<IEnumerable<SortingApplicationDto>>(applications);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving all sorting applications");
            throw;
        }
    }

    public async Task<SortingApplicationDto> CreateSortingApplicationAsync(SortingApplicationDto sortingApplicationDto)
    {
        try
        {
            var application = _mapper.Map<SortingApplication>(sortingApplicationDto);
            application.CreatedAt = DateTime.UtcNow;
            application.UpdatedAt = DateTime.UtcNow;

            _context.SortingApplications.Add(application);
            await _context.SaveChangesAsync();

            return _mapper.Map<SortingApplicationDto>(application);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating sorting application {ApplicationName}", sortingApplicationDto.Name);
            throw;
        }
    }

    public async Task<SortingApplicationDto?> UpdateSortingApplicationAsync(SortingApplicationDto sortingApplicationDto)
    {
        var id = Guid.Parse(sortingApplicationDto.Id);
        try
        {
            var existingApplication = await _context.SortingApplications
                .Include(s => s.ProcessSteps)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (existingApplication == null)
                return null;

            _mapper.Map(sortingApplicationDto, existingApplication);
            existingApplication.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return _mapper.Map<SortingApplicationDto>(existingApplication);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating sorting application with ID {SortingApplicationId}", id);
            throw;
        }
    }

    public async Task<bool> DeleteSortingApplicationAsync(string sortingApplicationId)
    {
        var id = Guid.Parse(sortingApplicationId);
        try
        {
            var application = await _context.SortingApplications.FindAsync(id);
            if (application == null)
                return false;

            _context.SortingApplications.Remove(application);
            await _context.SaveChangesAsync();
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting sorting application with ID {SortingApplicationId}", id);
            throw;
        }
    }

    public async Task<IEnumerable<ProcessStepDto>> GetProcessStepsBySortingApplicationIdAsync(string sortingApplicationId)
    {
        var id = Guid.Parse(sortingApplicationId);
        try
        {
            var processSteps = await _context.ProcessSteps
                .Include(p => p.MarketSegment)
                .Include(p => p.TargetMaterials)
                .Where(p => p.SortingApplicationId == id)
                .OrderBy(p => p.Order)
                .ToListAsync();

            return _mapper.Map<IEnumerable<ProcessStepDto>>(processSteps);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving process steps for sorting application {SortingApplicationId}", id);
            throw;
        }
    }
}
