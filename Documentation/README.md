# CloudBoard Documentation

## Introduction

Welcome to the CloudBoard documentation. This collection of documents provides comprehensive information about the CloudBoard application, its architecture, API, and usage.

## Documentation Index

### Overview
- [Overview](Overview.md) - High-level overview of the application
- [Architecture](Architecture.md) - Technical architecture and system design
- [Data Model](DataModel.md) - Database schema and entity relationships
- [Components](Components.md) - UI components and their interactions
- [User Guide](UserGuide.md) - End-user guide for using the application

### API Documentation
- [API Reference](APIReference.md) - General API reference
- [API Integration](APIIntegration.md) - Guide for integrating with the API
- [CloudBoard Service API](APIReference.md#cloudboard-service) - CloudBoard document endpoints
- [Node Service API](NodeServiceAPI.md) - Node management endpoints
- [Connector Service API](ConnectorServiceAPI.md) - Connector management endpoints
- [Connection Service API](ConnectionServiceAPI.md) - Connection management endpoints

## Development Resources

For development setup and contribution guidelines, please refer to the [main README](../README.md) at the root of the repository.

## API Quick Reference

| Endpoint                        | Method | Description                        |
|---------------------------------|--------|------------------------------------|
| `/api/cloudboard`               | GET    | List all CloudBoard documents      |
| `/api/cloudboard`               | POST   | Create a new CloudBoard document   |
| `/api/cloudboard/{id}`          | GET    | Get a CloudBoard document by ID    |
| `/api/cloudboard/{id}`          | PUT    | Update a CloudBoard document       |
| `/api/cloudboard/{id}`          | DELETE | Delete a CloudBoard document       |
| `/api/node`                     | POST   | Create a new node                  |
| `/api/node/{id}`                | GET    | Get a node by ID                   |
| `/api/node/{id}`                | PUT    | Update a node                      |
| `/api/node/{id}`                | DELETE | Delete a node                      |
| `/api/connector`                | POST   | Create a new connector             |
| `/api/connector/{id}`           | GET    | Get a connector by ID              |
| `/api/connector/{id}`           | PUT    | Update a connector                 |
| `/api/connector/{id}`           | DELETE | Delete a connector                 |
| `/api/connection`               | POST   | Create a new connection            |
| `/api/connection/{id}`          | GET    | Get a connection by ID             |
| `/api/connection/{id}`          | PUT    | Update a connection                |
| `/api/connection/{id}`          | DELETE | Delete a connection                |