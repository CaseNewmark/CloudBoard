import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { FormsModule } from '@angular/forms';
import { CloudboardService } from '../../services/cloudboard.service';
import { FlowControlService } from '../../services/flow-control.service';
import { ConfirmationService } from 'primeng/api';
import { CloudBoard } from '../../data/cloudboard';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CloudboardEditComponent } from '../cloudboard-edit/cloudboard-edit.component';

@Component({
  selector: 'cloudboard-open',
  imports: [
    ButtonModule,
    CommonModule,
    FormsModule,
    ProgressSpinnerModule,
    CloudboardEditComponent
  ],
  templateUrl: './cloudboard-open.component.html',
  styleUrl: './cloudboard-open.component.css'
})
export class CloudboardOpenComponent {
  cloudboardService: CloudboardService = inject(CloudboardService);
  flowControlService: FlowControlService = inject(FlowControlService);
  confirmationService: ConfirmationService = inject(ConfirmationService);

  public availableBoards: CloudBoard[] = [];
  public deletionBoard: CloudBoard | undefined;
  
  // Edit dialog properties
  public showEditDialog: boolean = false;
  public editingBoard: CloudBoard | null = null;

  constructor(private router: Router, private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.refreshBoards();
  }

  onCreate(): void {
    let createCloudboardDocument: CloudBoard = {
      id: '',
      name: 'Empty Cloudboard',
      description: '',
      nodes: [],
      connections: []
    };

    this.cloudboardService.createCloudBoard(createCloudboardDocument).subscribe(
      cloudboard => this.router.navigate(['/cloudboard', cloudboard.id]),
    );
  }

  onOpen(boardId: string): void {
    this.router.navigate(['/cloudboard', boardId]);
  }

  onEdit(board: CloudBoard, event: Event): void {
    event.stopPropagation();
    this.editingBoard = board;
    this.showEditDialog = true;
  }

  onBoardUpdated(updatedBoard: CloudBoard): void {
    // Update the board in the local array
    const index = this.availableBoards.findIndex(board => board.id === updatedBoard.id);
    if (index !== -1) {
      this.availableBoards[index] = updatedBoard;
    }
    this.changeDetectorRef.detectChanges();
  }

  onEditCancelled(): void {
    // Handle edit cancellation if needed
    console.log('Edit cancelled');
  }

  onEditDialogClosed(): void {
    this.editingBoard = null;
  }

  onDelete(boardId: string, event: Event): void {
    event.stopPropagation();
    this.deletionBoard = this.availableBoards.find(board => board.id === boardId);
    
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Are you sure you want to delete "${this.deletionBoard?.name}?"`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.cloudboardService.deleteCloudBoard(this.deletionBoard?.id!).subscribe({
          next: (success: boolean) => {
            if (success) {
              this.availableBoards = this.availableBoards.filter(board => board.id !== boardId);
              this.changeDetectorRef.detectChanges();
            }
          },
          error: (error) => {
            console.error('Error deleting cloudboard', error);
          }
        });
      },
      reject: () => {
        // Optional: handle rejection
      }
    });
  }

  refreshBoards(): void {
    this.cloudboardService.listCloudBoards().subscribe(
      response => {
        this.availableBoards = response.sort((a, b) => {
          if (a && b && a.createdAt && b.createdAt) {
            return a.createdAt < b.createdAt ? -1.0 : 1.0;
          }
          return 0.0;
        });
        this.changeDetectorRef.detectChanges();
      },
      error => {
        console.error('Error fetching cloudboards', error);
      });
  }
}