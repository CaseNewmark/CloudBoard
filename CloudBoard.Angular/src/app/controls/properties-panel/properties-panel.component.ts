import { Component, input, model, output, EventEmitter, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InplaceModule } from 'primeng/inplace';
import { NgClass, NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { Node, NodeType } from '../../data/cloudboard';
import { BlurOnEnterDirective } from '../../helpers/blur-on-enter.directive';
import { TextareaModule } from 'primeng/textarea';
import { ColorPickerModule } from 'primeng/colorpicker';
import { NodeRegistryService } from '../../nodes/node-registry.service';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { InputSwitchModule } from 'primeng/inputswitch';

@Component({
  selector: 'properties-panel',
  imports: [
    ButtonModule,
    FormsModule,
    InputTextModule,
    TextareaModule,
    InplaceModule,
    NgClass,
    NgFor,
    NgIf,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    ColorPickerModule,
    DropdownModule,
    CheckboxModule,
    InputSwitchModule,
    BlurOnEnterDirective
  ],
  templateUrl: './properties-panel.component.html',
  styleUrl: './properties-panel.component.css'
})
export class PropertiesPanelComponent {
  visible = model<boolean>(false);
  nodeProperties = model<Node|undefined>(undefined);
  
  nodeTypes = Object.values(NodeType);
  nodeTypeLabels = {
    [NodeType.Note]: 'Simple Note',
    [NodeType.Card]: 'Card',
    [NodeType.LinkCollection]: 'Link Collection',
    [NodeType.ImageNode]: 'Image',
    [NodeType.CodeBlock]: 'Code Block'
  };
  
  languageOptions = [
    { name: 'JavaScript', value: 'javascript' },
    { name: 'TypeScript', value: 'typescript' },
    { name: 'HTML', value: 'html' },
    { name: 'CSS', value: 'css' },
    { name: 'Python', value: 'python' },
    { name: 'Java', value: 'java' },
    { name: 'C#', value: 'csharp' },
    { name: 'JSON', value: 'json' }
  ];

  private nodeRegistryService = inject(NodeRegistryService);

  changeNodeType(newType: NodeType): void {
    if (this.nodeProperties()) {
      // Store current node properties that shouldn't change
      const node = this.nodeProperties()!;
      const id = node.id;
      const name = node.name;
      const position = node.position;
      const connectors = node.connectors;
      
      // Update the node type and set default properties for that type
      node.type = newType;
      node.properties = this.nodeRegistryService.getDefaultPropertiesForType(newType);
      
      // Restore unchanged properties
      node.id = id;
      node.name = name;
      node.position = position;
      node.connectors = connectors;
    }
  }
  
  addLink(): void {
    if (this.nodeProperties() && this.nodeProperties()!.type === NodeType.LinkCollection) {
      //const links = this.nodeProperties()!.properties.links || [];
      // links.push({ title: 'New Link', url: 'https://example.com', iconClass: 'pi pi-external-link' });
      // this.nodeProperties()!.properties.links = links;
    }
  }
  
  removeLink(index: number): void {
    if (this.nodeProperties() && this.nodeProperties()!.type === NodeType.LinkCollection) {
      // const links = this.nodeProperties()!.properties.links || [];
      // links.splice(index, 1);
      // this.nodeProperties()!.properties.links = links;
    }
  }
}
