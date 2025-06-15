using CloudBoard.ApiService.Dtos;
using CloudBoard.ApiService.Services.Contracts;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using System.Security.Claims;

namespace CloudBoard.ApiService.Endpoints;

public static class CloudBoardEndpoints
{
    public static void MapCloudBoardEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/cloudboard", async ([FromBody] CloudBoardDto document, ICloudBoardService cloudBoardService, HttpContext context) =>
        {
            // Extract user information from JWT token
            var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                        ?? context.User.FindFirst("sub")?.Value;

            if (string.IsNullOrEmpty(userId))
            {
                return Results.BadRequest("User identification not found in token");
            }

            // Set user information on the document
            document.CreatedBy = userId;
            document.CreatedAt = DateTime.UtcNow;

            var newDocument = await cloudBoardService.CreateDocumentAsync(document);
            return TypedResults.Created($"/api/cloudboard/{newDocument.Id}", newDocument);
        })
        .WithName("CreateCloudBoard")
        .Produces<CloudBoardDto>()
        .RequireAuthorization();

        app.MapGet("/api/cloudboard", async (ICloudBoardService cloudBoardService, HttpContext context) =>
        {
            // Get current user ID to filter boards
            var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                        ?? context.User.FindFirst("sub")?.Value;

            if (string.IsNullOrEmpty(userId))
            {
                return Results.BadRequest("User identification not found in token");
            }

            var documentList = await cloudBoardService.GetAllCloudBoardDocumentsByUserAsync(userId);
            return TypedResults.Ok(documentList);
        })
        .WithName("GetAllCloudBoards")
        .Produces<IEnumerable<CloudBoardDto>>()
        .RequireAuthorization();

        app.MapGet("/api/cloudboard/{cloudboardId:guid}", async (string cloudboardId, ICloudBoardService cloudBoardService, HttpContext context) =>
        {
            var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                        ?? context.User.FindFirst("sub")?.Value;

            if (string.IsNullOrEmpty(userId))
            {
                return Results.BadRequest("User identification not found in token");
            }

            var document = await cloudBoardService.GetCloudBoardDocumentByIdAsync(cloudboardId);
            
            if (document is null)
            {
                return Results.NotFound();
            }

            // Check if the user owns this cloudboard
            if (document.CreatedBy != userId)
            {
                return Results.Forbid();
            }

            return TypedResults.Ok(document);
        })
        .WithName("GetCloudBoardById")
        .Produces<CloudBoardDto>()
        .RequireAuthorization();

        app.MapPut("/api/cloudboard/{cloudboardId:guid}", async (string cloudboardId, [FromBody] CloudBoardDto updateDto, ICloudBoardService cloudBoardService, HttpContext context) =>
        {
            var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                        ?? context.User.FindFirst("sub")?.Value;

            if (string.IsNullOrEmpty(userId))
            {
                return Results.BadRequest("User identification not found in token");
            }

            // First check if the cloudboard exists and user owns it
            var existingDocument = await cloudBoardService.GetCloudBoardDocumentByIdAsync(cloudboardId);
            if (existingDocument is null)
            {
                return Results.NotFound();
            }

            if (existingDocument.CreatedBy != userId)
            {
                return Results.Forbid();
            }

            // Preserve user information and update timestamp
            updateDto.CreatedBy = existingDocument.CreatedBy;
            updateDto.CreatedAt = existingDocument.CreatedAt;

            var updated = await cloudBoardService.UpdateCloudBoardDocumentAsync(updateDto);
            return updated is not null
                ? TypedResults.Ok(updated)
                : Results.NotFound();
        })
        .WithName("UpdateCloudBoard")
        .Produces<CloudBoardDto>()
        .RequireAuthorization();

        app.MapDelete("/api/cloudboard/{cloudboardId:guid}", async (string cloudboardId, ICloudBoardService cloudBoardService, HttpContext context) =>
        {
            var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                        ?? context.User.FindFirst("sub")?.Value;

            if (string.IsNullOrEmpty(userId))
            {
                return Results.BadRequest("User identification not found in token");
            }

            // First check if the cloudboard exists and user owns it
            var existingDocument = await cloudBoardService.GetCloudBoardDocumentByIdAsync(cloudboardId);
            if (existingDocument is null)
            {
                return Results.NotFound();
            }

            if (existingDocument.CreatedBy != userId)
            {
                return Results.Forbid();
            }

            var deleted = await cloudBoardService.DeleteCloudBoardDocumentAsync(cloudboardId);
            return TypedResults.Ok(deleted);
        })
        .WithName("DeleteCloudBoard")
        .Produces<bool>()
        .RequireAuthorization();
    }
}