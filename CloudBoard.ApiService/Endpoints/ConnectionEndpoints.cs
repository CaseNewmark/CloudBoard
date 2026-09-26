using CloudBoard.ApiService.Auth;
using CloudBoard.ApiService.Dtos;
using CloudBoard.ApiService.Hubs;
using CloudBoard.ApiService.Services.Contracts;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;

namespace CloudBoard.ApiService.Endpoints;

public static class ConnectionEndpoints
{
    public static void MapConnectionEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/cloudboard/{cloudboardId:guid}/connection", async (Guid cloudboardId, [FromBody] ConnectionDto connectionDto, IConnectionService connectionService, IBoardAccessService boardAccess, IBoardNotifier notifier, HttpContext context) =>
        {
            var access = await boardAccess.ForBoardAsync(cloudboardId, context.User);
            if (access.DenyUnlessCanEdit() is { } denied) return denied;

            if (await ValidateConnectorsAsync(connectionDto, cloudboardId, boardAccess, context) is { } invalid) return invalid;

            var newConnection = await connectionService.CreateConnectionAsync(cloudboardId.ToString(), connectionDto);
            await notifier.ConnectionCreatedAsync(cloudboardId, newConnection);
            return TypedResults.Created($"/api/cloudboard/{cloudboardId}/connection/{newConnection.Id}", newConnection);
        })
        .WithName("CreateConnection")
        .Produces<ConnectionDto>(201)
        .ProducesValidationProblem()
        .RequireAuthorization();

        app.MapGet("/api/connection/{connectionId:guid}", async (Guid connectionId, IConnectionService connectionService, IBoardAccessService boardAccess, HttpContext context) =>
        {
            var access = await boardAccess.ForConnectionAsync(connectionId, context.User);
            if (access.DenyUnlessCanEdit() is { } denied) return denied;

            var connection = await connectionService.GetConnectionByIdAsync(connectionId.ToString());
            return connection is not null ? TypedResults.Ok(connection) : Results.NotFound();
        })
        .WithName("GetConnectionById")
        .Produces<ConnectionDto>()
        .RequireAuthorization();

        app.MapGet("/api/cloudboard/{cloudboardId:guid}/connection", async (Guid cloudboardId, IConnectionService connectionService, IBoardAccessService boardAccess, HttpContext context) =>
        {
            var access = await boardAccess.ForBoardAsync(cloudboardId, context.User);
            if (access.DenyUnlessCanEdit() is { } denied) return denied;

            return TypedResults.Ok(await connectionService.GetConnectionsByCloudBoardDocumentIdAsync(cloudboardId.ToString()));
        })
        .WithName("GetConnectionsByCloudBoardDocumentId")
        .Produces<IEnumerable<ConnectionDto>>()
        .RequireAuthorization();

        app.MapGet("/api/connector/{connectorId:guid}/connections", async (Guid connectorId, IConnectionService connectionService, IBoardAccessService boardAccess, HttpContext context) =>
        {
            var access = await boardAccess.ForConnectorAsync(connectorId, context.User);
            if (access.DenyUnlessCanEdit() is { } denied) return denied;

            return TypedResults.Ok(await connectionService.GetConnectionsByConnectorIdAsync(connectorId.ToString()));
        })
        .WithName("GetConnectionsByConnectorId")
        .Produces<IEnumerable<ConnectionDto>>()
        .RequireAuthorization();

        app.MapPut("/api/connection/{connectionId:guid}", async (Guid connectionId, [FromBody] ConnectionDto connectionDto, IConnectionService connectionService, IBoardAccessService boardAccess, IBoardNotifier notifier, HttpContext context) =>
        {
            var access = await boardAccess.ForConnectionAsync(connectionId, context.User);
            if (access.DenyUnlessCanEdit() is { } denied) return denied;

            var boardId = access.BoardId!.Value;
            if (await ValidateConnectorsAsync(connectionDto, boardId, boardAccess, context) is { } invalid) return invalid;

            connectionDto.Id = connectionId.ToString();
            var updated = await connectionService.UpdateConnectionAsync(connectionDto);
            if (updated is null) return Results.NotFound();

            await notifier.ConnectionUpdatedAsync(boardId, updated);
            return TypedResults.Ok(updated);
        })
        .WithName("UpdateConnection")
        .Produces<ConnectionDto>()
        .ProducesValidationProblem()
        .RequireAuthorization();

        app.MapDelete("/api/connection/{connectionId:guid}", async (Guid connectionId, IConnectionService connectionService, IConnectorService connectorService, INodeService nodeService, IBoardAccessService boardAccess, IBoardNotifier notifier, HttpContext context) =>
        {
            var access = await boardAccess.ForConnectionAsync(connectionId, context.User);
            if (access.DenyUnlessCanEdit() is { } denied) return denied;

            // Deleting a connection also removes its connectors, which changes the nodes they sat on.
            var nodeIds = new HashSet<Guid>();
            if (await connectionService.GetConnectionByIdAsync(connectionId.ToString()) is { } connection)
            {
                foreach (var connectorId in new[] { connection.FromConnectorId, connection.ToConnectorId })
                {
                    if (Guid.TryParse(connectorId, out var id) && await connectorService.GetNodeIdAsync(id) is { } nodeId)
                    {
                        nodeIds.Add(nodeId);
                    }
                }
            }

            var deleted = await connectionService.DeleteConnectionAsync(connectionId.ToString());
            if (deleted)
            {
                var boardId = access.BoardId!.Value;
                await notifier.ConnectionDeletedAsync(boardId, connectionId);
                foreach (var nodeId in nodeIds)
                {
                    if (await nodeService.GetNodeByIdAsync(nodeId.ToString()) is { } node)
                    {
                        await notifier.NodeUpdatedAsync(boardId, node);
                    }
                }
            }
            return TypedResults.Ok(deleted);
        })
        .WithName("DeleteConnection")
        .Produces<bool>()
        .RequireAuthorization();
    }

    /// <summary>Both ends of a connection must be connectors on the connection's own board.</summary>
    private static async Task<IResult?> ValidateConnectorsAsync(ConnectionDto connectionDto, Guid boardId, IBoardAccessService boardAccess, HttpContext context)
    {
        foreach (var connectorId in new[] { connectionDto.FromConnectorId, connectionDto.ToConnectorId })
        {
            var onBoard = Guid.TryParse(connectorId, out var id)
                && (await boardAccess.ForConnectorAsync(id, context.User)).BoardId == boardId;
            if (!onBoard)
            {
                return Results.ValidationProblem(new Dictionary<string, string[]>
                {
                    ["Connectors"] = new[] { $"Connector '{connectorId}' does not exist on this board." }
                });
            }
        }
        return null;
    }
}
