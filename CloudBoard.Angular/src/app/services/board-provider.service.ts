import { Injectable, output, OutputEmitterRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CloudBoard } from '../data/cloudboard';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BoardProviderService {
  private readonly apiUrl = 'http://localhost:4200/api';

  public cloudBoardLoaded = new OutputEmitterRef<CloudBoard>();;

  private currentCloudBoard: CloudBoard | undefined;

  private createCloudboardDocument: CloudBoard = {
    id: undefined,
    name: 'test',
    content: 'aasdd',
  };

  constructor(private http: HttpClient) { }

  listCloudBoards(): Observable<CloudBoard[]> {
    return this.http.get<CloudBoard[]>(`${this.apiUrl}/cloudboard`);
  }

  loadCloudBoardById(boardId: string): Observable<CloudBoard> {
    return this.http.get<CloudBoard>(`${this.apiUrl}/cloudboard/${boardId}`).pipe(
      tap(response => {
        this.currentCloudBoard = response;
        this.cloudBoardLoaded.emit(response);
      },
      (error) => {
        console.error('Error loading cloudboard', error);
      }));
  }

  createNewCloudBoard(): Observable<CloudBoard> {
    return this.http.post<CloudBoard>(`${this.apiUrl}/cloudboard`, this.createCloudboardDocument).pipe(
      tap(response => {
        this.currentCloudBoard = response;
        this.cloudBoardLoaded.emit(response);
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
        }));
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
