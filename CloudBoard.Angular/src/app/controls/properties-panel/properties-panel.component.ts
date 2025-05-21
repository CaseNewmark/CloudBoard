import { Component, input, model, output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { NgClass } from '@angular/common';
import { Node } from '../../data/cloudboard';

@Component({
  selector: 'properties-panel',
  imports: [
    ButtonModule,
    FormsModule,
    InputTextModule,
    NgClass
  ],
  templateUrl: './properties-panel.component.html',
  styleUrl: './properties-panel.component.css'
})
export class PropertiesPanelComponent {
  visible = model<boolean>(false);
  nodeProperties = model<Node | undefined>(undefined);
}
