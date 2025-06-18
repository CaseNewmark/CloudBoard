import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CloudBoard } from '../models/cloudboard';
import { CloudboardService } from '../services/cloudboard.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'cloudboard-edit',
  standalone: true,
  imports: [
    ButtonModule,
    CommonModule,
    FormsModule,
    DialogModule,
    InputTextModule,
    TextareaModule,
    ProgressSpinnerModule
  ],
  templateUrl: './cloudboard-edit.component.html',
  styleUrl: './cloudboard-edit.component.css'
})
export class CloudboardEditComponent {
  @Input() visible: boolean = false;
  @Input() cloudBoard: CloudBoard | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() boardUpdated = new EventEmitter<CloudBoard>();
  @Output() editCancelled = new EventEmitter<void>();

  private cloudboardService = inject(CloudboardService);
  private messageService = inject(MessageService);

  public editingBoard: CloudBoard | null = null;
  public shareEmail: string = '';
  public sharedUsers: string[] = [];
  public isSaving: boolean = false;

  ngOnChanges(): void {
    if (this.visible && this.cloudBoard) {
      // Create a deep copy for editing
      this.editingBoard = {
        ...this.cloudBoard,
        description: this.cloudBoard.description || ''
      };
      // Load shared users
      this.loadSharedUsers(this.cloudBoard.id!);
    } else if (!this.visible) {
      this.resetForm();
    }
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

    this.cloudboardService.updateCloudBoard(this.editingBoard).subscribe({
      next: (updatedBoard) => {
        // Save sharing settings
        this.saveShareSettings(updatedBoard.id!);

        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Board updated successfully'
        });

        this.boardUpdated.emit(updatedBoard);
        this.closeDialog();
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
    this.editCancelled.emit();
    this.closeDialog();
  }

  private closeDialog(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.resetForm();
  }

  private resetForm(): void {
    this.editingBoard = null;
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
    this.sharedUsers = [];
    
    // Example API call:
    // this.cloudboardService.getSharedUsers(boardId).subscribe({
    //   next: (users) => this.sharedUsers = users,
    //   error: (error) => console.error('Error loading shared users', error)
    // });
  }

  private saveShareSettings(boardId: string): void {
    // TODO: Implement API call to save sharing settings
    
    // Example API call:
    // this.cloudboardService.updateSharing(boardId, this.sharedUsers).subscribe({
    //   next: () => console.log('Sharing settings saved'),
    //   error: (error) => console.error('Error saving sharing settings', error)
    // });
  }
}
