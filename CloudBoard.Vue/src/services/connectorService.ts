import { apiClient } from './apiClient';
import { mapConnectorDtoToConnector, mapConnectorToConnectorDto } from '@/models/mapper';
import type { Connector } from '@/models/cloudboard';

export async function createConnector(nodeId: string, connector: Connector): Promise<Connector> {
  const dto = mapConnectorToConnectorDto(connector);
  const newDto = await apiClient.createConnector(nodeId, dto);
  return mapConnectorDtoToConnector(newDto);
}

export async function deleteConnector(connectorId: string): Promise<boolean> {
  return apiClient.deleteConnector(connectorId);
}
