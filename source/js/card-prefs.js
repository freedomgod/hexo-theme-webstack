(function () {
  'use strict';

  var STYLE_KEY = 'webstack.cardStyle';
  var SIZE_KEY = 'webstack.cardSize';
  var STYLES = ['elevated', 'outline', 'soft'];
  var SIZES = ['compact', 'standard', 'large'];
  var DEFAULTS = { style: 'elevated', size: 'standard' };

  function read(key, allowed, fallback) {
    try {
      var value = window.localStorage.getItem(key);
      return allowed.indexOf(value) !== -1 ? value : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function write(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (error) {}
  }

  function remove(key) {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {}
  }

  function init() {
    var root = document.documentElement;
    var trigger = document.querySelector('.card-pref-toggle');
    var panel = document.getElementById('card-prefs');
    if (!trigger || !panel) return;

    var scrim = document.querySelector('.card-prefs-scrim');
    var closeButton = panel.querySelector('.card-prefs-close');
    var resetButton = panel.querySelector('.card-prefs-reset');
    var status = document.getElementById('card-prefs-status');
    var state = {
      style: read(STYLE_KEY, STYLES, DEFAULTS.style),
      size: read(SIZE_KEY, SIZES, DEFAULTS.size)
    };

    function render() {
      root.setAttribute('data-card-style', state.style);
      root.setAttribute('data-card-size', state.size);

      var styleOptions = panel.querySelectorAll('[data-card-style]');
      var sizeOptions = panel.querySelectorAll('[data-card-size]');
      var i;
      for (i = 0; i < styleOptions.length; i++) {
        styleOptions[i].setAttribute('aria-pressed', String(styleOptions[i].getAttribute('data-card-style') === state.style));
      }
      for (i = 0; i < sizeOptions.length; i++) {
        sizeOptions[i].setAttribute('aria-pressed', String(sizeOptions[i].getAttribute('data-card-size') === state.size));
      }
    }

    function announce(option) {
      if (!status) return;
      var group = option.hasAttribute('data-card-style') ? '样式' : '大小';
      status.textContent = '已切换为' + group + '：' + option.textContent.trim();
    }

    function setStyle(value) {
      if (STYLES.indexOf(value) === -1) return;
      state.style = value;
      write(STYLE_KEY, value);
      render();
    }

    function setSize(value) {
      if (SIZES.indexOf(value) === -1) return;
      state.size = value;
      write(SIZE_KEY, value);
      render();
    }

    function open() {
      panel.hidden = false;
      if (scrim) scrim.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
      var selected = panel.querySelector('[data-card-style="' + state.style + '"]');
      (selected || closeButton).focus();
    }

    function close(returnFocus) {
      if (panel.hidden) return;
      panel.hidden = true;
      if (scrim) scrim.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
      if (returnFocus) trigger.focus();
    }

    trigger.addEventListener('click', function () {
      if (panel.hidden) {
        open();
      } else {
        close(false);
      }
    });

    panel.addEventListener('click', function (event) {
      var target = event.target;
      var option = target.closest ? target.closest('[data-card-style], [data-card-size]') : null;
      if (!option || !panel.contains(option)) return;
      if (option.hasAttribute('data-card-style')) {
        setStyle(option.getAttribute('data-card-style'));
      } else {
        setSize(option.getAttribute('data-card-size'));
      }
      announce(option);
    });

    if (closeButton) closeButton.addEventListener('click', function () { close(true); });
    if (scrim) scrim.addEventListener('click', function () { close(false); });

    if (resetButton) {
      resetButton.addEventListener('click', function () {
        state.style = DEFAULTS.style;
        state.size = DEFAULTS.size;
        remove(STYLE_KEY);
        remove(SIZE_KEY);
        render();
        if (status) status.textContent = '已恢复默认卡片外观';
        var selected = panel.querySelector('[data-card-style="' + state.style + '"]');
        if (selected) selected.focus();
      });
    }

    document.addEventListener('click', function (event) {
      if (panel.hidden) return;
      if (panel.contains(event.target) || trigger.contains(event.target)) return;
      close(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !panel.hidden) close(true);
    });

    window.addEventListener('storage', function (event) {
      if (event.key === STYLE_KEY) {
        state.style = STYLES.indexOf(event.newValue) !== -1 ? event.newValue : DEFAULTS.style;
        render();
      }
      if (event.key === SIZE_KEY) {
        state.size = SIZES.indexOf(event.newValue) !== -1 ? event.newValue : DEFAULTS.size;
        render();
      }
    });

    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
