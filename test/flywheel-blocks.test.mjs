import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseHTML } from 'linkedom';
import decorateFlywheel, { wheelPoint } from '../blocks/flywheel/flywheel.js';
import decorateFieldStory from '../blocks/field-story/field-story.js';
import decorateEvidenceLinks, { evidenceUrl } from '../blocks/evidence-links/evidence-links.js';

// Synthetic authoring-shape tests, not a mirror of DA-authored page content.
function fixture(className, rows) {
  const { document, window } = parseHTML(`<html><body><main><div class="${className}">${rows}</div></main></body></html>`);
  globalThis.document = document;
  return { block: document.querySelector(`.${className}`), document, window };
}

test('wheel geometry is deterministic, distinct and contained for normal author counts', () => {
  for (const count of [1, 2, 6, 8]) {
    const points = Array.from({ length: count }, (_, index) => wheelPoint(index, count));
    assert.equal(new Set(points.map((point) => JSON.stringify(point))).size, count);
    for (const { x, y } of points) {
      assert.ok(x >= 80 && x <= 400);
      assert.ok(y >= 80 && y <= 400);
      assert.ok(Math.abs(Math.hypot(x - 240, y - 240) - 160) < 0.00001);
    }
  }
});

test('flywheel preserves authored heading and notes nodes, including extra cells', () => {
  const { block } = fixture('flywheel', '<div><div><h3 id="test-heading">First label</h3></div><div><p id="test-notes">Primary notes</p></div><div><a id="test-extra" href="/test">Extra notes</a></div></div>');
  const heading = block.querySelector('h3');
  const notes = block.querySelector('#test-notes');
  const extra = block.querySelector('#test-extra');
  decorateFlywheel(block);
  assert.equal(block.querySelector('summary h3'), heading);
  assert.equal(block.querySelector('.flywheel-notes #test-notes'), notes);
  assert.equal(block.querySelector('.flywheel-notes #test-extra'), extra);
  assert.equal(block.querySelector('details').hasAttribute('open'), true);
  assert.equal(block.querySelector('.flywheel-art').getAttribute('aria-hidden'), 'true');
  assert.equal(block.querySelector('.flywheel-current').textContent, '01');
  const after = block.innerHTML;
  decorateFlywheel(block);
  assert.equal(block.innerHTML, after);
});

test('flywheel retains malformed rows without unnamed disclosures', () => {
  const rows = '<div id="plain"><div><p>Not a heading</p></div><div>Retain this</div></div><div id="missing"><div><h3>Missing notes</h3></div></div><div id="interactive"><div><h3><a href="/test">Interactive label</a></h3></div><div>Keep link</div></div>';
  const { block } = fixture('flywheel', rows);
  const before = block.innerHTML;
  decorateFlywheel(block);
  assert.equal(block.innerHTML, before);
  assert.equal(block.querySelectorAll('details').length, 0);
});

test('flywheel handles sparse and added rows and isolates each native disclosure group', () => {
  const rows = Array.from({ length: 8 }, (_, index) => `<div><div><h3>Label ${index}</h3></div><div>Notes ${index}</div></div>`).join('');
  const { block, document } = fixture('flywheel', rows);
  const second = document.createElement('div');
  second.innerHTML = rows;
  block.after(second);
  decorateFlywheel(block);
  decorateFlywheel(second);
  assert.equal(block.querySelectorAll('details').length, 8);
  assert.equal(block.querySelectorAll('.flywheel-leaf').length, 8);
  const group = block.querySelector('details').getAttribute('name');
  assert.ok([...block.querySelectorAll('details')].every((details) => details.getAttribute('name') === group));
  assert.notEqual(second.querySelector('details').getAttribute('name'), group);
});

test('wheel reflects native open and closed state without automatically reopening a step', () => {
  const { block, window } = fixture('flywheel', '<div><div><h3>One</h3></div><div>Notes one</div></div><div><div><h3>Two</h3></div><div>Notes two</div></div>');
  decorateFlywheel(block);
  const [one, two] = block.querySelectorAll('details');
  one.removeAttribute('open');
  two.setAttribute('open', '');
  two.dispatchEvent(new window.Event('toggle'));
  assert.equal(block.querySelector('.flywheel-current').textContent, '02');
  assert.equal(block.querySelectorAll('.flywheel-leaf.is-current').length, 1);
  two.removeAttribute('open');
  two.dispatchEvent(new window.Event('toggle'));
  assert.equal(block.querySelector('.flywheel-current').textContent, '—');
  assert.equal(block.querySelectorAll('details[open]').length, 0);
  assert.equal(block.querySelectorAll('.flywheel-leaf.is-current').length, 0);
});

test('field story preserves picture, alt, rich text and extra content', () => {
  const { block } = fixture('field-story', '<div><div><picture><img src="/test.webp" alt="Authored alternative"></picture><p>Caption</p></div><div><h2>Authored heading</h2></div><div><p id="extra">Extra field</p></div></div>');
  const picture = block.querySelector('picture');
  const extra = block.querySelector('#extra');
  decorateFieldStory(block);
  assert.equal(block.querySelector('.field-story-media picture'), picture);
  assert.equal(block.querySelector('img').alt, 'Authored alternative');
  assert.equal(block.querySelector('img').loading, 'lazy');
  assert.equal(block.querySelector('.field-story-copy #extra'), extra);
  const after = block.innerHTML;
  decorateFieldStory(block);
  assert.equal(block.innerHTML, after);
});

test('field story leaves missing image or copy shapes unchanged', () => {
  const { block } = fixture('field-story', '<div><div>Text only</div><div>Keep this too</div></div><div><div><img src="/test.webp" alt="Keep image"></div></div>');
  const before = block.innerHTML;
  decorateFieldStory(block);
  assert.equal(block.innerHTML, before);
});

test('evidence URLs accept explicit HTTPS and refuse ambiguous or unsafe destinations', () => {
  assert.equal(evidenceUrl(' https://main--another-site--example.aem.page/case?view=1#proof '), 'https://main--another-site--example.aem.page/case?view=1#proof');
  for (const value of ['', '/case', '//example.test/case', 'javascript:alert(1)', 'data:text/html,no', 'http://example.test', 'https://user:password@example.test']) {
    assert.equal(evidenceUrl(value), null, value);
  }
});

test('evidence links retain the literal destination and original label nodes', () => {
  const url = 'https://main--another-site--example.aem.page/case';
  const { block } = fixture('evidence-links', `<div><div><p id="label">Visit the case</p></div><div><p><code>${url}</code></p></div><div id="extra">Extra context</div></div>`);
  const label = block.querySelector('#label');
  const code = block.querySelector('code');
  decorateEvidenceLinks(block);
  assert.equal(block.querySelector('a').getAttribute('href'), url);
  assert.equal(block.querySelector('a #label'), label);
  assert.equal(block.querySelector('code'), code);
  assert.equal(code.textContent, url);
  assert.equal(block.querySelector('#extra').textContent, 'Extra context');
  const after = block.innerHTML;
  decorateEvidenceLinks(block);
  assert.equal(block.innerHTML, after);
});

test('evidence links refuse nested interactions, multiple URLs and already anchored destinations', () => {
  for (const row of [
    '<div><div><a href="/wrong">Nested link</a></div><div><code>https://example.test/</code></div></div>',
    '<div><div>Multiple</div><div><code>https://example.test/</code><code>https://other.test/</code></div></div>',
    '<div><div>Anchored</div><div><a href="/rewritten"><code>https://example.test/</code></a></div></div>',
    '<div><div>Bad scheme</div><div><code>javascript:alert(1)</code></div></div>',
  ]) {
    const { block } = fixture('evidence-links', row);
    const before = block.innerHTML;
    decorateEvidenceLinks(block);
    assert.equal(block.innerHTML, before);
  }
});
