# 关于页面（/about）视觉与信息展示改进方案

> **起草日期**: 2026-04-03
> **适用范围**: `source/about/index.md` + `source/about/glass-card.css`
> **主题**: ayer（EJS 模板引擎）
> **约束**: 纯前端实现（HTML + CSS + 少量 vanilla JS），不引入额外构建工具或 npm 包

---

## 〇、现状分析

### 当前结构

| 区域 | 内容 | 实现方式 |
|------|------|----------|
| 玻璃卡片 | 头像 + 昵称 + 学校/MBTI + 一段自我介绍 | HTML + `glass-card.css`（毛玻璃 + 背景图 + hover 上浮） |
| 正文区 | 建站历史（一句话）+ 隐私政策（纯列表） | Markdown 原生排版 |

### 现存问题

1. **信息密度低** — 除了姓名和一段话，没有技能栈、社交链接、里程碑等结构化信息，访客无法快速建立对博主的全面认知。
2. **视觉层次单一** — 页面只有"一张卡片 + 一段正文"两个层级，缺少节奏变化，阅读体验平淡。
3. **交互反馈有限** — 仅有卡片 hover 上浮和头像扫光两种微动效，页面整体"静止感"较强。
4. **隐私政策占比过大** — 隐私政策以原始 Markdown 列表呈现，占据大量视觉面积，喧宾夺主。
5. **移动端体验可优化** — 当前仅有基础的 flex 方向切换，缺乏针对移动端的精细化排版。

---

## 一、页面整体架构重构

### 1.1 建议分区（自上而下）

```
┌─────────────────────────────────────────────┐
│  ① Profile Hero — 玻璃个人卡片（已有，增强） │
├─────────────────────────────────────────────┤
│  ② Social Links — 社交媒体图标行           │
├─────────────────────────────────────────────┤
│  ③ Tech Stack — 技能/工具标签云            │
├─────────────────────────────────────────────┤
│  ④ Timeline — 个人里程碑时间线             │
├─────────────────────────────────────────────┤
│  ⑤ GitHub Contrib — GitHub 贡献热力图      │
├─────────────────────────────────────────────┤
│  ⑥ Interests — 兴趣 Bento Grid            │
├─────────────────────────────────────────────┤
│  ⑦ Site Info — 建站说明（精简）            │
├─────────────────────────────────────────────┤
│  ⑧ Privacy — 折叠式隐私政策               │
└─────────────────────────────────────────────┘
```

### 1.2 设计原则

- **渐进增强**：所有区块在纯 CSS 下可正常展示，JS 仅用于锦上添花的动效。
- **暗色适配**：延续现有 `body.darkmode` 的 CSS 变量体系，所有新增区块必须双模式适配。
- **性能优先**：不引入外部 CSS 框架，图标使用已有的 Remix Icon 字体或内联 SVG。
- **单文件可维护**：所有样式写入 `glass-card.css`（可重命名为 `about.css`），避免散落。

---

## 二、各区块详细方案

### ② 社交媒体图标行

**目的**：让访客一键到达你的各平台主页。

**设计**：水平居中排列的圆形图标按钮，hover 时上浮并变色。

```html
<div class="social-links">
  <a href="https://github.com/KaleidScoper" target="_blank" title="GitHub" class="social-icon">
    <i class="ri-github-fill"></i>
  </a>
  <a href="mailto:your@email.com" title="Email" class="social-icon">
    <i class="ri-mail-fill"></i>
  </a>
  <!-- 按需添加：ri-twitter-x-fill / ri-bilibili-fill / ri-telegram-fill 等 -->
</div>
```

```css
.social-links {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin: 30px 0;
}

.social-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #ccc;
  font-size: 20px;
  text-decoration: none;
  transition: all 0.3s ease;
}

.social-icon:hover {
  transform: translateY(-3px);
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

body.darkmode .social-icon {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.1);
}
```

**参考来源**：常见于 [linktree 风格](https://linktr.ee) 个人主页，以及 [Profile Card 2025](https://dev.to/codlico/profile-card-2025-simple-responsive-profile-cards-built-with-html-and-css-41a5) 的社交链接区块。

---

### ③ 技能/工具标签云

**目的**：以直观的标签形式展示技术栈，替代枯燥的纯文字列表。

**方案 A — 扁平标签（推荐，轻量）**

```html
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
    <!-- 按实际情况增减 -->
  </div>
</div>
```

```css
.tech-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.tech-tag {
  display: inline-block;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  background: color-mix(in srgb, var(--tag-color) 15%, transparent);
  color: var(--tag-color);
  border: 1px solid color-mix(in srgb, var(--tag-color) 30%, transparent);
  transition: all 0.3s ease;
  cursor: default;
}

.tech-tag:hover {
  background: color-mix(in srgb, var(--tag-color) 25%, transparent);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px color-mix(in srgb, var(--tag-color) 20%, transparent);
}
```

> `color-mix()` 是现代 CSS 函数（2023+ 全主流浏览器支持），可根据 `--tag-color` 自动生成协调的背景和边框色。

**方案 B — 进度条（可选，信息量更大但主观性强）**

用 CSS 动画驱动的水平进度条展示熟练度，但"熟练度百分比"本身是主观判断，适用于偏求职的场景。个人博客建议使用方案 A。

---

### ④ 个人里程碑时间线

**目的**：展示关键人生/技术节点，帮助访客了解你的背景脉络。

**设计**：纯 CSS 实现的垂直时间线，左侧时间轴 + 右侧内容卡片。

```html
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
    <!-- 继续添加 -->
  </div>
</div>
```

```css
.timeline {
  position: relative;
  padding-left: 30px;
  margin: 20px 0;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 8px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(to bottom, transparent, rgba(120, 120, 120, 0.3), transparent);
}

.timeline-item {
  position: relative;
  margin-bottom: 28px;
  padding-left: 24px;
}

.timeline-item::before {
  content: '';
  position: absolute;
  left: -26px;
  top: 6px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #6c8ebf;
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 0 0 4px rgba(108, 142, 191, 0.15);
  transition: all 0.3s ease;
}

.timeline-item:hover::before {
  transform: scale(1.3);
  box-shadow: 0 0 0 6px rgba(108, 142, 191, 0.25);
}

.timeline-date {
  font-size: 13px;
  color: #999;
  font-family: "Consolas", "Monaco", monospace;
  margin-bottom: 4px;
}

.timeline-content h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
}

.timeline-content p {
  margin: 0;
  font-size: 14px;
  color: #888;
  line-height: 1.6;
}
```

**参考来源**：[纯 CSS 时间轴列表](https://blog.csdn.net/weixin_36043375/article/details/119373646) — 使用伪元素 padding 拼接法实现无断裂竖线。

---

### ⑤ GitHub 贡献热力图

**目的**：以可视化方式展示编码活跃度，增强技术可信度。

**方案（零依赖）**：使用 [ghchart.rshah.org](https://ghchart.rshah.org/) 提供的 SVG API，一行 `<img>` 搞定。

```html
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
```

```css
.github-chart {
  text-align: center;
  margin: 20px 0;
  overflow-x: auto;
}

.github-contrib-img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  transition: transform 0.3s ease;
}

.github-contrib-img:hover {
  transform: scale(1.02);
}

body.darkmode .github-contrib-img {
  filter: invert(1) hue-rotate(180deg) brightness(1.1);
}
```

> 暗色模式下通过 `filter: invert() hue-rotate()` 对 SVG 图像进行色彩反转，无需额外 API 参数。

**参考来源**：[如何给网站装上 Github 贡献图表 | lijianfei.com](https://lijianfei.com/post/ru-he-gei-wang-zhan-zhuang-shang-xuan-ku-de-github-gong-xian-tu-biao-github-contributions-chart/)

---

### ⑥ 兴趣 Bento Grid

**目的**：用现代 Bento 网格布局展示个人兴趣爱好，替代被注释掉的"查成分"标签列表。

**设计**：不规则网格卡片，每张卡片包含图标 + 标签，hover 时微微放大并显示描述。

```html
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
    <!-- 按需增减 -->
  </div>
</div>
```

```css
.bento-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  margin: 20px 0;
}

.bento-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 14px;
  color: inherit;
  transition: all 0.3s ease;
  cursor: default;
}

.bento-item i {
  font-size: 24px;
  opacity: 0.8;
}

.bento-item:hover {
  transform: translateY(-3px) scale(1.02);
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.bento-wide {
  grid-column: span 2;
}

body.darkmode .bento-item {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.08);
}

body.darkmode .bento-item:hover {
  background: rgba(255, 255, 255, 0.08);
}
```

**参考来源**：[Braydon Coyer 的 Blogfolio v5](https://www.braydoncoyer.dev/blog/introducing-blogfolio-v5) 采用 Bento-box 设计模式，以网格容器系统组合展示个人信息。

---

### ⑦ 建站说明（精简）

**目的**：保留建站信息但缩减篇幅，让其不再是页面主体。

```html
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
```

```css
.site-info-card {
  padding: 16px 20px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 14px;
  line-height: 1.8;
  color: inherit;
}

.site-info-card a {
  color: #6c8ebf;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.site-info-card a:hover {
  color: #8ab4f0;
}
```

---

### ⑧ 折叠式隐私政策

**目的**：隐私政策信息保持完整，但默认折叠，不影响页面主视觉。

**实现**：使用原生 HTML `<details>/<summary>` 元素（零 JS，语义化，无障碍友好）。

```html
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
```

```css
.privacy-details {
  margin: 30px 0;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;
}

.privacy-summary {
  padding: 14px 20px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
  gap: 8px;
  list-style: none;    /* 移除默认三角 */
  transition: background 0.2s ease;
}

.privacy-summary::-webkit-details-marker {
  display: none;         /* Chrome/Safari 移除默认标记 */
}

.privacy-summary::after {
  content: '▸';
  margin-left: auto;
  transition: transform 0.3s ease;
}

.privacy-details[open] .privacy-summary::after {
  transform: rotate(90deg);
}

.privacy-summary:hover {
  background: rgba(255, 255, 255, 0.06);
}

.privacy-content {
  padding: 0 20px 16px;
  font-size: 14px;
  line-height: 1.8;
  color: #999;
}

.privacy-content ul {
  margin: 0;
  padding-left: 20px;
}

.privacy-content li {
  margin-bottom: 8px;
}
```

---

## 三、全局增强

### 3.1 区块标题统一样式

每个区块使用统一的 `section-title` 样式，建立视觉节奏。

```css
.about-section {
  margin: 40px 0;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  color: inherit;
}

.section-title i {
  font-size: 20px;
  opacity: 0.7;
}

.section-title::after {
  content: '';
  flex: 1;
  height: 1px;
  background: linear-gradient(to right, rgba(128, 128, 128, 0.3), transparent);
  margin-left: 12px;
}
```

### 3.2 滚动入场动画（可选，需少量 JS）

使用 `IntersectionObserver` 让区块在滚入视口时渐显上浮，增添页面层次感。

```css
.about-section {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.about-section.visible {
  opacity: 1;
  transform: translateY(0);
}
```

```javascript
// 放在 index.md 底部的 <script> 中
document.addEventListener('DOMContentLoaded', () => {
  const observer = new IntersectionObserver(
    (entries) => entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    }),
    { threshold: 0.15 }
  );
  document.querySelectorAll('.about-section').forEach(el => observer.observe(el));
});
```

### 3.3 CSS 扫光特效（来自 AnZhiYu 主题方案）

为所有卡片类元素添加 hover 扫光效果，提升质感。

```css
.bento-item::before,
.site-info-card::before,
.timeline-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to right,
    transparent,
    rgba(255, 255, 255, 0.15),
    transparent
  );
  transform: translate3d(-150%, 0, 0) skewX(-25deg);
  transition: transform 0.5s;
  pointer-events: none;
}

.bento-item:hover::before,
.site-info-card:hover::before,
.timeline-content:hover::before {
  transform: translate3d(150%, 0, 0) skewX(-25deg);
}
```

**参考来源**：[为关于页(About)注入更多交互灵魂 | agsd.top](https://agsd.top/2026/02/11/AnZhiYu-About-Page-Interaction-Optimization/) — 使用 `translate3d` + `skewX` 实现金属光泽扫光动画。

---

## 四、Profile Hero 卡片增强（在现有基础上优化）

现有的玻璃卡片已经很好，建议在此基础上进行以下微调：

### 4.1 添加简短的 tagline

在 `profile-desc` 下方添加一行带有打字机效果的格言或座右铭。

```html
<p class="profile-tagline" id="tagline"></p>
```

```css
.profile-tagline {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 12px;
  font-style: italic;
  min-height: 1.4em;
}
```

```javascript
// 简单打字机效果
const taglines = [
  '千仞高塔，筑基于此',
  'When you share, everyone wins.',
  '安全研究 | CTF | Web 开发'
];
(function typeWriter() {
  const el = document.getElementById('tagline');
  if (!el) return;
  let idx = 0;
  function type(text, i) {
    if (i <= text.length) {
      el.textContent = text.slice(0, i);
      setTimeout(() => type(text, i + 1), 60);
    } else {
      setTimeout(() => erase(text, text.length), 2000);
    }
  }
  function erase(text, i) {
    if (i >= 0) {
      el.textContent = text.slice(0, i);
      setTimeout(() => erase(text, i - 1), 30);
    } else {
      idx = (idx + 1) % taglines.length;
      setTimeout(() => type(taglines[idx], 0), 500);
    }
  }
  type(taglines[0], 0);
})();
```

### 4.2 状态指示器（可选）

在头像右下角添加一个小绿点，表示"活跃中"，增添活力感。

```css
.avatar-link::after {
  content: '';
  position: absolute;
  bottom: 6px;
  right: 6px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #22c55e;
  border: 2px solid rgba(255, 255, 255, 0.8);
  z-index: 3;
  animation: pulse-dot 2s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
  50% { box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
}
```

---

## 五、实施优先级建议

| 优先级 | 区块 | 工作量 | 价值 |
|--------|------|--------|------|
| P0 | ② 社交链接 | 低 | 高 — 所有关于页面的标配 |
| P0 | ⑧ 隐私政策折叠 | 低 | 高 — 立刻改善页面观感 |
| P1 | ③ 技术标签云 | 低 | 高 — 快速传达技术画像 |
| P1 | ⑦ 建站说明精简 | 低 | 中 — 减少信息噪音 |
| P1 | 3.1 统一区块标题 | 低 | 中 — 建立视觉节奏 |
| P2 | ④ 时间线 | 中 | 中 — 内容量够才有意义 |
| P2 | ⑥ 兴趣 Bento Grid | 中 | 中 — 让页面更有个性 |
| P2 | 4.1 Tagline 打字机 | 低 | 低 — 锦上添花 |
| P3 | ⑤ GitHub 贡献图 | 低 | 低 — 依赖外部 API |
| P3 | 3.2 滚动入场动画 | 低 | 低 — 锦上添花 |
| P3 | 3.3 扫光特效 | 低 | 低 — 纯视觉装饰 |
| P3 | 4.2 状态指示器 | 低 | 低 — 纯视觉装饰 |

---

## 六、文件变更清单

| 文件 | 操作 |
|------|------|
| `source/about/index.md` | 重写 HTML 结构，添加各区块 |
| `source/about/glass-card.css` → `source/about/about.css` | 重命名并追加所有新样式 |
| `source/images/` | 如需兴趣卡片背景图，可按需添加 |

> 无需修改主题模板文件（`themes/ayer/layout/`），所有改动局限于 `source/about/` 目录，升级主题时零冲突。

---

## 七、参考资料汇总

| 参考 | 来源 | 要点 |
|------|------|------|
| Profile Card 2025 | [dev.to](https://dev.to/codlico/profile-card-2025-simple-responsive-profile-cards-built-with-html-and-css-41a5) | 圆形头像、社交图标、hover 上浮的现代卡片结构 |
| AnZhiYu 关于页交互优化 | [agsd.top](https://agsd.top/2026/02/11/AnZhiYu-About-Page-Interaction-Optimization/) | CSS 扫光特效、背景聚焦动画、点击跳转功能 |
| Blogfolio v5 Bento 设计 | [braydoncoyer.dev](https://www.braydoncoyer.dev/blog/introducing-blogfolio-v5) | Bento-box 网格布局、亮色优先主题切换 |
| GitHub 贡献图表 | [lijianfei.com](https://lijianfei.com/post/ru-he-gei-wang-zhan-zhuang-shang-xuan-ku-de-github-gong-xian-tu-biao-github-contributions-chart/) | ghchart API 一行嵌入热力图 |
| 纯 CSS 时间轴 | [CSDN](https://blog.csdn.net/weixin_36043375/article/details/119373646) | 伪元素 padding 拼接法无断裂竖线 |
| Developer Portfolio 趋势 | [dev.to (Suyog)](https://dev.to/suyog_bhise_ec4aa1daa62ed/how-i-built-my-developer-portfolio-with-nextjs-gsap-and-a-100-seo-score-2c64) | 等宽字体 + 无衬线组合、scroll 动画、GitHub 集成 |
