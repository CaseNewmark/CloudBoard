using AutoMapper;
using CloudBoard.ApiService.Dtos;
using CloudBoard.ApiService.Services.Contracts;
using Microsoft.Extensions.ObjectPool;

namespace CloudBoard.ApiService.Services;

public class CloudBoardService : ICloudBoardService
{
    private readonly ICloudBoardRepository _cloudBoardRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<CloudBoardService> _logger;

    public CloudBoardService(
        ICloudBoardRepository cloudBoardRepository, 
        IMapper mapper,
        ILogger<CloudBoardService> logger)
    {
        _cloudBoardRepository = cloudBoardRepository ?? throw new ArgumentNullException(nameof(cloudBoardRepository));
        _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<CloudBoardDto> CreateDocumentAsync(CloudBoardDto documentDto)
    {
        try
        {
            var document = _mapper.Map<Data.CloudBoard>(documentDto);
            var createdDocument = await _cloudBoardRepository.CreateDocumentAsync(document);
            return _mapper.Map<CloudBoardDto>(createdDocument);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating CloudBoard document with name {Name}", documentDto.Name);
            throw;
        }
    }

    public async Task<IEnumerable<CloudBoardDto>> GetAllCloudBoardDocumentsByUserAsync(string userId)
    {
        try
        {
            var documents = await _cloudBoardRepository.GetAllDocumentsByUserAsync(userId);
            return _mapper.Map<IEnumerable<CloudBoardDto>>(documents);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving all CloudBoard documents for user {UserId}", userId);
            throw;
        }
    }

    public async Task<CloudBoardDto> GetCloudBoardDocumentByIdAsync(string id)
    {
        var cloudboardId = Guid.Parse(id);
        try
        {
            var document = await _cloudBoardRepository.GetDocumentByIdAsync(cloudboardId);
            if (document == null)
            {
                _logger.LogWarning("CloudBoard document with ID {Id} not found", cloudboardId);
                throw new KeyNotFoundException($"CloudBoard document with ID {cloudboardId} not found");
            }
            return _mapper.Map<CloudBoardDto>(document);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving CloudBoard document with ID {Id}", id);
            throw;
        }
    }

    public async Task<CloudBoardDto?> UpdateCloudBoardDocumentAsync(CloudBoardDto updateDto)
    {
        var cloudboardId = Guid.Parse(updateDto.Id);
        try
        {
            // First verify the document exists
            var documentExists = await _cloudBoardRepository.GetDocumentByIdAsync(cloudboardId);
            if (documentExists == null)
            {
                _logger.LogWarning("CloudBoard document with ID {Id} not found for update", cloudboardId);
                return null;
            }

            // Instead of mapping directly to the loaded entity, create a new entity
            // from the DTO and preserve the ID
            var documentToUpdate = _mapper.Map<Data.CloudBoard>(updateDto);

            // Now let the repository handle the update with proper change tracking
            await _cloudBoardRepository.UpdateDocumentAsync(documentToUpdate);

            // Get the fresh entity after update
            var updatedDocument = await _cloudBoardRepository.GetDocumentByIdAsync(cloudboardId);
            return _mapper.Map<CloudBoardDto>(updatedDocument);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating CloudBoard document with ID {Id}", cloudboardId);
            throw;
        }
    }

    public async Task<bool> DeleteCloudBoardDocumentAsync(string id)
    {
        var cloudboardId = Guid.Parse(id);
        try
        {
            return await _cloudBoardRepository.DeleteDocumentAsync(cloudboardId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting CloudBoard document with ID {Id}", cloudboardId);
            throw;
        }
    }
}
