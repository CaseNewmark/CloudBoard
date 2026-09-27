import { type CloudBoard, type Connection, type Node, NodeType } from '@/models/cloudboard';
import type { RecreateSpec } from '@/composables/useBoardHistory';

const FORMAT = 'cloudboard/nodes-v1';

/** What goes on the clipboard: the copied nodes plus the connections between them. */
export interface ClipboardPayload {
  format: typeof FORMAT;
  nodes: Node[];
  connections: Connection[];
}

export function buildClipboardPayload(board: CloudBoard, nodeIds: string[]): ClipboardPayload | undefined {
  const nodes = board.nodes.filter((n) => nodeIds.includes(n.id));
  if (nodes.length === 0) return undefined;
  const connectorIds = new Set(nodes.flatMap((n) => n.connectors.map((c) => c.id)));
  const connections = board.connections.filter((c) => connectorIds.has(c.fromConnectorId) && connectorIds.has(c.toConnectorId));
  // Connectors only exist for connections, so drop the ones leading outside the copy.
  const usedConnectorIds = new Set(connections.flatMap((c) => [c.fromConnectorId, c.toConnectorId]));
  const copied = nodes.map((n) => ({ ...n, connectors: n.connectors.filter((c) => usedConnectorIds.has(c.id)) }));
  return JSON.parse(JSON.stringify({ format: FORMAT, nodes: copied, connections }));
}

const nodeTypes = new Set<string>(Object.values(NodeType));

/** Parses clipboard text; anything that isn't a CloudBoard copy (or looks tampered with) returns undefined. */
export function parseClipboardPayload(text: string | undefined): ClipboardPayload | undefined {
  if (!text || !text.includes(FORMAT)) return undefined;
  try {
    const data = JSON.parse(text);
    const valid =
      data?.format === FORMAT &&
      Array.isArray(data.nodes) &&
      Array.isArray(data.connections) &&
      data.nodes.every(
        (n: any) =>
          typeof n?.id === 'string' &&
          typeof n.name === 'string' &&
          nodeTypes.has(n.type) &&
          Number.isFinite(n.position?.x) &&
          Number.isFinite(n.position?.y) &&
          typeof n.properties === 'object' &&
          Array.isArray(n.connectors),
      ) &&
      data.connections.every(
        (c: any) => typeof c?.id === 'string' && typeof c.fromConnectorId === 'string' && typeof c.toConnectorId === 'string',
      );
    return valid && data.nodes.length > 0 ? (data as ClipboardPayload) : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Turns a copy into elements to create, offset from the originals. IDs get a unique
 * prefix: they must never collide with IDs still on a board (the copied originals),
 * since the undo history maps these IDs to the ones the API assigns.
 */
export function toPasteSpec(payload: ClipboardPayload, offset: number): RecreateSpec {
  const prefix = `paste-${crypto.randomUUID()}-`;
  return {
    nodes: payload.nodes.map((n) => ({
      ...n,
      id: prefix + n.id,
      position: { x: n.position.x + offset, y: n.position.y + offset },
      connectors: n.connectors.map((c) => ({ ...c, id: prefix + c.id })),
    })),
    connectors: [],
    connections: payload.connections.map((c) => ({
      ...c,
      id: prefix + c.id,
      fromConnectorId: prefix + c.fromConnectorId,
      toConnectorId: prefix + c.toConnectorId,
    })),
  };
}
