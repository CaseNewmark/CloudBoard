import { inject, Injectable } from '@angular/core';
import { CloudBoard } from '../data/cloudboard';
import { Observable, ReplaySubject, map, tap, catchError, throwError } from 'rxjs';
import { ApiClientService, CloudBoardDto } from './api-client-service';
import { mapCloudBoardDtoToCloudBoard, mapCloudBoardToCloudBoardDto } from '../data/mapper';
import { MessageService } from 'primeng/api';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class CloudboardService {
  private apiClient: ApiClientService = inject(ApiClientService);
  private messageService: MessageService = inject(MessageService);
  private authService: AuthService = inject(AuthService);
  private router: Router = inject(Router);

  constructor() { }

  public listCloudBoards(): Observable<CloudBoard[]> {
    if (!this.isUserAuthenticated('Please sign in to view your cloudboards')) {
      return throwError(() => new Error('Authentication required'));
    }

    return this.apiClient.getAllCloudBoards().pipe(
      map((dtos: CloudBoardDto[]) => dtos.map((dto: CloudBoardDto) => mapCloudBoardDtoToCloudBoard(dto))),
      catchError(this.handleAuthError)
    );
  }
  
  public loadCloudBoardById(cloudboardId: string): Observable<CloudBoard> {
    if (!this.isUserAuthenticated('Please sign in to load this cloudboard')) {
      return throwError(() => new Error('Authentication required'));
    }

    return this.apiClient.getCloudBoardById(cloudboardId).pipe(
      map((dto: CloudBoardDto) => mapCloudBoardDtoToCloudBoard(dto)),
      tap((cloudboard: CloudBoard) => this.messageService.add({
                                            severity: 'info',
                                            summary: 'Board Loaded',
                                            detail: `CloudBoard ${cloudboard.name} loaded successfully`})),
      catchError(this.handleAuthError)
    );
  }
  
  public createCloudBoard(cloudboard: CloudBoard): Observable<CloudBoard> {
    if (!this.isUserAuthenticated('Please sign in to create a cloudboard')) {
      return throwError(() => new Error('Authentication required'));
    }

    const dto = mapCloudBoardToCloudBoardDto(cloudboard);
    return this.apiClient.createCloudBoard(dto).pipe(
      map((newDto: CloudBoardDto) => mapCloudBoardDtoToCloudBoard(newDto)),
      tap((newCloudboard: CloudBoard) => this.messageService.add({
                                            severity: 'success',
                                            summary: 'Board Created',
                                            detail: `CloudBoard ${newCloudboard.name} created successfully`})),
      catchError(this.handleAuthError)
    );
  }

  public saveCloudBoard(currentCloudBoard: CloudBoard): Observable<boolean> {
    if (!this.isUserAuthenticated('Please sign in to save your cloudboard')) {
      return throwError(() => new Error('Authentication required'));
    }

    return Observable.create((observer: any) => {
      observer.next(true);
      observer.complete();  
    });
  }

  public deleteCloudBoard(cloudboardId: string): Observable<boolean> {
    if (!this.isUserAuthenticated('Please sign in to delete this cloudboard')) {
      return throwError(() => new Error('Authentication required'));
    }

    return this.apiClient.deleteCloudBoard(cloudboardId).pipe(
      tap((success: boolean) => {
        if (success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Board Deleted',
            detail: 'CloudBoard deleted successfully'
          });
        }
      }),
      catchError(this.handleAuthError)
    );
  }

  public updateCloudBoard(cloudBoard: CloudBoard): Observable<CloudBoard> {
    if (!this.authService.isLoggedIn()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Authentication Required',
        detail: 'Please sign in to update this cloudboard'
      });
      this.router.navigate(['/home']);
      return throwError(() => new Error('Authentication required'));
    }

    const dto = mapCloudBoardToCloudBoardDto(cloudBoard);
    return this.apiClient.updateCloudBoard(cloudBoard.id!, dto).pipe(
      map((newDto: CloudBoardDto) => mapCloudBoardDtoToCloudBoard(newDto)),
      tap((updatedCloudboard: CloudBoard) => this.messageService.add({
        severity: 'success',
        summary: 'Board Updated',
        detail: `CloudBoard "${updatedCloudboard.name}" updated successfully`
      })),
      catchError(this.handleAuthError)
    );
  }

  public getSharedUsers(cloudBoardId: string): Observable<string[]> {
    // TODO: Implement API call to get shared users
    return new Observable<string[]>(observer => observer.complete());
    // return this.apiClient.getSharedUsers(cloudBoardId).pipe(
    //   catchError(this.handleAuthError)
    // );
  }

  public updateSharing(cloudBoardId: string, sharedUsers: string[]): Observable<boolean> {
    // TODO: Implement API call to update sharing
    return new Observable<boolean>(observer => observer.complete());
    // return this.apiClient.updateSharing(cloudBoardId, sharedUsers).pipe(
    //   catchError(this.handleAuthError)
    // );
  }

  private isUserAuthenticated(detail: string): boolean {
    if (!this.authService.isLoggedIn()) { 
      this.messageService.add({
        severity: 'warn',
        summary: 'Authentication Required',
        detail: detail
      });
      this.router.navigate(['/home']);
      return false;
    }

    return true;
  }

  private handleAuthError = (error: any) => {
    console.error('API Error:', error);
    
    if (error.status === 401) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Session Expired',
        detail: 'Your session has expired. Please sign in again.'
      });
      // Don't immediately logout, let the interceptor handle token refresh
      // Only logout if refresh fails
      setTimeout(() => {
        if (!this.authService.isLoggedIn()) {
          this.router.navigate(['/home']);
        }
      }, 1000);
    } else if (error.status === 403) {
      this.messageService.add({
        severity: 'error',
        summary: 'Access Denied',
        detail: 'You do not have permission to access this resource'
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'An unexpected error occurred'
      });
    }
    
    return throwError(() => error);
  };
}
