# 打赏功能设计方案

> 文档创建于 2026-03-29，基于对当前站点（Hexo + hexo-theme-ayer 定制版 + GitHub Pages）的全面审计编写。

---

## 一、现状分析

### 1.1 主题内置的打赏功能

Ayer 主题已内置一套简易打赏机制，涉及以下文件：

| 文件 | 职责 |
|------|------|
| `_config.ayer.yml` (`reward_type`, `alipay`, `weixin`) | 配置开关与二维码路径 |
| `themes/ayer/layout/_partial/article.ejs` 第 45-52 行 | 文章末尾渲染「打赏」按钮 |
| `themes/ayer/layout/_partial/modal.ejs` 第 3-20 行 | 全局遮罩弹层，硬编码展示支付宝 + 微信 |
| `themes/ayer/source-src/css/_partial/reward.styl` | 弹层与按钮样式 |
| `themes/ayer/source-src/js/ayer.js` 第 144-152 行 | jQuery `fadeIn/fadeOut` 控制弹层 |

### 1.2 现有方案的局限

| 问题 | 详情 |
|------|------|
| **渠道硬编码** | 仅支持「支付宝」「微信」两个渠道，新增需同时改 EJS + 配置 |
| **无可扩展性** | 无法通过配置文件自由增删渠道，不支持自定义描述文字或主题色 |
| **暗色模式不完善** | `reward.styl` 中 `background-color: lighten(water,30%)`、`color: black` 等使用亮色硬编码，暗色模式下对比度差 |
| **视觉风格陈旧** | 简单的 `fadeIn` 遮罩 + 并排图片，与关于页的 glass-card 风格脱节 |
| **仅限文章页** | 按钮只出现在 `article.ejs` 内部，无法独立于文章页使用（如放在关于页） |
| **拼写错误** | `article.ejs` 中 `id="reword-out"`（应为 `reward-out`），与 `reward.styl` 中 `#reward-out` 不匹配 |

---

## 二、设计目标

1. **数据驱动**：所有打赏渠道通过 `_config.ayer.yml` 的 YAML 数组配置，无需改动模板代码即可增删渠道。
2. **视觉一致**：与关于页 glass-card 风格统一，采用毛玻璃 + CSS 自定义属性方案。
3. **明暗双模式**：通过 `body.darkmode` 选择器覆盖 CSS 变量，确保两种模式下均有良好对比度。
4. **可定制外观**：每个渠道可独立配置主题色（`color`），切换渠道时视觉随之变化。
5. **灵活展示位置**：保留原有 `reward_type` 控制文章页行为，同时支持在任意 Markdown 页面（如关于页）中以短代码/HTML 片段嵌入。
6. **移动端友好**：768px 以下自适应布局。
7. **零外部依赖**：纯 CSS + 原生 jQuery（站点已有），不引入新的 JS 库。

---

## 三、架构设计

### 3.1 配置结构（`_config.ayer.yml`）

用一个 `reward.channels` 数组替代原来的 `alipay` / `weixin` 字段：

```yaml
# 打赏系统
reward_type: 1          # 0-关闭 | 1-文章 front-matter 中 reward:true 才显示 | 2-所有文章
reward_wording: "如果这篇文章对你有帮助，欢迎请作者喝杯咖啡 ☕"

reward:
  channels:
    - name: "微信支付"
      icon: "ri-wechat-pay-line"      # RemixIcon 图标名
      color: "#07C160"                 # 主题色
      qrcode: "/images/reward/wechat-pay.png"
      description: "微信扫一扫"

    - name: "支付宝"
      icon: "ri-alipay-line"
      color: "#1677FF"
      qrcode: "/images/reward/alipay.png"
      description: "支付宝扫一扫"

    - name: "爱发电"
      icon: "ri-heart-line"
      color: "#946CE6"
      qrcode: "/images/reward/afdian.png"
      description: "前往爱发电赞助"
      link: "https://afdian.com/a/yourname"   # 可选：外链按钮

    # 要新增渠道，只需在此处追加即可
```

**字段说明**：

| 字段 | 必填 | 说明 |
|------|------|------|
| `name` | 是 | 渠道显示名称 |
| `icon` | 是 | [RemixIcon](https://remixicon.com/) 图标类名（站点已引入 RemixIcon） |
| `color` | 是 | 该渠道的品牌主题色，用于标签页高亮、二维码边框、描述文字等 |
| `qrcode` | 是 | 二维码图片路径 |
| `description` | 否 | 二维码下方的辅助文字 |
| `link` | 否 | 外部链接，有则显示「前往」按钮 |

### 3.2 文件变更清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `_config.ayer.yml` | **改** | 替换 `alipay` / `weixin` 为上述 `reward.channels` 数组 |
| `themes/ayer/layout/_partial/modal.ejs` | **改** | 用循环渲染渠道标签页 + 二维码面板 |
| `themes/ayer/layout/_partial/article.ejs` | **改** | 修复 `reword-out` 拼写；按钮逻辑不变 |
| `themes/ayer/source/css/custom.styl` | **改** | 新增打赏弹层的 CSS 变量与样式（亮色 + 暗色） |
| `themes/ayer/source-src/css/_partial/reward.styl` | **改** | 移除旧样式或保留基础结构并让 custom.styl 覆盖 |
| `themes/ayer/source-src/js/ayer.js` | **改** | 更新打赏弹层交互逻辑（标签页切换） |
| `source/images/reward/` | **新建** | 存放各渠道二维码图片 |

### 3.3 展示位置策略

#### 方案：文章内嵌 + 可选页面引用（推荐）

| 场景 | 实现方式 | 说明 |
|------|----------|------|
| **文章页** | 沿用 `reward_type` 机制 | 按钮在文章正文末尾、版权声明之前，点击弹出全局弹层 |
| **关于页等独立页面** | 在 Markdown 中手动插入 HTML 触发按钮 | 例如 `<button class="reward-trigger">打赏作者</button>`，复用同一个全局弹层 |

**理由**：

- 打赏按钮不应在每个页面都出现（分类页、标签页、友链页显示打赏不合理）。
- 文章页是用户阅读后最自然的打赏入口，保留 `reward_type` 足够灵活。
- 关于页是用户了解作者后打赏的第二入口，用简单 HTML 片段即可触发，无需改动 `page.ejs`。
- 如果未来需要在所有页面的固定位置（如页脚）展示，可在 `footer.ejs` 中追加，但**不推荐**——打赏入口过多会降低用户好感度。

### 3.4 图片资源存放

```
source/
└── images/
    └── reward/            ← 新建目录
        ├── wechat-pay.png
        ├── alipay.png
        ├── afdian.png
        └── ...
```

**理由**：

- `source/images/` 是站点已有的图片存放位置，Hexo 会将其原样复制到 `public/images/`。
- 使用 `reward/` 子目录避免与其他图片混在一起，便于管理。
- 不放在主题目录内（`themes/ayer/source/images/`），因为主题升级时可能被覆盖。

---

## 四、UI / UX 设计

### 4.1 整体风格

采用与关于页 glass-card 一致的**毛玻璃面板**风格：

- 半透明背景 + `backdrop-filter: blur`
- 圆角卡片，柔和投影
- 关闭按钮沿用主题现有的 `ri-close-line` 图标

### 4.2 弹层结构（自上而下）

```
┌─────────────────────────────────────────────┐
│  [×]                                        │  ← 关闭按钮（右上角）
│                                             │
│   ☕ 如果这篇文章对你有帮助，欢迎请作者喝杯咖啡   │  ← reward_wording
│                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │ 🟢 微信  │ │ 🔵 支付宝 │ │ 💜 爱发电 │    │  ← 渠道标签页（pill 样式）
│  └──────────┘ └──────────┘ └──────────┘    │
│                                             │
│         ┌─────────────────────┐             │
│         │                     │             │
│         │    ╔═══════════╗    │             │
│         │    ║  QR Code  ║    │             │  ← 二维码图片区
│         │    ╚═══════════╝    │             │
│         │                     │             │
│         │   微信扫一扫          │             │  ← description 文字
│         │                     │             │
│         └─────────────────────┘             │
│                                             │
│              [ 前往爱发电 → ]                 │  ← 仅 link 字段存在时显示
│                                             │
└─────────────────────────────────────────────┘
```

### 4.3 渠道切换的视觉效果

切换标签页时，以下元素随当前渠道的 `color` 值联动变化：

| 元素 | 效果 |
|------|------|
| **选中标签** | 背景色渐变为渠道 `color`，文字变白 |
| **二维码边框** | `border-color` 过渡到渠道 `color` |
| **描述文字** | 颜色变为渠道 `color`（暗色模式下适当提亮） |
| **外链按钮** | 背景色为渠道 `color` |
| **弹层顶部装饰线** | 一条 3px 高的渐变色带，颜色为当前渠道 `color` |

所有颜色过渡使用 `transition: all 0.3s ease`，保证切换平滑。

**技术实现**：通过 JavaScript 在切换标签时将渠道 `color` 写入弹层元素的 CSS 自定义属性 `--reward-accent`，所有依赖该变量的样式自动响应：

```javascript
$('.reward-tab').on('click', function() {
  const color = $(this).data('color');
  $('#reward').css('--reward-accent', color);
  // 切换 active 状态 & 显示对应面板
});
```

### 4.4 暗色 / 亮色模式适配

使用 CSS 自定义属性，通过 `body.darkmode` 选择器切换变量值：

```css
/* 亮色模式（默认变量值） */
:root {
  --reward-bg: rgba(255, 255, 255, 0.85);
  --reward-border: rgba(0, 0, 0, 0.08);
  --reward-shadow: rgba(31, 38, 135, 0.15);
  --reward-text: #333;
  --reward-subtext: #666;
  --reward-tab-bg: rgba(0, 0, 0, 0.04);
  --reward-tab-text: #555;
  --reward-overlay: rgba(0, 0, 0, 0.5);
  --reward-accent: #07C160;              /* 默认值，JS 会按渠道覆盖 */
}

/* 暗色模式 */
body.darkmode {
  --reward-bg: rgba(42, 47, 58, 0.92);
  --reward-border: rgba(255, 255, 255, 0.1);
  --reward-shadow: rgba(0, 0, 0, 0.5);
  --reward-text: #d0d0d0;
  --reward-subtext: #aaa;
  --reward-tab-bg: rgba(255, 255, 255, 0.06);
  --reward-tab-text: #bbb;
  --reward-overlay: rgba(0, 0, 0, 0.7);
}
```

这些变量直接复用站点暗色主题中已有的色值（`dark-background: #1c1f26`、`dark-surface: #2a2f3a`、`dark-text: #d0d0d0` 等），确保视觉融合。

### 4.5 响应式布局

| 屏幕宽度 | 布局调整 |
|----------|----------|
| `> 768px` | 弹层居中，固定宽度 420px，二维码 200×200 |
| `≤ 768px` | 弹层宽度 90vw，二维码缩小至 160×160，标签页文字缩小 |
| `≤ 480px` | 标签页改为可横向滚动的滑条（`overflow-x: auto`），避免换行 |

### 4.6 动画细节

| 动画 | 说明 |
|------|------|
| **弹层入场** | `opacity: 0 → 1` + `translateY(20px) → 0`，300ms ease-out |
| **弹层退场** | 反向，200ms ease-in |
| **遮罩层** | `opacity: 0 → 1`，150ms |
| **标签切换** | 选中标签背景色 transition 300ms |
| **二维码切换** | `opacity` 交叉淡入淡出，200ms |

---

## 五、具体实现

### 5.1 `modal.ejs` 改造

```ejs
<div id="mask"></div>

<!-- Reward Modal -->
<% if (theme.reward && theme.reward.channels && theme.reward.channels.length > 0) { %>
<div id="reward" class="reward-modal">
  <span class="reward-close"><i class="ri-close-line"></i></span>

  <p class="reward-wording">
    <i class="ri-cup-line"></i><%= theme.reward_wording %>
  </p>

  <!-- 渠道标签页 -->
  <div class="reward-tabs">
    <% theme.reward.channels.forEach(function(ch, i) { %>
    <button class="reward-tab<%= i === 0 ? ' active' : '' %>"
            data-index="<%= i %>"
            data-color="<%= ch.color %>">
      <i class="<%= ch.icon %>"></i>
      <span><%= ch.name %></span>
    </button>
    <% }); %>
  </div>

  <!-- 二维码面板 -->
  <div class="reward-panels">
    <% theme.reward.channels.forEach(function(ch, i) { %>
    <div class="reward-panel<%= i === 0 ? ' active' : '' %>" data-index="<%= i %>">
      <div class="reward-qrcode-wrap" style="--ch-color: <%= ch.color %>">
        <img class="reward-qrcode" src="<%- url_for(ch.qrcode) %>" alt="<%= ch.name %>">
      </div>
      <% if (ch.description) { %>
      <p class="reward-desc"><%= ch.description %></p>
      <% } %>
      <% if (ch.link) { %>
      <a class="reward-link" href="<%= ch.link %>" target="_blank" rel="noopener">
        前往<%= ch.name %> <i class="ri-external-link-line"></i>
      </a>
      <% } %>
    </div>
    <% }); %>
  </div>
</div>
<% } %>
```

### 5.2 `article.ejs` 按钮区修正

```ejs
<!-- reward -->
<% if ((theme.reward_type === 2 || (theme.reward_type === 1 && post.reward)) && !index && !post.no_reward) { %>
<div id="reward-out">
  <div id="reward-btn" class="reward-trigger">
    <i class="ri-cup-line"></i> <%= __('post.reward') %>
  </div>
</div>
<% } %>
```

变更点：
- 修复 `reword-out` → `reward-out`
- 为按钮添加 `.reward-trigger` 类，统一触发逻辑
- 添加图标增强可识别度

### 5.3 JavaScript 交互（`ayer.js` 中替换原 Reward 段落）

```javascript
// Reward Modal
$(document).on('click', '.reward-trigger, #reward-btn', function () {
  var $modal = $('#reward');
  var $mask = $('#mask');
  if (!$modal.length) return;

  // 初始化选中第一个渠道的颜色
  var firstColor = $modal.find('.reward-tab.active').data('color');
  $modal.css('--reward-accent', firstColor);

  $mask.fadeIn(150);
  $modal.addClass('visible');
});

// 关闭
$(document).on('click', '#reward .reward-close, #mask', function () {
  $('#mask').fadeOut(100);
  $('#reward').removeClass('visible');
});

// 标签页切换
$(document).on('click', '.reward-tab', function () {
  var $this = $(this);
  var idx = $this.data('index');
  var color = $this.data('color');

  // 切换标签
  $('.reward-tab').removeClass('active');
  $this.addClass('active');

  // 切换面板
  $('.reward-panel').removeClass('active');
  $('.reward-panel[data-index="' + idx + '"]').addClass('active');

  // 更新主题色
  $('#reward').css('--reward-accent', color);
});

// ESC 关闭
$(document).on('keydown', function (e) {
  if (e.key === 'Escape') {
    $('#mask').fadeOut(100);
    $('#reward').removeClass('visible');
  }
});
```

### 5.4 CSS 样式（追加到 `custom.styl`）

以下为完整的样式方案，使用纯 CSS 写在 `@css { }` 块中（与现有 `custom.styl` 模式一致）：

```css
/* ===== Reward Modal ===== */

:root {
  --reward-bg: rgba(255, 255, 255, 0.88);
  --reward-border: rgba(0, 0, 0, 0.08);
  --reward-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);
  --reward-text: #333;
  --reward-subtext: #666;
  --reward-tab-bg: rgba(0, 0, 0, 0.04);
  --reward-tab-text: #555;
  --reward-tab-hover: rgba(0, 0, 0, 0.08);
  --reward-accent: #07C160;
  --reward-overlay: rgba(0, 0, 0, 0.5);
}

body.darkmode {
  --reward-bg: rgba(42, 47, 58, 0.95);
  --reward-border: rgba(255, 255, 255, 0.1);
  --reward-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  --reward-text: #d0d0d0;
  --reward-subtext: #aaa;
  --reward-tab-bg: rgba(255, 255, 255, 0.06);
  --reward-tab-text: #bbb;
  --reward-tab-hover: rgba(255, 255, 255, 0.1);
  --reward-overlay: rgba(0, 0, 0, 0.7);
}

#mask {
  background: var(--reward-overlay);
}

.reward-modal {
  position: fixed;
  z-index: 9999;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%) scale(0.95);
  width: 420px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 28px;
  background: var(--reward-bg);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--reward-border);
  border-radius: 16px;
  box-shadow: var(--reward-shadow);
  display: none;
  opacity: 0;
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.reward-modal::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--reward-accent);
  border-radius: 16px 16px 0 0;
  transition: background 0.3s ease;
}

.reward-modal.visible {
  display: block;
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}

.reward-close {
  position: absolute;
  right: 12px;
  top: 12px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.2s;
  color: var(--reward-subtext);
}
.reward-close:hover {
  background: var(--reward-tab-hover);
}
.reward-close i {
  font-size: 20px;
  color: var(--reward-subtext) !important;
}

.reward-wording {
  text-align: center;
  font-size: 16px;
  font-weight: 500;
  color: var(--reward-text);
  margin: 0 0 20px 0;
  line-height: 1.6;
}
.reward-wording i {
  margin-right: 6px;
  color: var(--reward-accent) !important;
  transition: color 0.3s ease;
}

/* Tabs */
.reward-tabs {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.reward-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 20px;
  background: var(--reward-tab-bg);
  color: var(--reward-tab-text);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}
.reward-tab:hover {
  background: var(--reward-tab-hover);
}
.reward-tab.active {
  background: var(--reward-accent);
  color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
.reward-tab.active i {
  color: #fff !important;
}
.reward-tab i {
  font-size: 16px;
  color: var(--reward-tab-text) !important;
  transition: color 0.3s ease;
}

/* Panels */
.reward-panel {
  display: none;
  text-align: center;
  animation: rewardFadeIn 0.25s ease;
}
.reward-panel.active {
  display: block;
}

@keyframes rewardFadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

.reward-qrcode-wrap {
  display: inline-block;
  padding: 12px;
  border: 2px solid var(--reward-accent);
  border-radius: 12px;
  background: #fff;
  transition: border-color 0.3s ease;
}

.reward-qrcode {
  display: block;
  width: 200px;
  height: 200px;
  border-radius: 6px;
}

.reward-desc {
  margin: 12px 0 0;
  font-size: 14px;
  color: var(--reward-accent);
  transition: color 0.3s ease;
}

.reward-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 12px;
  padding: 8px 20px;
  background: var(--reward-accent);
  color: #fff !important;
  border-radius: 20px;
  font-size: 14px;
  text-decoration: none !important;
  transition: all 0.3s ease;
}
.reward-link:hover {
  opacity: 0.85;
  transform: translateY(-1px);
}

/* Trigger Button (in article) */
#reward-out {
  position: relative;
  width: 100%;
  text-align: center;
}

.reward-trigger, #reward-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 40px;
  padding: 0 24px;
  margin: 48px 0;
  font-size: 15px;
  color: #fff !important;
  background: linear-gradient(135deg, var(--reward-accent), color-mix(in srgb, var(--reward-accent) 80%, #000));
  border: none;
  border-radius: 20px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  transition: all 0.3s ease;
}
.reward-trigger:hover, #reward-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

/* Mobile */
@media (max-width: 768px) {
  .reward-modal {
    width: 90vw;
    padding: 20px;
  }
  .reward-qrcode {
    width: 160px;
    height: 160px;
  }
  .reward-tabs {
    gap: 6px;
  }
  .reward-tab {
    padding: 6px 12px;
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .reward-tabs {
    flex-wrap: nowrap;
    overflow-x: auto;
    justify-content: flex-start;
    padding-bottom: 4px;
    -webkit-overflow-scrolling: touch;
  }
  .reward-qrcode {
    width: 140px;
    height: 140px;
  }
}
```

### 5.5 关于页嵌入示例

在 `source/about/index.md` 末尾追加：

```html
---

**支持作者：**

<div style="text-align: center; margin: 20px 0;">
  <button class="reward-trigger" onclick="document.getElementById('reward-btn')?.click()">
    <i class="ri-cup-line"></i> 打赏作者
  </button>
</div>
```

由于 `modal.ejs` 在全局 `layout.ejs` 中渲染，该按钮在任何页面都能触发弹层。

---

## 六、实施步骤

按以下顺序执行，每步独立可验证：

| 步骤 | 内容 | 涉及文件 |
|------|------|----------|
| 1 | 创建 `source/images/reward/` 目录，放入二维码图片 | `source/images/reward/` |
| 2 | 更新 `_config.ayer.yml` 中的打赏配置 | `_config.ayer.yml` |
| 3 | 改造 `modal.ejs` 为数据驱动模板 | `themes/ayer/layout/_partial/modal.ejs` |
| 4 | 修复 `article.ejs` 按钮区 | `themes/ayer/layout/_partial/article.ejs` |
| 5 | 替换 `ayer.js` 中的打赏交互代码 | `themes/ayer/source-src/js/ayer.js` |
| 6 | 在 `custom.styl` 中追加新样式 | `themes/ayer/source/css/custom.styl` |
| 7 | 清理 `reward.styl` 中的旧样式（可选：保留但被 custom 覆盖） | `themes/ayer/source-src/css/_partial/reward.styl` |
| 8 | （可选）在关于页添加打赏入口 | `source/about/index.md` |
| 9 | 运行 `npm run build` 验证构建 | - |
| 10 | 本地 `npm run server` 验证亮/暗模式、多渠道切换、移动端 | - |

---

## 七、扩展性说明

### 7.1 新增渠道

只需在 `_config.ayer.yml` 的 `reward.channels` 数组中追加一项，无需改动任何代码文件。模板通过 `forEach` 循环自动渲染。

### 7.2 未来可能的增强

| 增强方向 | 实现思路 |
|----------|----------|
| **渠道分组** | channels 中增加 `group` 字段，模板按 group 分区渲染 |
| **金额预设** | channels 中增加 `amounts: [5, 10, 20]`，模板渲染金额按钮 |
| **固定底栏入口** | 在 `float-btns.ejs` 中增加一个打赏浮动按钮，与回到顶部并排 |
| **统计打赏次数** | 搭配不蒜子或自建 API，记录弹层展示/点击次数 |
| **每篇文章自定义渠道** | Front-matter 中覆盖 `reward_channels`，模板优先读取文章级配置 |

---

## 八、兼容性注意事项

| 事项 | 说明 |
|------|------|
| **`backdrop-filter`** | 需要 `-webkit-` 前缀兼容 Safari；不支持的浏览器会退化为半透明纯色背景，可接受 |
| **`color-mix()`** | 按钮渐变中使用了 `color-mix(in srgb, ...)`，需 Chrome 111+ / Firefox 113+ / Safari 16.2+；如需兼容更旧浏览器，可改为固定渐变色或去除渐变 |
| **CSS 自定义属性** | 所有现代浏览器均支持，IE 不支持但本站不需要考虑 IE |
| **RemixIcon** | 站点已全局引入，确认包含 `ri-wechat-pay-line`、`ri-alipay-line` 等图标即可 |

---

## 九、总结

本方案的核心思路是：**数据驱动 + CSS 变量主题化 + 最小侵入**。

- 配置层面，用一个 YAML 数组取代硬编码的双渠道，实现真正的可扩展。
- 视觉层面，毛玻璃面板 + 渠道品牌色联动，兼顾美观与实用。
- 技术层面，仅修改 5 个文件、新增 1 个目录，不引入任何新依赖，与现有架构完全兼容。
- 展示策略上，文章页保留原有控制机制，关于页等特殊页面通过简单 HTML 触发，避免过度打扰用户。
