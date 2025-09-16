using System.Linq.Expressions;
using CloudBoard.ApiService.Data;
using CloudBoard.ApiService.Services.Contracts;
using Microsoft.EntityFrameworkCore;

namespace CloudBoard.ApiService.Services;

/// <summary>
/// Generic base repository implementation providing common CRUD operations
/// </summary>
/// <typeparam name="TEntity">The entity type</typeparam>
/// <typeparam name="TKey">The primary key type</typeparam>
public class Repository<TEntity, TKey> : IRepository<TEntity, TKey> where TEntity : class
{
    protected readonly CloudBoardDbContext _context;
    protected readonly DbSet<TEntity> _dbSet;
    protected readonly ILogger<Repository<TEntity, TKey>> _logger;

    public Repository(CloudBoardDbContext context, ILogger<Repository<TEntity, TKey>> logger)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _dbSet = _context.Set<TEntity>();
    }

    public virtual async Task<TEntity?> GetByIdAsync(TKey id)
    {
        try
        {
            return await _dbSet.FindAsync(id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving entity with ID {Id}", id);
            throw;
        }
    }

    public virtual async Task<TEntity?> GetByIdWithIncludesAsync(TKey id, params Expression<Func<TEntity, object>>[] includeProperties)
    {
        try
        {
            IQueryable<TEntity> query = _dbSet;

            foreach (var includeProperty in includeProperties)
            {
                query = query.Include(includeProperty);
            }

            // For Guid keys, we need to use Where clause since Find doesn't work with Include
            if (typeof(TKey) == typeof(Guid))
            {
                var parameter = Expression.Parameter(typeof(TEntity), "e");
                var property = Expression.Property(parameter, "Id");
                var constant = Expression.Constant(id);
                var equal = Expression.Equal(property, constant);
                var lambda = Expression.Lambda<Func<TEntity, bool>>(equal, parameter);
                
                return await query.FirstOrDefaultAsync(lambda);
            }

            return await query.FirstOrDefaultAsync(e => EF.Property<TKey>(e, "Id").Equals(id));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving entity with includes for ID {Id}", id);
            throw;
        }
    }

    public virtual async Task<IEnumerable<TEntity>> GetAllAsync()
    {
        try
        {
            return await _dbSet.ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving all entities");
            throw;
        }
    }

    public virtual async Task<IEnumerable<TEntity>> GetAsync(Expression<Func<TEntity, bool>> filter)
    {
        try
        {
            return await _dbSet.Where(filter).ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving filtered entities");
            throw;
        }
    }

    public virtual async Task<IEnumerable<TEntity>> GetAsync(
        Expression<Func<TEntity, bool>>? filter = null,
        Func<IQueryable<TEntity>, IOrderedQueryable<TEntity>>? orderBy = null,
        string includeProperties = "",
        int? skip = null,
        int? take = null)
    {
        try
        {
            IQueryable<TEntity> query = _dbSet;

            if (filter != null)
            {
                query = query.Where(filter);
            }

            foreach (var includeProperty in includeProperties.Split(new char[] { ',' }, StringSplitOptions.RemoveEmptyEntries))
            {
                query = query.Include(includeProperty.Trim());
            }

            if (orderBy != null)
            {
                query = orderBy(query);
            }

            if (skip.HasValue)
            {
                query = query.Skip(skip.Value);
            }

            if (take.HasValue)
            {
                query = query.Take(take.Value);
            }

            return await query.ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving entities with advanced options");
            throw;
        }
    }

    public virtual async Task<TEntity?> GetFirstOrDefaultAsync(Expression<Func<TEntity, bool>> filter)
    {
        try
        {
            return await _dbSet.FirstOrDefaultAsync(filter);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving first entity matching filter");
            throw;
        }
    }

    public virtual async Task<int> GetCountAsync(Expression<Func<TEntity, bool>>? filter = null)
    {
        try
        {
            if (filter != null)
            {
                return await _dbSet.CountAsync(filter);
            }
            return await _dbSet.CountAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting entity count");
            throw;
        }
    }

    public virtual async Task<bool> ExistsAsync(Expression<Func<TEntity, bool>> filter)
    {
        try
        {
            return await _dbSet.AnyAsync(filter);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking entity existence");
            throw;
        }
    }

    public virtual async Task<TEntity> AddAsync(TEntity entity)
    {
        try
        {
            await _dbSet.AddAsync(entity);
            await SaveChangesAsync();
            return entity;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding entity");
            throw;
        }
    }

    public virtual async Task AddRangeAsync(IEnumerable<TEntity> entities)
    {
        try
        {
            await _dbSet.AddRangeAsync(entities);
            await SaveChangesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding entities in range");
            throw;
        }
    }

    public virtual async Task<TEntity> UpdateAsync(TEntity entity)
    {
        try
        {
            _dbSet.Update(entity);
            await SaveChangesAsync();
            return entity;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating entity");
            throw;
        }
    }

    public virtual async Task UpdateRangeAsync(IEnumerable<TEntity> entities)
    {
        try
        {
            _dbSet.UpdateRange(entities);
            await SaveChangesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating entities in range");
            throw;
        }
    }

    public virtual async Task<bool> DeleteAsync(TKey id)
    {
        try
        {
            var entity = await GetByIdAsync(id);
            if (entity == null)
            {
                return false;
            }

            _dbSet.Remove(entity);
            await SaveChangesAsync();
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting entity with ID {Id}", id);
            throw;
        }
    }

    public virtual async Task DeleteAsync(TEntity entity)
    {
        try
        {
            if (_context.Entry(entity).State == EntityState.Detached)
            {
                _dbSet.Attach(entity);
            }
            _dbSet.Remove(entity);
            await SaveChangesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting entity");
            throw;
        }
    }

    public virtual async Task<int> DeleteRangeAsync(Expression<Func<TEntity, bool>> filter)
    {
        try
        {
            var entities = await _dbSet.Where(filter).ToListAsync();
            var count = entities.Count;
            _dbSet.RemoveRange(entities);
            await SaveChangesAsync();
            return count;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting entities in range");
            throw;
        }
    }

    public virtual async Task<int> SaveChangesAsync()
    {
        try
        {
            return await _context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving changes to database");
            throw;
        }
    }

    public virtual async Task<IEnumerable<TEntity>> FromSqlRawAsync(string sql, params object[] parameters)
    {
        try
        {
            return await _dbSet.FromSqlRaw(sql, parameters).ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error executing raw SQL query: {Sql}", sql);
            throw;
        }
    }

    public virtual async Task<int> ExecuteSqlRawAsync(string sql, params object[] parameters)
    {
        try
        {
            return await _context.Database.ExecuteSqlRawAsync(sql, parameters);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error executing raw SQL command: {Sql}", sql);
            throw;
        }
    }
}
