const fs = require('node:fs');
const path = require('node:path');

function setupTheme(base, themeDir) {
  const packagePath = path.join(base, 'package.json');
  if (!fs.existsSync(packagePath) || !JSON.parse(fs.readFileSync(packagePath, 'utf8')).hexo) return;
  if (path.resolve(base) === path.resolve(themeDir)) return;
  const configPath = path.join(base, '_config.webstack-next.yml');
  if (!fs.existsSync(configPath)) {
    // This theme is independent: seed only from its own example, never from an
    // older WebStack install or its source/ assets.
    const example = path.join(themeDir, '_config.example.yml');
    if (fs.existsSync(example)) fs.copyFileSync(example, configPath, fs.constants.COPYFILE_EXCL);
  }
  return configPath;
}

module.exports = { setupTheme };
