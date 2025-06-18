# CloudBoard - Developer Documentation

CloudBoard is a centralized platform for project management, workflow visualization, and timeline tracking built with Angular 19. It provides interactive flowchart capabilities for creating and managing visual workflows.

## Table of Contents

- [Getting Started](#getting-started)
- [Architecture Overview](#architecture-overview)
- [Development Workflow](#development-workflow)
- [Component Structure](#component-structure)
- [API Integration](#api-integration)
- [Authentication](#authentication)
- [Testing](#testing)
- [Deployment](#deployment)

## Getting Started

For installation and setup instructions, please refer to the [main CloudBoard documentation](../README.md#development-setup) in the repository root.

Once the application is running, the Angular frontend will be available at `http://localhost:4200/`.

## Architecture Overview

### Core Technologies

- **Angular 19**: Frontend framework with standalone components
- **PrimeNG**: UI component library for consistent design
- **Tailwind CSS**: Utility-first CSS framework for styling
- **@foblex/flow**: Library for creating interactive flowcharts and diagrams
- **RxJS**: Reactive programming with observables

### Project Structure

```
src/
├── app/
│   ├── cloudboard/          # Main cloudboard component and logic
│   ├── controls/            # Reusable UI controls and components
│   ├── data/               # Data models and interfaces
│   ├── guards/             # Route guards for authentication
│   ├── helpers/            # Utility functions and directives
│   ├── home/               # Landing page component
│   ├── nodes/              # Different node types for flowcharts
│   ├── projects/           # Project management components
│   ├── services/           # API services and business logic
│   └── timeline/           # Timeline visualization components
```

## Development Workflow

### Component Development

CloudBoard uses Angular standalone components. When creating new components:

    ```bash
    ng generate component components/my-component --standalone
    ```

### Node Types

The application supports multiple node types for flowcharts:
- **SimpleNote**: Basic text notes
- **CardNode**: Card-style information display
- **LinkCollection**: Collection of related links
- **ImageNode**: Image display with metadata
- **CodeBlock**: Syntax-highlighted code snippets

To add a new node type:
1. Create the component in `src/app/nodes/`
2. Add the node type to the `NodeType` enum in `data/cloudboard.ts`
3. Update the switch statement in `cloudboard.component.html`
4. Add default properties in `node.service.ts`

### Service Architecture

Services are organized by domain:
- **CloudboardService**: CRUD operations for cloudboards
- **NodeService**: Node management and operations
- **ConnectorService**: Connection point management
- **ConnectionService**: Managing connections between nodes
- **AuthService**: Authentication and user management
- **FlowControlService**: UI controls for the flow editor

## Component Structure

### CloudBoard Component

The main component (`CloudboardComponent`) handles:
- Loading and displaying cloudboards
- Node creation, deletion, and positioning
- Connection management between nodes
- Context menus and user interactions
- Auto-save functionality

### Key Features

- **Drag & Drop**: Nodes can be repositioned with real-time updates
- **Context Menus**: Right-click menus for adding nodes and managing existing ones
- **Properties Panel**: Side panel for editing node properties
- **Keyboard shortcuts**: Delete key for removing selected items
- **Auto-save**: Automatic saving of changes every 5 minutes

## API Integration

The application communicates with a backend API for data persistence. All API calls are handled through dedicated services using Angular's HttpClient.

### Service Methods

```typescript
// Example service usage
this.cloudboardService.loadCloudBoardById(id).subscribe(cloudboard => {
  // Handle loaded cloudboard
});

this.nodeService.createNode(cloudboardId, nodeData).subscribe(newNode => {
  // Handle created node
});
```

## Authentication

CloudBoard uses OAuth-based authentication with:
- Route guards to protect authenticated routes
- JWT token management
- Automatic token refresh
- Login/logout flow with callback handling

### Protected Routes

- `/cloudboard` - Main cloudboard editor
- `/projects` - Project management
- `/timeline` - Timeline visualization

## Testing

### Unit Tests

Run unit tests with:
```bash
ng test
```

### End-to-End Tests

Run e2e tests with:
```bash
ng e2e
```

### Test Structure

- Component tests in `*.spec.ts` files
- Service tests for API integration
- Guard tests for authentication logic

## Deployment

### Production Build

Create a production build:
```bash
ng build --configuration=production
```

### Environment Configuration

Configure environment-specific settings in:
- `src/environments/environment.ts` (development)
- `src/environments/environment.prod.ts` (production)

### Build Optimization

The production build includes:
- Tree shaking for smaller bundle sizes
- Ahead-of-time (AOT) compilation
- Minification and compression
- Source map generation for debugging

## Contributing

1. Follow Angular style guide conventions
2. Write unit tests for new components and services
3. Use consistent naming: "cloudboard" (lowercase) throughout
4. Implement proper error handling in services
5. Add TypeScript interfaces for all data models
6. Use reactive patterns with RxJS observables

## Troubleshooting

### Common Issues

- **Module not found**: Ensure all imports use correct paths
- **Authentication errors**: Check token expiration and refresh logic
- **API connection issues**: Verify backend service availability
- **Build errors**: Clear node_modules and reinstall dependencies

For more detailed information about specific components or services, refer to the inline documentation in the source code.
