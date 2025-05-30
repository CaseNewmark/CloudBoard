using CloudBoard.ApiService.Dtos;

namespace CloudBoard.ApiService.Services.Contracts;

public interface IConnectionService
{
    Task<ConnectionDto?> GetConnectionByIdAsync(Guid connectionId);
    Task<IEnumerable<ConnectionDto>> GetConnectionsByCloudBoardDocumentIdAsync(Guid cloudBoardId);
    Task<IEnumerable<ConnectionDto>> GetConnectionsByConnectorIdAsync(Guid connectorId);
    Task<ConnectionDto> CreateConnectionAsync(Guid cloudBoardId, ConnectionDto connectionDto);
    Task<ConnectionDto?> UpdateConnectionAsync(ConnectionDto connectionDto);
    Task<bool> DeleteConnectionAsync(Guid connectionId);
}
