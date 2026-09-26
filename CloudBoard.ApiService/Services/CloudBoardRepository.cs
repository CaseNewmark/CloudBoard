using CloudBoard.ApiService.Data;
using CloudBoard.ApiService.Services.Contracts;
using Microsoft.EntityFrameworkCore;

namespace CloudBoard.ApiService.Services;

public class CloudBoardRepository : ICloudBoardRepository
{
    private readonly CloudBoardDbContext _dbContext;

    public CloudBoardRepository(CloudBoardDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Data.CloudBoard> CreateDocumentAsync(Data.CloudBoard document)
    {
        _dbContext.CloudBoardDocuments.Add(document);
        await _dbContext.SaveChangesAsync();
        return document;
    }
    
    public async Task<Data.CloudBoard?> GetDocumentByIdAsync(Guid id)
    {
        return await _dbContext.CloudBoardDocuments
            .Include(d => d.Nodes)
                .ThenInclude(n => n.Connectors)
            .Include(d => d.Connections)
            .FirstOrDefaultAsync(d => d.Id == id);
    }

    public async Task<IEnumerable<Data.CloudBoard>> GetAllDocumentsByUserAsync(string userId)
    {
        return await _dbContext.CloudBoardDocuments
            .Where(d => d.CreatedBy == userId)
            .ToListAsync();
    }

    public async Task UpdateDocumentAsync(Data.CloudBoard document)
    {
        // Only board metadata is updated here. Nodes, connectors and connections have
        // their own endpoints; syncing them from this payload would delete everything
        // on the board whenever a caller sends a board without its children (e.g. one
        // taken from the list endpoint, which doesn't include them).
        var existingDocument = await _dbContext.CloudBoardDocuments
            .FirstOrDefaultAsync(d => d.Id == document.Id);

        if (existingDocument == null)
        {
            throw new KeyNotFoundException($"CloudBoard document with ID {document.Id} not found");
        }

        existingDocument.Name = document.Name;
        existingDocument.Description = document.Description;

        try
        {
            await _dbContext.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException ex)
        {
            throw new InvalidOperationException("The document was modified by another user. Please reload and try again.", ex);
        }
    }

    public async Task<bool> DeleteDocumentAsync(Guid id)
    {
        var document = await _dbContext.CloudBoardDocuments.FindAsync(id);
        if (document == null) return false;
        _dbContext.CloudBoardDocuments.Remove(document);
        await _dbContext.SaveChangesAsync();
        return true;
    }
}