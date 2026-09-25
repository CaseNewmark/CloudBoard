<script setup lang="ts">
import { computed, inject } from 'vue';
import { Handle, Position } from '@vue-flow/core';
import type { NodeProps } from '@vue-flow/core';
import { type Connector, ConnectorPosition, ConnectorType, type Node, NodeType } from '@/models/cloudboard';
import { type ConnectionDrag, connectionDragInjectionKey } from '@/composables/useConnectionDrag';
import SimpleNote from './nodes/SimpleNote.vue';
import CardNode from './nodes/CardNode.vue';
import LinkCollection from './nodes/LinkCollection.vue';
import ImageNode from './nodes/ImageNode.vue';
import CodeBlock from './nodes/CodeBlock.vue';

const props = defineProps<NodeProps<{ node: Node }>>();

const connectionDrag = inject(connectionDragInjectionKey) as ConnectionDrag;

const node = computed(() => props.data.node);

const contentComponents: Record<NodeType, unknown> = {
  [NodeType.Note]: SimpleNote,
  [NodeType.Card]: CardNode,
  [NodeType.LinkCollection]: LinkCollection,
  [NodeType.ImageNode]: ImageNode,
  [NodeType.CodeBlock]: CodeBlock,
};
const contentComponent = computed(() => contentComponents[node.value.type] || SimpleNote);

const positions = Object.values(ConnectorPosition);

const vueFlowPosition: Record<ConnectorPosition, Position> = {
  [ConnectorPosition.Top]: Position.Top,
  [ConnectorPosition.Bottom]: Position.Bottom,
  [ConnectorPosition.Left]: Position.Left,
  [ConnectorPosition.Right]: Position.Right,
};

function connectorsFor(position: ConnectorPosition): Connector[] {
  return connectionDrag.getConnectorsForNodeByPosition(node.value, position);
}

function handleType(connector: Connector): 'source' | 'target' {
  return connector.type === ConnectorType.In ? 'target' : 'source';
}
</script>

<template>
  <div class="cloudboard-node-content">
  <component :is="contentComponent" :node="node" />

  <div class="connector-bars">
    <div
      v-for="position in positions"
      :key="position"
      class="connector-bar"
      :class="position.toLowerCase()"
      :data-node-id="props.id"
      :data-position="position"
    >
      <Handle
        v-for="connector in connectorsFor(position)"
        :key="connector.id"
        :id="connector.id"
        :type="handleType(connector)"
        :position="vueFlowPosition[position]"
        class="connector"
        :class="position.toLowerCase()"
      />
    </div>
  </div>
  </div>
</template>

<style scoped>
.cloudboard-node-content {
  position: relative;
  height: 100%;
}

.connector-bars {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: 0;

  display: grid;
  grid-template-rows: [top] 0 [middle] auto [bottom] 0;
  grid-template-columns: [left] 0 [center] auto [right] 0;
}

.connector-bar {
  display: flex;
  justify-content: center;
  align-items: center;
}

.connector-bar.left,
.connector-bar.right {
  grid-row: middle;
  justify-self: center;
  align-self: stretch;

  min-width: 2em;
  flex-direction: column;
  row-gap: 0.3em;
}

.connector-bar.left {
  grid-column: left;
}

.connector-bar.right {
  grid-column: right;
}

.connector-bar.top,
.connector-bar.bottom {
  grid-column: center;
  justify-self: stretch;
  align-self: center;

  min-height: 2em;
  flex-direction: row;
  column-gap: 0.3em;
}

.connector-bar.top {
  grid-row: top;
}

.connector-bar.bottom {
  grid-row: bottom;
}

.connector-bars :deep(.connector) {
  position: static;
  width: 20px;
  height: 20px;
  border: 1px solid gray;
  border-radius: 50%;
  border-width: 2px;
  background-color: #00ff0033;
  transform: none;
}

.connector-bars :deep(.connector.left) {
  background-color: #cfc;
}

.connector-bars :deep(.connector.right) {
  background-color: #ffc;
}

.connector-bars :deep(.connector.top) {
  background-color: #fcc;
}

.connector-bars :deep(.connector.bottom) {
  background-color: #fcc;
}
</style>
