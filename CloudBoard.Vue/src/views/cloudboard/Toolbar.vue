<script setup lang="ts">
import Toolbar from 'primevue/toolbar';
import Button from 'primevue/button';
import { useFlowControlStore } from '@/stores/flowControl';

const flowControlStore = useFlowControlStore();
</script>

<template>
  <Toolbar class="mt-3 board-toolbar">
    <template #center>
      <Button icon="pi pi-fw pi-search-plus" text severity="secondary" @click="flowControlStore.zoomIn()" />
      <Button icon="pi pi-fw pi-search-minus" text severity="secondary" @click="flowControlStore.zoomOut()" />
      <Button icon="pi pi-fw pi-times-circle" text severity="secondary" @click="flowControlStore.resetZoom()" />
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
