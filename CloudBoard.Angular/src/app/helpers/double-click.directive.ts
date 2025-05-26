import { Directive, HostListener, OnDestroy, output } from '@angular/core';
import { buffer, debounceTime, filter, map, Subject } from 'rxjs';

@Directive({
  selector: "[dblclick]"
})
export class DoubleClickDirective implements OnDestroy {
  private click$ = new Subject<PointerEvent>();

  dblclick = output<PointerEvent>();

  @HostListener("click", ["$event"])
  onClick(event: PointerEvent) {
    this.click$.next(event);
  }

  ngOnInit() {
    this.click$
      .pipe(
        buffer(this.click$.pipe(debounceTime(300))),
        filter(list => list.length === 2),
        map(list => list[1])
      )
      .subscribe((e: PointerEvent) => {
        this.dblclick.emit(e);
      });
  }

  ngOnDestroy() {
    this.click$.complete();
  }
}