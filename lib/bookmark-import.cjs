const fs = require('node:fs');
const path = require('node:path');
const yaml = require('js-yaml');
const { deepMerge } = require('hexo-util');
const { createDatabase } = require('./bookmarks.cjs');

function within(directory, filename) {
  const relative = path.relative(path.resolve(directory), filename);
  return relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
}

function readData(directory, key) {
  if (typeof key !== 'string' || !key.trim()) throw new Error('Category config must be a nonempty string.');
  const base = path.resolve(directory, key);
  if (!within(directory, base)) throw new Error(`Category config ${key} must stay inside its data directory.`);
  const files = ['.yml', '.yaml', '.json'].map(ext => base + ext).filter(filename => fs.existsSync(filename));
  if (files.length > 1) throw new Error(`Ambiguous data files for ${key}: ${files.join(', ')}`);
  if (!files.length) return undefined;
  const filename = files[0];
  if (!within(fs.realpathSync(directory), fs.realpathSync(filename))) {
    throw new Error(`File ${filename} must stay inside its data directory.`);
  }
  try { return yaml.load(fs.readFileSync(filename, 'utf8')); } catch (cause) {
    throw new Error(`Cannot read ${filename}: ${cause.message}`, { cause });
  }
}

function record(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label} must be an object.`);
}

function supportedFields(value, fields, label) {
  const unsupported = Object.keys(value).filter(key => !fields.includes(key));
  if (unsupported.length) throw new Error(`${label}: cannot store unsupported fields: ${unsupported.join(', ')}`);
}

function readThemeConfig(options) {
  const dataDir = path.join(options.sourceDir || path.join(options.base, 'source'), '_data');
  const defaults = yaml.load(fs.readFileSync(path.join(options.themeDir, '_config.example.yml'), 'utf8'));
  const theme = readData(options.themeDir, '_config') || {};
  const legacy = readData(dataDir, options.themeName || 'webstack-next') || {};
  const explicit = options.themeConfig || {};
  for (const [label, value] of [['Theme defaults', defaults], ['Theme config', theme], ['Theme data', legacy], ['Theme settings', explicit]]) record(value, label);
  // Hexo merges theme _config and site overrides recursively, including array
  // entries by index. Match it before applying our defaults/legacy-data layer.
  return Object.assign({}, defaults, deepMerge(theme, explicit), legacy);
}

function exportDatabase(options) {
  const dataDir = path.join(options.sourceDir || path.join(options.base, 'source'), '_data');
  const config = readThemeConfig(options);
  if (!Array.isArray(config.menu)) throw new Error('Theme menu must be an array.');
  const categories = [];
  const bookmarks = [];

  function category(entry, parentId, order) {
    const label = `Category ${entry && entry.name || categories.length + 1}`;
    record(entry, label);
    supportedFields(entry, ['name', 'icon', 'config', 'submenu'], label);
    const id = categories.length + 1;
    categories.push({ id, parent_id: parentId, name: entry.name, icon: entry.icon ?? 'fas fa-folder', sort_order: order, enabled: 1 });
    if (entry.submenu !== undefined) {
      if (parentId !== null) throw new Error(`${label}: only two levels are supported.`);
      if (!Array.isArray(entry.submenu) || entry.submenu.length === 0) throw new Error(`${label}: submenu must be a nonempty array.`);
      if (entry.config !== undefined) throw new Error(`${label}: a parent category cannot also have a config list.`);
      entry.submenu.forEach((child, index) => category(child, id, index));
      return;
    }
    const data = readData(dataDir, entry.config);
    // Same priority as layout/index.pug: site data overrides inline lists.
    const list = data || (Object.hasOwn(config, entry.config) ? config[entry.config] : []) || [];
    if (!Array.isArray(list)) throw new Error(`${label} (${entry.config}): bookmark list must be an array.`);
    list.forEach((item, index) => {
      const itemLabel = `${label} (${entry.config}), bookmark ${index + 1}`;
      record(item, itemLabel);
      supportedFields(item, ['name', 'url', 'img', 'description', 'tags'], itemLabel);
      bookmarks.push({
        id: bookmarks.length + 1, category_id: id, name: item.name, url: item.url,
        img: item.img ?? '/images/favicon.png', description: item.description ?? '', tags: item.tags ?? '',
        sort_order: index, enabled: 1
      });
    });
  }
  config.menu.forEach((entry, index) => category(entry, null, index));
  const filename = createDatabase({ ...options, database: options.database || config.bookmark_db?.path }, categories, bookmarks);
  return { filename, categories: categories.length, bookmarks: bookmarks.length };
}

module.exports = { exportDatabase, readThemeConfig };
