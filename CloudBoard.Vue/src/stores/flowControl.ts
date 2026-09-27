import { ref, watch } from 'vue';
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
// Per-viewer canvas preferences. Storage can be unavailable (private mode, blocked
// site data), so every access is guarded and the defaults always work.
function readPreference(key: string, fallback: boolean): boolean {
  try {
    const stored = localStorage.getItem(key);
    return stored === null ? fallback : stored === 'true';
  } catch {
    return fallback;
  }
}

function writePreference(key: string, value: boolean): void {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    // Not persisted; the setting still applies for this session.
  }
}

export const useFlowControlStore = defineStore('flowControl', () => {
  const action = ref(ZoomAction.Reset);
  const sequence = ref(0);

  const snapToGrid = ref(readPreference('cloudboard.snapToGrid', false));
  const minimapVisible = ref(readPreference('cloudboard.minimapVisible', true));
  watch(snapToGrid, (value) => writePreference('cloudboard.snapToGrid', value));
  watch(minimapVisible, (value) => writePreference('cloudboard.minimapVisible', value));

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
    snapToGrid,
    minimapVisible,
  };
});
