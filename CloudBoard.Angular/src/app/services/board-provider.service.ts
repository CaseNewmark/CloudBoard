import { Injectable, output, OutputEmitterRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CloudBoard } from '../data/cloudboard';

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

  constructor(private http: HttpClient) {}

  listCloudBoards(): Observable<CloudBoard[]> {
    return this.http.get<CloudBoard[]>(`${this.apiUrl}/cloudboard`);
  }

  getCloudBoardById(boardId: string): void {
    this.http.get<CloudBoard>(`${this.apiUrl}/cloudboard/${boardId}`).subscribe(
      (response) => {
        this.currentCloudBoard = response;
        this.cloudBoardLoaded.emit(response);
      },
      (error) => {  
        console.error('Error fetching cloudboard', error);
      });
  }

  createNewCloudBoard(): void {
    this.http.post<CloudBoard>(`${this.apiUrl}/cloudboard`, this.createCloudboardDocument).subscribe(
      (response) => {
        this.currentCloudBoard = response;
        this.cloudBoardLoaded.emit(response);
      },
      (error) => {
        console.error('Error creating cloudboard', error);
      });
  }

  saveCloudBoard(): void {
    if (this.currentCloudBoard) {
      this.http.put<CloudBoard>(`${this.apiUrl}/cloudboard/${this.currentCloudBoard.id}`, this.currentCloudBoard).subscribe(
        (response) => { console.log('Cloudboard saved successfully', response); },
        (error) => { console.error('Error saving cloudboard', error); });
    }
  }
}
