using CloudBoard.ApiService.Data;

namespace CloudBoard.ApiService.Services.Contracts;

public interface IConnectionRepository
{
    Task<Connection?> GetConnectionByIdAsync(Guid connectionId);
    Task<IEnumerable<Connection>> GetConnectionsByCloudBoardDocumentIdAsync(Guid cloudBoardDocumentId);
    Task<IEnumerable<Connection>> GetConnectionsByConnectorIdAsync(Guid connectorId);
    Task<Connection> AddConnectionAsync(Connection connection);
    Task<Connection?> UpdateConnectionAsync(Connection connection);
    Task<bool> DeleteConnectionAsync(Guid connectionId);
}
