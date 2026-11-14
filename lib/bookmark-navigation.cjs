const { compatibleIcon } = require('./icon-compat.cjs');

function fail(label, message) { throw new Error(`${label}: ${message}`); }
function text(row, field, label, required = false) {
  if (typeof row[field] !== 'string' || (required && !row[field].trim())) fail(label, `${field} must be ${required ? 'nonempty ' : ''}text`);
}
function common(row, label) {
  if (!Number.isSafeInteger(row.id) || row.id <= 0) fail(label, 'id must be a positive integer');
  if (!Number.isSafeInteger(row.sort_order)) fail(label, 'sort_order must be an integer');
  if (row.enabled !== 0 && row.enabled !== 1) fail(label, 'enabled must be 0 or 1');
  text(row, 'name', label, true);
}
function validUrl(value, label) {
  if (/\s/.test(value) || !(/^(https?:\/\/|ftp:\/\/|mailto:)/i.test(value) || /^(\/(?!\/)|\.\.?\/|#)/.test(value))) {
    fail(label, 'url must use http(s), ftp, mailto, or a local path/anchor');
  }
}

function toNavigation(categories, bookmarks) {
  const byId = new Map(categories.map(row => [row.id, row]));
  const children = new Map();
  const lists = new Map();
  for (const row of categories) {
    const label = `Category ${row.id}`;
    common(row, label);
    text(row, 'icon', label);
    if (row.parent_id !== null) {
      const parent = byId.get(row.parent_id);
      if (!parent) fail(label, `parent ${row.parent_id} does not exist`);
      if (parent.id === row.id || parent.parent_id !== null) fail(label, 'only two levels are supported; no cycles');
      if (!children.has(parent.id)) children.set(parent.id, []);
      children.get(parent.id).push(row);
    }
    lists.set(row.id, []);
  }
  for (const row of bookmarks) {
    const label = `Bookmark ${row.id}`;
    common(row, label);
    for (const field of ['url', 'img', 'description']) text(row, field, label, field === 'url');
    if (row.tags !== undefined) text(row, 'tags', label);
    validUrl(row.url, label);
    if (!byId.has(row.category_id)) fail(label, `category ${row.category_id} does not exist`);
    if (children.has(row.category_id)) fail(label, 'a parent category with subcategories cannot contain bookmarks');
    if (row.enabled) {
      const bookmark = { name: row.name, url: row.url, img: row.img, description: row.description };
      if (row.tags) bookmark.tags = row.tags;
      lists.get(row.category_id).push(bookmark);
    }
  }

  const result = { menu: [] };
  function leaf(row) {
    const config = `sqlite_category_${row.id}`;
    result[config] = lists.get(row.id);
    return { name: row.name, icon: compatibleIcon(row.icon), config };
  }
  for (const row of categories.filter(row => row.parent_id === null && row.enabled)) {
    if (children.has(row.id)) {
      const submenu = children.get(row.id).filter(child => child.enabled).map(leaf);
      if (submenu.length) result.menu.push({ name: row.name, icon: compatibleIcon(row.icon), submenu });
    } else result.menu.push(leaf(row));
  }
  return result;
}

module.exports = { toNavigation };
