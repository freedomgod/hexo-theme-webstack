(function () {
  'use strict';

  function init() {
    var toggles = document.querySelectorAll('.resource-section .section-toggle');
    var i;

    for (i = 0; i < toggles.length; i++) {
      toggles[i].addEventListener('click', function () {
        var grid = document.getElementById(this.getAttribute('aria-controls'));
        if (!grid) return;
        var expanded = this.getAttribute('aria-expanded') !== 'false';
        this.setAttribute('aria-expanded', String(!expanded));
        grid.hidden = expanded;
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
