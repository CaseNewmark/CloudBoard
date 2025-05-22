import { Injectable, Type } from '@angular/core';
import { NodeType } from '../data/cloudboard';
import { SimpleNoteComponent } from './simple-note/simple-note.component';
import { CardNodeComponent } from './card-node/card-node.component';
import { LinkCollectionComponent } from './link-collection/link-collection.component';
import { ImageNodeComponent } from './image-node/image-node.component';
import { CodeBlockComponent } from './code-block/code-block.component';

@Injectable({
  providedIn: 'root'
})
export class NodeRegistryService {
  private nodeTypes = new Map<NodeType, Type<any>>();
  
  constructor() {
    this.registerNodeTypes();
  }
  
  private registerNodeTypes(): void {
    this.nodeTypes.set(NodeType.Note, SimpleNoteComponent);
    this.nodeTypes.set(NodeType.Card, CardNodeComponent);
    this.nodeTypes.set(NodeType.LinkCollection, LinkCollectionComponent);
    this.nodeTypes.set(NodeType.ImageNode, ImageNodeComponent);
    this.nodeTypes.set(NodeType.CodeBlock, CodeBlockComponent);
  }
  
  getComponentForType(type: NodeType): Type<any> {
    return this.nodeTypes.get(type) || SimpleNoteComponent;
  }
  
  getDefaultPropertiesForType(type: NodeType): any {
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
          url: 'https://via.placeholder.com/150', 
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
}
