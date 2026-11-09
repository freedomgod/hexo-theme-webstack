const { initialize, readNavigation, writeNavigation, exportBookmarks } = require('./bookmarks.cjs');
const { exportDatabase, readThemeConfig } = require('./bookmark-import.cjs');
const { version } = require('../package.json');

module.exports = function registerBookmarks(hexo) {
  function settings() {
    // Plain deploy runs before Hexo processes source/_data. Resolve the same
    // file formats and precedence as export-db even in a fresh Hexo instance.
    return readThemeConfig({ base: hexo.base_dir, themeDir: hexo.theme_dir,
      sourceDir: hexo.source_dir, themeName: hexo.config.theme,
      themeConfig: hexo.config.theme_config }).bookmark_db || {};
  }
  function options() {
    return { base: hexo.base_dir, themeDir: hexo.theme_dir, sourceDir: hexo.source_dir,
      publicDir: hexo.public_dir, database: settings().path };
  }
  const enabled = () => settings().enable === true;

  hexo.extend.console.register('bookmarks', 'Initialize SQLite, export SQLite to YAML, or export current YAML to SQLite', {
    usage: '<init|export|export-db> [--from <database>] [--output <database>]',
    options: [
      { name: '--from', desc: 'init: copy an existing local SQLite database without modifying it' },
      { name: '--output', desc: 'export-db: write to a new path inside .webstack/ (never overwrite)' }
    ]
  }, function (args = {}) {
    const action = (args._ || [])[0];
    if (action === 'init') {
      const filename = initialize({ ...options(), sourceDatabase: args.from });
      hexo.log.info('Created %s. Set bookmark_db.enable: true in your theme configuration to use it.', filename);
    } else if (action === 'export') {
      exportBookmarks(options());
      hexo.log.info('Exported webstack.generated.yml');
    } else if (action === 'export-db') {
      if (args.output !== undefined && (typeof args.output !== 'string' || !args.output.trim())) {
        throw new Error('export-db --output requires a filename inside .webstack/.');
      }
      const config = options();
      const result = exportDatabase({ ...config, database: args.output,
        themeName: hexo.config.theme, themeConfig: hexo.config.theme_config });
      hexo.log.info('Exported YAML to %s: %d categories, %d bookmarks. Set bookmark_db.enable: true and point bookmark_db.path to this file to use it.',
        result.filename, result.categories, result.bookmarks);
      return result;
    } else {
      const reason = action ? `Unknown bookmarks action "${action}".` : 'Missing bookmarks action.';
      throw new Error(`${reason} Usage: hexo bookmarks <init|export|export-db> (hexo-theme-webstack ${version}).`);
    }
  });

  // generateBefore (legacy replace_config.js) runs before this awaited filter.
  hexo.extend.filter.register('before_generate', function () {
    if (!enabled()) return;
    const navigation = readNavigation(options());
    const data = hexo.locals.get('data') || {};
    for (const key of Object.keys(navigation)) {
      if (key !== 'menu' && Object.hasOwn(data, key)) {
        throw new Error(`SQLite bookmark conflict: remove or rename source/_data/${key}.yml before building.`);
      }
    }
    writeNavigation(hexo.base_dir, navigation);
    Object.assign(hexo.theme.config, navigation);
  });

  // Hexo's deployBefore event is too late: public files may already be stale.
  // Preserve console metadata/aliases and use the normal awaited generate path.
  hexo.extend.filter.register('after_init', function () {
    const console = hexo.extend.console;
    const generate = console.get('generate');
    const deploy = console.get('deploy');
    let generating = 0;
    console.register('generate', generate.desc, generate.options, async function (args = {}) {
      generating++;
      try { return await generate.call(this, args); } finally { generating--; }
    });
    console.register('deploy', deploy.desc, deploy.options, function (args = {}) {
      if (!enabled()) return deploy.call(this, args);
      return deploy.call(this, { ...args, g: generating === 0, generate: generating === 0,
        d: false, deploy: false, b: true, bail: true });
    });
  });
};
