# obsidian-github-slug-resolver

An Obsidian plugin that makes GitHub-style heading anchors navigable inside Obsidian.

## The Problem

GitHub slugifies heading anchors — `# My Heading` becomes `#my-heading`. Obsidian uses a different format, so links like `[see this](#my-heading)` or `[[File#my-heading]]` don't navigate correctly out of the box.

## What This Plugin Does

Intercepts heading anchor navigation and resolves GitHub slugs to the correct Obsidian heading at click time. Works across:

- Same-file markdown links: `[text](#my-heading)`
- Cross-file markdown links: `[text](other-file.md#my-heading)`
- Wikilinks: `[[File#my-heading]]`
- Any other navigation path that calls `openLinkText` internally

No file content is modified. The plugin is read-only — it only changes how links are resolved at navigation time.

## GitHub Slug Algorithm

The plugin implements GitHub's heading slug rules:

1. Lowercase the heading text
2. Remove all characters except letters, digits, underscores, hyphens, and spaces
3. Replace spaces with hyphens
4. Deduplicate collisions in document order: first occurrence keeps the base slug, subsequent occurrences get `-1`, `-2`, etc.

## Installation

### Manual (local development)

```bash
cd /path/to/your/vault/.obsidian/plugins
git clone git@github.com:ducka/obsidian-github-slug-resolver.git
cd obsidian-github-slug-resolver
npm install
npm run build
```

Then enable the plugin in Obsidian: **Settings → Community Plugins → GitHub Slug Resolver**.

### Via symlink (recommended for development)

```bash
ln -s /path/to/obsidian-github-slug-resolver \
  /path/to/your/vault/.obsidian/plugins/obsidian-github-slug-resolver
```

## Development

```bash
npm run dev       # watch mode — rebuilds on every save
npm test          # run unit tests
npm run build     # production build
```

Install the [Hot Reload](https://github.com/pjeby/hot-reload) community plugin in your test vault to automatically reload the plugin in Obsidian after each rebuild.

## Caveats

- `openLinkText` is a semi-private Obsidian API. It has been stable across versions but could change in a future Obsidian release. The plugin wraps it defensively and falls back to default behaviour if patching fails.
- Live Preview (CodeMirror editor mode) navigation is handled via the `openLinkText` wrapper — no CM6 extensions are used.
