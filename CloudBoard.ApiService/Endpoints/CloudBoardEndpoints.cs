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
        app.MapPost("/api/cloudboard", async ([FromBody] CloudBoardDto document, ICloudBoardService cloudBoardService) =>
        {
            var newDocument = await cloudBoardService.CreateDocumentAsync(document);
            return TypedResults.Created($"/api/cloudboard/{newDocument.Id}", newDocument);
        })
        .WithName("CreateCloudBoard")
        .Produces<CloudBoardDto>();

        app.MapGet("/api/cloudboard", async (ICloudBoardService cloudBoardService) =>
        {
            var documentList = await cloudBoardService.GetAllCloudBoardDocumentsAsync();
            return TypedResults.Ok(documentList);
        })
        .WithName("GetAllCloudBoards");

        app.MapGet("/api/cloudboard/{cloudboardId:guid}", async (string cloudboardId, ICloudBoardService cloudBoardService) =>
        {
            var document = await cloudBoardService.GetCloudBoardDocumentByIdAsync(cloudboardId);
            return document is not null
                ? TypedResults.Ok(document)
                : Results.NotFound();
        })
        .WithName("GetCloudBoardById")
        .Produces<CloudBoardDto>();

        app.MapPut("/api/cloudboard/{cloudboardId:guid}", async (string cloudboardId, [FromBody] CloudBoardDto updateDto, ICloudBoardService cloudBoardService) =>
        {
            var updated = await cloudBoardService.UpdateCloudBoardDocumentAsync(updateDto);
            return updated is not null
                ? TypedResults.Ok(updated)
                : Results.NotFound();
        })
        .WithName("UpdateCloudBoard")
        .Produces<CloudBoardDto>();

        app.MapDelete("/api/cloudboard/{cloudboardId:guid}", async (string cloudboardId, ICloudBoardService cloudBoardService) =>
        {
            var deleted = await cloudBoardService.DeleteCloudBoardDocumentAsync(cloudboardId);
            return TypedResults.Ok(deleted);
        })
        .WithName("DeleteCloudBoard");
    }
}