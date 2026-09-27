<script setup lang="ts">
import { type Component, computed, markRaw, onMounted, onUnmounted, provide, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ConnectionLineType, ConnectionMode, type Edge, type Node as FlowNode, useVueFlow, VueFlow } from '@vue-flow/core';
import '@vue-flow/core/dist/style.css';
import { Background } from '@vue-flow/background';
import { MiniMap } from '@vue-flow/minimap';
import '@vue-flow/minimap/dist/style.css';
import ContextMenu from 'primevue/contextmenu';
import ProgressSpinner from 'primevue/progressspinner';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import type { MenuItem } from 'primevue/menuitem';

import CloudboardOpen from './CloudboardOpen.vue';
import CloudboardToolbar from './Toolbar.vue';
import PropertiesPanel from './PropertiesPanel.vue';
import CloudboardNode from './CloudboardNode.vue';
import PresenceAvatars from './PresenceAvatars.vue';

import { type CloudBoard, type Connection, type ConnectorPosition, type Node, type NodePosition, NodeType } from '@/models/cloudboard';
import * as cloudboardService from '@/services/cloudboardService';
import * as nodeService from '@/services/nodeService';
import * as connectionService from '@/services/connectionService';
import * as connectorService from '@/services/connectorService';
import { getFlowContextMenuItems, getNodeContextMenuItems } from '@/services/contextMenu';
import { useFlowControlStore, ZoomAction } from '@/stores/flowControl';
import { connectionDragInjectionKey, useConnectionDrag } from '@/composables/useConnectionDrag';
import { useBoardRealtime } from '@/composables/useBoardRealtime';
import { boardHistoryInjectionKey, HistoryConflictError, useBoardHistory } from '@/composables/useBoardHistory';
import { useAuthStore } from '@/stores/auth';
import { isFromEditableElement } from '@/utils/keyboard';

const route = useRoute();
const router = useRouter();
const confirm = useConfirm();
const toast = useToast();
const authStore = useAuthStore();
const flowControlStore = useFlowControlStore();

const currentCloudBoard = ref<CloudBoard>();
const isLoading = ref(false);
const canvasVisible = ref(true);
const currentZoomLevel = ref(1);

const propertiesPanelVisible = ref(false);
const propertiesPanelNodeProperties = ref<Node>();

const flowContextMenu = ref<InstanceType<typeof ContextMenu>>();
const nodeContextMenu = ref<InstanceType<typeof ContextMenu>>();
const flowContextMenuItems = ref<MenuItem[]>([]);
const nodeContextMenuItems = ref<MenuItem[]>([]);

const connectionDrag = useConnectionDrag(currentCloudBoard);
provide(connectionDragInjectionKey, connectionDrag);

/** Spacing of the background grid, which is also what nodes snap to when snapping is on. */
const GRID_SIZE = 20;

function minimapNodeColor(flowNode: FlowNode): string {
  const node = (flowNode.data as { node?: Node } | undefined)?.node;
  const background = node?.properties?.['backgroundColor'];
  if (typeof background === 'string' && background) return background;
  return node?.type === NodeType.CodeBlock ? '#1e1e1e' : '#fde68a';
}

const rawCloudboardNode = markRaw(CloudboardNode);
const nodeTypes: Record<string, Component> = {
  [NodeType.Note]: rawCloudboardNode,
  [NodeType.Card]: rawCloudboardNode,
  [NodeType.LinkCollection]: rawCloudboardNode,
  [NodeType.ImageNode]: rawCloudboardNode,
  [NodeType.CodeBlock]: rawCloudboardNode,
};

const {
  setNodes,
  setEdges,
  addNodes,
  addEdges,
  removeNodes,
  removeEdges,
  getSelectedNodes,
  getSelectedEdges,
  onConnect,
  onConnectStart,
  onConnectEnd,
  onNodeDragStop,
  onNodeDoubleClick,
  onNodeContextMenu,
  onPaneContextMenu,
  onViewportChange,
  fitView,
  zoomIn,
  zoomOut,
  screenToFlowCoordinate,
  updateNodeInternals,
  findNode,
} = useVueFlow();

function connectorNodeId(connectorId: string): string | undefined {
  return currentCloudBoard.value?.nodes.find((n) => n.connectors.some((c) => c.id === connectorId))?.id;
}

function toFlowNode(node: Node): FlowNode {
  return { id: node.id, type: node.type, position: node.position, data: { node } };
}

function toFlowEdge(connection: Connection): Edge {
  return {
    id: connection.id,
    source: connectorNodeId(connection.fromConnectorId)!,
    sourceHandle: connection.fromConnectorId,
    target: connectorNodeId(connection.toConnectorId)!,
    targetHandle: connection.toConnectorId,
    type: 'smoothstep',
  };
}

/**
 * Removes connections from the board and canvas, along with connectors no remaining
 * connection uses (the API deletes those together with the connection).
 */
function removeConnectionsLocally(board: CloudBoard, connectionIds: string[]): void {
  if (connectionIds.length === 0) return;
  const removed = board.connections.filter((c) => connectionIds.includes(c.id));
  board.connections = board.connections.filter((c) => !connectionIds.includes(c.id));

  const stillUsed = new Set(board.connections.flatMap((c) => [c.fromConnectorId, c.toConnectorId]));
  const orphaned = new Set(
    removed.flatMap((c) => [c.fromConnectorId, c.toConnectorId]).filter((id) => !stillUsed.has(id)),
  );
  const changedNodeIds: string[] = [];
  for (const node of board.nodes) {
    if (node.connectors.some((c) => orphaned.has(c.id))) {
      node.connectors = node.connectors.filter((c) => !orphaned.has(c.id));
      changedNodeIds.push(node.id);
    }
  }

  removeEdges(connectionIds);
  if (changedNodeIds.length) updateNodeInternals(changedNodeIds);
}

// --- undo / redo -------------------------------------------------------------

/** Deletes nodes and connections through the API and removes them from the canvas. */
async function removeElements(nodeIds: string[], connectionIds: string[]): Promise<void> {
  const board = currentCloudBoard.value;
  if (!board) return;
  const nodeIdsToDelete = nodeIds.filter((id) => board.nodes.some((n) => n.id === id));
  const deletedNodes = board.nodes.filter((n) => nodeIdsToDelete.includes(n.id));
  // Connections attached to deleted nodes go too, even if they weren't listed.
  const connectionIdsToDelete = Array.from(
    new Set([
      ...connectionIds.filter((id) => board.connections.some((c) => c.id === id)),
      ...board.connections
        .filter((c) => deletedNodes.some((n) => n.connectors.some((k) => k.id === c.fromConnectorId || k.id === c.toConnectorId)))
        .map((c) => c.id),
    ]),
  );

  await Promise.all([
    ...nodeIdsToDelete.map((id) => nodeService.deleteNode(id)),
    ...connectionIdsToDelete.map((id) => connectionService.deleteConnection(id)),
  ]);

  removeConnectionsLocally(board, connectionIdsToDelete);
  board.nodes = board.nodes.filter((n) => !nodeIdsToDelete.includes(n.id));
  removeNodes(nodeIdsToDelete);
  if (propertiesPanelNodeProperties.value && nodeIdsToDelete.includes(propertiesPanelNodeProperties.value.id)) {
    propertiesPanelVisible.value = false;
    propertiesPanelNodeProperties.value = undefined;
  }
}

const history = useBoardHistory({
  board: () => currentCloudBoard.value,

  async applyNodeFields(nodeId, patch) {
    const node = currentCloudBoard.value?.nodes.find((n) => n.id === nodeId);
    if (!node) throw new HistoryConflictError('someone else deleted the node.');

    if (patch.name !== undefined) node.name = patch.name;
    if (patch.type !== undefined) node.type = patch.type;
    if (patch.position) node.position = { ...patch.position };
    if (patch.properties) {
      const properties = { ...node.properties };
      for (const [key, value] of Object.entries(patch.properties)) {
        if (value === undefined) delete properties[key];
        else properties[key] = value;
      }
      node.properties = properties;
    }

    const flowNode = findNode(nodeId);
    if (flowNode) {
      flowNode.type = node.type;
      flowNode.position = { ...node.position };
    }
    updateNodeInternals([nodeId]);
    await nodeService.updateNode(nodeId, node);
  },

  deleteElements: removeElements,

  async recreate(spec, resolveId) {
    const board = currentCloudBoard.value;
    if (!board) throw new HistoryConflictError('the board is closed.');
    const created = new Map<string, string>();
    const lookup = (id: string) => created.get(id) ?? resolveId(id);

    for (const { nodeId } of spec.connectors) {
      if (!board.nodes.some((n) => n.id === resolveId(nodeId))) {
        throw new HistoryConflictError('someone else deleted a connected node.');
      }
    }

    for (const node of spec.nodes) {
      const createdNode = await nodeService.createNode(board.id, { ...node, id: '', connectors: [] });
      created.set(node.id, createdNode.id);
      board.nodes.push(createdNode);
      addNodes([toFlowNode(createdNode)]);
      history.trackNode(createdNode);
    }

    const connectorsToCreate = [
      ...spec.nodes.flatMap((node) => node.connectors.map((connector) => ({ nodeId: node.id, connector }))),
      ...spec.connectors,
    ];
    const changedNodeIds = new Set<string>();
    for (const { nodeId, connector } of connectorsToCreate) {
      const owner = board.nodes.find((n) => n.id === lookup(nodeId));
      if (!owner) throw new HistoryConflictError('someone else deleted a connected node.');
      if (owner.connectors.some((c) => c.id === lookup(connector.id))) continue;
      const createdConnector = await connectorService.createConnector(owner.id, { ...connector, id: '' });
      created.set(connector.id, createdConnector.id);
      owner.connectors.push(createdConnector);
      changedNodeIds.add(owner.id);
    }
    if (changedNodeIds.size) updateNodeInternals([...changedNodeIds]);

    for (const connection of spec.connections) {
      const createdConnection = await connectionService.createConnection(board.id, {
        id: '',
        fromConnectorId: lookup(connection.fromConnectorId),
        toConnectorId: lookup(connection.toConnectorId),
      });
      created.set(connection.id, createdConnection.id);
      board.connections.push(createdConnection);
      addEdges([toFlowEdge(createdConnection)]);
    }
    return created;
  },

  notifyError(message) {
    toast.add({ severity: 'warn', summary: 'Undo', detail: message, life: 6000 });
  },
});
provide(boardHistoryInjectionKey, history);

// --- live updates from other viewers -------------------------------------

const realtime = useBoardRealtime({
  onNodeCreated(node) {
    const board = currentCloudBoard.value;
    if (!board || board.nodes.some((n) => n.id === node.id)) return;
    board.nodes.push(node);
    addNodes([toFlowNode(node)]);
    history.trackNode(node);
  },

  onNodeUpdated(updated) {
    const board = currentCloudBoard.value;
    if (!board) return;
    const node = board.nodes.find((n) => n.id === updated.id);
    if (!node) {
      board.nodes.push(updated);
      addNodes([toFlowNode(updated)]);
      history.trackNode(updated);
      return;
    }

    // Mutate in place: the flow node's data and the properties panel hold this same object.
    node.name = updated.name;
    node.type = updated.type;
    node.position = updated.position;
    node.properties = updated.properties;
    node.connectors = updated.connectors;

    const flowNode = findNode(node.id);
    if (flowNode) {
      flowNode.type = updated.type;
      flowNode.position = { ...updated.position };
    }
    updateNodeInternals([node.id]);
    history.trackNode(node);
  },

  onNodeDeleted(nodeId) {
    const board = currentCloudBoard.value;
    const node = board?.nodes.find((n) => n.id === nodeId);
    if (!board || !node) return;

    const attached = board.connections.filter((conn) =>
      node.connectors.some((c) => c.id === conn.fromConnectorId || c.id === conn.toConnectorId),
    );
    removeConnectionsLocally(board, attached.map((c) => c.id));
    board.nodes = board.nodes.filter((n) => n.id !== nodeId);
    removeNodes([nodeId]);

    if (propertiesPanelNodeProperties.value?.id === nodeId) {
      propertiesPanelVisible.value = false;
      propertiesPanelNodeProperties.value = undefined;
    }
  },

  onConnectionCreated(connection) {
    const board = currentCloudBoard.value;
    if (!board || board.connections.some((c) => c.id === connection.id)) return;
    board.connections.push(connection);
    if (connectorNodeId(connection.fromConnectorId) && connectorNodeId(connection.toConnectorId)) {
      addEdges([toFlowEdge(connection)]);
    }
  },

  onConnectionUpdated(connection) {
    const board = currentCloudBoard.value;
    if (!board) return;
    board.connections = [...board.connections.filter((c) => c.id !== connection.id), connection];
    removeEdges([connection.id]);
    addEdges([toFlowEdge(connection)]);
  },

  onConnectionDeleted(connectionId) {
    const board = currentCloudBoard.value;
    if (!board) return;
    removeConnectionsLocally(board, [connectionId]);
  },

  onBoardUpdated({ name, description }) {
    if (!currentCloudBoard.value) return;
    currentCloudBoard.value.name = name;
    currentCloudBoard.value.description = description ?? undefined;
  },

  onBoardGone(reason) {
    toast.add({
      severity: 'warn',
      summary: 'Board closed',
      detail: reason === 'deleted' ? 'This board was deleted by its owner.' : 'This board is no longer shared with you.',
      life: 6000,
    });
    currentCloudBoard.value = undefined;
    propertiesPanelVisible.value = false;
    history.clear();
    void router.push('/cloudboard');
  },

  onResync() {
    const id = currentCloudBoard.value?.id;
    if (id) void refreshCloudBoard(id);
  },
});

const otherViewers = computed(() => realtime.presence.value.filter((u) => u.userId !== authStore.currentUser?.id));

/** Reloads the board in place (keeping the viewport), e.g. after a reconnect may have missed events. */
async function refreshCloudBoard(cloudboardId: string): Promise<void> {
  try {
    const cloudboard = await cloudboardService.loadCloudBoardById(cloudboardId);
    currentCloudBoard.value = cloudboard;
    setNodes(cloudboard.nodes.map(toFlowNode));
    setEdges(cloudboard.connections.map(toFlowEdge));
    history.trackBoard(cloudboard);
  } catch (error) {
    console.error('Error refreshing cloudboard', error);
  }
}

// --- loading -----------------------------------------------------------

watch(
  () => route.params.id as string | undefined,
  (id) => {
    if (id && (!currentCloudBoard.value || currentCloudBoard.value.id !== id)) {
      void loadCloudBoardById(id);
    }
  },
  { immediate: true },
);

async function loadCloudBoardById(cloudboardId: string): Promise<void> {
  isLoading.value = true;
  canvasVisible.value = false;
  try {
    // Join live updates before fetching, so no change made in between is missed.
    await realtime.joinBoard(cloudboardId);
    const cloudboard = await cloudboardService.loadCloudBoardById(cloudboardId);
    currentCloudBoard.value = cloudboard;
    setNodes(cloudboard.nodes.map(toFlowNode));
    setEdges(cloudboard.connections.map(toFlowEdge));
    history.clear();
    history.trackBoard(cloudboard);

    await fitView();
    setTimeout(async () => {
      await fitView();
      setTimeout(() => {
        canvasVisible.value = true;
      }, 100);
    }, 500);
  } catch (error) {
    console.error('Error loading cloudboard', error);
  } finally {
    isLoading.value = false;
  }
}

// --- node / connection mutations ---------------------------------------

async function addNode(nodeType: NodeType, position: NodePosition): Promise<void> {
  const board = currentCloudBoard.value;
  if (!board) return;

  const newNode: Node = {
    id: '',
    name: nodeService.getDefaultNameForNodeType(nodeType),
    position: { x: position.x, y: position.y },
    connectors: [],
    type: nodeType,
    properties: nodeService.getDefaultPropertiesForType(nodeType),
  };

  const createdNode = await nodeService.createNode(board.id, newNode);
  board.nodes.push(createdNode);
  addNodes([toFlowNode(createdNode)]);
  history.recordNodeCreated(createdNode);
}

/** Asks for confirmation, then deletes the nodes and connections (recording it for undo). */
function confirmAndDeleteNodesAndConnections(nodeIds: string[], connectionIds: string[]): void {
  confirm.require({
    message: `Are you sure you want to delete ${nodeIds.length} node${nodeIds.length === 1 ? '' : 's'} and ${connectionIds.length} connection${connectionIds.length === 1 ? '' : 's'}?`,
    header: 'Delete Confirmation',
    icon: 'pi pi-exclamation-triangle',
    acceptProps: { severity: 'danger' },
    rejectProps: { severity: 'secondary', variant: 'text' },
    accept: async () => {
      history.recordDeleted(nodeIds, connectionIds);
      try {
        await removeElements(nodeIds, connectionIds);
      } catch (error) {
        console.error('Error deleting', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete. Reload the board to see its current state.' });
      }
    },
  });
}

async function deleteNode(node: Node): Promise<void> {
  const board = currentCloudBoard.value;
  if (!board) return;

  const connectionsToDelete = board.connections.filter((conn) =>
    node.connectors.some((c) => c.id === conn.fromConnectorId || c.id === conn.toConnectorId),
  );

  confirmAndDeleteNodesAndConnections([node.id], connectionsToDelete.map((c) => c.id));
}

function openPropertiesPanelForNode(node: Node): void {
  propertiesPanelNodeProperties.value = node;
  propertiesPanelVisible.value = true;
}

// --- Vue Flow event wiring ----------------------------------------------

onConnectStart(() => {
  connectionDrag.connectionDragging.value = true;
});

onConnect(() => {
  void connectionDrag.finishConnectionDrag().then((connection) => {
    if (!connection) return;
    addEdges([toFlowEdge(connection)]);
    history.recordConnectionCreated(connection);
  });
});

onConnectEnd(() => {
  connectionDrag.cancelConnectionDrag();
});

// Vue Flow's Handle captures the pointer once a connection drag starts, which
// suppresses native mouseenter/mouseleave on the plain .connector-bar divs
// elsewhere on the canvas. Hit-testing the pointer position manually on every
// move sidesteps that, and works the same whether or not a drag is active -
// this is how the source side discovers its own hover too.
let hoveredBarKey: string | undefined;

function handleGlobalPointerMove(event: PointerEvent): void {
  const bar = (document.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null)?.closest(
    '.connector-bar',
  ) as HTMLElement | null;
  const nodeId = bar?.dataset.nodeId;
  const position = bar?.dataset.position as ConnectorPosition | undefined;
  const key = nodeId && position ? `${nodeId}::${position}` : undefined;

  if (key === hoveredBarKey) return;

  if (hoveredBarKey) {
    connectionDrag.onConnectorBarMouseLeave();
    updateNodeInternals([hoveredBarKey.split('::')[0]]);
  }

  hoveredBarKey = key;

  if (nodeId && position) {
    const node = currentCloudBoard.value?.nodes.find((n) => n.id === nodeId);
    if (node) {
      connectionDrag.onConnectorBarMouseEnter(node, position);
      updateNodeInternals([nodeId]);
    }
  }
}

onMounted(() => window.addEventListener('pointermove', handleGlobalPointerMove));
onUnmounted(() => window.removeEventListener('pointermove', handleGlobalPointerMove));

// Dragging a selection moves every selected node, so save them all (as one undo step).
onNodeDragStop(({ nodes: flowNodes }) => {
  const moved = flowNodes.map((flowNode) => {
    const node = (flowNode.data as { node: Node }).node;
    node.position = { x: flowNode.position.x, y: flowNode.position.y };
    return node;
  });
  for (const node of moved) void nodeService.updateNode(node.id, node);
  history.recordNodesSaved(moved);
});

onNodeDoubleClick(({ node: flowNode }) => {
  openPropertiesPanelForNode((flowNode.data as { node: Node }).node);
});

onNodeContextMenu(({ event, node: flowNode }) => {
  const node = (flowNode.data as { node: Node }).node;
  nodeContextMenuItems.value = getNodeContextMenuItems(node, deleteNode, openPropertiesPanelForNode);
  nodeContextMenu.value?.show(event);
  event.preventDefault();
});

onPaneContextMenu((event) => {
  const position = screenToFlowCoordinate({ x: event.clientX, y: event.clientY });
  flowContextMenuItems.value = getFlowContextMenuItems(position, addNode);
  flowContextMenu.value?.show(event);
  event.preventDefault();
});

onViewportChange((viewport) => {
  currentZoomLevel.value = viewport.zoom;
});

watch(
  () => [flowControlStore.action, flowControlStore.sequence] as const,
  ([action]) => {
    switch (action) {
      case ZoomAction.ZoomIn:
        void zoomIn();
        break;
      case ZoomAction.ZoomOut:
        void zoomOut();
        break;
      case ZoomAction.Reset:
        void fitView();
        break;
    }
  },
);

// --- keyboard: delete, undo, redo ---------------------------------------------

function handleKeydown(event: KeyboardEvent): void {
  const board = currentCloudBoard.value;
  // Keys pressed in a text field (properties panel, inline editing) edit the text,
  // including the browser's own undo there.
  if (!board || isFromEditableElement(event)) return;

  const key = event.key.toLowerCase();
  if ((event.ctrlKey || event.metaKey) && (key === 'z' || key === 'y')) {
    event.preventDefault();
    if (key === 'y' || event.shiftKey) void history.redo();
    else void history.undo();
    return;
  }

  if (event.key !== 'Delete') return;

  event.preventDefault();

  const selectedNodeIds = getSelectedNodes.value.map((n) => n.id);
  const selectedEdgeIds = getSelectedEdges.value.map((e) => e.id);
  if (selectedNodeIds.length === 0 && selectedEdgeIds.length === 0) return;

  const selectedNodes = board.nodes.filter((node) => selectedNodeIds.includes(node.id));
  const connectionsToDelete = Array.from(
    new Set([
      ...board.connections
        .filter((connection) =>
          selectedNodes.some(
            (node) =>
              node.connectors.some((c) => c.id === connection.fromConnectorId) ||
              node.connectors.some((c) => c.id === connection.toConnectorId),
          ),
        )
        .map((c) => c.id),
      ...selectedEdgeIds,
    ]),
  );

  confirmAndDeleteNodesAndConnections(selectedNodeIds, connectionsToDelete);
}

onMounted(() => window.addEventListener('keydown', handleKeydown));
onUnmounted(() => window.removeEventListener('keydown', handleKeydown));
</script>

<template>
  <div v-if="!currentCloudBoard" class="grow h-full flex justify-center items-center">
    <ProgressSpinner v-if="isLoading" />
    <CloudboardOpen v-else />
  </div>

  <template v-else>
    <div class="toolbar-container">
      <CloudboardToolbar />
      <span>Zoom Level: {{ currentZoomLevel.toFixed(2) }}</span>
      <PresenceAvatars :users="otherViewers" />
    </div>
    <div class="grow h-full flex flex-row overflow-hidden">
      <ContextMenu ref="flowContextMenu" :model="flowContextMenuItems" />
      <ContextMenu ref="nodeContextMenu" :model="nodeContextMenuItems" />

      <VueFlow
        class="grow canvas-container"
        :class="{ 'canvas-hidden': !canvasVisible }"
        :node-types="nodeTypes"
        :connection-mode="ConnectionMode.Loose"
        :min-zoom="0.1"
        :max-zoom="1"
        :delete-key-code="null"
        :connection-line-type="ConnectionLineType.SmoothStep"
        :snap-to-grid="flowControlStore.snapToGrid"
        :snap-grid="[GRID_SIZE, GRID_SIZE]"
      >
        <Background :gap="GRID_SIZE" pattern-color="#cbd5e1" />
        <MiniMap v-if="flowControlStore.minimapVisible" pannable zoomable :node-color="minimapNodeColor" />
      </VueFlow>
      <PropertiesPanel v-model:visible="propertiesPanelVisible" v-model:node-properties="propertiesPanelNodeProperties" />
    </div>
  </template>
</template>

<style scoped>
.canvas-container {
  opacity: 1;
  transition: opacity 0.3s ease-in-out;
}

.canvas-container.canvas-hidden {
  opacity: 0;
}

.canvas-container :deep(.vue-flow__node.selected) {
  margin: -2px;
  border-width: 2px;
  border-style: dashed;
  border-color: rgba(0, 0, 0, 0.4);
}

.canvas-container :deep(.vue-flow__edge-path) {
  stroke: rgba(0, 0, 0, 0.4);
}

.canvas-container :deep(.vue-flow__edge.selected .vue-flow__edge-path) {
  stroke-dasharray: 2em 2em;
  stroke: rgba(0, 0, 0, 0.4);
}
</style>
