using CloudBoard.ApiService.Auth;
using CloudBoard.ApiService.Dtos;
using CloudBoard.ApiService.Hubs;
using CloudBoard.ApiService.Services.Contracts;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;

namespace CloudBoard.ApiService.Endpoints;

public static class NodeEndpoints
{
    public static void MapNodeEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/cloudboard/{cloudboardId:guid}/node", async (Guid cloudboardId, [FromBody] NodeDto nodeDto, INodeService nodeService, IBoardAccessService boardAccess, IBoardNotifier notifier, HttpContext context) =>
        {
            var access = await boardAccess.ForBoardAsync(cloudboardId, context.User);
            if (access.DenyUnlessCanEdit() is { } denied) return denied;

            // Connectors are created through their own endpoint.
            nodeDto.Connectors = new List<ConnectorDto>();
            var newNode = await nodeService.CreateNodeAsync(cloudboardId.ToString(), nodeDto);
            await notifier.NodeCreatedAsync(cloudboardId, newNode);
            return TypedResults.Created($"/api/cloudboard/{cloudboardId}/node/{newNode.Id}", newNode);
        })
        .WithName("CreateNode")
        .Produces<NodeDto>(201)
        .RequireAuthorization();

        app.MapGet("/api/node/{nodeId:guid}", async (Guid nodeId, INodeService nodeService, IBoardAccessService boardAccess, HttpContext context) =>
        {
            var access = await boardAccess.ForNodeAsync(nodeId, context.User);
            if (access.DenyUnlessCanEdit() is { } denied) return denied;

            var node = await nodeService.GetNodeByIdAsync(nodeId.ToString());
            return node is not null ? TypedResults.Ok(node) : Results.NotFound();
        })
        .WithName("GetNodeById")
        .Produces<NodeDto>()
        .RequireAuthorization();

        app.MapPut("/api/node/{nodeId:guid}", async (Guid nodeId, [FromBody] NodeDto nodeDto, INodeService nodeService, IBoardAccessService boardAccess, IBoardNotifier notifier, HttpContext context) =>
        {
            var access = await boardAccess.ForNodeAsync(nodeId, context.User);
            if (access.DenyUnlessCanEdit() is { } denied) return denied;

            // The route decides which node is updated, never the body.
            nodeDto.Id = nodeId.ToString();
            var updated = await nodeService.UpdateNodeAsync(nodeDto);
            if (updated is null) return Results.NotFound();

            await notifier.NodeUpdatedAsync(access.BoardId!.Value, updated);
            return TypedResults.Ok(updated);
        })
        .WithName("UpdateNode")
        .Produces<NodeDto>()
        .RequireAuthorization();

        app.MapDelete("/api/node/{nodeId:guid}", async (Guid nodeId, INodeService nodeService, IBoardAccessService boardAccess, IBoardNotifier notifier, HttpContext context) =>
        {
            var access = await boardAccess.ForNodeAsync(nodeId, context.User);
            if (access.DenyUnlessCanEdit() is { } denied) return denied;

            var deleted = await nodeService.DeleteNodeAsync(nodeId.ToString());
            if (deleted)
            {
                await notifier.NodeDeletedAsync(access.BoardId!.Value, nodeId);
            }
            return TypedResults.Ok(deleted);
        })
        .WithName("DeleteNode")
        .Produces<bool>()
        .RequireAuthorization();
    }
}
