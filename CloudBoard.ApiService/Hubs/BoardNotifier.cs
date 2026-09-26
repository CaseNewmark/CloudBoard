using CloudBoard.ApiService.Dtos;
using Microsoft.AspNetCore.SignalR;

namespace CloudBoard.ApiService.Hubs;

/// <summary>Client method names; every event is sent as (boardId, payload).</summary>
public static class BoardEvents
{
    public const string NodeCreated = "NodeCreated";
    public const string NodeUpdated = "NodeUpdated";
    public const string NodeDeleted = "NodeDeleted";
    public const string ConnectionCreated = "ConnectionCreated";
    public const string ConnectionUpdated = "ConnectionUpdated";
    public const string ConnectionDeleted = "ConnectionDeleted";
    public const string BoardUpdated = "BoardUpdated";
    public const string BoardDeleted = "BoardDeleted";
    public const string AccessRevoked = "AccessRevoked";
    public const string PresenceChanged = "PresenceChanged";
}

public record BoardMetadata(Guid Id, string Name, string? Description);

public interface IBoardNotifier
{
    Task NodeCreatedAsync(Guid boardId, NodeDto node);
    Task NodeUpdatedAsync(Guid boardId, NodeDto node);
    Task NodeDeletedAsync(Guid boardId, Guid nodeId);
    Task ConnectionCreatedAsync(Guid boardId, ConnectionDto connection);
    Task ConnectionUpdatedAsync(Guid boardId, ConnectionDto connection);
    Task ConnectionDeletedAsync(Guid boardId, Guid connectionId);
    Task BoardUpdatedAsync(Guid boardId, BoardMetadata board);
    Task BoardDeletedAsync(Guid boardId);

    /// <summary>Disconnects viewers of the board that <paramref name="stillHasAccess"/> rejects from its group.</summary>
    Task RevokeAccessAsync(Guid boardId, Func<BoardConnection, bool> stillHasAccess);
}

/// <summary>
/// Broadcasts changes made through the REST API to everyone viewing the board, except
/// the hub connection that made the change (sent by the client in <see cref="ConnectionIdHeader"/>),
/// since it has already applied it locally.
/// </summary>
public class BoardNotifier : IBoardNotifier
{
    public const string ConnectionIdHeader = "X-SignalR-Connection-Id";

    private readonly IHubContext<CloudBoardHub> _hubContext;
    private readonly BoardPresenceTracker _presence;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public BoardNotifier(IHubContext<CloudBoardHub> hubContext, BoardPresenceTracker presence, IHttpContextAccessor httpContextAccessor)
    {
        _hubContext = hubContext;
        _presence = presence;
        _httpContextAccessor = httpContextAccessor;
    }

    public Task NodeCreatedAsync(Guid boardId, NodeDto node) => SendAsync(boardId, BoardEvents.NodeCreated, node);
    public Task NodeUpdatedAsync(Guid boardId, NodeDto node) => SendAsync(boardId, BoardEvents.NodeUpdated, node);
    public Task NodeDeletedAsync(Guid boardId, Guid nodeId) => SendAsync(boardId, BoardEvents.NodeDeleted, nodeId);
    public Task ConnectionCreatedAsync(Guid boardId, ConnectionDto connection) => SendAsync(boardId, BoardEvents.ConnectionCreated, connection);
    public Task ConnectionUpdatedAsync(Guid boardId, ConnectionDto connection) => SendAsync(boardId, BoardEvents.ConnectionUpdated, connection);
    public Task ConnectionDeletedAsync(Guid boardId, Guid connectionId) => SendAsync(boardId, BoardEvents.ConnectionDeleted, connectionId);
    public Task BoardUpdatedAsync(Guid boardId, BoardMetadata board) => SendAsync(boardId, BoardEvents.BoardUpdated, board);
    public Task BoardDeletedAsync(Guid boardId) => SendAsync(boardId, BoardEvents.BoardDeleted, boardId);

    public async Task RevokeAccessAsync(Guid boardId, Func<BoardConnection, bool> stillHasAccess)
    {
        var revoked = _presence.GetConnections(boardId).Where(c => !stillHasAccess(c)).ToList();
        if (revoked.Count == 0) return;

        foreach (var connection in revoked)
        {
            _presence.Leave(connection.ConnectionId);
            await _hubContext.Groups.RemoveFromGroupAsync(connection.ConnectionId, CloudBoardHub.GroupName(boardId));
            await _hubContext.Clients.Client(connection.ConnectionId).SendAsync(BoardEvents.AccessRevoked, boardId, boardId);
        }

        await _hubContext.Clients.Group(CloudBoardHub.GroupName(boardId))
            .SendAsync(BoardEvents.PresenceChanged, boardId, _presence.GetUsers(boardId));
    }

    private Task SendAsync(Guid boardId, string method, object payload)
    {
        var group = CloudBoardHub.GroupName(boardId);
        var sender = _httpContextAccessor.HttpContext?.Request.Headers[ConnectionIdHeader].ToString();
        var clients = string.IsNullOrEmpty(sender)
            ? _hubContext.Clients.Group(group)
            : _hubContext.Clients.GroupExcept(group, sender);
        return clients.SendAsync(method, boardId, payload);
    }
}
