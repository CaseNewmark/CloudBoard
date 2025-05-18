import { Component, inject, OnInit, TemplateRef, ViewChild, viewChild } from '@angular/core';
import { NgClass } from '@angular/common';
import { BoardProviderService } from '../../services/board-provider.service';
// import { NgbPopover, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FlowControlService } from '../../services/flow-control.service';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { PopoverModule } from 'primeng/popover';

@Component({
  selector: 'toolbar',
  imports: [NgClass, MenuModule, PopoverModule/*NgbPopover*/],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.css'
})
export class ToolbarComponent implements OnInit {

  @ViewChild('menuBar') menuBar: any;
  popover: any = viewChild('popover');

  //modalService: NgbModal = inject(NgbModal);
  flowControlService: FlowControlService = inject(FlowControlService);

  menuItems: MenuItem[] = [];
  availableBoards: any[] = [];
  deletionBoard: any;

  boardProviderService: BoardProviderService = inject(BoardProviderService);

  constructor() { }

  ngOnInit(): void {
    this.menuItems = [
      {
        label: 'Cloudboard',
        items: [
          {
            label: 'Create',
            icon: 'pi pi-fw pi-plus',
            command: () => this.onCreate()
          },
          {
            label: 'Open',
            icon: 'pi pi-fw pi-download',
            command: () => this.onOpen()
          },
          {
            label: 'Save',
            icon: 'pi pi-fw pi-save',
            command: () => this.onSave()
          }
        ]
      },
      {
        label: 'Viewport',
        items: [
          {
            label: 'Reset',
            icon: 'pi pi-fw pi-times-circle',
            command: () => this.flowControlService.resetZoom()
          },
          {
            label: 'Zoom In',
            icon: 'pi pi-fw pi-search-plus',
            command: () => this.flowControlService.zoomIn()
          },
          {
            label: 'Zoom Out',
            icon: 'pi pi-fw pi-search-minus',
            command: () => this.flowControlService.zoomOut()
          }
        ]
      }
    ];
  }

  onCreate(): void {
    this.boardProviderService.createNewCloudBoard().subscribe();
  }

  onOpen(): void {
    //this.boardProviderService.loadCloudBoardById(boardId).subscribe();
    this.boardProviderService.listCloudBoards().subscribe(
      response => {
        this.availableBoards = response;

        // Update the Open menu item with the latest available boards
        const cloudboardMenu = this.menuItems[0]; // Get the Cloudboard menu
        const openMenuItem = cloudboardMenu.items?.find(item => item.label === 'Open');

        if (openMenuItem) {
          openMenuItem.items = this.availableBoards.map(board => ({
            label: board.name,
            icon: 'pi pi-fw pi-file',
            command: () => {
              this.boardProviderService.loadCloudBoardById(board.id).subscribe(
                () => {
                },
                error => {
                  console.error('Error loading cloudboard', error);
                }
              );
            }
          }));
          this.menuBar.visible = false;
        }
      },
      error => {
        console.error('Error fetching cloudboards', error);
      });
  }

  onSave(): void {
    this.boardProviderService.saveCloudBoard();
  }

  onDelete(boardId: string, content: TemplateRef<any>): void {
    this.deletionBoard = this.availableBoards.find(board => board.id === boardId);
    // this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title',  }).result.then((result) => {
    //   if (result === 'ok') {
    //     this.boardProviderService.deleteCloudBoard(boardId).subscribe();
    //     this.availableBoards = this.availableBoards.filter(board => board.id !== boardId);
    //   }
    // });
  }
}
