// src/app/data/cloudboard.ts

import { Guid } from "guid-typescript";
import { NodeProperties } from "./node-properties";

export enum ConnectorPosition {
  Top = 'top',
  Bottom = 'bottom',
  Left = 'left',
  Right = 'right'
}

export enum ConnectorType {
  In = 'in',
  Out = 'out',
  InOut = 'inout'
}

export interface Connector {
  id: string;
  name: string;
  position: ConnectorPosition;
  type: ConnectorType;
}

export interface NodePosition {
  x: number;
  y: number;
}

export interface Node {
  id: string;
  name: string;
  position: NodePosition;
  connectors: Connector[];
  properties: NodeProperties;
}

export interface Connection {
  id: string;
  fromConnectorId: string;
  toConnectorId: string;
}

export interface CloudBoard {
  id?: Guid;
  name: string;
  nodes: Node[];
  connections: Connection[];
}
