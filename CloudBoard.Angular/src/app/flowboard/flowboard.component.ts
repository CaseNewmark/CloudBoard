import { ChangeDetectionStrategy } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { FFlowModule } from '@foblex/flow';
import { ToolbarComponent } from '../controls/toolbar/toolbar.component';

@Component({
  selector: 'app-flowboard',
  imports: [FFlowModule, ToolbarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './flowboard.component.html',
  styleUrl: './flowboard.component.css',
})
export class FlowboardComponent implements OnInit {
  constructor() { }

  ngOnInit(): void {
  }
}
