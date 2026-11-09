# Export current YAML bookmarks to SQLite

**Goal:** Add `hexo bookmarks export-db [--output .webstack/name.sqlite]` so existing users can move their current navigation into the editable local database without starting from sample bookmarks.

**Architecture:** Read effective theme settings (defaults, theme config, Hexo's merged alternate config, then active-theme data override) and referenced source/_data lists. Export the homepage navigation only; per-category site data takes precedence over inline lists, as in the template. Convert the two-level menu into ordered category/bookmark rows, validate with the existing navigation validator, then write a private database using the sample schema with all sample rows removed. Never overwrite an existing database, mutate source YAML, enable database mode, or run page generation/deployment as a side effect. Reuse path restrictions and ignore rules. SQLite enablement must not prevent exporting YAML, even when the configured DB is missing.

**Compatibility:** Keep `hexo bookmarks export` as SQLite → YAML. Support .yml/.yaml/.json data files; reject ambiguous same-name files and invalid data with source-specific errors. Preserve name/url/img/description/tags, category icons, levels and list ordering. Generated numeric IDs yield new sqlite_category_<id> keys; source names remain untouched. Missing lists represent empty categories. Unsupported fields that cannot be stored must fail explicitly instead of being silently lost. Page-specific front matter is outside this command.

- [x] Add failing tests for split data precedence, hierarchy/order, blank categories, preservation of original YAML/existing DB, invalid input/path, and command operation with SQLite enabled but no DB.
- [x] Implement YAML navigation reading/conversion, safe database creation, and command/help integration.
- [x] Validate the user's actual 96-bookmark YAML in an isolated copy, including YAML → SQLite → page generation equivalence.
- [x] Update README.md and Chinese guide with installation location, current editing paths, conversion and database editing steps; package the new version and run checks.

Verification: `npm test` passes the copied-install check and all 33 tests. The actual site configuration exports 10 category nodes and 96 bookmarks; all 96 rendered cards match after switching to SQLite, and the original site configuration is unchanged. Runtime and export share effective configuration resolution, with regression coverage for array inheritance and fresh-instance deployment using .yml/.yaml/.json active-theme settings over root defaults. Independent review confirmed these cases pass.
