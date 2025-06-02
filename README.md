# CloudBoard

CloudBoard is a flexible diagramming and visual organization tool that allows users to create, connect, and manage various types of nodes in a dynamic flow-based interface.

## Overview

CloudBoard provides an interactive canvas where users can:

- Create different types of nodes (Notes, Cards, Link Collections, Images, Code Blocks)
- Connect nodes with customizable connectors
- Organize information visually through a drag-and-drop interface
- Save and load board configurations
- Manage multiple projects

The application uses a modern architecture:
- Angular 19+ frontend with PrimeNG components and Foblex Flow for the visual canvas
- .NET 8 backend with minimal APIs
- PostgreSQL database for persistence

## Components

The application consists of several components:

- **CloudBoard.Angular**: The frontend Angular application providing the user interface
- **CloudBoard.ApiService**: The backend API service handling data operations
- **CloudBoard.AppHost**: The Aspire application host for orchestrating the services
- **CloudBoard.ServiceDefaults**: Common service configurations

## Development Setup

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js](https://nodejs.org/) (v18+)
- [Angular CLI](https://angular.io/cli) (`npm install -g @angular/cli`)
- [Docker](https://www.docker.com/products/docker-desktop/) for PostgreSQL database

### Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/CloudBoard.git
   cd CloudBoard
   ```

2. Start the backend services using .NET Aspire:
   ```bash
   cd CloudBoard.AppHost
   dotnet run
   ```
   
   This will start:
   - PostgreSQL database
   - Keycloak identity service
   - API Service
   - PgAdmin (optional management interface for PostgreSQL)

3. Start the Angular development server:
   ```bash
   cd ../CloudBoard.Angular
   npm install
   ng serve
   ```

4. Navigate to `http://localhost:4200` to access the application

## Architecture

The application follows a layered architecture:

- **Frontend**: Angular 19+ SPA with components for:
  - FlowBoard: Main canvas for node manipulation
  - Node Components: Specialized components for each node type
  - Services: API communication and state management

- **Backend API**: .NET 8 minimal APIs providing:
  - CloudBoard management
  - Node operations
  - Connector and connection handling
  - PostgreSQL database persistence

- **Database**: PostgreSQL storing:
  - CloudBoard documents
  - Nodes with properties
  - Connections between nodes
  - Connectors for nodes

## License

[MIT License](LICENSE)
