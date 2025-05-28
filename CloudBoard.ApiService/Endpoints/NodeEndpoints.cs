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
        app.MapPost("/api/node", async ([FromBody] CreateNodeDto nodeDto, INodeService nodeService) =>
        {
            var newNode = await nodeService.CreateNodeAsync(nodeDto);
            return Results.Created($"/api/node/{newNode.Id}", newNode);
        })
        .WithName("CreateNode")
        .Produces<NodeDto>();

        app.MapGet("/api/node/{id:guid}", async (Guid id, INodeService nodeService) =>
        {
            var node = await nodeService.GetNodeByIdAsync(id);
            return node is not null
                ? Results.Ok(node)
                : Results.NotFound();
        })
        .WithName("GetNodeById")
        .Produces<NodeDto>();

        app.MapPut("/api/node/{id:guid}", async (Guid id, [FromBody] NodeDto nodeDto, INodeService nodeService) =>
        {
            var updated = await nodeService.UpdateNodeAsync(id, nodeDto);
            return updated is not null
                ? Results.Ok(updated)
                : Results.NotFound();
        })
        .WithName("UpdateNode")
        .Produces<NodeDto>();

        app.MapDelete("/api/node/{id:guid}", async (Guid id, INodeService nodeService) =>
        {
            var deleted = await nodeService.DeleteNodeAsync(id);
            return deleted
                ? Results.NoContent()
                : Results.NotFound();
        })
        .WithName("DeleteNode");
    }
}
