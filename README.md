# WebStack Next · Hexo navigation theme

[中文文档](README_CN.md) · [SQLite setup](#edit-bookmarks-with-sqlite-optional) · [Command reference](#bookmark-command-reference) · [How automatic updates work](#how-automatic-bookmark-updates-work)

A Hexo navigation theme maintained by [freedomgod](https://github.com/freedomgod). Forked from [HCLonely/hexo-theme-webstack](https://github.com/HCLonely/hexo-theme-webstack), based on the original [WebStackPage / Viggo design](https://github.com/WebStackPage/WebStackPage.github.io).

This fork includes a refreshed card layout, light/dark styles, keyboard-accessible resource cards and search controls, and a local Hexo development site. Original authorship and license notices are preserved.

![Theme preview](screenshot/screenshot.png)

## Requirements

- Git and Node.js **20.19.0 or newer**; Node.js 22 or 24 is used in CI.
- Optional SQLite mode requires **Node.js 22.13+** (Node.js 24 LTS recommended). It uses built-in `node:sqlite`, without a database server or native dependency installation.
- A Hexo site. This fork is developed and checked with **Hexo 8.1.2**. Older Hexo versions mentioned in upstream documentation are not part of this fork's validation.
- This is a navigation/directory theme. It does not provide dedicated blog post or archive layouts.

## Install your latest local theme

Run the following commands in your **Hexo site root**, not in the theme repository.

If you do not have a site yet, create one first:

```shell
npm install -g hexo-cli
hexo init my-navigation
cd my-navigation
npm install
```

The independent package is **`hexo-theme-webstack-next`**, the Hexo theme name is **`webstack-next`**, and its configuration is **`_config.webstack-next.yml`**. The original `webstack` theme can remain installed. The repository URL/folder name does not determine the installed package name.

To install your current local working tree, including uncommitted changes, run:

```shell
npm install --install-links "D:/path/to/hexo-theme-webstack" --registry=https://registry.npmjs.org
hexo config theme webstack-next
hexo clean
hexo s
```

Replace the local path with your development directory. `--install-links` installs a packaged copy under `node_modules/hexo-theme-webstack-next` and installs its renderer dependencies. You do not need to copy theme folders, install Pug separately, or uninstall the original theme. Avoid plain `npm install hexo-theme-webstack`, which refers to the upstream registry package.

With npm installation, **the new theme does not appear in `themes/`**. Seeing only the old `themes/webstack` folder is normal; Hexo loads `node_modules/hexo-theme-webstack-next` when `theme: webstack-next` is selected. The name uses a hyphen, not `webstack_next`. Edit site configuration and data in the site root, not the installed package, because package updates replace installed files.

Installation creates `_config.webstack-next.yml` if absent. It copies your existing `source/_data/webstack.yml` or `_config.webstack.yml` when available; otherwise it uses the bundled sample. It preserves existing new-theme settings on subsequent installs. Missing public assets referenced by the old configuration are retained from the old theme, including its FA6 font bundle when needed; old templates and core CSS/JS do not overwrite the new theme. The old theme and configuration remain unchanged. Template edits made directly to the original theme are not transferred.

`hexo config theme webstack-next` sets the active theme in the site's `_config.yml`. Your site identity remains there:

```yaml
theme: webstack-next
title: My Navigation
subtitle: Useful tools and resources
author: Your name
language: en
```

To switch back, run `hexo config theme webstack`, then `hexo clean` and `hexo s`. Existing per-category files in `source/_data/` remain usable. The whole-theme data file `source/_data/webstack.yml` no longer overrides WebStack Next; its corresponding optional data file is `source/_data/webstack-next.yml`. Prefer the root `_config.webstack-next.yml` for new installations.

If npm lifecycle scripts are disabled, the theme still has built-in defaults. Copy the sample to `_config.webstack-next.yml` yourself if you need an editable config or want to migrate old settings.

### Optional Git installation

Git installation fetches committed repository content, whereas the local installation above includes current working-tree changes:

```shell
git clone --branch master https://github.com/freedomgod/hexo-theme-webstack.git themes/webstack-next
npm install hexo-renderer-pug hexo-util pug js-yaml --save
```

Copy `themes/webstack-next/_config.example.yml` to the site root as `_config.webstack-next.yml` (or copy your old `_config.webstack.yml` to that new name), then set `theme: webstack-next`. Do not install both a Git copy and an npm copy of WebStack Next: Hexo prefers `themes/webstack-next` when both exist. `private: true` prevents accidental registry publication; local npm installation is supported.

## Create the homepage and preview

An existing WebStack site using `hexo-generator-index` can keep its current homepage: the generator already marks it as an index page, so installing and switching themes is sufficient. Open <http://localhost:4000> after `hexo s`.

For a site without a homepage generator, or when you explicitly want a standalone navigation page, create `source/index.html` with this content:

```yaml
---
layout: index
__index: true
title: My Navigation
---
```

Keep `__index: true`: it identifies this page as the homepage so resource cards render. If your site uses `hexo-generator-index`, give its post index a different route in the site's `_config.yml`:

```yaml
index_generator:
  path: blog
```

Alternatively, uninstall that generator for a navigation-only site. Do not let it generate the same `/index.html` route as this page. Existing sites should adapt their current homepage instead of overwriting it.

```shell
hexo clean
hexo server
```

Open <http://localhost:4000>. To generate deployable files:

```shell
hexo generate
```

Deploy the site's `public/` directory using your preferred static host, such as GitHub Pages. Configure the site's `url` and, for a subdirectory deployment, `root` first. Pushing the theme repository does not deploy your personal site. See the [Hexo deployment guide](https://hexo.io/docs/github-pages).

## Add categories and websites

Edit `_config.webstack-next.yml`. Each menu's `config` names a list of website cards:

```yaml
menu:
  - name: Common tools
    icon: far fa-star
    config: hotTools
  - name: Resources
    icon: fas fa-code
    submenu:
      - name: Development
        icon: fas fa-tools
        config: devTools

hotTools:
  - name: GitHub
    url: https://github.com/
    img: /images/logos/github.png
    description: Code hosting and collaboration.

devTools:
  - name: Hexo
    url: https://hexo.io/
    img: /images/favicon.png
    description: A static site framework.
```

Alternatively, store a category's list in `source/_data/hotTools.yml` (a YAML list starting with `- name:`). When present, a site data file takes precedence over the same named list in the theme configuration. Use one source per category. Local custom images belong in the site's `source/images/` directory; reference them as `/images/filename.png`. File name casing must match, including on Linux.

## Edit bookmarks with SQLite (optional)

YAML remains the default. Enable SQLite to manage navigation in a local database while keeping appearance and other settings in your existing theme configuration. The published site remains static.

### 1. Install and activate the theme

Complete the installation above first. Use Node.js 22.13+ and make sure the site's `_config.yml` contains `theme: webstack-next`. Run the commands below in your **Hexo site root**, which contains `_config.yml`, rather than inside the theme directory. An existing site without the preview server also needs `npm install hexo-server --save`.

`hexo bookmarks` is a **custom command supplied by this theme**, registered with Hexo's [Console extension API](https://hexo.io/api/console.html). `init` and `export` are its subcommands; they are unrelated to the built-in `hexo init` command that creates a site. The custom command becomes available when Hexo loads the active theme's scripts. You do not need to install a separate bookmarks CLI, and SQLite does not need to be enabled to run initialization.

### 2. Create or import a local database

**Already have bookmarks in YAML? Export those first** instead of initializing sample data:

```shell
hexo bookmarks export-db
```

This reads the current homepage menu and its referenced bookmark lists, including separate files in `source/_data/`, and creates the database at `bookmark_db.path` (default `.webstack/bookmarks.sqlite`). It preserves category hierarchy/icons, bookmark order, names, links, images, descriptions and text tags. Existing site data lists override inline lists, matching the theme's rendering priority. Empty categories are retained. The command reads YAML even if SQLite mode is enabled and its database is missing; it neither generates pages nor edits YAML or enables SQLite.

An existing database is never overwritten. Choose another private output when needed:

```shell
hexo bookmarks export-db --output .webstack/current-bookmarks.sqlite
```

Then set `bookmark_db.path` to that filename and enable SQLite as shown below. The exporter supports `.yml`, `.yaml` and `.json` list files, rejects duplicate files with the same key, and reports invalid data or unsupported fields instead of silently dropping them. It converts homepage navigation; page-specific front matter and child-page lists are not merged into this database. Database mode assigns new `sqlite_category_<id>` keys, so the existing named YAML files can remain as backups. It does not export the already-active SQLite data; use your SQLite editor's backup/export feature for database backups.

For a new site with no existing bookmarks, create a sample database:

```shell
hexo bookmarks init
```

Alternatively, initialize from an existing database (choose one of these initialization/export methods):

```shell
hexo bookmarks init --from "D:/path/to/Bookmark.db"
```

The command creates `.webstack/bookmarks.sqlite`, adds `/.webstack/` to the site's `.gitignore`, and refuses to overwrite an existing database. Import uses a consistent SQLite snapshot, including committed WAL changes, without modifying the original. Edit the local copy afterward; later edits to the original are not synchronized. The [generic database sample](examples/bookmarks.sqlite) and [schema SQL](examples/bookmarks.sql) are included with the theme.

Run initialization once. To try a different database later, choose a new private path such as `.webstack/another.sqlite` in `bookmark_db.path` before initializing; keep your existing database as a backup. Do not overwrite it just to restart the server.

### 3. Enable SQLite navigation

Set this in `_config.webstack-next.yml` (or the legacy `source/_data/webstack-next.yml`):

```yaml
bookmark_db:
  enable: true
  path: .webstack/bookmarks.sqlite
```

The path is relative to the site root. Enabling SQLite replaces the navigation used for rendering, including the menu and bookmark lists. It does not rewrite your handwritten settings, colors, logos or about-page content. Keep the original YAML navigation if you want to switch back later. Existing databases are not migrated or filled with sample entries automatically.

### 4. Edit, preview and publish

Before enabling SQLite, edit categories in `_config.webstack-next.yml` under `menu`. For a category with `config: tools`, edit `source/_data/tools.yml` when that file exists; otherwise edit the `tools` list in `_config.webstack-next.yml`. After enabling SQLite, edit `categories` and `bookmarks` in the configured private database with your SQLite editor. Do not edit `webstack.generated.yml`, which is regenerated from the database.

Open the local copy in a SQLite editor, edit categories/bookmarks, **save/commit your changes**, then run `hexo s`, `hexo g`, or `hexo d`. These commands export `webstack.generated.yml` in the site root and apply it during the same generation. SQLite mode makes plain `hexo d` regenerate existing public files before deployment; `hexo g -d` generates once. Configure a Hexo deployer as usual. Restart `hexo s` after database edits; database file watching is not included. For `hexo s --static`, run `hexo g` first.

For day-to-day use:

1. Open `.webstack/bookmarks.sqlite`, change the relevant rows, and commit/save the editor's transaction.
2. Stop an existing preview with `Ctrl+C`, then run `hexo s` and open `http://localhost:4000`.
3. Run `hexo g` to inspect generated files, or `hexo d` to generate and deploy with your configured deployer. No manual export or `hexo clean` is required for normal bookmark edits.

Use `hexo bookmarks export` to export YAML explicitly. The generated file contains navigation only; your theme settings and comments are untouched. Do not edit generated YAML. Missing, invalid, exclusively locked databases and invalid category references stop generation/deployment, leaving the previous YAML intact. Conflicting `source/_data/` list keys fail explicitly.

### Bookmark command reference

| Command | Behavior |
| --- | --- |
| `hexo bookmarks init` | Creates the local database from the generic sample and adds the private directory to `.gitignore`. Does not enable SQLite or generate pages. |
| `hexo bookmarks init --from "path/to/Bookmark.db"` | Creates a validated local snapshot of an existing database. Preserves the source and refuses an existing target. |
| `hexo bookmarks export` | Reads the configured database and exports navigation YAML, even when automatic SQLite mode is disabled. Does not regenerate or refresh served pages. |
| `hexo bookmarks export-db` | Converts current homepage YAML configuration and referenced site data into a new SQLite database. Preserves YAML and refuses an existing target. |
| `hexo bookmarks export-db --output .webstack/current.sqlite` | Writes the YAML conversion to a different private file. Does not change `bookmark_db.path` or `enable`. |
| `hexo s` / `hexo server` | Loads the database during the initial generation and serves current pages. Database-only changes do not trigger its file watcher. |
| `hexo g` / `hexo generate` | Exports current navigation and generates static files in `public/`. |
| `hexo d` / `hexo deploy` | In SQLite mode, generates current pages before invoking the configured deployer, even if `public/` exists. |
| `hexo g -d` / `hexo d -g` | Generates and deploys once, without a generation/deployment loop. |
| `hexo s --static` | Serves existing `public/` files. Loading may still run generation hooks, but it does not rewrite those files; run `hexo g` first. |

After initialization and generation, a typical site contains:

```text
my-navigation/
  _config.yml                  # Hexo settings, theme and deployment
  _config.webstack-next.yml          # Appearance and bookmark_db settings
  .gitignore                   # Includes /.webstack/
  .webstack/
    bookmarks.sqlite           # Edit this private local database
  webstack.generated.yml       # Generated navigation; do not edit
  source/
    index.html                 # Homepage front matter
    images/                    # Your local bookmark images
  node_modules/hexo-theme-webstack-next/  # Installed theme and generic sample
  public/                      # Generated static site; no private database
```

### Sample schema

`categories`:

| Field | Meaning |
| --- | --- |
| `id` | Positive integer primary key; omit it on insertion to let SQLite allocate one. |
| `parent_id` | `NULL` for a top-level category; otherwise its parent category's `id`. |
| `name` | Required category display name. |
| `icon` | Font Awesome 5 classes, such as `fas fa-tools`; defaults to `fas fa-folder`. |
| `sort_order` | Integer, ascending; defaults to 0. Equal values are ordered by `id`. |
| `enabled` | 1 to display (default), 0 to hide. A hidden parent hides its descendants. |

`bookmarks`:

| Field | Meaning |
| --- | --- |
| `id` | Positive integer primary key; can be allocated by SQLite. |
| `category_id` | Required ID of the category containing this bookmark. |
| `name`, `url` | Required display name and destination. |
| `img` | Image URL or site path; defaults to `/images/favicon.png`. |
| `description` | Description text; defaults to an empty string. |
| `tags` | Optional tag text; defaults to an empty string. Exported when nonempty. |
| `sort_order`, `enabled` | Same sorting and visibility rules as categories. |

SQLite can allocate IDs for new rows. Categories support two levels; parent categories with children cannot contain bookmarks. Sort order is ascending, with ID as the tie breaker. Disabling a parent hides its descendants. Move/delete references before deleting a category. Orphans, cycles and deeper trees are rejected even for disabled rows. List keys are generated as `sqlite_category_<id>`. URLs support HTTP(S), FTP, mailto, local paths and anchors; encode spaces. Local images belong in `source/images/`. Tags are retained in YAML but the current cards do not display or filter them.

For example, this transaction adds a top-level category and a bookmark to the **new sample schema** (it is not SQL for the legacy schema):

```sql
PRAGMA foreign_keys = ON;
BEGIN;
INSERT INTO categories (name, icon, sort_order)
VALUES ('Documentation', 'fas fa-book', 30);
INSERT INTO bookmarks (category_id, name, url, img, description, tags, sort_order)
VALUES (last_insert_rowid(), 'SQLite', 'https://sqlite.org/',
        '/images/favicon.png', 'SQLite documentation', 'database,docs', 10);
COMMIT;
```

### Existing Bookmark.db compatibility

The exporter also reads `category(category, key, favicon_code_fa, favicon_code_iconfont)` and `bookmark(bk_id, name, category, tags, url, favicon_url, description)` without changing their schema. It joins on category name, uses `sqlite_<key>` as the list key, maps `favicon_url` to `img`, and retains tags/string bookmark IDs in the database. Category keys must be unique and contain only letters, digits, underscores or hyphens. FA6 style prefixes and the tools/reader icon names are mapped to bundled FA5 equivalents; iconfont fonts are not loaded automatically.

This legacy format keeps a flat hierarchy and database row order; it has no sorting/enabled fields. Other tables such as `ToDo` and `readlater` stay private in the copy and are not exported.

Database paths must stay in `.webstack/`, outside source/public directories (including directory links). The directory and SQLite sidecar files are Git-ignored; none are published to `public/`. Public bookmark YAML can be backed up or reused in YAML mode. Cloud CI without the local database must be supplied with public navigation YAML and use YAML mode; missing databases never silently fall back to stale output. Set `enable: false` to return to the original YAML navigation.

### How automatic bookmark updates work

The theme uses Hexo's extension points, not an external shell command that users must run before previewing:

1. Hexo loads [scripts/bookmarks.js](scripts/bookmarks.js) from the active theme. It calls the registration function in [lib/bookmark-hexo.cjs](lib/bookmark-hexo.cjs).
2. `hexo.extend.console.register('bookmarks', ...)` registers the custom CLI command. `init` prepares a sample/imported database, `export` converts SQLite to YAML, and `export-db` converts the current YAML configuration to SQLite. These commands do not render pages.
3. `hexo.extend.filter.register('before_generate', ...)` registers the automatic export. The [before_generate filter](https://hexo.io/api/filter.html#before-generate) executes before page generation, including the first generation performed by normal `hexo s` startup.
4. When `bookmark_db.enable` is true, the filter reads and validates the database in a read-only transaction, checks for conflicting site data, and atomically updates `webstack.generated.yml` if the content changed.
5. It also applies the **same navigation object** to `hexo.theme.config` with `Object.assign`. Hexo renders the current pages from that in-memory configuration immediately. The exported YAML is not automatically loaded as a second theme configuration file, and rendering does not depend on Hexo detecting a YAML file change.

```text
hexo s startup / hexo g
  -> Hexo loads site and theme data
  -> generateBefore event (existing legacy configuration support)
  -> before_generate filter
     -> read SQLite -> validate navigation
     -> write webstack.generated.yml
     -> apply navigation to hexo.theme.config
  -> generate routes -> render pages
```

The `generateBefore` event in [scripts/replace_config.js](scripts/replace_config.js) supports the older `source/_data/webstack-next.yml` configuration. In the tested Hexo version it runs before `before_generate`, so the SQLite navigation is applied after that legacy configuration replacement. The filter is part of Hexo's awaited generation pipeline: an export error rejects generation rather than allowing deployment to proceed with stale data.

Deployment needs one extra integration. Plain `hexo d` can reuse an existing `public/` directory without generating anything. The theme uses `after_init` to wrap the registered `generate` and `deploy` console handlers while retaining their options. With SQLite enabled, direct deployment requests generation first. A generation-depth counter recognizes `hexo g -d`, so its deployment phase does not generate again. Updating YAML only in the `deployBefore` event would be too late to refresh already generated HTML.

There is **no SQLite file watcher or browser-side database connection**. The filter runs whenever Hexo generates, but changing only a file in `.webstack/` does not request a new generation. Restart the preview after editing the database. Normal server routes are rendered for preview; `hexo g` writes deployable files, and static server mode serves those existing files as described in the [Hexo server documentation](https://hexo.io/docs/server.html).

### Troubleshooting

| Symptom | What to check |
| --- | --- |
| `Console bookmarks has not been registered` | Run inside the Hexo site, activate `theme: webstack-next`, update the theme, and check startup logs for script/dependency errors. Do not use `--safe`, which disables scripts. |
| SQLite requires a newer Node.js | Check `node --version` in the same terminal. Use Node.js 22.13+ or leave SQLite mode disabled. |
| Database already exists | Initialization is a one-time action. Edit the existing copy, or choose a new `.webstack/` path to import another database. |
| Bookmark database missing | Initialize it first and check `bookmark_db.path`, relative to the site root. A copy of only the theme repository does not include your personal database. |
| Edits do not appear | Save/commit the database editor's transaction, edit the private copy rather than the import source, and restart `hexo s`. For static server mode, run `hexo g` first. |
| Category/data conflict | Resolve orphan/deep/mixed category references, or rename/remove the conflicting `source/_data/` list identified in the error. |
| Database is locked | Finish the editor's write transaction and retry. The reader waits up to three seconds; it cannot read unsaved changes. |
| Refusing to overwrite generated YAML | The existing `webstack.generated.yml` lacks the generator's ownership header. Back it up under another filename before exporting. |
| `hexo d` does not publish | Configure the site's `deploy` section and install its matching deployer. The theme prepares current pages; the deployer performs publication. |

## Theme settings

The complete defaults are in [_config.example.yml](_config.example.yml). Keep the `css` and `js` mappings when creating your configuration.

| Setting | Purpose |
| --- | --- |
| `favicon`, `banner` | Site icon and social sharing image. |
| `logo.expanded`, `logo.collapsed` | Sidebar logos. The legacy `logo.dark` key is retained for existing configurations; the current about page uses `logo.expanded`. |
| `flag` | Language links with `name`, `icon`, `index`, and `default`. These are links, not automatic translation. Bundled icons are `flag-cn` and `flag-us`. |
| `search` | Show or hide the search box. |
| `userDefinedSearchData` | Search providers; example below. |
| `githubCorner` | HTML for the top corner link; defaults to this fork. Use `''` to hide it. |
| `menu`, `expandAll` | Sidebar categories and whether submenus start expanded. |
| `bookmark_db` | Optional local SQLite navigation source, disabled by default; see above. |
| `since` | Your site's founding year; replace the example value. |
| `about`, `aboutPage` | About link and content; creating the page is a separate step. |
| `busuanzi` | Optional third-party visit statistics, disabled by default. Use `position: sidebar` or `footer`; `$pv` / `$uv` are count placeholders. |
| `custom.head`, `custom.body` | Trusted HTML inserted into the page head or before `</body>`. |
| `css`, `js` | Asset URLs. `css.hclonely` and `/css/hclonely.css` retain their upstream names for compatibility. |

A custom search configuration:

```yaml
userDefinedSearchData:
  custom: true
  thisSearch: https://www.google.com/search?q=
  thisSearchIcon: url(https://www.google.com/favicon.ico)
  hotStatus: false
  data:
    - name: Google
      img: url(https://www.google.com/favicon.ico)
      url: https://www.google.com/search?q=
```

`img` is the icon CSS value; `url` is the search URL prefix. Search suggestions, when enabled, use Baidu's suggestion service. Resource lists are configured manually; search opens the selected external provider.

Colors, spacing, corners, and shadows are defined by the `--ws-*` variables in `source/css/hclonely.css`; `body.night` contains dark-mode overrides. Additional styles can be loaded through `custom.head`.

## About and child pages

To enable the default `/about/` link, create `source/about/index.html`:

```yaml
---
layout: page
type: about
title: About
---
```

Edit `aboutPage.website` and `aboutPage.webmaster` in `_config.webstack-next.yml`. Replace the sample name, profile link, image, description, and HTML with your own. If you do not need this page, set `about: {}` to hide its sidebar link.

To create `/child/`, create `source/child/index.html`:

```yaml
---
layout: page
type: child
title: Development resources
menu:
  - name: Development
    icon: fas fa-code
    config: childTools
childTools:
  - name: GitHub
    url: https://github.com/
    img: /images/logos/github.png
    description: Code hosting and collaboration.
---
```

Child pages inherit theme settings and may override them in front matter. A child page can also load route-specific data: for `/child/` and `config: childTools`, use `source/_data/child/childTools.yml`. See the working [child page](dev/source/child/index.html) and [about page](dev/source/about/index.html). `title` is the current spelling; the historical `tittle` alias is still accepted when `title` is absent.

## Update or switch from upstream

Keep your site configuration and content outside the installed theme directory. Review the new example configuration for added keys without overwriting your own settings.

For local installations, pack the current development tree and install the resulting archive when updating. This refreshes the installed files even when the package version has not changed:

```shell
# Run in the development theme directory:
npm pack
# Run in the Hexo site directory, using the archive filename printed above:
npm install "D:/path/to/hexo-theme-webstack/hexo-theme-webstack-next-3.0.5-freedomgod.2.tgz" --registry=https://registry.npmjs.org
hexo clean
hexo s
```

For an existing Git installation from this fork:

```shell
git -C themes/webstack-next pull --ff-only
npm install js-yaml --save
hexo clean
hexo generate
```

The names are independent, so the upstream theme does not need to be removed. Local npm installation imports old settings on first install; switching back uses the untouched original settings. For Git installs, copy the old config to `_config.webstack-next.yml` yourself. Review site placeholders and custom template changes separately; existing new-theme config files are never overwritten by updates.

## Develop this theme

Run these commands in the **theme repository root**:

```shell
npm ci
npm run dev
```

Visit <http://localhost:4000>, <http://localhost:4000/about/>, and <http://localhost:4000/child/>. The development site uses [dev/_config.yml](dev/_config.yml), [dev/source](dev/source), and `_config.example.yml`. Restart after changing configuration. Theme templates and assets are linked directly into the generated development site.

```shell
npm run build
npm test
```

The build checks the three example pages using Hexo 8.1.2. Tests build an independent copied-theme site and check SQLite initialization, legacy imports, validation, server startup and deployment refresh. The complete test suite requires Node.js 22.13+. Run `npm run bookmarks:sample` to rebuild the generic database from SQL. Generated files live in `.hexo-dev/` and `output/` and are excluded from Git and packaging. CI runs both checks on Windows and Linux with Node.js 22 and 24.

## Credits and support

- Fork maintenance: [freedomgod](https://github.com/freedomgod/hexo-theme-webstack).
- Original Hexo theme: [HCLonely](https://github.com/HCLonely/hexo-theme-webstack).
- Original WebStack design: [WebStackPage / Viggo](https://github.com/WebStackPage/WebStackPage.github.io).
- Static site framework: [Hexo](https://hexo.io/).

The maintenance entry point is [this repository](https://github.com/freedomgod/hexo-theme-webstack). Once the maintainer enables Issues under Settings → General → Features, use its Issues tab for fork-specific reports. Licensed under [MIT](LICENSE); original copyright notices and bundled third-party notices remain intact. The included WebStack logos are inherited sample assets; replace them for your own site.
