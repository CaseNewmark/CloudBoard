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
        app.MapPost("/api/cloudboard/{cloudboardId:guid}/node", async (string cloudboardId, [FromBody] NodeDto nodeDto, INodeService nodeService) =>
        {
            var newNode = await nodeService.CreateNodeAsync(cloudboardId, nodeDto);
            return TypedResults.Created($"/api/cloudboard/{cloudboardId}/node/{newNode.Id}", newNode);
        })
        .WithName("CreateNode")
        .Produces<NodeDto>();

        app.MapGet("/api/node/{id:guid}", async (string nodeId, INodeService nodeService) =>
        {
            var node = await nodeService.GetNodeByIdAsync(nodeId);
            return node is not null
                ? TypedResults.Ok(node)
                : Results.NotFound();
        })
        .WithName("GetNodeById")
        .Produces<NodeDto>();

        app.MapPut("/api/node/{nodeId:guid}", async (string nodeId, [FromBody] NodeDto nodeDto, INodeService nodeService) =>
        {
            var updated = await nodeService.UpdateNodeAsync(nodeDto);
            return updated is not null
                ? TypedResults.Ok(updated)
                : Results.NotFound();
        })
        .WithName("UpdateNode")
        .Produces<NodeDto>();

        app.MapDelete("/api/node/{nodeId:guid}", async (string nodeId, INodeService nodeService) =>
        {
            var deleted = await nodeService.DeleteNodeAsync(nodeId);
            return TypedResults.Ok(deleted);
        })
        .WithName("DeleteNode");
    }
}
