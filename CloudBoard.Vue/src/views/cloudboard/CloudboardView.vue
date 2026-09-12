<script setup lang="ts">
import { type Component, onMounted, onUnmounted, provide, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { ConnectionLineType, ConnectionMode, type Edge, type Node as FlowNode, useVueFlow, VueFlow } from '@vue-flow/core';
import '@vue-flow/core/dist/style.css';
import ContextMenu from 'primevue/contextmenu';
import ProgressSpinner from 'primevue/progressspinner';
import { useConfirm } from 'primevue/useconfirm';
import type { MenuItem } from 'primevue/menuitem';

import CloudboardOpen from './CloudboardOpen.vue';
import CloudboardToolbar from './Toolbar.vue';
import PropertiesPanel from './PropertiesPanel.vue';
import CloudboardNode from './CloudboardNode.vue';

import { type CloudBoard, type Connection, type Node, type NodePosition, NodeType } from '@/models/cloudboard';
import * as cloudboardService from '@/services/cloudboardService';
import * as nodeService from '@/services/nodeService';
import * as connectionService from '@/services/connectionService';
import { getFlowContextMenuItems, getNodeContextMenuItems } from '@/services/contextMenu';
import { useFlowControlStore, ZoomAction } from '@/stores/flowControl';
import { connectionDragInjectionKey, useConnectionDrag } from '@/composables/useConnectionDrag';

const route = useRoute();
const confirm = useConfirm();
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

const nodeTypes: Record<string, Component> = {
  [NodeType.Note]: CloudboardNode,
  [NodeType.Card]: CloudboardNode,
  [NodeType.LinkCollection]: CloudboardNode,
  [NodeType.ImageNode]: CloudboardNode,
  [NodeType.CodeBlock]: CloudboardNode,
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
    const cloudboard = await cloudboardService.loadCloudBoardById(cloudboardId);
    currentCloudBoard.value = cloudboard;
    setNodes(cloudboard.nodes.map(toFlowNode));
    setEdges(cloudboard.connections.map(toFlowEdge));

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
}

async function confirmAndDeleteNodesAndConnections(nodeIds: string[], connectionIds: string[]): Promise<boolean> {
  return new Promise((resolve) => {
    confirm.require({
      message: `Are you sure you want to delete ${nodeIds.length} node${nodeIds.length > 1 ? 's' : ''} and ${connectionIds.length} connection${connectionIds.length > 1 ? 's' : ''}?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptProps: { severity: 'danger' },
      rejectProps: { severity: 'secondary', variant: 'text' },
      accept: async () => {
        const results = await Promise.all([
          ...nodeIds.map((id) => nodeService.deleteNode(id)),
          ...connectionIds.map((id) => connectionService.deleteConnection(id)),
        ]);
        resolve(results.every((r) => r));
      },
      reject: () => resolve(false),
    });
  });
}

async function deleteNode(node: Node): Promise<void> {
  const board = currentCloudBoard.value;
  if (!board) return;

  const connectionsToDelete = board.connections.filter((conn) =>
    node.connectors.some((c) => c.id === conn.fromConnectorId || c.id === conn.toConnectorId),
  );

  const success = await confirmAndDeleteNodesAndConnections([node.id], connectionsToDelete.map((c) => c.id));
  if (success) {
    board.nodes = board.nodes.filter((n) => n.id !== node.id);
    board.connections = board.connections.filter((c) => !connectionsToDelete.some((conn) => conn.id === c.id));
    removeNodes([node.id]);
    removeEdges(connectionsToDelete.map((c) => c.id));
  }
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
    if (connection) addEdges([toFlowEdge(connection)]);
  });
});

onConnectEnd(() => {
  connectionDrag.cancelConnectionDrag();
});

let positionUpdateTimer: ReturnType<typeof setTimeout> | undefined;

onNodeDragStop(({ node: flowNode }) => {
  const node = (flowNode.data as { node: Node }).node;
  node.position = { x: flowNode.position.x, y: flowNode.position.y };

  if (positionUpdateTimer) clearTimeout(positionUpdateTimer);
  positionUpdateTimer = setTimeout(() => {
    void nodeService.updateNode(node.id, node);
  }, 300);
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

// --- delete key -----------------------------------------------------------

function handleKeydown(event: KeyboardEvent): void {
  const board = currentCloudBoard.value;
  if (event.key !== 'Delete' || !board) return;

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

  void confirmAndDeleteNodesAndConnections(selectedNodeIds, connectionsToDelete).then((success) => {
    if (!success) return;
    board.nodes = board.nodes.filter((node) => !selectedNodeIds.includes(node.id));
    board.connections = board.connections.filter((c) => !connectionsToDelete.includes(c.id));
    removeNodes(selectedNodeIds);
    removeEdges(connectionsToDelete);
  });
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
      />
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
