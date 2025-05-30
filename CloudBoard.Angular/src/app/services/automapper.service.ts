import { Injectable } from '@angular/core';
import { createMapper, createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { classes } from '@automapper/classes';
import { CloudBoard, Node, Connector, Connection, ConnectorPosition, ConnectorType, NodeType, NodePosition } from '../data/cloudboard';
import { CloudBoardDto, NodeDto, ConnectorDto, ConnectionDto, NodePositionDto } from './api-client-service';

@Injectable({
  providedIn: 'root'
})
export class AutoMapperService {
  private mapper: Mapper;

  constructor() {
    this.mapper = createMapper({
      strategyInitializer: classes()
    });
    
    this.configureMapping();
  }

  private configureMapping(): void {
    // CloudBoardDto to CloudBoard mapping
    // createMap(
    //   this.mapper,
    //   'CloudBoardDto',
    //   'CloudBoard',
    //   forMember(
    //     (dest: CloudBoard) => dest.name,
    //     mapFrom((src: CloudBoardDto) => src.name ?? '')
    //   ),
    //   forMember(
    //     (dest: CloudBoard) => dest.nodes,
    //     mapFrom((src: CloudBoardDto) => 
    //       src.nodes?.map(nodeDto => this.mapper.map(nodeDto, 'NodeDto', 'Node')) ?? []
    //     )
    //   ),
    //   forMember(
    //     (dest: CloudBoard) => dest.connections,
    //     mapFrom((src: CloudBoardDto) => 
    //       src.connections?.map(connectionDto => this.mapper.map(connectionDto, 'ConnectionDto', 'Connection')) ?? []
    //     )
    //   )
    // );

    // // CloudBoard to CloudBoardDto mapping
    // createMap(
    //   this.mapper,
    //   'CloudBoard',
    //   'CloudBoardDto',
    //   forMember(
    //     (dest: CloudBoardDto) => dest.name,
    //     mapFrom((src: CloudBoard) => src.name)
    //   ),
    //   forMember(
    //     (dest: CloudBoardDto) => dest.nodes,
    //     mapFrom((src: CloudBoard) => 
    //       src.nodes.map(node => this.mapper.map(node, 'Node', 'NodeDto'))
    //     )
    //   ),
    //   forMember(
    //     (dest: CloudBoardDto) => dest.connections,
    //     mapFrom((src: CloudBoard) => 
    //       src.connections.map(connection => this.mapper.map(connection, 'Connection', 'ConnectionDto'))
    //     )
    //   )
    // );

    // // NodeDto to Node mapping
    // createMap(
    //   this.mapper,
    //   'NodeDto',
    //   'Node',
    //   forMember(
    //     (dest: Node) => dest.name,
    //     mapFrom((src: NodeDto) => src.name ?? '')
    //   ),
    //   forMember(
    //     (dest: Node) => dest.position,
    //     mapFrom((src: NodeDto) => this.mapper.map(src.position, 'NodePositionDto', 'NodePosition'))
    //   ),
    //   forMember(
    //     (dest: Node) => dest.connectors,
    //     mapFrom((src: NodeDto) => 
    //       src.connectors?.map(connectorDto => this.mapper.map(connectorDto, 'ConnectorDto', 'Connector')) ?? []
    //     )
    //   ),
    //   forMember(
    //     (dest: Node) => dest.type,
    //     mapFrom((src: NodeDto) => this.parseNodeType(src.type))
    //   ),
    //   forMember(
    //     (dest: Node) => dest.properties,
    //     mapFrom((src: NodeDto) => src.properties ? { ...src.properties } : {})
    //   )
    // );

    // // Node to NodeDto mapping
    // createMap(
    //   this.mapper,
    //   'Node',
    //   'NodeDto',
    //   forMember(
    //     (dest: NodeDto) => dest.name,
    //     mapFrom((src: Node) => src.name)
    //   ),
    //   forMember(
    //     (dest: NodeDto) => dest.position,
    //     mapFrom((src: Node) => this.mapper.map(src.position, 'NodePosition', 'NodePositionDto'))
    //   ),
    //   forMember(
    //     (dest: NodeDto) => dest.connectors,
    //     mapFrom((src: Node) => 
    //       src.connectors.map(connector => this.mapper.map(connector, 'Connector', 'ConnectorDto'))
    //     )
    //   ),
    //   forMember(
    //     (dest: NodeDto) => dest.type,
    //     mapFrom((src: Node) => src.type.toString())
    //   ),
    //   forMember(
    //     (dest: NodeDto) => dest.properties,
    //     mapFrom((src: Node) => src.properties)
    //   )
    // );

    // // NodePositionDto to NodePosition mapping
    // createMap(
    //   this.mapper,
    //   'NodePositionDto',
    //   'NodePosition',
    //   forMember(
    //     (dest: NodePosition) => dest.x,
    //     mapFrom((src: NodePositionDto) => src.x ?? 0)
    //   ),
    //   forMember(
    //     (dest: NodePosition) => dest.y,
    //     mapFrom((src: NodePositionDto) => src.y ?? 0)
    //   )
    // );

    // // NodePosition to NodePositionDto mapping
    // createMap(
    //   this.mapper,
    //   'NodePosition',
    //   'NodePositionDto',
    //   forMember(
    //     (dest: NodePositionDto) => dest.x,
    //     mapFrom((src: NodePosition) => src.x)
    //   ),
    //   forMember(
    //     (dest: NodePositionDto) => dest.y,
    //     mapFrom((src: NodePosition) => src.y)
    //   )
    // );

    // // ConnectorDto to Connector mapping
    // createMap(
    //   this.mapper,
    //   'ConnectorDto',
    //   'Connector',
    //   forMember(
    //     (dest: Connector) => dest.name,
    //     mapFrom((src: ConnectorDto) => src.name ?? '')
    //   ),
    //   forMember(
    //     (dest: Connector) => dest.position,
    //     mapFrom((src: ConnectorDto) => this.parseConnectorPosition(src.position))
    //   ),
    //   forMember(
    //     (dest: Connector) => dest.type,
    //     mapFrom((src: ConnectorDto) => this.parseConnectorType(src.type))
    //   )
    // );

    // // Connector to ConnectorDto mapping
    // createMap(
    //   this.mapper,
    //   'Connector',
    //   'ConnectorDto',
    //   forMember(
    //     (dest: ConnectorDto) => dest.name,
    //     mapFrom((src: Connector) => src.name)
    //   ),
    //   forMember(
    //     (dest: ConnectorDto) => dest.position,
    //     mapFrom((src: Connector) => src.position.toString().toLowerCase())
    //   ),
    //   forMember(
    //     (dest: ConnectorDto) => dest.type,
    //     mapFrom((src: Connector) => src.type.toString().toLowerCase())
    //   )
    // );

    // // ConnectionDto to Connection mapping
    // createMap(
    //   this.mapper,
    //   'ConnectionDto',
    //   'Connection',
    //   forMember(
    //     (dest: Connection) => dest.fromConnectorId,
    //     mapFrom((src: ConnectionDto) => src.fromConnectorId)
    //   ),
    //   forMember(
    //     (dest: Connection) => dest.toConnectorId,
    //     mapFrom((src: ConnectionDto) => src.toConnectorId)
    //   )
    // );

    // // Connection to ConnectionDto mapping
    // createMap(
    //   this.mapper,
    //   'Connection',
    //   'ConnectionDto',
    //   forMember(
    //     (dest: ConnectionDto) => dest.fromConnectorId,
    //     mapFrom((src: Connection) => src.fromConnectorId)
    //   ),
    //   forMember(
    //     (dest: ConnectionDto) => dest.toConnectorId,
    //     mapFrom((src: Connection) => src.toConnectorId)
    //   )
    // );
  }

  // Public mapping methods
  mapCloudBoardDtoToCloudBoard(dto: CloudBoardDto): CloudBoard {
    return this.mapper.map(dto, 'CloudBoardDto', 'CloudBoard');
  }

  mapCloudBoardToCloudBoardDto(cloudBoard: CloudBoard): CloudBoardDto {
    return this.mapper.map(cloudBoard, 'CloudBoard', 'CloudBoardDto');
  }

  mapNodeDtoToNode(dto: NodeDto): Node {
    return this.mapper.map(dto, 'NodeDto', 'Node');
  }

  mapNodeToNodeDto(node: Node): NodeDto {
    return this.mapper.map(node, 'Node', 'NodeDto');
  }

  mapConnectorDtoToConnector(dto: ConnectorDto): Connector {
    return this.mapper.map(dto, 'ConnectorDto', 'Connector');
  }

  mapConnectorToConnectorDto(connector: Connector): ConnectorDto {
    return this.mapper.map(connector, 'Connector', 'ConnectorDto');
  }

  mapConnectionDtoToConnection(dto: ConnectionDto): Connection {
    return this.mapper.map(dto, 'ConnectionDto', 'Connection');
  }

  mapConnectionToConnectionDto(connection: Connection): ConnectionDto {
    return this.mapper.map(connection, 'Connection', 'ConnectionDto');
  }

  // Helper methods for enum parsing
  private parseConnectorPosition(position: string | undefined): ConnectorPosition {
    if (!position) return ConnectorPosition.Left;
    
    switch (position.toLowerCase()) {
      case 'top': return ConnectorPosition.Top;
      case 'bottom': return ConnectorPosition.Bottom;
      case 'left': return ConnectorPosition.Left;
      case 'right': return ConnectorPosition.Right;
      default: return ConnectorPosition.Left;
    }
  }

  private parseConnectorType(type: string | undefined): ConnectorType {
    if (!type) return ConnectorType.In;
    
    switch (type.toLowerCase()) {
      case 'in': return ConnectorType.In;
      case 'out': return ConnectorType.Out;
      case 'inout': return ConnectorType.InOut;
      default: return ConnectorType.In;
    }
  }

  private parseNodeType(type: string | undefined): NodeType {
    if (!type) return NodeType.Note;
    
    switch (type) {
      case 'Note': return NodeType.Note;
      case 'Card': return NodeType.Card;
      case 'LinkCollection': return NodeType.LinkCollection;
      case 'ImageNode': return NodeType.ImageNode;
      case 'CodeBlock': return NodeType.CodeBlock;
      default: return NodeType.Note;
    }
  }
}
