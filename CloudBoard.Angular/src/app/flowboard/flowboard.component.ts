import { ChangeDetectionStrategy, inject, signal, viewChild } from '@angular/core';
import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FFlowModule, FCanvasComponent, FZoomDirective, MoveFrontElementsBeforeTargetElementExecution, FFlowComponent, FSelectionChangeEvent, FDraggableDirective } from '@foblex/flow';
import { ToolbarComponent } from '../controls/toolbar/toolbar.component';
import { PropertiesPanelComponent } from '../controls/properties-panel/properties-panel.component';
import { SimpleNoteComponent } from '../nodes/simple-note/simple-note.component';
import { BoardProviderService } from '../services/board-provider.service';
import { CloudBoard, Node, NodePosition } from '../data/cloudboard';
import { ContextMenu, ContextMenuModule } from 'primeng/contextmenu';
import { Subscription } from 'rxjs';
import { Guid } from 'guid-typescript';
import { FlowControlService, ZoomAction } from '../services/flow-control.service';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-flowboard',
  imports: [
    FFlowModule,
    FZoomDirective,
    ToolbarComponent,
    PropertiesPanelComponent,
    ContextMenuModule,
    SimpleNoteComponent],
  changeDetection: ChangeDetectionStrategy.Default,
  templateUrl: './flowboard.component.html',
  styleUrl: './flowboard.component.css',
})
export class FlowboardComponent implements OnInit, AfterViewInit, OnDestroy {
  protected fFlow = viewChild(FFlowComponent);
  protected fCanvas = viewChild(FCanvasComponent);
  protected fDraggable = viewChild(FDraggableDirective);
  protected fZoom = viewChild(FZoomDirective);

  protected flowContextMenu = viewChild<ContextMenu>('flowcontextmenu');
  protected nodeContextMenu = viewChild<ContextMenu>('nodecontextmenu');

  private flowControlService: FlowControlService = inject(FlowControlService);
  private boardProviderService: BoardProviderService = inject(BoardProviderService);  
  private subscriptions: Subscription[] = [];

  public currentCloudBoard: CloudBoard | undefined;
  
  // Properties for the PropertiesPanel
  public propertiesPanelVisible = signal(false);
  public propertiesPanelNodeProperties = signal<Node | undefined>(undefined);

  public flowContextMenuItems: MenuItem[] = [
    {
      label: 'Add new node',
      icon: 'pi pi-plus-circle',
      command: () => this.addNode()
    },
    {
      separator: true
    },
    {
      label: 'Properties Panel',
      icon: 'pi pi-cog',
      items: [
        {
          label: 'Append to Body',
          icon: 'pi pi-desktop',
          command: () => this.propertiesPanelVisible.set(!this.propertiesPanelVisible())
        },
        {
          label: 'Toggle Visibility',
          icon: 'pi pi-eye',
          command: () => this.propertiesPanelVisible.set(!this.propertiesPanelVisible())
        }
      ]
    }
  ];

  public nodeContextMenuItems: MenuItem[] = [
    {
      label: 'Delete node',
      icon: 'pi pi-search-minus',
      command: () => {}
    }
  ];

  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    // Subscribe to cloudBoard updates
    const boardSubscription = this.boardProviderService.cloudBoardLoaded.subscribe((cloudBoard) => {
      this.currentCloudBoard = cloudBoard;
      this.fCanvas()?.resetScaleAndCenter(false);
      
      // Update the route URL without reloading the page
      if (cloudBoard && cloudBoard.id) {
        this.router.navigate(['/flowboard', cloudBoard.id.toString()], { 
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
        || !this.currentCloudBoard.id?.equals(Guid.parse(id)))) {
        this.boardProviderService.loadCloudBoardById(Guid.parse(id)).subscribe();
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

  protected onSelectionChange(event: FSelectionChangeEvent): void {
    // fDraggable drag events are triggered after the selection change event
    // so we need to wait for the next tick to check if the drag event is triggered
    setTimeout(() => {
      let draggable = this.fDraggable(); 
      if (draggable?.isDragStarted) return;

      this.propertiesPanelVisible.set(event.fNodeIds.length == 1);
      if (event.fNodeIds.length == 1) {
        var nodeProperties = this.currentCloudBoard?.nodes.find(node => node.id == event.fNodeIds[0]);
        if (nodeProperties) {
          this.propertiesPanelNodeProperties.set(nodeProperties);
        }
      }
      else {
        this.propertiesPanelNodeProperties.set(undefined);
      }
    }, 0);
  }

  protected onNodePositionChanged(newPosition: NodePosition, node: Node): void {
    node.position = newPosition;
    console.log('Node Position Changed Event:', newPosition);
  }

  protected addNode(): void {
    // TODO: Implementation for adding a new node
  }

  showFlowContextMenu(event: Event): void {
    let menu = this.flowContextMenu();
    menu?.show(event);
  }

  showNodeContextMenu($event: MouseEvent, node: Node) {
    let menu = this.nodeContextMenu();
    menu?.show($event);
  }
}
