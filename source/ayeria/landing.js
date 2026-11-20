(function () {
  var root = document.documentElement;
  var live = document.getElementById('live');
  var nav = document.getElementById('nav');
  var toggle = document.getElementById('theme-toggle');

  /* 明暗：与主题共用 sessionStorage 键，同标签页内状态一致 */
  function syncToggle() {
    toggle.setAttribute('aria-pressed', String(root.getAttribute('data-theme') === 'dark'));
  }
  syncToggle();
  toggle.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { sessionStorage.setItem('darkmode', next === 'dark' ? '1' : '0'); } catch (e) {}
    syncToggle();
  });

  /* 导航：80px 后收成悬浮条 */
  var ticking = false;
  function applyNav() {
    nav.classList.toggle('is-scrolled', window.scrollY > 80);
    ticking = false;
  }
  function onScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(applyNav);
    }
  }
  applyNav();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* 复制 */
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy') ? resolve() : reject();
      } catch (e) {
        reject(e);
      }
      document.body.removeChild(ta);
    });
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-copy]'), function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy');
      copyText(text).then(function () {
        btn.classList.add('is-done');
        live.textContent = '已复制：' + text;
        window.setTimeout(function () {
          btn.classList.remove('is-done');
          live.textContent = '';
        }, 1600);
      }).catch(function () {
        live.textContent = '复制失败，请手动选择文本。';
      });
    });
  });

  /* 入场 */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: .06 });
    Array.prototype.forEach.call(document.querySelectorAll('[data-reveal]'), function (el) {
      io.observe(el);
    });
  } else {
    Array.prototype.forEach.call(document.querySelectorAll('[data-reveal]'), function (el) {
      el.classList.add('is-in');
    });
  }
})();
