using AutoMapper;
using CloudBoard.ApiService.Data;
using CloudBoard.ApiService.Endpoints;
using CloudBoard.ApiService.Hubs;
using CloudBoard.ApiService.Services;
using CloudBoard.ApiService.Services.Contracts;

var builder = WebApplication.CreateBuilder(args);

// Add service defaults & Aspire client integrations.
builder.AddServiceDefaults();

// Add services to the container.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddProblemDetails();
builder.Services.AddOpenApi();

builder.Services.AddAuthentication()
                .AddKeycloakJwtBearer(
                    serviceName: "keycloak",
                    realm: "cloudboard",
                    configureOptions: options =>
                    {
                        options.RequireHttpsMetadata = false; // Set to true in production
                        options.Audience = "cloudboard-client";
                    }
                );
builder.Services.AddAuthorizationBuilder();

// Add SignalR
builder.Services.AddSignalR();

// Add CORS for SignalR
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp", policy =>
    {
        policy.WithOrigins("http://localhost:4200", "https://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // Required for SignalR
    });
});

builder.Services.AddAutoMapper(config => config.AddProfile<DtoMappingProfile>());

builder.Services.AddScoped<ICloudBoardService, CloudBoardService>();
builder.Services.AddScoped<ICloudBoardRepository, CloudBoardRepository>();
builder.Services.AddScoped<INodeService, NodeService>();
builder.Services.AddScoped<INodeRepository, NodeRepository>();
builder.Services.AddScoped<IConnectorService, ConnectorService>();
builder.Services.AddScoped<IConnectorRepository, ConnectorRepository>();
builder.Services.AddScoped<IConnectionService, ConnectionService>();
builder.Services.AddScoped<IConnectionRepository, ConnectionRepository>();

// Add SignalR hub service
builder.Services.AddScoped<ICloudBoardHubService, CloudBoardHubService>();

// Database Setup
builder.AddNpgsqlDbContext<CloudBoardDbContext>(connectionName: "cloudboard");
builder.Services.AddHostedService<DatabaseMigrationHostedService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseExceptionHandler();

// Use CORS
app.UseCors("AllowAngularApp");

// Use authentication and authorization
app.UseAuthentication();
app.UseAuthorization();

// Map SignalR hub
app.MapHub<CloudBoardHub>("/hubs/cloudboard");

// Map endpoints
app.MapCloudBoardEndpoints();
app.MapNodeEndpoints();
app.MapConnectorEndpoints();
app.MapConnectionEndpoints();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.MapDefaultEndpoints();

app.Run();
