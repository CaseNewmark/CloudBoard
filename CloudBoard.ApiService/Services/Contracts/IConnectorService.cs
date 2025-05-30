using CloudBoard.ApiService.Dtos;

namespace CloudBoard.ApiService.Services.Contracts;

public interface IConnectorService
{
    Task<ConnectorDto?> GetConnectorByIdAsync(Guid connectorId);
    Task<IEnumerable<ConnectorDto>> GetConnectorsByNodeIdAsync(Guid nodeId);
    Task<ConnectorDto> CreateConnectorAsync(Guid nodeId, ConnectorDto connectorDto);
    Task<ConnectorDto?> UpdateConnectorAsync(ConnectorDto connectorDto);
    Task<bool> DeleteConnectorAsync(Guid connectorId);
}
