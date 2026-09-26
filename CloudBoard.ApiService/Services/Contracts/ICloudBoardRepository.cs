using CloudBoard.ApiService.Data;

namespace CloudBoard.ApiService.Services.Contracts;

public interface ICloudBoardRepository
{
    Task<Data.CloudBoard> CreateDocumentAsync(Data.CloudBoard document);
    Task<Data.CloudBoard?> GetDocumentByIdAsync(Guid id);
    /// <summary>Boards the user owns, plus boards shared with <paramref name="verifiedEmail"/>.</summary>
    Task<IEnumerable<Data.CloudBoard>> GetAllDocumentsByUserAsync(string userId, string? verifiedEmail);
    Task<IReadOnlyList<string>> GetMemberEmailsAsync(Guid documentId);
    Task<IReadOnlyList<string>> ReplaceMembersAsync(Guid documentId, IReadOnlyCollection<string> emails);
    Task UpdateDocumentAsync(Data.CloudBoard document);
    Task<bool> DeleteDocumentAsync(Guid id);
}