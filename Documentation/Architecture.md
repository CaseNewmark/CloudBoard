# CloudBoard Architecture

## System Architecture

CloudBoard follows a modern client-server architecture with a clear separation of concerns:

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│                 │      │                 │      │                 │
│  Angular SPA    │◄────►│  .NET 8 API     │◄────►│  PostgreSQL     │
│  (Frontend)     │      │  (Backend)      │      │  (Database)     │
│                 │      │                 │      │                 │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

### Frontend Architecture

The Angular application follows a component-based architecture with reactive state management:

```
┌─────────────────────────────────────────────────────────────────┐
│                       Angular Application                       │
│                                                                 │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────────────┐    │
│  │             │   │             │   │                     │    │
│  │  Components │   │  Services   │   │  Directives/Pipes   │    │
│  │             │   │             │   │                     │    │
│  └─────────────┘   └─────────────┘   └─────────────────────┘    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                                                         │    │
│  │               Foblex Flow (Canvas System)               │    │
│  │                                                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Key Frontend Components

- **FlowboardComponent**: Main canvas component for node manipulation
- **Node Components**: 
  - SimpleNoteComponent
  - CardNodeComponent
  - LinkCollectionComponent
  - ImageNodeComponent
  - CodeBlockComponent
- **Control Components**:
  - ToolbarComponent
  - PropertiesPanelComponent
- **Services**:
  - CloudboardService: Manages CloudBoard operations
  - NodeService: Handles node CRUD operations
  - ConnectorService: Manages connector creation and updates
  - ConnectionService: Handles connection between nodes
  - ContextMenuService: Provides context menu functionality
  - FlowControlService: Controls canvas behavior

### Backend Architecture

The .NET backend uses minimal APIs with a clean layered architecture:

```
┌───────────────────────────────────────────────────────────────┐
│                         API Layer                             │
│                                                               │
│  ┌─────────────┬─────────────┬────────────┬──────────────┐    │
│  │CloudBoard   │Node         │Connector   │Connection    │    │
│  │Endpoints    │Endpoints    │Endpoints   │Endpoints     │    │
│  └─────────────┴─────────────┴────────────┴──────────────┘    │
│                                                               │
├───────────────────────────────────────────────────────────────┤
│                       Service Layer                           │
│                                                               │
│  ┌─────────────┬─────────────┬────────────┬──────────────┐    │
│  │CloudBoard   │Node         │Connector   │Connection    │    │
│  │Service      │Service      │Service     │Service       │    │
│  └─────────────┴─────────────┴────────────┴──────────────┘    │
│                                                               │
├───────────────────────────────────────────────────────────────┤
│                     Repository Layer                          │
│                                                               │
│  ┌─────────────┬─────────────┬────────────┬──────────────┐    │
│  │CloudBoard   │Node         │Connector   │Connection    │    │
│  │Repository   │Repository   │Repository  │Repository    │    │
│  └─────────────┴─────────────┴────────────┴──────────────┘    │
│                                                               │
├───────────────────────────────────────────────────────────────┤
│                         Data Layer                            │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                CloudBoardDbContext                      │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

#### Backend Components

- **Endpoints**: Minimal API endpoints for handling HTTP requests
- **Services**: Business logic implementation
- **Repositories**: Data access layer for database operations
- **Data Models**: Entity definitions for database mapping
- **DTOs**: Data transfer objects for API communication

### Database Architecture

The PostgreSQL database uses a normalized relational schema:

```
┌─────────────────┐       ┌─────────────────┐
│  CloudBoard     │       │  Node           │
├─────────────────┤       ├─────────────────┤
│  Id (PK)        │       │  Id (PK)        │
│  Name           │       │  Name           │
└─────────────────┘       │  PositionX      │
        │                 │  PositionY      │
        │                 │  Type           │
        │                 │  Properties     │
        │                 │  CloudBoardId   │
        └─────────────────┘       │
                                  │
┌─────────────────┐       ┌───────┴─────────┐
│  Connection     │       │  Connector      │
├─────────────────┤       ├─────────────────┤
│  Id (PK)        │       │  Id (PK)        │
│  FromConnectorId│◄──────┤  Name           │
│  ToConnectorId  │◄──────┤  Position       │
│  CloudBoardId   │       │  Type           │
└─────────────────┘       │  NodeId         │
                          └─────────────────┘
```

## Development Architecture

CloudBoard uses .NET Aspire for local development orchestration:

```
┌────────────────────────────────────────────────────────────┐
│                  CloudBoard.AppHost                        │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌─────────────┐  ┌────────────────┐  ┌─────────────────┐  │
│  │             │  │                │  │                 │  │
│  │  PostgreSQL │  │  API Service   │  │  Angular App    │  │
│  │             │  │                │  │                 │  │
│  └─────────────┘  └────────────────┘  └─────────────────┘  │
│                                                            │
│  ┌─────────────┐  ┌────────────────┐                       │
│  │             │  │                │                       │
│  │  PgAdmin    │  │  Keycloak      │                       │
│  │             │  │                │                       │
│  └─────────────┘  └────────────────┘                       │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

## Communication Flow

The application uses a standard RESTful communication flow:

1. User interacts with the Angular frontend
2. Angular services make HTTP requests to the backend API
3. API endpoints invoke appropriate service methods
4. Services use repositories for data access
5. Repositories communicate with the database
6. Results are returned back through the chain to the user interface

## State Management

- **Frontend**: Uses Angular's reactive pattern with services and signals
- **Backend**: Stateless API with database persistence
- **Auto-Save**: Implemented to automatically save changes to the database

## Security Architecture

Currently, the application uses:
- Keycloak for identity management (not fully implemented)
- Basic input validation for API endpoints

Future enhancements will include:
- Authentication with JWT tokens
- Role-based authorization
- CSRF protection
- Data encryption