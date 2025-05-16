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
