const test = require('node:test');
const assert = require('node:assert/strict');
const { bumpType, classify, nextVersion } = require('../tools/bump-version.cjs');

test('only behavior changes ask for a release', () => {
  assert.equal(classify('feat: add a page'), 'minor');
  assert.equal(classify('fix(bookmarks): keep WAL files'), 'patch');
  assert.equal(classify('perf: skip unchanged tags'), 'patch');
  assert.equal(classify('docs: explain the path'), null);
  assert.equal(classify('chore: update deps'), null);
  assert.equal(classify('refactor: split the loader'), null);
  assert.equal(classify('plain message without a type'), null);
});

test('breaking changes win over the commit type', () => {
  assert.equal(classify('feat!: drop the YAML menu'), 'major');
  assert.equal(classify('fix(api)!: rename databasePath'), 'major');
  assert.equal(classify('feat: new option\n\nBREAKING CHANGE: config key renamed'), 'major');
  assert.equal(bumpType(['docs: note', 'feat!: drop it', 'feat: more']), 'major');
  assert.equal(bumpType(['docs: note', 'feat: more', 'fix: bug']), 'minor');
  assert.equal(bumpType(['docs: note', 'fix: bug']), 'patch');
  assert.equal(bumpType(['docs: note', 'chore: deps']), null);
  assert.equal(bumpType([]), null);
});

test('next versions follow semver and drop pre-release suffixes', () => {
  assert.equal(nextVersion('3.0.6', 'patch'), '3.0.7');
  assert.equal(nextVersion('3.0.6', 'minor'), '3.1.0');
  assert.equal(nextVersion('3.0.6', 'major'), '4.0.0');
  assert.equal(nextVersion('3.1.0-beta.2', 'patch'), '3.1.1');
});
