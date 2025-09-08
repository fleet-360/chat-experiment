export function insertAtCaret(
  el: HTMLInputElement | HTMLTextAreaElement | null,
  currentValue: string,
  text: string
): string {
  const current = currentValue ?? "";
  const start = el?.selectionStart ?? current.length;
  const end = el?.selectionEnd ?? start;
  const next = current.slice(0, start) + text + current.slice(end);
  queueMicrotask(() => {
    try {
      if (el) {
        const pos = start + text.length;
        el.setSelectionRange(pos, pos);
        el.focus();
      }
    } catch {}
  });
  return next;
}

