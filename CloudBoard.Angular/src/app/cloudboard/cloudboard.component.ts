import { ChangeDetectionStrategy, ChangeDetectorRef, HostListener, inject, signal, viewChild } from '@angular/core';
import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FFlowModule, FCanvasComponent, FZoomDirective, FCreateConnectionEvent, FFlowComponent, FSelectionChangeEvent, FDraggableDirective, FTriggerEvent, FEventTrigger } from '@foblex/flow';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { CloudboardOpenComponent } from './cloudboard-open/cloudboard-open.component';
import { PropertiesPanelComponent } from './properties-panel/properties-panel.component';
import { SimpleNoteComponent } from './nodes/simple-note/simple-note.component';
import { DoubleClickDirective } from '../helpers/double-click.directive';
import { CloudBoard, Connection, Connector, ConnectorPosition, ConnectorType, Node, NodePosition, NodeType } from './models/cloudboard';
import { ContextMenu, ContextMenuModule } from 'primeng/contextmenu';
import { combineLatest, concat, merge, pipe, Subscription, switchMap } from 'rxjs';
import { CloudboardService } from './services/cloudboard.service';
import { NodeService } from './services/node.service';
import { ConnectorService } from './services/connector.service';
import { ConnectionService } from './services/connection.service';
import { FlowControlService, ZoomAction } from './services/flow-control.service';
import { MenuItem } from 'primeng/api';
import { CardNodeComponent } from './nodes/card-node/card-node.component';
import { LinkCollectionComponent } from './nodes/link-collection/link-collection.component';
import { ImageNodeComponent } from './nodes/image-node/image-node.component';
import { CodeBlockComponent } from './nodes/code-block/code-block.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ContextMenuService } from './services/context-menu.service';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-cloudboard',
  imports: [
    FFlowModule,
    FZoomDirective,
    CloudboardOpenComponent,
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
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cloudboard.component.html',
  styleUrl: './cloudboard.component.css',
})
export class CloudboardComponent implements OnInit, AfterViewInit, OnDestroy {
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
  private contextMenuService = inject(ContextMenuService);
  private subscriptions: Subscription[] = [];
  private positionUpdateTimer: any;

  private connectionDragging: boolean = false;
  private connectionSource: { node: Node, connector: Connector } | undefined;
  private connectionDestination:  { node: Node, connector: Connector } | undefined;

  public currentCloudBoard: CloudBoard | undefined;
  public isLoading = false;
  public canvasVisible = signal(true);

  // Properties for the PropertiesPanel
  public propertiesPanelVisible = signal(false);
  public propertiesPanelNodeProperties: Node | undefined;

  public flowContextMenuItems: MenuItem[] = [];
  public nodeContextMenuItems: MenuItem[] = [];

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private route: ActivatedRoute) { }
    
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
          this.fCanvas()?.fitToScreen();
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
      this.nodeService.deleteNodesAndConnections([node.id], connectionsToDelete.map(c => c.id)).then(success => {
        // Remove the node and its connections from the currentCloudBoard
        if (this.currentCloudBoard && success.length > 0 && success.every(s => s)) {
          this.currentCloudBoard.nodes = this.currentCloudBoard.nodes.filter(n => n.id !== node.id);
          this.currentCloudBoard.connections = this.currentCloudBoard.connections.filter(c => !connectionsToDelete.some(conn => conn.id === c.id));
          this.changeDetectorRef.detectChanges();
        }
      });
    }
  }

  protected onNodeDoubleClicked(event: Event, node: Node): void {
    if (!node) return

    this.propertiesPanelNodeProperties = node;
    this.propertiesPanelVisible.set(true);
  }

  protected onNodeMouseEnter(event: MouseEvent, node: Node, position: ConnectorPosition): void {
    let type = this.connectionDragging ? ConnectorType.In : ConnectorType.Out;
    let connector = {
      id: `temp-${type.toLocaleLowerCase()}-${node.id}`,
      type: type,
      position: position,
      name: 'temp',
    };
    if (!this.connectionDragging) {
      this.connectionSource = { node: node, connector: connector };
    } else {
      this.connectionDestination = { node: node, connector: connector };
    }
    this.changeDetectorRef.detectChanges();
  }

  protected onNodeMouseLeave(event: MouseEvent, node: Node, position: ConnectorPosition): void {
    if (!this.connectionDragging && this.connectionSource) {
      this.connectionSource = undefined;
      this.changeDetectorRef.detectChanges();
    }
    else if (this.connectionDragging && this.connectionDestination) {
      this.connectionDestination = undefined;
      this.changeDetectorRef.detectChanges();
    }
  }

  protected onConnectorMouseDown(event: MouseEvent, connector: Connector): void {
    // If the connector is temporary, we don't want to do anything
    if (connector.id.startsWith('temp-')) {
      this.connectionDragging = true;
    }
  }

  protected onConnectionAdded(event: FCreateConnectionEvent): void {
    this.connectionDragging = false;
    if (this.currentCloudBoard && this.connectionSource && this.connectionDestination) {
      this.connectionSource.connector.id = '';
      this.connectionDestination.connector.id = '';
      combineLatest([
        this.connectorService.createConnector(this.connectionSource.node.id, this.connectionSource.connector),
        this.connectorService.createConnector(this.connectionDestination.node.id, this.connectionDestination.connector)
      ]).pipe(
        switchMap(([sourceConnector, destinationConnector]) => {
          this.connectionSource?.node.connectors.push(sourceConnector);
          this.connectionDestination?.node.connectors.push(destinationConnector);
          const connectionDto: Connection = {
            id: '',
            fromConnectorId: sourceConnector.id,
            toConnectorId: destinationConnector.id,
          };
          return this.connectionService.createConnection(this.currentCloudBoard!.id, connectionDto);
        })
      )
      .subscribe({
        next: newConnection => {
          this.currentCloudBoard?.connections.push(newConnection);
          this.connectionSource = undefined;
          this.connectionDestination = undefined;
          this.changeDetectorRef.detectChanges();
        }
      });
    }
    else {
      this.connectionSource = undefined;
      this.connectionDestination = undefined;
      this.changeDetectorRef.detectChanges();
    }
  }

  protected getConnectorsForNodeByPosition(node: Node, position: ConnectorPosition): Connector[] {
    const connectors: Connector[] = [...node.connectors];
    if (this.connectionSource && 
        this.connectionSource.connector && 
        this.connectionSource.node.id === node.id) {
      connectors.push(this.connectionSource.connector);
    }
    if (this.connectionDestination && 
        this.connectionDestination.connector &&
        this.connectionDestination.node.id === node.id) {
      connectors.push(this.connectionDestination.connector);
    }
    return connectors.filter(conn => conn.position === position);
  }

  protected getConnectorPositions(): ConnectorPosition[] {
    return Object.values(ConnectorPosition);
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
    this.canvasVisible.set(false); // Hide canvas during loading
    this.cloudboardService.loadCloudBoardById(cloudboardId).subscribe({
      next: (cloudboard) => {
        this.isLoading = false;
        this.currentCloudBoard = cloudboard;
        this.changeDetectorRef.detectChanges();

        // First fitToScreen call
        this.fCanvas()?.fitToScreen();

        setTimeout(() => {
          // Second fitToScreen call
          this.fCanvas()?.fitToScreen();
          
          // Wait a bit more for the second fitToScreen to complete, then fade in
          setTimeout(() => {
            console.log(this.fZoom()?.getZoomValue());
            this.fZoom()?.zoomOut();
            this.canvasVisible.set(true);
            this.changeDetectorRef.detectChanges();
          }, 100); // Small delay to ensure fitToScreen is complete
        }, 500); // Wait for the canvas to render

        this.setupAutoSave();
      },
      error: () => {
        this.isLoading = false;
        this.canvasVisible.set(true); // Show canvas even on error
      }
    });
  }
}