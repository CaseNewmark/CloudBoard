import { type Ref, unref } from 'vue';
import * as nodeService from '@/services/nodeService';
import type { Node } from '@/models/cloudboard';

/** Vue equivalent of Angular's BaseNodeComponent: debounced property updates shared by every node type. */
export function useNodeProperty(node: Ref<Node | undefined> | (() => Node | undefined)) {
  let propertyUpdateTimer: ReturnType<typeof setTimeout> | null = null;

  function resolveNode(): Node | undefined {
    return typeof node === 'function' ? node() : unref(node);
  }

  function updateProperty(key: string, value: any): void {
    const current = resolveNode();
    if (!current?.properties) return;

    current.properties[key] = value;

    if (propertyUpdateTimer) clearTimeout(propertyUpdateTimer);
    propertyUpdateTimer = setTimeout(() => {
      void nodeService.updateNode(current.id, current);
    }, 500);
  }

  function getProperty<T>(key: string, defaultValue: T): T {
    const current = resolveNode();
    if (current?.properties && current.properties[key] !== undefined) {
      return current.properties[key] as T;
    }
    return defaultValue;
  }

  return { updateProperty, getProperty };
}
