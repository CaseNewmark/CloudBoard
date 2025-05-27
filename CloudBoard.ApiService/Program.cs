using AutoMapper;
using CloudBoard.ApiService.Data;
using CloudBoard.ApiService.Data.Repositories;
using CloudBoard.ApiService.Dtos;
using CloudBoard.ApiService.Endpoints;
using CloudBoard.ApiService.Services;
using CloudBoard.ApiService.Services.Contracts;

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
builder.Services.AddScoped<INodeService, NodeService>();
builder.Services.AddScoped<INodeRepository, NodeRepository>();
builder.Services.AddScoped<IConnectorService, ConnectorService>();
builder.Services.AddScoped<IConnectorRepository, ConnectorRepository>();
builder.Services.AddScoped<IConnectionService, ConnectionService>();
builder.Services.AddScoped<IConnectionRepository, ConnectionRepository>();

// Database Setup
builder.AddNpgsqlDbContext<CloudBoardDbContext>(connectionName: "cloudboard");
builder.Services.AddHostedService<DatabaseMigrationHostedService>();

var app = builder.Build();

// Map endpoints
app.MapCloudBoardEndpoints();
app.MapNodeEndpoints();
app.MapConnectorEndpoints();
app.MapConnectionEndpoints();

// Configure the HTTP request pipeline.
app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.MapDefaultEndpoints();

app.Run();
