using CloudBoard.ApiService.Dtos;

namespace CloudBoard.ApiService.Services.Contracts;

public interface IConnectionService
{
    Task<ConnectionDto?> GetConnectionByIdAsync(Guid connectionId);
    Task<IEnumerable<ConnectionDto>> GetConnectionsByCloudBoardDocumentIdAsync(Guid cloudBoardDocumentId);
    Task<IEnumerable<ConnectionDto>> GetConnectionsByConnectorIdAsync(Guid connectorId);
    Task<ConnectionDto> CreateConnectionAsync(CreateConnectionDto createConnectionDto);
    Task<ConnectionDto?> UpdateConnectionAsync(Guid connectionId, ConnectionDto connectionDto);
    Task<bool> DeleteConnectionAsync(Guid connectionId);
}
