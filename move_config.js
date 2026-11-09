const path = require('node:path');
const { setupTheme } = require('./lib/theme-install.cjs');

// INIT_CWD is the consumer directory for npm install --install-links <local path>.
const consumer = process.env.INIT_CWD || path.resolve(__dirname, '../..');
const result = setupTheme(consumer, __dirname);
if (result) console.log(`WebStack Next: configuration ready at ${result}`);
