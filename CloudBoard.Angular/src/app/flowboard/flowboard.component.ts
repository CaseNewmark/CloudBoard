import { ChangeDetectionStrategy, inject } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { FFlowModule, FDragStartedEvent } from '@foblex/flow';
import { ToolbarComponent } from '../controls/toolbar/toolbar.component';
import { BoardProviderService } from '../services/board-provider.service';
import { CloudBoard } from '../data/cloudboard';

@Component({
  selector: 'app-flowboard',
  imports: [FFlowModule, ToolbarComponent],
  changeDetection: ChangeDetectionStrategy.Default,
  templateUrl: './flowboard.component.html',
  styleUrl: './flowboard.component.css',
})
export class FlowboardComponent implements OnInit {
  currentCloudBoard: CloudBoard | undefined;

  constructor() { }

  boardProviderService: BoardProviderService = inject(BoardProviderService);

  ngOnInit(): void {
    this.boardProviderService.cloudBoardLoaded.subscribe((cloudBoard) => {
      this.currentCloudBoard = cloudBoard;
    });
  }

  protected onDragStart(event: FDragStartedEvent): void {
    console.log('Drag Start Event:', event);  
  }

  protected onDragEnd(): void {
    console.log('Drag End Event:', event);
  }
}
