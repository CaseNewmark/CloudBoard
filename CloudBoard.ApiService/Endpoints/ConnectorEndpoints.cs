using CloudBoard.ApiService.Dtos;
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
        app.MapPost("/api/node/{nodeId:guid}/connector", async (string nodeId, [FromBody] ConnectorDto connectorDto, IConnectorService connectorService) =>
        {
            var newConnector = await connectorService.CreateConnectorAsync(nodeId, connectorDto);
            return TypedResults.Created($"/api/node/{nodeId}/connector/{newConnector.Id}", newConnector);
        })
        .WithName("CreateConnector")
        .Produces<ConnectorDto>();

        app.MapGet("/api/connector/{connectorId:guid}", async (string connectorId, IConnectorService connectorService) =>
        {
            var connector = await connectorService.GetConnectorByIdAsync(connectorId);
            return connector is not null
                ? TypedResults.Ok(connector)
                : Results.NotFound();
        })
        .WithName("GetConnectorById")
        .Produces<ConnectorDto>();

        app.MapGet("/api/node/{nodeId:guid}/connectors", async (string nodeId, IConnectorService connectorService) =>
        {
            var connectors = await connectorService.GetConnectorsByNodeIdAsync(nodeId);
            return TypedResults.Ok(connectors);
        })
        .WithName("GetConnectorsByNodeId")
        .Produces<IEnumerable<ConnectorDto>>();

        app.MapPut("/api/connector/{connectorId:guid}", async (string connectorId, [FromBody] ConnectorDto connectorDto, IConnectorService connectorService) =>
        {
            var updated = await connectorService.UpdateConnectorAsync(connectorDto);
            return updated is not null
                ? TypedResults.Ok(updated)
                : Results.NotFound();
        })
        .WithName("UpdateConnector")
        .Produces<ConnectorDto>();

        app.MapDelete("/api/connector/{connectorId:guid}", async (string connectorId, IConnectorService connectorService) =>
        {
            var deleted = await connectorService.DeleteConnectorAsync(connectorId);
            return TypedResults.Ok(deleted);
        })
        .WithName("DeleteConnector");
    }
}
