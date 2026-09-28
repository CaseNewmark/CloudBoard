// Hand-written fetch-based API client for the CloudBoard.ApiService backend.
//
// This mirrors CloudBoard.Angular's NSwag-generated api-client-service.ts (same
// routes/DTOs), but targets fetch()/Promises instead of Angular's HttpClient/RxJS
// so it has no framework dependency. Keep it in sync by hand when the API's
// OpenAPI contract changes, or regenerate CloudBoard.Angular's client from
// ../OpenApi/cloudboard-api.json via generator/generate.bat and port the
// endpoint/DTO shapes across.

export interface CloudBoardDto {
  id?: string;
  name?: string;
  description?: string | null;
  createdBy?: string;
  createdAt?: string;
  nodes?: NodeDto[];
  connections?: ConnectionDto[];

  [key: string]: any;
}

export interface BoardImageDto {
  id: string;
  url: string;
  contentType: string;
  size: number;
}

export interface CloudBoardMembersDto {
  emails: string[];
}

export interface ConnectionDto {
  id?: string;
  fromConnectorId: string;
  toConnectorId: string;
  label?: string | null;

  [key: string]: any;
}

export interface ConnectorDto {
  id?: string;
  name?: string;
  position?: string;
  type?: string;

  [key: string]: any;
}

export interface JsonDocument {
  [key: string]: any;
}

export interface NodeDto {
  id?: string;
  type?: string;
  name?: string;
  position?: NodePositionDto;
  connectors?: ConnectorDto[];
  properties?: JsonDocument;

  [key: string]: any;
}

export interface NodePositionDto {
  x?: number;
  y?: number;

  [key: string]: any;
}

export class ApiException extends Error {
  status: number;
  response: string;

  constructor(message: string, status: number, response: string) {
    super(message);
    this.status = status;
    this.response = response;
  }
}

export interface AuthHook {
  ensureValidToken(): Promise<boolean>;
  getAccessToken(): string | null;
  onUnauthorized(): void;
}

let authHook: AuthHook | null = null;
let hubConnectionIdProvider: (() => string | null) | null = null;

/** Lets the API skip broadcasting a change back to the hub connection that made it. */
export function setHubConnectionIdProvider(provider: () => string | null): void {
  hubConnectionIdProvider = provider;
}

/** Wired up once from the auth store at app startup; keeps this module decoupled from Pinia. */
export function setAuthHook(hook: AuthHook): void {
  authHook = hook;
}

/** The access token, refreshed first if it has expired (e.g. after the laptop slept). */
export async function getValidAccessToken(): Promise<string | null> {
  if (!authHook) return null;
  await authHook.ensureValidToken();
  return authHook.getAccessToken();
}

let baseUrl = '';

export function setApiBaseUrl(url: string): void {
  baseUrl = url;
}

/** Sends an authenticated request, refreshing the token and retrying once on 401. */
async function send(method: string, path: string, body?: unknown, accept = 'application/json'): Promise<Response> {
  const url = baseUrl + path;
  const isForm = body instanceof FormData;
  const doFetch = async (): Promise<Response> => {
    const headers: Record<string, string> = { Accept: accept };
    // FormData sets its own multipart Content-Type (with the boundary).
    if (body !== undefined && !isForm) headers['Content-Type'] = 'application/json';

    if (authHook) {
      await authHook.ensureValidToken();
      const token = authHook.getAccessToken();
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }

    const hubConnectionId = hubConnectionIdProvider?.();
    if (hubConnectionId) headers['X-SignalR-Connection-Id'] = hubConnectionId;

    return fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : isForm ? (body as FormData) : JSON.stringify(body),
    });
  };

  let response = await doFetch();

  if (response.status === 401 && authHook) {
    const refreshed = await authHook.ensureValidToken();
    if (refreshed) {
      response = await doFetch();
    } else {
      authHook.onUnauthorized();
    }
  }
  return response;
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const response = await send(method, path, body);

  if (response.status === 204) {
    return null as T;
  }

  const text = await response.text();
  const parsed = text === '' ? null : JSON.parse(text);

  if (!response.ok) {
    throw new ApiException('An unexpected server error occurred.', response.status, text);
  }

  return parsed as T;
}

/** Fetches a binary resource (e.g. a stored image) with the user's credentials. */
async function requestBlob(path: string): Promise<Blob> {
  const response = await send('GET', path, undefined, '*/*');
  if (!response.ok) {
    throw new ApiException('Failed to load the resource.', response.status, await response.text());
  }
  return response.blob();
}

export const apiClient = {
  uploadImage(cloudboardId: string, file: Blob, fileName = 'image'): Promise<BoardImageDto> {
    const form = new FormData();
    form.append('file', file, fileName);
    return request('POST', `/api/cloudboard/${encodeURIComponent(cloudboardId)}/images`, form);
  },

  copyImage(cloudboardId: string, imageId: string): Promise<BoardImageDto> {
    return request('POST', `/api/cloudboard/${encodeURIComponent(cloudboardId)}/images/${encodeURIComponent(imageId)}/copy`);
  },

  getImageBlob(imageId: string): Promise<Blob> {
    return requestBlob(`/api/images/${encodeURIComponent(imageId)}`);
  },

  createCloudBoard(body: CloudBoardDto): Promise<CloudBoardDto> {
    return request('POST', '/api/cloudboard', body);
  },

  getAllCloudBoards(): Promise<CloudBoardDto[]> {
    return request('GET', '/api/cloudboard');
  },

  getCloudBoardById(cloudboardId: string): Promise<CloudBoardDto> {
    return request('GET', `/api/cloudboard/${encodeURIComponent(cloudboardId)}`);
  },

  updateCloudBoard(cloudboardId: string, body: CloudBoardDto): Promise<CloudBoardDto> {
    return request('PUT', `/api/cloudboard/${encodeURIComponent(cloudboardId)}`, body);
  },

  deleteCloudBoard(cloudboardId: string): Promise<boolean> {
    return request('DELETE', `/api/cloudboard/${encodeURIComponent(cloudboardId)}`);
  },

  getCloudBoardMembers(cloudboardId: string): Promise<CloudBoardMembersDto> {
    return request('GET', `/api/cloudboard/${encodeURIComponent(cloudboardId)}/members`);
  },

  updateCloudBoardMembers(cloudboardId: string, body: CloudBoardMembersDto): Promise<CloudBoardMembersDto> {
    return request('PUT', `/api/cloudboard/${encodeURIComponent(cloudboardId)}/members`, body);
  },

  createNode(cloudboardId: string, body: NodeDto): Promise<NodeDto> {
    return request('POST', `/api/cloudboard/${encodeURIComponent(cloudboardId)}/node`, body);
  },

  getNodeById(nodeId: string): Promise<NodeDto> {
    return request('GET', `/api/node/${encodeURIComponent(nodeId)}`);
  },

  updateNode(nodeId: string, body: NodeDto): Promise<NodeDto> {
    return request('PUT', `/api/node/${encodeURIComponent(nodeId)}`, body);
  },

  deleteNode(nodeId: string): Promise<boolean> {
    return request('DELETE', `/api/node/${encodeURIComponent(nodeId)}`);
  },

  createConnector(nodeId: string, body: ConnectorDto): Promise<ConnectorDto> {
    return request('POST', `/api/node/${encodeURIComponent(nodeId)}/connector`, body);
  },

  getConnectorById(connectorId: string): Promise<ConnectorDto> {
    return request('GET', `/api/connector/${encodeURIComponent(connectorId)}`);
  },

  updateConnector(connectorId: string, body: ConnectorDto): Promise<ConnectorDto> {
    return request('PUT', `/api/connector/${encodeURIComponent(connectorId)}`, body);
  },

  deleteConnector(connectorId: string): Promise<boolean> {
    return request('DELETE', `/api/connector/${encodeURIComponent(connectorId)}`);
  },

  getConnectorsByNodeId(nodeId: string): Promise<ConnectorDto[]> {
    return request('GET', `/api/node/${encodeURIComponent(nodeId)}/connectors`);
  },

  createConnection(cloudboardId: string, body: ConnectionDto): Promise<ConnectionDto> {
    return request('POST', `/api/cloudboard/${encodeURIComponent(cloudboardId)}/connection`, body);
  },

  getConnectionsByCloudBoardDocumentId(cloudboardId: string): Promise<ConnectionDto[]> {
    return request('GET', `/api/cloudboard/${encodeURIComponent(cloudboardId)}/connection`);
  },

  getConnectionById(connectionId: string): Promise<ConnectionDto> {
    return request('GET', `/api/connection/${encodeURIComponent(connectionId)}`);
  },

  updateConnection(connectionId: string, body: ConnectionDto): Promise<ConnectionDto> {
    return request('PUT', `/api/connection/${encodeURIComponent(connectionId)}`, body);
  },

  deleteConnection(connectionId: string): Promise<boolean> {
    return request('DELETE', `/api/connection/${encodeURIComponent(connectionId)}`);
  },

  getConnectionsByConnectorId(connectorId: string): Promise<ConnectionDto[]> {
    return request('GET', `/api/connector/${encodeURIComponent(connectorId)}/connections`);
  },
};
