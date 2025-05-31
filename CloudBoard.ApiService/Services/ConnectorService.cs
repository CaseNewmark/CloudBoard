using AutoMapper;
using CloudBoard.ApiService.Data;
using CloudBoard.ApiService.Dtos;
using CloudBoard.ApiService.Services.Contracts;

namespace CloudBoard.ApiService.Services;

public class ConnectorService : IConnectorService
{
    private readonly INodeRepository _nodeRepository;
    private readonly IConnectorRepository _connectorRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<ConnectorService> _logger;

    public ConnectorService(
        INodeRepository nodeRepository,
        IConnectorRepository connectorRepository,
        IMapper mapper,
        ILogger<ConnectorService> logger)
    {
        _nodeRepository = nodeRepository ?? throw new ArgumentNullException(nameof(nodeRepository));    
        _connectorRepository = connectorRepository ?? throw new ArgumentNullException(nameof(connectorRepository));
        _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<ConnectorDto?> GetConnectorByIdAsync(string id)
    {
        var connectorId = Guid.Parse(id);
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

    public async Task<IEnumerable<ConnectorDto>> GetConnectorsByNodeIdAsync(string id)
    {
        var nodeId = Guid.Parse(id);
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

    public async Task<ConnectorDto> CreateConnectorAsync(string id, ConnectorDto connectorDto)
    {
        var nodeId = Guid.Parse(id);
        try
        {
            // Verify the node exists
            var nodeExists = await _nodeRepository.GetNodeByIdAsync(nodeId);
            if (nodeExists == null)
            {
                _logger.LogWarning("Node with ID {NodeId} not found for connector creation", nodeId);
                throw new ArgumentException($"Node with ID {nodeId} does not exist.");
            }

            var connector = _mapper.Map<Connector>(connectorDto);
            connector.NodeId = nodeId;
            
            var createdConnector = await _connectorRepository.AddConnectorAsync(connector);
            return _mapper.Map<ConnectorDto>(createdConnector);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating connector {ConnectorName} for node {NodeId}",
                connectorDto.Name, nodeId);
            throw;
        }
    }

    public async Task<ConnectorDto?> UpdateConnectorAsync(ConnectorDto connectorDto)
    {
        var connectorId = Guid.Parse(connectorDto.Id);
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

    public async Task<bool> DeleteConnectorAsync(string id)
    {
        var connectorId = Guid.Parse(id);
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
