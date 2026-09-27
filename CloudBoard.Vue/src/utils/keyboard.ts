/** True when the key event comes from a text field, where the canvas shortcuts must not fire. */
export function isFromEditableElement(event: KeyboardEvent): boolean {
  const target = event.target as HTMLElement | null;
  if (!target) return false;
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}
