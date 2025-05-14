import { Component, inject, OnInit, TemplateRef } from '@angular/core';
import { NgClass } from '@angular/common';
import { BoardProviderService } from '../../services/board-provider.service';
import { NgbPopover, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'toolbar',
  imports: [NgClass, NgbPopover],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.css'
})
export class ToolbarComponent implements OnInit {

  private modalService: NgbModal = inject(NgbModal);
  
  buttons: { icon: string; tooltip: string; action: () => void, popover: boolean | undefined }[] = [];
  devBoardId: string = '126a505a-512b-48a0-99bc-84d02a86d7e7'; // Static GUID
  availableBoards: any[] = [];

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
  }

  onCreate(): void {
    this.boardProviderService.createNewCloudBoard();
  }

  onOpen(boardId: string): void {
    this.boardProviderService.getCloudBoardById(boardId);
  }

  onSave(): void {
    this.boardProviderService.saveCloudBoard();
  }

  onDelete(boardId: string, content: TemplateRef<any>): void {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      console.log('Delete board:', boardId);
    });
  }

  refreshAvailableBoards(): void {
    this.availableBoards = [];
    this.boardProviderService.listCloudBoards().subscribe(
      response => {
        this.availableBoards = response;
        console.log('Cloudboard created successfully', response);
      },
      error => {
        console.error('Error creating cloudboard', error);
      });
  }
}
