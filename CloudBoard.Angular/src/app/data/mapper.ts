import { map } from "rxjs";
import { CloudBoardDto, ConnectionDto, ConnectorDto, NodeDto, NodePositionDto } from "../services/api-client-service";
import { CloudBoard, Connection, Connector, ConnectorPosition, ConnectorType, Node, NodePosition, NodeType } from "./cloudboard";

// mapping DTOs to domain objects

export function mapCloudBoardDtoToCloudBoard(dto: CloudBoardDto): CloudBoard {
  return {
    id: dto.id!,
    name: dto.name!,
    nodes: dto.nodes?.map(nodeDto => mapNodeDtoToNode(nodeDto)) || [], 
    connections: dto.connections?.map(connectionDto => mapConnectionDtoToConnection(connectionDto)) || []
  };
}

export function mapNodeDtoToNode(dto: NodeDto): Node {
  return {
    id: dto.id!,
    name: dto.name!,
    position: mapNodePositionDtoToNodePosition(dto.position!),
    type: mapNodeDtoTypeToNodeType(dto.type!),
    connectors: dto.connectors?.map(connectorDto => mapConnectorDtoToConnector(connectorDto)) || [],
    properties: {} // Map properties based on type
  };
}

export function mapConnectionDtoToConnection(dto: ConnectionDto): Connection {
  return {
    id: dto.id!,
    fromConnectorId: dto.fromConnectorId!,
    toConnectorId: dto.toConnectorId!
  };
}

export function mapConnectorDtoToConnector(dto: ConnectorDto): Connector {
  return {
    id: dto.id!,
    name: dto.name!,
    position: mapConnectorDtoPositionToConnectorPosition(dto.position!),
    type: mapConnectorDtoTypeToConnectorType(dto.type!)
  };
}

function mapNodePositionDtoToNodePosition(dto: NodePositionDto): NodePosition {
    return {
        x: dto.x ?? 0,
        y: dto.y ?? 0
    };
}

function mapNodeDtoTypeToNodeType(type: string): NodeType {
  switch (type) {
    case 'Note':
      return NodeType.Note;
    case 'Card':
      return NodeType.Card;
    case 'LinkCollection':
      return NodeType.LinkCollection;
    case 'ImageNode':
      return NodeType.ImageNode;
    case 'CodeBlock':
      return NodeType.CodeBlock;
    default:
      throw new Error(`Unknown node type: ${type}`);
  }
}

function mapConnectorDtoPositionToConnectorPosition(dto: string): ConnectorPosition {
  switch (dto) {
    case 'left':
      return ConnectorPosition.Left;
    case 'right':
      return ConnectorPosition.Right;
    case 'top':
      return ConnectorPosition.Top;
    case 'bottom':
      return ConnectorPosition.Bottom;
    default:
      throw new Error(`Unknown connector position: ${dto}`);
  }
}

function mapConnectorDtoTypeToConnectorType(dto: string): ConnectorType {
  switch (dto) {
    case 'In':
      return ConnectorType.In;
    case 'Out':
      return ConnectorType.Out;
    case 'InOut':
      return ConnectorType.InOut;
    default:
      throw new Error(`Unknown connector type: ${dto}`);
  }
}

// mapping domain objects to DTOs
export function mapCloudBoardToCloudBoardDto(cloudBoard: CloudBoard): CloudBoardDto {
  return {
    id: cloudBoard.id,
    name: cloudBoard.name,
    nodes: cloudBoard.nodes.map(node => mapNodeToNodeDto(node)),
    connections: cloudBoard.connections.map(connection => mapConnectionToConnectionDto(connection))
  };
}

export function mapNodeToNodeDto(node: Node): NodeDto {
  return {
    id: node.id,
    name: node.name,
    position: mapNodePositionToNodePositionDto(node.position),
    type: mapNodeTypeToNodeTypeDto(node.type),
    connectors: node.connectors.map(connector => mapConnectorToConnectorDto(connector)),
    properties: {} // Map properties based on type
  };
}

export function mapConnectionToConnectionDto(connection: Connection): ConnectionDto {
  return {
    id: connection.id,
    fromConnectorId: connection.fromConnectorId,
    toConnectorId: connection.toConnectorId
  };
}   

export function mapConnectorToConnectorDto(connector: Connector): ConnectorDto {
  return {
    id: connector.id,
    name: connector.name,
    position: mapConnectorPositionToConnectorPositionDto(connector.position),
    type: mapConnectorTypeToConnectorTypeDto(connector.type)
  };
}

function mapNodePositionToNodePositionDto(position: NodePosition): NodePositionDto {
  return {
    x: position.x,
    y: position.y
  };
}

function mapNodeTypeToNodeTypeDto(type: NodeType): string {
  switch (type) {
    case NodeType.Note:
      return 'Note';
    case NodeType.Card:
      return 'Card';
    case NodeType.LinkCollection:
      return 'LinkCollection';
    case NodeType.ImageNode:
      return 'ImageNode';
    case NodeType.CodeBlock:
      return 'CodeBlock';
    default:
      throw new Error(`Unknown node type: ${type}`);
  }
}

function mapConnectorPositionToConnectorPositionDto(position: ConnectorPosition): string {
  switch (position) {
    case ConnectorPosition.Left:
      return 'left';
    case ConnectorPosition.Right:
      return 'right';
    case ConnectorPosition.Top:
      return 'top';
    case ConnectorPosition.Bottom:
      return 'bottom';
    default:
      throw new Error(`Unknown connector position: ${position}`);
  }
}

function mapConnectorTypeToConnectorTypeDto(type: ConnectorType): string {
  switch (type) {
    case ConnectorType.In:
      return 'in';
    case ConnectorType.Out:
      return 'out';
    case ConnectorType.InOut:
      return 'inout';
    default:
      throw new Error(`Unknown connector type: ${type}`);
  }
}   