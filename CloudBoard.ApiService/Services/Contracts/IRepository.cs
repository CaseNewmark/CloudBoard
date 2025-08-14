using System.Linq.Expressions;

namespace CloudBoard.ApiService.Services.Contracts;

/// <summary>
/// Generic repository interface providing common CRUD operations for entities
/// </summary>
/// <typeparam name="TEntity">The entity type</typeparam>
/// <typeparam name="TKey">The primary key type</typeparam>
public interface IRepository<TEntity, TKey> where TEntity : class
{
    // Synchronous methods for basic CRUD operations
    
    /// <summary>
    /// Gets an entity by its primary key
    /// </summary>
    /// <param name="id">The primary key value</param>
    /// <returns>The entity if found, null otherwise</returns>
    Task<TEntity?> GetByIdAsync(TKey id);
    
    /// <summary>
    /// Gets an entity by its primary key with related entities included
    /// </summary>
    /// <param name="id">The primary key value</param>
    /// <param name="includeProperties">Navigation properties to include</param>
    /// <returns>The entity with related data if found, null otherwise</returns>
    Task<TEntity?> GetByIdWithIncludesAsync(TKey id, params Expression<Func<TEntity, object>>[] includeProperties);
    
    /// <summary>
    /// Gets all entities
    /// </summary>
    /// <returns>Collection of all entities</returns>
    Task<IEnumerable<TEntity>> GetAllAsync();
    
    /// <summary>
    /// Gets entities based on a filter predicate
    /// </summary>
    /// <param name="filter">Filter expression</param>
    /// <returns>Filtered collection of entities</returns>
    Task<IEnumerable<TEntity>> GetAsync(Expression<Func<TEntity, bool>> filter);
    
    /// <summary>
    /// Gets entities with advanced querying options
    /// </summary>
    /// <param name="filter">Optional filter expression</param>
    /// <param name="orderBy">Optional ordering function</param>
    /// <param name="includeProperties">Navigation properties to include</param>
    /// <param name="skip">Number of entities to skip (for pagination)</param>
    /// <param name="take">Number of entities to take (for pagination)</param>
    /// <returns>Filtered, ordered, and paged collection of entities</returns>
    Task<IEnumerable<TEntity>> GetAsync(
        Expression<Func<TEntity, bool>>? filter = null,
        Func<IQueryable<TEntity>, IOrderedQueryable<TEntity>>? orderBy = null,
        string includeProperties = "",
        int? skip = null,
        int? take = null);
    
    /// <summary>
    /// Gets the first entity matching the filter, or null if none found
    /// </summary>
    /// <param name="filter">Filter expression</param>
    /// <returns>First matching entity or null</returns>
    Task<TEntity?> GetFirstOrDefaultAsync(Expression<Func<TEntity, bool>> filter);
    
    /// <summary>
    /// Gets the count of entities matching the filter
    /// </summary>
    /// <param name="filter">Optional filter expression</param>
    /// <returns>Count of matching entities</returns>
    Task<int> GetCountAsync(Expression<Func<TEntity, bool>>? filter = null);
    
    /// <summary>
    /// Checks if any entity exists matching the filter
    /// </summary>
    /// <param name="filter">Filter expression</param>
    /// <returns>True if any entity matches, false otherwise</returns>
    Task<bool> ExistsAsync(Expression<Func<TEntity, bool>> filter);
    
    /// <summary>
    /// Adds a new entity
    /// </summary>
    /// <param name="entity">Entity to add</param>
    /// <returns>The added entity</returns>
    Task<TEntity> AddAsync(TEntity entity);
    
    /// <summary>
    /// Adds multiple entities in a single operation
    /// </summary>
    /// <param name="entities">Entities to add</param>
    /// <returns>Task representing the operation</returns>
    Task AddRangeAsync(IEnumerable<TEntity> entities);
    
    /// <summary>
    /// Updates an existing entity
    /// </summary>
    /// <param name="entity">Entity to update</param>
    /// <returns>The updated entity</returns>
    Task<TEntity> UpdateAsync(TEntity entity);
    
    /// <summary>
    /// Updates multiple entities in a single operation
    /// </summary>
    /// <param name="entities">Entities to update</param>
    /// <returns>Task representing the operation</returns>
    Task UpdateRangeAsync(IEnumerable<TEntity> entities);
    
    /// <summary>
    /// Deletes an entity by its primary key
    /// </summary>
    /// <param name="id">Primary key of entity to delete</param>
    /// <returns>True if deleted, false if not found</returns>
    Task<bool> DeleteAsync(TKey id);
    
    /// <summary>
    /// Deletes an entity
    /// </summary>
    /// <param name="entity">Entity to delete</param>
    /// <returns>Task representing the operation</returns>
    Task DeleteAsync(TEntity entity);
    
    /// <summary>
    /// Deletes multiple entities matching the filter
    /// </summary>
    /// <param name="filter">Filter expression for entities to delete</param>
    /// <returns>Number of entities deleted</returns>
    Task<int> DeleteRangeAsync(Expression<Func<TEntity, bool>> filter);
    
    /// <summary>
    /// Saves all pending changes to the database
    /// </summary>
    /// <returns>Number of state entries written to the database</returns>
    Task<int> SaveChangesAsync();
    
    /// <summary>
    /// Executes a raw SQL query and returns the result
    /// </summary>
    /// <param name="sql">SQL query</param>
    /// <param name="parameters">Query parameters</param>
    /// <returns>Query results</returns>
    Task<IEnumerable<TEntity>> FromSqlRawAsync(string sql, params object[] parameters);
    
    /// <summary>
    /// Executes a raw SQL command
    /// </summary>
    /// <param name="sql">SQL command</param>
    /// <param name="parameters">Command parameters</param>
    /// <returns>Number of rows affected</returns>
    Task<int> ExecuteSqlRawAsync(string sql, params object[] parameters);
}
