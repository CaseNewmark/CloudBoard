# CloudBoard API Integration

This document provides an overview of the CloudBoard API endpoints and how to use them from the Angular application.

## API Services

The CloudBoard API is divided into several services:

- **CloudBoard Service** - For managing CloudBoard documents
- **Node Service** - For managing individual nodes within CloudBoard documents
- **Connector Service** - For managing node connectors
- **Connection Service** - For managing connections between node connectors

## Angular Service Integration

The `BoardProviderService` class in the Angular application provides methods to interact with all these API endpoints. It handles:

- Sending requests to the backend API
- Updating the UI state when changes occur
- Handling errors

### Example Usage

```typescript
// Inject the service
constructor(private boardProvider: BoardProviderService) { }

// Create a new CloudBoard
this.boardProvider.createNewCloudBoard().subscribe(
  board => console.log('Created new board:', board),
  error => console.error('Error creating board:', error)
);

// Create a new node
const nodeDto = {
  name: 'My Node',
  position: { x: 100, y: 100 },
  type: 'note',
  properties: { content: 'Some content' },
  cloudBoardDocumentId: 'your-cloudboard-id'
};
this.boardProvider.createNode(nodeDto).subscribe(
  node => console.log('Created new node:', node),
  error => console.error('Error creating node:', error)
);

// Create a connector
const connectorDto = {
  name: 'Input',
  position: 'left',
  type: 'in',
  nodeId: 'your-node-id'
};
this.boardProvider.createConnector(connectorDto).subscribe(
  connector => console.log('Created new connector:', connector),
  error => console.error('Error creating connector:', error)
);

// Create a connection
const connectionDto = {
  fromConnectorId: 'source-connector-id',
  toConnectorId: 'target-connector-id',
  cloudBoardDocumentId: 'your-cloudboard-id'
};
this.boardProvider.createConnection(connectionDto).subscribe(
  connection => console.log('Created new connection:', connection),
  error => console.error('Error creating connection:', error)
);
```

## API Documentation

For detailed API documentation, refer to:

- [API Reference](./APIReference.md) - Overview of all APIs
- [Node Service API](./NodeServiceAPI.md) - Node-specific endpoints
- [Connector Service API](./ConnectorServiceAPI.md) - Connector-specific endpoints
- [Connection Service API](./ConnectionServiceAPI.md) - Connection-specific endpoints

## Testing the API

HTTP test files for each service are available in the project:

- `CloudBoard.ApiService/node-test.http`
- `CloudBoard.ApiService/connector-test.http`
- `CloudBoard.ApiService/connection-test.http`

These files can be used with the VS Code REST Client extension to test the API endpoints directly.
