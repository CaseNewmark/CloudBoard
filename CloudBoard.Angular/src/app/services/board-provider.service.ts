import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CloudBoard } from '../data/cloudboard';

@Injectable({
  providedIn: 'root'
})
export class BoardProviderService {
  createCloudBoard() {
    throw new Error('Method not implemented.');
  }
  private readonly apiUrl = 'http://localhost:4200/api';

  private currentCloudBoard: CloudBoard | undefined;

  private createCloudboardDocument: CloudBoard = {
    id: undefined,
    name: 'test', 
    content: 'aasdd',
  };

  constructor(private http: HttpClient) {}

  listCloudBoards(): Observable<CloudBoard[]> {
    return this.http.get<CloudBoard[]>(`${this.apiUrl}/cloudboard`);
  }

  getCloudBoardById(boardId: string): Observable<any> {
    return this.http.get<CloudBoard>(`${this.apiUrl}/cloudboard/${boardId}`);
  }

  createNewCloudBoard(): Observable<any> {
    return this.http.post<CloudBoard>(`${this.apiUrl}/cloudboard`, this.createCloudboardDocument);
  }

  saveCloudBoard(): Observable<any> {
    if (!this.currentCloudBoard) {
      throw new Error('No current cloud board to save');
    }
    return this.http.put<CloudBoard>(`${this.apiUrl}/cloudboard/${this.currentCloudBoard.id}`, this.currentCloudBoard);
  }
}
