using CloudBoard.ApiService.Data;
using CloudBoard.ApiService.Services.Contracts;
using Microsoft.EntityFrameworkCore;

namespace CloudBoard.ApiService.Services;

public class NodeRepository : Repository<Node, Guid>, INodeRepository
{
    public NodeRepository(
        CloudBoardDbContext dbContext,
        ILogger<NodeRepository> logger) : base(dbContext, logger)
    {
    }

    // Maintain existing specific methods for backward compatibility
    public async Task<Node?> GetNodeByIdAsync(Guid nodeId)
    {
        try
        {
            return await _dbSet
                .Include(n => n.Connectors)
                .FirstOrDefaultAsync(n => n.Id == nodeId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving node with ID {NodeId}", nodeId);
            throw;
        }
    }

    public async Task<Node> AddNodeAsync(Node node)
    {
        try
        {
            _dbSet.Add(node);
            await _context.SaveChangesAsync();
            
            // Reload to get any database-generated values and related entities
            await _context.Entry(node)
                .Reference(n => n.CloudBoardDocument)
                .LoadAsync();
                
            await _context.Entry(node)
                .Collection(n => n.Connectors)
                .LoadAsync();
                
            return node;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding node with name {NodeName}", node.Name);
            throw;
        }
    }

    public async Task<Node?> UpdateNodeAsync(Node node)
    {
        try
        {
            var existingNode = await GetNodeByIdAsync(node.Id);
            if (existingNode == null)
            {
                _logger.LogWarning("Attempted to update non-existent node with ID {NodeId}", node.Id);
                return null;
            }

            // Update the node properties
            _context.Entry(existingNode).CurrentValues.SetValues(node);
            
            // Handle position updates
            existingNode.Position.X = node.Position.X;
            existingNode.Position.Y = node.Position.Y;

            // Handle connectors - this is a complex operation
            // Remove connectors that are no longer present
            var existingConnectorIds = existingNode.Connectors.Select(c => c.Id).ToList();
            var newConnectorIds = node.Connectors.Select(c => c.Id).ToList();
            var connectorsToRemove = existingNode.Connectors
                .Where(c => !newConnectorIds.Contains(c.Id))
                .ToList();

            foreach (var connectorToRemove in connectorsToRemove)
            {
                existingNode.Connectors.Remove(connectorToRemove);
                _context.Connectors.Remove(connectorToRemove);
            }

            // Add or update connectors
            foreach (var updatedConnector in node.Connectors)
            {
                var existingConnector = existingNode.Connectors
                    .FirstOrDefault(c => c.Id == updatedConnector.Id);

                if (existingConnector == null)
                {
                    // New connector
                    updatedConnector.NodeId = existingNode.Id;
                    existingNode.Connectors.Add(updatedConnector);
                }
                else
                {
                    // Update existing connector
                    _context.Entry(existingConnector).CurrentValues.SetValues(updatedConnector);
                }
            }

            await _context.SaveChangesAsync();
            return existingNode;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating node with ID {NodeId}", node.Id);
            throw;
        }
    }

    public async Task<bool> DeleteNodeAsync(Guid nodeId)
    {
        try
        {
            var node = await GetNodeByIdAsync(nodeId);
            if (node == null)
            {
                _logger.LogWarning("Attempted to delete non-existent node with ID {NodeId}", nodeId);
                return false;
            }

            // Remove the node (cascading deletes should handle connectors and connections)
            _context.Nodes.Remove(node);
            await _context.SaveChangesAsync();
            
            _logger.LogInformation("Successfully deleted node with ID {NodeId}", nodeId);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting node with ID {NodeId}", nodeId);
            throw;
        }
    }

    // Additional specific method for getting nodes by CloudBoard ID
    public async Task<IEnumerable<Node>> GetNodesByCloudBoardIdAsync(Guid cloudBoardId)
    {
        try
        {
            return await _dbSet
                .Where(n => n.CloudBoardDocumentId == cloudBoardId)
                .Include(n => n.Connectors)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving nodes for CloudBoard with ID {CloudBoardId}", cloudBoardId);
            throw;
        }
    }
}