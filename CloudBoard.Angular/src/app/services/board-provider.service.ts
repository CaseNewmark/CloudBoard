import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, ReplaySubject } from 'rxjs';
import { CloudBoard, Connection, Connector, ConnectorPosition, ConnectorType, NodeType } from '../data/cloudboard';
import { tap } from 'rxjs/operators';
import { Guid } from 'guid-typescript';

@Injectable({
  providedIn: 'root'
})
export class BoardProviderService {
  private readonly apiUrl = 'http://localhost:4200/api';

  public cloudBoardLoaded = new ReplaySubject<CloudBoard>();

  public currentCloudBoard: CloudBoard | undefined;

  constructor(private http: HttpClient) { }

  // CloudBoard API Methods
  listCloudBoards(): Observable<CloudBoard[]> {
    return this.http.get<CloudBoard[]>(`${this.apiUrl}/cloudboard`);
  }

  loadCloudBoardById(boardId: Guid): Observable<CloudBoard> {
    return this.http.get<CloudBoard>(`${this.apiUrl}/cloudboard/${boardId.toString()}`).pipe(
      tap(response => {
        this.currentCloudBoard = response;
        this.currentCloudBoard.tempid = this.currentCloudBoard.id?.toString();
        this.currentCloudBoard.nodes.forEach(node => {
          node.tempid = node.id;
          node.connectors.forEach(connector => {
            connector.tempid = connector.id;
          });
        });
        this.cloudBoardLoaded.next(response);
      },
      (error) => {
        console.error('Error loading cloudboard', error);
      }));
  }
  createNewCloudBoard(): Observable<CloudBoard> {
    let createCloudboardDocument: CloudBoard = {
      id: undefined,
      name: 'Empty Cloudboard',
      nodes: [],
      connections: []
    };
    return this.http.post<CloudBoard>(`${this.apiUrl}/cloudboard`, createCloudboardDocument).pipe(
      tap(response => {
        this.currentCloudBoard = response;
        this.cloudBoardLoaded.next(response);
      },
      (error) => {
        console.error('Error creating cloudboard', error);
      }));
  }
  saveCloudBoard(): Observable<CloudBoard> {
    if (!this.currentCloudBoard) {
      return new Observable(observer => {
        observer.error(new Error('No CloudBoard currently loaded'));
        observer.complete();
      });
    }
    
    return this.http.put<CloudBoard>(`${this.apiUrl}/cloudboard/${this.currentCloudBoard.id}`, this.currentCloudBoard).pipe(
      tap(response => { 
        console.log('Cloudboard saved successfully', response); 
      },
      (error) => { 
        console.error('Error saving cloudboard', error); 
      }));
  }

  deleteCloudBoard(boardId: Guid): Observable<any> {
    return this.http.delete(`${this.apiUrl}/cloudboard/${boardId.toString()}`).pipe(
      tap(response => { 
        console.log('Cloudboard deleted successfully'); 
      },
      (error) => { console.error('Error deleting cloudboard', error);

      }));
  }

  // Node API Methods
  createNode(nodeDto: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/node`, nodeDto).pipe(
      tap(response => {
        console.log('Node created successfully', response);
        // If we have a current CloudBoard, add the new node to it
        if (this.currentCloudBoard) {
          this.currentCloudBoard.nodes.push(response);
          this.cloudBoardLoaded.next(this.currentCloudBoard);
        }
      },
      (error) => {
        console.error('Error creating node', error);
      })
    );
  }

  updateNode(nodeId: string, nodeDto: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/node/${nodeId}`, nodeDto).pipe(
      tap(response => {
        console.log('Node updated successfully', response);
        // If we have a current CloudBoard, update the node in it
        if (this.currentCloudBoard) {
          const index = this.currentCloudBoard.nodes.findIndex(n => n.id === nodeId);
          if (index !== -1) {
            this.currentCloudBoard.nodes[index] = response;
            this.cloudBoardLoaded.next(this.currentCloudBoard);
          }
        }
      },
      (error) => {
        console.error('Error updating node', error);
      })
    );
  }

  deleteNode(nodeId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/node/${nodeId}`).pipe(
      tap(response => {
        console.log('Node deleted successfully');
        // If we have a current CloudBoard, remove the node from it
        if (this.currentCloudBoard) {
          this.currentCloudBoard.nodes = this.currentCloudBoard.nodes.filter(n => n.id !== nodeId);
          this.cloudBoardLoaded.next(this.currentCloudBoard);
        }
      },
      (error) => {
        console.error('Error deleting node', error);
      })
    );
  }

  // Connector API Methods
  getConnectorsByNodeId(nodeId: string): Observable<Connector[]> {
    return this.http.get<Connector[]>(`${this.apiUrl}/node/${nodeId}/connectors`).pipe(
      tap(response => {
        console.log('Connectors retrieved successfully', response);
      },
      (error) => {
        console.error('Error retrieving connectors', error);
      })
    );
  }

  createConnector(connectorDto: any): Observable<Connector> {
    return this.http.post<Connector>(`${this.apiUrl}/connector`, connectorDto).pipe(
      tap(response => {
        console.log('Connector created successfully', response);
        // If we have a current CloudBoard, add the new connector to the appropriate node
        if (this.currentCloudBoard) {
          const nodeIndex = this.currentCloudBoard.nodes.findIndex(n => n.id === connectorDto.nodeId);
          if (nodeIndex !== -1) {
            this.currentCloudBoard.nodes[nodeIndex].connectors.push(response);
            this.cloudBoardLoaded.next(this.currentCloudBoard);
          }
        }
      },
      (error) => {
        console.error('Error creating connector', error);
      })
    );
  }

  updateConnector(connectorId: string, connectorDto: any): Observable<Connector> {
    return this.http.put<Connector>(`${this.apiUrl}/connector/${connectorId}`, connectorDto).pipe(
      tap(response => {
        console.log('Connector updated successfully', response);
        // If we have a current CloudBoard, update the connector in the appropriate node
        if (this.currentCloudBoard) {
          for (let node of this.currentCloudBoard.nodes) {
            const connectorIndex = node.connectors.findIndex(c => c.id === connectorId);
            if (connectorIndex !== -1) {
              node.connectors[connectorIndex] = response;
              this.cloudBoardLoaded.next(this.currentCloudBoard);
              break;
            }
          }
        }
      },
      (error) => {
        console.error('Error updating connector', error);
      })
    );
  }

  deleteConnector(connectorId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/connector/${connectorId}`).pipe(
      tap(response => {
        console.log('Connector deleted successfully');
        // If we have a current CloudBoard, remove the connector from the appropriate node
        if (this.currentCloudBoard) {
          for (let node of this.currentCloudBoard.nodes) {
            const connectorIndex = node.connectors.findIndex(c => c.id === connectorId);
            if (connectorIndex !== -1) {
              node.connectors.splice(connectorIndex, 1);
              this.cloudBoardLoaded.next(this.currentCloudBoard);
              break;
            }
          }
        }
      },
      (error) => {
        console.error('Error deleting connector', error);
      })
    );
  }

  // Connection API Methods
  getConnectionsByCloudBoardId(cloudBoardId: string): Observable<Connection[]> {
    return this.http.get<Connection[]>(`${this.apiUrl}/cloudboard/${cloudBoardId}/connections`).pipe(
      tap(response => {
        console.log('Connections retrieved successfully', response);
      },
      (error) => {
        console.error('Error retrieving connections', error);
      })
    );
  }

  getConnectionsByConnectorId(connectorId: string): Observable<Connection[]> {
    return this.http.get<Connection[]>(`${this.apiUrl}/connector/${connectorId}/connections`).pipe(
      tap(response => {
        console.log('Connections retrieved successfully', response);
      },
      (error) => {
        console.error('Error retrieving connections', error);
      })
    );
  }

  createConnection(connectionDto: any): Observable<Connection> {
    return this.http.post<Connection>(`${this.apiUrl}/connection`, connectionDto).pipe(
      tap(response => {
        console.log('Connection created successfully', response);
        // If we have a current CloudBoard, add the new connection to it
        if (this.currentCloudBoard) {
          this.currentCloudBoard.connections.push(response);
          this.cloudBoardLoaded.next(this.currentCloudBoard);
        }
      },
      (error) => {
        console.error('Error creating connection', error);
      })
    );
  }

  updateConnection(connectionId: string, connectionDto: any): Observable<Connection> {
    return this.http.put<Connection>(`${this.apiUrl}/connection/${connectionId}`, connectionDto).pipe(
      tap(response => {
        console.log('Connection updated successfully', response);
        // If we have a current CloudBoard, update the connection in it
        if (this.currentCloudBoard) {
          const index = this.currentCloudBoard.connections.findIndex(c => c.id === connectionId);
          if (index !== -1) {
            this.currentCloudBoard.connections[index] = response;
            this.cloudBoardLoaded.next(this.currentCloudBoard);
          }
        }
      },
      (error) => {
        console.error('Error updating connection', error);
      })
    );
  }

  deleteConnection(connectionId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/connection/${connectionId}`).pipe(
      tap(response => {
        console.log('Connection deleted successfully');
        // If we have a current CloudBoard, remove the connection from it
        if (this.currentCloudBoard) {
          this.currentCloudBoard.connections = this.currentCloudBoard.connections.filter(c => c.id !== connectionId);
          this.cloudBoardLoaded.next(this.currentCloudBoard);
        }
      },
      (error) => {
        console.error('Error deleting connection', error);
      })
    );
  }
}
