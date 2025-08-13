import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

// PrimeNG Components
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { BadgeModule } from 'primeng/badge';
import { DropdownModule } from 'primeng/dropdown';
import { MessageService, ConfirmationService } from 'primeng/api';

import { SortingApplication, ProcessStep, ProcessStepType } from '../models/sorting-application';
import { SortingApplicationService } from '../services/sorting-application.service';

@Component({
  selector: 'app-sorting-application-manager',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    ToolbarModule,
    CardModule,
    TagModule,
    BadgeModule,
    DropdownModule
  ],
  providers: [MessageService, ConfirmationService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="sorting-application-manager">
      <p-toast></p-toast>
      <p-confirmDialog></p-confirmDialog>
      
      <!-- Header -->
      <div class="surface-section">
        <div class="font-medium text-3xl text-900 mb-3">Optical Sorting Machine Applications</div>
        <div class="text-500 mb-5">Manage sorting configurations for recycling plants</div>
      </div>

      <!-- Toolbar -->
      <p-toolbar class="mb-4 gap-2" styleClass="p-toolbar">
        <ng-template pTemplate="start">
          <p-button 
            severity="success" 
            label="New Application" 
            icon="pi pi-plus" 
            (onClick)="openNewApplicationDialog()"
            class="mr-2">
          </p-button>
        </ng-template>
        
        <ng-template pTemplate="end">
          <p-button 
            severity="help" 
            icon="pi pi-refresh" 
            (onClick)="loadSortingApplications()"
            [loading]="isLoading()">
          </p-button>
        </ng-template>
      </p-toolbar>

      <!-- Applications Table -->
      <p-card>
        <p-table 
          [value]="sortingApplications()" 
          [loading]="isLoading()"
          [paginator]="true"
          [rows]="10"
          [showCurrentPageReport]="true"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
          [rowsPerPageOptions]="[10, 25, 50]"
          dataKey="id"
          styleClass="p-datatable-gridlines">
          
          <ng-template pTemplate="header">
            <tr>
              <th pSortableColumn="name">
                Name <p-sortIcon field="name"></p-sortIcon>
              </th>
              <th>Description</th>
              <th pSortableColumn="createdAt">
                Created <p-sortIcon field="createdAt"></p-sortIcon>
              </th>
              <th>Process Steps</th>
              <th>Actions</th>
            </tr>
          </ng-template>
          
          <ng-template pTemplate="body" let-app>
            <tr>
              <td>
                <span class="font-medium">{{ app.name }}</span>
              </td>
              <td>
                <span class="text-500">{{ app.description || 'No description' }}</span>
              </td>
              <td>
                {{ app.createdAt | date:'short' }}
                <br>
                <small class="text-500">by {{ app.createdBy || 'Unknown' }}</small>
              </td>
              <td>
                <p-badge [value]="app.processSteps.length" severity="info"></p-badge>
                <div class="mt-1">
                  <p-tag 
                    *ngFor="let step of getProcessStepSummary(app.processSteps)" 
                    [value]="step.type" 
                    [severity]="getStepTypeSeverity(step.type)"
                    class="mr-1">
                    {{ step.count }}
                  </p-tag>
                </div>
              </td>
              <td>
                <div class="flex gap-2">
                  <p-button 
                    icon="pi pi-eye" 
                    severity="info" 
                    size="small"
                    (onClick)="viewApplication(app)"
                    pTooltip="View Details">
                  </p-button>
                  <p-button 
                    icon="pi pi-pencil" 
                    severity="secondary" 
                    size="small"
                    (onClick)="editApplication(app)"
                    pTooltip="Edit">
                  </p-button>
                  <p-button 
                    icon="pi pi-trash" 
                    severity="danger" 
                    size="small"
                    (onClick)="deleteApplication(app)"
                    pTooltip="Delete">
                  </p-button>
                </div>
              </td>
            </tr>
          </ng-template>
          
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="5" class="text-center">
                <div class="p-4">
                  <i class="pi pi-info-circle text-4xl text-500 mb-3"></i>
                  <div class="text-500 mb-3">No sorting applications found</div>
                  <p-button 
                    label="Create First Application" 
                    icon="pi pi-plus"
                    (onClick)="openNewApplicationDialog()">
                  </p-button>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>

      <!-- Application Dialog -->
      <p-dialog 
        [visible]="applicationDialogVisible()" 
        (visibleChange)="applicationDialogVisible.set($event)"
        [style]="{ width: '50vw' }"
        [header]="selectedApplication()?.id ? 'Edit Application' : 'New Application'"
        [modal]="true"
        styleClass="p-fluid">
        
        <ng-template pTemplate="content">
          <div class="field">
            <label for="name" class="block">Name *</label>
            <input 
              id="name" 
              type="text" 
              pInputText 
              [(ngModel)]="selectedApplication()!.name"
              required 
              autofocus 
              class="w-full" />
          </div>
          
          <div class="field">
            <label for="description" class="block">Description</label>
            <textarea 
              id="description" 
              pInputTextarea 
              [(ngModel)]="selectedApplication()!.description"
              rows="3"
              class="w-full">
            </textarea>
          </div>

          <div class="field" *ngIf="selectedApplication()?.processSteps?.length">
            <label class="block mb-2">Process Steps ({{ selectedApplication()!.processSteps.length }})</label>
            <div class="grid gap-2">
              <div 
                *ngFor="let step of selectedApplication()!.processSteps; trackBy: trackByStepId"
                class="col-12 md:col-6">
                <div class="surface-100 p-3 border-round">
                  <div class="flex justify-content-between align-items-start mb-2">
                    <span class="font-medium text-sm">{{ step.processStepName }}</span>
                    <p-tag 
                      [value]="step.stepType" 
                      [severity]="getStepTypeSeverity(step.stepType)"
                      size="small">
                    </p-tag>
                  </div>
                  <div class="text-sm text-500">{{ step.processStepId }}</div>
                  <div class="text-sm text-500 mt-1">
                    Target: {{ step.mainMaterialForEjection || 'Not specified' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ng-template>
        
        <ng-template pTemplate="footer">
          <p-button 
            label="Cancel" 
            icon="pi pi-times" 
            severity="secondary"
            (onClick)="hideApplicationDialog()">
          </p-button>
          <p-button 
            label="Save" 
            icon="pi pi-check" 
            severity="primary"
            (onClick)="saveApplication()"
            [disabled]="!selectedApplication()?.name">
          </p-button>
        </ng-template>
      </p-dialog>
    </div>
  `,
  styles: [`
    .sorting-application-manager {
      padding: 1rem;
    }

    :host ::ng-deep {
      .p-datatable .p-datatable-tbody > tr > td {
        vertical-align: top;
      }
      
      .p-tag {
        font-size: 0.75rem;
      }
    }
  `]
})
export class SortingApplicationManagerComponent implements OnInit, OnDestroy {
  private sortingApplicationService = inject(SortingApplicationService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private changeDetectorRef = inject(ChangeDetectorRef);
  private subscriptions: Subscription[] = [];

  // Signals for reactive state management
  public sortingApplications = signal<SortingApplication[]>([]);
  public isLoading = signal(false);
  public applicationDialogVisible = signal(false);
  public selectedApplication = signal<SortingApplication | null>(null);

  ngOnInit(): void {
    this.loadSortingApplications();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  public loadSortingApplications(): void {
    this.isLoading.set(true);
    
    const subscription = this.sortingApplicationService.getAllSortingApplications().subscribe({
      next: (applications) => {
        this.sortingApplications.set(applications);
        this.isLoading.set(false);
        this.changeDetectorRef.detectChanges();
      },
      error: () => {
        this.isLoading.set(false);
        this.changeDetectorRef.detectChanges();
      }
    });
    
    this.subscriptions.push(subscription);
  }

  public openNewApplicationDialog(): void {
    const newApplication = this.sortingApplicationService.getDefaultPropertiesForSortingApplication();
    this.selectedApplication.set(newApplication);
    this.applicationDialogVisible.set(true);
  }

  public viewApplication(app: SortingApplication): void {
    this.selectedApplication.set({ ...app });
    this.applicationDialogVisible.set(true);
  }

  public editApplication(app: SortingApplication): void {
    this.selectedApplication.set({ ...app });
    this.applicationDialogVisible.set(true);
  }

  public deleteApplication(app: SortingApplication): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${app.name}"?`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const subscription = this.sortingApplicationService.deleteSortingApplication(app.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Application deleted successfully'
            });
            this.loadSortingApplications();
          }
        });
        this.subscriptions.push(subscription);
      }
    });
  }

  public saveApplication(): void {
    const app = this.selectedApplication();
    if (!app || !app.name) return;

    const subscription = app.id 
      ? this.sortingApplicationService.updateSortingApplication(app)
      : this.sortingApplicationService.createSortingApplication(app);

    let sub = subscription.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: app.id ? 'Application updated successfully' : 'Application created successfully'
        });
        this.hideApplicationDialog();
        this.loadSortingApplications();
      }
    });
    
    this.subscriptions.push(sub);
  }

  public hideApplicationDialog(): void {
    this.applicationDialogVisible.set(false);
    this.selectedApplication.set(null);
  }

  public getProcessStepSummary(steps: ProcessStep[]): { type: ProcessStepType, count: number }[] {
    const summary = new Map<ProcessStepType, number>();
    
    steps.forEach(step => {
      summary.set(step.stepType, (summary.get(step.stepType) || 0) + 1);
    });
    
    return Array.from(summary.entries()).map(([type, count]) => ({ type, count }));
  }

  public getStepTypeSeverity(stepType: ProcessStepType): 'success' | 'warning' | 'info' {
    switch (stepType) {
      case ProcessStepType.Rougher: return 'success';
      case ProcessStepType.Cleaner: return 'warning';
      case ProcessStepType.Scavenger: return 'info';
      default: return 'info';
    }
  }

  public trackByStepId(index: number, step: ProcessStep): string {
    return step.id;
  }
}
