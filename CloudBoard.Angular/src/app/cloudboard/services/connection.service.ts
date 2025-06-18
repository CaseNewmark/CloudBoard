import { inject, Injectable } from '@angular/core';
import { Connection } from '../models/cloudboard';
import { map, Observable } from 'rxjs';
import { mapConnectionDtoToConnection, mapConnectionToConnectionDto } from '../models/mapper';
import { ApiClientService, ConnectionDto } from '../../services/api-client-service';

@Injectable({
  providedIn: 'root'
})
export class ConnectionService {
  private apiClient: ApiClientService = inject(ApiClientService);

  constructor() { }

  public createConnection(cloudboardId: string, connection: Connection): Observable<Connection> {
    const dto = mapConnectionToConnectionDto(connection);
    return this.apiClient.createConnection(cloudboardId, dto).pipe(
      map((newDto: ConnectionDto) => mapConnectionDtoToConnection(newDto))
    );
  }

  public deleteConnection(connectionId: string): Observable<boolean> {
    return this.apiClient.deleteConnection(connectionId);
  }
}
