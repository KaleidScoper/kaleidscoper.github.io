---
title: 关于（测试版）
date: 2025-03-19 12:00:00
layout: page
---

<link rel="stylesheet" href="/about-test/about.css">

<!-- ① Profile Hero — 玻璃个人卡片（增强版） -->
<div class="glass-card" style="--bg-image: url('/images/about-background.jpg')">
  <a href="/" class="avatar-link">
    <img src="/images/kaleidscoper.jpg" alt="Kaleid Scoper 的头像" class="profile-avatar">
  </a>
  <div class="profile-info">
    <h2 class="profile-name">Kaleid Scoper</h2>
    <p class="profile-title">安徽大学 | INTP</p>
    <p class="profile-desc">
      欢迎来到我的博客！我是Kale，一名信息安全专业的本科生。此博客将作为我的电子日记本，用于堆放我本人写的一些没用的内容。祝你度过美好的一天。
    </p>
    <p class="profile-tagline" id="tagline"></p>
  </div>
</div>

<!-- ② Social Links — 社交媒体图标行 -->
<div class="social-links">
  <a href="https://github.com/KaleidScoper" target="_blank" title="GitHub" class="social-icon">
    <i class="ri-github-fill"></i>
  </a>
  <a href="mailto:your@email.com" title="Email" class="social-icon">
    <i class="ri-mail-fill"></i>
  </a>
</div>

<!-- ③ Tech Stack — 技能/工具标签云 -->
<div class="about-section">
  <h3 class="section-title">
    <i class="ri-code-s-slash-line"></i> 技术栈
  </h3>
  <div class="tech-tags">
    <span class="tech-tag" style="--tag-color: #3178c6">TypeScript</span>
    <span class="tech-tag" style="--tag-color: #f7df1e">JavaScript</span>
    <span class="tech-tag" style="--tag-color: #3776ab">Python</span>
    <span class="tech-tag" style="--tag-color: #e34f26">HTML/CSS</span>
    <span class="tech-tag" style="--tag-color: #4fc08d">Vue.js</span>
    <span class="tech-tag" style="--tag-color: #0769ad">Linux</span>
    <span class="tech-tag" style="--tag-color: #f05032">Git</span>
  </div>
</div>

<!-- ④ Timeline — 个人里程碑时间线 -->
<div class="about-section">
  <h3 class="section-title">
    <i class="ri-route-line"></i> 里程碑
  </h3>
  <div class="timeline">
    <div class="timeline-item">
      <div class="timeline-date">2025.09</div>
      <div class="timeline-content">
        <h4>入学安徽大学</h4>
        <p>信息安全专业</p>
      </div>
    </div>
    <div class="timeline-item">
      <div class="timeline-date">2025.03</div>
      <div class="timeline-content">
        <h4>博客迁移至 Hexo</h4>
        <p>从 WordPress + VPS 迁移至 Hexo + GitHub Pages</p>
      </div>
    </div>
  </div>
</div>

<!-- ⑤ GitHub Contrib — GitHub 贡献热力图 -->
<div class="about-section">
  <h3 class="section-title">
    <i class="ri-github-fill"></i> GitHub 活跃度
  </h3>
  <div class="github-chart">
    <a href="https://github.com/KaleidScoper" target="_blank">
      <img src="https://ghchart.rshah.org/KaleidScoper"
           alt="GitHub Contributions"
           class="github-contrib-img">
    </a>
  </div>
</div>

<!-- ⑥ Interests — 兴趣 Bento Grid -->
<div class="about-section">
  <h3 class="section-title">
    <i class="ri-gamepad-line"></i> 兴趣爱好
  </h3>
  <div class="bento-grid">
    <div class="bento-item bento-wide">
      <i class="ri-sword-line"></i>
      <span>欧陆风云</span>
    </div>
    <div class="bento-item">
      <i class="ri-film-line"></i>
      <span>电锯人</span>
    </div>
    <div class="bento-item">
      <i class="ri-earth-line"></i>
      <span>波兰球</span>
    </div>
    <div class="bento-item bento-wide">
      <i class="ri-crosshair-2-line"></i>
      <span>冷媒 Airsoft</span>
    </div>
    <div class="bento-item">
      <i class="ri-box-3-line"></i>
      <span>乐高</span>
    </div>
    <div class="bento-item">
      <i class="ri-ancient-gate-line"></i>
      <span>汉服</span>
    </div>
  </div>
</div>

<!-- ⑦ Site Info — 建站说明（精简） -->
<div class="about-section">
  <h3 class="section-title">
    <i class="ri-global-line"></i> 关于本站
  </h3>
  <div class="site-info-card">
    <p>
      本站采用 <strong>Hexo + GitHub Pages</strong> 搭建（前身为 WordPress + VPS），
      源代码托管于 <a href="https://github.com/KaleidScoper/kaleidscoper.github.io">GitHub</a>。
      本站无任何评论审核、封禁、禁言规则。
    </p>
  </div>
</div>

<!-- ⑧ Privacy — 折叠式隐私政策 -->
<details class="privacy-details">
  <summary class="privacy-summary">
    <i class="ri-shield-check-line"></i> 隐私政策
  </summary>
  <div class="privacy-content">
    <ul>
      <li>当您留下评论时，我可能会收集评论表单数据、您的 IP 地址、浏览器 UA 等信息。</li>
      <li>当您上传包含 EXIF 地理位置信息的图片，访客可下载并提取位置信息。</li>
      <li>除非您或公安机关要求，您留下的任何信息将被无限期保存。</li>
      <li>站点文章可能包含嵌入内容（视频、图片等），来自其他站点的行为与直接访问无异。</li>
      <li><em>When you share, everyone wins.</em></li>
    </ul>
  </div>
</details>

<!-- JS: 打字机 + 滚动入场 -->
<script>
(function () {
  /* 4.1 Tagline 打字机效果 */
  var taglines = [
    '千仞高塔，筑基于此',
    'When you share, everyone wins.',
    '安全研究 | CTF | Web 开发'
  ];
  var el = document.getElementById('tagline');
  if (el) {
    var idx = 0;
    function type(text, i) {
      if (i <= text.length) {
        el.textContent = text.slice(0, i);
        setTimeout(function () { type(text, i + 1); }, 60);
      } else {
        setTimeout(function () { erase(text, text.length); }, 2000);
      }
    }
    function erase(text, i) {
      if (i >= 0) {
        el.textContent = text.slice(0, i);
        setTimeout(function () { erase(text, i - 1); }, 30);
      } else {
        idx = (idx + 1) % taglines.length;
        setTimeout(function () { type(taglines[idx], 0); }, 500);
      }
    }
    type(taglines[0], 0);
  }

  /* 3.2 滚动入场动画 */
  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          observer.unobserve(e.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  document.querySelectorAll('.about-section').forEach(function (el) {
    observer.observe(el);
  });
})();
</script>
