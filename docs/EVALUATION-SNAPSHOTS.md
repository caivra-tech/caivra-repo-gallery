# Repository evaluation snapshots (experimental)

Select up to 100 loaded public repositories and choose **Export selected snapshot**. The browser resolves each selected repository's current HEAD to a 40-character commit SHA and exports a local JSON file. No backend or account is used.

**Important limitations**
- The original gallery URL preserves filter criteria, not a stable search result set. Search applies only to loaded API pages.
- Export fails as a whole if any commit cannot be resolved. A failed export is not an evaluation.
- Commit resolution is sequential and subject to GitHub's unauthenticated API rate limit.
- A SHA identifies a commit, not a dependency lockfile, verified release, security approval, or assurance that the repository remains available.
- The snapshot records metadata observations made at export; repository descriptions and stars were fetched earlier and may already have changed.
- Import validates the schema and displays the count and timestamp; it does not restore a live gallery selection or trust the contents as security evidence.
- Snapshot files are local. Sharing them is an explicit user action. Do not import or share private or sensitive notes.

The JSON schema identifier is `caivra.repo-evaluation.v1`. Import is bounded to 1 MB and 100 records. Future changes must preserve compatibility or explicitly version the schema.

## Review gate

Before release, verify GitHub API behavior for `/commits/HEAD` against representative repositories, run the automated tests and a real browser smoke test, review keyboard accessibility, and check the exact deployment SHA. No change to GitHub Pages production is authorized by this draft.
