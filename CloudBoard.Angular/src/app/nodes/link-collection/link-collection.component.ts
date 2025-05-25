import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
import { FormsModule } from '@angular/forms';
import { FFlowModule } from '@foblex/flow';
import { NgFor } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { BaseNodeComponent } from '../base-node.component';
import { LinkCollectionProperties, LinkProperties } from '../../data/cloudboard';

@Component({
  selector: 'link-collection',
  standalone: true,
  imports: [
    FFlowModule,
    CardModule,
    FormsModule,
    ButtonModule
  ],
  templateUrl: './link-collection.component.html',
  styleUrl: './link-collection.component.css'
})
export class LinkCollectionComponent extends BaseNodeComponent {
  // Get links with default value if not set
  get links(): LinkProperties[] {
    return this.getProperty<LinkProperties[]>('links', []);
  }
  
  // Set links property
  set links(value: LinkProperties[]) {
    this.updateProperty('links', value);
  }
  
  // Helper method to open a link
  openLink(url: string, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    window.open(url, '_blank');
  }
}
