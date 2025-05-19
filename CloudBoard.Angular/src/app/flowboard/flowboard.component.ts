import { ChangeDetectionStrategy, inject, viewChild } from '@angular/core';
import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FFlowModule, FCanvasComponent, FZoomDirective } from '@foblex/flow';
import { ToolbarComponent } from '../controls/toolbar/toolbar.component';
import { BoardProviderService } from '../services/board-provider.service';
import { CloudBoard, Node, NodePosition } from '../data/cloudboard';
import { Subscription } from 'rxjs';
import { Guid } from 'guid-typescript';
import { FlowControlService, ZoomAction } from '../services/flow-control.service';

@Component({
  selector: 'app-flowboard',
  imports: [FFlowModule, FZoomDirective, ToolbarComponent],
  changeDetection: ChangeDetectionStrategy.Default,
  templateUrl: './flowboard.component.html',
  styleUrl: './flowboard.component.css',
})
export class FlowboardComponent implements OnInit, AfterViewInit, OnDestroy {

  protected fCanvas = viewChild(FCanvasComponent);
  protected fZoom = viewChild(FZoomDirective);

  private flowControlService: FlowControlService = inject(FlowControlService);
  private boardProviderService: BoardProviderService = inject(BoardProviderService);  

  public currentCloudBoard: CloudBoard | undefined;
  private subscriptions: Subscription[] = [];

  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    // Subscribe to cloudBoard updates
    const boardSubscription = this.boardProviderService.cloudBoardLoaded.subscribe((cloudBoard) => {
      this.currentCloudBoard = cloudBoard;
      this.fCanvas()?.resetScaleAndCenter(false);
      
      // Update the route URL without reloading the page
      if (cloudBoard && cloudBoard.id) {
        this.router.navigate(['/flowboard', cloudBoard.id], { 
          replaceUrl: true, // replace the current URL instead of adding to history
          skipLocationChange: false // update the browser URL
        });
      }
    });
    this.subscriptions.push(boardSubscription);

    // Get the id from the route parameter
    const routeSubscription = this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id != null && (this.currentCloudBoard == null
        || this.currentCloudBoard.id != Guid.parse(id))) {
        this.boardProviderService.loadCloudBoardById(Guid.parse(id)).subscribe(() => { }, error => {
          // display error message in model          
        });
      }
    });
    this.subscriptions.push(routeSubscription);
  }

  ngAfterViewInit(): void {
    this.flowControlService.Zoom.subscribe((zoomAction) => {
      switch (zoomAction) {
        case ZoomAction.ZoomIn:
          this.fZoom()?.zoomIn();
          break;
        case ZoomAction.ZoomOut:
          this.fZoom()?.zoomOut();
          break;
        case ZoomAction.Reset:
          this.fCanvas()?.resetScaleAndCenter();
          break;
      }});
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  protected onNodePositionChanged(newPosition: NodePosition, node: Node): void {
    node.position = newPosition;
    console.log('Node Position Changed Event:', newPosition);
  }
}
