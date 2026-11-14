const assert = require('node:assert/strict');
const { test } = require('node:test');
const { compatibleIcon, normalizeThemeIcons } = require('../lib/icon-compat.cjs');

test('normalizes Font Awesome 6 style classes and renamed icons to the bundled FA5', () => {
  assert.equal(compatibleIcon('fa-solid fa-book-open-reader'), 'fas fa-book-reader');
  assert.equal(compatibleIcon('fa-solid fa-screwdriver-wrench'), 'fas fa-tools');
  assert.equal(compatibleIcon('fa-regular fa-star'), 'far fa-star');
  assert.equal(compatibleIcon('fa-brands fa-ethereum'), 'fab fa-ethereum');
  assert.equal(compatibleIcon('fa-magnifying-glass'), 'fas fa-search');
  assert.equal(compatibleIcon('fas fa-book'), 'fas fa-book');
  assert.equal(compatibleIcon(), 'fas fa-folder');
  assert.equal(compatibleIcon('fa-solid'), 'fas fa-folder');
});

test('normalizes menu and about icons in the merged theme configuration', () => {
  const config = {
    menu: [
      { name: 'A', icon: 'fa-solid fa-tools', submenu: [{ name: 'B', icon: 'fa-brands fa-github' }] },
      { name: 'C', icon: 'far fa-star' }
    ],
    about: { icon: 'fa-solid fa-address-card' }
  };
  normalizeThemeIcons(config);
  assert.deepEqual(config.menu, [
    { name: 'A', icon: 'fas fa-tools', submenu: [{ name: 'B', icon: 'fab fa-github' }] },
    { name: 'C', icon: 'far fa-star' }
  ]);
  assert.equal(config.about.icon, 'fas fa-address-card');
});
