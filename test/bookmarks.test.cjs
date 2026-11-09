const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');
const yaml = require('js-yaml');

const root = path.resolve(__dirname, '..');
function fixture(t) {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'webstack-db-'));
  t.after(() => fs.rmSync(base, { recursive: true, force: true }));
  return { base, themeDir: root, sourceDir: path.join(base, 'source'), publicDir: path.join(base, 'public') };
}
function api() { return require('../lib/bookmarks.cjs'); }
function edit(options, sql) {
  const { DatabaseSync } = require('node:sqlite');
  const db = new DatabaseSync(path.join(options.base, '.webstack', 'bookmarks.sqlite'));
  try { db.exec(sql); } finally { db.close(); }
}

test('initialization supplies a real sample, preserves existing data and ignores local databases', t => {
  const options = fixture(t);
  fs.writeFileSync(path.join(options.base, '.gitignore'), 'node_modules/\n');
  assert(fs.existsSync(path.join(root, 'lib/bookmarks.cjs')), 'SQLite bookmark support should exist');
  api().initialize(options);
  const dbPath = path.join(options.base, '.webstack/bookmarks.sqlite');
  assert.equal(fs.readFileSync(dbPath).subarray(0, 15).toString(), 'SQLite format 3');
  assert.match(fs.readFileSync(path.join(options.base, '.gitignore'), 'utf8'), /node_modules\/\n[\s\S]*\/\.webstack\//);
  edit(options, "UPDATE bookmarks SET name = '保留我的编辑' WHERE id = 1");
  assert.throws(() => api().initialize(options), /already exists/);
  const result = api().exportBookmarks(options);
  assert.equal(result.sqlite_category_1[0].name, '保留我的编辑');
});

test('exports the sample with existing template fields and preserves deterministic order', t => {
  const options = fixture(t);
  api().initialize(options);
  edit(options, "UPDATE bookmarks SET tags = '代码,工具' WHERE id = 1; UPDATE bookmarks SET sort_order = -1, description = '中文: # 引号\n第二行' WHERE id = 2");
  const result = api().exportBookmarks(options);
  assert.deepEqual(result.menu, [
    { name: '常用工具', icon: 'far fa-star', config: 'sqlite_category_1' },
    { name: '开发资源', icon: 'fas fa-code', submenu: [
      { name: '开发工具', icon: 'fas fa-tools', config: 'sqlite_category_3' },
      { name: '主题项目', icon: 'fas fa-book', config: 'sqlite_category_4' }
    ] }
  ]);
  assert.deepEqual(Object.keys(result.sqlite_category_1[0]), ['name', 'url', 'img', 'description']);
  assert.equal(result.sqlite_category_1[0].name, 'Hexo');
  assert.equal(result.sqlite_category_1[1].tags, '代码,工具');
  const output = path.join(options.base, 'webstack.generated.yml');
  assert.deepEqual(yaml.load(fs.readFileSync(output, 'utf8')), result);
  const before = fs.statSync(output).mtimeMs;
  api().exportBookmarks(options);
  assert.equal(fs.statSync(output).mtimeMs, before, 'unchanged output should not be rewritten');
  edit(options, 'UPDATE categories SET enabled = 0 WHERE id = 2; UPDATE bookmarks SET enabled = 0 WHERE id = 1');
  const hidden = api().exportBookmarks(options);
  assert.equal(hidden.menu.length, 1);
  assert.equal(hidden.sqlite_category_1.length, 1);
  assert(!Object.hasOwn(hidden, 'sqlite_category_3'));
});

for (const [label, sql, message] of [
  ['orphan category', 'PRAGMA foreign_keys=OFF; UPDATE categories SET parent_id=999 WHERE id=3', /parent/],
  ['deep hierarchy', 'UPDATE categories SET parent_id=3 WHERE id=4', /two levels/],
  ['cycle', 'UPDATE categories SET parent_id=3 WHERE id=2', /two levels|cycle/],
  ['mixed category', 'UPDATE bookmarks SET category_id=2 WHERE id=1', /parent category/],
  ['orphan bookmark', 'PRAGMA foreign_keys=OFF; UPDATE bookmarks SET category_id=999 WHERE id=1', /category/],
  ['invalid URL', "UPDATE bookmarks SET url='javascript:alert(1)' WHERE id=1", /url/]
]) {
  test(`rejects ${label} without replacing last valid YAML`, t => {
    const options = fixture(t);
    api().initialize(options);
    api().exportBookmarks(options);
    const output = path.join(options.base, 'webstack.generated.yml');
    const previous = fs.readFileSync(output, 'utf8');
    edit(options, sql);
    assert.throws(() => api().exportBookmarks(options), message);
    assert.equal(fs.readFileSync(output, 'utf8'), previous);
  });
}

test('missing/corrupt database and unowned output never overwrite user files', t => {
  const options = fixture(t);
  assert.throws(() => api().exportBookmarks(options), /init/);
  api().initialize(options);
  const output = path.join(options.base, 'webstack.generated.yml');
  fs.writeFileSync(output, '# user content\nmenu: []\n');
  assert.throws(() => api().exportBookmarks(options), /overwrite/);
  assert.equal(fs.readFileSync(output, 'utf8'), '# user content\nmenu: []\n');
  fs.writeFileSync(path.join(options.base, '.webstack/bookmarks.sqlite'), 'corrupt');
  assert.throws(() => api().exportBookmarks(options), /database/);
});

test('rejects public/source database paths and links into public content', t => {
  const options = fixture(t);
  for (const database of ['source/bookmarks.sqlite', 'public/bookmarks.sqlite', '../bookmarks.sqlite']) {
    assert.throws(() => api().initialize({ ...options, database }), /\.webstack/);
  }
  fs.mkdirSync(options.sourceDir);
  fs.symlinkSync(options.sourceDir, path.join(options.base, '.webstack'), process.platform === 'win32' ? 'junction' : 'dir');
  assert.throws(() => api().initialize(options), /source|private/);
  assert.deepEqual(fs.readdirSync(options.sourceDir), []);
});

test('reads committed WAL changes while another SQLite connection is open', t => {
  const options = fixture(t);
  api().initialize(options);
  const { DatabaseSync } = require('node:sqlite');
  const editor = new DatabaseSync(path.join(options.base, '.webstack/bookmarks.sqlite'));
  try {
    editor.exec("PRAGMA journal_mode=WAL; UPDATE bookmarks SET name='来自 WAL 的修改' WHERE id=1");
    assert.equal(api().exportBookmarks(options).sqlite_category_1[0].name, '来自 WAL 的修改');
  } finally { editor.close(); }
});

test('imports the existing Bookmark.db schema including live WAL and exports only bookmarks', t => {
  const options = fixture(t);
  const sourceDatabase = path.join(options.base, 'original.db');
  const { DatabaseSync } = require('node:sqlite');
  const source = new DatabaseSync(sourceDatabase);
  try {
    source.exec(`
      PRAGMA journal_mode=WAL;
      CREATE TABLE category (category TEXT PRIMARY KEY, key TEXT, favicon_code_fa TEXT, favicon_code_iconfont TEXT);
      CREATE TABLE bookmark (bk_id TEXT PRIMARY KEY, name TEXT, category TEXT, tags TEXT, url TEXT, favicon_url TEXT, description TEXT);
      CREATE TABLE ToDo (task TEXT);
      INSERT INTO ToDo VALUES ('Private task: do not export');
      INSERT INTO category VALUES ('实用工具', 'utility-tool', 'fa-solid fa-screwdriver-wrench', 'icon-tools');
      INSERT INTO bookmark VALUES ('original-string-id', '我的工具', '实用工具', '开发,工具', 'https://example.com/', '/logo.png', '说明');
    `);
    api().initialize({ ...options, sourceDatabase });
    const result = api().exportBookmarks(options);
    assert.deepEqual(result.menu, [{ name: '实用工具', icon: 'fas fa-tools', config: 'sqlite_utility-tool' }]);
    assert.deepEqual(result['sqlite_utility-tool'], [{ name: '我的工具', url: 'https://example.com/', img: '/logo.png', description: '说明', tags: '开发,工具' }]);
    assert(!JSON.stringify(result).includes('Private task'));
    assert.equal(source.prepare('SELECT bk_id FROM bookmark').get().bk_id, 'original-string-id');
    const copy = new DatabaseSync(path.join(options.base, '.webstack/bookmarks.sqlite'), { readOnly: true });
    try { assert.equal(copy.prepare('SELECT bk_id FROM bookmark').get().bk_id, 'original-string-id'); } finally { copy.close(); }
  } finally { source.close(); }
});
