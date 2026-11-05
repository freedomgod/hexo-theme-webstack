# hexo-theme-webstack · freedomgod fork

[中文文档](README_CN.md)

A Hexo navigation theme maintained by [freedomgod](https://github.com/freedomgod). Forked from [HCLonely/hexo-theme-webstack](https://github.com/HCLonely/hexo-theme-webstack), based on the original [WebStackPage / Viggo design](https://github.com/WebStackPage/WebStackPage.github.io).

This fork includes a refreshed card layout, light/dark styles, keyboard-accessible resource cards and search controls, and a local Hexo development site. Original authorship and license notices are preserved.

![Theme preview](screenshot/screenshot.png)

## Requirements

- Git and Node.js **20.19.0 or newer**; Node.js 22 or 24 is used in CI.
- A Hexo site. This fork is developed and checked with **Hexo 8.1.2**. Older Hexo versions mentioned in upstream documentation are not part of this fork's validation.
- This is a navigation/directory theme. It does not provide dedicated blog post or archive layouts.

## Install from this repository

Run the following commands in your **Hexo site root**, not in the theme repository.

If you do not have a site yet, create one first:

```shell
npm install -g hexo-cli
hexo init my-navigation
cd my-navigation
npm install
```

Install the fork and its renderers:

```shell
git clone --branch master https://github.com/freedomgod/hexo-theme-webstack.git themes/webstack
npm install hexo-renderer-pug pug --save
```

In the site's `_config.yml`, replace the existing theme setting and set your own site identity:

```yaml
theme: webstack
title: My Navigation
subtitle: Useful tools and resources
author: Your name
language: en
```

Copy `themes/webstack/_config.example.yml` to the site root as `_config.webstack.yml`.

PowerShell:

```powershell
Copy-Item themes/webstack/_config.example.yml _config.webstack.yml
```

macOS / Linux:

```shell
cp themes/webstack/_config.example.yml _config.webstack.yml
```

The Git installation does not copy configuration automatically. Keep only one of `_config.webstack.yml` and the legacy `source/_data/webstack.yml`; the legacy data file replaces the theme settings when present.

**Distribution:** this fork is distributed through GitHub. `npm install hexo-theme-webstack` installs the registry package, not this repository's changes. The package name remains compatible with Hexo, while `private: true` prevents publishing under the upstream npm name. The inherited npm publishing workflow has been replaced with build checks.

## Create the homepage and preview

For a dedicated navigation site, create `source/index.html` with this content:

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

Edit `_config.webstack.yml`. Each menu's `config` names a list of website cards:

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

Edit `aboutPage.website` and `aboutPage.webmaster` in `_config.webstack.yml`. Replace the sample name, profile link, image, description, and HTML with your own. If you do not need this page, set `about: {}` to hide its sidebar link.

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

## Update or migrate from upstream

Keep your site configuration and content outside `themes/webstack`. Review the new example configuration for added keys without overwriting your own settings.

For an existing Git installation from this fork:

```shell
git -C themes/webstack pull --ff-only
hexo clean
hexo generate
```

When migrating from the upstream repository or npm package, first back up your theme customizations and configuration. Uninstall the npm theme if used (`npm uninstall hexo-theme-webstack`), keep the old theme folder as a backup outside `themes/webstack`, then clone this fork using the installation commands. Keep `theme: webstack` and your existing `_config.webstack.yml`; migrate the legacy data configuration if desired, keeping only one configuration file. Review original author/site placeholders and URLs in your own copy: a theme update does not rewrite user configuration.

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

The build checks the three example pages using Hexo 8.1.2. The test builds a separate site from copied theme files and the README homepage, checking inherited configuration, identity, credits, and subdirectory asset paths. Generated files live in `.hexo-dev/` and `output/` and are excluded from Git and packaging. CI runs both checks on Windows and Linux with Node.js 22 and 24.

## Credits and support

- Fork maintenance: [freedomgod](https://github.com/freedomgod/hexo-theme-webstack).
- Original Hexo theme: [HCLonely](https://github.com/HCLonely/hexo-theme-webstack).
- Original WebStack design: [WebStackPage / Viggo](https://github.com/WebStackPage/WebStackPage.github.io).
- Static site framework: [Hexo](https://hexo.io/).

The maintenance entry point is [this repository](https://github.com/freedomgod/hexo-theme-webstack). Once the maintainer enables Issues under Settings → General → Features, use its Issues tab for fork-specific reports. Licensed under [MIT](LICENSE); original copyright notices and bundled third-party notices remain intact. The included WebStack logos are inherited sample assets; replace them for your own site.
