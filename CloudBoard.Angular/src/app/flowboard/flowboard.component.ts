import { ChangeDetectionStrategy, ChangeDetectorRef, HostListener, inject, signal, viewChild } from '@angular/core';
import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FFlowModule, FCanvasComponent, FZoomDirective, FCreateConnectionEvent, FFlowComponent, FSelectionChangeEvent, FDraggableDirective, FTriggerEvent, FEventTrigger } from '@foblex/flow';
import { ToolbarComponent } from '../controls/toolbar/toolbar.component';
import { PropertiesPanelComponent } from '../controls/properties-panel/properties-panel.component';
import { SimpleNoteComponent } from '../nodes/simple-note/simple-note.component';
import { DoubleClickDirective } from '../helpers/double-click.directive';
import { CloudBoard, Connection, ConnectorPosition, ConnectorType, Node, NodePosition, NodeType } from '../data/cloudboard';
import { ContextMenu, ContextMenuModule } from 'primeng/contextmenu';
import { Subscription } from 'rxjs';
import { CloudboardService } from '../services/cloudboard.service';
import { NodeService } from '../services/node.service';
import { ConnectorService } from '../services/connector.service';
import { ConnectionService } from '../services/connection.service';
import { FlowControlService, ZoomAction } from '../services/flow-control.service';
import { MenuItem } from 'primeng/api';
import { CardNodeComponent } from '../nodes/card-node/card-node.component';
import { LinkCollectionComponent } from '../nodes/link-collection/link-collection.component';
import { ImageNodeComponent } from '../nodes/image-node/image-node.component';
import { CodeBlockComponent } from '../nodes/code-block/code-block.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ContextMenuService } from '../services/context-menu.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-flowboard',
  imports: [
    FFlowModule,
    FZoomDirective,
    ToolbarComponent,
    PropertiesPanelComponent,
    ContextMenuModule,
    SimpleNoteComponent,
    CardNodeComponent,
    LinkCollectionComponent,
    ImageNodeComponent,
    CodeBlockComponent,
    DoubleClickDirective,
    ProgressSpinnerModule,
    ToastModule],
  providers: [
    MessageService
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  private cloudboardService = inject(CloudboardService);
  private nodeService = inject(NodeService);
  private connectorService = inject(ConnectorService);
  private connectionService = inject(ConnectionService);
  private messageService = inject(MessageService);
  private contextMenuService = inject(ContextMenuService);
  private subscriptions: Subscription[] = [];
  private positionUpdateTimer: any;

  public currentCloudBoard: CloudBoard | undefined;
  public isLoading = false;

  // Properties for the PropertiesPanel
  public propertiesPanelVisible = signal(false);
  public propertiesPanelNodeProperties: Node | undefined;

  public flowContextMenuItems: MenuItem[] = [];
  public nodeContextMenuItems: MenuItem[] = [];

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router) { }
    
  ngOnInit(): void {
    // Get the id from the route parameter
    const routeSubscription = this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id != null && (this.currentCloudBoard == null
        || this.currentCloudBoard.id?.toString() !== id)) {
        this.loadCloudBoardById(id);
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
      }
    });
  }

  ngOnDestroy(): void {
    // Clear auto-save timer
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }

    // Unsubscribe from all subscriptions
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  // service calls
  protected addNode(nodeType: NodeType, position: NodePosition): void {
    if (this.currentCloudBoard) {
      // Prepare the node DTO for API (without connectors - they'll be created separately)
      const nodeDto: Node = {
        id: '', 
        name: this.nodeService.getDefaultNameForNodeType(nodeType),
        position: { x: position.x, y: position.y },
        connectors: [],
        type: nodeType,
        properties:  this.nodeService.getDefaultPropertiesForType(nodeType)
      };

      // Create the node through the API
      this.nodeService.createNode(this.currentCloudBoard.id, nodeDto).subscribe({
        next: newNode => {
          this.currentCloudBoard?.nodes.push(newNode);
          this.changeDetectorRef.detectChanges();
        }
      });
    }
  }

  protected deleteNode(node: Node): void {
    if (this.currentCloudBoard) {
      const connectionsToDelete = this.currentCloudBoard.connections.filter(conn =>
        node.connectors.some((c: { id: string }) => c.id.toString() === conn.fromConnectorId || c.id.toString() === conn.toConnectorId)
      );
    }
  }

  protected onNodeDoubleClicked(event: Event, node: Node): void {
    if (!node) return

    this.propertiesPanelNodeProperties = node;
    this.propertiesPanelVisible.set(true);
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    // Only handle Delete key and only when we have a cloudboard and selection
    if (event.key === 'Delete' && this.currentCloudBoard && this.fFlow()) {
      // Prevent default browser behavior for Delete key
      event.preventDefault();

      let selection = this.fFlow()?.getSelection();

      if (selection) {     
        // add connections adjacent to nodes
        const selectedNodes = this.currentCloudBoard.nodes.filter(node => selection.fNodeIds.includes(node.id));
        let connectionsToDelete = this.currentCloudBoard.connections.filter(connection =>
          selectedNodes.some(node => node.connectors.some(conn => conn.id === connection.fromConnectorId || conn.id === connection.toConnectorId))
        ).map(conn => conn.id).concat(selection.fConnectionIds);
        connectionsToDelete = [...connectionsToDelete.values()];
        this.nodeService.deleteNodesAndConnections(selection.fNodeIds, connectionsToDelete).then(success => {
            // Remove selected nodes and connections from the currentCloudBoard
            if (this.currentCloudBoard && success.length > 0 && success.every(s => s)) {
              this.currentCloudBoard.nodes = this.currentCloudBoard.nodes.filter(node => !selection.fNodeIds.includes(node.id));
              this.currentCloudBoard.connections = this.currentCloudBoard.connections.filter(conn => !connectionsToDelete.includes(conn.id));
              this.changeDetectorRef.detectChanges();
            }
        });
      }
    }
  }

  protected onNodePositionChanged(newPosition: NodePosition, node: Node): void {
    if (node) {
      // Update local position for immediate feedback
      node.position = newPosition;

      // Debounce the API update to avoid too many calls during dragging
      if (this.positionUpdateTimer) {
        clearTimeout(this.positionUpdateTimer);
      }
      this.positionUpdateTimer = setTimeout(() => {
        // Call API to update the node
        this.nodeService.updateNode(node.id, node).subscribe();
      }, 300); // 300ms debounce
    }
  }

  protected showFlowContextMenu(event: MouseEvent): void {
    if (this.fFlow() && this.flowContextMenu()) {
      let nodePosition = this.fFlow()?.getPositionInFlow({ x: event.clientX, y: event.clientY });
      if (nodePosition) {
        this.flowContextMenuItems = this.contextMenuService.getFlowContextMenuItems({
          x: nodePosition.x,
          y: nodePosition.y
        }, this.addNode.bind(this));

        this.flowContextMenu()?.show(event);
        event.preventDefault();
      }
    }
  }

  protected showNodeContextMenu(event: Event, node: Node): void {
    if (this.nodeContextMenu()) {
      this.nodeContextMenuItems = this.contextMenuService.getNodeContextMenuItems(
        node,
        this.deleteNode.bind(this),
        this.openPropertiesPanelForNode.bind(this)
      );

      this.nodeContextMenu()?.show(event);
      event.preventDefault();
    }
  }
  
  protected openPropertiesPanelForNode(node: Node): void {
    if (this.currentCloudBoard) {
      this.propertiesPanelNodeProperties = node;
      this.propertiesPanelVisible.set(true);
    }
  }

  onConnectionAdded(event: FCreateConnectionEvent): void {
    if (this.currentCloudBoard && event.fOutputId && event.fInputId) {
      // Prepare connection DTO
      const connectionDto: Connection = {
        id: '',
        fromConnectorId: event.fOutputId,
        toConnectorId: event.fInputId,
      };
      // Call API to create the connection
      this.isLoading = true;
      this.connectionService.createConnection(this.currentCloudBoard.id, connectionDto).subscribe({
        next: newConnection => {
          this.isLoading = false;
          console.log('Connection created successfully:', newConnection);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Connection created successfully'
          });
          // Connection has been added to the board in the service
          this.changeDetectorRef.detectChanges();
        },
        error: error => {
          this.isLoading = false;
          console.error('Error creating connection:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to create connection: ' + (error.message || 'Unknown error')
          });
          // If there's an error, remove the connection from the UI
          if (this.currentCloudBoard) {
            this.currentCloudBoard.connections = this.currentCloudBoard.connections.filter(
              c => c.fromConnectorId !== event.fOutputId || c.toConnectorId !== event.fInputId
            );
            this.changeDetectorRef.detectChanges();
          }
        }
      });
    }
  }

  private autoSaveTimer: any;
  private lastSaveTime: number = 0;
  private readonly AUTO_SAVE_INTERVAL = 5 * 60 * 1000; // 5 minutes

  // Setup auto-save functionality
  private setupAutoSave(): void {
    // Clear any existing timer
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }

    // Set up a new timer for auto-saving
    this.autoSaveTimer = setInterval(() => {
      const currentTime = Date.now();

      // Only save if changes have been made since last save and it's been at least AUTO_SAVE_INTERVAL ms
      if (this.currentCloudBoard &&
        currentTime - this.lastSaveTime >= this.AUTO_SAVE_INTERVAL) {
        this.cloudboardService.saveCloudBoard(this.currentCloudBoard).subscribe();
      }
    }, this.AUTO_SAVE_INTERVAL);
  }

  private loadCloudBoardById(cloudboardId: string): void {
    this.isLoading = true;
    this.cloudboardService.loadCloudBoardById(cloudboardId).subscribe({
      next: (cloudboard) => {
        this.isLoading = false;
        this.currentCloudBoard = cloudboard;
        this.changeDetectorRef.detectChanges();
        this.fCanvas()?.resetScaleAndCenter(false);

        this.setupAutoSave();
      },
      error: () => this.isLoading = false
    });
  }
}
