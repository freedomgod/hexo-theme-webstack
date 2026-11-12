(function () {
  'use strict';

  // Busuanzi inserts counts after load. Stack label/number only when they no longer fit one row.
  function fit(metric) {
    var label = metric.querySelector('.busuanzi-label');
    var count = metric.querySelector('.busuanzi-count');
    if (!label || !count) return;

    // Measure both states without unstacking first: toggling inside a ResizeObserver loops.
    var shouldStack = label.scrollWidth + count.scrollWidth + 6 > metric.clientWidth;
    metric.classList.toggle('is-stacked', shouldStack);
  }

  function init() {
    var metrics = document.querySelectorAll('.busuanzi-metric');
    var i;

    for (i = 0; i < metrics.length; i++) {
      (function (metric) {
        fit(metric);
        if (window.ResizeObserver) {
          new ResizeObserver(function () { fit(metric); }).observe(metric);
        }
      })(metrics[i]);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
