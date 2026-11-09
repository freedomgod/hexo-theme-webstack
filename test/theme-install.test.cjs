const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');
const yaml = require('js-yaml');

const root = path.resolve(__dirname, '..');
function fixture(t) {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'webstack-next-install-'));
  t.after(() => fs.rmSync(base, { recursive: true, force: true }));
  fs.writeFileSync(path.join(base, 'package.json'), JSON.stringify({ hexo: { version: '8.1.2' } }));
  const themeDir = path.join(base, 'node_modules/hexo-theme-webstack-next');
  fs.mkdirSync(themeDir, { recursive: true });
  fs.copyFileSync(path.join(root, '_config.example.yml'), path.join(themeDir, '_config.example.yml'));
  return { base, themeDir };
}

test('development theme has an independent npm package identity', () => {
  assert.equal(require('../package.json').name, 'hexo-theme-webstack-next');
});

test('installation imports old settings without changing the original or replacing new core styles', t => {
  const { base, themeDir } = fixture(t);
  const original = '# Keep this comment\nmenu: []\ncustom:\n  head: <link href="/css/custom.css">\nicon: fa-solid fa-star\n';
  fs.writeFileSync(path.join(base, '_config.webstack.yml'), original);
  for (const [filename, value] of [
    ['themes/webstack/source/css/hclonely.css', 'old core'],
    ['themes/webstack/source/css/custom.css', 'personal style'],
    ['themes/webstack/source/css/fonts/fontawesome/css/all.min.css', 'old FA6'],
    ['node_modules/hexo-theme-webstack-next/source/css/hclonely.css', 'new core']
  ]) {
    fs.mkdirSync(path.dirname(path.join(base, filename)), { recursive: true });
    fs.writeFileSync(path.join(base, filename), value);
  }
  assert(fs.existsSync(path.join(root, 'lib/theme-install.cjs')), 'local install setup should exist');
  const { setupTheme } = require('../lib/theme-install.cjs');
  setupTheme(base, themeDir);
  assert.equal(fs.readFileSync(path.join(base, '_config.webstack-next.yml'), 'utf8'), original);
  assert.equal(fs.readFileSync(path.join(base, '_config.webstack.yml'), 'utf8'), original);
  assert.equal(fs.readFileSync(path.join(themeDir, 'source/css/hclonely.css'), 'utf8'), 'new core');
  assert.equal(fs.readFileSync(path.join(themeDir, 'source/css/custom.css'), 'utf8'), 'personal style');
  assert.equal(fs.readFileSync(path.join(themeDir, 'source/css/fonts/fontawesome/css/all.min.css'), 'utf8'), 'old FA6');
  fs.writeFileSync(path.join(base, '_config.webstack-next.yml'), 'menu: []\n# my new settings\n');
  setupTheme(base, themeDir);
  assert.equal(fs.readFileSync(path.join(base, '_config.webstack-next.yml'), 'utf8'), 'menu: []\n# my new settings\n');
});

test('fresh installs get a usable independent config and non-Hexo projects are untouched', t => {
  const { base, themeDir } = fixture(t);
  const { setupTheme } = require('../lib/theme-install.cjs');
  setupTheme(base, themeDir);
  const config = yaml.load(fs.readFileSync(path.join(base, '_config.webstack-next.yml'), 'utf8'));
  assert(config.menu.length > 0);
  assert.equal(config.bookmark_db.enable, false);
  const other = path.join(base, 'unrelated');
  fs.mkdirSync(other);
  fs.writeFileSync(path.join(other, 'package.json'), '{}');
  setupTheme(other, themeDir);
  assert(!fs.existsSync(path.join(other, '_config.webstack-next.yml')));
});
