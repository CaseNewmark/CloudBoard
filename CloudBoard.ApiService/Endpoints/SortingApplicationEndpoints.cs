using CloudBoard.ApiService.Dtos;
using CloudBoard.ApiService.Services.Contracts;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;

namespace CloudBoard.ApiService.Endpoints;

public static class SortingApplicationEndpoints
{
    public static void MapSortingApplicationEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/sorting-applications", async (ISortingApplicationService sortingApplicationService) =>
        {
            var applications = await sortingApplicationService.GetAllSortingApplicationsAsync();
            return TypedResults.Ok(applications);
        })
        .WithName("GetAllSortingApplications")
        .WithOpenApi()
        .Produces<IEnumerable<SortingApplicationDto>>(StatusCodes.Status200OK);

        app.MapGet("/api/sorting-applications/{applicationId:guid}", async (string applicationId, ISortingApplicationService sortingApplicationService) =>
        {
            var application = await sortingApplicationService.GetSortingApplicationByIdAsync(applicationId);
            return application is not null
                ? TypedResults.Ok(application)
                : Results.NotFound();
        })
        .WithName("GetSortingApplicationById")
        .WithOpenApi()
        .Produces<SortingApplicationDto>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status404NotFound);

        app.MapPost("/api/sorting-applications", async ([FromBody] SortingApplicationDto sortingApplicationDto, ISortingApplicationService sortingApplicationService) =>
        {
            var newApplication = await sortingApplicationService.CreateSortingApplicationAsync(sortingApplicationDto);
            return TypedResults.Created($"/api/sorting-applications/{newApplication.Id}", newApplication);
        })
        .WithName("CreateSortingApplication")
        .WithOpenApi()
        .Accepts<SortingApplicationDto>("application/json")
        .Produces<SortingApplicationDto>(StatusCodes.Status201Created)
        .Produces(StatusCodes.Status400BadRequest);

        app.MapPut("/api/sorting-applications/{applicationId:guid}", async (string applicationId, [FromBody] SortingApplicationDto sortingApplicationDto, ISortingApplicationService sortingApplicationService) =>
        {
            if (applicationId != sortingApplicationDto.Id)
                return Results.BadRequest("ID mismatch");

            var updated = await sortingApplicationService.UpdateSortingApplicationAsync(sortingApplicationDto);
            return updated is not null
                ? TypedResults.Ok(updated)
                : Results.NotFound();
        })
        .WithName("UpdateSortingApplication")
        .WithOpenApi()
        .Accepts<SortingApplicationDto>("application/json")
        .Produces<SortingApplicationDto>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status400BadRequest)
        .Produces(StatusCodes.Status404NotFound);

        app.MapDelete("/api/sorting-applications/{applicationId:guid}", async (string applicationId, ISortingApplicationService sortingApplicationService) =>
        {
            var deleted = await sortingApplicationService.DeleteSortingApplicationAsync(applicationId);
            return TypedResults.Ok(deleted);
        })
        .WithName("DeleteSortingApplication")
        .WithOpenApi()
        .Produces<bool>(StatusCodes.Status200OK);

        app.MapGet("/api/sorting-applications/{applicationId:guid}/process-steps", async (string applicationId, ISortingApplicationService sortingApplicationService) =>
        {
            var processSteps = await sortingApplicationService.GetProcessStepsBySortingApplicationIdAsync(applicationId);
            return TypedResults.Ok(processSteps);
        })
        .WithName("GetProcessStepsBySortingApplicationId")
        .WithOpenApi()
        .Produces<IEnumerable<ProcessStepDto>>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status404NotFound);
    }
}
