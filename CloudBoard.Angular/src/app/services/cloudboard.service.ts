import { inject, Injectable } from '@angular/core';
import { CloudBoard } from '../data/cloudboard';
import { Observable, map } from 'rxjs';
import { ApiClientService, CloudBoardDto } from './api-client-service';
import { AutoMapperService } from './automapper.service';

@Injectable({
  providedIn: 'root'
})
export class CloudboardService {

  private apiClient: ApiClientService = inject(ApiClientService);
  private autoMapper: AutoMapperService = inject(AutoMapperService);
  
  public listCloudBoards(): Observable<CloudBoard[]> {
    return this.apiClient.getAllCloudBoards().pipe(
      map(dtos => dtos.map(dto => this.autoMapper.mapCloudBoardDtoToCloudBoard(dto)))
    );
  }
  
    public deleteCloudBoard(cloudboardId: string): Observable<void> {
    return this.apiClient.deleteCloudBoard(cloudboardId).pipe(
      map(() => void 0)
    );
  }

  public loadCloudBoardById(cloudboardId: string): Observable<CloudBoard> {
    return this.apiClient.getCloudBoardById(cloudboardId).pipe(
      map(dto => this.autoMapper.mapCloudBoardDtoToCloudBoard(dto))
    );
  }
  
  public createCloudBoard(cloudboard: CloudBoard): Observable<CloudBoard> {
    const dto = this.autoMapper.mapCloudBoardToCloudBoardDto(cloudboard);
    return this.apiClient.saveCloudBoard(dto).pipe(
      map(responseDto => this.autoMapper.mapCloudBoardDtoToCloudBoard(responseDto))
    );
  }

  constructor() { }
}
