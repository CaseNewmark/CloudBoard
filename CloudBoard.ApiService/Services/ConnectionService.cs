using AutoMapper;
using CloudBoard.ApiService.Data;
using CloudBoard.ApiService.Dtos;
using CloudBoard.ApiService.Services.Contracts;

namespace CloudBoard.ApiService.Services;

public class ConnectionService : IConnectionService
{
    private readonly IConnectionRepository _connectionRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<ConnectionService> _logger;

    public ConnectionService(
        IConnectionRepository connectionRepository,
        IMapper mapper,
        ILogger<ConnectionService> logger)
    {
        _connectionRepository = connectionRepository ?? throw new ArgumentNullException(nameof(connectionRepository));
        _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<ConnectionDto?> GetConnectionByIdAsync(Guid connectionId)
    {
        try
        {
            var connection = await _connectionRepository.GetConnectionByIdAsync(connectionId);
            if (connection == null)
            {
                _logger.LogWarning("Connection with ID {ConnectionId} not found", connectionId);
                return null;
            }

            return _mapper.Map<ConnectionDto>(connection);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving connection with ID {ConnectionId}", connectionId);
            throw;
        }
    }

    public async Task<IEnumerable<ConnectionDto>> GetConnectionsByCloudBoardDocumentIdAsync(Guid cloudBoardDocumentId)
    {
        try
        {
            var connections = await _connectionRepository.GetConnectionsByCloudBoardDocumentIdAsync(cloudBoardDocumentId);
            return _mapper.Map<IEnumerable<ConnectionDto>>(connections);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving connections for CloudBoard document with ID {CloudBoardDocumentId}", cloudBoardDocumentId);
            throw;
        }
    }

    public async Task<IEnumerable<ConnectionDto>> GetConnectionsByConnectorIdAsync(Guid connectorId)
    {
        try
        {
            var connections = await _connectionRepository.GetConnectionsByConnectorIdAsync(connectorId);
            return _mapper.Map<IEnumerable<ConnectionDto>>(connections);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving connections for connector with ID {ConnectorId}", connectorId);
            throw;
        }
    }

    public async Task<ConnectionDto> CreateConnectionAsync(CreateConnectionDto createConnectionDto)
    {
        try
        {
            var connection = new Connection
            {
                FromConnectorId = Guid.Parse(createConnectionDto.FromConnectorId),
                ToConnectorId = Guid.Parse(createConnectionDto.ToConnectorId),
                CloudBoardDocumentId = createConnectionDto.CloudBoardDocumentId
            };

            var createdConnection = await _connectionRepository.AddConnectionAsync(connection);
            return _mapper.Map<ConnectionDto>(createdConnection);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating connection between connectors {FromConnectorId} and {ToConnectorId}",
                createConnectionDto.FromConnectorId, createConnectionDto.ToConnectorId);
            throw;
        }
    }

    public async Task<ConnectionDto?> UpdateConnectionAsync(Guid connectionId, ConnectionDto connectionDto)
    {
        try
        {
            // Verify the connection exists
            var connectionExists = await _connectionRepository.GetConnectionByIdAsync(connectionId);
            if (connectionExists == null)
            {
                _logger.LogWarning("Connection with ID {ConnectionId} not found for update", connectionId);
                return null;
            }

            // Map DTO to entity
            var connectionToUpdate = _mapper.Map<Connection>(connectionDto);
            
            // Ensure the ID is set correctly
            connectionToUpdate.Id = connectionId;

            // Update the connection
            var updatedConnection = await _connectionRepository.UpdateConnectionAsync(connectionToUpdate);
            if (updatedConnection == null)
            {
                _logger.LogWarning("Connection with ID {ConnectionId} could not be updated", connectionId);
                return null;
            }

            return _mapper.Map<ConnectionDto>(updatedConnection);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating connection with ID {ConnectionId}", connectionId);
            throw;
        }
    }

    public async Task<bool> DeleteConnectionAsync(Guid connectionId)
    {
        try
        {
            return await _connectionRepository.DeleteConnectionAsync(connectionId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting connection with ID {ConnectionId}", connectionId);
            throw;
        }
    }
}
