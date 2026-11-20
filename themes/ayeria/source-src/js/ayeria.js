(function ($) {
  // Search
  let $searchWrap = $(".search-form-wrap"),
    isSearchAnim = false,
    searchAnimDuration = 200;

  const startSearchAnim = () => {
    isSearchAnim = true;
  };

  const stopSearchAnim = (callback) => {
    setTimeout(function () {
      isSearchAnim = false;
      callback && callback();
    }, searchAnimDuration);
  };

  $(".nav-item-search").on("click", () => {
    if (isSearchAnim) return;
    startSearchAnim();
    $searchWrap.addClass("on");
    stopSearchAnim(function () {
      $(".local-search-input").focus();
    });
  });

  $(document).on("mouseup", (e) => {
    const _con = $(".local-search");
    if (!_con.is(e.target) && _con.has(e.target).length === 0) {
      $searchWrap.removeClass("on");
    }
  });

  // Not recommended in mobile, /search.xml is actually large.
  if ($(".local-search").length) {
    $.getScript("/js/search.js", function () {
      searchFunc("/search.xml", "local-search-input", "local-search-result");
    });
  }

  // Mobile Detect
  const isMobile = {
    Android: function () {
      return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function () {
      return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function () {
      return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function () {
      return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function () {
      return navigator.userAgent.match(/IEMobile/i);
    },
    any: function () {
      return (
        isMobile.Android() ||
        isMobile.BlackBerry() ||
        isMobile.iOS() ||
        isMobile.Opera() ||
        isMobile.Windows()
      );
    },
  };

  // Lazyload
  $("img.lazy").lazyload({
    effect: "fadeIn",
  });

  // JustifiedGallery
  $("#gallery").justifiedGallery({
    rowHeight: 200,
    margins: 5,
  });

  // ScrollDown
  $(document).ready(function ($) {
    $(".anchor").on("click", function (e) {
      e.preventDefault();
      $("main").animate({ scrollTop: $(".cover").height() }, "smooth");
    });
  });

  // To Top
  (() => {
    // When to show the scroll link
    // higher number = scroll link appears further down the page
    const upperLimit = 1000;

    // Our scroll link element
    const scrollElem = $("#totop");

    // Scroll to top speed
    const scrollSpeed = 1000;

    // Show and hide the scroll to top link based on scroll position
    scrollElem.hide();
    $(".content").on("scroll", () => {
      const scrollTop = $(".content").scrollTop();
      if (scrollTop > upperLimit) {
        $(scrollElem).stop().fadeTo(200, 0.6); // fade back in
      } else {
        $(scrollElem).stop().fadeTo(200, 0); // fade out
      }
    });

    // Scroll to top animation on click
    $(scrollElem).on("click", () => {
      $(".content").animate({ scrollTop: 0 }, scrollSpeed);
      return false;
    });
  })();

  // Caption
  $(".article-entry").each(function (i) {
    $(this)
      .find("img")
      .each(function () {
        if ($(this).parent().is("a")) return;

        const { alt } = this;

        if (alt) $(this).after('<span class="caption">' + alt + "</span>");
      });
  });

  // Mobile Nav
  const $content = $(".content"),
    $sidebar = $(".sidebar");

  $(".navbar-toggle").on("click", () => {
    $(".content,.sidebar").addClass("anim");
    $content.toggleClass("on");
    $sidebar.toggleClass("on");
  });

  // Popup menu items
  $(".nav-main").on("click", '.nav-item-link[data-target="popup"]', function (e) {
    e.preventDefault();
    var $this = $(this);
    window.open(
      $this.attr("href"),
      $this.data("popup-name"),
      "width=" + $this.data("popup-width") + ",height=" + $this.data("popup-height")
    );
  });

  // Reward Modal
  var rewardPreviousFocus = null;

  function closeReward() {
    var $modal = $("#reward");
    if (!$modal.hasClass("visible")) return;
    $("#mask").removeClass("active");
    $modal.removeClass("visible").attr("inert", "");
    if (rewardPreviousFocus && rewardPreviousFocus.isConnected) {
      rewardPreviousFocus.focus();
    }
  }

  $(document).on("click", ".reward-trigger, #reward-btn", function () {
    var $modal = $("#reward");
    if (!$modal.length) return;

    rewardPreviousFocus = document.activeElement;
    $("#mask").addClass("active");
    $modal.removeAttr("inert").addClass("visible");
    $modal.find(".reward-close").trigger("focus");
  });

  $(document).on("click", "#reward .reward-close, #mask", closeReward);

  $(document).on("click", ".reward-tab", function () {
    var $this = $(this);
    var idx = $this.data("index");

    $("#reward .reward-tab").removeClass("active").attr("aria-pressed", "false");
    $this.addClass("active").attr("aria-pressed", "true");

    $("#reward .reward-panel").removeClass("active").attr("inert", "");
    $('#reward .reward-panel[data-index="' + idx + '"]').removeAttr("inert").addClass("active");
  });

  $(document).on("click", ".reward-sub-tab", function () {
    var $this = $(this);
    var parent = $this.data("parent");
    var sub = $this.data("sub");
    var $panel = $('#reward .reward-panel[data-index="' + parent + '"]');

    $panel.find(".reward-sub-tab").removeClass("active").attr("aria-pressed", "false");
    $this.addClass("active").attr("aria-pressed", "true");

    $panel.find(".reward-sub-panel").removeClass("active").attr("inert", "");
    $panel.find('.reward-sub-panel[data-sub="' + sub + '"]').removeAttr("inert").addClass("active");
  });

  $(document).on("keydown", function (e) {
    var $modal = $("#reward");
    if (!$modal.hasClass("visible")) return;
    if (e.key === "Escape") {
      closeReward();
    } else if (e.key === "Tab") {
      var controls = $modal.find("button, a[href]").filter(function () {
        return !this.closest("[inert]") && !this.disabled;
      }).get();
      var first = controls[0];
      var last = controls[controls.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  // DarkMode
  // 默认为暗色模式，只有明确设置为亮色时才切换
  function setGiscusTheme(theme) {
    var iframe = document.querySelector("iframe.giscus-frame");
    if (iframe) {
      iframe.contentWindow.postMessage(
        { giscus: { setConfig: { theme: theme } } },
        "https://giscus.app"
      );
    }
  }

  if (localStorage.getItem("darkmode") == 0) {
    $("body").removeClass("darkmode");
    $("#todark i").removeClass("ri-sun-line").addClass("ri-moon-line");
    setGiscusTheme("light");
  } else {
    // 默认已经是 darkmode class，无需添加，只更新图标
    $("#todark i").removeClass("ri-moon-line").addClass("ri-sun-line");
    setGiscusTheme("dark");
  }
  $("#todark").on("click", () => {
    if (localStorage.getItem("darkmode") == 0) {
      $("body").addClass("darkmode");
      $("#todark i").removeClass("ri-moon-line").addClass("ri-sun-line");
      localStorage.setItem("darkmode", 1);
      setGiscusTheme("dark");
    } else {
      $("body").removeClass("darkmode");
      $("#todark i").removeClass("ri-sun-line").addClass("ri-moon-line");
      localStorage.setItem("darkmode", 0);
      setGiscusTheme("light");
    }
  });

  // ShowThemeInConsole
  const ayeriaInfo = "主题不错？⭐star 支持一下 ->";
  const ayeriaURL = "https://github.com/KaleidScoper/hexo-theme-ayeria";
  const ayeriaNameStr =
    "\n\n     _ __   _______ _____    \n    / \\ \\ \\ / / ____|  _  \\  \n   / _ \\ \\ V /|  _| | |_) |  \n  / ___ \\ | | | |___|  _ <   \n /_/   \\_\\ _| |_____|_| \\__\\ \n";
  const ayeriaInfoStyle =
    "background-color: #49b1f5; color: #fff; padding: 8px; font-size: 14px;";
  const ayeriaURLStyle =
    "background-color: #ffbca2; padding: 8px; font-size: 14px;";
  const ayeriaNameStyle = "background-color: #eaf8ff;";

  console.log(
    "%c%s%c%s%c%s",
    ayeriaInfoStyle,
    ayeriaInfo,
    ayeriaURLStyle,
    ayeriaURL,
    ayeriaNameStyle,
    ayeriaNameStr
  );
})(jQuery);

// Tracking
!(function (p) {
  "use strict";
  !(function (t) {
    var s = window,
      e = document,
      i = p,
      c = "".concat(
        "https:" === e.location.protocol ? "https://" : "http://",
        "sdk.51.la/js-sdk-pro.min.js"
      ),
      n = e.createElement("script"),
      r = e.getElementsByTagName("script")[0];
    (n.type = "text/javascript"),
      n.setAttribute("charset", "UTF-8"),
      (n.async = !0),
      (n.src = c),
      (n.id = "LA_COLLECT"),
      (i.d = n);
    var o = function () {
      s.LA.ids.push(i);
    };
    s.LA ? s.LA.ids && o() : ((s.LA = p), (s.LA.ids = []), o()),
      r.parentNode.insertBefore(n, r);
  })();
})({ id: "JGjrOr2rebvP6q2a", ck: "JGjrOr2rebvP6q2a" });
