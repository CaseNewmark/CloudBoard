import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Add this import
import { CloudboardService } from '../../services/cloudboard.service';
import { FlowControlService } from '../../services/flow-control.service';
import { ConfirmationService } from 'primeng/api';
import { CloudBoard } from '../../data/cloudboard';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'flowboard-open',
  imports: [
    ButtonModule,
    CommonModule,
    FormsModule // Add FormsModule here
  ],
  templateUrl: './flowboard-open.component.html',
  styleUrl: './flowboard-open.component.css'
})
export class FlowboardOpenComponent {
  cloudboardService: CloudboardService = inject(CloudboardService);
  flowControlService: FlowControlService = inject(FlowControlService);
  confirmationService: ConfirmationService = inject(ConfirmationService);

  public availableBoards: CloudBoard[] = [];
  public selectedBoard: CloudBoard | undefined;
  public deletionBoard: CloudBoard | undefined;

  constructor(private router: Router, private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.refreshBoards();
  }

  onCreate(): void {
    let createCloudboardDocument: CloudBoard = {
      id: '',
      name: 'Empty Cloudboard',
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

  onDelete(boardId: string, event: Event): void {
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
        this.availableBoards = response;
        this.changeDetectorRef.detectChanges();
      },
      error => {
        console.error('Error fetching cloudboards', error);
      });
  }
}
