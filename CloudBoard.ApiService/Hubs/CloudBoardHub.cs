using CloudBoard.ApiService.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace CloudBoard.ApiService.Hubs;

/// <summary>
/// Clients join the board they have open and receive change notifications for it.
/// All changes go through the REST API, which validates them and broadcasts via
/// <see cref="IBoardNotifier"/>; the hub itself only handles membership and presence.
/// </summary>
[Authorize]
public class CloudBoardHub : Hub
{
    private readonly IBoardAccessService _boardAccess;
    private readonly BoardPresenceTracker _presence;

    public CloudBoardHub(IBoardAccessService boardAccess, BoardPresenceTracker presence)
    {
        _boardAccess = boardAccess;
        _presence = presence;
    }

    public static string GroupName(Guid boardId) => $"CloudBoard_{boardId}";

    public async Task<IReadOnlyList<BoardPresenceUser>> JoinCloudBoard(Guid boardId)
    {
        var user = Context.User!;
        var access = await _boardAccess.ForBoardAsync(boardId, user);
        if (!access.CanEdit)
        {
            throw new HubException("You don't have access to this board.");
        }

        var previousBoardId = _presence.Join(new BoardConnection(
            Context.ConnectionId, boardId, user.GetUserId()!, user.GetVerifiedEmail(), user.GetDisplayName()));

        if (previousBoardId is { } previous && previous != boardId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, GroupName(previous));
            await BroadcastPresenceAsync(previous);
        }

        await Groups.AddToGroupAsync(Context.ConnectionId, GroupName(boardId));
        await BroadcastPresenceAsync(boardId);
        return _presence.GetUsers(boardId);
    }

    public async Task LeaveCloudBoard(Guid boardId)
    {
        if (_presence.Leave(Context.ConnectionId) is { } left)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, GroupName(left));
            await BroadcastPresenceAsync(left);
        }
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        if (_presence.Leave(Context.ConnectionId) is { } left)
        {
            await BroadcastPresenceAsync(left);
        }
        await base.OnDisconnectedAsync(exception);
    }

    private Task BroadcastPresenceAsync(Guid boardId) =>
        Clients.Group(GroupName(boardId)).SendAsync(BoardEvents.PresenceChanged, boardId, _presence.GetUsers(boardId));
}
