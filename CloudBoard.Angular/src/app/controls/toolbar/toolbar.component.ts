import { Component, inject, OnInit } from '@angular/core';
import { FlowControlService } from '../../services/flow-control.service';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'toolbar',
  imports: [
    ButtonModule,
    ToolbarModule
  ],
  providers: [
  ],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.css'
})
export class ToolbarComponent implements OnInit {

  flowControlService: FlowControlService = inject(FlowControlService);

  constructor() { }

  ngOnInit(): void {
  }
}
