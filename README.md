# da-cli · 0.6.8 site preview

A visitor-first introduction to building, evolving, and troubleshooting
DA-backed AEM Edge Delivery sites with a coding agent.

## Environments

- [Main preview](https://main--da-cli-0-6-8--somarc.aem.page/)
- [How we build / the learning flywheel](https://main--da-cli-0-6-8--somarc.aem.page/how-we-build)
- [DA content](https://da.live/#/somarc/da-cli-0-6-8)
- Public CLI package: `@somarc/da-cli@0.6.7`

The site is being prepared ahead of 0.6.8. It is not a released CLI or a frozen
release-proof site, and this development scope does not publish to live.

## Development

```sh
npm ci
npm run check
aem up --url https://main--da-cli-0-6-8--somarc.aem.page/ --no-open
```

The official AEM CLI serves local implementation with previewed DA content.
DA is the source of truth for Home, Get started, Examples, the signature
How we build page, navigation, and footer.
Use da-cli and its resolved external operational workspace for content operations;
keep QMD enabled for the learning trail. Do not commit authored page fixtures.

`npm run check` includes native-block DOM regressions using a development-only
DOM parser. Browser verification still proves keyboard behavior, responsive
layout and actual delivery; the DOM tests do not replace it.
See [block authoring contracts](docs/BLOCKS.md), including how explicit cross-site
EDS evidence URLs survive the platform's link normalization.

## Foundation

Selected presentation blocks, fonts, styles, and design assets are reused from
`somarc/da-cli-0-6-6@e60deaf3590dacbf1c7d03a4c2be6b0ad9a79010`.
The new repository's vendored `scripts/aem.js` remains unchanged.
No older command-reference data, authored pages, or release evidence is copied.
See [DIRECTION.md](DIRECTION.md) and [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
