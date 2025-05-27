# Connector Service API

The Connector Service API provides endpoints for managing node connectors in the CloudBoard application.

## Endpoints

### Create Connector

Creates a new connector for a node.

**Endpoint:** `POST /api/connector`

**Request Body:**
```json
{
  "name": "string",
  "position": "string", // "left", "right", "top", or "bottom"
  "type": "string", // "in", "out", or "inout"
  "nodeId": "guid"
}
```

**Response:** 201 Created with the created connector

### Get Connector by ID

Retrieves a connector by its ID.

**Endpoint:** `GET /api/connector/{id}`

**Parameters:**
- `id` (path): The GUID of the connector to retrieve

**Response:** 200 OK with the connector or 404 Not Found

### Get Connectors by Node ID

Retrieves all connectors for a specific node.

**Endpoint:** `GET /api/node/{nodeId}/connectors`

**Parameters:**
- `nodeId` (path): The GUID of the node

**Response:** 200 OK with an array of connectors

### Update Connector

Updates an existing connector.

**Endpoint:** `PUT /api/connector/{id}`

**Parameters:**
- `id` (path): The GUID of the connector to update

**Request Body:**
```json
{
  "id": "string",
  "name": "string",
  "position": "string", // "left", "right", "top", or "bottom"
  "type": "string" // "in", "out", or "inout"
}
```

**Response:** 200 OK with the updated connector or 404 Not Found

### Delete Connector

Deletes a connector.

**Endpoint:** `DELETE /api/connector/{id}`

**Parameters:**
- `id` (path): The GUID of the connector to delete

**Response:** 204 No Content or 404 Not Found

## Data Models

### ConnectorDto

```json
{
  "id": "string", // GUID
  "name": "string",
  "position": "string", // "left", "right", "top", or "bottom"
  "type": "string" // "in", "out", or "inout"
}
```

### CreateConnectorDto

```json
{
  "name": "string",
  "position": "string", // "left", "right", "top", or "bottom"
  "type": "string", // "in", "out", or "inout"
  "nodeId": "string" // GUID of the node to attach this connector to
}
```
