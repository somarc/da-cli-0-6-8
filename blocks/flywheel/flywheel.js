/* Authored rows: one heading-only label cell, then rich-text notes.
 * Native details owns disclosure and keyboard behavior. The numbered wheel is
 * decorative; every meaningful word remains in the authored disclosure.
 * Invalid rows remain visible, extra note cells are retained, decoration is
 * idempotent, and no remote work or automatic progression happens here. */

const SVG_NS = 'http://www.w3.org/2000/svg';
let instance = 0;

export function wheelPoint(index, count, radius = 160) {
  const angle = (-90 + ((360 / count) * index)) * (Math.PI / 180);
  return { x: 240 + (radius * Math.cos(angle)), y: 240 + (radius * Math.sin(angle)) };
}

function svgNode(name, attributes = {}) {
  const element = document.createElementNS(SVG_NS, name);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
  return element;
}

function buildWheel(count) {
  const art = document.createElement('div');
  art.className = 'flywheel-art';
  art.setAttribute('aria-hidden', 'true');
  const svg = svgNode('svg', { viewBox: '0 0 480 480', focusable: 'false' });
  svg.append(
    svgNode('circle', {
      class: 'flywheel-rim', cx: 240, cy: 240, r: 222,
    }),
    svgNode('circle', {
      class: 'flywheel-ticks', cx: 240, cy: 240, r: 207,
    }),
    svgNode('circle', {
      class: 'flywheel-track', cx: 240, cy: 240, r: 160,
    }),
    svgNode('path', { class: 'flywheel-return', d: 'M 290 33 L 304 42 L 288 48' }),
  );
  const leaves = Array.from({ length: count }, (_, index) => {
    const { x, y } = wheelPoint(index, count);
    const group = svgNode('g', {
      class: 'flywheel-leaf',
      transform: `translate(${x.toFixed(2)} ${y.toFixed(2)})`,
    });
    const paper = svgNode('rect', {
      class: 'flywheel-paper',
      x: -39,
      y: -30,
      width: 78,
      height: 60,
      rx: 3,
      transform: `rotate(${index % 2 ? 5 : -5})`,
    });
    const rule = svgNode('path', { class: 'flywheel-paper-rule', d: 'M -20 17 H 20' });
    const number = svgNode('text', { x: 0, y: 7, 'text-anchor': 'middle' });
    number.textContent = String(index + 1).padStart(2, '0');
    group.append(paper, rule, number);
    svg.append(group);
    return group;
  });
  svg.append(
    svgNode('circle', {
      class: 'flywheel-hub-ring', cx: 240, cy: 240, r: 81,
    }),
    svgNode('circle', {
      class: 'flywheel-hub', cx: 240, cy: 240, r: 65,
    }),
  );
  const current = svgNode('text', {
    class: 'flywheel-current', x: 240, y: 259, 'text-anchor': 'middle',
  });
  const total = svgNode('text', {
    class: 'flywheel-total', x: 240, y: 286, 'text-anchor': 'middle',
  });
  total.textContent = `/ ${String(count).padStart(2, '0')}`;
  svg.append(current, total);
  art.append(svg);
  return { art, leaves, current };
}

export default function decorate(block) {
  if (block.dataset.flywheelReady) return;
  block.dataset.flywheelReady = 'true';
  const rows = [...block.children];
  const candidates = rows.filter((row) => {
    const [label, notes] = row.children;
    const heading = label?.firstElementChild;
    return heading?.matches('h2, h3, h4') && heading.textContent.trim()
      && label.children.length === 1 && !label.querySelector('a, button, input') && notes;
  });
  if (!candidates.length) return;

  instance += 1;
  const list = document.createElement('ol');
  list.className = 'flywheel-steps';
  const { art, leaves, current } = buildWheel(candidates.length);
  const disclosures = candidates.map((row, index) => {
    const [label, notes, ...additionalNotes] = row.children;
    const item = document.createElement('li');
    const details = document.createElement('details');
    details.setAttribute('name', `flywheel-${instance}`);
    const summary = document.createElement('summary');
    const number = document.createElement('span');
    number.className = 'flywheel-number';
    number.setAttribute('aria-hidden', 'true');
    number.textContent = String(index + 1).padStart(2, '0');
    const toggle = document.createElement('span');
    toggle.className = 'flywheel-toggle';
    toggle.setAttribute('aria-hidden', 'true');
    toggle.textContent = '+';
    summary.append(number, label.firstElementChild, toggle);
    notes.classList.add('flywheel-notes');
    additionalNotes.forEach((cell) => notes.append(...cell.childNodes));
    details.append(summary, notes);
    item.append(details);
    list.append(item);
    return details;
  });
  const syncWheel = () => {
    const active = disclosures.findIndex((details) => details.hasAttribute('open'));
    leaves.forEach((leaf, index) => leaf.classList.toggle('is-current', index === active));
    current.textContent = active < 0 ? '—' : String(active + 1).padStart(2, '0');
  };
  disclosures.forEach((details) => details.addEventListener('toggle', syncWheel));
  disclosures[0].setAttribute('open', '');
  syncWheel();

  const layout = document.createElement('div');
  layout.className = 'flywheel-layout';
  layout.append(art, list);
  candidates[0].before(layout);
  candidates.forEach((row) => row.remove());
}
