import { inject, Injectable } from '@angular/core';
import { Connector, ConnectorPosition, ConnectorType } from '../data/cloudboard';
import { map, Observable } from 'rxjs';
import { mapConnectorDtoToConnector, mapConnectorToConnectorDto } from '../data/mapper';
import { ApiClientService, ConnectorDto } from './api-client-service';

@Injectable({
  providedIn: 'root'
})
export class ConnectorService {
  private apiClient: ApiClientService = inject(ApiClientService);

  constructor() { }

  public createConnector(nodeId: string, connector: Connector): Observable<Connector> {
    const dto = mapConnectorToConnectorDto(connector);
    return this.apiClient.createConnector(nodeId, dto).pipe(
      map((newDto: ConnectorDto) => mapConnectorDtoToConnector(newDto))
    );
  }

  public deleteConnection(connectorId: string): Observable<boolean> {
    return this.apiClient.deleteConnector(connectorId);
  }
}
