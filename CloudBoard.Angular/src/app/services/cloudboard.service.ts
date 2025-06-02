import { inject, Injectable } from '@angular/core';
import { CloudBoard } from '../data/cloudboard';
import { Observable, ReplaySubject, map, tap } from 'rxjs';
import { ApiClientService, CloudBoardDto } from './api-client-service';
import { mapCloudBoardDtoToCloudBoard, mapCloudBoardToCloudBoardDto } from '../data/mapper';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class CloudboardService {
  private apiClient: ApiClientService = inject(ApiClientService);
  private messageService: MessageService = inject(MessageService);

  constructor() { }

  public listCloudBoards(): Observable<CloudBoard[]> {
    return this.apiClient.getAllCloudBoards().pipe(
      map((dtos: CloudBoardDto[]) => dtos.map((dto: CloudBoardDto) => mapCloudBoardDtoToCloudBoard(dto)))
    );
  }
  
  public loadCloudBoardById(cloudboardId: string): Observable<CloudBoard> {
    return this.apiClient.getCloudBoardById(cloudboardId).pipe(
      map((dto: CloudBoardDto) => mapCloudBoardDtoToCloudBoard(dto)),
      tap((cloudboard: CloudBoard) => this.messageService.add({
                                            severity: 'info',
                                            summary: 'Board Loaded',
                                            detail: `CloudBoard ${cloudboard.name} loaded successfully`}),
          (error) => this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: `Failed to load CloudBoard: ${error.message || 'Unknown error'}`}))
    );
  }
  
  public createCloudBoard(cloudboard: CloudBoard): Observable<CloudBoard> {
    const dto = mapCloudBoardToCloudBoardDto(cloudboard);
    return this.apiClient.createCloudBoard(dto).pipe(
      map((newDto: CloudBoardDto) => mapCloudBoardDtoToCloudBoard(newDto))
    );
  }

  public saveCloudBoard(currentCloudBoard: CloudBoard): Observable<boolean> {
    return Observable.create((observer: any) => {
      observer.next(true);
      observer.complete();  
    });
  }

  public deleteCloudBoard(cloudboardId: string): Observable<boolean> {
    return this.apiClient.deleteCloudBoard(cloudboardId);
  }
}
