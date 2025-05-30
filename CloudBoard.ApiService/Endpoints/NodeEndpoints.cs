using CloudBoard.ApiService.Dtos;
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
        app.MapPost("/api/node/{cloudboardid:guid}", async (Guid cloudBoardId, [FromBody] NodeDto nodeDto, INodeService nodeService) =>
        {
            var newNode = await nodeService.CreateNodeAsync(cloudBoardId, nodeDto);
            return TypedResults.Created($"/api/node/{newNode.Id}", newNode);
        })
        .WithName("CreateNode")
        .Produces<NodeDto>();

        app.MapGet("/api/node/{id:guid}", async (Guid id, INodeService nodeService) =>
        {
            var node = await nodeService.GetNodeByIdAsync(id);
            return node is not null
                ? TypedResults.Ok(node)
                : Results.NotFound();
        })
        .WithName("GetNodeById")
        .Produces<NodeDto>();

        app.MapPut("/api/node/{id:guid}", async (Guid id, [FromBody] NodeDto nodeDto, INodeService nodeService) =>
        {
            var updated = await nodeService.UpdateNodeAsync(nodeDto);
            return updated is not null
                ? TypedResults.Ok(updated)
                : Results.NotFound();
        })
        .WithName("UpdateNode")
        .Produces<NodeDto>();

        app.MapDelete("/api/node/{id:guid}", async (Guid id, INodeService nodeService) =>
        {
            var deleted = await nodeService.DeleteNodeAsync(id);
            return TypedResults.Ok(deleted);
        })
        .WithName("DeleteNode");
    }
}
