# WebStack Next local installation

**Goal:** Give the developed theme its own package/theme/config identity and support installing current local files with npm, switching the active theme, and previewing an existing WebStack site.

**Architecture:** Rename the npm package to `hexo-theme-webstack-next` and the Hexo selection to `webstack-next`. Retain the repository URL and SQLite storage names for compatibility. A postinstall helper creates `_config.webstack-next.yml` without overwriting existing settings, importing the old root/data configuration when present. Preserve missing public assets from the old theme and its FA6 font bundle when referenced; do not copy old templates or core styling over the new theme. Only the selected theme's data/config controls its hooks. Merge defaults during generation so the theme is usable when lifecycle scripts are disabled too.

**Verification:** Test npm installation of the actual local directory (not a Git clone), standalone initialization, config isolation, preservation of the old theme, idempotent config setup, existing index generator rendering and all SQLite tests. Validate the user's existing site through an isolated copy; do not publish.

- [x] Add failing installation/config-isolation tests.
- [x] Rename metadata and dev/test fixtures; implement independent config setup and default loading.
- [x] Verify real npm local installation and copied consumer build with the existing homepage generator.
- [x] Update README installation/migration instructions and run all checks.

Verification: 18 automated tests and development build passed. A real `npm install --install-links` into an isolated copy of the existing site installed the package and dependencies, preserved original configuration, created the independent config, and generated 96 existing bookmark cards with the user's index/Markdown plugins. Custom font/style assets were present. The original site was not modified or deployed. Registry access was granted for the isolated install; the initial offline attempts lacked registry metadata.

Final verification: npm-installed theme served HTTP 200 with all 96 original cards. Package manifest contains the installation helper, SQLite sample and runtime scripts, without private/output folders. Independent review confirmed no remaining important findings and tested same-filename/same-version tarball updates; README uses plain `npm pack` to avoid requiring an existing output directory.
