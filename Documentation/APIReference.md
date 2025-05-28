# API Reference

## Overview

The CloudBoard API provides endpoints for managing CloudBoard documents, nodes, and connections. The API is RESTful and uses JSON for data exchange.

## Base URL

All API requests should be made to the base URL:

```
http://localhost:5080/api
```

## Authentication

Currently, the API does not require authentication.

## API Services

The CloudBoard API is divided into several services:

- [CloudBoard Service](APIReference.md#cloudboard-service) - For managing CloudBoard documents
- [Node Service](NodeServiceAPI.md) - For managing individual nodes within CloudBoard documents
- [Connector Service](ConnectorServiceAPI.md) - For managing node connectors
- [Connection Service](ConnectionServiceAPI.md) - For managing connections between node connectors

### CloudBoard Service

The CloudBoard Service provides endpoints for managing CloudBoard documents.

#### Endpoints

- `POST /cloudboard` - Create a new CloudBoard document
- `GET /cloudboard` - Get all CloudBoard documents
- `GET /cloudboard/{id}` - Get a CloudBoard document by ID
- `PUT /cloudboard/{id}` - Update a CloudBoard document
- `DELETE /cloudboard/{id}` - Delete a CloudBoard document

For more details, see the implementation in `CloudBoardEndpoints.cs`.

### Node Service

The Node Service provides endpoints for managing individual nodes within CloudBoard documents.

#### Endpoints

- `POST /node` - Create a new node
- `GET /node/{id}` - Get a node by ID
- `PUT /node/{id}` - Update a node
- `DELETE /node/{id}` - Delete a node

For more details, see the [Node Service API documentation](NodeServiceAPI.md) or the implementation in `NodeEndpoints.cs`.

### Connector Service

The Connector Service provides endpoints for managing connectors that belong to nodes.

#### Endpoints

- `POST /connector` - Create a new connector
- `GET /connector/{id}` - Get a connector by ID
- `GET /node/{nodeId}/connectors` - Get all connectors for a node
- `PUT /connector/{id}` - Update a connector
- `DELETE /connector/{id}` - Delete a connector

For more details, see the [Connector Service API documentation](ConnectorServiceAPI.md) or the implementation in `ConnectorEndpoints.cs`.

### Connection Service

The Connection Service provides endpoints for managing connections between connectors.

#### Endpoints

- `POST /connection` - Create a new connection
- `GET /connection/{id}` - Get a connection by ID
- `GET /cloudboard/{cloudBoardDocumentId}/connections` - Get all connections for a CloudBoard document
- `GET /connector/{connectorId}/connections` - Get all connections for a connector
- `PUT /connection/{id}` - Update a connection
- `DELETE /connection/{id}` - Delete a connection

For more details, see the [Connection Service API documentation](ConnectionServiceAPI.md) or the implementation in `ConnectionEndpoints.cs`.

## Error Handling

The API uses standard HTTP status codes to indicate the success or failure of a request:

- `2xx` - Success
- `4xx` - Client error
- `5xx` - Server error

Detailed error messages are returned in the response body when appropriate.