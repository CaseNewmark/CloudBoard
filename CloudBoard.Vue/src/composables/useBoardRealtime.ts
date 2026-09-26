import { onUnmounted, ref } from 'vue';
import type { ConnectionDto, NodeDto } from '@/services/apiClient';
import { ensureHubConnected, getHubConnection } from '@/services/realtime';
import { mapConnectionDtoToConnection, mapNodeDtoToNode } from '@/models/mapper';
import type { Connection, Node } from '@/models/cloudboard';

export interface PresenceUser {
  userId: string;
  name: string;
}

export interface BoardRealtimeHandlers {
  onNodeCreated(node: Node): void;
  onNodeUpdated(node: Node): void;
  onNodeDeleted(nodeId: string): void;
  onConnectionCreated(connection: Connection): void;
  onConnectionUpdated(connection: Connection): void;
  onConnectionDeleted(connectionId: string): void;
  onBoardUpdated(board: { name: string; description?: string | null }): void;
  /** The board was deleted, or the current user's access to it was revoked. */
  onBoardGone(reason: 'deleted' | 'revoked'): void;
  /** Called after a reconnect; events may have been missed, so the board should be reloaded. */
  onResync(): void;
}

/**
 * Keeps the open board in sync with other viewers. The server sends every event as
 * (boardId, payload); events for any board other than the joined one are ignored.
 */
export function useBoardRealtime(handlers: BoardRealtimeHandlers) {
  const presence = ref<PresenceUser[]>([]);
  let joinedBoardId: string | undefined;

  const hub = getHubConnection();

  function forBoard<T>(handler: (payload: T) => void) {
    return (boardId: string, payload: T) => {
      if (joinedBoardId && boardId.toLowerCase() === joinedBoardId) handler(payload);
    };
  }

  const subscriptions: Record<string, (boardId: string, payload: any) => void> = {
    NodeCreated: forBoard<NodeDto>((dto) => handlers.onNodeCreated(mapNodeDtoToNode(dto))),
    NodeUpdated: forBoard<NodeDto>((dto) => handlers.onNodeUpdated(mapNodeDtoToNode(dto))),
    NodeDeleted: forBoard<string>((nodeId) => handlers.onNodeDeleted(nodeId)),
    ConnectionCreated: forBoard<ConnectionDto>((dto) => handlers.onConnectionCreated(mapConnectionDtoToConnection(dto))),
    ConnectionUpdated: forBoard<ConnectionDto>((dto) => handlers.onConnectionUpdated(mapConnectionDtoToConnection(dto))),
    ConnectionDeleted: forBoard<string>((connectionId) => handlers.onConnectionDeleted(connectionId)),
    BoardUpdated: forBoard<{ name: string; description?: string | null }>((board) => handlers.onBoardUpdated(board)),
    BoardDeleted: forBoard<string>(() => leaveAndNotify('deleted')),
    AccessRevoked: forBoard<string>(() => leaveAndNotify('revoked')),
    PresenceChanged: forBoard<PresenceUser[]>((users) => {
      presence.value = users;
    }),
  };

  for (const [event, handler] of Object.entries(subscriptions)) {
    hub.on(event, handler);
  }

  async function onReconnected(): Promise<void> {
    if (!joinedBoardId) return;
    const boardId = joinedBoardId;
    joinedBoardId = undefined;
    await joinBoard(boardId);
    handlers.onResync();
  }
  hub.onreconnected(() => void onReconnected());

  function leaveAndNotify(reason: 'deleted' | 'revoked'): void {
    joinedBoardId = undefined;
    presence.value = [];
    handlers.onBoardGone(reason);
  }

  /** Joins the board's group; call before loading the board so no change is missed in between. */
  async function joinBoard(boardId: string): Promise<void> {
    const id = boardId.toLowerCase();
    if (joinedBoardId === id) return;
    try {
      const connection = await ensureHubConnected();
      presence.value = await connection.invoke<PresenceUser[]>('JoinCloudBoard', id);
      joinedBoardId = id;
    } catch (error) {
      // The board still works without live updates; the REST API is the source of truth.
      console.warn('Could not join live updates for board', boardId, error);
    }
  }

  async function leaveBoard(): Promise<void> {
    const boardId = joinedBoardId;
    joinedBoardId = undefined;
    presence.value = [];
    if (!boardId) return;
    try {
      await getHubConnection().invoke('LeaveCloudBoard', boardId);
    } catch {
      // Disconnected already; the server drops us from the group on disconnect.
    }
  }

  onUnmounted(() => {
    for (const [event, handler] of Object.entries(subscriptions)) {
      hub.off(event, handler);
    }
    void leaveBoard();
  });

  return { presence, joinBoard, leaveBoard };
}
