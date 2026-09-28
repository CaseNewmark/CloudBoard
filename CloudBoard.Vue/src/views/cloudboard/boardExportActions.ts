import type { InjectionKey } from 'vue';

export interface BoardExportActions {
  exportPng(): Promise<void>;
  exportJson(): Promise<void>;
}

export const boardExportActionsKey: InjectionKey<BoardExportActions> = Symbol('boardExportActions');
