// src/app/data/cloudboard.ts

import { Guid } from "guid-typescript";

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

// Define node types enum
export enum NodeType {
  Note = 'note',
  Card = 'card',
  LinkCollection = 'link-collection',
  ImageNode = 'image',
  CodeBlock = 'code-block'
}

// Base properties interface
export interface NodeProperties {
  [key: string]: any;
  width?: string;
  height?: string;
}

// Specific properties for each node type
export interface NoteProperties extends NodeProperties {
  content: string;
  backgroundColor?: string;
  textColor?: string;
}

export interface CardProperties extends NodeProperties {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  content: string;
}

export interface LinkProperties {
  title: string;
  url: string;
  iconClass?: string;
}

export interface LinkCollectionProperties extends NodeProperties {
  links: LinkProperties[];
}

export interface ImageNodeProperties extends NodeProperties {
  url: string;
  alt?: string;
  caption?: string;
}

export interface CodeBlockProperties extends NodeProperties {
  code: string;
  language: string;
  showLineNumbers: boolean;
}

export interface Node {
  id: string;
  name: string;
  position: NodePosition;
  connectors: Connector[];
  type: NodeType;
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
