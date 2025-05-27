using CloudBoard.ApiService.Dtos;

namespace CloudBoard.ApiService.Services.Contracts;

public interface IConnectorService
{
    Task<ConnectorDto?> GetConnectorByIdAsync(Guid connectorId);
    Task<IEnumerable<ConnectorDto>> GetConnectorsByNodeIdAsync(Guid nodeId);
    Task<ConnectorDto> CreateConnectorAsync(CreateConnectorDto createConnectorDto);
    Task<ConnectorDto?> UpdateConnectorAsync(Guid connectorId, ConnectorDto connectorDto);
    Task<bool> DeleteConnectorAsync(Guid connectorId);
}
