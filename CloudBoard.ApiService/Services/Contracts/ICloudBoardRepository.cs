using CloudBoard.ApiService.Data;

namespace CloudBoard.ApiService.Services.Contracts;

public interface ICloudBoardRepository
{
    Task<CloudBoardDocument> CreateDocumentAsync(CloudBoardDocument document);
    Task<CloudBoardDocument?> GetDocumentByIdAsync(Guid id);
    Task<IEnumerable<CloudBoardDocument>> GetAllDocumentsAsync();
    Task<bool> DeleteDocumentAsync(Guid id);
}