import type { Directive } from 'vue';

/** v-blur-on-enter: blurs the element when Enter is pressed, matching CloudBoard.Angular's blurOnEnter directive. */
export const blurOnEnter: Directive<HTMLElement> = {
  mounted(el) {
    el.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        el.blur();
      }
    });
  },
};
