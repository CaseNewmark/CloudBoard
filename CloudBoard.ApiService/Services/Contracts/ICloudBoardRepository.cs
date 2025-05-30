using CloudBoard.ApiService.Data;

namespace CloudBoard.ApiService.Services.Contracts;

public interface ICloudBoardRepository
{
    Task<Data.CloudBoard> CreateDocumentAsync(Data.CloudBoard document);
    Task<Data.CloudBoard?> GetDocumentByIdAsync(Guid id);
    Task<IEnumerable<Data.CloudBoard>> GetAllDocumentsAsync();
    Task UpdateDocumentAsync(Data.CloudBoard document);
    Task<bool> DeleteDocumentAsync(Guid id);
}