import type { InjectionKey, Ref } from 'vue';

/** Lets the canvas open a connection's label editor (on edge double-click) and save the result. */
export interface ConnectionLabelEditing {
  /** The connection whose label editor is open, if any. */
  editingId: Ref<string | undefined>;
  save(connectionId: string, label: string): void;
  stop(connectionId: string): void;
}

export const connectionLabelEditingKey: InjectionKey<ConnectionLabelEditing> = Symbol('connectionLabelEditing');
