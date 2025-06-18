# CloudBoard API - Developer Documentation

CloudBoard API is a .NET 8 web API service that provides the backend functionality for the CloudBoard application. It handles data persistence, authentication, real-time collaboration, and business logic for managing cloudboards, nodes, connections, and user workflows.

## Table of Contents

- [Getting Started](#getting-started)
- [Architecture Overview](#architecture-overview)
- [API Endpoints](#api-endpoints)
- [Authentication & Authorization](#authentication--authorization)
- [Real-time Features](#real-time-features)
- [Database](#database)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Deployment](#deployment)

## Getting Started

### Prerequisites

- .NET 8 SDK
- PostgreSQL database
- Keycloak for authentication
- Docker (optional, for containerized development)

### Installation

For complete installation and setup instructions, please refer to the [main CloudBoard documentation](../README.md#development-setup) in the repository root.

The API will be available at `https://localhost:7001` (or configured port) when running through the Aspire host.

## Architecture Overview

### Core Technologies

- **.NET 8**: Modern web API framework
- **Entity Framework Core**: Object-relational mapping with PostgreSQL
- **AutoMapper**: Object-to-object mapping for DTOs
- **SignalR**: Real-time web functionality
- **Keycloak Integration**: OAuth/OpenID Connect authentication
- **Aspire**: Cloud-native application development

### Project Structure

```
CloudBoard.ApiService/
├── Data/                    # Entity Framework context and configurations
├── Endpoints/              # Minimal API endpoint definitions
├── Entities/               # Database entity models
├── DTOs/                   # Data Transfer Objects
├── Services/               # Business logic services
│   ├── Contracts/          # Service interfaces
│   └── Implementations/    # Service implementations
├── Repositories/           # Data access layer
├── Hubs/                   # SignalR hubs for real-time features
├── Migrations/             # Entity Framework migrations
└── Program.cs              # Application entry point and configuration
```

## API Endpoints

The API uses minimal APIs pattern with the following endpoint groups:

### CloudBoard Endpoints (`/api/cloudboards`)

- `GET /api/cloudboards` - List all cloudboards for authenticated user
- `GET /api/cloudboards/{id}` - Get specific cloudboard by ID
- `POST /api/cloudboards` - Create new cloudboard
- `PUT /api/cloudboards/{id}` - Update existing cloudboard
- `DELETE /api/cloudboards/{id}` - Delete cloudboard

### Node Endpoints (`/api/nodes`)

- `GET /api/nodes/{cloudboardId}` - Get all nodes for a cloudboard
- `POST /api/nodes` - Create new node
- `PUT /api/nodes/{id}` - Update existing node
- `DELETE /api/nodes/{id}` - Delete node
- `DELETE /api/nodes/batch` - Delete multiple nodes and connections

### Connector Endpoints (`/api/connectors`)

- `GET /api/connectors/{nodeId}` - Get connectors for a node
- `POST /api/connectors` - Create new connector
- `PUT /api/connectors/{id}` - Update connector
- `DELETE /api/connectors/{id}` - Delete connector

### Connection Endpoints (`/api/connections`)

- `GET /api/connections/{cloudboardId}` - Get connections for a cloudboard
- `POST /api/connections` - Create new connection
- `DELETE /api/connections/{id}` - Delete connection

## Authentication & Authorization

### Keycloak Integration

The API integrates with Keycloak for authentication:

```csharp
builder.Services.AddAuthentication()
    .AddKeycloakJwtBearer(
        serviceName: "keycloak",
        realm: "cloudboard",
        configureOptions: options =>
        {
            options.Audience = "cloudboard-client";
        }
    );
```

### Protected Endpoints

All API endpoints require authentication. JWT tokens must be included in the Authorization header:

```
Authorization: Bearer <jwt-token>
```

### User Context

Services can access the current user through `IHttpContextAccessor` and claims-based identity.

## Real-time Features

### SignalR Hub

The API includes a SignalR hub (`CloudBoardHub`) for real-time collaboration:

- **Connection Management**: Users join/leave cloudboard rooms
- **Live Updates**: Real-time synchronization of changes
- **Collaborative Editing**: Multiple users can edit simultaneously

### Hub Methods

```csharp
// Join a cloudboard room for real-time updates
await connection.InvokeAsync("JoinCloudBoard", cloudboardId);

// Leave a cloudboard room
await connection.InvokeAsync("LeaveCloudBoard", cloudboardId);
```

### Client Events

- `NodeAdded` - When a new node is created
- `NodeUpdated` - When a node is modified
- `NodeDeleted` - When a node is removed
- `ConnectionAdded` - When a new connection is created
- `ConnectionDeleted` - When a connection is removed

## Database

### Entity Framework Core

The API uses Entity Framework Core with PostgreSQL:

- **Code-First Approach**: Entities define the database schema
- **Migrations**: Database versioning and updates
- **Repository Pattern**: Data access abstraction

### Key Entities

- **CloudBoard**: Main container for nodes and connections
- **Node**: Individual elements in the flowchart
- **Connector**: Connection points on nodes
- **Connection**: Links between connectors
- **User**: User information and ownership

### Migration Commands

```bash
# Add new migration
dotnet ef migrations add MigrationName

# Update database
dotnet ef database update

# Generate SQL script
dotnet ef migrations script
```

## Development Workflow

### Service Layer Architecture

The API follows a layered architecture:

1. **Controllers/Endpoints**: HTTP request handling
2. **Services**: Business logic and validation
3. **Repositories**: Data access and queries
4. **Entities**: Domain models

### Adding New Features

1. Define entity models in `Entities/`
2. Create DTOs in `DTOs/`
3. Add AutoMapper profiles for DTO mapping
4. Implement repository interfaces and classes
5. Create service interfaces and implementations
6. Define minimal API endpoints
7. Add database migrations

### AutoMapper Configuration

DTOs are mapped using AutoMapper profiles:

```csharp
public class DtoMappingProfile : Profile
{
    public DtoMappingProfile()
    {
        CreateMap<CloudBoard, CloudBoardDto>();
        CreateMap<CreateCloudBoardDto, CloudBoard>();
        // Additional mappings...
    }
}
```

## Testing

### Unit Testing

- Test business logic in services
- Mock dependencies using interfaces
- Use in-memory database for repository tests

```bash
# Run tests
dotnet test
```

### Integration Testing

- Test complete API endpoints
- Use TestContainers for database testing
- Verify authentication and authorization

### Example Test Structure

```csharp
[Test]
public async Task CreateCloudBoard_Should_Return_Created_CloudBoard()
{
    // Arrange
    var dto = new CreateCloudBoardDto { Name = "Test Board" };
    
    // Act
    var result = await _service.CreateCloudBoardAsync(dto, userId);
    
    // Assert
    Assert.That(result.Name, Is.EqualTo("Test Board"));
}
```

## Deployment

### Docker Support

The API includes Docker support:

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
# Build steps...
```

### Environment Configuration

Configure different environments using `appsettings.{Environment}.json`:

- `appsettings.Development.json` - Local development
- `appsettings.Staging.json` - Staging environment  
- `appsettings.Production.json` - Production settings

### Required Configuration

```json
{
  "ConnectionStrings": {
    "cloudboard": "Host=localhost;Database=cloudboard;Username=user;Password=pass"
  },
  "Keycloak": {
    "Authority": "https://keycloak.example.com/realms/cloudboard",
    "Audience": "cloudboard-client"
  }
}
```

### Health Checks

The API includes health checks for:
- Database connectivity
- Keycloak authentication service
- SignalR hub status

Access health checks at `/health`

## Error Handling

### Global Exception Handling

The API uses built-in problem details for consistent error responses:

```csharp
app.UseExceptionHandler();
```

### Custom Exceptions

- `CloudBoardNotFoundException`
- `UnauthorizedAccessException`
- `ValidationException`

### Error Response Format

```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.4",
  "title": "Not Found",
  "status": 404,
  "detail": "CloudBoard with ID 123 was not found"
}
```

## Performance Considerations

### Database Optimization

- Use appropriate indexes on frequently queried columns
- Implement pagination for large result sets
- Use projection to select only needed columns
- Consider read replicas for high-traffic scenarios

### Caching Strategy

- Implement Redis caching for frequently accessed data
- Use EF Core query caching
- Consider output caching for stable endpoints

### SignalR Scaling

- Use Redis backplane for multiple server instances
- Implement connection management for large user bases
- Consider message batching for high-frequency updates

## Contributing

1. Follow .NET coding standards and conventions
2. Write unit tests for new services and repositories
3. Update API documentation for new endpoints
4. Use meaningful commit messages
5. Implement proper error handling and logging
6. Follow security best practices for authentication

## Troubleshooting

### Common Issues

- **Database connection errors**: Verify PostgreSQL is running and connection string is correct
- **Authentication failures**: Check Keycloak configuration and JWT token validity
- **SignalR connection issues**: Verify CORS settings and WebSocket support
- **Migration errors**: Ensure database schema is up to date

### Logging

The API uses structured logging with Serilog. Check logs for detailed error information and performance metrics.

For more detailed information about specific services or endpoints, refer to the inline XML documentation in the source code.
