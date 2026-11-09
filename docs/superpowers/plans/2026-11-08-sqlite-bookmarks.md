# SQLite bookmarks implementation plan

**Goal:** Edit a local SQLite database and export current navigation YAML automatically for Hexo server, generate and deploy.

**Architecture:** Keep YAML mode as the default. With `bookmark_db.enable: true`, read `.webstack/bookmarks.sqlite` in a read-only SQLite transaction, validate the two-level category tree, and atomically export `webstack.generated.yml` in the site root. Apply that data before generation, after the legacy theme-config replacement. Preserve unrelated theme settings. Wrap the deploy console command to generate before deployment, including when public files already exist. Do not upload the database or expose it as a static asset.

**Tech stack:** Hexo 8.1.2, Node's optional built-in SQLite (Node 22.13+), js-yaml, node:test. Existing YAML-only users retain Node 20.19+ support.

## Design decisions

- Ship `examples/bookmarks.sql` and a matching SQLite sample with categories and bookmarks corresponding to the existing example config.
- Categories: id, parent_id, name, icon, sort_order, enabled. Bookmarks: id, category_id, name, url, img, description, tags, sort_order, enabled.
- Stable category config keys derive from numeric IDs. One parent level is supported by the current templates; mixed parent bookmarks and child categories, cycles and orphan references are errors rather than silently dropped data.
- Disabled parents hide their whole subtree. Order by sort_order then id. All rows are validated, including disabled ones.
- Database path stays inside the private `.webstack/` directory; initialization adds that directory to the site's Git ignore file. Resolve real paths and reject source/public directory overlap, including directory links.
- Generated YAML is separate from the user's settings, carries an ownership header, and is only replaced after complete validation. Missing/invalid/locked databases abort generation/deployment without replacing the last YAML. No automatic fallback to stale output.
- Initial command: `hexo bookmarks init`; it never overwrites an existing database. `hexo bookmarks export` provides explicit export. Database edits take effect on the next server start/build/deploy; continuous database watching is outside this change.
- Automatic generation overlays navigation only; child front matter keeps its current override behavior. A conflicting site data key is rejected so old YAML cannot silently override database bookmarks.
- User supplied an existing Bookmark.db during implementation. Support its singular category/bookmark tables directly, retaining text IDs/tags, flat row order and mapping legacy image/icon fields. `hexo bookmarks init --from` snapshots the source read-only using VACUUM INTO, validates it and refuses to replace an existing target. Other tables remain private and are never exported. Public samples contain generic data only.

## Work checklist

- [x] Add meaningful failing tests for sample initialization, export data/order/hierarchy/disabled rows, invalid input preserving output, and database path protection.
- [x] Implement schema/sample, SQLite exporter and initialization helpers under `lib/`, with no auto-executed helper files under Hexo's `scripts/`.
- [x] Add failing real-Hexo integration tests for first generation, server startup, plain deploy after a database edit with existing public output, and failed deploy with invalid database.
- [x] Register commands/filter and deploy integration; update copied-theme and linked-theme development fixtures to include `lib/` and `examples/`.
- [x] Document setup, fields, edit/save workflow, generated YAML, Node requirements and local-only storage in Chinese/English. Add default disabled settings and package scripts/dependency metadata.
- [x] Run `npm test`, `npm run build`, `git diff --check`, inspect final changes and update this checklist. Preserve the pre-existing CSS modification.

Verification: 15 tests passed plus the existing copied-theme installation check. Development homepage/about/child build passed. The supplied database was imported to ignored local output: 8 categories and 434 bookmarks exported, all 434 cards rendered, no private database artifacts in public output, original database SHA-256 unchanged. Package dry run includes only the generic sample. Independent code review found a production dependency lockfile classification issue; npm regenerated the lockfile and review confirmed no remaining important findings. No commit or deployment performed.
