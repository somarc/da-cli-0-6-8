/* A static editorial spread. Each row is an authored image cell and rich text.
 * No facts are fabricated, labels remain authored, and malformed/extra content
 * is retained. Page media belongs to DA rather than the implementation repo. */
export default function decorate(block) {
  if (block.dataset.fieldStoryReady) return;
  block.dataset.fieldStoryReady = 'true';
  [...block.children].forEach((row) => {
    const [media, copy, ...extra] = row.children;
    const image = media?.querySelector('img');
    if (!image || !copy) return;
    row.classList.add('field-story-spread');
    media.classList.add('field-story-media');
    copy.classList.add('field-story-copy');
    if (!image.hasAttribute('loading')) image.loading = 'lazy';
    extra.forEach((cell) => {
      copy.append(...cell.childNodes);
      cell.remove();
    });
  });
}
