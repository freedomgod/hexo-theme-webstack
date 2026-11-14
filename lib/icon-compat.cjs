const STYLE_ALIASES = {
  'fa-solid': 'fas',
  'fa-regular': 'far',
  'fa-brands': 'fab',
  'fa-light': 'fas',
  'fa-thin': 'fas',
  'fa-duotone': 'fas',
  'fa-sharp': 'fas'
};

// Font Awesome 6 renamed many icons. Keep the common ones so configurations
// copied from FA6 documentation render with the bundled FA5 instead of tofu.
const ICON_ALIASES = {
  'fa-book-open-reader': 'fa-book-reader',
  'fa-screwdriver-wrench': 'fa-tools',
  'fa-magnifying-glass': 'fa-search',
  'fa-house': 'fa-home',
  'fa-gear': 'fa-cog',
  'fa-xmark': 'fa-times',
  'fa-circle-xmark': 'fa-times-circle',
  'fa-circle-check': 'fa-check-circle',
  'fa-circle-exclamation': 'fa-exclamation-circle',
  'fa-triangle-exclamation': 'fa-exclamation-triangle',
  'fa-arrow-right-from-bracket': 'fa-sign-out-alt',
  'fa-arrow-right-to-bracket': 'fa-sign-in-alt',
  'fa-up-right-from-square': 'fa-external-link-alt',
  'fa-pen-to-square': 'fa-edit',
  'fa-trash-can': 'fa-trash-alt',
  'fa-file-lines': 'fa-file-alt',
  'fa-calendar-days': 'fa-calendar-alt',
  'fa-location-dot': 'fa-map-marker-alt',
  'fa-message': 'fa-comment',
  'fa-shield-halved': 'fa-shield-alt',
  'fa-cloud-arrow-down': 'fa-cloud-download-alt',
  'fa-cloud-arrow-up': 'fa-cloud-upload-alt',
  'fa-hard-drive': 'fa-hdd',
  'fa-display': 'fa-desktop',
  'fa-mobile-screen-button': 'fa-mobile-alt',
  'fa-tablet-screen-button': 'fa-tablet-alt',
  'fa-arrows-rotate': 'fa-sync',
  'fa-rotate-right': 'fa-redo',
  'fa-rotate-left': 'fa-undo',
  'fa-link-slash': 'fa-unlink',
  'fa-volume-high': 'fa-volume-up',
  'fa-volume-low': 'fa-volume-down',
  'fa-volume-xmark': 'fa-volume-mute',
  'fa-star-half-stroke': 'fa-star-half-alt',
  'fa-diagram-project': 'fa-project-diagram',
  'fa-bars-progress': 'fa-tasks',
  'fa-list-check': 'fa-tasks',
  'fa-table-columns': 'fa-columns',
  'fa-table-list': 'fa-th-list',
  'fa-table-cells': 'fa-th',
  'fa-table-cells-large': 'fa-th-large',
  'fa-rectangle-list': 'fa-list',
  'fa-maximize': 'fa-expand',
  'fa-minimize': 'fa-compress'
};

const STYLE_CLASSES = new Set(['fa', 'fas', 'far', 'fab']);

function compatibleIcon(value, fallback = 'fas fa-folder') {
  if (typeof value !== 'string' || !value.trim()) return fallback;
  const tokens = value.trim().split(/\s+/).map(token => STYLE_ALIASES[token] || ICON_ALIASES[token] || token);
  if (!tokens.some(token => STYLE_CLASSES.has(token))) tokens.unshift('fas');
  if (!tokens.some(token => !STYLE_CLASSES.has(token))) return fallback;
  return tokens.join(' ');
}

function normalizeThemeIcons(config) {
  if (!config || typeof config !== 'object') return;
  const normalizeEntry = entry => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return;
    if (Object.hasOwn(entry, 'icon')) entry.icon = compatibleIcon(entry.icon);
    if (Array.isArray(entry.submenu)) entry.submenu.forEach(normalizeEntry);
  };
  if (Array.isArray(config.menu)) config.menu.forEach(normalizeEntry);
  if (config.about && typeof config.about === 'object' && Object.hasOwn(config.about, 'icon')) {
    config.about.icon = compatibleIcon(config.about.icon);
  }
}

module.exports = { compatibleIcon, normalizeThemeIcons };
