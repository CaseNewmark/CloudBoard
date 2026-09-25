import { apiClient, type CloudBoardDto } from './apiClient';
import { mapCloudBoardDtoToCloudBoard, mapCloudBoardToCloudBoardDto } from '@/models/mapper';
import type { CloudBoard } from '@/models/cloudboard';

export async function listCloudBoards(): Promise<CloudBoard[]> {
  const dtos = await apiClient.getAllCloudBoards();
  return dtos.map((dto: CloudBoardDto) => mapCloudBoardDtoToCloudBoard(dto));
}

export async function loadCloudBoardById(cloudboardId: string): Promise<CloudBoard> {
  const dto = await apiClient.getCloudBoardById(cloudboardId);
  return mapCloudBoardDtoToCloudBoard(dto);
}

export async function createCloudBoard(cloudboard: CloudBoard): Promise<CloudBoard> {
  const dto = mapCloudBoardToCloudBoardDto(cloudboard);
  const newDto = await apiClient.createCloudBoard(dto);
  return mapCloudBoardDtoToCloudBoard(newDto);
}

export async function deleteCloudBoard(cloudboardId: string): Promise<boolean> {
  return apiClient.deleteCloudBoard(cloudboardId);
}

export async function updateCloudBoard(cloudBoard: CloudBoard): Promise<CloudBoard> {
  const dto = mapCloudBoardToCloudBoardDto(cloudBoard);
  const newDto = await apiClient.updateCloudBoard(cloudBoard.id, dto);
  return mapCloudBoardDtoToCloudBoard(newDto);
}

// Sharing isn't implemented on the backend yet - kept as stubs matching the
// Angular service so the edit dialog has something to call.
export async function getSharedUsers(_cloudBoardId: string): Promise<string[]> {
  return [];
}

export async function updateSharing(_cloudBoardId: string, _sharedUsers: string[]): Promise<void> {
  // no-op until the backend supports it
}
