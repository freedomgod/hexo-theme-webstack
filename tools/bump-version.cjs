// Decide the next version from the commits since the last release tag.
// The release workflow runs this after the tests pass; `--dry-run` prints the
// planned version without touching package.json.
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const BREAKING = /^BREAKING[ -]CHANGE:/m;

function classify(message) {
  const subject = message.split('\n')[0];
  if (/^[a-z]+(\([^)]*\))?!:/i.test(subject) || BREAKING.test(message)) return 'major';
  const type = subject.match(/^([a-z]+)(\([^)]*\))?:/i);
  if (!type) return null;
  const name = type[1].toLowerCase();
  // Conventional commits that change behavior; docs/chore/refactor/ci/test ship
  // with the next real release instead of publishing a version of their own.
  if (name === 'feat') return 'minor';
  if (name === 'fix' || name === 'perf') return 'patch';
  return null;
}

function bumpType(messages) {
  const types = messages.map(classify);
  if (types.includes('major')) return 'major';
  if (types.includes('minor')) return 'minor';
  if (types.includes('patch')) return 'patch';
  return null;
}

function nextVersion(version, type) {
  const [major, minor, patch] = version.split('-')[0].split('.').map(Number);
  if (type === 'major') return `${major + 1}.0.0`;
  if (type === 'minor') return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

function git(args, options = {}) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8', ...options }).trim();
}

function lastTag() {
  try {
    return git(['describe', '--tags', '--abbrev=0', '--match', 'v*'], { stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    // No tag yet: the whole history is the change set for the first release.
    return '';
  }
}

function commitMessages(since) {
  const range = since ? `${since}..HEAD` : 'HEAD';
  return git(['log', range, '--no-merges', '--format=%B%x00'])
    .split('\0')
    .map(message => message.trim())
    .filter(Boolean);
}

function writeVersion(version) {
  const manifestPath = path.join(root, 'package.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  manifest.version = version;
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  const lockPath = path.join(root, 'package-lock.json');
  if (!fs.existsSync(lockPath)) return;
  const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
  lock.version = version;
  if (lock.packages && lock.packages['']) lock.packages[''].version = version;
  fs.writeFileSync(lockPath, `${JSON.stringify(lock, null, 2)}\n`);
}

function main(argv) {
  const dryRun = argv.includes('--dry-run');
  const messages = commitMessages(lastTag());
  const type = bumpType(messages);
  if (!type) {
    console.log('No feat, fix, perf or breaking commit since the last release; nothing to publish.');
    if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, 'version=\ntype=\n');
    return 0;
  }
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  const version = nextVersion(manifest.version, type);
  console.log(`${dryRun ? 'Would release' : 'Releasing'} ${type} release ${manifest.version} -> ${version}`);
  if (!dryRun) writeVersion(version);
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `version=${version}\ntype=${type}\n`);
  return 0;
}

if (require.main === module) process.exitCode = main(process.argv.slice(2));

module.exports = { bumpType, classify, commitMessages, lastTag, nextVersion, writeVersion };
