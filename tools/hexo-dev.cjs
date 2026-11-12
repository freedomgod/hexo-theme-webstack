// A real Hexo site for developing this theme without changing an existing blog.
const fs = require('node:fs/promises');
const path = require('node:path');
const Hexo = require('hexo');

const root = path.resolve(__dirname, '..');
const base = path.join(root, '.hexo-dev');
const command = process.argv[2] || 'server';

async function main() {
  if (!['generate', 'server'].includes(command)) {
    throw new Error('Use npm run build or npm run dev.');
  }

  await fs.mkdir(path.join(base, 'themes'), { recursive: true });
  const themeDir = path.join(base, 'themes', 'webstack-next');
  await fs.mkdir(themeDir, { recursive: true });
  // Link only theme inputs, so watchers never recurse into the generated site.
  for (const directory of ['layout', 'source', 'scripts', 'lib', 'examples']) {
    const target = path.join(root, directory);
    const link = path.join(themeDir, directory);
    try {
      await fs.lstat(link);
      if (await fs.realpath(link) !== await fs.realpath(target)) {
        throw new Error(`The development theme directory must point to ${target}`);
      }
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      await fs.symlink(target, link, process.platform === 'win32' ? 'junction' : 'dir');
    }
  }
  await fs.copyFile(path.join(root, '_config.example.yml'), path.join(themeDir, '_config.example.yml'));
  await fs.copyFile(path.join(root, 'package.json'), path.join(themeDir, 'package.json'));

  await fs.writeFile(path.join(base, 'package.json'), JSON.stringify({
    name: 'webstack-development',
    private: true,
    hexo: { version: require('hexo/package.json').version },
    dependencies: { 'hexo-renderer-pug': '*', 'hexo-server': '*' }
  }, null, 2));
  await fs.copyFile(path.join(root, 'dev-site', '_config.yml'), path.join(base, '_config.yml'));
  await fs.copyFile(path.join(root, '_config.example.yml'), path.join(base, '_config.webstack-next.yml'));
  await fs.cp(path.join(root, 'dev-site', 'source'), path.join(base, 'source'), { recursive: true });

  const hexo = new Hexo(base);
  let failed = false;
  let serving = false;
  // Hexo can log a renderer failure and still resolve generate(). Fail the build too.
  const logError = hexo.log.error.bind(hexo.log);
  hexo.log.error = (...args) => { failed = true; logError(...args); };
  try {
    await hexo.init();
    await hexo.call(command, { ip: '127.0.0.1', port: 4000 });
    if (failed) throw new Error('Hexo reported a build error; see the log above.');
    serving = command === 'server';
    if (command === 'generate') {
      for (const route of ['index.html', 'about/index.html', 'child/index.html']) {
        const html = await fs.readFile(path.join(hexo.public_dir, route), 'utf8');
        if (!html.includes('<!DOCTYPE html>') || !html.includes('main-content')) {
          throw new Error(`Expected a rendered theme page: ${route}`);
        }
        if (route === 'index.html' && !html.includes('class="resource-card"')) {
          throw new Error('The development homepage must render its configured resource cards.');
        }
      }
      console.log(`Hexo ${hexo.version}: homepage, about and child pages generated successfully.`);
    }
  } finally {
    if (!serving) await hexo.exit();
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
