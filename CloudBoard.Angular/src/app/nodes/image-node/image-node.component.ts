import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
import { FormsModule } from '@angular/forms';
import { FFlowModule } from '@foblex/flow';
import { ImageModule } from 'primeng/image';
import { BaseNodeComponent } from '../base-node.component';
import { ImageNodeProperties } from '../../data/cloudboard';

@Component({
  selector: 'image-node',
  standalone: true,
  imports: [
    FFlowModule,
    CardModule,
    FormsModule,
    ImageModule
  ],
  templateUrl: './image-node.component.html',
  styleUrl: './image-node.component.css'
})
export class ImageNodeComponent extends BaseNodeComponent {
  // Get image URL with default value if not set
  get url(): string {
    return this.getProperty<string>('url', 'https://picsum.photos/300/200');
  }
  
  // Set image URL property
  set url(value: string) {
    this.updateProperty('url', value);
  }
  
  // Get alt text with default value if not set
  get alt(): string {
    return this.getProperty<string>('alt', '');
  }
  
  // Set alt text property
  set alt(value: string) {
    this.updateProperty('alt', value);
  }
  
  // Get caption with default value if not set
  get caption(): string {
    return this.getProperty<string>('caption', '');
  }
  
  // Set caption property
  set caption(value: string) {
    this.updateProperty('caption', value);
  }
}
