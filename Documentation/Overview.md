# CloudBoard Overview

## Introduction

CloudBoard is a modern, web-based visual organization tool designed to help users create, connect, and manage various types of information in a dynamic, flow-based interface. It allows for intuitive visual organization of ideas, concepts, and resources in a flexible canvas environment.

## Core Functionality

CloudBoard enables users to:

- Create different node types (Notes, Cards, Link Collections, Images, Code Blocks)
- Connect nodes with visual connectors
- Drag and position nodes freely on a canvas
- Customize node properties via a properties panel
- Organize information in a visually meaningful way
- Save and load board configurations
- Create multiple projects for different purposes

## Key Components

### Frontend (Angular)

The frontend is built with Angular 19+ and provides:

- Interactive canvas with drag-and-drop functionality
- Specialized components for different node types
- Properties panel for customizing nodes
- Connector system for linking nodes
- Context menus for common operations
- Toolbar for global actions

### Backend (.NET)

The backend is built with .NET 8 and provides:

- RESTful API endpoints for all CRUD operations
- PostgreSQL database integration for persistence
- Automatic database migrations
- Support for complex node properties via JSON storage
- Aspire-based orchestration for local development

## Node Types

CloudBoard supports various node types, each with specialized properties:

1. **Note**: Simple text notes with customizable background and text colors
2. **Card**: Structured cards with title, subtitle, optional image, and content
3. **Link Collection**: Collections of links with titles and URLs
4. **Image Node**: Image display with optional caption
5. **Code Block**: Syntax-highlighted code blocks with language selection

## Data Model

The core data model consists of:

- **CloudBoard**: The main document containing nodes and connections
- **Node**: An individual element on the board with position and properties
- **Connector**: Connection points on nodes that allow linking
- **Connection**: Links between node connectors

## Technical Architecture

CloudBoard uses a modern technical stack:

- **Frontend**: Angular 19+, PrimeNG, Foblex Flow for canvas
- **Backend**: .NET 8 Minimal APIs, Entity Framework Core
- **Database**: PostgreSQL
- **Development**: .NET Aspire for local orchestration

## Deployment

The application can be deployed as:

- Containerized services with Docker/Kubernetes
- Traditional web application on IIS or other web servers
- Cloud-hosted services on Azure or other cloud platforms

## Future Directions

Planned future enhancements include:

- User authentication and authorization
- Collaboration features
- Advanced node types
- Export/import functionality
- Integration with external services
- Mobile-responsive design