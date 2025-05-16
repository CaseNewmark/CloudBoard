import { Component, inject, OnInit, TemplateRef } from '@angular/core';
import { NgClass } from '@angular/common';
import { BoardProviderService } from '../../services/board-provider.service';
import { NgbPopover, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FlowControlService } from '../../services/flow-control.service';

@Component({
  selector: 'toolbar',
  imports: [NgClass, NgbPopover],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.css'
})
export class ToolbarComponent implements OnInit {

  modalService: NgbModal = inject(NgbModal);
  flowControlService: FlowControlService = inject(FlowControlService);

  buttons: { icon: string; tooltip: string; action: () => void, popover: boolean | undefined }[] = [];
  devBoardId: string = '126a505a-512b-48a0-99bc-84d02a86d7e7'; // Static GUID
  availableBoards: any[] = [];
  deletionBoard: any;

  boardProviderService: BoardProviderService = inject(BoardProviderService);
  
  constructor() {}

  ngOnInit(): void {
    this.buttons.push({
        icon: 'file-earmark-plus',
        tooltip: 'Create',
        action: () => this.onCreate(),
        popover: false
      });
    this.buttons.push({
        icon: 'folder',
        tooltip: 'Open',
        action: () => this.refreshAvailableBoards(),
        popover: true
      });
    this.buttons.push({
        icon: 'floppy',
        tooltip: 'Save',
        action: () => this.onSave(),
        popover: false
      });
    this.buttons.push({
        icon: 'separator',
        tooltip: '',
        action: () => {},
        popover: false
      });
    this.buttons.push({
        icon: 'zoom-in',
        tooltip: 'Zoom In',
        action: () => { this.flowControlService.zoomIn(); },
        popover: false
      });
    this.buttons.push({
        icon: 'zoom-out',
        tooltip: 'Zoom Out',
        action: () => { this.flowControlService.zoomOut(); },
        popover: false
      });
    this.buttons.push({
        icon: 'arrows-collapse-vertical',
        tooltip: 'Reset Zoom',
        action: () => { this.flowControlService.resetZoom(); },
        popover: false
      });
  }

  onCreate(): void {
    this.boardProviderService.createNewCloudBoard().subscribe();
  }

  onOpen(boardId: string): void {
    this.boardProviderService.loadCloudBoardById(boardId).subscribe();
  }

  onSave(): void {
    this.boardProviderService.saveCloudBoard();
  }

  onDelete(boardId: string, content: TemplateRef<any>): void {
    this.deletionBoard = this.availableBoards.find(board => board.id === boardId);
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title',  }).result.then((result) => {
      if (result === 'ok') {
        this.boardProviderService.deleteCloudBoard(boardId).subscribe();
        this.availableBoards = this.availableBoards.filter(board => board.id !== boardId);
      }
    });
  }

  refreshAvailableBoards(): void {
    this.availableBoards = [];
    this.boardProviderService.listCloudBoards().subscribe(
      response => {
        this.availableBoards = response;
      },
      error => {
        console.error('Error fetching cloudboards', error);
      });
  }
}
