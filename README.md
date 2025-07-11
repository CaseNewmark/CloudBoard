# CloudBoard

CloudBoard is a flexible diagramming and visual organization tool that allows users to create, connect, and manage various types of nodes in a dynamic flow-based interface.

*This project is me, playing around with Ai in Visual Studio Code. At work, I use the same software stack (without Ai, because IP) and I can say that it really reflects well on the knowledge, concepts and understanding I gained in the last 20 years or some. That is both the architecture and the tooling.
Thinking about how to organize code has been a big part of my work, often focusing on maintainablity and extensibility. Let me tell you, this is like Lamp from the earlies as it always should have been.
The whole documentation (and most of the code) is generated by copilot (mostly Claude).
Have fun.*
-- Daniel

## Overview

CloudBoard provides an interactive canvas where users can:

- Create different types of nodes (Notes, Cards, Link Collections, Images, Code Blocks)
- Connect nodes with customizable connectors
- Organize information visually through a drag-and-drop interface
- Save and load board configurations
- Manage multiple projects

The application uses a modern architecture:
- Angular 19+ frontend with PrimeNG components and Foblex Flow for the visual canvas
- .NET 9 backend with minimal APIs and Aspire for service orchestration
- PostgreSQL database for persistence
- Docker containers for development dependencies

## Components

The application consists of several components:

- **CloudBoard.Angular**: The frontend Angular application providing the user interface
  - 📖 [Angular Frontend Developer Documentation](CloudBoard.Angular/README.md)
- **CloudBoard.ApiService**: The backend API service handling data operations
  - 📖 [API Developer Documentation](CloudBoard.ApiService/README.md)
- **CloudBoard.AppHost**: The Aspire application host for orchestrating the services
- **CloudBoard.ServiceDefaults**: Common service configurations

## Documentation

For detailed development information, refer to the component-specific documentation:

- **[Angular Frontend Documentation](CloudBoard.Angular/README.md)**: Component architecture, development workflow, authentication, and UI patterns
- **[API Service Documentation](CloudBoard.ApiService/README.md)**: API endpoints, authentication, database schema, SignalR real-time features, and deployment

## Development Setup

### Prerequisites

- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- [Node.js](https://nodejs.org/) (v18+)
- [Angular CLI](https://angular.io/cli) (`npm install -g @angular/cli`)
- [Docker](https://www.docker.com/products/docker-desktop/) for PostgreSQL database

### Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/CaseNemark/CloudBoard.git
   cd CloudBoard
   ```

2. **Recommended: Use Visual Studio Code Debug Configuration**
   
  Open the project in Visual Studio Code and press **F5** to start debugging with the "Debug All" configuration. This will:
    - Start all backend services through .NET Aspire
    - Launch Chrome with the Angular frontend
    - Set up debugging for both frontend and backend
    
    ⚠️ **Important:** The first startup can take **5+ minutes** as it needs to:
    - Download and start Docker containers (PostgreSQL, Keycloak, PgAdmin)
    - Build the Angular application
    - Restore NuGet packages and initialize the database
    - Wait for all services to become healthy

    **Alternative: Manual startup using .NET Aspire:**
    ```bash
    cd CloudBoard.AppHost
    dotnet run
    ```
    
    This will start all services:
    - PostgreSQL database in Docker
    - Keycloak identity service in Docker
    - [API Service](CloudBoard.ApiService/README.md) (.NET backend)
    - PgAdmin (optional management interface for PostgreSQL)
    - [Angular frontend application](CloudBoard.Angular/README.md) (automatically built and served through Aspire)

3. Navigate to `http://localhost:4200` to access the application

> **Note:** The Angular frontend is automatically built and served by the .NET Aspire host, so there's no need to separately start the Angular application with `ng serve`.

### Visual Studio Code Setup

The repository includes a `.vscode/launch.json` file for easy debugging in Visual Studio Code:

```jsonc
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Launch AppHost",
            "type": "dotnet",
            "request": "launch",
            "projectPath": "${workspaceFolder}\\CloudBoard.AppHost\\CloudBoard.AppHost.csproj"
        },
        {
            "type": "chrome",
            "request": "launch",
            "name": "Launch Angular",
            "url": "http://localhost:4200",
            "webRoot": "${workspaceFolder}\\CloudBoard.Angular"
        }
    ],
    "compounds": [
        {
          "name": "DebugAll",
          "configurations": ["Launch Angular", "Launch AppHost"],
          "stopAll": true
        }
    ]
}
```

This configuration provides three debug options:
- **Launch AppHost**: Starts the .NET Aspire host which orchestrates all backend services
- **Launch Angular**: Opens Chrome and connects to the Angular application for frontend debugging
- **DebugAll**: Compound debug configuration that launches both the backend and frontend together

To use these debugging configurations, open the project in VS Code, go to the "Run and Debug" sidebar, and select the desired configuration from the dropdown menu.

## Architecture

The application follows a layered architecture:

- **Frontend**: Angular 19+ SPA with components for:
  - Cloudboard: Main canvas for node manipulation
  - Node Components: Specialized components for each node type
  - Services: API communication and state management
  - *For detailed frontend architecture, see [Angular Documentation](CloudBoard.Angular/README.md#architecture-overview)*

- **Backend API**: .NET 8 minimal APIs providing:
  - CloudBoard management
  - Node operations
  - Connector and connection handling
  - PostgreSQL database persistence
  - *For detailed API architecture, see [API Documentation](CloudBoard.ApiService/README.md#architecture-overview)*

- **Database**: PostgreSQL storing:
  - CloudBoard documents
  - Nodes with properties
  - Connections between nodes
  - Connectors for nodes

## License

[MIT License](LICENSE)
