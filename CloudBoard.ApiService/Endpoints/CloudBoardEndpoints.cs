using System.Net.Mail;
using CloudBoard.ApiService.Auth;
using CloudBoard.ApiService.Dtos;
using CloudBoard.ApiService.Hubs;
using CloudBoard.ApiService.Services.Contracts;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;

namespace CloudBoard.ApiService.Endpoints;

public static class CloudBoardEndpoints
{
    private const int MaxMembers = 50;

    public static void MapCloudBoardEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/cloudboard", async ([FromBody] CloudBoardDto document, ICloudBoardService cloudBoardService, HttpContext context) =>
        {
            var userId = context.User.GetUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Results.BadRequest("User identification not found in token");
            }

            document.CreatedBy = userId;
            document.CreatedAt = DateTime.UtcNow;

            var newDocument = await cloudBoardService.CreateDocumentAsync(document);
            return TypedResults.Created($"/api/cloudboard/{newDocument.Id}", newDocument);
        })
        .WithName("CreateCloudBoard")
        .Produces<CloudBoardDto>(201)
        .RequireAuthorization();

        // Boards the user owns plus boards shared with their verified email.
        app.MapGet("/api/cloudboard", async (ICloudBoardService cloudBoardService, HttpContext context) =>
        {
            var userId = context.User.GetUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Results.BadRequest("User identification not found in token");
            }

            var documentList = await cloudBoardService.GetAllCloudBoardDocumentsByUserAsync(userId, context.User.GetVerifiedEmail());
            return TypedResults.Ok(documentList);
        })
        .WithName("GetAllCloudBoards")
        .Produces<IEnumerable<CloudBoardDto>>()
        .RequireAuthorization();

        app.MapGet("/api/cloudboard/{cloudboardId:guid}", async (Guid cloudboardId, ICloudBoardService cloudBoardService, IBoardAccessService boardAccess, HttpContext context) =>
        {
            var access = await boardAccess.ForBoardAsync(cloudboardId, context.User);
            if (access.DenyUnlessCanEdit() is { } denied) return denied;

            return TypedResults.Ok(await cloudBoardService.GetCloudBoardDocumentByIdAsync(cloudboardId.ToString()));
        })
        .WithName("GetCloudBoardById")
        .Produces<CloudBoardDto>()
        .RequireAuthorization();

        // Updates board metadata (name, description) only; owner only.
        app.MapPut("/api/cloudboard/{cloudboardId:guid}", async (Guid cloudboardId, [FromBody] CloudBoardDto updateDto, ICloudBoardService cloudBoardService, IBoardAccessService boardAccess, IBoardNotifier notifier, HttpContext context) =>
        {
            var access = await boardAccess.ForBoardAsync(cloudboardId, context.User);
            if (access.DenyUnlessOwner() is { } denied) return denied;

            updateDto.Id = cloudboardId.ToString();
            var updated = await cloudBoardService.UpdateCloudBoardDocumentAsync(updateDto);
            if (updated is null) return Results.NotFound();

            await notifier.BoardUpdatedAsync(cloudboardId, new BoardMetadata(cloudboardId, updated.Name, updated.Description));
            return TypedResults.Ok(updated);
        })
        .WithName("UpdateCloudBoard")
        .Produces<CloudBoardDto>()
        .RequireAuthorization();

        app.MapDelete("/api/cloudboard/{cloudboardId:guid}", async (Guid cloudboardId, ICloudBoardService cloudBoardService, IBoardAccessService boardAccess, IBoardNotifier notifier, HttpContext context) =>
        {
            var access = await boardAccess.ForBoardAsync(cloudboardId, context.User);
            if (access.DenyUnlessOwner() is { } denied) return denied;

            var deleted = await cloudBoardService.DeleteCloudBoardDocumentAsync(cloudboardId.ToString());
            if (deleted)
            {
                await notifier.BoardDeletedAsync(cloudboardId);
            }
            return TypedResults.Ok(deleted);
        })
        .WithName("DeleteCloudBoard")
        .Produces<bool>()
        .RequireAuthorization();

        app.MapGet("/api/cloudboard/{cloudboardId:guid}/members", async (Guid cloudboardId, ICloudBoardService cloudBoardService, IBoardAccessService boardAccess, HttpContext context) =>
        {
            var access = await boardAccess.ForBoardAsync(cloudboardId, context.User);
            if (access.DenyUnlessCanEdit() is { } denied) return denied;

            var emails = await cloudBoardService.GetMembersAsync(cloudboardId);
            return TypedResults.Ok(new CloudBoardMembersDto { Emails = emails.ToList() });
        })
        .WithName("GetCloudBoardMembers")
        .Produces<CloudBoardMembersDto>()
        .RequireAuthorization();

        // Replaces the set of users the board is shared with; owner only.
        app.MapPut("/api/cloudboard/{cloudboardId:guid}/members", async (Guid cloudboardId, [FromBody] CloudBoardMembersDto membersDto, ICloudBoardService cloudBoardService, IBoardAccessService boardAccess, IBoardNotifier notifier, HttpContext context) =>
        {
            var access = await boardAccess.ForBoardAsync(cloudboardId, context.User);
            if (access.DenyUnlessOwner() is { } denied) return denied;

            var emails = new HashSet<string>();
            foreach (var raw in membersDto.Emails)
            {
                if (!MailAddress.TryCreate(raw?.Trim() ?? string.Empty, out var address) || address.Address != raw!.Trim())
                {
                    return Results.ValidationProblem(new Dictionary<string, string[]>
                    {
                        [nameof(CloudBoardMembersDto.Emails)] = new[] { $"'{raw}' is not a valid email address." }
                    });
                }
                emails.Add(ClaimsPrincipalExtensions.NormalizeEmail(address.Address));
            }

            // Sharing with yourself is a no-op.
            if (context.User.GetVerifiedEmail() is { } ownEmail)
            {
                emails.Remove(ownEmail);
            }

            if (emails.Count > MaxMembers)
            {
                return Results.ValidationProblem(new Dictionary<string, string[]>
                {
                    [nameof(CloudBoardMembersDto.Emails)] = new[] { $"A board can be shared with at most {MaxMembers} users." }
                });
            }

            var members = await cloudBoardService.SetMembersAsync(cloudboardId, emails);

            // Anyone currently viewing the board who is no longer the owner or a member stops receiving updates.
            var ownerId = context.User.GetUserId();
            await notifier.RevokeAccessAsync(cloudboardId, viewer =>
                viewer.UserId == ownerId || (viewer.Email is not null && members.Contains(viewer.Email)));

            return TypedResults.Ok(new CloudBoardMembersDto { Emails = members.ToList() });
        })
        .WithName("UpdateCloudBoardMembers")
        .Produces<CloudBoardMembersDto>()
        .ProducesValidationProblem()
        .RequireAuthorization();
    }
}
