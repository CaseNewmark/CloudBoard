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
        app.MapPost("/api/connection", async ([FromBody] CreateConnectionDto connectionDto, IConnectionService connectionService) =>
        {
            var newConnection = await connectionService.CreateConnectionAsync(connectionDto);
            return Results.Created($"/api/connection/{newConnection.Id}", newConnection);
        })
        .WithName("CreateConnection")
        .Produces<ConnectionDto>();

        app.MapGet("/api/connection/{id:guid}", async (Guid id, IConnectionService connectionService) =>
        {
            var connection = await connectionService.GetConnectionByIdAsync(id);
            return connection is not null
                ? Results.Ok(connection)
                : Results.NotFound();
        })
        .WithName("GetConnectionById")
        .Produces<ConnectionDto>();

        app.MapGet("/api/cloudboard/{cloudBoardDocumentId:guid}/connections", async (Guid cloudBoardDocumentId, IConnectionService connectionService) =>
        {
            var connections = await connectionService.GetConnectionsByCloudBoardDocumentIdAsync(cloudBoardDocumentId);
            return Results.Ok(connections);
        })
        .WithName("GetConnectionsByCloudBoardDocumentId")
        .Produces<IEnumerable<ConnectionDto>>();

        app.MapGet("/api/connector/{connectorId:guid}/connections", async (Guid connectorId, IConnectionService connectionService) =>
        {
            var connections = await connectionService.GetConnectionsByConnectorIdAsync(connectorId);
            return Results.Ok(connections);
        })
        .WithName("GetConnectionsByConnectorId")
        .Produces<IEnumerable<ConnectionDto>>();

        app.MapPut("/api/connection/{id:guid}", async (Guid id, [FromBody] ConnectionDto connectionDto, IConnectionService connectionService) =>
        {
            var updated = await connectionService.UpdateConnectionAsync(id, connectionDto);
            return updated is not null
                ? Results.Ok(updated)
                : Results.NotFound();
        })
        .WithName("UpdateConnection")
        .Produces<ConnectionDto>();

        app.MapDelete("/api/connection/{id:guid}", async (Guid id, IConnectionService connectionService) =>
        {
            var deleted = await connectionService.DeleteConnectionAsync(id);
            return deleted
                ? Results.NoContent()
                : Results.NotFound();
        })
        .WithName("DeleteConnection");
    }
}
