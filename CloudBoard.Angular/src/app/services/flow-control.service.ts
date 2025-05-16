import { Injectable, Signal } from '@angular/core';
import { FCanvasComponent, FZoomDirective } from '@foblex/flow';
import { BehaviorSubject } from 'rxjs';

export enum ZoomAction {
  ZoomIn,
  ZoomOut,
  Reset
}

@Injectable({
  providedIn: 'root'
})
export class FlowControlService {
  public Zoom: BehaviorSubject<ZoomAction> = new BehaviorSubject<ZoomAction>(ZoomAction.Reset);

  constructor() { }

  public zoomIn() {
    this.Zoom.next(ZoomAction.ZoomIn);
  }
  public zoomOut() {
    this.Zoom.next(ZoomAction.ZoomOut);
  }
  public resetZoom() {
    this.Zoom.next(ZoomAction.Reset);
  }
}
