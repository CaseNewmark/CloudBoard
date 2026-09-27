using System.Reflection;
using AutoMapper;
using CloudBoard.ApiService.Auth;
using CloudBoard.ApiService.Data;
using CloudBoard.ApiService.Endpoints;
using CloudBoard.ApiService.Hubs;
using CloudBoard.ApiService.Services;
using CloudBoard.ApiService.Services.Contracts;
using Microsoft.AspNetCore.Authentication.JwtBearer;

var builder = WebApplication.CreateBuilder(args);

// do not instantiate database related services if running in the Insider project
if (Assembly.GetEntryAssembly()?.GetName().Name != "GetDocument.Insider")
{
    // Add service defaults & Aspire client integrations.
    builder.AddServiceDefaults();

    // Database Setup
    builder.AddNpgsqlDbContext<CloudBoardDbContext>(connectionName: "cloudboard");
    builder.Services.AddHostedService<DatabaseMigrationHostedService>();
}

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

                        // Browsers can't set headers on WebSocket requests, so the SignalR
                        // client sends the token in the query string for the hub endpoint.
                        options.Events = new JwtBearerEvents
                        {
                            OnMessageReceived = context =>
                            {
                                var accessToken = context.Request.Query["access_token"];
                                if (!string.IsNullOrEmpty(accessToken) && context.HttpContext.Request.Path.StartsWithSegments("/hubs"))
                                {
                                    context.Token = accessToken;
                                }
                                return Task.CompletedTask;
                            }
                        };
                    }
                );
builder.Services.AddAuthorizationBuilder();

// Add SignalR
builder.Services.AddSignalR();

// Add CORS for SignalR
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowVueApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
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

// Board access checks, sharing and real-time notifications
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IBoardAccessService, BoardAccessService>();
builder.Services.AddSingleton<BoardPresenceTracker>();
builder.Services.AddScoped<IBoardNotifier, BoardNotifier>();
builder.Services.AddScoped<IBoardImageService, BoardImageService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseExceptionHandler();

// Use CORS
app.UseCors("AllowVueApp");

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
app.MapImageEndpoints();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.MapDefaultEndpoints();

app.Run();
