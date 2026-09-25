import { apiClient } from './apiClient';
import { mapConnectionDtoToConnection, mapConnectionToConnectionDto } from '@/models/mapper';
import type { Connection } from '@/models/cloudboard';

export async function createConnection(cloudboardId: string, connection: Connection): Promise<Connection> {
  const dto = mapConnectionToConnectionDto(connection);
  const newDto = await apiClient.createConnection(cloudboardId, dto);
  return mapConnectionDtoToConnection(newDto);
}

export async function deleteConnection(connectionId: string): Promise<boolean> {
  return apiClient.deleteConnection(connectionId);
}
