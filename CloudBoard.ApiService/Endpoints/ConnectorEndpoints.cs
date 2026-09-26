using CloudBoard.ApiService.Auth;
using CloudBoard.ApiService.Dtos;
using CloudBoard.ApiService.Hubs;
using CloudBoard.ApiService.Services.Contracts;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;

namespace CloudBoard.ApiService.Endpoints;

public static class ConnectorEndpoints
{
    public static void MapConnectorEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/node/{nodeId:guid}/connector", async (Guid nodeId, [FromBody] ConnectorDto connectorDto, IConnectorService connectorService, INodeService nodeService, IBoardAccessService boardAccess, IBoardNotifier notifier, HttpContext context) =>
        {
            var access = await boardAccess.ForNodeAsync(nodeId, context.User);
            if (access.DenyUnlessCanEdit() is { } denied) return denied;

            var newConnector = await connectorService.CreateConnectorAsync(nodeId.ToString(), connectorDto);
            await NotifyNodeChangedAsync(nodeId, access.BoardId!.Value, nodeService, notifier);
            return TypedResults.Created($"/api/node/{nodeId}/connector/{newConnector.Id}", newConnector);
        })
        .WithName("CreateConnector")
        .Produces<ConnectorDto>(201)
        .RequireAuthorization();

        app.MapGet("/api/connector/{connectorId:guid}", async (Guid connectorId, IConnectorService connectorService, IBoardAccessService boardAccess, HttpContext context) =>
        {
            var access = await boardAccess.ForConnectorAsync(connectorId, context.User);
            if (access.DenyUnlessCanEdit() is { } denied) return denied;

            var connector = await connectorService.GetConnectorByIdAsync(connectorId.ToString());
            return connector is not null ? TypedResults.Ok(connector) : Results.NotFound();
        })
        .WithName("GetConnectorById")
        .Produces<ConnectorDto>()
        .RequireAuthorization();

        app.MapGet("/api/node/{nodeId:guid}/connectors", async (Guid nodeId, IConnectorService connectorService, IBoardAccessService boardAccess, HttpContext context) =>
        {
            var access = await boardAccess.ForNodeAsync(nodeId, context.User);
            if (access.DenyUnlessCanEdit() is { } denied) return denied;

            return TypedResults.Ok(await connectorService.GetConnectorsByNodeIdAsync(nodeId.ToString()));
        })
        .WithName("GetConnectorsByNodeId")
        .Produces<IEnumerable<ConnectorDto>>()
        .RequireAuthorization();

        app.MapPut("/api/connector/{connectorId:guid}", async (Guid connectorId, [FromBody] ConnectorDto connectorDto, IConnectorService connectorService, INodeService nodeService, IBoardAccessService boardAccess, IBoardNotifier notifier, HttpContext context) =>
        {
            var access = await boardAccess.ForConnectorAsync(connectorId, context.User);
            if (access.DenyUnlessCanEdit() is { } denied) return denied;

            connectorDto.Id = connectorId.ToString();
            var updated = await connectorService.UpdateConnectorAsync(connectorDto);
            if (updated is null) return Results.NotFound();

            if (await connectorService.GetNodeIdAsync(connectorId) is { } nodeId)
            {
                await NotifyNodeChangedAsync(nodeId, access.BoardId!.Value, nodeService, notifier);
            }
            return TypedResults.Ok(updated);
        })
        .WithName("UpdateConnector")
        .Produces<ConnectorDto>()
        .RequireAuthorization();

        app.MapDelete("/api/connector/{connectorId:guid}", async (Guid connectorId, IConnectorService connectorService, INodeService nodeService, IBoardAccessService boardAccess, IBoardNotifier notifier, HttpContext context) =>
        {
            var access = await boardAccess.ForConnectorAsync(connectorId, context.User);
            if (access.DenyUnlessCanEdit() is { } denied) return denied;

            var nodeId = await connectorService.GetNodeIdAsync(connectorId);
            var deleted = await connectorService.DeleteConnectorAsync(connectorId.ToString());
            if (deleted && nodeId is not null)
            {
                await NotifyNodeChangedAsync(nodeId.Value, access.BoardId!.Value, nodeService, notifier);
            }
            return TypedResults.Ok(deleted);
        })
        .WithName("DeleteConnector")
        .Produces<bool>()
        .RequireAuthorization();
    }

    // Connectors travel with their node on the client, so connector changes are broadcast as node updates.
    private static async Task NotifyNodeChangedAsync(Guid nodeId, Guid boardId, INodeService nodeService, IBoardNotifier notifier)
    {
        if (await nodeService.GetNodeByIdAsync(nodeId.ToString()) is { } node)
        {
            await notifier.NodeUpdatedAsync(boardId, node);
        }
    }
}
