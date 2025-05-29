import { Injectable } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Node, NodePosition, NodeType } from '../data/cloudboard';

export type AddNodeCallback = (nodeType: NodeType, position: NodePosition) => void;
export type DeleteNodeCallback = (node: Node) => void;
export type OpenPropertiesPanelForNodeCallback = (node: Node) => void;

@Injectable({
    providedIn: 'root'
})
export class ContextMenuService {

    constructor() { }

    public getFlowContextMenuItems(position: NodePosition, addNode: AddNodeCallback): MenuItem[] {
        return [
            {
                label: 'Add new node',
                icon: 'pi pi-plus-circle',
                items: [
                    {
                        label: 'Note',
                        icon: 'pi pi-file-edit',
                        command: (e) => addNode(NodeType.Note, position)
                    },
                    {
                        label: 'Card',
                        icon: 'pi pi-id-card',
                        command: (e) => addNode(NodeType.Card, position)
                    },
                    {
                        label: 'Link Collection',
                        icon: 'pi pi-link',
                        command: (e) => addNode(NodeType.LinkCollection, position)
                    },
                    {
                        label: 'Image',
                        icon: 'pi pi-image',
                        command: (e) => addNode(NodeType.ImageNode, position)
                    },
                    {
                        label: 'Code Block',
                        icon: 'pi pi-code',
                        command: (e) => addNode(NodeType.CodeBlock, position)
                    }
                ]
            }
        ];
    }

    public getNodeContextMenuItems(node: Node, deleteNode: DeleteNodeCallback, openPropertiesPanelForNode: OpenPropertiesPanelForNodeCallback): MenuItem[] {
        return [
            {
                label: 'Remove node',
                icon: 'pi pi-trash',
                command: (e) => deleteNode(node)
            },
            {
                separator: true
            },
            {
                label: 'Properties Panel',
                icon: 'pi pi-cog',
                command: (e) => openPropertiesPanelForNode(node)
            }
        ];
    }
}
