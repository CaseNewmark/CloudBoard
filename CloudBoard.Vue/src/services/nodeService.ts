import { apiClient, type NodeDto } from './apiClient';
import { mapNodeDtoToNode, mapNodeToNodeDto } from '@/models/mapper';
import { type Node, NodeType } from '@/models/cloudboard';

export async function createNode(cloudboardId: string, node: Node): Promise<Node> {
  const dto = mapNodeToNodeDto(node);
  const newDto = await apiClient.createNode(cloudboardId, dto);
  return mapNodeDtoToNode(newDto);
}

export async function updateNode(nodeId: string, updatedNode: Node): Promise<Node> {
  const dto = mapNodeToNodeDto(updatedNode);
  const updatedDto: NodeDto = await apiClient.updateNode(nodeId, dto);
  return mapNodeDtoToNode(updatedDto);
}

export async function deleteNode(nodeId: string): Promise<boolean> {
  return apiClient.deleteNode(nodeId);
}

export function getDefaultPropertiesForType(type: NodeType): Record<string, any> {
  switch (type) {
    case NodeType.Note:
      return { content: 'New note content...' };
    case NodeType.Card:
      return {
        title: 'Card Title',
        subtitle: 'Card Subtitle',
        content: 'Card content goes here...',
        imageUrl: '',
      };
    case NodeType.LinkCollection:
      return {
        links: [{ title: 'Example Link', url: 'https://example.com', iconClass: 'pi pi-external-link' }],
      };
    case NodeType.ImageNode:
      return {
        url: 'https://picsum.photos/300/200',
        alt: 'Sample image',
        caption: 'Image caption',
      };
    case NodeType.CodeBlock:
      return {
        code: '// Your code here\nconsole.log("Hello World!");',
        language: 'javascript',
        showLineNumbers: true,
      };
    default:
      return {};
  }
}

export function getDefaultNameForNodeType(type: NodeType): string {
  switch (type) {
    case NodeType.Note:
      return 'New Note';
    case NodeType.Card:
      return 'New Card';
    case NodeType.LinkCollection:
      return 'New Link Collection';
    case NodeType.ImageNode:
      return 'New Image';
    case NodeType.CodeBlock:
      return 'New Code Block';
    default:
      return 'New Node';
  }
}
