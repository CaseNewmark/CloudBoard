import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { setHubConnectionIdProvider } from './apiClient';
import { getAccessToken } from './token';

// One shared hub connection for the whole app. The API broadcasts every change made
// through REST to the other viewers of the board; this connection's id is sent with
// each request (see apiClient) so the server doesn't echo our own changes back.

let connection: HubConnection | null = null;
let starting: Promise<void> | null = null;

export function getHubConnection(): HubConnection {
  if (!connection) {
    connection = new HubConnectionBuilder()
      .withUrl('/hubs/cloudboard', { accessTokenFactory: () => getAccessToken() ?? '' })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();
    setHubConnectionIdProvider(getHubConnectionId);
  }
  return connection;
}

export async function ensureHubConnected(): Promise<HubConnection> {
  const hub = getHubConnection();
  if (hub.state === HubConnectionState.Disconnected) {
    starting ??= hub.start().finally(() => {
      starting = null;
    });
  }
  if (starting) await starting;
  return hub;
}

/** The current hub connection id, sent to the API so our own changes aren't broadcast back to us. */
export function getHubConnectionId(): string | null {
  return connection?.state === HubConnectionState.Connected ? connection.connectionId : null;
}

export async function stopHubConnection(): Promise<void> {
  if (connection && connection.state !== HubConnectionState.Disconnected) {
    await connection.stop();
  }
}
