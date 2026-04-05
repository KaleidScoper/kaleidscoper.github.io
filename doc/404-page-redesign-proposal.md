# 404 页面视觉与功能优化方案

> **起草日期**: 2026-04-04
> **修订日期**: 2026-04-05
> **适用范围**: `themes/ayer/source/404.html`
> **主题**: ayer（EJS 模板引擎）
> **约束**: GitHub Pages 的 404 页面是独立 HTML 文件，无法使用 Hexo 模板引擎，因此所有样式和逻辑必须内联或自包含

---

## 〇、现状分析

### 当前实现

| 维度 | 现状 | 问题 |
|------|------|------|
| 架构 | 独立 HTML，所有样式内联于 `<style>` | 符合 GitHub Pages 约束，但与全站设计系统完全脱节 |
| 配色 | 文字 `#403e3e`、链接 `#0681d0`，白色系背景 | 全站默认暗色模式（`#1c1f26` 底色），此页面为亮色调，视觉断裂 |
| 背景图 | 引用 `/images/404.jpg`（实际位于 `themes/ayer/source/images/404.jpg`） | 文件存在且可正常加载，但页面配色和布局未充分利用此背景图 |
| 主体图片 | 引用 `tvax4.sinaimg.cn` 的外链图片 | 依赖新浪图床，国际访客加载不稳定，存在防盗链/下线风险 |
| 文案 | 全部 `<!-- 注释 -->` 掉了 | 页面无任何文字引导，用户不知道发生了什么 |
| 导航 | 仅有一个 40px 的 base64 小图标链接回首页 | 极易忽略，用户无明确路径离开当前页面 |
| 响应式 | 仅有一条 `@media(max-width:768px)` 改图宽 | 缺少对中间断点、极小屏的适配 |
| 暗色模式 | 无 | 与全站 `body.darkmode` 体系完全不通 |
| 字体 | 浏览器默认 | 全站使用 `"Helvetica Neue", "PingFang SC", "Microsoft YaHei"` 等字体栈 |
| 动效 | 无 | 全站大量使用 `0.3s ease-in-out` 过渡、hover 上浮、毛玻璃效果 |
| 页脚/侧栏 | 无 | 作为独立页面无法复用 EJS 组件，但也不提供任何站点信息 |

### 核心矛盾

**404 页面是独立 HTML，无法接入 Hexo/EJS 渲染管线**，因此不可能直接复用 `layout.ejs`、`dist/main.css`、`custom.css` 等主题资源。但这不意味着视觉可以脱节——需要在独立 HTML 内**手动复刻**全站的设计令牌（配色、字体、圆角、动效曲线），并采用与主页封面一致的**全屏背景图 + 居中文字叠加**的布局范式，使访客从任意页面跳转至 404 时感受到视觉连续性。

---

## 一、设计目标

1. **视觉统一**：采用与主页封面（`_partial/ayer.ejs` 的 `.cover-frame`）同构的全屏背景图 + 居中文字布局，配色、字体、动效与全站一致。
2. **功能完整**：明确告知用户"页面不存在"，提供返回首页和常用导航的清晰路径。
3. **自包含**：所有样式和脚本内联于单一 HTML 文件，不依赖外部 CSS/JS 资源，不依赖不可控的第三方图床；背景图使用自有的 `/images/404.jpg`（同域可控）。
4. **响应式**：桌面/平板/手机三档断点均有良好表现。

---

## 二、设计令牌对齐清单

从 `_variables.styl`、`_darkmode.styl`、`custom.styl` 中提取的核心令牌，404 页面内联样式须对齐以下值：

| 令牌 | 亮色值 | 暗色值（默认） | 来源 |
|------|--------|---------------|------|
| 主背景 | `#ffffff` | `#1c1f26` | `_darkmode.styl` |
| 卡片/表面 | `#f5f6f8` | `#2a2f3a` | `_darkmode.styl` |
| 边框 | `rgba(0,0,0,0.08)` | `#3b414c` | `_darkmode.styl` |
| 主文字 | `darken(#5c5858, 30%)` | `#d0d0d0` | `_variables.styl` / `_darkmode.styl` |
| 次要文字 | `#999` | `#aaaaaa` | `_darkmode.styl` |
| 链接 | `#0681d0` | `#80cfff` | `_variables.styl` / `_darkmode.styl` |
| 链接 hover | `lighten(#0681d0, 20%)` | `#a8daff` | 同上 |
| 强调蓝 | `#3d85c6` | `#5fc5f5` | `_variables.styl` / `_darkmode.styl` |
| 封面标题字体栈 | `"Titillium Web", "PingFang SC", "Hiragino Sans GB", "Microsoft JhengHei", "Microsoft YaHei", Helvetica Neue, Helvetica, Arial, sans-serif` | 同左 | `_partial/ayer.styl` |
| 正文字体栈 | `"Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif` | 同左 | `_variables.styl` |
| 封面标题字号 | `7rem`（桌面），`4.5rem`（移动端） | 同左 | `_partial/ayer.styl` |
| 封面副标题字号 | `3rem`（桌面），`2rem`（移动端） | 同左 | `_partial/ayer.styl` |
| 基准字号 | `html { font-size: 62.5% }`，正文 `1.4rem` | 同左 | `_variables.styl` |
| 行高 | `1.7` | 同左 | `_variables.styl` |
| 圆角 | `0.4rem`（基础），`12-14px`（卡片） | 同左 | `_variables.styl` / `custom.styl` |
| 过渡 | `all 0.3s ease-in-out` | 同左 | `_variables.styl` |
| 毛玻璃 | `backdrop-filter: blur(10px)` | 同左 | `custom.styl` |

> **注**：404 页面采用全屏背景图 + 白色文字叠加，暗色/亮色令牌主要用于参考。页面文字统一使用白色系以确保在图片上的可读性，按钮和导航通过 `rgba` 白色控制层次。

---

## 三、页面结构方案

### 3.1 整体布局

对齐主页封面（`.cover-frame` + `.cover-inner`）的全屏图片 + 居中文字结构：

```
┌──────────────────────────────────────────────────────────────┐
│                   全屏容器 (100vh)                            │
│       background: url('/images/404.jpg') cover               │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │           半透明暗色遮罩层 (body::before)               │  │
│  │         rgba(0,0,0,0.35) 保证文字可读性                │  │
│  │                                                        │  │
│  │     ┌──────────────────────────────────────────┐       │  │
│  │     │      居中内容区 (flex 垂直水平居中)       │       │  │
│  │     │                                          │       │  │
│  │     │      「404」大字标题（白色，7rem）        │       │  │
│  │     │      "页面未找到" 提示文案                │       │  │
│  │     │      英文副文案                           │       │  │
│  │     │                                          │       │  │
│  │     │      [ 返回首页 ] 按钮                    │       │  │
│  │     │                                          │       │  │
│  │     │      快速导航链接行                       │       │  │
│  │     │   (全部文章 · 文章分类 · 关于本站)        │       │  │
│  │     └──────────────────────────────────────────┘       │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│                   底部极简版权信息                            │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 3.2 与主页封面的结构对照

| 元素 | 主页封面实现 | 404 页面对应 |
|------|-------------|-------------|
| 全屏容器 | `.cover-frame { height: 100vh }` | `body { min-height: 100vh; background: url(...) cover }` |
| 背景图 | `.bg-box > img { object-fit: cover }` | CSS `background-image`（独立 HTML 中更简洁） |
| 遮罩层 | 无（图片自身较暗） | `body::before { background: rgba(0,0,0,0.35) }`（404.jpg 明暗不确定，需保证文字对比度） |
| 居中内容 | `.cover-inner { position: absolute; top: 50%; transform: translate(-50%, -100%) }` | `.error-content { position: relative; z-index: 1 }`（flex 居中更简洁） |
| 主标题 | `h1 { font-size: 7rem; color: white }` | `.error-code { font-size: 7rem; color: white }` |
| 副标题 | `#subtitle-box { font-size: 3rem }` | `.error-message { font-size: 2.4rem }` |
| 下方引导 | `.cover-learn-more` 向下箭头 | 「返回首页」按钮 + 导航链接 |

### 3.3 设计原则

- **主页同构**：采用与主页封面一致的全屏背景图 + 居中白色文字的视觉范式，保持站内体验连续。
- **单一焦点**：404 页面的核心使命是"引导用户回到正确路径"，不应信息过载。
- **图片可控**：使用自有的 `/images/404.jpg`（位于 `themes/ayer/source/images/404.jpg`），同域资源，无第三方依赖风险。
- **文字可读**：通过半透明暗色遮罩层保证白色文字在任意背景图上的对比度。

---

## 四、各元素详细方案

### 4.1 全屏背景图

**目标**：使用自有 `404.jpg` 作为全屏背景，对齐主页封面的全屏图片视觉。

```css
body {
  margin: 0;
  padding: 0;
  font-family: "Helvetica Neue", Helvetica, "PingFang SC",
               "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑",
               Arial, sans-serif;
  font-size: 1.4rem;
  line-height: 1.7;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: url('/images/404.jpg') no-repeat center center fixed;
  background-size: cover;
  color: #fff;
  overflow: hidden;
}
```

**设计说明**：
- `background-size: cover` + `center center` 与主页 `.bg-box > img { object-fit: cover; object-position: center center }` 效果一致。
- `background-attachment: fixed` 使背景在极端情况下不随内容滚动。
- 使用 `flex` 居中替代主页的绝对定位 `transform: translate(-50%, -100%)`，在独立页面中更简洁。

### 4.2 半透明遮罩层

**目标**：在背景图上叠加暗色遮罩，确保白色文字的可读性。

```css
body::before {
  content: '';
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 0;
}
```

**设计说明**：
- 35% 黑色透明度在保证文字对比度的同时不过度遮盖背景图内容。
- 主页封面未使用遮罩（因为 `background.jpg` 本身较暗），但 `404.jpg` 的亮度不可预知，遮罩层是必要的安全措施。
- 可根据 `404.jpg` 的实际明暗调整透明度（建议范围 0.3 ~ 0.5）。

### 4.3 内容容器

**目标**：包裹文字和按钮元素，使其位于遮罩层之上，与主页封面 `.cover-inner` 对应——纯文字叠加，不加卡片容器。

```css
.error-content {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 2rem;
  animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

**设计说明**：
- `z-index: 1` 确保内容位于 `body::before` 遮罩层之上。
- 无背景色、无边框——直接让文字"浮"在图片上，与主页封面 `.cover-inner` 一致。
- 入场动画采用 `translateY + opacity`，与主页整体的过渡风格一致。

### 4.4 「404」主标题

**目标**：成为页面视觉锚点，对齐主页封面 `h1`（`_partial/ayer.styl` 中 `7rem` 大字、白色、Titillium Web 字体栈）。

```css
.error-code {
  font-family: "Titillium Web", "PingFang SC", "Hiragino Sans GB",
               "Microsoft JhengHei", "Microsoft YaHei",
               Helvetica Neue, Helvetica, Arial, sans-serif;
  font-size: 7rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1;
  color: #fff;
  opacity: 0.95;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
  margin-bottom: 1rem;
  user-select: none;
}
```

**设计说明**：
- 字体栈与主页封面 `.cover-inner h1` 完全一致，使用 `Titillium Web` 作为首选。
- 字号 `7rem` 与主页封面标题对齐（`html { font-size: 62.5% }` 下等于 `70px`）。
- 白色文字 + `text-shadow` 确保在背景图上的可读性，与主页封面的白色标题风格统一。
- `opacity: 0.95` 与主页封面一致，避免纯白过于刺眼。

### 4.5 提示文案

**目标**：简洁明确，中英双语覆盖中外访客，字号对齐主页封面副标题层级。

```html
<p class="error-message">页面未找到</p>
<p class="error-description">
  你访问的页面不存在或已被移除。<br>
  The page you're looking for doesn't exist.
</p>
```

```css
.error-message {
  font-size: 2.4rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin: 0.5rem 0;
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.3);
}

.error-description {
  font-size: 1.4rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.8;
  margin: 0.8rem 0 2.5rem;
}
```

**设计说明**：
- `.error-message` 字号 `2.4rem`（24px），介于主页封面副标题 `3rem` 和正文之间，作为二级标题。
- 使用 `rgba` 白色控制层次：主文案 90% 不透明度，描述文 70% 不透明度。
- `text-shadow` 增强图片背景上的可读性。

### 4.6 返回首页按钮

**目标**：页面最醒目的 CTA（Call to Action），采用白色半透明风格，与背景图上的文字层视觉融合。

```html
<a href="/" class="home-btn">
  <!-- 内联 SVG: Remix Icon ri-home-4-line -->
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M19 21H5a1 1 0 0 1-1-1v-9H1l10.327-9.388a1 1 0 0 1 1.346 0L23 11h-3v9a1 1 0 0 1-1 1zm-6-2h5V9.157l-6-5.454-6 5.454V19h5v-6h2v6z"/>
  </svg>
  返回首页
</a>
```

```css
.home-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  font-size: 1.4rem;
  font-weight: 500;
  text-decoration: none;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transition: all 0.3s ease-in-out;
}

.home-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}
```

**设计说明**：
- 采用白色半透明背景 + 白色半透明边框，适合叠加在图片上（不同于暗色纯底上的蓝色按钮）。
- `backdrop-filter: blur(8px)` 提供微妙的毛玻璃质感，复用全站毛玻璃设计语言。
- hover 效果：上浮 `2px` + 阴影扩散，与全站的 hover 范式一致。
- 使用内联 SVG 替代图标字体，彻底消除外部依赖（体积增加约 200 字节，但保证零外部请求）。

### 4.7 快速导航链接

**目标**：提供除首页以外的常用入口，减少用户跳出率。

```html
<nav class="quick-nav">
  <a href="/archives">全部文章</a>
  <span class="nav-divider">·</span>
  <a href="/categories">文章分类</a>
  <span class="nav-divider">·</span>
  <a href="/about">关于本站</a>
</nav>
```

```css
.quick-nav {
  margin-top: 1.5rem;
  font-size: 1.2rem;
}

.quick-nav a {
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  transition: color 0.3s ease;
}

.quick-nav a:hover {
  color: #fff;
}

.nav-divider {
  margin: 0 0.6rem;
  color: rgba(255, 255, 255, 0.3);
}
```

**设计说明**：
- 导航项取自 `_config.ayer.yml` 的 `menu` 配置中最核心的三项。
- 使用低透明度白色（60%），hover 时提升为纯白，不与首页按钮抢视觉权重。
- 中间圆点分隔符使用 30% 白色，低调但清晰。

### 4.8 底部版权

**目标**：提供极简的站点归属信息，与主站 `footer.ejs` 风格呼应。

```html
<footer class="error-footer">
  &copy; 2026 · <a href="/">KaleidScoper</a>
</footer>
```

```css
.error-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  text-align: center;
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.35);
  z-index: 1;
}

.error-footer a {
  color: rgba(255, 255, 255, 0.5);
  text-decoration: none;
  transition: color 0.3s ease;
}

.error-footer a:hover {
  color: rgba(255, 255, 255, 0.8);
}
```

---

## 五、亮色模式适配（不适用）

本方案的 404 页面采用全屏背景图 + 白色文字叠加，视觉表现**不依赖暗色/亮色模式切换**——文字始终为白色系，可读性由半透明遮罩层保证，无论系统偏好如何，页面呈现效果一致。

此外，全站 `<body class="darkmode">` 是固定写入 HTML 的（见 `layout.ejs` 第 3 行），404 页面无需也不应引入独立的亮/暗切换逻辑。

如果未来全站支持用户手动切换亮/暗模式（如读取 localStorage），可考虑在 404 页面中调整遮罩层透明度（亮色模式下降低遮罩强度），但当前优先级极低。

---

## 六、完整 HTML 结构参考

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>404 - 页面未找到</title>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
  <meta name="robots" content="noindex">
  <link rel="shortcut icon" href="/favicon.ico">
  <style>
    /* === 重置与全局 === */
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

    html { font-size: 62.5%; }

    /* === 全屏背景图 === */
    body {
      font-family: "Helvetica Neue", Helvetica, "PingFang SC",
                   "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑",
                   Arial, sans-serif;
      font-size: 1.4rem;
      line-height: 1.7;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: url('/images/404.jpg') no-repeat center center fixed;
      background-size: cover;
      color: #fff;
      overflow: hidden;
    }

    /* === 半透明遮罩 === */
    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.35);
      z-index: 0;
    }

    /* === 内容容器 === */
    .error-content {
      position: relative;
      z-index: 1;
      text-align: center;
      padding: 2rem;
      animation: fadeIn 0.8s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* === 404 标题 === */
    .error-code {
      font-family: "Titillium Web", "PingFang SC", "Hiragino Sans GB",
                   "Microsoft JhengHei", "Microsoft YaHei",
                   Helvetica Neue, Helvetica, Arial, sans-serif;
      font-size: 7rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      line-height: 1;
      color: #fff;
      opacity: 0.95;
      text-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
      margin-bottom: 1rem;
      user-select: none;
    }

    /* === 文案 === */
    .error-message {
      font-size: 2.4rem;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.9);
      margin: 0.5rem 0;
      text-shadow: 0 1px 8px rgba(0, 0, 0, 0.3);
    }

    .error-description {
      font-size: 1.4rem;
      color: rgba(255, 255, 255, 0.7);
      line-height: 1.8;
      margin: 0.8rem 0 2.5rem;
    }

    /* === 首页按钮 === */
    .home-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 28px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: #fff;
      font-size: 1.4rem;
      font-weight: 500;
      text-decoration: none;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      transition: all 0.3s ease-in-out;
    }

    .home-btn:hover {
      background: rgba(255, 255, 255, 0.25);
      border-color: rgba(255, 255, 255, 0.5);
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    }

    /* === 快速导航 === */
    .quick-nav {
      margin-top: 1.5rem;
      font-size: 1.2rem;
    }

    .quick-nav a {
      color: rgba(255, 255, 255, 0.6);
      text-decoration: none;
      transition: color 0.3s ease;
    }

    .quick-nav a:hover {
      color: #fff;
    }

    .nav-divider {
      margin: 0 0.6rem;
      color: rgba(255, 255, 255, 0.3);
    }

    /* === 底部版权 === */
    .error-footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 1rem;
      text-align: center;
      font-size: 1.2rem;
      color: rgba(255, 255, 255, 0.35);
      z-index: 1;
    }

    .error-footer a {
      color: rgba(255, 255, 255, 0.5);
      text-decoration: none;
      transition: color 0.3s ease;
    }

    .error-footer a:hover {
      color: rgba(255, 255, 255, 0.8);
    }

    /* === 响应式 === */
    @media (max-width: 768px) {
      .error-code { font-size: 4.5rem; }
      .error-message { font-size: 2rem; }
      .error-description { font-size: 1.3rem; }
    }

    @media (max-width: 480px) {
      .error-content { padding: 1.5rem; }
      .error-code { font-size: 4rem; }
      .error-message { font-size: 1.8rem; }
      .home-btn { padding: 10px 22px; font-size: 1.3rem; }
    }
  </style>
</head>
<body>
  <div class="error-content">
    <div class="error-code">404</div>
    <p class="error-message">页面未找到</p>
    <p class="error-description">
      你访问的页面不存在或已被移除。<br>
      The page you're looking for doesn't exist.
    </p>
    <a href="/" class="home-btn">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M19 21H5a1 1 0 0 1-1-1v-9H1l10.327-9.388a1 1 0 0 1 1.346 0L23 11h-3v9a1 1 0 0 1-1 1zm-6-2h5V9.157l-6-5.454-6 5.454V19h5v-6h2v6z"/>
      </svg>
      返回首页
    </a>
    <nav class="quick-nav">
      <a href="/archives">全部文章</a>
      <span class="nav-divider">·</span>
      <a href="/categories">文章分类</a>
      <span class="nav-divider">·</span>
      <a href="/about">关于本站</a>
    </nav>
  </div>
  <footer class="error-footer">
    &copy; 2026 · <a href="/">KaleidScoper</a>
  </footer>
</body>
</html>
```

> 上述为完整可用的 HTML 文件，将第四节中各元素的 CSS 已全部填入。实施时直接替换 `themes/ayer/source/404.html` 即可。

---

## 七、与现有 404.html 的差异清单

| 维度 | 现有 | 改进后 |
|------|------|--------|
| 背景 | `url('/images/404.jpg')` 全屏背景，但页面整体风格未配合 | 保留 `404.jpg` 全屏背景，叠加半透明遮罩 + 白色文字，形成主页封面同构布局 |
| 主视觉 | 新浪图床外链大图（`sinaimg.cn`） | 移除外链图片，以自有 `404.jpg` 背景 + 居中「404」大字为主视觉 |
| 配色 | 亮色系（`#403e3e` 文字） | 白色系文字叠加在图片上，与主页封面风格统一 |
| 字体 | 浏览器默认 | 复刻主页封面字体栈（`Titillium Web` 标题 + 全站正文字体） |
| 文案 | 全部注释掉 | 中英双语明确提示 |
| 导航 | 40px base64 小图标 | 醒目的「返回首页」按钮 + 三项快速导航 |
| 动效 | 无 | 内容入场动画、按钮 hover 上浮、按钮毛玻璃效果 |
| 响应式 | 仅图片宽度 | 多断点适配（768px / 480px） |
| 外部依赖 | `sinaimg.cn` 图片 | 零第三方依赖，仅引用自有 `/images/404.jpg` |
| SEO | 无 `noindex` | 添加 `<meta name="robots" content="noindex">` |
| 语言 | `lang="en"` | `lang="zh-CN"` 对齐全站配置 |
| favicon | 无 | 引用 `/favicon.ico` |

---

## 八、移除项说明

以下现有元素建议在重构中移除，理由如下：

| 移除项 | 理由 |
|--------|------|
| sinaimg.cn 外链图片 | 第三方依赖不可控，国际访客加载不稳定，且与全站视觉无关 |
| base64 内联小图标 | 被正式的「返回首页」按钮替代 |
| `<figure class="forrestgump">` 结构 | 不再需要外链图片容器 |
| 被注释的 Hexo/Ayer 文档链接 | 面向开发者而非访客，不适合放在 404 页面 |
| `<meta name="keywords">` 中的 "Hexo,Ayer,404,Design" | 404 页面不应被搜索引擎收录，使用 `noindex` 替代 |

> **保留项**：`/images/404.jpg` 背景图引用予以保留并作为页面主视觉基础。

---

## 九、实施优先级

| 优先级 | 内容 | 工作量 | 说明 |
|--------|------|--------|------|
| P0 | 重写 HTML 骨架 + 全屏背景图 + 遮罩层 | 低 | 核心框架，替换旧内容 |
| P0 | 「404」白色大字 + 文案 + 首页按钮 | 低 | 页面主体功能 |
| P0 | 内容入场动画 | 低 | 视觉品质 |
| P1 | 快速导航链接 | 低 | 降低跳出率 |
| P1 | 响应式适配（768px / 480px 两档断点） | 低 | 移动端体验 |
| P2 | 底部版权信息 | 低 | 站点归属 |

> 总工作量估算：P0 + P1 约 20 分钟可完成。全部完成（含 P2）约 30 分钟。

---

## 十、文件变更清单

| 文件 | 操作 |
|------|------|
| `themes/ayer/source/404.html` | 完整重写（原地替换） |

> 仅涉及 **1 个文件**，无需修改主题模板、配置文件或新增资源文件。`/images/404.jpg` 已存在，无需额外添加图片资源。
