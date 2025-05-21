import { Component, inject, OnInit } from '@angular/core';
import { BoardProviderService } from '../../services/board-provider.service';
import { FlowControlService } from '../../services/flow-control.service';
import { MenuModule } from 'primeng/menu';
import { MenubarModule } from 'primeng/menubar';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { PopoverModule } from 'primeng/popover';
import { ConfirmationService } from 'primeng/api';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { CloudBoard } from '../../data/cloudboard';
import { Guid } from 'guid-typescript';

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

  boardProviderService: BoardProviderService = inject(BoardProviderService);
  flowControlService: FlowControlService = inject(FlowControlService);
  confirmationService: ConfirmationService = inject(ConfirmationService);

  availableBoards: CloudBoard[] = [];
  deletionBoard: CloudBoard | undefined;

  constructor() { }

  ngOnInit(): void {}

  onCreate(): void {
    this.boardProviderService.createNewCloudBoard().subscribe();
  }

  onOpen(boardId: Guid): void {
    this.boardProviderService.loadCloudBoardById(boardId).subscribe();
  }

  onSave(): void {
    this.boardProviderService.saveCloudBoard();
  }
  onDelete(boardId: Guid, event: Event): void {
    /* 
        TODO: check if boardId is valid
        TODO: check if boardId is not the current board and deal with it
    */

    this.deletionBoard = this.availableBoards.find(board => board.id === boardId);
    
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Are you sure you want to delete "${this.deletionBoard?.name}?"`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.boardProviderService.deleteCloudBoard(this.deletionBoard?.id!).subscribe({
          next: () => {
            this.availableBoards = this.availableBoards.filter(board => board.id !== boardId);
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
    this.boardProviderService.listCloudBoards().subscribe(
      response => {
        this.availableBoards = response;
      },
      error => {
        console.error('Error fetching cloudboards', error);
      });
  }
}
