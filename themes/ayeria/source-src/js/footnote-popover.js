/**
 * 脚注悬浮预览（功能层）
 *
 * 悬停正文引用号时，在光标正下方浮出该条注释的正文，供快速阅读，避免为了
 * 一句补充说明而整页跳走。三条取舍：
 *
 *   1. 浮层内不放回链。读者想看的那句话此刻就在视野中央，回链只会把页面
 *      弹回别处，反而破坏阅读位置。
 *   2. 浮层以光标为锚点、随光标移动，而不是钉在引用号旁边。钉死的浮层像
 *      贴在屏幕上的膏药；跟着光标走，读者才不会觉得它挡住了什么。
 *      代价是浮层不能交互（pointer-events: none），本来也不需要交互。
 *   3. 底部保留一行提示：单击编号可以跳到文末注释。跳转仍是引用号本身的
 *      行为，浮层只负责说明。
 *
 * 触屏与不支持悬停的设备直接跳过：它们没有 hover，点击跳转本来就是正解。
 */
(function () {
  'use strict';

  var REF_SELECTOR = '.article-entry sup.footnote-ref > a';
  var HIDE_DELAY = 80;
  var GAP_Y = 14;         // 光标下方的距离
  var EDGE = 12;          // 视口安全边距

  function supportsHover() {
    return !!(window.matchMedia &&
      window.matchMedia('(hover: hover) and (pointer: fine)').matches);
  }

  function init() {
    if (!supportsHover()) return;

    var anchors = document.querySelectorAll(REF_SELECTOR);
    if (!anchors.length) return;

    var pop = document.createElement('div');
    pop.className = 'footnote-popover';
    pop.setAttribute('role', 'tooltip');
    pop.setAttribute('aria-hidden', 'true');
    document.body.appendChild(pop);

    var anchor = null;
    var hideTimer = 0;
    var frame = 0;
    var x = 0;
    var y = 0;

    function place() {
      frame = 0;
      var w = pop.offsetWidth;
      var h = pop.offsetHeight;
      if (!w || !h) return;

      var left = Math.round(x - w / 2);
      left = Math.min(Math.max(EDGE, left), window.innerWidth - w - EDGE);

      var top = y + GAP_Y;
      if (top + h > window.innerHeight - EDGE) {
        if (y - h - GAP_Y - 6 >= EDGE) {
          top = y - h - GAP_Y - 6;
        } else {
          top = Math.max(EDGE, window.innerHeight - h - EDGE);
        }
      }

      pop.style.left = left + 'px';
      pop.style.top = Math.round(top) + 'px';
    }

    function schedule() {
      if (!frame) frame = window.requestAnimationFrame(place);
    }

    function fill(a) {
      var li = document.getElementById(a.getAttribute('href').slice(1));
      if (!li) return false;

      var body = li.cloneNode(true);
      var backrefs = body.querySelectorAll('.footnote-backref');
      for (var i = 0; i < backrefs.length; i++) {
        backrefs[i].parentNode.removeChild(backrefs[i]);
      }
      var p = body.querySelector('p');

      pop.innerHTML =
        '<div class="footnote-popover-body">' +
          (p ? p.innerHTML : body.innerHTML) +
        '</div>';
      return true;
    }

    function open(a, cx, cy) {
      if (!fill(a)) return;
      anchor = a;
      x = cx;
      y = cy;
      pop.classList.add('visible');
      pop.setAttribute('aria-hidden', 'false');
      place();
    }

    function close() {
      window.clearTimeout(hideTimer);
      hideTimer = 0;
      anchor = null;
      pop.classList.remove('visible');
      pop.setAttribute('aria-hidden', 'true');
    }

    function isOpen() {
      return pop.classList.contains('visible');
    }

    for (var i = 0; i < anchors.length; i++) {
      (function (a) {
        // 悬停即出，不做进入防抖：划过就预览，比"停住才出"更跟手。
        // 只保留移开时的短延迟，避免手抖导致闪烁。
        a.addEventListener('mouseenter', function (e) {
          window.clearTimeout(hideTimer);
          open(a, e.clientX, e.clientY);
        });

        a.addEventListener('mouseleave', function () {
          window.clearTimeout(hideTimer);
          hideTimer = window.setTimeout(close, HIDE_DELAY);
        });

        // 点击照旧跳转，浮层立刻收起
        a.addEventListener('click', close);

        // 不挂 focus/blur：片段导航（点文末的回链）会把焦点落到引用号上，
        // 窗口重新获得焦点时浏览器会再触发一次 focus，而这条路径没有任何
        // 鼠标离开事件可以关闭它 —— 结果是切屏回来后卡片常驻并跟着鼠标跑。
        // 悬浮预览是给视觉阅读用的补充，键盘用户的正文入口是链接本身。
      })(anchors[i]);
    }

    // 跟随光标：始终记录坐标，仅在浮层可见时重排（rAF 合帧）
    document.addEventListener('mousemove', function (e) {
      x = e.clientX;
      y = e.clientY;
      if (isOpen()) schedule();
    }, { passive: true });

    // 页面一滚就收起，避免浮层与实际引用的文字脱节。
    // 不无脑关：只在引用号已经离开光标附近时才收，这样图片 lazyload 造成的
    // 小幅回流不会把浮层闪掉。
    document.addEventListener('scroll', function () {
      if (!isOpen() || !anchor) return;
      var r = anchor.getBoundingClientRect();
      var pad = 24;
      if (x < r.left - pad || x > r.right + pad || y < r.top - pad || y > r.bottom + pad) {
        close();
      }
    }, true);
    document.addEventListener('wheel', close, { passive: true });
    document.addEventListener('touchmove', close, { passive: true });
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' || e.keyCode === 27) close();
    });
    window.addEventListener('resize', function () {
      if (isOpen() && anchor) place();
    });

    // 切走标签页 / 窗口失焦时一律收起，回来不会留一张无主的卡片
    window.addEventListener('blur', close);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) close();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
