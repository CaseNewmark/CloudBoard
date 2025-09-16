using CloudBoard.ApiService.Data;
using CloudBoard.ApiService.Services.Contracts;
using Microsoft.EntityFrameworkCore;

namespace CloudBoard.ApiService.Services;

public class ConnectorRepository : Repository<Connector, Guid>, IConnectorRepository
{
    public ConnectorRepository(
        CloudBoardDbContext dbContext,
        ILogger<ConnectorRepository> logger) : base(dbContext, logger)
    {
    }

    public async Task<Connector?> GetConnectorByIdAsync(Guid connectorId)
    {
        try
        {
            return await _dbSet
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
            return await _dbSet
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
            _dbSet.Add(connector);
            await _context.SaveChangesAsync();
            
            // Reload to get any database-generated values and related entities
            await _context.Entry(connector)
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
            var existingConnector = await _dbSet
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

            await _context.SaveChangesAsync();
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
            var connector = await _dbSet
                .FirstOrDefaultAsync(c => c.Id == connectorId);

            if (connector == null)
            {
                _logger.LogWarning("Connector with ID {ConnectorId} not found for deletion", connectorId);
                return false;
            }
            
            _dbSet.Remove(connector);
            await _context.SaveChangesAsync();
            
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting connector with ID {ConnectorId}", connectorId);
            throw;
        }
    }
}
