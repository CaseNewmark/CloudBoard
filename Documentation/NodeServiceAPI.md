# Node Service API

The Node Service provides a RESTful API for managing individual nodes within a CloudBoard document.

## Endpoints

### Create Node
- **URL**: `/api/node`
- **Method**: `POST`
- **Request Body**: `CreateNodeDto`
- **Response**: The created node
- **Status Codes**:
  - `201 Created`: Successfully created
  - `400 Bad Request`: Invalid input

### Get Node by ID
- **URL**: `/api/node/{id}`
- **Method**: `GET`
- **URL Parameters**: `id` - The ID of the node
- **Response**: The requested node
- **Status Codes**:
  - `200 OK`: Successfully retrieved
  - `404 Not Found`: Node not found

### Update Node
- **URL**: `/api/node/{id}`
- **Method**: `PUT`
- **URL Parameters**: `id` - The ID of the node
- **Request Body**: `NodeDto`
- **Response**: The updated node
- **Status Codes**:
  - `200 OK`: Successfully updated
  - `404 Not Found`: Node not found
  - `400 Bad Request`: Invalid input

### Delete Node
- **URL**: `/api/node/{id}`
- **Method**: `DELETE`
- **URL Parameters**: `id` - The ID of the node
- **Response**: None
- **Status Codes**:
  - `204 No Content`: Successfully deleted
  - `404 Not Found`: Node not found

## Data Models

### CreateNodeDto
```json
{
  "name": "string",
  "position": {
    "x": number,
    "y": number
  },
  "connectors": [
    {
      "id": "string (GUID)",
      "name": "string",
      "position": "string (left, right, top, bottom)",
      "type": "string (in, out, inout)"
    }
  ],
  "type": "string",
  "properties": object,
  "cloudBoardDocumentId": "string (GUID)"
}
```

### NodeDto
```json
{
  "id": "string (GUID)",
  "name": "string",
  "position": {
    "x": number,
    "y": number
  },
  "connectors": [
    {
      "id": "string (GUID)",
      "name": "string",
      "position": "string (left, right, top, bottom)",
      "type": "string (in, out, inout)"
    }
  ],
  "type": "string",
  "properties": object
}
```

## Usage Examples

See the `node-test.http` file for example requests.
