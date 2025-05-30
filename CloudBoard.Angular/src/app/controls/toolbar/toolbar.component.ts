import { Router } from '@angular/router';
import { Component, inject, OnInit } from '@angular/core';
import { CloudboardService } from '../../services/cloudboard.service';
import { FlowControlService } from '../../services/flow-control.service';
import { MenuModule } from 'primeng/menu';
import { MenubarModule } from 'primeng/menubar';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { PopoverModule } from 'primeng/popover';
import { ConfirmationService } from 'primeng/api';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { CloudBoard } from '../../data/cloudboard';

@Component({
  selector: 'toolbar',
  imports: [
    ButtonModule,
    ConfirmPopupModule,
    MenuModule, 
    MenubarModule, 
    PopoverModule, 
    ToolbarModule],
  providers: [
    ConfirmationService
  ],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.css'
})
export class ToolbarComponent implements OnInit {

  cloudboardService: CloudboardService = inject(CloudboardService);
  flowControlService: FlowControlService = inject(FlowControlService);
  confirmationService: ConfirmationService = inject(ConfirmationService);

  availableBoards: CloudBoard[] = [];
  deletionBoard: CloudBoard | undefined;

  constructor(private router: Router) { }

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
      },
      error => {
        console.error('Error fetching cloudboards', error);
      });
  }
}
