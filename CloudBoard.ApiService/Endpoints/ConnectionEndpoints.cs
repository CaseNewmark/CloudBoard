using CloudBoard.ApiService.Dtos;
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
        app.MapPost("/api/cloudboard/{cloudboardId:guid}/connection", async (string cloudboardId, [FromBody] ConnectionDto connectionDto, IConnectionService connectionService) =>
        {
            var newConnection = await connectionService.CreateConnectionAsync(cloudboardId, connectionDto);
            return TypedResults.Created($"/api/cloudboard/{cloudboardId}/connection/{newConnection.Id}", newConnection);
        })
        .WithName("CreateConnection")
        .Produces<ConnectionDto>();

        app.MapGet("/api/connection/{connectionId:guid}", async (string connectionId, IConnectionService connectionService) =>
        {
            var connection = await connectionService.GetConnectionByIdAsync(connectionId);
            return connection is not null
                ? TypedResults.Ok(connection)
                : Results.NotFound();
        })
        .WithName("GetConnectionById")
        .Produces<ConnectionDto>();

        app.MapGet("/api/cloudboard/{cloudboardId:guid}/connection", async (string cloudboardId, IConnectionService connectionService) =>
        {
            var connections = await connectionService.GetConnectionsByCloudBoardDocumentIdAsync(cloudboardId);
            return TypedResults.Ok(connections);
        })
        .WithName("GetConnectionsByCloudBoardDocumentId")
        .Produces<IEnumerable<ConnectionDto>>();

        app.MapGet("/api/connector/{connectorId:guid}/connections", async (string connectorId, IConnectionService connectionService) =>
        {
            var connections = await connectionService.GetConnectionsByConnectorIdAsync(connectorId);
            return TypedResults.Ok(connections);
        })
        .WithName("GetConnectionsByConnectorId")
        .Produces<IEnumerable<ConnectionDto>>();

        app.MapPut("/api/connection/{connectionId:guid}", async (Guid connectionId, [FromBody] ConnectionDto connectionDto, IConnectionService connectionService) =>
        {
            var updated = await connectionService.UpdateConnectionAsync(connectionDto);
            return updated is not null
                ? TypedResults.Ok(updated)
                : Results.NotFound();
        })
        .WithName("UpdateConnection")
        .Produces<ConnectionDto>();

        app.MapDelete("/api/connection/{connectionId:guid}", async (string connectionId, IConnectionService connectionService) =>
        {
            var deleted = await connectionService.DeleteConnectionAsync(connectionId);
            return TypedResults.Ok(deleted);
        })
        .WithName("DeleteConnection");
    }
}
