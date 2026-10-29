# Caivra Repo Gallery

A responsive, accessible, MIT-licensed gallery of **public GitHub repositories**. Built by Caivra Tech LLC with plain HTML/CSS/JavaScript, no API keys, database, analytics, dependencies, or paid hosting.

## Features

- Enter any GitHub organization or username (default: `caivra-tech`).
- Search repository names, topics, languages, and descriptions.
- Language filtering, optional fork inclusion, and sorting by update date, star count, name, or creation date.
- Repository descriptions, topics, stars, forks, language, archive status, GitHub link, and optional website link.
- Shareable filter URLs, responsive layout, and keyboard-friendly controls.
- Incremental API pagination: **Load more** retrieves the next up to 100 repositories.

## Running locally

Requires any modern browser. For tests, Node.js 20+.

```sh
npm run check
npm test
python3 -m http.server 8000
```

Open `http://localhost:8000/`. Serving over HTTP is recommended because browsers block ES modules opened from `file:` URLs. No `npm install` is needed.

## How it works

The browser fetches public metadata directly from `https://api.github.com/orgs/{owner}/repos` (or `/users/{owner}/repos` for personal accounts), using `type=public&per_page=100` for organizations or `type=owner&per_page=100` for personal accounts. Search and sorting apply only to **loaded pages**, not to yet-unloaded repositories. GitHub rate limits anonymous access; a rate-limit error is displayed without asking visitors for a personal access token.

No GitHub private data, tokens, or cookies are collected. API metadata is rendered using DOM text nodes, not HTML injection. External project links are restricted to HTTP(S), and API requests only target GitHub. The site does not use trackers or third-party UI libraries.

## GitHub Pages

The deployment workflow in `.github/workflows/pages.yml` validates and packages the site, then deploys on a push to `main`.

**One-time configuration** (may require repository admin): GitHub **Settings → Pages → Build and deployment → Source: GitHub Actions**. Until this is enabled and deployment completes, the URL below is an expected address, not a verified published site.

Expected Pages URL: https://caivra-tech.github.io/caivra-repo-gallery/

After enabling Pages, inspect the Actions deployment and confirm the URL is live.

## Contributing / security

See [CONTRIBUTING.md](CONTRIBUTING.md), [SECURITY.md](SECURITY.md) and [GitHub Issues](https://github.com/caivra-tech/caivra-repo-gallery/issues). Do not disclose security-sensitive findings publicly.

MIT © 2026 Caivra Tech LLC. See [LICENSE](LICENSE).
