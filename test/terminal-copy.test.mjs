import assert from 'node:assert/strict';
import { test } from 'node:test';
import { copyText } from '../blocks/terminal/terminal.js';

test('single preformatted payload is copied byte-for-byte, including whitespace', () => {
  const textContent = '\n  command\nnext\n';
  assert.equal(copyText({ childElementCount: 1, firstElementChild: { tagName: 'PRE', textContent } }), textContent);
});

test('command rows omit decorative prompts and separate commands with newlines', () => {
  const commands = [{ textContent: 'first command' }, { textContent: 'second command' }];
  assert.equal(copyText({ childElementCount: 2, querySelectorAll: () => commands }), 'first command\nsecond command');
});

test('ordinary authored rows remain separated when copied', () => {
  const children = [{ textContent: 'first row' }, { textContent: 'second row' }];
  assert.equal(copyText({ childElementCount: 2, querySelectorAll: () => [], children }), 'first row\nsecond row');
});
