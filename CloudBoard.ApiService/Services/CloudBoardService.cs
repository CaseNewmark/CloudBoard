using AutoMapper;
using CloudBoard.ApiService.Dtos;
using CloudBoard.ApiService.Services.Contracts;

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

    public async Task<IEnumerable<CloudBoardDto>> GetAllCloudBoardDocumentsAsync()
    {
        try
        {
            var documents = await _cloudBoardRepository.GetAllDocumentsAsync();
            return _mapper.Map<IEnumerable<CloudBoardDto>>(documents);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving all CloudBoard documents");
            throw;
        }
    }

    public async Task<CloudBoardDto> GetCloudBoardDocumentByIdAsync(Guid id)
    {
        try
        {
            var document = await _cloudBoardRepository.GetDocumentByIdAsync(id);
            if (document == null)
            {
                _logger.LogWarning("CloudBoard document with ID {Id} not found", id);
                throw new KeyNotFoundException($"CloudBoard document with ID {id} not found");
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
        try
        {
            // First verify the document exists
            var documentExists = await _cloudBoardRepository.GetDocumentByIdAsync(updateDto.Id);
            if (documentExists == null)
            {
                _logger.LogWarning("CloudBoard document with ID {Id} not found for update", updateDto.Id);
                return null;
            }

            // Instead of mapping directly to the loaded entity, create a new entity
            // from the DTO and preserve the ID
            var documentToUpdate = _mapper.Map<Data.CloudBoard>(updateDto);

            // Now let the repository handle the update with proper change tracking
            await _cloudBoardRepository.UpdateDocumentAsync(documentToUpdate);

            // Get the fresh entity after update
            var updatedDocument = await _cloudBoardRepository.GetDocumentByIdAsync(updateDto.Id);
            return _mapper.Map<CloudBoardDto>(updatedDocument);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating CloudBoard document with ID {Id}", updateDto.Id);
            throw;
        }
    }

    public async Task<bool> DeleteCloudBoardDocumentAsync(Guid id)
    {
        try
        {
            return await _cloudBoardRepository.DeleteDocumentAsync(id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting CloudBoard document with ID {Id}", id);
            throw;
        }
    }
}
