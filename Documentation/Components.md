# CloudBoard Components

## Overview

CloudBoard is built using a component-based architecture in Angular. This document details the key components and their interactions within the application.

## Main Components

### App Component

The root component that provides the application shell, including:
- Navigation bar
- Toast notifications
- Confirmation dialogs
- Routing outlet for main content

### FlowBoard Component

The central component that provides the interactive canvas where users can create, connect, and manipulate nodes.

Key responsibilities:
- Rendering the flow canvas using Foblex Flow
- Managing node creation, deletion, and positioning
- Handling connections between nodes
- Providing context menus for nodes and canvas
- Auto-saving changes to the backend
- Loading CloudBoard documents from the backend

### Node Components

Specialized components for each node type:

#### SimpleNote Component
- Displays text notes with customizable styling
- Provides connection points on all sides
- Supports customizable background and text colors

#### Card Component
- Displays structured cards with title, subtitle, optional image, and content
- Supports rich text content
- Provides connection points on all sides

#### LinkCollection Component
- Displays a collection of hyperlinks
- Supports opening links in new tabs
- Provides connection points on all sides

#### ImageNode Component
- Displays images with optional captions
- Supports resizing and alt text
- Provides connection points on all sides

#### CodeBlock Component
- Displays syntax-highlighted code
- Supports multiple programming languages
- Optional line numbers
- Provides connection points on all sides

### Control Components

#### Toolbar Component
- Provides access to global actions like zoom, save, and create new nodes
- Displays the current CloudBoard name
- Offers navigation options

#### Properties Panel Component
- Allows editing of node properties
- Dynamically adjusts based on the selected node type
- Provides real-time feedback as properties are changed

## Services

### CloudboardService
- Handles loading, saving, and managing CloudBoard documents
- Communicates with the backend API
- Manages the current CloudBoard state

### NodeService
- Handles node CRUD operations
- Provides default properties for different node types
- Manages node selection and updates

### ConnectorService
- Creates and manages connectors on nodes
- Handles connector positioning and types

### ConnectionService
- Creates and manages connections between connectors
- Handles connection styling and rendering

### ContextMenuService
- Provides context menu items for nodes and the canvas
- Handles context menu actions

### FlowControlService
- Controls canvas behavior like zoom and pan
- Manages selection state
- Provides event handling for canvas interactions

## Component Interaction Flow

1. **User Interaction**:
   - User interacts with the FlowBoard component (clicks, drags, etc.)
   
2. **Event Handling**:
   - FlowBoard component captures the events and delegates to appropriate handlers
   - For example, a node drag event updates the node position

3. **Service Calls**:
   - Component handlers call relevant services (NodeService, ConnectionService, etc.)
   - Services apply business logic and make API calls as needed

4. **State Update**:
   - Services update the application state
   - Components react to state changes through Angular's change detection

5. **Rendering**:
   - Updated state is reflected in the UI
   - Foblex Flow updates the visual representation of nodes and connections

## Component Communication

Components in CloudBoard communicate through multiple patterns:

- **Parent-Child Communication**: Using Input/Output decorators
- **Service-Based Communication**: Shared services with observables
- **Signal-Based State**: Angular signals for reactive state management
- **Event Emission**: Custom events for specific interactions

## Styling and Theming

Components use a combination of:
- Component-specific CSS files
- PrimeNG components for UI elements
- Custom styling for the canvas and nodes
- Responsive design patterns for adaptability