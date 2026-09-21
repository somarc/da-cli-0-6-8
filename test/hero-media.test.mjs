import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mediaLinks } from '../blocks/painterly-hero/painterly-hero.js';

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
