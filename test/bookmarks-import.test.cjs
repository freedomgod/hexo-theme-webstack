const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');
const yaml = require('js-yaml');
const { DatabaseSync } = require('node:sqlite');
const { readNavigation } = require('../lib/bookmarks.cjs');

const root = path.resolve(__dirname, '..');
const api = () => require('../lib/bookmark-import.cjs');
function fixture(t) {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'webstack-import-'));
  t.after(() => fs.rmSync(base, { recursive: true, force: true }));
  const sourceDir = path.join(base, 'source');
  fs.mkdirSync(path.join(sourceDir, '_data'), { recursive: true });
  const config = {
    menu: [
      { name: '资源', icon: 'fas fa-book', submenu: [
        { name: '中文分类', icon: 'far fa-star', config: '中文列表' },
        { name: '空分类', icon: 'fas fa-folder', config: 'empty' }
      ] },
      { name: '工具', icon: 'fas fa-tools', config: 'tools' }
    ],
    中文列表: [{ name: 'stale inline', url: 'https://old.example/' }],
    tools: [{ name: '内联工具', url: 'https://example.com/', description: '中文: # 引号\n第二行', tags: '代码,工具' }]
  };
  const configFile = path.join(base, '_config.webstack-next.yml');
  fs.writeFileSync(configFile, yaml.dump(config));
  fs.writeFileSync(path.join(sourceDir, '_data/中文列表.yml'), yaml.dump([
    { name: '当前第一条', url: 'https://one.example/', img: '/one.png', description: '第一条' },
    { name: '当前第二条', url: '/local/', img: '/two.png', description: '' }
  ]));
  return { base, sourceDir, themeDir: root, publicDir: path.join(base, 'public'), themeName: 'webstack-next', themeConfig: config, configFile };
}

test('exports visible YAML lists with hierarchy, icons and order, without sample data or YAML changes', t => {
  const options = fixture(t);
  const original = fs.readFileSync(options.configFile, 'utf8');
  assert(fs.existsSync(path.join(root, 'lib/bookmark-import.cjs')), 'YAML-to-SQLite export should exist');
  const result = api().exportDatabase(options);
  assert.equal(result.categories, 4);
  assert.equal(result.bookmarks, 3);
  const data = readNavigation(options);
  assert.deepEqual(data.menu, [
    { name: '资源', icon: 'fas fa-book', submenu: [
      { name: '中文分类', icon: 'far fa-star', config: 'sqlite_category_2' },
      { name: '空分类', icon: 'fas fa-folder', config: 'sqlite_category_3' }
    ] },
    { name: '工具', icon: 'fas fa-tools', config: 'sqlite_category_4' }
  ]);
  assert.deepEqual(data.sqlite_category_2.map(row => row.name), ['当前第一条', '当前第二条']);
  assert.deepEqual(data.sqlite_category_3, []);
  assert.equal(data.sqlite_category_4[0].tags, '代码,工具');
  assert.equal(data.sqlite_category_4[0].description, '中文: # 引号\n第二行');
  assert.equal(fs.readFileSync(options.configFile, 'utf8'), original);
  assert(!fs.existsSync(path.join(options.base, 'webstack.generated.yml')));
  assert.match(fs.readFileSync(path.join(options.base, '.gitignore'), 'utf8'), /\/\.webstack\//);
});

test('renames a colliding export with a timestamp and never overwrites an existing database', t => {
  const options = fixture(t);
  const first = api().exportDatabase(options);
  const bytes = fs.readFileSync(first.filename);
  const second = api().exportDatabase(options);
  assert.notEqual(second.filename, first.filename);
  assert.equal(path.dirname(second.filename), path.dirname(first.filename));
  assert.match(path.basename(second.filename), /^bookmarks-\d{8}-\d{6}(-\d+)?\.sqlite$/);
  assert.deepEqual(fs.readFileSync(first.filename), bytes);
  const db = new DatabaseSync(second.filename, { readOnly: true });
  try { assert.equal(db.prepare('SELECT count(*) AS count FROM bookmarks').get().count, 3); } finally { db.close(); }

  const named = api().exportDatabase({ ...options, database: '.webstack/backup.sqlite' });
  const namedBytes = fs.readFileSync(named.filename);
  const renamed = api().exportDatabase({ ...options, database: '.webstack/backup.sqlite' });
  assert.match(path.basename(renamed.filename), /^backup-\d{8}-\d{6}(-\d+)?\.sqlite$/);
  assert.deepEqual(fs.readFileSync(named.filename), namedBytes);
  assert.equal(renamed.bookmarks, 3);
  assert.throws(() => api().exportDatabase({ ...options, database: 'public/leak.sqlite' }), /published/);
});

test('normalizes Font Awesome 6 YAML icons before storing them in SQLite', t => {
  const options = fixture(t);
  options.themeConfig = {
    menu: [
      { name: '工具', icon: 'fa-solid fa-screwdriver-wrench', config: 'tools' },
      { name: '资源', icon: 'fa-solid fa-book-open-reader', config: 'empty' }
    ],
    tools: [{ name: '示例', url: 'https://example.com/' }]
  };
  const result = api().exportDatabase(options);
  const db = new DatabaseSync(result.filename, { readOnly: true });
  try {
    assert.deepEqual(db.prepare('SELECT name, icon FROM categories ORDER BY id').all().map(row => ({ ...row })), [
      { name: '工具', icon: 'fas fa-tools' },
      { name: '资源', icon: 'fas fa-book-reader' }
    ]);
  } finally { db.close(); }
  assert.deepEqual(readNavigation(options).menu.map(row => row.icon), ['fas fa-tools', 'fas fa-book-reader']);
});

test('active theme data override wins and .yaml/.json lists are supported', t => {
  const options = fixture(t);
  fs.writeFileSync(path.join(options.sourceDir, '_data/webstack-next.yml'), 'menu:\n  - name: override\n    config: override\n');
  fs.writeFileSync(path.join(options.sourceDir, '_data/override.json'), JSON.stringify([{ name: 'JSON entry', url: 'https://example.com/' }]));
  fs.writeFileSync(path.join(options.sourceDir, '_data/webstack.yml'), 'menu: []\n');
  const result = api().exportDatabase(options);
  assert.equal(result.categories, 1);
  assert.equal(readNavigation(options).sqlite_category_1[0].name, 'JSON entry');
});

for (const [label, change, pattern] of [
  ['invalid list', o => fs.writeFileSync(path.join(o.sourceDir, '_data/中文列表.yml'), 'not: a-list'), /中文列表.*array/],
  ['invalid YAML', o => fs.writeFileSync(path.join(o.sourceDir, '_data/中文列表.yml'), 'a: [broken'), /中文列表/],
  ['unknown bookmark field', o => { o.themeConfig.tools[0].secret = 'do not drop'; }, /secret/],
  ['too deep menu', o => { o.themeConfig.menu[0].submenu[0].submenu = [{name:'third',config:'tools'}]; }, /two levels/],
  ['ambiguous data file', o => fs.writeFileSync(path.join(o.sourceDir, '_data/中文列表.yaml'), '[]'), /ambiguous/i],
  ['unsafe config key', o => { o.themeConfig.menu[0].submenu[0].config = '../../outside'; }, /data directory/]
]) {
  test(`rejects ${label} before creating the target`, t => {
    const options = fixture(t);
    change(options);
    assert.throws(() => api().exportDatabase(options), pattern);
    assert(!fs.existsSync(path.join(options.base, '.webstack/bookmarks.sqlite')));
  });
}

test('an explicitly empty data list overrides inline bookmarks and creates a valid empty database', t => {
  const options = fixture(t);
  options.themeConfig = { menu: [{ name: 'Empty', config: 'tools' }], tools: [{ name: 'ignored', url: 'https://example.com/' }] };
  fs.writeFileSync(path.join(options.sourceDir, '_data/tools.yaml'), '[]');
  const result = api().exportDatabase(options);
  assert.equal(result.bookmarks, 0);
  const db = new DatabaseSync(result.filename, { readOnly: true });
  try { assert.equal(db.prepare('SELECT count(*) AS n FROM bookmarks').get().n, 0); } finally { db.close(); }
});
