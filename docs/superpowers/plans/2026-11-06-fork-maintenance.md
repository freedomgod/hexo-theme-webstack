# Fork maintenance implementation plan

> **For agentic workers:** Use the executing-plans workflow to implement the checklist in order. The user authorized committing the existing work and publishing this fork; proceed through verification and push without a separate handoff.

**Goal:** Make freedomgod/hexo-theme-webstack installable and accurately documented as a maintained fork while preserving upstream credit.

**Architecture:** Keep the `webstack` theme name and existing configuration keys compatible. Separate site identity, fork maintenance, and original authorship. Distribute through Git, with build CI instead of the upstream npm release workflow.

**Tech stack:** Hexo 8.1.2, Pug, JavaScript, YAML, Node.js >=20.19.0.

## Tasks

- [x] Run `npm run build` and `git diff --check`; commit the existing UI and development setup separately.
- [x] Update `package.json`, `package-lock.json`, `LICENSE`, `.github/workflows/`, `_config.example.yml`, and `dev/_config.yml`: fork URLs, contributor credit, compatible Node requirement, private package, and useful examples with real local assets.
- [x] Update `layout/common/head.pug` and `layout/common/footer.pug`: use the site's author, correct title spelling with legacy fallback, and credit the original design, original Hexo theme, and fork separately.
- [x] Rewrite `README.md` and `README_CN.md` around Git installation, explicit theme activation/config copying, navigation content, optional pages, migration, development, deployment, and credits. Replace the obsolete preview image with a current capture if browser capture is available.
- [x] Verify with `npm run build`, an independent consumer-site build using documented configuration, template assertions for author/title/credits, `npm pack --dry-run`, and a scan of upstream references. Review the changes with a read-only code-review agent and address concrete issues.
Publication step (after this plan is committed): push `master` to `origin` without force and verify that GitHub matches local HEAD.

Verification completed: `npm run build`, `npm test`, `git diff --check`, package dry run, documentation YAML/local-link checks, and Chromium desktop/mobile interactions. The read-only review found no remaining important issues.
