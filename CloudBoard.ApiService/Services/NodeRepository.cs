using CloudBoard.ApiService.Data;
using CloudBoard.ApiService.Services.Contracts;
using Microsoft.EntityFrameworkCore;

namespace CloudBoard.ApiService.Services;

public class NodeRepository : INodeRepository
{
    private readonly CloudBoardDbContext _dbContext;
    private readonly ILogger<NodeRepository> _logger;

    public NodeRepository(
        CloudBoardDbContext dbContext,
        ILogger<NodeRepository> logger)
    {
        _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<Node?> GetNodeByIdAsync(Guid nodeId)
    {
        try
        {
            return await _dbContext.Nodes
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
            _dbContext.Nodes.Add(node);
            await _dbContext.SaveChangesAsync();
            
            // Reload to get any database-generated values and related entities
            await _dbContext.Entry(node)
                .Reference(n => n.CloudBoardDocument)
                .LoadAsync();
                
            await _dbContext.Entry(node)
                .Collection(n => n.Connectors)
                .LoadAsync();
                
            return node;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding node {NodeName} to document {DocumentId}", 
                node.Name, node.CloudBoardDocumentId);
            throw;
        }
    }

    public async Task<Node?> UpdateNodeAsync(Node node)
    {
        try
        {
            var existingNode = await _dbContext.Nodes
                .Include(n => n.Connectors)
                .FirstOrDefaultAsync(n => n.Id == node.Id);

            if (existingNode == null)
            {
                _logger.LogWarning("Node with ID {NodeId} not found for update", node.Id);
                return null;
            }

            // Dispose existing properties to prevent memory leaks
            existingNode.Properties?.Dispose();

            // Update node properties
            existingNode.Name = node.Name;
            existingNode.Position = node.Position;
            existingNode.Type = node.Type;
            existingNode.Properties = node.Properties;

            // Update connectors
            existingNode.Connectors.Clear();
            foreach (var connector in node.Connectors)
            {
                existingNode.Connectors.Add(connector);
            }

            await _dbContext.SaveChangesAsync();
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
            var node = await _dbContext.Nodes
                .FirstOrDefaultAsync(n => n.Id == nodeId);

            if (node == null)
            {
                _logger.LogWarning("Node with ID {NodeId} not found for deletion", nodeId);
                return false;
            }

            // Dispose properties to prevent memory leaks
            node.Properties?.Dispose();
            
            _dbContext.Nodes.Remove(node);
            await _dbContext.SaveChangesAsync();
            
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting node with ID {NodeId}", nodeId);
            throw;
        }
    }
}