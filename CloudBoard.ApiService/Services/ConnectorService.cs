using AutoMapper;
using CloudBoard.ApiService.Data;
using CloudBoard.ApiService.Dtos;
using CloudBoard.ApiService.Services.Contracts;

namespace CloudBoard.ApiService.Services;

public class ConnectorService : IConnectorService
{
    private readonly IConnectorRepository _connectorRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<ConnectorService> _logger;

    public ConnectorService(
        IConnectorRepository connectorRepository,
        IMapper mapper,
        ILogger<ConnectorService> logger)
    {
        _connectorRepository = connectorRepository ?? throw new ArgumentNullException(nameof(connectorRepository));
        _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<ConnectorDto?> GetConnectorByIdAsync(Guid connectorId)
    {
        try
        {
            var connector = await _connectorRepository.GetConnectorByIdAsync(connectorId);
            if (connector == null)
            {
                _logger.LogWarning("Connector with ID {ConnectorId} not found", connectorId);
                return null;
            }

            return _mapper.Map<ConnectorDto>(connector);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving connector with ID {ConnectorId}", connectorId);
            throw;
        }
    }

    public async Task<IEnumerable<ConnectorDto>> GetConnectorsByNodeIdAsync(Guid nodeId)
    {
        try
        {
            var connectors = await _connectorRepository.GetConnectorsByNodeIdAsync(nodeId);
            return _mapper.Map<IEnumerable<ConnectorDto>>(connectors);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving connectors for node with ID {NodeId}", nodeId);
            throw;
        }
    }

    public async Task<ConnectorDto> CreateConnectorAsync(CreateConnectorDto createConnectorDto)
    {
        try
        {
            var connector = _mapper.Map<Connector>(createConnectorDto);
            var createdConnector = await _connectorRepository.AddConnectorAsync(connector);
            return _mapper.Map<ConnectorDto>(createdConnector);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating connector {ConnectorName} for node {NodeId}",
                createConnectorDto.Name, createConnectorDto.NodeId);
            throw;
        }
    }

    public async Task<ConnectorDto?> UpdateConnectorAsync(Guid connectorId, ConnectorDto connectorDto)
    {
        try
        {
            // Verify the connector exists
            var connectorExists = await _connectorRepository.GetConnectorByIdAsync(connectorId);
            if (connectorExists == null)
            {
                _logger.LogWarning("Connector with ID {ConnectorId} not found for update", connectorId);
                return null;
            }

            // Map DTO to entity
            var connectorToUpdate = _mapper.Map<Connector>(connectorDto);
            
            // Ensure the ID is set correctly
            connectorToUpdate.Id = connectorId;

            // Update the connector
            var updatedConnector = await _connectorRepository.UpdateConnectorAsync(connectorToUpdate);
            if (updatedConnector == null)
            {
                _logger.LogWarning("Connector with ID {ConnectorId} could not be updated", connectorId);
                return null;
            }

            return _mapper.Map<ConnectorDto>(updatedConnector);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating connector with ID {ConnectorId}", connectorId);
            throw;
        }
    }

    public async Task<bool> DeleteConnectorAsync(Guid connectorId)
    {
        try
        {
            return await _connectorRepository.DeleteConnectorAsync(connectorId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting connector with ID {ConnectorId}", connectorId);
            throw;
        }
    }
}
