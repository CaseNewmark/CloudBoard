import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { FormsModule } from '@angular/forms';
import { CloudboardService } from '../../services/cloudboard.service';
import { FlowControlService } from '../../services/flow-control.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CloudBoard } from '../../data/cloudboard';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'flowboard-open',
  imports: [
    ButtonModule,
    CommonModule,
    FormsModule,
    DialogModule,
    InputTextModule,
    TextareaModule,
    ProgressSpinnerModule
  ],
  templateUrl: './flowboard-open.component.html',
  styleUrl: './flowboard-open.component.css'
})
export class FlowboardOpenComponent {
  cloudboardService: CloudboardService = inject(CloudboardService);
  flowControlService: FlowControlService = inject(FlowControlService);
  confirmationService: ConfirmationService = inject(ConfirmationService);
  messageService: MessageService = inject(MessageService);

  public availableBoards: CloudBoard[] = [];
  public selectedBoard: CloudBoard | undefined;
  public deletionBoard: CloudBoard | undefined;
  
  // Edit dialog properties
  public showEditDialog: boolean = false;
  public editingBoard: CloudBoard | null = null;
  public originalBoard: CloudBoard | null = null;
  public shareEmail: string = '';
  public sharedUsers: string[] = [];
  public isSaving: boolean = false;

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
      cloudboard => this.router.navigate(['/flowboard', cloudboard.id]),
    );
  }

  onOpen(boardId: string): void {
    this.router.navigate(['/flowboard', boardId]);
  }

  onEdit(board: CloudBoard, event: Event): void {
    event.stopPropagation();
    
    // Create a deep copy of the board for editing
    this.originalBoard = { ...board };
    this.editingBoard = { 
      ...board,
      description: board.description || ''
    };
    
    // Load shared users (if available from your API)
    this.loadSharedUsers(board.id!);
    
    this.showEditDialog = true;
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

  saveEdit(): void {
    if (!this.editingBoard || !this.editingBoard.name?.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Board name is required'
      });
      return;
    }

    this.isSaving = true;

    // Update the board
    this.cloudboardService.updateCloudBoard(this.editingBoard).subscribe({
      next: (updatedBoard) => {
        // Update the board in the local array
        const index = this.availableBoards.findIndex(board => board.id === updatedBoard.id);
        if (index !== -1) {
          this.availableBoards[index] = updatedBoard;
        }

        // Save sharing settings
        this.saveShareSettings(updatedBoard.id!);

        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Board updated successfully'
        });

        this.closeEditDialog();
        this.changeDetectorRef.detectChanges();
      },
      error: (error) => {
        console.error('Error updating cloudboard', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update board'
        });
      },
      complete: () => {
        this.isSaving = false;
      }
    });
  }

  cancelEdit(): void {
    this.closeEditDialog();
  }

  private closeEditDialog(): void {
    this.showEditDialog = false;
    this.editingBoard = null;
    this.originalBoard = null;
    this.shareEmail = '';
    this.sharedUsers = [];
    this.isSaving = false;
  }

  addShareUser(): void {
    if (this.shareEmail && this.isValidEmail(this.shareEmail)) {
      if (!this.sharedUsers.includes(this.shareEmail)) {
        this.sharedUsers.push(this.shareEmail);
        this.shareEmail = '';
      } else {
        this.messageService.add({
          severity: 'warn',
          summary: 'Warning',
          detail: 'User is already in the share list'
        });
      }
    }
  }

  removeShareUser(email: string): void {
    this.sharedUsers = this.sharedUsers.filter(user => user !== email);
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private loadSharedUsers(boardId: string): void {
    // TODO: Implement API call to load shared users
    // This would typically call your API to get the list of users the board is shared with
    // For now, we'll start with an empty array
    this.sharedUsers = [];
    
    // Example API call (implement this in your CloudboardService):
    // this.cloudboardService.getSharedUsers(boardId).subscribe({
    //   next: (users) => this.sharedUsers = users,
    //   error: (error) => console.error('Error loading shared users', error)
    // });
  }

  private saveShareSettings(boardId: string): void {
    // TODO: Implement API call to save sharing settings
    // This would typically call your API to update the sharing settings
    
    // Example API call (implement this in your CloudboardService):
    // this.cloudboardService.updateSharing(boardId, this.sharedUsers).subscribe({
    //   next: () => console.log('Sharing settings saved'),
    //   error: (error) => console.error('Error saving sharing settings', error)
    // });
  }

  refreshBoards(): void {
    this.cloudboardService.listCloudBoards().subscribe(
      response => {
        this.availableBoards = response;
        this.changeDetectorRef.detectChanges();
      },
      error => {
        console.error('Error fetching cloudboards', error);
      });
  }
}
