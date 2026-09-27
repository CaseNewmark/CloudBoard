<script setup lang="ts">
import Toolbar from 'primevue/toolbar';
import Button from 'primevue/button';
import { inject } from 'vue';
import { useFlowControlStore } from '@/stores/flowControl';
import { boardHistoryInjectionKey } from '@/composables/useBoardHistory';

const flowControlStore = useFlowControlStore();
const history = inject(boardHistoryInjectionKey, undefined);
const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);
const modifier = isMac ? '⌘' : 'Ctrl+';
</script>

<template>
  <Toolbar class="mt-3 board-toolbar">
    <template #center>
      <template v-if="history">
        <Button
          icon="pi pi-fw pi-undo"
          text
          severity="secondary"
          :disabled="!history.canUndo.value"
          :aria-label="history.undoLabel.value ? `Undo ${history.undoLabel.value}` : 'Undo'"
          v-tooltip.right="history.undoLabel.value ? `Undo: ${history.undoLabel.value} (${modifier}Z)` : `Undo (${modifier}Z)`"
          @click="history.undo()"
        />
        <Button
          icon="pi pi-fw pi-undo"
          class="redo-button"
          text
          severity="secondary"
          :disabled="!history.canRedo.value"
          :aria-label="history.redoLabel.value ? `Redo ${history.redoLabel.value}` : 'Redo'"
          v-tooltip.right="history.redoLabel.value ? `Redo: ${history.redoLabel.value} (${modifier}${isMac ? '⇧Z' : 'Y'})` : 'Redo'"
          @click="history.redo()"
        />
      </template>
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
/* PrimeIcons has no redo icon; mirror the undo one. */
.redo-button :deep(.pi-undo) {
  transform: scaleX(-1);
}

/* The class lands on PrimeVue's .p-toolbar root itself (unlike the Angular version,
   where a host element wrapped it), so style the root directly. */
.board-toolbar {
  position: fixed;
  z-index: 10;
  margin: 2em 3em;
  display: inline-flex;
  padding: 0;
}

.board-toolbar :deep(.p-toolbar-center) {
  flex-direction: column;
}
</style>
