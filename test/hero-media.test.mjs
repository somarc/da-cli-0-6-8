import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseHTML } from 'linkedom';
import decorate, { mediaLinks } from '../blocks/painterly-hero/painterly-hero.js';

test('authored picture image identity and parser-selected source are retained', () => {
  const image = { currentSrc: 'https://example.test/selected.webp', src: 'https://example.test/fallback.webp' };
  const cell = {
    querySelector: () => image,
    querySelectorAll: () => [{ href: 'https://example.test/legacy.webp' }, { href: 'https://example.test/motion.webm' }],
  };
  const result = mediaLinks(cell);
  assert.equal(result.image, image);
  assert.equal(result.poster, image.currentSrc);
  assert.deepEqual(result.videos, ['https://example.test/motion.webm']);
});

test('an image that is still loading uses its authored src', () => {
  const image = { currentSrc: '', src: 'https://example.test/poster.webp' };
  assert.equal(mediaLinks({ querySelector: () => image, querySelectorAll: () => [] }).poster, image.src);
});

test('legacy poster links and absent optional media still work', () => {
  const result = mediaLinks({ querySelector: () => null, querySelectorAll: () => [{ href: 'https://example.test/poster.webp' }] });
  assert.equal(result.poster, 'https://example.test/poster.webp');
  assert.equal(mediaLinks(null).poster, '');
  assert.deepEqual(mediaLinks(null).videos, []);
});

test('fieldwork keeps its authored poster without adding competing stage labels', () => {
  const priorDocument = globalThis.document;
  const priorWindow = globalThis.window;
  const { document, window } = parseHTML('<html><body></body></html>');
  window.matchMedia = () => ({ matches: true });
  globalThis.document = document;
  globalThis.window = window;
  try {
    for (const fieldwork of [false, true]) {
      const block = document.createElement('div');
      block.className = `painterly-hero${fieldwork ? ' fieldwork' : ''}`;
      block.innerHTML = '<div><div><h1>A heading</h1><p>Authored copy.</p></div><div><picture><img src="https://example.test/poster.webp" alt=""></picture></div></div>';
      const picture = block.querySelector('picture');
      const image = block.querySelector('img');
      decorate(block);
      assert.equal(block.querySelector('picture'), picture);
      assert.equal(block.querySelector('img'), image);
      assert.equal(block.querySelector('.painterly-hero-index') !== null, !fieldwork);
      assert.equal(block.querySelector('h1').textContent, 'A heading');
      assert.equal(image.loading, 'eager');
    }
  } finally {
    globalThis.document = priorDocument;
    globalThis.window = priorWindow;
  }
});
