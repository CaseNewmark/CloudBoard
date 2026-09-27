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

The API uses the minimal APIs pattern. Every endpoint requires authentication, and every board, node, connector and connection endpoint checks that the caller can access the board it belongs to (see [Access Control](#access-control)).

### CloudBoard Endpoints

- `GET /api/cloudboard` - Boards the user owns plus boards shared with them
- `GET /api/cloudboard/{id}` - Get a board with its nodes and connections (owner or member)
- `POST /api/cloudboard` - Create a board (the caller becomes its owner)
- `PUT /api/cloudboard/{id}` - Update name/description (owner only)
- `DELETE /api/cloudboard/{id}` - Delete a board (owner only)
- `GET /api/cloudboard/{id}/members` - Emails the board is shared with (owner or member)
- `PUT /api/cloudboard/{id}/members` - Replace the share list, body `{ "emails": [...] }` (owner only)

### Node Endpoints

- `POST /api/cloudboard/{cloudboardId}/node` - Create a node
- `GET /api/node/{id}` - Get a node
- `PUT /api/node/{id}` - Update a node (connectors in the body are ignored; use the connector endpoints)
- `DELETE /api/node/{id}` - Delete a node

### Connector Endpoints

- `POST /api/node/{nodeId}/connector` - Create a connector on a node
- `GET /api/node/{nodeId}/connectors` - Get a node's connectors
- `GET /api/connector/{id}` - Get a connector
- `PUT /api/connector/{id}` - Update a connector
- `DELETE /api/connector/{id}` - Delete a connector

### Connection Endpoints

- `POST /api/cloudboard/{cloudboardId}/connection` - Create a connection (both connectors must be on this board)
- `GET /api/cloudboard/{cloudboardId}/connection` - Get a board's connections
- `GET /api/connection/{id}` - Get a connection
- `GET /api/connector/{connectorId}/connections` - Get connections attached to a connector
- `PUT /api/connection/{id}` - Update a connection
- `DELETE /api/connection/{id}` - Delete a connection, plus its connectors if no other connection uses them

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

### Access Control

All endpoints require a JWT in the Authorization header:

```
Authorization: Bearer <jwt-token>
```

Access is decided per board by `IBoardAccessService` (`Auth/BoardAccessService.cs`):

- **Owner** (`CreatedBy` matches the token's `sub`): full access, including rename, sharing and delete.
- **Member** (the token's email is in the board's share list): can view and edit nodes, connectors and connections.
- **Anyone else**: `403`. Unknown IDs return `404`.

Sharing is keyed on email and only honours the token's email if Keycloak marks it as verified (`email_verified: true`), so an unverified address never grants access.

## Real-time Features

### SignalR Hub

`CloudBoardHub` is mapped at `/hubs/cloudboard`. Clients join the board they have open and receive every change other users make to it. The hub handles only membership and presence: all changes go through the REST API, which validates them and then broadcasts through `IBoardNotifier`.

Browsers can't set headers on WebSocket requests, so the client sends its token as the `access_token` query parameter; the API accepts it only for `/hubs` paths.

### Hub Methods

```ts
// Join a board (checks access); returns the users currently viewing it
const viewers = await connection.invoke('JoinCloudBoard', boardId);

// Leave the board
await connection.invoke('LeaveCloudBoard', boardId);
```

A connection is on at most one board at a time; joining another board leaves the previous one.

### Client Events

Every event is sent as `(boardId, payload)`:

- `NodeCreated`, `NodeUpdated` - payload is the node (connector changes are sent as `NodeUpdated`)
- `NodeDeleted` - payload is the node ID
- `ConnectionCreated`, `ConnectionUpdated` - payload is the connection
- `ConnectionDeleted` - payload is the connection ID
- `BoardUpdated` - payload is `{ id, name, description }`
- `BoardDeleted` - the owner deleted the board
- `AccessRevoked` - sent to a viewer who was removed from the share list
- `PresenceChanged` - payload is the list of `{ userId, name }` viewing the board

### Avoiding Echoes

REST requests carry the caller's hub connection ID in the `X-SignalR-Connection-Id` header, and the notifier broadcasts to everyone in the board's group except that connection, since it has already applied the change locally.

### Limitations

Presence is tracked in memory (`BoardPresenceTracker`), which assumes a single API instance. Running several instances needs a SignalR backplane (e.g. Redis) and a shared presence store. Concurrent edits to the same node are last-write-wins.

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
- **CloudBoardMember**: A user a board is shared with (by email)

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
