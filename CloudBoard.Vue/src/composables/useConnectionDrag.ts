import { type Ref, ref } from 'vue';
import { type CloudBoard, type Connection, type Connector, ConnectorPosition, ConnectorType, type Node } from '@/models/cloudboard';
import * as connectorService from '@/services/connectorService';
import * as connectionService from '@/services/connectionService';

/**
 * Reproduces CloudBoard.Angular's free-floating, multi-connector-per-side connection
 * model (each of a node's 4 sides is a drop zone that grows a temporary connector dot
 * on hover, which becomes real once a connection is actually drawn from/to it) on top
 * of Vue Flow's Handle-based connections. Instantiated once per CloudboardView and
 * provided down to every CloudboardNode.
 */
export function useConnectionDrag(currentCloudBoard: Ref<CloudBoard | undefined>) {
  const connectionDragging = ref(false);
  const connectionSource = ref<{ node: Node; connector: Connector } | undefined>();
  const connectionDestination = ref<{ node: Node; connector: Connector } | undefined>();

  function onConnectorBarMouseEnter(node: Node, position: ConnectorPosition): void {
    const type = connectionDragging.value ? ConnectorType.In : ConnectorType.Out;
    const connector: Connector = {
      id: `temp-${type.toLowerCase()}-${node.id}`,
      type,
      position,
      name: 'temp',
    };
    if (!connectionDragging.value) {
      connectionSource.value = { node, connector };
    } else {
      connectionDestination.value = { node, connector };
    }
  }

  function onConnectorBarMouseLeave(): void {
    if (!connectionDragging.value && connectionSource.value) {
      connectionSource.value = undefined;
    } else if (connectionDragging.value && connectionDestination.value) {
      connectionDestination.value = undefined;
    }
  }

  function getConnectorsForNodeByPosition(node: Node, position: ConnectorPosition): Connector[] {
    const connectors = [...node.connectors];
    if (connectionSource.value?.connector && connectionSource.value.node.id === node.id) {
      connectors.push(connectionSource.value.connector);
    }
    if (connectionDestination.value?.connector && connectionDestination.value.node.id === node.id) {
      connectors.push(connectionDestination.value.connector);
    }
    return connectors.filter((connector) => connector.position === position);
  }

  async function finishConnectionDrag(): Promise<Connection | undefined> {
    connectionDragging.value = false;

    const board = currentCloudBoard.value;
    const source = connectionSource.value;
    const destination = connectionDestination.value;
    let createdConnection: Connection | undefined;

    if (board && source && destination) {
      source.connector.id = '';
      destination.connector.id = '';

      const [sourceConnector, destinationConnector] = await Promise.all([
        connectorService.createConnector(source.node.id, source.connector),
        connectorService.createConnector(destination.node.id, destination.connector),
      ]);

      source.node.connectors.push(sourceConnector);
      destination.node.connectors.push(destinationConnector);

      createdConnection = await connectionService.createConnection(board.id, {
        id: '',
        fromConnectorId: sourceConnector.id,
        toConnectorId: destinationConnector.id,
      });
      board.connections.push(createdConnection);
    }

    connectionSource.value = undefined;
    connectionDestination.value = undefined;

    return createdConnection;
  }

  function cancelConnectionDrag(): void {
    connectionDragging.value = false;
    connectionSource.value = undefined;
    connectionDestination.value = undefined;
  }

  return {
    connectionDragging,
    connectionSource,
    connectionDestination,
    onConnectorBarMouseEnter,
    onConnectorBarMouseLeave,
    getConnectorsForNodeByPosition,
    finishConnectionDrag,
    cancelConnectionDrag,
  };
}

export type ConnectionDrag = ReturnType<typeof useConnectionDrag>;
export const connectionDragInjectionKey = Symbol('connectionDrag');
