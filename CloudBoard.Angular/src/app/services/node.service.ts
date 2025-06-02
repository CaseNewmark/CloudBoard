import { inject, Injectable } from '@angular/core';
import { NodePosition, Connector, NodeType, NodeProperties, Node } from '../data/cloudboard';
import { firstValueFrom, map, Observable, tap } from 'rxjs';
import { ApiClientService, NodeDto } from './api-client-service';
import { mapNodeDtoToNode, mapNodeToNodeDto } from '../data/mapper';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConnectionService } from './connection.service';

@Injectable({
  providedIn: 'root'
})
export class NodeService {
  private apiClient: ApiClientService = inject(ApiClientService);
  private connectionService: ConnectionService = inject(ConnectionService);
  private messageService: MessageService = inject(MessageService);
  private confirmationService: ConfirmationService = inject(ConfirmationService);

  constructor() { }

  public createNode(cloudboardId: string, node: Node): Observable<Node> {
    const dto = mapNodeToNodeDto(node);
    return this.apiClient.createNode(cloudboardId, dto).pipe(
      map((newDto: NodeDto) => mapNodeDtoToNode(newDto)),
      tap((newNode: Node) => this.messageService.add({
                                  severity: 'success',
                                  summary: 'Success',
                                  detail: `${newNode.type} created successfully`}),
          (error) => this.messageService.add({
                          severity: 'error',
                          summary: 'Error',
                          detail: `Failed to create node: ${error.message || 'Unknown error'}`})),  
    );
  }

  public updateNode(nodeId: string, updatedNode: Node): Observable<Node> {
    const dto = mapNodeToNodeDto(updatedNode);
    return this.apiClient.updateNode(nodeId, dto).pipe(
      map((updatedDto: NodeDto) => mapNodeDtoToNode(updatedDto)),
      tap((node: Node) => { },
          (error) => this.messageService.add({
                          severity: 'error',
                          summary: 'Error',
                          detail: `Failed to update node: ${error.message || 'Unknown error'}`})),
    );
  }

  public deleteNode(nodeId: string): Observable<boolean> {
    return this.apiClient.deleteNode(nodeId);
  }

  public deleteNodesAndConnections(nodeIds: string[], connectionIds: string[]): Promise<boolean[]> {
    return new Promise((resolve, reject) => {
      this.confirmationService.confirm({
        message: `Are you sure you want to delete ${nodeIds.length} node${nodeIds.length > 1 ? 's' : ''} and ${connectionIds.length} connection${connectionIds.length > 1 ? 's' : ''}?`,
        header: 'Delete Confirmation',
        icon: 'pi pi-exclamation-triangle',
        acceptButtonStyleClass: 'p-button-danger',
        rejectButtonStyleClass: 'p-button-text',
        accept: () => {
          const deleteOperations: Promise<boolean>[] = [];
          for (const nodeId of nodeIds) {
            deleteOperations.push(firstValueFrom(this.deleteNode(nodeId)));
          }
          for (const connectionId of connectionIds) {
            deleteOperations.push(firstValueFrom(this.connectionService.deleteConnection(connectionId)));
          }
          Promise.all(deleteOperations)
            .then(results => resolve(results))
            .catch(error => reject(error));
        },
        reject: () => {
          resolve([]);
        }
      });
    });
  }
    
  public getDefaultPropertiesForType(type: NodeType): any {
    switch (type) {
      case NodeType.Note:
        return { content: 'New note content...' };
      case NodeType.Card:
        return { 
          title: 'Card Title', 
          subtitle: 'Card Subtitle', 
          content: 'Card content goes here...',
          imageUrl: '' 
        };
      case NodeType.LinkCollection:
        return { 
          links: [
            { title: 'Example Link', url: 'https://example.com', iconClass: 'pi pi-external-link' }
          ] 
        };
      case NodeType.ImageNode:
        return { 
          url: 'https://picsum.photos/300/200', 
          alt: 'Sample image',
          caption: 'Image caption' 
        };
      case NodeType.CodeBlock:
        return { 
          code: '// Your code here\nconsole.log("Hello World!");', 
          language: 'javascript',
          showLineNumbers: true 
        };
      default:
        return {};
    }
  }

  public getDefaultNameForNodeType(type: NodeType): string {
    switch (type) {
      case NodeType.Note: return 'New Note';
      case NodeType.Card: return 'New Card';
      case NodeType.LinkCollection: return 'New Link Collection';
      case NodeType.ImageNode: return 'New Image';
      case NodeType.CodeBlock: return 'New Code Block';
      default: return 'New Node';
    }
  }
}
