using CloudBoard.ApiService.Data;
using CloudBoard.ApiService.Services.Contracts;
using Microsoft.EntityFrameworkCore;

namespace CloudBoard.ApiService.Services;

public class CloudBoardRepository : Repository<Data.CloudBoard, Guid>, ICloudBoardRepository
{
    public CloudBoardRepository(CloudBoardDbContext dbContext, ILogger<CloudBoardRepository> logger) 
        : base(dbContext, logger)
    {
    }

    // Maintain existing specific methods for backward compatibility
    public async Task<Data.CloudBoard> CreateDocumentAsync(Data.CloudBoard document)
    {
        try
        {
            _dbSet.Add(document);
            await _context.SaveChangesAsync();
            return document;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating CloudBoard document with name {Name}", document.Name);
            throw;
        }
    }
    
    public async Task<Data.CloudBoard?> GetDocumentByIdAsync(Guid id)
    {
        try
        {
            return await _dbSet
                .Include(d => d.Nodes)
                    .ThenInclude(n => n.Connectors)
                .Include(d => d.Connections)
                .FirstOrDefaultAsync(d => d.Id == id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving CloudBoard document with ID {Id}", id);
            throw;
        }
    }

    public async Task<IEnumerable<Data.CloudBoard>> GetAllDocumentsByUserAsync(string userId)
    {
        try
        {
            return await _dbSet
                .Where(d => d.CreatedBy == userId)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving all CloudBoard documents for user {UserId}", userId);
            throw;
        }
    }

    public async Task UpdateDocumentAsync(Data.CloudBoard document)
    {
        try
        {
            // First, get the existing document with all related entities
            var existingDocument = await _context.CloudBoardDocuments
                .Include(d => d.Nodes)
                    .ThenInclude(n => n.Connectors)
                .Include(d => d.Connections)
                .FirstOrDefaultAsync(d => d.Id == document.Id);

            if (existingDocument == null)
            {
                throw new KeyNotFoundException($"CloudBoard document with ID {document.Id} not found");
            }

            // Update basic document properties
            _context.Entry(existingDocument).CurrentValues.SetValues(document);

            // Handle nodes
            // 1. Remove nodes that no longer exist in the updated document
            foreach (var existingNode in existingDocument.Nodes.ToList())
            {
                if (!document.Nodes.Any(n => n.Id == existingNode.Id))
                {
                    _context.Nodes.Remove(existingNode);
                }
            }

            // 2. Update existing nodes and add new ones
            foreach (var updatedNode in document.Nodes)
            {
                var existingNode = existingDocument.Nodes.FirstOrDefault(n => n.Id == updatedNode.Id);
                if (existingNode == null)
                {
                    // New node, add it and ensure foreign key is set
                    updatedNode.CloudBoardDocumentId = existingDocument.Id;

                    existingDocument.Nodes.Add(updatedNode);
                }
                else
                {
                    // Update existing node
                    _context.Entry(existingNode).CurrentValues.SetValues(updatedNode);

                    existingNode.CloudBoardDocumentId = existingDocument.Id; 
                    existingNode.Position.Y = updatedNode.Position.Y;
                    existingNode.Position.X = updatedNode.Position.X;

                    // Handle connectors for this node
                    // Remove connectors that don't exist anymore
                    foreach (var existingConnector in existingNode.Connectors.ToList())
                    {
                        if (!updatedNode.Connectors.Any(c => c.Id == existingConnector.Id))
                        {
                            _context.Connectors.Remove(existingConnector);
                        }
                    }

                    // Add or update connectors
                    foreach (var updatedConnector in updatedNode.Connectors)
                    {
                        var existingConnector = existingNode.Connectors.FirstOrDefault(c => c.Id == updatedConnector.Id);
                        if (existingConnector == null)
                        {
                            // New connector, ensure foreign key is set
                            updatedConnector.NodeId = existingNode.Id;
                            existingNode.Connectors.Add(updatedConnector);
                        }
                        else
                        {
                            // Update existing connector
                            _context.Entry(existingConnector).CurrentValues.SetValues(updatedConnector);
                            existingConnector.NodeId = existingNode.Id; // Ensure foreign key is set
                        }
                    }
                }
            }

            // Handle connections
            // 1. Remove connections that no longer exist
            foreach (var existingConnection in existingDocument.Connections.ToList())
            {
                if (!document.Connections.Any(c => c.Id == existingConnection.Id))
                {
                    _context.Connections.Remove(existingConnection);
                }
            }

            // 2. Update existing connections and add new ones
            foreach (var updatedConnection in document.Connections)
            {
                var existingConnection = existingDocument.Connections.FirstOrDefault(c => c.Id == updatedConnection.Id);
                if (existingConnection == null)
                {
                    // New connection, ensure foreign key is set
                    updatedConnection.CloudBoardDocumentId = existingDocument.Id;
                    existingDocument.Connections.Add(updatedConnection);
                }
                else
                {
                    // Update existing connection
                    _context.Entry(existingConnection).CurrentValues.SetValues(updatedConnection);
                    existingConnection.CloudBoardDocumentId = existingDocument.Id; // Ensure foreign key is set
                }
            }

            // Save all changes
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException ex)
        {
            // Handle concurrency issues
            throw new InvalidOperationException("The document was modified by another user. Please reload and try again.", ex);
        }
        catch (Exception ex)
        {
            // Handle other exceptions
            _logger.LogError(ex, "Error updating CloudBoard document with ID {Id}", document.Id);
            throw new InvalidOperationException("An error occurred while updating the document.", ex);
        }
    }

    public async Task<bool> DeleteDocumentAsync(Guid id)
    {
        try
        {
            var document = await _context.CloudBoardDocuments.FindAsync(id);
            if (document == null) return false;
            _context.CloudBoardDocuments.Remove(document);
            await _context.SaveChangesAsync();
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting CloudBoard document with ID {Id}", id);
            throw;
        }
    }
}