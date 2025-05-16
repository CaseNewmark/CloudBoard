// src/app/data/cloudboard.ts

import { Guid } from "guid-typescript";

export interface NodePosition {
  x: number;
  y: number;
}

export interface Node {
  id: string;
  name: string;
  position: NodePosition;
}

export interface Connector {
  id: string;
  fromNodeId: string;
  toNodeId: string;
}

export interface CloudBoard {
  id?: Guid;
  name: string;
  nodes: Node[];
  connectors: Connector[];
}
