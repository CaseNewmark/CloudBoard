# CloudBoard - Coding Guidelines

This document outlines the coding standards, conventions, and best practices for the CloudBoard project. Following these guidelines ensures consistency, maintainability, and quality across all components.

## Table of Contents

- [General Principles](#general-principles)
- [Angular Frontend Guidelines](#angular-frontend-guidelines)
- [.NET API Guidelines](#net-api-guidelines)
- [Aspire AppHost Guidelines](#aspire-apphost-guidelines)
- [Database Guidelines](#database-guidelines)
- [Documentation Standards](#documentation-standards)
- [Git Workflow](#git-workflow)

## General Principles

### Naming Conventions

- **Project/Solution Names**: PascalCase (e.g., `CloudBoard.ApiService`)
- **Consistent Terminology**: Always use "Cloudboard" (lowercase) in user-facing text and URLs
- **File Names**: Follow platform conventions (kebab-case for Angular, PascalCase for .NET)
- **Variables/Methods**: camelCase for JavaScript/TypeScript, PascalCase for C# public members

### Code Organization

- **Single Responsibility**: Each class/component should have one clear purpose
- **Separation of Concerns**: Keep business logic separate from UI logic
- **Dependency Injection**: Use DI containers for loose coupling
- **Interface Segregation**: Create focused interfaces rather than monolithic ones

### Error Handling

- **Consistent Error Responses**: Use standardized error formats across all APIs
- **Graceful Degradation**: UI should handle API failures gracefully
- **Logging**: Log errors with sufficient context for debugging
- **User-Friendly Messages**: Display meaningful error messages to users

## Angular Frontend Guidelines

### Component Architecture

#### Standalone Components
Use Angular standalone components for all new components:

```typescript
@Component({
  selector: 'app-my-component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-component.html'
})
export class MyComponent { }
```

#### Component Structure
Follow this structure for component files:
```
my-component/
├── my-component.component.ts
├── my-component.component.html
├── my-component.component.css
└── my-component.component.spec.ts
```

#### Component Naming
- **Selector**: Use `app-` prefix for application components
- **Class Name**: PascalCase with `Component` suffix
- **File Name**: kebab-case with `.component` suffix

### Service Guidelines

#### Service Organization
```typescript
@Injectable({
  providedIn: 'root'
})
export class CloudboardService {
  private readonly apiUrl = '/api/cloudboards';
  
  constructor(private http: HttpClient) { }
  
  // Public methods
  loadCloudBoardById(id: string): Observable<CloudBoard> {
    return this.http.get<CloudBoard>(`${this.apiUrl}/${id}`);
  }
  
  // Private helper methods
  private handleError(error: any): void {
    // Error handling logic
  }
}
```

#### Service Responsibilities
- **API Communication**: Handle HTTP requests and responses
- **State Management**: Manage application state using signals or observables
- **Business Logic**: Implement domain-specific logic
- **Error Handling**: Provide consistent error handling

### Reactive Programming

#### Observable Patterns
```typescript
// Prefer async pipe in templates
public data$ = this.service.getData();

// Use reactive forms for complex forms
public form = this.fb.group({
  name: ['', Validators.required],
  description: ['']
});

// Handle subscriptions properly
private destroy$ = new Subject<void>();

ngOnDestroy(): void {
  this.destroy$.next();
  this.destroy$.complete();
}
```

#### Signal Usage
```typescript
// Use signals for simple state management
public isLoading = signal(false);
public selectedNode = signal<Node | null>(null);

// Computed signals for derived state
public hasSelection = computed(() => this.selectedNode() !== null);
```

### Template Guidelines

#### Template Syntax
```html
<!-- Use new control flow syntax -->
@if (isLoading()) {
  <p-progressSpinner></p-progressSpinner>
} @else {
  <div class="content">
    @for (item of items; track item.id) {
      <app-item [data]="item"></app-item>
    }
  </div>
}

<!-- Use async pipe for observables -->
<div>{{ (currentUser$ | async)?.name }}</div>

<!-- Use proper event binding -->
<button (click)="onSave()" [disabled]="!canSave()">
  Save
</button>
```

#### CSS Guidelines
- **Tailwind Classes**: Use Tailwind utility classes for styling
- **Component Scoping**: Use `:host` for component-level styles
- **Responsive Design**: Use responsive Tailwind classes
- **Consistent Spacing**: Use Tailwind spacing scale

## .NET API Guidelines

### Project Structure

#### Minimal APIs
Use minimal APIs for endpoint definitions:
```csharp
public static class CloudBoardEndpoints
{
    public static void MapCloudBoardEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/cloudboards")
            .WithTags("CloudBoards")
            .RequireAuthorization();

        group.MapGet("/", GetCloudBoards);
        group.MapGet("/{id}", GetCloudBoard);
        group.MapPost("/", CreateCloudBoard);
        group.MapPut("/{id}", UpdateCloudBoard);
        group.MapDelete("/{id}", DeleteCloudBoard);
    }
}
```

#### Service Layer Pattern

The service layer acts as an intermediary between the API endpoints and the data access layer, encapsulating business logic, validation, and data transformation. This pattern promotes separation of concerns and makes the codebase more testable and maintainable.

**Key Benefits:**
- **Business Logic Encapsulation**: Complex business rules are centralized in service classes
- **Testability**: Services can be easily unit tested with mocked dependencies
- **Reusability**: Business logic can be reused across different endpoints or contexts
- **Maintainability**: Changes to business logic are isolated to service implementations

**References:**
- [Martin Fowler - Service Layer Pattern](https://martinfowler.com/eaaCatalog/serviceLayer.html)
- [Microsoft - Clean Architecture](https://docs.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/common-web-application-architectures#clean-architecture)
- [Domain-Driven Design Service Layer](https://enterprisecraftsmanship.com/posts/service-layer-vs-business-logic-layer/)

```csharp
public interface ICloudBoardService
{
    Task<CloudBoardDto> GetCloudBoardAsync(string id, string userId);
    Task<CloudBoardDto> CreateCloudBoardAsync(CreateCloudBoardDto dto, string userId);
    Task<CloudBoardDto> UpdateCloudBoardAsync(string id, UpdateCloudBoardDto dto, string userId);
    Task<bool> DeleteCloudBoardAsync(string id, string userId);
}

[RegisterScoped]
public class CloudBoardService : ICloudBoardService
{
    private readonly ICloudBoardRepository repository;
    private readonly IMapper mapper;

    public CloudBoardService(ICloudBoardRepository repository, IMapper mapper)
    {
        this.repository = repository;
        this.mapper = mapper;
    }
    
    // Implementation...
}
```

### Entity Framework Guidelines

#### Entity Configuration
```csharp
public class CloudBoardConfiguration : IEntityTypeConfiguration<CloudBoard>
{
    public void Configure(EntityTypeBuilder<CloudBoard> builder)
    {
        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(255);
            
        builder.HasMany(x => x.Nodes)
            .WithOne(x => x.CloudBoard)
            .HasForeignKey(x => x.CloudBoardId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
```

#### Repository Pattern
```csharp
public interface ICloudBoardRepository
{
    Task<CloudBoard?> GetByIdAsync(string id);
    Task<List<CloudBoard>> GetByUserIdAsync(string userId);
    Task<CloudBoard> CreateAsync(CloudBoard entity);
    Task<CloudBoard> UpdateAsync(CloudBoard entity);
    Task<bool> DeleteAsync(string id);
}
```

### Authentication & Authorization

#### JWT Configuration
```csharp
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
```

#### Authorization Policies
```csharp
builder.Services.AddAuthorizationBuilder()
    .AddPolicy("CloudBoardOwner", policy =>
        policy.RequireAuthenticatedUser()
              .RequireClaim("sub"));
```

### Error Handling

#### Global Exception Handling
```csharp
app.UseExceptionHandler(exceptionHandlerApp =>
{
    exceptionHandlerApp.Run(async context =>
    {
        var problemDetails = new ProblemDetails
        {
            Status = StatusCodes.Status500InternalServerError,
            Title = "An error occurred",
            Detail = "An unexpected error occurred while processing your request."
        };

        await context.Response.WriteAsJsonAsync(problemDetails);
    });
});
```

#### Custom Exceptions
```csharp
public class CloudBoardNotFoundException : Exception
{
    public CloudBoardNotFoundException(string id) 
        : base($"CloudBoard with ID '{id}' was not found.")
    {
        Id = id;
    }

    public string Id { get; }
}
```

## Aspire AppHost Guidelines

### Service Configuration

#### Resource Definition
```csharp
var builder = DistributedApplication.CreateBuilder(args);

// Infrastructure services
var postgres = builder.AddPostgres("postgres")
    .WithDataVolume()
    .WithPgAdmin();

var keycloak = builder.AddKeycloak("keycloak", port: 8080)
    .WithDataVolume();

// Application services
var apiService = builder.AddProject<Projects.CloudBoard_ApiService>("apiservice")
    .WithReference(postgres)
    .WithReference(keycloak);

var webApp = builder.AddNpmApp("webapp", "../CloudBoard.Angular")
    .WithReference(apiService)
    .WithHttpEndpoint(env: "PORT")
    .WithExternalHttpEndpoints()
    .PublishAsDockerFile();

builder.Build().Run();
```

#### Environment Configuration
```csharp
// Use consistent naming for connection strings
builder.AddNpgsqlDbContext<CloudBoardDbContext>(
    connectionName: "cloudboard",
    configureDbContextOptions: options =>
    {
        options.EnableSensitiveDataLogging(builder.Environment.IsDevelopment());
        options.EnableDetailedErrors(builder.Environment.IsDevelopment());
    });
```

### Health Checks
```csharp
builder.Services.AddHealthChecks()
    .AddNpgsql(connectionString: "cloudboard")
    .AddCheck<KeycloakHealthCheck>("keycloak")
    .AddSignalRHub("/hubs/cloudboard");
```

## Database Guidelines

### Migration Strategy

#### Entity-First Approach
- Design entities to represent business domain
- Use Code-First migrations for schema changes
- Always review generated migrations before applying

#### Migration Commands
```bash
# Create migration
dotnet ef migrations add MigrationName

# Review migration
dotnet ef migrations script

# Apply migration
dotnet ef database update
```

### Performance Considerations

#### Indexing Strategy
```csharp
// Add indexes for frequently queried columns
builder.HasIndex(x => x.UserId);
builder.HasIndex(x => new { x.CloudBoardId, x.CreatedAt });
```

#### Query Optimization
```csharp
// Use projection for read operations
var dto = await context.CloudBoards
    .Where(x => x.UserId == userId)
    .Select(x => new CloudBoardSummaryDto
    {
        Id = x.Id,
        Name = x.Name,
        CreatedAt = x.CreatedAt
    })
    .ToListAsync();
```

## Documentation Standards

### Code Comments

#### XML Documentation
```csharp
/// <summary>
/// Creates a new cloudboard for the specified user.
/// </summary>
/// <param name="dto">The cloudboard creation data.</param>
/// <param name="userId">The ID of the user creating the cloudboard.</param>
/// <returns>The created cloudboard.</returns>
/// <exception cref="ArgumentNullException">Thrown when dto is null.</exception>
public async Task<CloudBoardDto> CreateCloudBoardAsync(CreateCloudBoardDto dto, string userId)
```

#### JSDoc Comments
```typescript
/**
 * Loads a cloudboard by its ID
 * @param id - The unique identifier of the cloudboard
 * @returns Observable that emits the cloudboard data
 * @throws {HttpErrorResponse} When the cloudboard is not found or access is denied
 */
loadCloudBoardById(id: string): Observable<CloudBoard> {
  return this.http.get<CloudBoard>(`${this.apiUrl}/${id}`);
}
```

### README Structure
Each component should have a README with:
- Purpose and overview
- Installation/setup instructions
- Architecture explanation
- API documentation (if applicable)
- Development workflow
- Testing guidelines

## Git Workflow

### Branch Strategy
- **main**: Production-ready code
- **develop**: Integration branch for features
- **feature/***: Feature development branches
- **hotfix/***: Critical bug fixes

### Commit Messages
Follow conventional commit format:
```
type(scope): description

feat(api): add cloudboard sharing endpoints
fix(ui): resolve node positioning issue
docs(readme): update installation instructions
refactor(service): simplify authentication logic
```

### Pull Request Guidelines
- Include descriptive title and summary
- Reference related issues
- Add screenshots for UI changes
- Ensure all tests pass
- Request appropriate reviewers

### Code Review Checklist
- [ ] Follows coding guidelines
- [ ] Includes appropriate tests
- [ ] Documentation updated
- [ ] No console.log or debugging code
- [ ] Proper error handling
- [ ] Performance considerations addressed

## Testing Guidelines

### Unit Testing

#### Angular Tests
```typescript
describe('CloudboardComponent', () => {
  let component: CloudboardComponent;
  let fixture: ComponentFixture<CloudboardComponent>;
  let mockService: jasmine.SpyObj<CloudboardService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('CloudboardService', ['loadCloudBoardById']);

    await TestBed.configureTestingModule({
      imports: [CloudboardComponent],
      providers: [
        { provide: CloudboardService, useValue: spy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CloudboardComponent);
    component = fixture.componentInstance;
    mockService = TestBed.inject(CloudboardService) as jasmine.SpyObj<CloudboardService>;
  });

  it('should load cloudboard on init', () => {
    const mockCloudBoard = { id: '1', name: 'Test Board' };
    mockService.loadCloudBoardById.and.returnValue(of(mockCloudBoard));

    component.ngOnInit();

    expect(mockService.loadCloudBoardById).toHaveBeenCalledWith('1');
    expect(component.currentCloudBoard).toEqual(mockCloudBoard);
  });
});
```

#### .NET Tests
```csharp
public class CloudBoardServiceTests
{
    private readonly Mock<ICloudBoardRepository> mockRepository;
    private readonly Mock<IMapper> mockMapper;
    private readonly CloudBoardService service;

    public CloudBoardServiceTests()
    {
        mockRepository = new Mock<ICloudBoardRepository>();
        mockMapper = new Mock<IMapper>();
        service = new CloudBoardService(mockRepository.Object, mockMapper.Object);
    }

    [Test]
    public async Task GetCloudBoardAsync_ShouldReturnCloudBoard_WhenExists()
    {
        // Arrange
        var cloudBoard = new CloudBoard { Id = "1", Name = "Test" };
        var dto = new CloudBoardDto { Id = "1", Name = "Test" };
        
        mockRepository.Setup(x => x.GetByIdAsync("1")).ReturnsAsync(cloudBoard);
        mockMapper.Setup(x => x.Map<CloudBoardDto>(cloudBoard)).Returns(dto);

        // Act
        var result = await service.GetCloudBoardAsync("1", "user1");

        // Assert
        Assert.That(result, Is.EqualTo(dto));
    }
}
```

### Integration Testing
- Test complete API endpoints
- Use TestContainers for database testing
- Verify authentication and authorization flows
- Test SignalR hub functionality

## Performance Guidelines

### Frontend Performance
- Use OnPush change detection strategy
- Implement virtual scrolling for large lists
- Lazy load feature modules
- Optimize bundle size with tree shaking

### Backend Performance
- Use async/await throughout
- Implement proper caching strategies
- Use connection pooling for database
- Monitor query performance

### Database Performance
- Use appropriate indexes
- Implement pagination for large result sets
- Use read replicas for scaling
- Monitor slow queries

Following these guidelines ensures consistency, maintainability, and quality across the CloudBoard project. Regular code reviews should verify adherence to these standards.
