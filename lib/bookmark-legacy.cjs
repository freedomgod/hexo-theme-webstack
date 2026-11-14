const { toNavigation } = require('./bookmark-navigation.cjs');
const { compatibleIcon } = require('./icon-compat.cjs');

// Adapt the existing Bookmark.db without changing its schema or string IDs.
function legacyNavigation(db) {
  const categories = db.prepare('SELECT category, key, favicon_code_fa FROM category ORDER BY rowid').all();
  const bookmarks = db.prepare('SELECT bk_id, name, category, tags, url, favicon_url, description FROM bookmark ORDER BY rowid').all();
  const ids = new Map(categories.map((row, index) => [row.category, index + 1]));
  const keys = new Set();
  for (const row of categories) {
    if (typeof row.key !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(row.key) || keys.has(row.key)) {
      throw new Error(`Category ${row.category}: key must be unique and contain only letters, digits, _ or -`);
    }
    keys.add(row.key);
  }
  const navigation = toNavigation(categories.map((row, index) => ({
    id: index + 1, parent_id: null, name: row.category, icon: compatibleIcon(row.favicon_code_fa), sort_order: index, enabled: 1
  })), bookmarks.map((row, index) => ({
    id: index + 1, category_id: ids.get(row.category), name: row.name, url: row.url,
    img: row.favicon_url, description: row.description, sort_order: index, enabled: 1
  })));
  const result = { menu: [] };
  for (const [index, category] of categories.entries()) {
    const config = `sqlite_${category.key}`;
    const entry = navigation.menu[index];
    result.menu.push({ ...entry, config });
    result[config] = navigation[entry.config];
    const originals = bookmarks.filter(row => row.category === category.category);
    result[config].forEach((bookmark, i) => {
      if (originals[i].tags) bookmark.tags = originals[i].tags;
    });
  }
  return result;
}

module.exports = { legacyNavigation };
