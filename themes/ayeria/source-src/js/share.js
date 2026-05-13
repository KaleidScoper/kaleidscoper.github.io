
function generate(url, opts) {
  var url = url.replace(/<%-sUrl%>/g, encodeURIComponent(opts.sUrl))
    .replace(/<%-sTitle%>/g, encodeURIComponent(opts.sTitle))
    .replace(/<%-sDesc%>/g, encodeURIComponent(opts.sDesc))
    .replace(/<%-sPic%>/g, encodeURIComponent(opts.sPic));
  window.open(url);
}

function openDropdown() {
  var wrap = document.querySelector('.share-wrap');
  if (wrap) wrap.classList.add('open');
}

function closeDropdown() {
  var wrap = document.querySelector('.share-wrap');
  if (wrap) wrap.classList.remove('open');
}

function toggleDropdown() {
  var wrap = document.querySelector('.share-wrap');
  if (!wrap) return;
  wrap.classList.contains('open') ? closeDropdown() : openDropdown();
}

function showWX() {
  var img = document.querySelector('.wx-qrcode-img');
  if (img && img.dataset.url && !img.dataset.loaded) {
    img.src = img.dataset.url;
    img.dataset.loaded = '1';
  }
  var modal = document.querySelector('.wx-share-modal');
  var mask = document.querySelector('#share-mask');
  if (modal) modal.classList.add('visible');
  if (mask) mask.classList.add('active');
}

function hideWX() {
  var modal = document.querySelector('.wx-share-modal');
  var mask = document.querySelector('#share-mask');
  if (modal) modal.classList.remove('visible');
  if (mask) mask.classList.remove('active');
}

function handleClick(type, opts) {
  if (type === 'weibo') {
    generate('http://service.weibo.com/share/share.php?url=<%-sUrl%>&title=<%-sTitle%>&pic=<%-sPic%>', opts);
  } else if (type === 'qq') {
    generate('http://connect.qq.com/widget/shareqq/index.html?url=<%-sUrl%>&title=<%-sTitle%>&source=<%-sDesc%>', opts);
  } else if (type === 'douban') {
    generate('https://www.douban.com/share/service?image=<%-sPic%>&href=<%-sUrl%>&name=<%-sTitle%>&text=<%-sDesc%>', opts);
  } else if (type === 'qzone') {
    generate('http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=<%-sUrl%>&title=<%-sTitle%>&pics=<%-sPic%>&summary=<%-sDesc%>', opts);
  } else if (type === 'facebook') {
    generate('https://www.facebook.com/sharer/sharer.php?u=<%-sUrl%>', opts);
  } else if (type === 'twitter') {
    generate('https://twitter.com/intent/tweet?text=<%-sTitle%>&url=<%-sUrl%>', opts);
  } else if (type === 'google') {
    generate('https://plus.google.com/share?url=<%-sUrl%>', opts);
  } else if (type === 'weixin') {
    showWX();
  }
}

const share_init = () => {
  var shareOuter = document.querySelector('.share-outer');
  if (!shareOuter) return;

  var sUrl = window.location.href;
  var sTitle = document.querySelector('title').innerHTML;
  var imgs = document.querySelectorAll('.article-entry img');
  var sPic = imgs.length ? imgs[0].getAttribute('src') : '';
  if (sPic !== '' && !/^(http:|https:)?\/\//.test(sPic)) {
    sPic = window.location.origin + sPic;
  }
  var opts = { sUrl: sUrl, sPic: sPic, sTitle: sTitle, sDesc: sTitle };

  // Toggle dropdown on trigger click
  shareOuter.addEventListener('click', toggleDropdown);

  // Light dismiss: close dropdown when clicking outside .share-btn
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.share-btn')) {
      closeDropdown();
    }
  });

  // Platform icon clicks — close dropdown then navigate / show modal
  document.querySelectorAll('.share-sns[data-type]').forEach(function(el) {
    el.addEventListener('click', function() {
      closeDropdown();
      handleClick(el.getAttribute('data-type'), opts);
    });
  });

  // WeChat modal: mask click and close button both dismiss
  var mask = document.querySelector('#share-mask');
  var closeBtn = document.querySelector('.wx-modal-close');
  if (mask) mask.addEventListener('click', hideWX);
  if (closeBtn) closeBtn.addEventListener('click', hideWX);
};

share_init();
