using CloudBoard.ApiService.Data;
using CloudBoard.ApiService.Services.Contracts;
using Microsoft.EntityFrameworkCore;

namespace CloudBoard.ApiService.Services;

public class ConnectorRepository : IConnectorRepository
{
    private readonly CloudBoardDbContext _dbContext;
    private readonly ILogger<ConnectorRepository> _logger;

    public ConnectorRepository(
        CloudBoardDbContext dbContext,
        ILogger<ConnectorRepository> logger)
    {
        _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<Connector?> GetConnectorByIdAsync(Guid connectorId)
    {
        try
        {
            return await _dbContext.Connectors
                .Include(c => c.Node)
                .FirstOrDefaultAsync(c => c.Id == connectorId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving connector with ID {ConnectorId}", connectorId);
            throw;
        }
    }

    public async Task<IEnumerable<Connector>> GetConnectorsByNodeIdAsync(Guid nodeId)
    {
        try
        {
            return await _dbContext.Connectors
                .Where(c => c.NodeId == nodeId)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving connectors for node with ID {NodeId}", nodeId);
            throw;
        }
    }

    public async Task<Connector> AddConnectorAsync(Connector connector)
    {
        try
        {
            _dbContext.Connectors.Add(connector);
            await _dbContext.SaveChangesAsync();
            
            // Reload to get any database-generated values and related entities
            await _dbContext.Entry(connector)
                .Reference(c => c.Node)
                .LoadAsync();
                
            return connector;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding connector {ConnectorName} to node {NodeId}", 
                connector.Name, connector.NodeId);
            throw;
        }
    }

    public async Task<Connector?> UpdateConnectorAsync(Connector connector)
    {
        try
        {
            var existingConnector = await _dbContext.Connectors
                .FirstOrDefaultAsync(c => c.Id == connector.Id);

            if (existingConnector == null)
            {
                _logger.LogWarning("Connector with ID {ConnectorId} not found for update", connector.Id);
                return null;
            }

            // Update connector properties
            existingConnector.Name = connector.Name;
            existingConnector.Position = connector.Position;
            existingConnector.Type = connector.Type;
            
            // Only update NodeId if it's different and not empty
            if (connector.NodeId != Guid.Empty && existingConnector.NodeId != connector.NodeId)
            {
                existingConnector.NodeId = connector.NodeId;
            }

            await _dbContext.SaveChangesAsync();
            return existingConnector;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating connector with ID {ConnectorId}", connector.Id);
            throw;
        }
    }

    public async Task<bool> DeleteConnectorAsync(Guid connectorId)
    {
        try
        {
            var connector = await _dbContext.Connectors
                .FirstOrDefaultAsync(c => c.Id == connectorId);

            if (connector == null)
            {
                _logger.LogWarning("Connector with ID {ConnectorId} not found for deletion", connectorId);
                return false;
            }
            
            _dbContext.Connectors.Remove(connector);
            await _dbContext.SaveChangesAsync();
            
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting connector with ID {ConnectorId}", connectorId);
            throw;
        }
    }
}
