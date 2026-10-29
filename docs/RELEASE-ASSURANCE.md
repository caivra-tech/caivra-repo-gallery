# Release assurance checklist

This repository uses evidence-driven release gates. **Passing CI is not the same as publishing or verifying the deployed website.** GitHub Pages publishes only from the designated `main` workflow.

## 1. Inspect and scope
- [ ] Record current `main` SHA, active GitHub Pages deployment SHA, license, and repo settings.
- [ ] Confirm the proposed change's semantic owner, affected files, callers, and expected behavior.
- [ ] Identify any unsupported claims in documentation or marketing; verify them before publishing.

## 2. Implement and review
- [ ] Create a feature or release-preparation branch; preserve existing deployed `main`.
- [ ] Explain each material defect: reachable trigger, violated contract, observed contradiction, and source evidence.
- [ ] Keep workflows least-privileged; use immutable SHAs for external Actions; review supply-chain upgrades intentionally.
- [ ] Review GitHub API input validation, pagination, rate limits, untrusted metadata rendering, links, Content Security Policy, and error handling.
- [ ] Run a separate review of security-sensitive changes before merge (human or independent reviewer; not CI alone).

## 3. Test and falsify
- [ ] Check syntax and automated unit/API contract tests.
- [ ] Cover malicious/malformed metadata, 404, rate limit, network errors, user vs organization, pagination, URL state and filtering.
- [ ] Check browser behavior for desktop/mobile, keyboard operation, search, language, forks, sort, load more, user fallback, and link sharing.
- [ ] Validate that unexpected input is rendered as text (not executable HTML) and that no token is requested or logged.
- [ ] Require CI success on the **exact proposed head SHA**.

## 4. Release gate
- [ ] Obtain an independent review decision and resolve material blockers.
- [ ] Check repository protection settings, private vulnerability reporting, Pages source, and intended public license/attribution.
- [ ] Confirm the public repo description, homepage URL and relevant GitHub topics are accurate.
- [ ] Decide whether the changes merit a version tag/GitHub Release; do not call an untagged `main` commit a formal GitHub Release.
- [ ] Record release notes, limitations, rollback plan, and user-facing claims.

## 5. Publish, validate, close
- [ ] Merge a reviewed PR using the expected head SHA.
- [ ] Verify post-merge CI for the resulting immutable `main` SHA.
- [ ] Verify Pages **deployment** succeeded for the same SHA, not just artifact upload.
- [ ] Independently fetch the live website and its JS/CSS assets; run a production browser smoke test if possible.
- [ ] Record exact URLs, SHAs, tests, known gaps, and rollback procedure before announcing full closure.

## Rollback
If a change reaches `main` but fails production validation, **revert the offending commit via a new reviewed PR** and let Pages redeploy; verify the rollback deployment by SHA. Do not rewrite or force-push public history.

## Trust boundary
The gallery is a static browser application for **public metadata only**. It must never ask visitors for GitHub tokens or handle private-repository credentials. It is not a privileged GitHub Action, so a private consumer repository and schedule-trigger evidence are not universal release requirements.
