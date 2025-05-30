using CloudBoard.ApiService.Dtos;

namespace CloudBoard.ApiService.Services.Contracts;

public interface IConnectionService
{
    Task<ConnectionDto?> GetConnectionByIdAsync(string connectionId);
    Task<IEnumerable<ConnectionDto>> GetConnectionsByCloudBoardDocumentIdAsync(string cloudBoardId);
    Task<IEnumerable<ConnectionDto>> GetConnectionsByConnectorIdAsync(string connectorId);
    Task<ConnectionDto> CreateConnectionAsync(string cloudBoardId, ConnectionDto connectionDto);
    Task<ConnectionDto?> UpdateConnectionAsync(ConnectionDto connectionDto);
    Task<bool> DeleteConnectionAsync(string connectionId);
}
