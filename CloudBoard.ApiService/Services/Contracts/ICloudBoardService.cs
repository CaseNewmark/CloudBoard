using CloudBoard.ApiService.Data;
using CloudBoard.ApiService.Dtos;

namespace CloudBoard.ApiService.Services.Contracts;

public interface ICloudBoardService
{
    Task<CloudBoardDocumentDto> CreateDocumentAsync(CreateCloudBoardDocumentDto createDocumentDto);
    Task<IEnumerable<CloudBoardDocumentDto>> GetAllCloudBoardDocumentsAsync();
    Task<CloudBoardDocumentDto> GetCloudBoardDocumentByIdAsync(Guid id);
    Task<CloudBoardDocumentDto?> UpdateCloudBoardDocumentAsync(Guid id, CloudBoardDocumentDto updateDto);
    Task<bool> DeleteCloudBoardDocumentAsync(Guid id);
}