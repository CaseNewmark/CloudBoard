using CloudBoard.ApiService.Data;
using CloudBoard.ApiService.Services.Contracts;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;

namespace CloudBoard.ApiService.Services;

/// <summary>
/// Unit of Work implementation for coordinating multiple repositories
/// </summary>
public class UnitOfWork : IUnitOfWork
{
    private readonly CloudBoardDbContext _context;
    private readonly ILogger<UnitOfWork> _logger;
    private IDbContextTransaction? _transaction;
    private bool _disposed;

    // Repository instances
    private ICloudBoardRepository? _cloudBoardRepository;
    private INodeRepository? _nodeRepository;
    private IConnectorRepository? _connectorRepository;
    private IConnectionRepository? _connectionRepository;
    
    // Generic repository cache
    private readonly Dictionary<Type, object> _repositories;

    public UnitOfWork(
        CloudBoardDbContext context,
        ILogger<UnitOfWork> logger,
        ICloudBoardRepository cloudBoardRepository,
        INodeRepository nodeRepository,
        IConnectorRepository connectorRepository,
        IConnectionRepository connectionRepository)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _cloudBoardRepository = cloudBoardRepository ?? throw new ArgumentNullException(nameof(cloudBoardRepository));
        _nodeRepository = nodeRepository ?? throw new ArgumentNullException(nameof(nodeRepository));
        _connectorRepository = connectorRepository ?? throw new ArgumentNullException(nameof(connectorRepository));
        _connectionRepository = connectionRepository ?? throw new ArgumentNullException(nameof(connectionRepository));
        _repositories = new Dictionary<Type, object>();
    }

    public ICloudBoardRepository CloudBoards => _cloudBoardRepository!;
    public INodeRepository Nodes => _nodeRepository!;
    public IConnectorRepository Connectors => _connectorRepository!;
    public IConnectionRepository Connections => _connectionRepository!;

    public async Task<int> SaveChangesAsync()
    {
        try
        {
            return await _context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving changes through Unit of Work");
            throw;
        }
    }

    public async Task BeginTransactionAsync()
    {
        try
        {
            if (_transaction != null)
            {
                throw new InvalidOperationException("A transaction is already in progress");
            }

            _transaction = await _context.Database.BeginTransactionAsync();
            _logger.LogDebug("Database transaction started");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error beginning database transaction");
            throw;
        }
    }

    public async Task CommitTransactionAsync()
    {
        try
        {
            if (_transaction == null)
            {
                throw new InvalidOperationException("No transaction in progress to commit");
            }

            await _transaction.CommitAsync();
            _logger.LogDebug("Database transaction committed");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error committing database transaction");
            await RollbackTransactionAsync();
            throw;
        }
        finally
        {
            await DisposeTransactionAsync();
        }
    }

    public async Task RollbackTransactionAsync()
    {
        try
        {
            if (_transaction == null)
            {
                _logger.LogWarning("Attempted to rollback transaction, but no transaction in progress");
                return;
            }

            await _transaction.RollbackAsync();
            _logger.LogDebug("Database transaction rolled back");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error rolling back database transaction");
            throw;
        }
        finally
        {
            await DisposeTransactionAsync();
        }
    }

    public IRepository<TEntity, TKey> GetRepository<TEntity, TKey>() where TEntity : class
    {
        var type = typeof(TEntity);
        
        if (_repositories.TryGetValue(type, out var existingRepository))
        {
            return (IRepository<TEntity, TKey>)existingRepository;
        }

        // Create a new generic repository instance
        var loggerType = typeof(ILogger<>).MakeGenericType(typeof(Repository<TEntity, TKey>));
        var logger = (ILogger<Repository<TEntity, TKey>>)_context.GetService(loggerType) ?? 
                     throw new InvalidOperationException($"Could not resolve logger for {typeof(Repository<TEntity, TKey>).Name}");
        
        var repository = new Repository<TEntity, TKey>(_context, logger);
        _repositories[type] = repository;
        
        return repository;
    }

    private async Task DisposeTransactionAsync()
    {
        if (_transaction != null)
        {
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    protected virtual void Dispose(bool disposing)
    {
        if (!_disposed)
        {
            if (disposing)
            {
                _transaction?.Dispose();
                _context?.Dispose();
            }

            _disposed = true;
        }
    }

    public void Dispose()
    {
        Dispose(disposing: true);
        GC.SuppressFinalize(this);
    }
}
