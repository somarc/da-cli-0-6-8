import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { test } from 'node:test';

test('site identifies preview status without promoting the CLI version', async () => {
  const header = await readFile(new URL('../blocks/header/header.js', import.meta.url), 'utf8');
  assert.match(header, /0\.6\.8 preview/);
  assert.doesNotMatch(header, /command-search/);
  const manifest = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
  assert.equal(manifest.name, 'da-cli-0-6-8');
  assert.equal(manifest.dependencies, undefined);
});

test('case files and copying are additive, native, and non-executing', async () => {
  const cases = await readFile(new URL('../blocks/case-file/case-file.js', import.meta.url), 'utf8');
  const terminal = await readFile(new URL('../blocks/terminal/terminal.js', import.meta.url), 'utf8');
  assert.match(cases, /createElement\('details'\)/);
  assert.match(cases, /createElement\('summary'\)/);
  assert.match(terminal, /navigator\.clipboard\.writeText/);
  for (const code of [cases, terminal]) {
    assert.doesNotMatch(code, /\beval\s*\(|\bfetch\s*\(|new Function|child_process/);
  }
});

test('the checkout contains no authored page or old reference corpus', async () => {
  const root = await readdir(new URL('../', import.meta.url));
  for (const forbidden of ['index.html', 'getting-started.html', 'examples.html', 'how-we-build.html', 'nav.html', 'footer.html', 'data', 'drafts']) {
    assert.equal(root.includes(forbidden), false, forbidden);
  }
});
