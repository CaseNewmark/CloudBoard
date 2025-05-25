using AutoMapper;
using CloudBoard.ApiService.Data;
using CloudBoard.ApiService.Dtos;
using CloudBoard.ApiService.Services.Contracts;

namespace CloudBoard.ApiService.Services;

public class CloudBoardService : ICloudBoardService
{
    private readonly ICloudBoardRepository _cloudBoardRepository;
    private readonly IMapper _mapper;

    public CloudBoardService(ICloudBoardRepository cloudBoardRepository, IMapper mapper)
    {
        _cloudBoardRepository = cloudBoardRepository;
        _mapper = mapper;
    }

    public async Task<CloudBoardDocumentDto> CreateDocumentAsync(CreateCloudBoardDocumentDto createDocumentDto)
    {
        var document = _mapper.Map<CloudBoardDocument>(createDocumentDto);
        var createdDocument = await _cloudBoardRepository.CreateDocumentAsync(document);
        return _mapper.Map<CloudBoardDocumentDto>(createdDocument);
    }

    public async Task<IEnumerable<CloudBoardDocumentDto>> GetAllCloudBoardDocumentsAsync()
    {
        var documents = await _cloudBoardRepository.GetAllDocumentsAsync();
        return _mapper.Map<IEnumerable<CloudBoardDocumentDto>>(documents);
    }

    public async Task<CloudBoardDocumentDto> GetCloudBoardDocumentByIdAsync(Guid id)
    {
        var document = await _cloudBoardRepository.GetDocumentByIdAsync(id);
        return _mapper.Map<CloudBoardDocumentDto>(document);
    }
    
    public async Task<CloudBoardDocumentDto?> UpdateCloudBoardDocumentAsync(Guid id, CloudBoardDocumentDto updateDto)
    {
        // First verify the document exists
        var documentExists = await _cloudBoardRepository.GetDocumentByIdAsync(id);
        if (documentExists == null) return null;

        // Instead of mapping directly to the loaded entity, create a new entity
        // from the DTO and preserve the ID
        var documentToUpdate = _mapper.Map<CloudBoardDocument>(updateDto);

        // Ensure the ID is set correctly
        documentToUpdate.Id = id;

        // Now let the repository handle the update with proper change tracking
        await _cloudBoardRepository.UpdateDocumentAsync(documentToUpdate);

        // Get the fresh entity after update
        var updatedDocument = await _cloudBoardRepository.GetDocumentByIdAsync(id);
        return _mapper.Map<CloudBoardDocumentDto>(updatedDocument);
    }

    public async Task<bool> DeleteCloudBoardDocumentAsync(Guid id)
    {
        return await _cloudBoardRepository.DeleteDocumentAsync(id);
    }
}
