using AutoMapper;
using CloudBoard.ApiService.Data;
using CloudBoard.ApiService.Dtos;
using CloudBoard.ApiService.Services;
using CloudBoard.ApiService.Services.Contracts;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

// Add service defaults & Aspire client integrations.
builder.AddServiceDefaults();

// Add services to the container.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddProblemDetails();
builder.Services.AddOpenApi();

builder.Services.AddAutoMapper(config => config.AddProfile<DtoMappingProfile>());

builder.Services.AddScoped<ICloudBoardService, CloudBoardService>();
builder.Services.AddScoped<ICloudBoardRepository, CloudBoardRepository>();

// Database Setup
builder.AddNpgsqlDbContext<CloudBoardDbContext>(connectionName: "cloudboard");
builder.Services.AddHostedService<DatabaseMigrationHostedService>();

var app = builder.Build();


// routes
app.MapPost("/api/cloudboard", async ([FromBody] CreateCloudBoardDocumentDto document, ICloudBoardService cloudBoardService) =>
{
    var newDocument = await cloudBoardService.CreateDocumentAsync(document);
    return TypedResults.Created($"/api/cloudboard/{newDocument.Id}", newDocument);
})
.WithName("SaveCloudBoard");

app.MapGet("/api/cloudboard", async (ICloudBoardService cloudBoardService) =>
{
    var documentList = await cloudBoardService.GetAllCloudBoardDocumentsAsync();
    return TypedResults.Ok(documentList);
})
.WithName("GetAllCloudBoards");

app.MapGet("/api/cloudboard/{id:guid}", async (Guid id) =>
{
    return Results.Ok(); // mapper.Map<FloorPlanDto>(floorPlan)) : Results.NotFound();
})
.WithName("GetCloudBoardById");
//.Produces<FloorPlanDto>();


// Configure the HTTP request pipeline.
app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.MapDefaultEndpoints();

app.Run();
