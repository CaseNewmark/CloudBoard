import { HubConnection, HubConnectionBuilder, HubConnectionState, type IRetryPolicy, LogLevel } from '@microsoft/signalr';
import { getValidAccessToken, setHubConnectionIdProvider } from './apiClient';

// One shared hub connection for the whole app. The API broadcasts every change made
// through REST to the other viewers of the board; this connection's id is sent with
// each request (see apiClient) so the server doesn't echo our own changes back.

let connection: HubConnection | null = null;

// Retry quickly at first, then keep trying once a minute instead of giving up after
// ~40s (SignalR's default), so live updates resume after sleep or a network drop.
const retryPolicy: IRetryPolicy = {
  nextRetryDelayInMilliseconds: ({ previousRetryCount }) => [0, 2000, 10000, 30000][previousRetryCount] ?? 60000,
};
let starting: Promise<void> | null = null;

export function getHubConnection(): HubConnection {
  if (!connection) {
    connection = new HubConnectionBuilder()
      // Called on every (re)connect, so an expired token is refreshed before it's sent.
      .withUrl('/hubs/cloudboard', { accessTokenFactory: async () => (await getValidAccessToken()) ?? '' })
      .withAutomaticReconnect(retryPolicy)
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
