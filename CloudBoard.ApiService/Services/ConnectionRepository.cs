using CloudBoard.ApiService.Data;
using CloudBoard.ApiService.Services.Contracts;
using Microsoft.EntityFrameworkCore;

namespace CloudBoard.ApiService.Services;

public class ConnectionRepository : IConnectionRepository
{
    private readonly CloudBoardDbContext _dbContext;
    private readonly ILogger<ConnectionRepository> _logger;

    public ConnectionRepository(CloudBoardDbContext dbContext, ILogger<ConnectionRepository> logger)
    {
        _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<Connection?> GetConnectionByIdAsync(Guid connectionId)
    {
        try
        {
            return await _dbContext.Connections.FindAsync(connectionId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving connection with ID {ConnectionId}", connectionId);
            throw;
        }
    }

    public async Task<IEnumerable<Connection>> GetConnectionsByCloudBoardDocumentIdAsync(Guid cloudBoardDocumentId)
    {
        try
        {
            return await _dbContext.Connections
                .Where(c => c.CloudBoardDocumentId == cloudBoardDocumentId)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving connections for CloudBoard document with ID {CloudBoardDocumentId}", cloudBoardDocumentId);
            throw;
        }
    }

    public async Task<IEnumerable<Connection>> GetConnectionsByConnectorIdAsync(Guid connectorId)
    {
        try
        {
            return await _dbContext.Connections
                .Where(c => c.FromConnectorId == connectorId || c.ToConnectorId == connectorId)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving connections for connector with ID {ConnectorId}", connectorId);
            throw;
        }
    }

    public async Task<Connection> AddConnectionAsync(Connection connection)
    {
        try
        {
            _dbContext.Connections.Add(connection);
            await _dbContext.SaveChangesAsync();
            return connection;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding connection between connectors {FromConnectorId} and {ToConnectorId}", 
                connection.FromConnectorId, connection.ToConnectorId);
            throw;
        }
    }

    public async Task<Connection?> UpdateConnectionAsync(Connection connection)
    {
        try
        {
            var existingConnection = await _dbContext.Connections.FindAsync(connection.Id);
            if (existingConnection == null)
            {
                _logger.LogWarning("Connection with ID {ConnectionId} not found for update", connection.Id);
                return null;
            }

            // Update the properties
            existingConnection.FromConnectorId = connection.FromConnectorId;
            existingConnection.ToConnectorId = connection.ToConnectorId;
            existingConnection.CloudBoardDocumentId = connection.CloudBoardDocumentId;

            await _dbContext.SaveChangesAsync();
            return existingConnection;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating connection with ID {ConnectionId}", connection.Id);
            throw;
        }
    }

    public async Task<bool> DeleteConnectionAsync(Guid connectionId)
    {
        try
        {
            var connection = await _dbContext.Connections.FindAsync(connectionId);
            if (connection == null)
            {
                _logger.LogWarning("Connection with ID {ConnectionId} not found for deletion", connectionId);
                return false;
            }

            _dbContext.Connections.Remove(connection);
            await _dbContext.SaveChangesAsync();
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting connection with ID {ConnectionId}", connectionId);
            throw;
        }
    }
}
