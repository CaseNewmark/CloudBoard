using System.Collections.Concurrent;

namespace CloudBoard.ApiService.Hubs;

public record BoardPresenceUser(string UserId, string Name);

public record BoardConnection(string ConnectionId, Guid BoardId, string UserId, string? Email, string Name);

/// <summary>
/// Tracks which hub connection is viewing which board. In-memory, so it assumes a
/// single API instance; scaling out would need a SignalR backplane and a shared store.
/// </summary>
public class BoardPresenceTracker
{
    private readonly ConcurrentDictionary<string, BoardConnection> _connections = new();

    /// <summary>Records the connection as viewing <paramref name="connection"/>'s board and returns the board it was on before, if any.</summary>
    public Guid? Join(BoardConnection connection)
    {
        Guid? previous = null;
        _connections.AddOrUpdate(
            connection.ConnectionId,
            connection,
            (_, existing) =>
            {
                previous = existing.BoardId;
                return connection;
            });
        return previous;
    }

    /// <summary>Removes the connection and returns the board it was on, if any.</summary>
    public Guid? Leave(string connectionId) =>
        _connections.TryRemove(connectionId, out var removed) ? removed.BoardId : null;

    public IReadOnlyList<BoardConnection> GetConnections(Guid boardId) =>
        _connections.Values.Where(c => c.BoardId == boardId).ToList();

    public IReadOnlyList<BoardPresenceUser> GetUsers(Guid boardId) =>
        GetConnections(boardId)
            .GroupBy(c => c.UserId)
            .Select(g => new BoardPresenceUser(g.Key, g.First().Name))
            .OrderBy(u => u.Name, StringComparer.OrdinalIgnoreCase)
            .ToList();
}
