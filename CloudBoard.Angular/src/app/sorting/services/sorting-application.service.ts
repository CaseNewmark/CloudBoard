import { inject, Injectable } from '@angular/core';
import { Observable, map, catchError, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { 
  SortingApplication, 
  ProcessStep, 
  MarketSegment, 
  TargetMaterial 
} from '../models/sorting-application';
import { 
  SortingApplicationDto,
  ProcessStepDto,
  MarketSegmentDto,
  TargetMaterialDto,
  mapSortingApplicationDtoToSortingApplication,
  mapSortingApplicationToSortingApplicationDto,
  mapProcessStepDtoToProcessStep,
  mapMarketSegmentDtoToMarketSegment,
  mapTargetMaterialDtoToTargetMaterial
} from '../models/sorting-mapper';

@Injectable({
  providedIn: 'root'
})
export class SortingApplicationService {
  private http: HttpClient = inject(HttpClient);
  private messageService: MessageService = inject(MessageService);
  private readonly baseUrl = '/api/sorting-applications';

  constructor() { }

  public getAllSortingApplications(): Observable<SortingApplication[]> {
    return this.http.get<SortingApplicationDto[]>(this.baseUrl).pipe(
      map((dtos: SortingApplicationDto[]) => 
        dtos.map(dto => mapSortingApplicationDtoToSortingApplication(dto))
      ),
      catchError(this.handleError)
    );
  }

  public getSortingApplicationById(id: string): Observable<SortingApplication> {
    return this.http.get<SortingApplicationDto>(`${this.baseUrl}/${id}`).pipe(
      map((dto: SortingApplicationDto) => mapSortingApplicationDtoToSortingApplication(dto)),
      catchError(this.handleError)
    );
  }

  public createSortingApplication(application: SortingApplication): Observable<SortingApplication> {
    const dto = mapSortingApplicationToSortingApplicationDto(application);
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post<SortingApplicationDto>(this.baseUrl, dto, { headers }).pipe(
      map((dto: SortingApplicationDto) => mapSortingApplicationDtoToSortingApplication(dto)),
      catchError(this.handleError)
    );
  }

  public updateSortingApplication(application: SortingApplication): Observable<SortingApplication> {
    const dto = mapSortingApplicationToSortingApplicationDto(application);
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.put<SortingApplicationDto>(`${this.baseUrl}/${application.id}`, dto, { headers }).pipe(
      map((dto: SortingApplicationDto) => mapSortingApplicationDtoToSortingApplication(dto)),
      catchError(this.handleError)
    );
  }

  public deleteSortingApplication(id: string): Observable<boolean> {
    return this.http.delete<boolean>(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  public getProcessStepsByApplicationId(applicationId: string): Observable<ProcessStep[]> {
    return this.http.get<ProcessStepDto[]>(`${this.baseUrl}/${applicationId}/process-steps`).pipe(
      map((dtos: ProcessStepDto[]) => 
        dtos.map(dto => mapProcessStepDtoToProcessStep(dto))
      ),
      catchError(this.handleError)
    );
  }

  public getDefaultPropertiesForSortingApplication(): SortingApplication {
    return {
      id: '',
      name: 'New Sorting Application',
      description: 'Optical sorting machine configuration',
      createdBy: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      processSteps: []
    };
  }

  private handleError = (error: any): Observable<never> => {
    this.messageService.add({
      severity: 'error',
      summary: 'Operation Failed',
      detail: 'Failed to process sorting application request. Please try again.'
    });
    console.error('SortingApplicationService error:', error);
    return throwError(() => error);
  };
}
