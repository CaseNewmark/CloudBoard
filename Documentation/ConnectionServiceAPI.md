# Connection Service API

The Connection Service API provides endpoints for managing connections between node connectors in the CloudBoard application.

## Endpoints

### Create Connection

Creates a new connection between two connectors.

**Endpoint:** `POST /api/connection`

**Request Body:**
```json
{
  "fromConnectorId": "string", // GUID
  "toConnectorId": "string", // GUID
  "cloudBoardDocumentId": "guid"
}
```

**Response:** 201 Created with the created connection

### Get Connection by ID

Retrieves a connection by its ID.

**Endpoint:** `GET /api/connection/{id}`

**Parameters:**
- `id` (path): The GUID of the connection to retrieve

**Response:** 200 OK with the connection or 404 Not Found

### Get Connections by CloudBoard Document ID

Retrieves all connections for a specific CloudBoard document.

**Endpoint:** `GET /api/cloudboard/{cloudBoardDocumentId}/connections`

**Parameters:**
- `cloudBoardDocumentId` (path): The GUID of the CloudBoard document

**Response:** 200 OK with an array of connections

### Get Connections by Connector ID

Retrieves all connections for a specific connector (either as source or target).

**Endpoint:** `GET /api/connector/{connectorId}/connections`

**Parameters:**
- `connectorId` (path): The GUID of the connector

**Response:** 200 OK with an array of connections

### Update Connection

Updates an existing connection.

**Endpoint:** `PUT /api/connection/{id}`

**Parameters:**
- `id` (path): The GUID of the connection to update

**Request Body:**
```json
{
  "id": "string", // GUID
  "fromConnectorId": "string", // GUID
  "toConnectorId": "string" // GUID
}
```

**Response:** 200 OK with the updated connection or 404 Not Found

### Delete Connection

Deletes a connection.

**Endpoint:** `DELETE /api/connection/{id}`

**Parameters:**
- `id` (path): The GUID of the connection to delete

**Response:** 204 No Content or 404 Not Found

## Data Models

### ConnectionDto

```json
{
  "id": "string", // GUID
  "fromConnectorId": "string", // GUID
  "toConnectorId": "string" // GUID
}
```

### CreateConnectionDto

```json
{
  "fromConnectorId": "string", // GUID
  "toConnectorId": "string", // GUID
  "cloudBoardDocumentId": "string" // GUID of the CloudBoard document
}
```
