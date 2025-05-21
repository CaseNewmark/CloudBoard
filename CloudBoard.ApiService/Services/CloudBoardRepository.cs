using CloudBoard.ApiService.Services.Contracts;
using Microsoft.EntityFrameworkCore;

namespace CloudBoard.ApiService.Data
{
    public class CloudBoardRepository : ICloudBoardRepository
    {
        private readonly CloudBoardDbContext _dbContext;

        public CloudBoardRepository(CloudBoardDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<CloudBoardDocument> CreateDocumentAsync(CloudBoardDocument document)
        {
            _dbContext.CloudBoardDocuments.Add(document);
            await _dbContext.SaveChangesAsync();
            return document;
        }
        
        public async Task<CloudBoardDocument?> GetDocumentByIdAsync(Guid id)
        {
            return await _dbContext.CloudBoardDocuments
                .Include(d => d.Nodes)
                    .ThenInclude(n => n.Connectors)
                .Include(d => d.Connections)
                .FirstOrDefaultAsync(d => d.Id == id);
        }

        public async Task<IEnumerable<CloudBoardDocument>> GetAllDocumentsAsync()
        {
            return await _dbContext.CloudBoardDocuments
                .ToListAsync();
        }

        public async Task UpdateDocumentAsync(CloudBoardDocument document)
        {
            _dbContext.CloudBoardDocuments.Update(document);
            await _dbContext.SaveChangesAsync();
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
}