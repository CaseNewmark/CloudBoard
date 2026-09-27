<script setup lang="ts">
import Toolbar from 'primevue/toolbar';
import Button from 'primevue/button';
import { useFlowControlStore } from '@/stores/flowControl';

const flowControlStore = useFlowControlStore();
</script>

<template>
  <Toolbar class="mt-3 board-toolbar">
    <template #center>
      <Button icon="pi pi-fw pi-search-plus" text severity="secondary" aria-label="Zoom in" v-tooltip.right="'Zoom in'" @click="flowControlStore.zoomIn()" />
      <Button icon="pi pi-fw pi-search-minus" text severity="secondary" aria-label="Zoom out" v-tooltip.right="'Zoom out'" @click="flowControlStore.zoomOut()" />
      <Button icon="pi pi-fw pi-times-circle" text severity="secondary" aria-label="Fit board to screen" v-tooltip.right="'Fit to screen'" @click="flowControlStore.resetZoom()" />
      <Button
        icon="pi pi-fw pi-th-large"
        text
        :severity="flowControlStore.snapToGrid ? 'primary' : 'secondary'"
        :aria-pressed="flowControlStore.snapToGrid"
        v-tooltip.right="flowControlStore.snapToGrid ? 'Snap to grid: on' : 'Snap to grid: off'"
        aria-label="Snap to grid"
        @click="flowControlStore.snapToGrid = !flowControlStore.snapToGrid"
      />
      <Button
        icon="pi pi-fw pi-map"
        text
        :severity="flowControlStore.minimapVisible ? 'primary' : 'secondary'"
        :aria-pressed="flowControlStore.minimapVisible"
        v-tooltip.right="flowControlStore.minimapVisible ? 'Hide minimap' : 'Show minimap'"
        aria-label="Minimap"
        @click="flowControlStore.minimapVisible = !flowControlStore.minimapVisible"
      />
    </template>
  </Toolbar>
</template>

<style scoped>
.board-toolbar {
  position: fixed;
  z-index: 10;
  margin: 2em 3em;
  pointer-events: none;
}

.board-toolbar :deep(.p-toolbar) {
  display: inline-flex;
  padding: 0;
  pointer-events: all;
}

.board-toolbar :deep(.p-toolbar-center) {
  flex-direction: column;
}
</style>
