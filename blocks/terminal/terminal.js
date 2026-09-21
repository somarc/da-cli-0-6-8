/*
 * terminal
 * Authored contract: each row has a single cell of rich text.
 *   - lines starting with `$ ` render as prompt + command
 *   - all other lines render as plain output
 *   - a cell that is only a `<pre><code>` block passes through verbatim
 *   - an optional first row (plain text, no `$ ` prefix, no `<pre>`)
 *     renders as the window title bar
 * Variant `terminal (receipt)` tints the frame with the accent color.
 * Its EDS variant class is literally `receipt`, which collides with the
 * unrelated `receipt` block name — renamed here to `terminal-receipt`
 * immediately so the two blocks' CSS can never bleed into each other.
 */

function linesFromCell(cell) {
  const lines = [];
  const elements = [...cell.children];

  if (elements.length === 0) {
    if (cell.textContent.trim()) lines.push([...cell.childNodes]);
    return lines;
  }

  elements.forEach((el) => {
    if (el.tagName === 'P' || el.tagName === 'DIV') {
      let current = [];
      [...el.childNodes].forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'BR') {
          lines.push(current);
          current = [];
        } else {
          current.push(node);
        }
      });
      if (current.length) lines.push(current);
    } else {
      lines.push([el]);
    }
  });

  return lines.filter((nodes) => nodes.some((n) => n.textContent && n.textContent.trim()));
}

function isPromptText(text) {
  return /^\$\s?/.test(text.trim());
}

function stripDollar(nodes) {
  const fragment = document.createDocumentFragment();
  fragment.append(...nodes);
  const walker = document.createTreeWalker(fragment, NodeFilter.SHOW_TEXT);
  let text = walker.nextNode();
  while (text && !text.textContent.trim()) text = walker.nextNode();
  if (text) {
    text.textContent = text.textContent.replace(/^\s*\$\s?/, '');
  }
  return [...fragment.childNodes];
}

export function copyText(body) {
  if (body.childElementCount === 1 && body.firstElementChild.tagName === 'PRE') {
    return body.firstElementChild.textContent;
  }
  const commands = [...body.querySelectorAll('.terminal-command')];
  return (commands.length ? commands : [...body.children])
    .map((element) => element.textContent).join('\n');
}

function buildTitlebar(text) {
  const bar = document.createElement('div');
  bar.className = 'terminal-titlebar';

  const dots = document.createElement('span');
  dots.className = 'terminal-dots';
  dots.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < 3; i += 1) {
    dots.append(document.createElement('span'));
  }
  [...dots.children].forEach((dot) => dot.classList.add('terminal-dot'));

  const label = document.createElement('span');
  label.className = 'terminal-titlebar-label';
  label.textContent = text;

  bar.append(dots, label);
  return bar;
}

function buildLine(nodes) {
  const text = nodes.map((n) => n.textContent).join('');
  const line = document.createElement('div');

  if (isPromptText(text)) {
    line.className = 'terminal-line terminal-line-prompt';
    const prompt = document.createElement('span');
    prompt.className = 'terminal-prompt';
    prompt.setAttribute('aria-hidden', 'true');
    prompt.textContent = '$';
    const cmd = document.createElement('span');
    cmd.className = 'terminal-command';
    cmd.append(...stripDollar(nodes));
    line.append(prompt, cmd);
  } else {
    line.className = 'terminal-line terminal-line-output';
    line.append(...nodes);
  }
  return line;
}

export default function decorate(block) {
  if (block.dataset.terminalReady) return;
  block.dataset.terminalReady = 'true';
  if (block.classList.contains('receipt')) {
    block.classList.remove('receipt');
    block.classList.add('terminal-receipt');
  }

  const rows = [...block.children];
  let titlebarEl = null;
  // The copy variant's optional second title cell contains three authored
  // paragraphs: action label, success feedback, and failure guidance.
  const copyLabels = block.classList.contains('copy')
    ? [...(rows[0]?.children[1]?.querySelectorAll('p') || [])].map((p) => p.textContent.trim())
    : [];

  if (rows.length > 1) {
    const firstCell = rows[0].children[0];
    const text = firstCell ? firstCell.textContent.trim() : '';
    const hasPre = firstCell && firstCell.querySelector('pre');
    if (text && !hasPre && !isPromptText(text)) {
      titlebarEl = buildTitlebar(text);
      rows.shift();
    }
  }

  const body = document.createElement('div');
  body.className = 'terminal-body';

  rows.forEach((row) => {
    [...row.children].forEach((cell) => {
      const pre = cell.querySelector('pre');
      if (pre && cell.children.length === 1 && cell.firstElementChild === pre) {
        body.append(pre);
        return;
      }
      linesFromCell(cell).forEach((nodes) => body.append(buildLine(nodes)));
    });
  });

  block.replaceChildren();
  if (titlebarEl) block.append(titlebarEl);
  block.append(body);

  if (copyLabels.length === 3 && copyLabels.every(Boolean)) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'terminal-copy';
    [button.textContent] = copyLabels;
    const status = document.createElement('p');
    status.className = 'terminal-copy-status';
    status.setAttribute('role', 'status');
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(copyText(body));
        [, status.textContent] = copyLabels;
      } catch {
        [, , status.textContent] = copyLabels;
      }
    });
    const actions = document.createElement('div');
    actions.className = 'terminal-actions';
    actions.append(button, status);
    block.append(actions);
  }
}
