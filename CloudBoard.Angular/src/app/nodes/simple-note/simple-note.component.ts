import { Component, input } from '@angular/core';
import { CardModule } from 'primeng/card';
import { FFlowModule } from '@foblex/flow';

import { Node as NodeInfo } from '../../data/cloudboard';

@Component({
  selector: 'simple-note',
  imports: [ FFlowModule, CardModule ],
  templateUrl: './simple-note.component.html',
  styleUrl: './simple-note.component.css'
})
export class SimpleNoteComponent {
  node: NodeInfo|any = input<NodeInfo>();
}
