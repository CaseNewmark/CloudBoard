import { computed, type InjectionKey, shallowRef } from 'vue';
import type { CloudBoard, Connection, Connector, Node, NodePosition, NodeType } from '@/models/cloudboard';

/** The fields of a node that editing can change. */
export interface NodeFields {
  name: string;
  type: NodeType;
  position: NodePosition;
  properties: Record<string, any>;
}

/** A subset of node fields to write; `properties` only lists the keys to change (`undefined` removes a key). */
export interface NodeFieldPatch {
  name?: string;
  type?: NodeType;
  position?: NodePosition;
  properties?: Record<string, any>;
}

/** Elements to create again, e.g. when undoing a delete. IDs are the ones they had before. */
export interface RecreateSpec {
  nodes: Node[];
  /** Connectors on nodes that still exist (the API removes them together with their connection). */
  connectors: { nodeId: string; connector: Connector }[];
  connections: Connection[];
}

/** Thrown by the operations when something the history refers to no longer exists. */
export class HistoryConflictError extends Error {}

/** Board changes the history replays. They save through the API and update the canvas. */
export interface BoardHistoryOperations {
  board(): CloudBoard | undefined;
  applyNodeFields(nodeId: string, patch: NodeFieldPatch): Promise<void>;
  deleteElements(nodeIds: string[], connectionIds: string[]): Promise<void>;
  /** Creates the elements and returns a map from each old ID to the new one the API assigned. */
  recreate(spec: RecreateSpec, resolveId: (id: string) => string): Promise<Map<string, string>>;
  notifyError(message: string): void;
}

interface HistoryEntry {
  label: string;
  undo(): Promise<void>;
  redo(): Promise<void>;
}

const MAX_ENTRIES = 100;

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function fieldsOf(node: Node): NodeFields {
  return clone({ name: node.name, type: node.type, position: node.position, properties: node.properties ?? {} });
}

function sameValue(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/** The before/after patches for the fields that differ, per property key so concurrent edits to other keys survive. */
function diff(before: NodeFields, after: NodeFields): { before: NodeFieldPatch; after: NodeFieldPatch } | undefined {
  const b: NodeFieldPatch = {};
  const a: NodeFieldPatch = {};
  for (const key of ['name', 'type', 'position'] as const) {
    if (!sameValue(before[key], after[key])) {
      (b as any)[key] = before[key];
      (a as any)[key] = after[key];
    }
  }
  const keys = new Set([...Object.keys(before.properties), ...Object.keys(after.properties)]);
  for (const key of keys) {
    if (!sameValue(before.properties[key], after.properties[key])) {
      (b.properties ??= {})[key] = before.properties[key];
      (a.properties ??= {})[key] = after.properties[key];
    }
  }
  return Object.keys(a).length ? { before: b, after: a } : undefined;
}

function describeMove(count: number): string {
  return count === 1 ? 'Move node' : `Move ${count} nodes`;
}

/**
 * Undo/redo for the current user's own changes on the open board. Entries replay
 * through the API, so other viewers see undo and redo live. Undoing only touches the
 * fields (and property keys) the change touched, so concurrent edits by others to
 * other fields survive. Elements recreated by undo get new IDs from the API; `idMap`
 * translates the old IDs that earlier entries still refer to.
 */
export function useBoardHistory(ops: BoardHistoryOperations) {
  const undoStack = shallowRef<HistoryEntry[]>([]);
  const redoStack = shallowRef<HistoryEntry[]>([]);
  const idMap = new Map<string, string>();
  /** Last known state of each node, to work out what a save changed. */
  const baselines = new Map<string, NodeFields>();
  let running = false;

  const canUndo = computed(() => undoStack.value.length > 0);
  const canRedo = computed(() => redoStack.value.length > 0);
  const undoLabel = computed(() => undoStack.value.at(-1)?.label);
  const redoLabel = computed(() => redoStack.value.at(-1)?.label);

  function resolveId(id: string): string {
    let current = id;
    for (let hops = 0; idMap.has(current) && hops < 1000; hops++) current = idMap.get(current)!;
    return current;
  }

  function mergeIdMap(created: Map<string, string>): void {
    for (const [oldId, newId] of created) {
      if (oldId !== newId) idMap.set(oldId, newId);
    }
  }

  function push(entry: HistoryEntry): void {
    undoStack.value = [...undoStack.value, entry].slice(-MAX_ENTRIES);
    redoStack.value = [];
  }

  /** Remembers a node's current state without recording a change (board load, remote updates, recreation). */
  function trackNode(node: Node): void {
    baselines.set(node.id, fieldsOf(node));
  }

  function trackBoard(board: CloudBoard | undefined): void {
    baselines.clear();
    board?.nodes.forEach(trackNode);
  }

  function clear(): void {
    undoStack.value = [];
    redoStack.value = [];
    idMap.clear();
    baselines.clear();
  }

  /** Records a local save of one or more nodes as a single entry (e.g. dragging a selection). */
  function recordNodesSaved(nodes: Node[], label?: string): void {
    const changes: { nodeId: string; before: NodeFieldPatch; after: NodeFieldPatch }[] = [];
    for (const node of nodes) {
      const before = baselines.get(node.id);
      const after = fieldsOf(node);
      baselines.set(node.id, after);
      const change = before && diff(before, after);
      if (change) changes.push({ nodeId: node.id, ...change });
    }
    if (changes.length === 0) return;

    const onlyMoved = changes.every((c) => Object.keys(c.after).length === 1 && c.after.position);
    const apply = async (side: 'before' | 'after') => {
      for (const change of changes) {
        const nodeId = resolveId(change.nodeId);
        await ops.applyNodeFields(nodeId, change[side]);
        const node = ops.board()?.nodes.find((n) => n.id === nodeId);
        if (node) trackNode(node);
      }
    };
    push({
      label: label ?? (onlyMoved ? describeMove(changes.length) : 'Edit node'),
      undo: () => apply('before'),
      redo: () => apply('after'),
    });
  }

  function recordNodeSaved(node: Node): void {
    recordNodesSaved([node]);
  }

  /** Records creating a node (it has no connectors or connections yet). */
  function recordNodeCreated(node: Node): void {
    trackNode(node);
    const snapshot = clone(node);
    push({
      label: 'Add node',
      undo: () => ops.deleteElements([resolveId(snapshot.id)], []),
      redo: async () => {
        mergeIdMap(await ops.recreate({ nodes: [snapshot], connectors: [], connections: [] }, resolveId));
      },
    });
  }

  /**
   * Records deleting nodes and connections. Call it before removing them, while the
   * board still shows what the undo has to bring back.
   */
  function recordDeleted(nodeIds: string[], connectionIds: string[]): void {
    const board = ops.board();
    if (!board) return;
    const nodes = clone(board.nodes.filter((n) => nodeIds.includes(n.id)));
    const connections = clone(board.connections.filter((c) => connectionIds.includes(c.id)));

    // Connectors on surviving nodes that the API deletes along with these connections.
    const remaining = board.connections.filter((c) => !connectionIds.includes(c.id));
    const stillUsed = new Set(remaining.flatMap((c) => [c.fromConnectorId, c.toConnectorId]));
    const connectors: RecreateSpec['connectors'] = [];
    for (const connectorId of new Set(connections.flatMap((c) => [c.fromConnectorId, c.toConnectorId]))) {
      if (stillUsed.has(connectorId)) continue;
      const owner = board.nodes.find((n) => !nodeIds.includes(n.id) && n.connectors.some((c) => c.id === connectorId));
      const connector = owner?.connectors.find((c) => c.id === connectorId);
      if (owner && connector) connectors.push({ nodeId: owner.id, connector: clone(connector) });
    }

    const plural = (count: number, noun: string) => `${count} ${noun}${count === 1 ? '' : 's'}`;
    push({
      label: `Delete ${nodes.length ? plural(nodes.length, 'node') : plural(connections.length, 'connection')}`,
      undo: async () => {
        mergeIdMap(await ops.recreate({ nodes, connectors, connections }, resolveId));
      },
      redo: () =>
        ops.deleteElements(
          nodes.map((n) => resolveId(n.id)),
          connections.map((c) => resolveId(c.id)),
        ),
    });
  }

  /** Records drawing a connection, including the two connectors created for it. */
  function recordConnectionCreated(connection: Connection): void {
    const board = ops.board();
    if (!board) return;
    const connectors: RecreateSpec['connectors'] = [];
    for (const connectorId of [connection.fromConnectorId, connection.toConnectorId]) {
      const owner = board.nodes.find((n) => n.connectors.some((c) => c.id === connectorId));
      const connector = owner?.connectors.find((c) => c.id === connectorId);
      if (owner && connector) connectors.push({ nodeId: owner.id, connector: clone(connector) });
    }
    const snapshot = clone(connection);
    push({
      label: 'Add connection',
      undo: () => ops.deleteElements([], [resolveId(snapshot.id)]),
      redo: async () => {
        mergeIdMap(await ops.recreate({ nodes: [], connectors, connections: [snapshot] }, resolveId));
      },
    });
  }

  async function run(from: typeof undoStack, to: typeof redoStack, direction: 'undo' | 'redo'): Promise<void> {
    const entry = from.value.at(-1);
    if (!entry || running) return;
    running = true;
    from.value = from.value.slice(0, -1);
    try {
      await entry[direction]();
      to.value = [...to.value, entry];
    } catch (error) {
      console.error(`${direction} failed`, error);
      ops.notifyError(
        error instanceof HistoryConflictError
          ? `Couldn't ${direction} "${entry.label}": ${error.message}`
          : `Couldn't ${direction} "${entry.label}". Reload the board if it looks out of date.`,
      );
    } finally {
      running = false;
    }
  }

  return {
    canUndo,
    canRedo,
    undoLabel,
    redoLabel,
    undo: () => run(undoStack, redoStack, 'undo'),
    redo: () => run(redoStack, undoStack, 'redo'),
    clear,
    trackNode,
    trackBoard,
    recordNodeSaved,
    recordNodesSaved,
    recordNodeCreated,
    recordDeleted,
    recordConnectionCreated,
  };
}

export type BoardHistory = ReturnType<typeof useBoardHistory>;
export const boardHistoryInjectionKey: InjectionKey<BoardHistory> = Symbol('boardHistory');
