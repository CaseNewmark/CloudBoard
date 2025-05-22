import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
import { FormsModule } from '@angular/forms';
import { FFlowModule } from '@foblex/flow';
import { ButtonModule } from 'primeng/button';
import { ImageModule } from 'primeng/image';
import { BaseNodeComponent } from '../base-node.component';
import { CardProperties } from '../../data/cloudboard';

@Component({
  selector: 'card-node',
  standalone: true,
  imports: [
    FFlowModule, 
    CardModule,
    FormsModule,
    ButtonModule,
    ImageModule
  ],
  templateUrl: './card-node.component.html',
  styleUrl: './card-node.component.css'
})
export class CardNodeComponent extends BaseNodeComponent {
  // Get title with default value if not set
  get title(): string {
    return this.getProperty<string>('title', 'Card Title');
  }
  
  // Set title property
  set title(value: string) {
    this.updateProperty('title', value);
  }
  
  // Get subtitle with default value if not set
  get subtitle(): string {
    return this.getProperty<string>('subtitle', '');
  }
  
  // Set subtitle property
  set subtitle(value: string) {
    this.updateProperty('subtitle', value);
  }
  
  // Get image URL with default value if not set
  get imageUrl(): string {
    return this.getProperty<string>('imageUrl', '');
  }
  
  // Set image URL property
  set imageUrl(value: string) {
    this.updateProperty('imageUrl', value);
  }
  
  // Get content with default value if not set
  get content(): string {
    return this.getProperty<string>('content', 'Card content...');
  }
  
  // Set content property
  set content(value: string) {
    this.updateProperty('content', value);
  }
  
  // Check if the card has an image
  get hasImage(): boolean {
    return !!this.imageUrl && this.imageUrl.trim().length > 0;
  }
}
