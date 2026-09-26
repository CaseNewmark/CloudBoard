using CloudBoard.ApiService.Data;
using CloudBoard.ApiService.Dtos;

namespace CloudBoard.ApiService.Services.Contracts;

public interface ICloudBoardService
{
    Task<CloudBoardDto> CreateDocumentAsync(CloudBoardDto documentDto);
    Task<IEnumerable<CloudBoardDto>> GetAllCloudBoardDocumentsByUserAsync(string userId, string? verifiedEmail);
    Task<IReadOnlyList<string>> GetMembersAsync(Guid documentId);
    Task<IReadOnlyList<string>> SetMembersAsync(Guid documentId, IReadOnlyCollection<string> emails);
    Task<CloudBoardDto> GetCloudBoardDocumentByIdAsync(string id);
    Task<CloudBoardDto?> UpdateCloudBoardDocumentAsync(CloudBoardDto updateDto);
    Task<bool> DeleteCloudBoardDocumentAsync(string id);
}