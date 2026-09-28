using System.Security.Claims;
using CloudBoard.ApiService.Data;
using Microsoft.EntityFrameworkCore;

namespace CloudBoard.ApiService.Auth;

public enum BoardAccess
{
    None,
    Member,
    Owner,
}

/// <summary>Result of resolving a board (directly or via a node/connector/connection) for the current user.</summary>
public readonly record struct BoardAccessResult(Guid? BoardId, BoardAccess Access)
{
    public bool CanEdit => BoardId is not null && Access != BoardAccess.None;
    public bool IsOwner => BoardId is not null && Access == BoardAccess.Owner;

    /// <summary>404 if the board (or child entity) doesn't exist, 403 if the user can't edit it, otherwise null.</summary>
    public IResult? DenyUnlessCanEdit() =>
        BoardId is null ? Results.NotFound() : Access == BoardAccess.None ? Results.Forbid() : null;

    /// <summary>404 if the board doesn't exist, 403 unless the user owns it, otherwise null.</summary>
    public IResult? DenyUnlessOwner() =>
        BoardId is null ? Results.NotFound() : Access != BoardAccess.Owner ? Results.Forbid() : null;
}

public interface IBoardAccessService
{
    Task<BoardAccessResult> ForBoardAsync(Guid boardId, ClaimsPrincipal user);
    Task<BoardAccessResult> ForNodeAsync(Guid nodeId, ClaimsPrincipal user);
    Task<BoardAccessResult> ForConnectorAsync(Guid connectorId, ClaimsPrincipal user);
    Task<BoardAccessResult> ForConnectionAsync(Guid connectionId, ClaimsPrincipal user);
    Task<BoardAccessResult> ForImageAsync(Guid imageId, ClaimsPrincipal user);
}

public class BoardAccessService : IBoardAccessService
{
    private readonly CloudBoardDbContext _dbContext;

    public BoardAccessService(CloudBoardDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<BoardAccessResult> ForBoardAsync(Guid boardId, ClaimsPrincipal user)
    {
        var board = await _dbContext.CloudBoardDocuments
            .AsNoTracking()
            .Where(b => b.Id == boardId)
            .Select(b => new { b.CreatedBy })
            .FirstOrDefaultAsync();

        if (board is null)
        {
            return new BoardAccessResult(null, BoardAccess.None);
        }

        var userId = user.GetUserId();
        if (userId is not null && board.CreatedBy == userId)
        {
            return new BoardAccessResult(boardId, BoardAccess.Owner);
        }

        var email = user.GetVerifiedEmail();
        var isMember = email is not null && await _dbContext.CloudBoardMembers
            .AnyAsync(m => m.CloudBoardDocumentId == boardId && m.Email == email);

        return new BoardAccessResult(boardId, isMember ? BoardAccess.Member : BoardAccess.None);
    }

    public async Task<BoardAccessResult> ForNodeAsync(Guid nodeId, ClaimsPrincipal user)
    {
        var boardId = await _dbContext.Nodes
            .Where(n => n.Id == nodeId)
            .Select(n => (Guid?)n.CloudBoardDocumentId)
            .FirstOrDefaultAsync();
        return await ForOptionalBoardAsync(boardId, user);
    }

    public async Task<BoardAccessResult> ForConnectorAsync(Guid connectorId, ClaimsPrincipal user)
    {
        var boardId = await _dbContext.Connectors
            .Where(c => c.Id == connectorId)
            .Select(c => (Guid?)c.Node.CloudBoardDocumentId)
            .FirstOrDefaultAsync();
        return await ForOptionalBoardAsync(boardId, user);
    }

    public async Task<BoardAccessResult> ForConnectionAsync(Guid connectionId, ClaimsPrincipal user)
    {
        var boardId = await _dbContext.Connections
            .Where(c => c.Id == connectionId)
            .Select(c => (Guid?)c.CloudBoardDocumentId)
            .FirstOrDefaultAsync();
        return await ForOptionalBoardAsync(boardId, user);
    }

    public async Task<BoardAccessResult> ForImageAsync(Guid imageId, ClaimsPrincipal user)
    {
        var boardId = await _dbContext.BoardImages
            .Where(i => i.Id == imageId)
            .Select(i => (Guid?)i.CloudBoardDocumentId)
            .FirstOrDefaultAsync();
        return await ForOptionalBoardAsync(boardId, user);
    }

    private Task<BoardAccessResult> ForOptionalBoardAsync(Guid? boardId, ClaimsPrincipal user) =>
        boardId is null
            ? Task.FromResult(new BoardAccessResult(null, BoardAccess.None))
            : ForBoardAsync(boardId.Value, user);
}
