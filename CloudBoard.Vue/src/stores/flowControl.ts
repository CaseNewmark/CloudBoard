import { ref } from 'vue';
import { defineStore } from 'pinia';

export enum ZoomAction {
  ZoomIn,
  ZoomOut,
  Reset,
}

/**
 * A tiny event bus between the Toolbar (which triggers zoom actions) and the
 * canvas (which owns the Vue Flow instance and performs them). `sequence` is
 * bumped on every call so the canvas's watcher fires even when the same
 * action is requested twice in a row.
 */
export const useFlowControlStore = defineStore('flowControl', () => {
  const action = ref(ZoomAction.Reset);
  const sequence = ref(0);

  function trigger(next: ZoomAction) {
    action.value = next;
    sequence.value++;
  }

  return {
    action,
    sequence,
    zoomIn: () => trigger(ZoomAction.ZoomIn),
    zoomOut: () => trigger(ZoomAction.ZoomOut),
    resetZoom: () => trigger(ZoomAction.Reset),
  };
});
