/* Cross-site EDS links are rewritten to local paths by the delivery pipeline.
 * Author a label and a literal HTTPS URL in a code element, not an anchor. This
 * small enhancement creates the intended link from that visible authored URL.
 * Without JS, both the label and copyable URL remain visible. No fetching occurs. */
export function evidenceUrl(value) {
  try {
    const url = new URL(value.trim());
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : null;
  } catch {
    return null;
  }
}

export default function decorate(block) {
  if (block.dataset.evidenceLinksReady) return;
  block.dataset.evidenceLinksReady = 'true';
  [...block.children].forEach((row) => {
    const [label, destination] = row.children;
    const code = destination?.querySelector('code');
    const url = code && evidenceUrl(code.textContent);
    if (!url || destination.querySelectorAll('code').length !== 1 || destination.querySelector('a')
      || !label?.textContent.trim() || label.querySelector('a, button, input, select, textarea, summary, [contenteditable], [tabindex]')) return;
    const link = document.createElement('a');
    link.className = 'evidence-links-link';
    link.href = url;
    link.append(...label.childNodes);
    const arrow = document.createElement('span');
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '↗';
    link.append(arrow);
    label.append(link);
    row.classList.add('evidence-links-row');
    destination.classList.add('evidence-links-destination');
  });
}
