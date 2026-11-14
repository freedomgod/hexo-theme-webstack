const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const net = require('node:net');
const { once } = require('node:events');
const { test } = require('node:test');
const Hexo = require('hexo');
const yaml = require('js-yaml');
const { DatabaseSync } = require('node:sqlite');

const root = path.resolve(__dirname, '..');
async function fixture(t, enabled = true, legacy = false, overrides = {}) {
  fs.mkdirSync(path.join(root, 'output'), { recursive: true });
  const base = fs.mkdtempSync(path.join(root, 'output', 'sqlite-check-'));
  const themeDir = path.join(base, 'themes/webstack-next');
  fs.mkdirSync(themeDir, { recursive: true });
  for (const entry of ['layout', 'source', 'scripts', 'lib', 'examples', '_config.example.yml', 'package.json']) {
    fs.cpSync(path.join(root, entry), path.join(themeDir, entry), { recursive: true });
  }
  fs.mkdirSync(path.join(base, 'source/_data'), { recursive: true });
  fs.writeFileSync(path.join(base, 'source/index.html'), '---\nlayout: index\n__index: true\ntitle: Database test\n---\n');
  fs.writeFileSync(path.join(base, 'package.json'), JSON.stringify({ private: true, hexo: { version: '8.1.2' }, dependencies: { 'hexo-renderer-pug': '*', 'hexo-server': '*' } }));
  fs.writeFileSync(path.join(base, '_config.yml'), yaml.dump({ theme: 'webstack-next', title: 'SQLite test', url: 'https://example.com', deploy: { type: 'capture' } }));
  const theme = yaml.load(fs.readFileSync(path.join(root, '_config.example.yml'), 'utf8'));
  theme.bookmark_db = { enable: enabled };
  Object.assign(theme, overrides);
  fs.writeFileSync(path.join(base, legacy ? 'source/_data/webstack-next.yml' : '_config.webstack-next.yml'), yaml.dump(theme));
  const hexo = new Hexo(base, { silent: true });
  const errors = [];
  hexo.log.error = (...args) => errors.push(args.map(String).join(' '));
  t.after(async () => { hexo.unwatch(); await hexo.exit(); assert.deepEqual(errors, []); });
  await hexo.init();
  function edit(sql) {
    const db = new DatabaseSync(path.join(base, '.webstack/bookmarks.sqlite'));
    try { db.exec(sql); } finally { db.close(); }
  }
  return { hexo, base, edit, html: () => fs.readFileSync(path.join(base, 'public/index.html'), 'utf8') };
}

test('copied theme registers commands, exports on first build and redeploys fresh database content', async t => {
  const { hexo, base, edit, html } = await fixture(t);
  assert(hexo.extend.console.get('bookmarks'), 'theme should register hexo bookmarks');
  await hexo.call('bookmarks', { _: ['init'] });
  edit("UPDATE bookmarks SET name='首次数据库书签' WHERE id=1");
  await hexo.call('generate', { bail: true });
  assert.match(html(), /首次数据库书签/);
  assert.match(html(), /hclonely\.css/);
  assert.equal(yaml.load(fs.readFileSync(path.join(base, '_config.webstack-next.yml'), 'utf8')).hotTools[0].name, 'GitHub');
  const publicFiles = fs.readdirSync(path.join(base, 'public'), { recursive: true });
  assert(!publicFiles.some(file => /sqlite|\.sql$|generated\.yml|\.webstack/.test(file)), 'database and source YAML must never be published');
  let deployed = 0;
  let generations = 0;
  let expected = '部署前最新书签';
  hexo.on('generateAfter', () => { generations++; });
  hexo.extend.deployer.register('capture', () => { deployed++; assert(html().includes(expected)); });
  edit(`UPDATE bookmarks SET name='${expected}' WHERE id=1`);
  await hexo.call('deploy', {});
  assert.equal(deployed, 1);
  assert.equal(generations, 1, 'plain deploy must generate once even when public exists');
  expected = '生成后部署';
  edit(`UPDATE bookmarks SET name='${expected}' WHERE id=1`);
  await hexo.call('generate', { deploy: true, bail: true });
  assert.equal(deployed, 2);
  assert.equal(generations, 2, 'generate --deploy must not loop or generate twice');
  const previous = fs.readFileSync(path.join(base, 'webstack.generated.yml'), 'utf8');
  edit('PRAGMA foreign_keys=OFF; UPDATE bookmarks SET category_id=999 WHERE id=1');
  await assert.rejects(hexo.call('deploy', {}), /category/);
  assert.equal(deployed, 2, 'invalid data must stop deployment');
  assert.equal(fs.readFileSync(path.join(base, 'webstack.generated.yml'), 'utf8'), previous);
});

test('server startup uses SQLite with the legacy webstack.yml configuration', async t => {
  const { hexo, base, edit } = await fixture(t, true, true);
  assert(hexo.extend.console.get('bookmarks'), 'theme should register hexo bookmarks');
  await hexo.call('bookmarks', { _: ['init'] });
  edit("UPDATE bookmarks SET name='服务器读取数据库' WHERE id=1");
  const probe = net.createServer();
  probe.listen(0, '127.0.0.1');
  await once(probe, 'listening');
  const port = probe.address().port;
  await new Promise(resolve => probe.close(resolve));
  const server = await hexo.call('server', { ip: '127.0.0.1', port });
  try {
    const response = await fetch(`http://127.0.0.1:${port}/`);
    assert.equal(response.status, 200);
    assert.match(await response.text(), /服务器读取数据库/);
    assert(fs.existsSync(path.join(base, 'webstack.generated.yml')));
  } finally { await new Promise(resolve => server.close(resolve)); }
});

test('disabled mode preserves YAML, and conflicting category data fails explicitly', async t => {
  const { hexo, base } = await fixture(t, false);
  fs.writeFileSync(path.join(base, 'source/_data/webstack.yml'), 'menu: []\nbookmark_db:\n  enable: true\n');
  await hexo.call('generate', { bail: true });
  assert.match(fs.readFileSync(path.join(base, 'public/index.html'), 'utf8'), /class="resource-card"/, 'old webstack data must not replace the new theme configuration');
  assert(!fs.existsSync(path.join(base, 'webstack.generated.yml')));
  assert(!fs.existsSync(path.join(base, '.webstack')));
  assert(hexo.extend.console.get('bookmarks'), 'theme should register hexo bookmarks even when disabled');
  await hexo.call('bookmarks', { _: ['init'] });
  hexo.config.theme_config.bookmark_db.enable = true;
  fs.writeFileSync(path.join(base, 'source/_data/sqlite_category_1.yml'), '- name: stale data\n');
  await assert.rejects(hexo.call('generate'), /conflict/i);
  assert(!fs.existsSync(path.join(base, 'webstack.generated.yml')), 'conflicts must fail before writing YAML');
});

test('normalizes Font Awesome 6 icons from YAML before rendering', async t => {
  const { hexo, base } = await fixture(t, false, false, {
    menu: [{ name: '工具', icon: 'fa-solid fa-screwdriver-wrench', config: 'hotTools' }],
    about: { url: '/about/', icon: 'fa-solid fa-address-card', name: '关于本站' }
  });
  await hexo.call('generate', { bail: true });
  const html = fs.readFileSync(path.join(base, 'public/index.html'), 'utf8');
  assert.match(html, /class="fas fa-tools"/);
  assert.match(html, /class="fas fa-address-card"/);
  assert.doesNotMatch(html, /fa-solid/);
});

test('export-db reads split YAML even when SQLite is enabled but missing, without generating pages', async t => {
  const { hexo, base } = await fixture(t, true);
  const list = '- name: 当前 YAML 书签\n  url: https://example.com/current\n  tags: 中文,工具\n';
  fs.writeFileSync(path.join(base, 'source/_data/hotTools.yml'), list);
  let generations = 0;
  hexo.on('generateBefore', () => { generations++; });
  const original = fs.readFileSync(path.join(base, '_config.webstack-next.yml'), 'utf8');
  await hexo.call('bookmarks', { _: ['export-db'] });
  assert.equal(generations, 0);
  assert(!fs.existsSync(path.join(base, 'public/index.html')));
  assert(!fs.existsSync(path.join(base, 'webstack.generated.yml')));
  assert.equal(fs.readFileSync(path.join(base, '_config.webstack-next.yml'), 'utf8'), original);
  assert.equal(fs.readFileSync(path.join(base, 'source/_data/hotTools.yml'), 'utf8'), list);
  const db = new DatabaseSync(path.join(base, '.webstack/bookmarks.sqlite'), { readOnly: true });
  try { assert.equal(db.prepare('SELECT name FROM bookmarks WHERE id=1').get().name, '当前 YAML 书签'); } finally { db.close(); }
  const second = await hexo.call('bookmarks', { _: ['export-db'] });
  assert.notEqual(second.filename, path.join(base, '.webstack/bookmarks.sqlite'));
  assert.match(path.basename(second.filename), /^bookmarks-\d{8}-\d{6}(-\d+)?\.sqlite$/);
  const backup = await hexo.call('bookmarks', { _: ['export-db'], output: '.webstack/backup.sqlite' });
  assert.equal(backup.filename, path.join(base, '.webstack/backup.sqlite'));
  const renamed = await hexo.call('bookmarks', { _: ['export-db'], output: '.webstack/backup.sqlite' });
  assert.notEqual(renamed.filename, backup.filename);
  assert.match(path.basename(renamed.filename), /^backup-\d{8}-\d{6}(-\d+)?\.sqlite$/);
  await hexo.call('generate', { bail: true });
  const html = fs.readFileSync(path.join(base, 'public/index.html'), 'utf8');
  assert.match(html, /当前 YAML 书签/);
});

test('export-db retains theme array entries inherited through Hexo deep merging', async t => {
  const { hexo, base } = await fixture(t, false);
  fs.writeFileSync(path.join(hexo.theme_dir, '_config.yml'), yaml.dump({
    menu: [{ name: 'First', config: 'first' }, { name: 'Second', config: 'second' }],
    first: [{ name: 'Original', url: 'https://first.example/' }, { name: 'Inherited', url: 'https://inherited.example/' }],
    second: [{ name: 'Another', url: 'https://another.example/' }]
  }));
  hexo.config.theme_config = { menu: [{ name: 'Renamed' }], first: [{ name: 'Updated' }], bookmark_db: { enable: false } };
  await hexo.call('generate', { bail: true });
  const html = fs.readFileSync(path.join(base, 'public/index.html'), 'utf8');
  assert.equal((html.match(/class="resource-card"/g) || []).length, 3);
  const result = await hexo.call('bookmarks', { _: ['export-db'] });
  assert.equal(result.categories, 2);
  assert.equal(result.bookmarks, 3);
  const db = new DatabaseSync(result.filename, { readOnly: true });
  try { assert.deepEqual(db.prepare('SELECT name FROM bookmarks ORDER BY id').all().map(row => row.name), ['Updated', 'Inherited', 'Another']); } finally { db.close(); }
});

for (const extension of ['yml', 'yaml', 'json']) test(`export-db and fresh deploy use active .${extension} settings over root settings`, async t => {
  const { hexo, base } = await fixture(t, false);
  const active = {
    bookmark_db: { enable: true, path: '.webstack/custom.sqlite' },
    menu: [{ name: 'Custom', config: 'custom' }],
    custom: [{ name: 'Custom location', url: 'https://example.com/' }]
  };
  fs.writeFileSync(path.join(base, `source/_data/webstack-next.${extension}`), extension === 'json' ? JSON.stringify(active) : yaml.dump(active));
  const result = await hexo.call('bookmarks', { _: ['export-db'] });
  assert.equal(result.filename, path.join(base, '.webstack/custom.sqlite'));
  assert(!fs.existsSync(path.join(base, '.webstack/bookmarks.sqlite')));
  await hexo.call('generate', { bail: true });
  assert.match(fs.readFileSync(path.join(base, 'public/index.html'), 'utf8'), /Custom location/);
  const db = new DatabaseSync(result.filename);
  try { db.exec("UPDATE bookmarks SET name='Fresh database change' WHERE id=1"); } finally { db.close(); }
  const fresh = new Hexo(base, { silent: true });
  const errors = [];
  fresh.log.error = (...args) => errors.push(args.map(String).join(' '));
  try {
    await fresh.init();
    let generations = 0;
    let deployed = 0;
    fresh.on('generateAfter', () => { generations++; });
    fresh.extend.deployer.register('capture', () => {
      deployed++;
      assert.match(fs.readFileSync(path.join(base, 'public/index.html'), 'utf8'), /Fresh database change/);
    });
    await fresh.call('deploy', {});
    assert.equal(deployed, 1);
    assert.equal(generations, 1, 'fresh deploy must regenerate existing public files using effective database settings');
    assert.deepEqual(errors, []);
  } finally { await fresh.exit(); }
});

test('bookmarks command names the supported actions and installed version', async t => {
  const { hexo } = await fixture(t, false);
  await assert.rejects(hexo.call('bookmarks', { _: [] }),
    /Missing bookmarks action\. Usage: hexo bookmarks <init\|export\|export-db> \(hexo-theme-webstack-next \d+\.\d+\.\d+/);
  await assert.rejects(hexo.call('bookmarks', { _: ['publish'] }), /Unknown bookmarks action "publish"\./);
});
