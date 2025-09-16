using CloudBoard.ApiService.Data;

namespace CloudBoard.ApiService.Services.Contracts;

public interface IConnectorRepository : IRepository<Connector, Guid>
{
    // Specific methods for Connector operations beyond the generic ones
    Task<Connector?> GetConnectorByIdAsync(Guid connectorId);
    Task<IEnumerable<Connector>> GetConnectorsByNodeIdAsync(Guid nodeId);
    Task<Connector> AddConnectorAsync(Connector connector);
    Task<Connector?> UpdateConnectorAsync(Connector connector);
    Task<bool> DeleteConnectorAsync(Guid connectorId);
}
