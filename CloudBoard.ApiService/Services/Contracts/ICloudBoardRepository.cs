using CloudBoard.ApiService.Data;

namespace CloudBoard.ApiService.Services.Contracts;

public interface ICloudBoardRepository : IRepository<Data.CloudBoard, Guid>
{
    // Specific methods for CloudBoard operations beyond the generic ones
    Task<Data.CloudBoard> CreateDocumentAsync(Data.CloudBoard document);
    Task<Data.CloudBoard?> GetDocumentByIdAsync(Guid id);
    Task<IEnumerable<Data.CloudBoard>> GetAllDocumentsByUserAsync(string userId);
    Task UpdateDocumentAsync(Data.CloudBoard document);
    Task<bool> DeleteDocumentAsync(Guid id);
}