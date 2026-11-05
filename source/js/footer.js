
$(document).ready(function () {
  $('.mode-toggle').attr('aria-pressed', String(document.body.classList.contains('night')));
  //img lazy loaded
  if (typeof lozad === 'function') {
    const observer = lozad();
    observer.observe();
  }

  $(document).on('click', '.has-sub', function () {
    var _this = $(this)
    if (!$(this).hasClass('expanded')) {
      setTimeout(function () {
        _this.find('ul').attr("style", "")
      }, 300);

    } else {
      $('.has-sub ul').each(function (id, ele) {
        var _that = $(this)
        if (_this.find('ul')[0] != ele && !expandAll) {
          setTimeout(function () {
            _that.attr("style", "")
          }, 300);
        }
      })
    }
  })
  $('.user-info-menu .hidden-sm').click(function () {
    if ($('.sidebar-menu').hasClass('collapsed')) {
      $('.has-sub.expanded > ul').attr("style", "")
    } else {
      $('.has-sub.expanded > ul').show()
    }
  })
  $("#main-menu li ul li").click(function () {
    $(this).siblings('li').removeClass('active'); // 删除其他兄弟元素的样式
    $(this).addClass('active'); // 添加当前元素的样式
  });
  $("a.smooth").click(function (ev) {
    ev.preventDefault();
    var target = document.getElementById(decodeURIComponent(this.hash.slice(1)));
    if (!target) return;
    public_vars.$mainMenu.add(public_vars.$sidebarProfile).removeClass('mobile-is-visible');
    ps_destroy();
    $("html, body").animate({
      scrollTop: $(target).offset().top - 30
    }, {
      duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 350,
      easing: "swing"
    });
  });
  return false;
});

var href = "";
var pos = 0;
$("a.smooth").click(function (e) {
  $("#main-menu li").each(function () {
    $(this).removeClass("active");
  });
  $(this).parent("li").addClass("active");
  e.preventDefault();
  href = $(this).attr("href");
  var target = document.getElementById(decodeURIComponent(this.hash.slice(1)));
  if (target) pos = $(target).position().top - 30;
});
(function () {
  if (document.cookie.replace(/(?:(?:^|.*;\s*)night\s*\=\s*([^;]*).*$)|^.*$/, "$1") === '') {
    if (new Date().getHours() > 22 || new Date().getHours() < 6) {
      document.body.classList.add('night');
      document.cookie = "night=1;path=/";
      console.log('夜间模式开启');
    } else {
      document.body.classList.remove('night');
      document.cookie = "night=0;path=/";
      console.log('夜间模式关闭');
    }
  } else {
    var night = document.cookie.replace(/(?:(?:^|.*;\s*)night\s*\=\s*([^;]*).*$)|^.*$/, "$1") || '0';
    if (night == '0') {
      document.body.classList.remove('night');
    } else if (night == '1') {
      document.body.classList.add('night');
    }
  }
})();
