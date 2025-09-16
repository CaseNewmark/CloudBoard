using CloudBoard.ApiService.Services.Contracts;

namespace CloudBoard.ApiService.Services.Contracts;

/// <summary>
/// Unit of Work pattern interface for coordinating multiple repositories
/// </summary>
public interface IUnitOfWork : IDisposable
{
    // Repository properties for each entity type
    ICloudBoardRepository CloudBoards { get; }
    INodeRepository Nodes { get; }
    IConnectorRepository Connectors { get; }
    IConnectionRepository Connections { get; }
    
    /// <summary>
    /// Saves all pending changes across all repositories in a single transaction
    /// </summary>
    /// <returns>Number of state entries written to the database</returns>
    Task<int> SaveChangesAsync();
    
    /// <summary>
    /// Begins a new database transaction
    /// </summary>
    /// <returns>Transaction object</returns>
    Task BeginTransactionAsync();
    
    /// <summary>
    /// Commits the current transaction
    /// </summary>
    Task CommitTransactionAsync();
    
    /// <summary>
    /// Rolls back the current transaction
    /// </summary>
    Task RollbackTransactionAsync();
    
    /// <summary>
    /// Gets a generic repository for any entity type
    /// </summary>
    /// <typeparam name="TEntity">Entity type</typeparam>
    /// <typeparam name="TKey">Primary key type</typeparam>
    /// <returns>Generic repository instance</returns>
    IRepository<TEntity, TKey> GetRepository<TEntity, TKey>() where TEntity : class;
}
