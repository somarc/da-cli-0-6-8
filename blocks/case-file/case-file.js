/* Each authored row is one case: a heading-only label cell and rich-text notes.
 * Native details owns interaction. No commands execute and no content is fetched.
 * Missing/invalid cells remain visible instead of becoming unnamed controls. */
export default function decorate(block) {
  if (block.dataset.caseFileReady) return;
  block.dataset.caseFileReady = 'true';
  [...block.children].forEach((row, index) => {
    const [label, notes, ...additionalNotes] = row.children;
    const heading = label?.firstElementChild;
    if (!heading?.matches('h2, h3, h4') || !heading.textContent.trim() || !notes
      || label.children.length !== 1 || label.querySelector('a, button, input')) return;

    const details = document.createElement('details');
    const summary = document.createElement('summary');
    const number = document.createElement('span');
    number.className = 'case-file-number';
    number.setAttribute('aria-hidden', 'true');
    number.textContent = String(index + 1).padStart(2, '0');
    const toggle = document.createElement('span');
    toggle.className = 'case-file-toggle';
    toggle.setAttribute('aria-hidden', 'true');
    toggle.textContent = '+';
    summary.append(number, heading, toggle);
    notes.classList.add('case-file-notes');
    additionalNotes.forEach((cell) => notes.append(...cell.childNodes));
    details.append(summary, notes);
    row.replaceWith(details);
  });
}
