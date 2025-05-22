import { ChangeDetectionStrategy, inject, signal, viewChild } from '@angular/core';
import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FFlowModule, FCanvasComponent, FZoomDirective, MoveFrontElementsBeforeTargetElementExecution, FFlowComponent, FSelectionChangeEvent, FDraggableDirective } from '@foblex/flow';
import { ToolbarComponent } from '../controls/toolbar/toolbar.component';
import { PropertiesPanelComponent } from '../controls/properties-panel/properties-panel.component';
import { SimpleNoteComponent } from '../nodes/simple-note/simple-note.component';
import { BoardProviderService } from '../services/board-provider.service';
import { CloudBoard, ConnectorPosition, ConnectorType, Node as NodeInfo, NodePosition, NodeType } from '../data/cloudboard';
import { ContextMenu, ContextMenuModule } from 'primeng/contextmenu';
import { Subscription } from 'rxjs';
import { Guid } from 'guid-typescript';
import { FlowControlService, ZoomAction } from '../services/flow-control.service';
import { MenuItem } from 'primeng/api';
import { NodeRegistryService } from '../nodes/node-registry.service';
import { CardNodeComponent } from '../nodes/card-node/card-node.component';
import { LinkCollectionComponent } from '../nodes/link-collection/link-collection.component';
import { ImageNodeComponent } from '../nodes/image-node/image-node.component';
import { CodeBlockComponent } from '../nodes/code-block/code-block.component';

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
    CodeBlockComponent],
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
  private nodeRegistryService = inject(NodeRegistryService);
  private subscriptions: Subscription[] = [];

  public currentCloudBoard: CloudBoard | undefined;
  
  // Properties for the PropertiesPanel
  public propertiesPanelVisible = signal(false);
  public propertiesPanelNodeProperties: NodeInfo | undefined;

  public flowContextMenuItems: MenuItem[] = [
    {
      label: 'Add new node',
      icon: 'pi pi-plus-circle',
      items: [
        {
          label: 'Note',
          icon: 'pi pi-file-edit',
          command: () => this.addNode(NodeType.Note)
        },
        {
          label: 'Card',
          icon: 'pi pi-id-card',
          command: () => this.addNode(NodeType.Card)
        },
        {
          label: 'Link Collection',
          icon: 'pi pi-link',
          command: () => this.addNode(NodeType.LinkCollection)
        },
        {
          label: 'Image',
          icon: 'pi pi-image',
          command: () => this.addNode(NodeType.ImageNode)
        },
        {
          label: 'Code Block',
          icon: 'pi pi-code',
          command: () => this.addNode(NodeType.CodeBlock)
        }
      ]
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
      icon: 'pi pi-trash',
      command: () => this.deleteSelectedNode()
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
        || this.currentCloudBoard.id?.toString() !== id)) {
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
          this.propertiesPanelNodeProperties = nodeProperties;
        }
      }
      else {
        this.propertiesPanelNodeProperties = undefined;
      }
    }, 0);
  }

  protected onNodePositionChanged(newPosition: NodePosition, node: NodeInfo): void {
    if (node) {
      node.position = newPosition;
    }
  }

  protected showFlowContextMenu(event: MouseEvent): void {
    if (this.flowContextMenu()) {
      this.flowContextMenu()?.show(event);
      event.preventDefault();
    }
  }

  protected showNodeContextMenu(event: MouseEvent, node: NodeInfo): void {
    if (this.nodeContextMenu()) {
      // Store the selected node to delete it later if needed
      this.propertiesPanelNodeProperties = node;
      
      this.nodeContextMenu()?.show(event);
      event.preventDefault();
    }
  }

  protected addNode(nodeType: NodeType = NodeType.Note): void {
    if (this.currentCloudBoard) {
      // Get the mouse position from the canvas
      let canvas = this.fCanvas();
      if (!canvas) return;
      
      // Create a unique ID for the new node
      const nodeId = Guid.create().toString();
      
      // Get default properties for the node type
      const defaultProperties = this.nodeRegistryService.getDefaultPropertiesForType(nodeType);
      
      // Create a new node
      const newNode: NodeInfo = {
        id: nodeId,
        name: this.getDefaultNameForNodeType(nodeType),
        position: { x: 100, y: 100 },
        connectors: [
          {
            id: Guid.create().toString(),
            name: 'In',
            position: ConnectorPosition.Left,
            type: ConnectorType.In
          },
          {
            id: Guid.create().toString(),
            name: 'Out',
            position: ConnectorPosition.Right,
            type: ConnectorType.Out
          }
        ],
        type: nodeType,
        properties: defaultProperties
      };
      
      // Add the node to the cloudboard
      this.currentCloudBoard.nodes.push(newNode);
      
      // Set focus to the new node
      setTimeout(() => {
        //this.fFlow()?.selectNodes([newNode.id]);
      }, 0);
    }
  }
  
  protected deleteSelectedNode(): void {
    if (this.currentCloudBoard && this.propertiesPanelNodeProperties) {
      // Get the node to delete
      const nodeToDelete: NodeInfo = this.propertiesPanelNodeProperties;
      
      // Remove all connections to this node
      this.currentCloudBoard.connections = this.currentCloudBoard.connections.filter(conn => 
        !nodeToDelete.connectors.some(c => c.id === conn.fromConnectorId || c.id === conn.toConnectorId)
      );
      
      // Remove the node
      const index = this.currentCloudBoard.nodes.findIndex(n => n.id === nodeToDelete.id);
      if (index >= 0) {
        this.currentCloudBoard.nodes.splice(index, 1);
      }
      
      // Clear selection
      this.propertiesPanelNodeProperties = undefined;
      this.propertiesPanelVisible.set(false);
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

// }
//     node.position = newPosition;
//     console.log('Node Position Changed Event:', newPosition);
//   }

//   protected addNode(): void {
//     // TODO: Implementation for adding a new node
//   }

//   showFlowContextMenu(event: Event): void {
//     let menu = this.flowContextMenu();
//     menu?.show(event);
//   }

//   showNodeContextMenu($event: MouseEvent, node: Node) {
//     let menu = this.nodeContextMenu();
//     menu?.show($event);
//   }
}
