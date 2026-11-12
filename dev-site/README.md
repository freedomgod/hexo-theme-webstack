# dev-site

This is **not** a Hexo site and not part of the published theme. It is the site-side fixture that `tools/hexo-dev.cjs` copies into `.hexo-dev/` (`.hexo-dev/_config.yml` and `.hexo-dev/source/`) so the theme has something to render.

- `_config.yml` — the scratch site's config. `theme: webstack-next` is what makes Hexo load this repo as a theme.
- `source/index.html` — `layout: index`, renders the homepage.
- `source/about/index.html` — `layout: page` + `type: about`, dispatches to `about.pug`.
- `source/child/index.html` — `layout: page` + `type: child`, dispatches to `index.pug` in child-page mode.

Each page carries only front matter; they exist to exercise the three layouts that `npm run build` asserts on. Edit them freely — `npm run build` copies this directory on every run. The rest of a real site (posts, `_data`, `public/`, theme dir) is generated into `.hexo-dev/` and is git-ignored.

Not shipped: `.npmignore` excludes this directory.
