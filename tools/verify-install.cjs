// Build a separate consumer site using the README homepage and copied theme files.
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const Hexo = require('hexo');
const yaml = require('js-yaml');

async function main() {
  const root = path.resolve(__dirname, '..');
  await fs.mkdir(path.join(root, 'output'), {recursive: true});
  const base = await fs.mkdtemp(path.join(root, 'output', 'install-check-'));
  const themeDir = path.join(base, 'themes', 'webstack-next');
  await fs.mkdir(themeDir, {recursive: true});
  for (const entry of ['layout', 'source', 'scripts', 'lib', 'examples', '_config.example.yml', 'package.json']) {
    await fs.cp(path.join(root, entry), path.join(themeDir, entry), {recursive: true});
  }
  await fs.mkdir(path.join(base, 'source', 'child'), {recursive: true});
  await fs.mkdir(path.join(base, 'source', 'about'), {recursive: true});
  await fs.writeFile(path.join(base, 'package.json'), JSON.stringify({
    private: true, hexo: {version: '8.1.2'}, dependencies: {'hexo-renderer-pug': '^3.0.0'}
  }));
  const readme = await fs.readFile(path.join(root, 'README.md'), 'utf8');
  const homepage = readme.match(/```yaml\r?\n(---\r?\nlayout: index[\s\S]*?---)\r?\n```/);
  assert(homepage, 'README must include a complete homepage example');
  await fs.writeFile(path.join(base, 'source', 'index.html'), homepage[1]);
  await fs.copyFile(path.join(root, 'dev-site', 'source', 'about', 'index.html'), path.join(base, 'source', 'about', 'index.html'));
  // A child page with no menu overrides must inherit the theme's categories.
  await fs.writeFile(path.join(base, 'source', 'child', 'index.html'), '---\nlayout: page\ntype: child\ntitle: Child resources\n---\n');
  const theme = yaml.load(await fs.readFile(path.join(root, '_config.example.yml'), 'utf8'));
  theme.about = {};
  await fs.writeFile(path.join(base, '_config.webstack-next.yml'), yaml.dump(theme));
  await fs.writeFile(path.join(base, '_config.yml'), yaml.dump({
    theme: 'webstack-next', title: 'Consumer site', author: 'Site Owner', language: 'en',
    url: 'https://example.com/navigation', root: '/navigation/'
  }));
  const hexo = new Hexo(base, {silent: true});
  const errors = [];
  hexo.log.error = (...args) => errors.push(args.map(String).join(' '));
  try {
    await hexo.init();
    await hexo.call('generate');
    assert.deepEqual(errors, [], 'consumer build must not log renderer errors');
    for (const route of ['index.html', 'about/index.html', 'child/index.html']) {
      const html = await fs.readFile(path.join(base, 'public', route), 'utf8');
      assert.equal((html.match(/<head>/g) || []).length, 1, `${route}: one head`);
      assert.equal((html.match(/<footer\b/g) || []).length, 1, `${route}: one footer`);
      assert(html.includes('name="author" content="Site Owner"'), `${route}: site author`);
      assert(html.includes('github.com/freedomgod/hexo-theme-webstack-next'), `${route}: fork link`);
      assert(html.includes('github.com/HCLonely/hexo-theme-webstack'), `${route}: upstream credit`);
      assert(!html.includes('class="submit-tag"'), `${route}: empty about disables link`);
      assert(!html.includes('undefined'), `${route}: no undefined values`);
      for (const match of html.matchAll(/(?:src|href)="(\/navigation\/(?:images|css|js)\/[^"?#]+)"/g)) {
        await fs.access(path.join(base, 'public', match[1].slice('/navigation/'.length)));
      }
      if (route !== 'about/index.html') {
        assert(html.includes('class="resource-card"'), `${route}: configured cards must render`);
      }
    }
    const child = await fs.readFile(path.join(base, 'public', 'child/index.html'), 'utf8');
    assert(child.includes('<title>Child resources</title>'), 'child title without trailing separator');
    console.log('PASS: README homepage, copied-theme installation, author/title/credits, inherited child menu, hidden about link, and subdirectory assets.');
  } finally { await hexo.exit(); }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
