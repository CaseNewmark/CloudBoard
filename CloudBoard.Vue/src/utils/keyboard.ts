/** True when the event (a key press, copy or paste) comes from a text field, where canvas shortcuts must not fire. */
export function isFromEditableElement(event: Event): boolean {
  const target = event.target as HTMLElement | null;
  if (!target) return false;
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}
