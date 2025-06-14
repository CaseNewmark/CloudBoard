using CloudBoard.ApiService.Data;
using CloudBoard.ApiService.Dtos;

namespace CloudBoard.ApiService.Services.Contracts;

public interface ICloudBoardService
{
    Task<CloudBoardDto> CreateDocumentAsync(CloudBoardDto documentDto);
    Task<IEnumerable<CloudBoardDto>> GetAllCloudBoardDocumentsByUserAsync(string userId);
    Task<CloudBoardDto> GetCloudBoardDocumentByIdAsync(string id);
    Task<CloudBoardDto?> UpdateCloudBoardDocumentAsync(CloudBoardDto updateDto);
    Task<bool> DeleteCloudBoardDocumentAsync(string id);
}