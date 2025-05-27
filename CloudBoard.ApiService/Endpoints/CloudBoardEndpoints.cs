using CloudBoard.ApiService.Dtos;
using CloudBoard.ApiService.Services.Contracts;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;

namespace CloudBoard.ApiService.Endpoints;

public static class CloudBoardEndpoints
{
    public static void MapCloudBoardEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/cloudboard", async ([FromBody] CreateCloudBoardDocumentDto document, ICloudBoardService cloudBoardService) =>
        {
            var newDocument = await cloudBoardService.CreateDocumentAsync(document);
            return Results.Created($"/api/cloudboard/{newDocument.Id}", newDocument);
        })
        .WithName("SaveCloudBoard")
        .Produces<CloudBoardDocumentDto>();

        app.MapGet("/api/cloudboard", async (ICloudBoardService cloudBoardService) =>
        {
            var documentList = await cloudBoardService.GetAllCloudBoardDocumentsAsync();
            return Results.Ok(documentList);
        })
        .WithName("GetAllCloudBoards");

        app.MapGet("/api/cloudboard/{id:guid}", async (Guid id, ICloudBoardService cloudBoardService) =>
        {
            var document = await cloudBoardService.GetCloudBoardDocumentByIdAsync(id);
            return document is not null
                ? Results.Ok(document)
                : Results.NotFound();
        })
        .WithName("GetCloudBoardById")
        .Produces<CloudBoardDocumentDto>();

        app.MapPut("/api/cloudboard/{id:guid}", async (Guid id, [FromBody] CloudBoardDocumentDto updateDto, ICloudBoardService cloudBoardService) =>
        {
            var updated = await cloudBoardService.UpdateCloudBoardDocumentAsync(id, updateDto);
            return updated is not null
                ? Results.Ok(updated)
                : Results.NotFound();
        })
        .WithName("UpdateCloudBoard")
        .Produces<CloudBoardDocumentDto>();

        app.MapDelete("/api/cloudboard/{id:guid}", async (Guid id, ICloudBoardService cloudBoardService) =>
        {
            var deleted = await cloudBoardService.DeleteCloudBoardDocumentAsync(id);
            return deleted
                ? Results.NoContent()
                : Results.NotFound();
        })
        .WithName("DeleteCloudBoard");
    }
}