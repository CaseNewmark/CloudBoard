# Database Model to Angular Component Integration Guidelines

## Overview

This document describes the architectural patterns and coding guidelines for connecting database models in the CloudBoard API to Angular frontend components. It provides a comprehensive guide for developers to understand the data flow from the database layer through to the user interface.

## Architecture Overview

The CloudBoard application follows a layered architecture with clear separation of concerns:

```
┌─────────────────────┐
│   Angular Frontend  │ ── Components, Services, Models
├─────────────────────┤
│   TypeScript DTOs   │ ── Data Transfer Objects (auto-generated)
├─────────────────────┤
│   HTTP API          │ ── RESTful endpoints
├─────────────────────┤
│   .NET API Service  │ ── Business Logic, DTOs, Endpoints
├─────────────────────┤
│   Entity Framework  │ ── ORM, Repositories
├─────────────────────┤
│   PostgreSQL DB     │ ── Database Tables
└─────────────────────┘
```

## Data Flow Layers

### 1. Database Layer (PostgreSQL + Entity Framework Core)

**Entity Models** located in `CloudBoard.ApiService/Data/`

```csharp
// Example: CloudBoard.cs
public class CloudBoard
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public List<Node> Nodes { get; set; } = new List<Node>();
    public List<Connection> Connections { get; set; } = new List<Connection>();
}
```

**Key Guidelines:**
- Use `[Key]` attribute for primary keys
- Use `[DatabaseGenerated(DatabaseGeneratedOption.Identity)]` for auto-generated IDs
- Define navigation properties for related entities
- Use appropriate data annotations for database constraints

### 2. Data Transfer Object (DTO) Layer

**API DTOs** located in `CloudBoard.ApiService/Dtos/`

```csharp
// Example: CloudBoardDto.cs
public class CloudBoardDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public List<NodeDto> Nodes { get; set; } = new List<NodeDto>();
    public List<ConnectionDto> Connections { get; set; } = new List<ConnectionDto>();
}
```

**TypeScript DTOs** auto-generated in `CloudBoard.Angular/src/app/services/api-client-service.ts`

```typescript
export interface CloudBoardDto {
    id?: string;
    name?: string;
    createdBy?: string;
    createdAt?: string;
    nodes?: NodeDto[];
    connections?: ConnectionDto[];
    [key: string]: any;
}
```

**Key Guidelines:**
- DTOs represent the contract between frontend and backend
- Use string IDs to avoid JavaScript number precision issues with GUIDs
- Optional properties (?) in TypeScript for flexibility
- Keep DTOs flat and simple - avoid deep nesting

### 3. Service Layer (.NET API)

**Service Interfaces** in `CloudBoard.ApiService/Services/Contracts/`
**Service Implementations** in `CloudBoard.ApiService/Services/`

```csharp
// Example service method
public async Task<CloudBoardDto> CreateCloudBoardAsync(CloudBoardDto cloudBoardDto)
{
    var cloudBoard = _mapper.Map<CloudBoard>(cloudBoardDto);
    var createdCloudBoard = await _cloudBoardRepository.AddDocumentAsync(cloudBoard);
    return _mapper.Map<CloudBoardDto>(createdCloudBoard);
}
```

**Key Guidelines:**
- Use AutoMapper for entity ↔ DTO conversion
- Implement proper error handling and logging
- Use dependency injection for repositories and other services
- Follow async/await patterns consistently

### 4. API Endpoints Layer

**Minimal API Endpoints** in `CloudBoard.ApiService/Endpoints/`

```csharp
// Example endpoint mapping
app.MapPost("/api/cloudboard", async ([FromBody] CloudBoardDto cloudBoardDto, ICloudBoardService cloudBoardService) =>
{
    var newCloudBoard = await cloudBoardService.CreateCloudBoardAsync(cloudBoardDto);
    return TypedResults.Created($"/api/cloudboard/{newCloudBoard.Id}", newCloudBoard);
})
.WithName("CreateCloudBoard")
.Produces<CloudBoardDto>();
```

**Key Guidelines:**
- Use meaningful HTTP status codes
- Include proper route parameters and constraints
- Use `[FromBody]` for complex request objects
- Return `TypedResults` for better type safety

### 5. Angular Frontend Models

**Domain Models** in `CloudBoard.Angular/src/app/cloudboard/models/`

```typescript
// Example: cloudboard.ts
export interface CloudBoard {
  id: string;
  name: string;
  nodes: Node[];
  connections: Connection[];
}

export interface Node {
  id: string;
  type: NodeType;
  name: string;
  position: NodePosition;
  connectors: Connector[];
  properties: NodeProperties;
}
```

**Key Guidelines:**
- Use TypeScript interfaces for type safety
- Define enums for constrained values (NodeType, ConnectorPosition, etc.)
- Create specific property interfaces for different node types
- Keep domain models separate from DTOs

### 6. Mapping Layer (Angular)

**Mappers** in `CloudBoard.Angular/src/app/cloudboard/models/mapper.ts`

```typescript
// DTO to Domain mapping
export function mapCloudBoardDtoToCloudBoard(dto: CloudBoardDto): CloudBoard {
  return {
    id: dto.id!,
    name: dto.name!,
    nodes: dto.nodes?.map(nodeDto => mapNodeDtoToNode(nodeDto)) || [], 
    connections: dto.connections?.map(connectionDto => mapConnectionDtoToConnection(connectionDto)) || []
  };
}

// Domain to DTO mapping
export function mapCloudBoardToCloudBoardDto(cloudBoard: CloudBoard): CloudBoardDto {
  return {
    id: cloudBoard.id,
    name: cloudBoard.name,
    nodes: cloudBoard.nodes.map(node => mapNodeToNodeDto(node)),
    connections: cloudBoard.connections.map(connection => mapConnectionToConnectionDto(connection))
  };
}
```

**Key Guidelines:**
- Create bidirectional mapping functions (DTO ↔ Domain)
- Handle null/undefined values gracefully
- Use non-null assertion (!) only when certain of data integrity
- Map collections using array methods like `map()`

### 7. Angular Services Layer

**Services** in `CloudBoard.Angular/src/app/cloudboard/services/`

```typescript
// Example service method
public loadCloudBoardById(id: string): Observable<CloudBoard> {
  return this.apiClient.getCloudBoardById(id).pipe(
    map((dto: CloudBoardDto) => mapCloudBoardDtoToCloudBoard(dto)),
    tap(cloudBoard => this.currentCloudBoard.next(cloudBoard)),
    catchError(this.handleError)
  );
}
```

**Key Guidelines:**
- Use RxJS operators for data transformation
- Handle errors consistently
- Use ReplaySubject or BehaviorSubject for state management
- Inject API client service for HTTP communication

### 8. Angular Components Layer

**Components** in `CloudBoard.Angular/src/app/cloudboard/`

```typescript
// Example component usage
@Component({
  selector: 'app-cloudboard',
  templateUrl: './cloudboard.component.html'
})
export class CloudboardComponent implements OnInit {
  public currentCloudBoard: CloudBoard | undefined;
  
  private loadCloudBoardById(cloudboardId: string): void {
    this.cloudboardService.loadCloudBoardById(cloudboardId).subscribe({
      next: (cloudboard) => {
        this.currentCloudBoard = cloudboard;
        this.changeDetectorRef.detectChanges();
      },
      error: (error) => {
        // Handle error appropriately
      }
    });
  }
}
```

**Key Guidelines:**
- Use OnPush change detection for performance
- Handle loading states and errors in the UI
- Call `detectChanges()` when updating state manually
- Subscribe to observables and properly unsubscribe in `ngOnDestroy`

## Complete Data Flow Example

Here's how a complete CRUD operation flows through all layers:

### Creating a New Node

1. **User Action**: User clicks "Add Node" in the Angular component
2. **Component**: Calls service method with node data
3. **Angular Service**: Maps domain model to DTO and calls API client
4. **HTTP Request**: POST request sent to .NET API endpoint
5. **API Endpoint**: Receives DTO and calls business service
6. **Business Service**: Maps DTO to entity and calls repository
7. **Repository**: Saves entity to database via Entity Framework
8. **Response Flow**: Entity → DTO → HTTP Response → TypeScript DTO → Domain Model → Component Update

```typescript
// Angular Component
protected addNode(nodeType: NodeType, position: NodePosition): void {
  if (this.currentCloudBoard) {
    const nodeDto: Node = {
      id: '', 
      name: this.nodeService.getDefaultNameForNodeType(nodeType),
      position: { x: position.x, y: position.y },
      connectors: [],
      type: nodeType,
      properties: this.nodeService.getDefaultPropertiesForType(nodeType)
    };

    this.nodeService.createNode(this.currentCloudBoard.id, nodeDto).subscribe({
      next: newNode => {
        this.currentCloudBoard?.nodes.push(newNode);
        this.changeDetectorRef.detectChanges();
      }
    });
  }
}
```

```csharp
// .NET API Endpoint
app.MapPost("/api/cloudboard/{cloudboardId:guid}/node", async (string cloudboardId, [FromBody] NodeDto nodeDto, INodeService nodeService) =>
{
    var newNode = await nodeService.CreateNodeAsync(cloudboardId, nodeDto);
    return TypedResults.Created($"/api/cloudboard/{cloudboardId}/node/{newNode.Id}", newNode);
});
```

## Best Practices

### Entity Design
- Use meaningful property names and types
- Define proper relationships with navigation properties
- Include appropriate database constraints and indices
- Use value objects for complex properties (e.g., `NodePosition`)

### DTO Design
- Keep DTOs simple and flat
- Use string IDs for GUIDs to avoid JavaScript precision issues
- Make properties optional in TypeScript interfaces
- Include validation attributes where appropriate

### Service Design
- Use dependency injection consistently
- Implement proper error handling and logging
- Use AutoMapper for object mapping
- Follow async/await patterns

### Angular Integration
- Separate domain models from DTOs
- Use mapping functions for data transformation
- Implement proper error handling in components
- Use reactive programming with RxJS

### Testing Considerations
- Unit test mapping functions thoroughly
- Test service methods with mocked dependencies
- Integration test the complete data flow
- Test error scenarios and edge cases

## Common Patterns

### Hierarchical Data Loading
When loading nested data (e.g., CloudBoard with Nodes and Connections):

```csharp
// Entity Framework - Include related data
var cloudBoard = await _context.CloudBoardDocuments
    .Include(cb => cb.Nodes)
        .ThenInclude(n => n.Connectors)
    .Include(cb => cb.Connections)
    .FirstOrDefaultAsync(cb => cb.Id == id);
```

### Partial Updates
For updating specific properties without affecting the entire entity:

```typescript
// Angular - Optimistic updates
updateNodePosition(nodeId: string, position: NodePosition): void {
  // Update UI immediately
  const node = this.findNodeById(nodeId);
  if (node) {
    node.position = position;
  }
  
  // Send update to server
  this.nodeService.updateNodePosition(nodeId, position).subscribe({
    error: () => {
      // Revert on error
      this.loadCurrentCloudBoard();
    }
  });
}
```

### Error Handling
Implement consistent error handling across all layers:

```typescript
// Angular Service
private handleError = (error: any): Observable<never> => {
  this.messageService.add({
    severity: 'error',
    summary: 'Operation Failed',
    detail: 'Please try again later'
  });
  return throwError(() => error);
};
```

```csharp
// .NET Service
catch (Exception ex)
{
    _logger.LogError(ex, "Error creating node for CloudBoard {CloudBoardId}", cloudBoardId);
    throw;
}
```

## Troubleshooting Common Issues

### ID Mapping Issues
- Always use string IDs in DTOs to avoid JavaScript number precision loss
- Ensure proper GUID validation in API endpoints
- Check that entity IDs are properly generated in the database

### Circular Reference Problems
- Use DTOs to break circular references in JSON serialization
- Configure Entity Framework relationships properly
- Avoid including unnecessary navigation properties in queries

### Change Detection Issues
- Use OnPush change detection strategy for performance
- Call `detectChanges()` after manual state updates
- Ensure observables emit new object references for change detection

### TypeScript Type Safety
- Use proper type guards when working with optional properties
- Implement comprehensive mapping functions
- Use strict null checks in TypeScript configuration

This guideline provides a comprehensive overview of how database models relate to Angular components in the CloudBoard application, ensuring consistent development practices and maintainable code architecture.
