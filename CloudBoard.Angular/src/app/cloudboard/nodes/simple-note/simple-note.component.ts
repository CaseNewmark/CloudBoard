import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
import { FormsModule } from '@angular/forms';
import { FFlowModule } from '@foblex/flow';
import { TextareaModule } from 'primeng/textarea';

import { BaseNodeComponent } from '../base-node.component';
import { Node, NoteProperties } from '../../models/cloudboard';

@Component({
  selector: 'simple-note',
  standalone: true,
  imports: [
    FFlowModule, 
    CardModule,
    FormsModule,
    TextareaModule
  ],
  templateUrl: './simple-note.component.html',
  styleUrl: './simple-note.component.css'
})
export class SimpleNoteComponent extends BaseNodeComponent {
  // Get content with default value if not set
  get content(): string {
    return this.getProperty<string>('content', 'Empty note...');
  }
  
  // Set content property
  set content(value: string) {
    this.updateProperty('content', value);
  }
  
  // Get background color with default value if not set
  get backgroundColor(): string {
    return this.getProperty<string>('backgroundColor', 'rgb(255, 249, 212)');
  }
  
  // Set background color property
  set backgroundColor(value: string) {
    this.updateProperty('backgroundColor', value);
  }
  
  // Get text color with default value if not set
  get textColor(): string {
    return this.getProperty<string>('textColor', '#000000');
  }
  
  // Set text color property
  set textColor(value: string) {
    this.updateProperty('textColor', value);
  }
}
