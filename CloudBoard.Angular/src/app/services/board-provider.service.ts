import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, ReplaySubject } from 'rxjs';
import { CloudBoard } from '../data/cloudboard';
import { tap } from 'rxjs/operators';
import { Guid } from 'guid-typescript';

@Injectable({
  providedIn: 'root'
})
export class BoardProviderService {
  private readonly apiUrl = 'http://localhost:4200/api';

  public cloudBoardLoaded = new ReplaySubject<CloudBoard>();

  private currentCloudBoard: CloudBoard | undefined;

  constructor(private http: HttpClient) { }

  listCloudBoards(): Observable<CloudBoard[]> {
    return this.http.get<CloudBoard[]>(`${this.apiUrl}/cloudboard`);
  }

  loadCloudBoardById(boardId: string): Observable<CloudBoard> {
    return this.http.get<CloudBoard>(`${this.apiUrl}/cloudboard/${boardId}`).pipe(
      tap(response => {
        this.currentCloudBoard = response;
        this.cloudBoardLoaded.next(response);
      },
      (error) => {
        console.error('Error loading cloudboard', error);
      }));
  }

  createNewCloudBoard(): Observable<CloudBoard> {
    let nodeId1: string = Guid.create().toString();
    let nodeId2: string = Guid.create().toString();
    let connectionId1: string = Guid.create().toString();

    let createCloudboardDocument: CloudBoard = {
      id: undefined,
      name: 'full',
      nodes: [
        { id: nodeId1, name: 'Node 1', position: { x: 200, y: 30 } },
        { id: nodeId2, name: 'Node 2', position: { x: 400, y: 40 } }
      ],
      connections: [
        { id: connectionId1, fromConnectorId: nodeId1, toConnectorId: nodeId2 }
      ]
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

  saveCloudBoard(): void {
    if (this.currentCloudBoard) {
      this.http.put<CloudBoard>(`${this.apiUrl}/cloudboard/${this.currentCloudBoard.id}`, this.currentCloudBoard).pipe(
        tap(response => { 
          console.log('Cloudboard saved successfully', response); 
        },
        (error) => { 
          console.error('Error saving cloudboard', error); 
        })).subscribe();
    }
  }

  deleteCloudBoard(boardId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/cloudboard/${boardId}`).pipe(
      tap(response => { 
        console.log('Cloudboard deleted successfully'); 
      },
      (error) => { console.error('Error deleting cloudboard', error);

      }));
  }
}
