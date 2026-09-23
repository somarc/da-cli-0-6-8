/* A reusable, authored calling card. First row: mark, then copy/link.
 * Decoration adds layout classes only; the project's destination stays in DA. */
export default function decorate(block) {
  const row = block.firstElementChild;
  if (!row) return;
  row.classList.add('site-signature-inner');
  const [mark, body] = row.children;
  mark?.classList.add('site-signature-mark');
  body?.classList.add('site-signature-body');
}
