import { ChangeDetectionStrategy, inject, viewChild } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { FFlowModule, FCanvasComponent, FDragStartedEvent } from '@foblex/flow';
import { ToolbarComponent } from '../controls/toolbar/toolbar.component';
import { BoardProviderService } from '../services/board-provider.service';
import { CloudBoard, Node, NodePosition } from '../data/cloudboard';

@Component({
  selector: 'app-flowboard',
  imports: [FFlowModule, ToolbarComponent],
  changeDetection: ChangeDetectionStrategy.Default,
  templateUrl: './flowboard.component.html',
  styleUrl: './flowboard.component.css',
})
export class FlowboardComponent implements OnInit {

  protected fCanvas = viewChild(FCanvasComponent);

  currentCloudBoard: CloudBoard | undefined;

  constructor() { }

  boardProviderService: BoardProviderService = inject(BoardProviderService);

  ngOnInit(): void {
    this.boardProviderService.cloudBoardLoaded.subscribe((cloudBoard) => {
      this.currentCloudBoard = cloudBoard; 
    });
  }

  protected onNodePositionChanged(newPosition: NodePosition, node: Node): void {
    node.position = newPosition;
    console.log('Node Position Changed Event:', newPosition);
  }

  protected onDragStarted(event: FDragStartedEvent): void {
    console.log('Drag Start Event:', event);  
  }

  protected onDragEnded(): void {
    console.log('Drag End Event:');
  }
}
