using CloudBoard.ApiService.Dtos;

namespace CloudBoard.ApiService.Services.Contracts;

public interface IConnectorService
{
    Task<ConnectorDto?> GetConnectorByIdAsync(string connectorId);
    Task<IEnumerable<ConnectorDto>> GetConnectorsByNodeIdAsync(string nodeId);
    Task<ConnectorDto> CreateConnectorAsync(string nodeId, ConnectorDto connectorDto);
    Task<ConnectorDto?> UpdateConnectorAsync(ConnectorDto connectorDto);
    Task<bool> DeleteConnectorAsync(string connectorId);
}
