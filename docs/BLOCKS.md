# Flywheel story blocks

These are presentation contracts, not DA page fixtures. Source copy, images,
headings, links and page metadata remain authored in DA.

## Flywheel

Each row has a heading-only label cell (`h2`, `h3` or `h4`) and a rich-text notes
cell. Additional cells are retained with those notes. Six stages are the intended
page composition, not an enforced content count. Blank or malformed label rows
remain visible without becoming unnamed interactive controls.

Decoration moves the original heading and notes into native `details`/`summary`
elements. Each block has its own native exclusive-disclosure group. The first
stage opens initially. Native keyboard behavior is retained; no custom tab or
keyboard model is implemented. Browsers without exclusive details support may
show multiple open notes without losing content. A decorative SVG reflects the
first open stage; exact meaningful content remains in HTML. Closing all notes
does not silently reopen them. Nothing executes, fetches, auto-advances or spins.

The block owns internal spacing and a two-column layout at a 48rem container
width. The section owns its outer width/spacing. Reduced motion removes the small
disclosure-toggle transition; forced colors removes decorative art and restores
native disclosure markers. Decoration is idempotent. No Canvas certification is
claimed without checking the actual editor.

## Field story

Each row is an authored image cell followed by rich text. An optional caption
stays with the media. Extra cells are retained within the text cell. Rows without
the required image/text shape remain unchanged. The original image and its alt
text survive; below-fold images load lazily. This block is static and owns only
its internal editorial spread.

## Evidence links

Each row is a noninteractive label cell and a destination cell containing one
literal HTTPS URL in a `code` element. Additional content stays visible. Do not
author the destination as an anchor: EDS delivery rewrites `*.aem.page` and
`*.aem.live` anchors to relative paths, including cross-site references.

Decoration builds a native link from the visible authored URL. It accepts only
absolute HTTPS without embedded credentials, preserves the source label nodes,
and rejects nested interactive labels. The destination stays visible/copyable;
without JS, the source label and URL are still useful. No destination is hardcoded
in implementation and no network request is made by decoration. This is a site
adaptation to the documented delivery behavior, not a claim that DA corrupted
the canonical source or a new da-cli capability.

## Signature and preview

`site-signature` remains the small, non-operative authored calling card. Its
destination is supplied by the site, not an external script or runtime payload.
The DA write/preview workflow—not client-side hiding—owns the preview-only
publication boundary. Automatic provisioning by da-cli requires its own CLI
contract and tests; this site must not claim that feature is already shipped.
