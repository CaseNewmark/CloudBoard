# CloudBoard Data Model

## Overview

CloudBoard's data model is designed to represent visual diagrams with various node types and connections between them. The model consists of four primary entities:

1. **CloudBoard**: The main document containing the entire diagram
2. **Node**: Individual elements on the board (notes, cards, etc.)
3. **Connector**: Connection points on nodes
4. **Connection**: Links between node connectors

## Entity Relationships

```
CloudBoard (1) ──┐
                 │
                 ├──► Node (N)───┐
                 │               │
                 │               ├──► Connector (N)
                 │               │
                 └──► Connection (N)
```

- A **CloudBoard** contains multiple Nodes and Connections
- A **Node** belongs to one CloudBoard and contains multiple Connectors
- A **Connector** belongs to one Node
- A **Connection** belongs to one CloudBoard and links two Connectors

## Detailed Entities

### CloudBoard

The CloudBoard entity represents a complete diagram document.

#### Properties

| Property    | Type                | Description                       |
|-------------|---------------------|-----------------------------------|
| Id          | Guid                | Unique identifier (Primary Key)   |
| Name        | string              | Human-readable name               |
| Nodes       | List\<Node\>        | Collection of nodes in the board  |
| Connections | List\<Connection\>  | Collection of connections         |

### Node

The Node entity represents an individual element on the board.

#### Properties

| Property             | Type             | Description                                 |
|----------------------|------------------|---------------------------------------------|
| Id                   | Guid             | Unique identifier (Primary Key)             |
| Name                 | string           | Human-readable name                         |
| Position             | NodePosition     | X and Y coordinates on the canvas           |
| Type                 | NodeType (enum)  | Type of node (Note, Card, etc.)             |
| Properties           | JSON             | Node type-specific properties               |
| CloudBoardDocumentId | Guid             | Foreign key to parent CloudBoard            |
| Connectors           | List\<Connector\>| Collection of connectors on this node       |

### NodePosition

The NodePosition is a value object embedded in the Node entity.

#### Properties

| Property | Type    | Description                     |
|----------|---------|----------------------------------|
| X        | double  | X coordinate on the canvas       |
| Y        | double  | Y coordinate on the canvas       |

### Connector

The Connector entity represents a connection point on a node.

#### Properties

| Property  | Type                  | Description                         |
|-----------|----------------------|-------------------------------------|
| Id        | Guid                 | Unique identifier (Primary Key)      |
| Name      | string               | Human-readable name                  |
| Position  | ConnectorPosition    | Position on the node (Left, Right, etc.) |
| Type      | ConnectorType        | Type of connector (In, Out)          |
| NodeId    | Guid                 | Foreign key to parent Node           |

### ConnectorPosition (Enum)

```csharp
public enum ConnectorPosition
{
    Left,
    Right,
    Top,
    Bottom
}
```

### ConnectorType (Enum)

```csharp
public enum ConnectorType
{
    In,
    Out
}
```

### Connection

The Connection entity represents a link between two connectors.

#### Properties

| Property         | Type    | Description                             |
|------------------|---------|----------------------------------------|
| Id               | Guid    | Unique identifier (Primary Key)         |
| FromConnectorId  | Guid    | Foreign key to source connector         |
| ToConnectorId    | Guid    | Foreign key to target connector         |
| CloudBoardDocumentId | Guid | Foreign key to parent CloudBoard       |

### NodeType (Enum)

```csharp
public enum NodeType
{
    Note,            // Simple text notes
    Card,            // Card with title, subtitle, and content
    LinkCollection,  // Collection of hyperlinks
    ImageNode,       // Image display
    CodeBlock        // Syntax-highlighted code
}
```

## Node Type-Specific Properties

Each node type has specialized properties stored as JSON in the `Properties` column:

### NoteProperties

```typescript
interface NoteProperties extends NodeProperties {
  content: string;
  backgroundColor?: string;
  textColor?: string;
}
```

### CardProperties

```typescript
interface CardProperties extends NodeProperties {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  content: string;
}
```

### LinkCollectionProperties

```typescript
interface LinkCollectionProperties extends NodeProperties {
  links: LinkProperties[];
}

interface LinkProperties {
  title: string;
  url: string;
  iconClass?: string;
}
```

### ImageNodeProperties

```typescript
interface ImageNodeProperties extends NodeProperties {
  url: string;
  alt?: string;
  caption?: string;
}
```

### CodeBlockProperties

```typescript
interface CodeBlockProperties extends NodeProperties {
  code: string;
  language: string;
  showLineNumbers: boolean;
}
```

## Database Schema

The database schema is implemented in PostgreSQL using Entity Framework Core. The schema follows the entity relationships described above, with explicit foreign key relationships and cascade delete behavior to maintain referential integrity.

Key database design features:
- Node positions are stored as separate columns (PositionX, PositionY)
- Node properties are stored as JSONB for flexibility
- Cascade delete is enabled for child entities
- Indexes are created on frequently queried fields