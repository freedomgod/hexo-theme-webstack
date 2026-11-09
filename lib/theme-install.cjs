const fs = require('node:fs');
const path = require('node:path');

function setupTheme(base, themeDir) {
  const packagePath = path.join(base, 'package.json');
  if (!fs.existsSync(packagePath) || !JSON.parse(fs.readFileSync(packagePath, 'utf8')).hexo) return;
  if (path.resolve(base) === path.resolve(themeDir)) return;
  const configPath = path.join(base, '_config.webstack-next.yml');
  if (!fs.existsSync(configPath)) {
    const candidates = [
      path.join(base, 'source/_data/webstack.yml'),
      path.join(base, '_config.webstack.yml'),
      path.join(themeDir, '_config.example.yml')
    ];
    const source = candidates.find(filename => fs.existsSync(filename));
    fs.copyFileSync(source, configPath, fs.constants.COPYFILE_EXCL);
  }

  // Preserve referenced public assets without restoring upstream templates or
  // overwriting the new theme's core CSS/JS. No site content is changed.
  const oldTheme = [path.join(base, 'themes/webstack'), path.join(base, 'node_modules/hexo-theme-webstack')]
    .find(directory => fs.existsSync(path.join(directory, 'source')));
  if (oldTheme) {
    const oldSource = path.join(oldTheme, 'source');
    const destination = path.join(themeDir, 'source');
    const filter = filename => !fs.lstatSync(filename).isSymbolicLink();
    fs.cpSync(oldSource, destination, { recursive: true, force: false, filter });
    const fontawesome = path.join(oldSource, 'css/fonts/fontawesome');
    const config = fs.readFileSync(configPath, 'utf8');
    if (/\bfa-(solid|regular|brands)\b/.test(config) && fs.existsSync(fontawesome)) {
      fs.cpSync(fontawesome, path.join(destination, 'css/fonts/fontawesome'), { recursive: true, filter });
    }
  }
  return configPath;
}

module.exports = { setupTheme };
