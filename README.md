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

Public gallery: https://caivra-tech.github.io/caivra-repo-gallery/

GitHub Pages is configured with **Build and deployment → Source: GitHub Actions**. Before announcing any subsequent release, confirm post-merge CI and a successful Pages deployment for the same immutable commit SHA; then independently check the public page and assets.

## Open-source tools showcase

Explore both independent Caivra Tech LLC developer projects at the [Caivra Open-Source Tools page](https://caivra-tech.github.io/caivra-repo-gallery/open-source/). GitHub Reminders and this repository gallery solve different problems and have separate release processes.

See [launch posts](marketing/POSTS.md), [suggested 10-day publishing calendar](marketing/PUBLISHING-CALENDAR.md), and [measured baseline](marketing/METRICS-BASELINE.md). These are planning materials; they do not imply that external social posts were published.

## Release assurance

See [release assurance checklist](docs/RELEASE-ASSURANCE.md) and [changelog](CHANGELOG.md). A deployed Pages update is not itself a tagged GitHub Release.

## Contributing / security

See [CONTRIBUTING.md](CONTRIBUTING.md), [SECURITY.md](SECURITY.md) and [GitHub Issues](https://github.com/caivra-tech/caivra-repo-gallery/issues). Do not disclose security-sensitive findings publicly.

MIT © 2026 Caivra Tech LLC. See [LICENSE](LICENSE).
