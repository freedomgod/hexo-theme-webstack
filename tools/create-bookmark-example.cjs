const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const directory = path.resolve(__dirname, '../examples');
const temporary = path.join(directory, 'bookmarks.sqlite.tmp');
const db = new DatabaseSync(temporary);
try {
  db.exec(fs.readFileSync(path.join(directory, 'bookmarks.sql'), 'utf8'));
} finally { db.close(); }
fs.renameSync(temporary, path.join(directory, 'bookmarks.sqlite'));
console.log('Created examples/bookmarks.sqlite');
