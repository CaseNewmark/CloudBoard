import type { MenuItem } from 'primevue/menuitem';
import { type Node, type NodePosition, NodeType } from '@/models/cloudboard';

export type AddNodeCallback = (nodeType: NodeType, position: NodePosition) => void;
export type DeleteNodeCallback = (node: Node) => void;
export type OpenPropertiesPanelForNodeCallback = (node: Node) => void;

export function getFlowContextMenuItems(position: NodePosition, addNode: AddNodeCallback): MenuItem[] {
  return [
    {
      label: 'Add new node',
      icon: 'pi pi-plus-circle',
      items: [
        { label: 'Note', icon: 'pi pi-file-edit', command: () => addNode(NodeType.Note, position) },
        { label: 'Card', icon: 'pi pi-id-card', command: () => addNode(NodeType.Card, position) },
        {
          label: 'Link Collection',
          icon: 'pi pi-link',
          command: () => addNode(NodeType.LinkCollection, position),
        },
        { label: 'Image', icon: 'pi pi-image', command: () => addNode(NodeType.ImageNode, position) },
        { label: 'Code Block', icon: 'pi pi-code', command: () => addNode(NodeType.CodeBlock, position) },
      ],
    },
  ];
}

export function getNodeContextMenuItems(
  node: Node,
  deleteNode: DeleteNodeCallback,
  openPropertiesPanelForNode: OpenPropertiesPanelForNodeCallback,
): MenuItem[] {
  return [
    { label: 'Remove node', icon: 'pi pi-trash', command: () => deleteNode(node) },
    { separator: true },
    { label: 'Properties Panel', icon: 'pi pi-cog', command: () => openPropertiesPanelForNode(node) },
  ];
}
