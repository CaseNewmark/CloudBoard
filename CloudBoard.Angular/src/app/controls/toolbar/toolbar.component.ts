import { Component, inject, OnInit, TemplateRef, ViewChild, viewChild } from '@angular/core';
import { BoardProviderService } from '../../services/board-provider.service';
import { FlowControlService } from '../../services/flow-control.service';
import { MenuModule } from 'primeng/menu';
import { MenubarModule } from 'primeng/menubar';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { MenuItem } from 'primeng/api';
import { PopoverModule } from 'primeng/popover';
import { CloudBoard } from '../../data/cloudboard';
import { Guid } from 'guid-typescript';

@Component({
  selector: 'toolbar',
  imports: [MenuModule, MenubarModule, PopoverModule, ToolbarModule, ButtonModule],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.css'
})
export class ToolbarComponent implements OnInit {

  flowControlService: FlowControlService = inject(FlowControlService);

  availableBoards: CloudBoard[] = [];
  deletionBoard: any;

  boardProviderService: BoardProviderService = inject(BoardProviderService);

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

  onDelete(boardId: Guid): void {
    this.deletionBoard = this.availableBoards.find(board => board.id === boardId);
    // this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title',  }).result.then((result) => {
    //   if (result === 'ok') {
    //     this.boardProviderService.deleteCloudBoard(boardId).subscribe();
    //     this.availableBoards = this.availableBoards.filter(board => board.id !== boardId);
    //   }
    // });
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
