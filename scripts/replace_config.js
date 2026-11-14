const fs = require('node:fs');
const path = require('node:path');
const yaml = require('js-yaml');
const { normalizeThemeIcons } = require('../lib/icon-compat.cjs');
const defaults = yaml.load(fs.readFileSync(path.join(hexo.theme_dir, '_config.example.yml'), 'utf8'));

hexo.on('generateBefore', function () {
  const rootConfig = hexo.config
  let legacy
  if (hexo.locals.get) {
    const data = hexo.locals.get('data')
    legacy = data && data[hexo.config.theme]
  }
  hexo.theme.config = Object.assign({}, defaults, hexo.theme.config, legacy)
  normalizeThemeIcons(hexo.theme.config)
  hexo.theme.config.rootConfig = rootConfig
})
