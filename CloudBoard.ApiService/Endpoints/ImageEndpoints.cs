using CloudBoard.ApiService.Auth;
using CloudBoard.ApiService.Dtos;
using CloudBoard.ApiService.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.Net.Http.Headers;

namespace CloudBoard.ApiService.Endpoints;

public static class ImageEndpoints
{
    public static void MapImageEndpoints(this IEndpointRouteBuilder app)
    {
        // Antiforgery doesn't apply: the API authenticates with a bearer token, not cookies,
        // so another site can't make the browser send an authenticated form post.
        app.MapPost("/api/cloudboard/{cloudboardId:guid}/images", async (Guid cloudboardId, IFormFile? file, IBoardImageService images, IBoardAccessService boardAccess, HttpContext context) =>
        {
            var access = await boardAccess.ForBoardAsync(cloudboardId, context.User);
            if (access.DenyUnlessCanEdit() is { } denied) return denied;

            if (file is null || file.Length == 0)
            {
                return ValidationError("Choose an image file to upload.");
            }
            if (file.Length > BoardImageService.MaxImageBytes)
            {
                return ValidationError($"Images can be at most {BoardImageService.MaxImageBytes / (1024 * 1024)} MB.");
            }

            using var buffer = new MemoryStream((int)file.Length);
            await file.CopyToAsync(buffer);
            var image = await images.AddAsync(cloudboardId, buffer.ToArray(), context.User.GetUserId()!);
            return image is null
                ? ValidationError("Only PNG, JPEG, GIF and WebP images are supported.")
                : TypedResults.Created(image.Url, image);
        })
        .WithName("UploadImage")
        .Accepts<IFormFile>("multipart/form-data")
        .Produces<BoardImageDto>(201)
        .ProducesValidationProblem()
        .DisableAntiforgery()
        .WithMetadata(new RequestSizeLimitAttribute(BoardImageService.MaxImageBytes + 64 * 1024))
        .RequireAuthorization();

        app.MapGet("/api/images/{imageId:guid}", async (Guid imageId, IBoardImageService images, IBoardAccessService boardAccess, HttpContext context) =>
        {
            var access = await boardAccess.ForImageAsync(imageId, context.User);
            if (access.DenyUnlessCanEdit() is { } denied) return denied;

            var image = await images.GetAsync(imageId);
            if (image is null) return Results.NotFound();

            // An image never changes (a new upload gets a new ID), so the browser can keep it.
            context.Response.Headers.CacheControl = "private, max-age=31536000, immutable";
            context.Response.Headers.XContentTypeOptions = "nosniff";
            return TypedResults.File(image.Data, image.ContentType, entityTag: new EntityTagHeaderValue($"\"{image.Id:N}\""));
        })
        .WithName("GetImage")
        .RequireAuthorization();

        // Pasting nodes into another board copies their images there, so the new board
        // doesn't depend on access to the original one.
        app.MapPost("/api/cloudboard/{cloudboardId:guid}/images/{imageId:guid}/copy", async (Guid cloudboardId, Guid imageId, IBoardImageService images, IBoardAccessService boardAccess, HttpContext context) =>
        {
            var target = await boardAccess.ForBoardAsync(cloudboardId, context.User);
            if (target.DenyUnlessCanEdit() is { } deniedTarget) return deniedTarget;
            var source = await boardAccess.ForImageAsync(imageId, context.User);
            if (source.DenyUnlessCanEdit() is { } deniedSource) return deniedSource;

            var copy = await images.CopyAsync(imageId, cloudboardId, context.User.GetUserId()!);
            return copy is null ? Results.NotFound() : TypedResults.Ok(copy);
        })
        .WithName("CopyImage")
        .Produces<BoardImageDto>()
        .RequireAuthorization();
    }

    private static IResult ValidationError(string message) =>
        Results.ValidationProblem(new Dictionary<string, string[]> { ["file"] = new[] { message } });
}
