import { ChangeDetectionStrategy, ChangeDetectorRef, HostListener, inject, signal, viewChild } from '@angular/core';
import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FFlowModule, FCanvasComponent, FZoomDirective, FCreateConnectionEvent, FFlowComponent, FSelectionChangeEvent, FDraggableDirective, FTriggerEvent, FEventTrigger } from '@foblex/flow';
import { ToolbarComponent } from '../controls/toolbar/toolbar.component';
import { PropertiesPanelComponent } from '../controls/properties-panel/properties-panel.component';
import { SimpleNoteComponent } from '../nodes/simple-note/simple-note.component';
import { BoardProviderService } from '../services/board-provider.service';
import { DoubleClickDirective } from '../helpers/double-click.directive';
import { CloudBoard, Connection, ConnectorPosition, ConnectorType, Node, Node as NodeInfo, NodePosition, NodeType } from '../data/cloudboard';
import { ContextMenu, ContextMenuModule } from 'primeng/contextmenu';
import { Subscription } from 'rxjs';
import { CloudboardService } from '../services/cloudboard.service';
import { FlowControlService, ZoomAction } from '../services/flow-control.service';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { NodeRegistryService } from '../nodes/node-registry.service';
import { CardNodeComponent } from '../nodes/card-node/card-node.component';
import { LinkCollectionComponent } from '../nodes/link-collection/link-collection.component';
import { ImageNodeComponent } from '../nodes/image-node/image-node.component';
import { CodeBlockComponent } from '../nodes/code-block/code-block.component';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
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
    ConfirmDialogModule,
    DoubleClickDirective,
    ProgressSpinnerModule,
    ToastModule],
  providers: [
    ConfirmationService,
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
  private boardProviderService: BoardProviderService = inject(BoardProviderService);
  private cloudboardService = inject(CloudboardService);
  private nodeRegistryService = inject(NodeRegistryService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private contextMenuService = inject(ContextMenuService);
  private subscriptions: Subscription[] = [];

  public currentCloudBoard: CloudBoard | undefined;
  public isLoading = false;

  // Properties for the PropertiesPanel
  public propertiesPanelVisible = signal(false);
  public propertiesPanelNodeProperties: NodeInfo | undefined;

  // Currently selected nodes and connections
  private selectedNodeIds: string[] = [];

  public flowContextMenuItems: MenuItem[] = [];
  public nodeContextMenuItems: MenuItem[] = [];

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router) { }
    
  ngOnInit(): void {
    //this.cloudboardService.loadCloudBoardById

    // Subscribe to cloudBoard updates
    const boardSubscription = this.boardProviderService.cloudBoardLoaded.subscribe((cloudBoard) => {
      this.currentCloudBoard = cloudBoard;

      this.messageService.add({
        severity: 'info',
        summary: 'Board Loaded',
        detail: `CloudBoard ${cloudBoard.name} loaded successfully`
      });

      // Update the route URL without reloading the page
      if (cloudBoard && cloudBoard.id) {
        this.router.navigate(['/flowboard', cloudBoard.id.toString()], {
          replaceUrl: true, // replace the current URL instead of adding to history
          skipLocationChange: false // update the browser URL
        });
      }
      this.changeDetectorRef.detectChanges();
      this.fCanvas()?.resetScaleAndCenter(false);

      // Set up auto-save for the new board
      this.setupAutoSave();
    });

    this.subscriptions.push(boardSubscription);
    // Get the id from the route parameter
    const routeSubscription = this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id != null && (this.currentCloudBoard == null
        || this.currentCloudBoard.id?.toString() !== id)) {
        this.isLoading = true;
        this.boardProviderService.loadCloudBoardById(id).subscribe({
          next: () => {
            this.isLoading = false;
          },
          error: (error) => {
            this.isLoading = false;
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to load CloudBoard: ' + (error.message || 'Unknown error')
            });
          }
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

  protected onSelectionChange(event: FSelectionChangeEvent): void {
    // fDraggable drag events are triggered after the selection change event
    // so we need to wait for the next tick to check if the drag event is triggered
    setTimeout(() => {
      let draggable = this.fDraggable();
      if (draggable?.isDragStarted) return;

      // Store the selected node IDs for deletion handling
      this.selectedNodeIds = event.fNodeIds;
    }, 0);
  }

  protected onNodeDoubleClicked(event: Event, node: NodeInfo): void {
    if (!node) return

    this.propertiesPanelNodeProperties = node;
    this.propertiesPanelVisible.set(true);
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    // Only handle Delete key and only when we have a cloudboard and selection
    if (event.key === 'Delete' && this.currentCloudBoard && this.selectedNodeIds.length > 0) {
      // Prevent default browser behavior for Delete key
      event.preventDefault();

      // Get all selected nodes
      const selectedNodes = this.currentCloudBoard.nodes.filter(
        node => this.selectedNodeIds.includes(node.id.toString())
      );

      // Find all connections that involve the selected nodes
      const connectionsToDelete = this.currentCloudBoard.connections.filter(conn =>
        selectedNodes.some(node =>
          node.connectors.some(c => c.id === conn.fromConnectorId || c.id === conn.toConnectorId)
        )
      );

      // Show confirmation dialog
      this.confirmDeleteNodes(selectedNodes, connectionsToDelete);
    }
  }

  private confirmDeleteNodes(nodesToDelete: NodeInfo[], connectionsToDelete: any[]): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${nodesToDelete.length} node${nodesToDelete.length > 1 ? 's' : ''} and ${connectionsToDelete.length} connection${connectionsToDelete.length > 1 ? 's' : ''}?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.deleteSelectedItems(nodesToDelete, connectionsToDelete);
      }
    });
  } 
  
  private deleteSelectedItems(nodesToDelete: NodeInfo[], connectionsToDelete: Connection[]): void {
    if (this.currentCloudBoard) {
      this.isLoading = true;
      // Create an array of promises for all delete operations
      const deleteOperations: Promise<any>[] = [];

      // Delete connections first
      for (const connection of connectionsToDelete) {
        const deletePromise = new Promise<void>((resolve, reject) => {
          this.boardProviderService.deleteConnection(connection.id).subscribe({
            next: () => {
              console.log(`Connection ${connection.id} deleted successfully`);
              resolve();
            },
            error: error => {
              console.error(`Error deleting connection ${connection.id}:`, error);
              reject(error);
            }
          });
        });
        deleteOperations.push(deletePromise);
      }

      // Then delete nodes
      for (const node of nodesToDelete) {
        const deletePromise = new Promise<void>((resolve, reject) => {
          this.boardProviderService.deleteNode(node.id).subscribe({
            next: () => {
              console.log(`Node ${node.id} deleted successfully`);
              resolve();
            },
            error: error => {
              console.error(`Error deleting node ${node.id}:`, error);
              reject(error);
            }
          });
        });
        deleteOperations.push(deletePromise);
      }

      // When all delete operations are complete
      Promise.all(deleteOperations)
        .then(() => {
          this.isLoading = false;
          // Clear selection
          this.propertiesPanelNodeProperties = undefined;
          this.propertiesPanelVisible.set(false);
          this.selectedNodeIds = [];

          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Successfully deleted ${nodesToDelete.length} node(s) and ${connectionsToDelete.length} connection(s)`
          });

          // No need to update cloudBoard here as the service handles removing deleted items
          this.changeDetectorRef.detectChanges();
        })
        .catch(error => {
          this.isLoading = false;
          console.error('Error during deletion:', error);

          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete items: ' + (error.message || 'Unknown error')
          });

          // Refresh the board to ensure UI consistency
          if (this.currentCloudBoard && this.currentCloudBoard.id) {
            this.boardProviderService.loadCloudBoardById(this.currentCloudBoard.id).subscribe();
          }
        });
    }
  }

  protected onNodePositionChanged(newPosition: NodePosition, node: NodeInfo): void {
    if (node) {
      // Update local position for immediate feedback
      node.position = newPosition;

      // Debounce the API update to avoid too many calls during dragging
      if (this.positionUpdateTimer) {
        clearTimeout(this.positionUpdateTimer);
      }
      this.positionUpdateTimer = setTimeout(() => {
        // Create a copy of the node with the updated position
        const updatedNode = { ...node };

        // Call API to update the node
        this.boardProviderService.updateNode(node.id, updatedNode).subscribe({
          next: response => {
            console.log('Node position updated successfully');
          },
          error: error => {
            console.error('Error updating node position:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to update node position: ' + (error.message || 'Unknown error')
            });
          }
        });
      }, 300); // 300ms debounce
    }
  }

  private positionUpdateTimer: any;

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

  protected showNodeContextMenu(event: Event, node: NodeInfo): void {
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
  
  protected addNode(nodeType: NodeType, position: NodePosition): void {
    if (this.currentCloudBoard) {
      // Get default properties for the node type
      const defaultProperties = this.nodeRegistryService.getDefaultPropertiesForType(nodeType);

      // Prepare the node DTO for API (without connectors - they'll be created separately)
      const nodeDto: Node = {
        id: '', 
        name: this.getDefaultNameForNodeType(nodeType),
        position: { x: position.x, y: position.y },
        connectors: [], // Empty array - connectors will be created after node creation
        type: nodeType,
        properties: defaultProperties
      };

      // Create the node through the API
      this.isLoading = true;
      this.boardProviderService.createNode(this.currentCloudBoard.id.toString(), nodeDto).subscribe({
        next: newNode => {
          console.log('Node created successfully:', newNode);

          // Now create the default connectors for the node
          this.createDefaultConnectorsForNode(newNode.id?.toString());

          this.isLoading = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Node created successfully'
          });
          // Node has been added to the board in the service
          this.changeDetectorRef.detectChanges();
        },
        error: error => {
          this.isLoading = false;
          console.error('Error creating node:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to create node: ' + (error.message || 'Unknown error')
          });
        }
      });
    }
  }

  protected deleteNode(node: NodeInfo): void {
    if (this.currentCloudBoard) {
      const connectionsToDelete = this.currentCloudBoard.connections.filter(conn =>
        node.connectors.some((c: { id: string }) => c.id.toString() === conn.fromConnectorId || c.id.toString() === conn.toConnectorId)
      );
      this.confirmDeleteNodes([node], connectionsToDelete);
    }
  }

  protected openPropertiesPanelForNode(node: NodeInfo): void {
    if (this.currentCloudBoard) {
      this.propertiesPanelNodeProperties = node;
      this.propertiesPanelVisible.set(true);
    }
  }

  private getDefaultNameForNodeType(type: NodeType): string {
    switch (type) {
      case NodeType.Note: return 'New Note';
      case NodeType.Card: return 'New Card';
      case NodeType.LinkCollection: return 'New Link Collection';
      case NodeType.ImageNode: return 'New Image';
      case NodeType.CodeBlock: return 'New Code Block';
      default: return 'New Node';
    }
  }

  protected getComponentForNode(node: NodeInfo): any {
    return this.nodeRegistryService.getComponentForType(node.type);
  }

  onConnectionAdded(event: FCreateConnectionEvent): void {
    if (this.currentCloudBoard && event.fOutputId && event.fInputId) {
      // Prepare connection DTO
      const connectionDto = {
        id: '',
        fromConnectorId: event.fOutputId,
        toConnectorId: event.fInputId,
        cloudBoardDocumentId: this.currentCloudBoard.id?.toString()
      };
      // Call API to create the connection
      this.isLoading = true;
      this.boardProviderService.createConnection(connectionDto).subscribe({
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

  // Method to add a new connector to a node
  addConnector(nodeId: string, position: string, type: string): void {
    const connectorDto = {
      id: '',
      name: type === 'in' ? 'Input' : type === 'out' ? 'Output' : 'I/O',
      position: ConnectorPosition.Right,
      type: ConnectorType.In,
      nodeId: nodeId
    };

    this.boardProviderService.createConnector(nodeId, connectorDto).subscribe(
      response => {
        console.log('Connector added successfully');
      },
      error => {
        console.error('Error adding connector:', error);
      }
    );
  }

  // Method to remove a connector from a node
  removeConnector(connectorId: string): void {
    this.boardProviderService.deleteConnector(connectorId).subscribe(
      response => {
        console.log('Connector removed successfully');
      },
      error => {
        console.error('Error removing connector:', error);
      }
    );
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
        this.saveCloudBoard();
      }
    }, this.AUTO_SAVE_INTERVAL);
  }
  // Save the current CloudBoard
  private saveCloudBoard(): void {
    if (this.currentCloudBoard) {
      this.isLoading = true;
      this.boardProviderService.saveCloudBoard().subscribe({
        next: () => {
          this.isLoading = false;
          this.lastSaveTime = Date.now();
          this.messageService.add({
            severity: 'success',
            summary: 'Auto-Save',
            detail: 'CloudBoard saved successfully',
            life: 3000
          });
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error saving CloudBoard:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to save CloudBoard: ' + (error.message || 'Unknown error')
          });
        }
      });
    }
  }
  
  private getApiTypeForNodeType(nodeType: NodeType): string {
    // Return the enum value directly since it matches the C# enum
    return nodeType.toString();
  }

  private createDefaultConnectorsForNode(nodeId: string): void {
    // Create input connector
    const inConnectorDto = {
      id: '',
      name: 'In',
      position: ConnectorPosition.Left,
      type: ConnectorType.In,
    };

    // Create output connector
    const outConnectorDto = {
      id: '',
      name: 'Out',
      position: ConnectorPosition.Right,
      type: ConnectorType.Out,
    };

    // Create both connectors
    this.boardProviderService.createConnector(nodeId, inConnectorDto).subscribe({
      next: () => console.log('Input connector created'),
      error: (error) => console.error('Error creating input connector:', error)
    });

    this.boardProviderService.createConnector(nodeId, outConnectorDto).subscribe({
      next: () => console.log('Output connector created'),
      error: (error) => console.error('Error creating output connector:', error)
    });
  }
}
