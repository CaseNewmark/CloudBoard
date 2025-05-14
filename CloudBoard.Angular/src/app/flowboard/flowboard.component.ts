import { ChangeDetectionStrategy, inject } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { FFlowModule } from '@foblex/flow';
import { ToolbarComponent } from '../controls/toolbar/toolbar.component';
import { BoardProviderService } from '../services/board-provider.service';
import { CloudBoard } from '../data/cloudboard';

@Component({
  selector: 'app-flowboard',
  imports: [FFlowModule, ToolbarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
}
