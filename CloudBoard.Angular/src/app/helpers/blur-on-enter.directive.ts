import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[blurOnEnter]',
})
export class BlurOnEnterDirective {

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      const target = event.target as HTMLElement;
      target.blur();
    }
  }

  constructor() { }

}
