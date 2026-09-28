import type { CloudBoard, Connection, Node } from '@/models/cloudboard';
import * as cloudboardService from '@/services/cloudboardService';
import * as nodeService from '@/services/nodeService';
import * as connectorService from '@/services/connectorService';
import * as connectionService from '@/services/connectionService';
import { imageUrlToDataUrl, storedImageId, uploadImage } from '@/services/imageService';
import { areValidElements } from './boardClipboard';

const FORMAT = 'cloudboard/board-v1';

/** A whole board as a file. Stored images are embedded as data: URLs, so the file is self-contained. */
export interface BoardExport {
  format: typeof FORMAT;
  exportedAt: string;
  name: string;
  description?: string;
  nodes: Node[];
  connections: Connection[];
}

async function mapImageUrls(node: Node, map: (url: string) => Promise<string | undefined>): Promise<Node> {
  const properties = { ...node.properties };
  for (const [key, value] of Object.entries(properties)) {
    if (typeof value !== 'string') continue;
    const mapped = await map(value);
    if (mapped !== undefined) properties[key] = mapped;
  }
  return { ...node, properties };
}

export async function buildBoardExport(board: CloudBoard): Promise<BoardExport> {
  const source = JSON.parse(JSON.stringify(board)) as CloudBoard;
  const nodes = await Promise.all(
    source.nodes.map((node) => mapImageUrls(node, async (url) => (storedImageId(url) ? await imageUrlToDataUrl(url) : undefined))),
  );
  return {
    format: FORMAT,
    exportedAt: new Date().toISOString(),
    name: source.name,
    description: source.description,
    nodes,
    connections: source.connections,
  };
}

/** Parses an exported board file, or returns undefined if it isn't one. */
export function parseBoardExport(text: string): BoardExport | undefined {
  try {
    const data = JSON.parse(text);
    if (data?.format !== FORMAT || typeof data.name !== 'string' || !areValidElements(data.nodes, data.connections)) {
      return undefined;
    }
    const connectorIds = new Set((data.nodes as Node[]).flatMap((n) => n.connectors.map((c) => c.id)));
    const linked = (data.connections as Connection[]).every((c) => connectorIds.has(c.fromConnectorId) && connectorIds.has(c.toConnectorId));
    return linked ? (data as BoardExport) : undefined;
  } catch {
    return undefined;
  }
}

/** Creates a new board from an export (re-uploading embedded images) and returns its ID. */
export async function importBoard(data: BoardExport, name = data.name): Promise<string> {
  const board = await cloudboardService.createCloudBoard({
    id: '',
    name: name.slice(0, 100),
    description: data.description,
    nodes: [],
    connections: [],
  });

  const ids = new Map<string, string>();
  for (const node of data.nodes) {
    const withImages = await mapImageUrls(node, async (url) => {
      if (!/^data:image\/(png|jpeg|gif|webp);base64,/.test(url)) return undefined;
      const blob = await (await fetch(url)).blob();
      return uploadImage(board.id, blob, 'imported-image');
    });
    const created = await nodeService.createNode(board.id, { ...withImages, id: '', connectors: [] });
    ids.set(node.id, created.id);
    for (const connector of node.connectors) {
      const createdConnector = await connectorService.createConnector(created.id, { ...connector, id: '' });
      ids.set(connector.id, createdConnector.id);
    }
  }
  for (const connection of data.connections) {
    await connectionService.createConnection(board.id, {
      id: '',
      fromConnectorId: ids.get(connection.fromConnectorId)!,
      toConnectorId: ids.get(connection.toConnectorId)!,
      label: connection.label,
    });
  }
  return board.id;
}

/** Saves `href` (a data: or object URL) as a file. */
export function downloadFile(href: string, fileName: string): void {
  const link = document.createElement('a');
  link.href = href;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

/** A file-name-safe version of a board name. */
export function fileNameFor(name: string): string {
  return name.trim().replace(/[^\w\- ]+/g, '').replace(/\s+/g, '-').toLowerCase() || 'cloudboard';
}
