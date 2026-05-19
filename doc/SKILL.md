---
name: ayeria-aesthetic
description: >
  栖云散录博客（Hexo 主题 Ayeria）的设计语言参考文档。当用户要求在其博客上新增组件、优化现有 UI、编写 CSS/Stylus 样式、调整交互行为，或任何涉及"与博客风格保持一致"的任务时，必须先读取本 skill。即使用户没有明确说"参考风格"，只要任务涉及博客的前端视觉或交互，也应主动加载本 skill 作为设计约束基准。
---

# Ayeria 博客设计语言

> **使用说明**：这是博客 [栖云散录](https://kaleidscoper.github.io) 的权威设计规范。
> 在为该博客生成任何组件、样式或交互代码前，通读本文档，以此为硬约束。

---

## 一、双层美学体系

博客存在**两套并行的审美标准**，各自完整，不可混用，也不可创造第三套。

### 内容层（文章正文 / 阅读区域）

**书斋式克制**

- 衬线字体：**思源宋体**
- 充足行距，无装饰边框
- 颜色仅作语义区分：链接色、代码高亮色
- 可读性第一，任何视觉元素不得干扰阅读
- 参考对象：Tufte CSS、gwern.net

### 功能层（边栏 / 搜索弹窗 / 打赏弹窗 / 导航栏 / 分享组件）

**现代克制**

- `backdrop-filter: blur(16px)` + 半透明背景
- 薄边框：`1px solid var(--*-border)`
- 圆角：弹窗 `12px`，内部子容器 `8px`，按钮 pill 约 `19px`
- 阴影：`var(--*-shadow)` 管理，浅色基准 `0 6px 24px rgba(0,0,0,0.09)`（提供深度感，不强调自身）
- 明暗切换：CSS 自定义属性（`--*-bg`、`--*-border`、`--*-text` 命名模式）
- 动效：`opacity + transform scale/translateY` 过渡，0.2–0.3s ease，轻盈不抢眼
- 图标：静态墨色（中性灰），hover 时显色调而非全饱和品牌色
- 参照基准组件：`source-src/css/_partial/reward.styl`（打赏弹窗）

---

## 二、配色体系

### 主色调

| 色值 | 用途 |
|------|------|
| `#1c1f26` | 深色模式主背景（深靛蓝灰） |
| `#2a2f3a` | 深色模式内容卡片背景 |
| `#5aa8d8` | favicon、logo 主色（天蓝） |

> **注意**：实际色值均应通过 CSS 自定义属性管理，此处列出基准色供设计参考。

### 自定义属性规范

所有组件**必须**使用 CSS 自定义属性管理颜色，不得硬编码色值：

```stylus
// 命名模式示例（以分享组件为例）：
// var(--share-modal-bg)
// var(--share-modal-border)
// var(--share-modal-text)
// var(--share-modal-close)
// var(--share-icon-bg-hover)
// var(--share-mask-bg)
```

浅色 / 深色模式各定义一套变量值，浅色定义在 `:root` 下，深色定义在 `body.darkmode` 下，通过 `sessionStorage` 手动切换。

### 品牌色原则

功能层**不使用全饱和品牌色**作为常态色。如需保留平台品牌色（如微博红 `#d81e06`），仅在 hover 时出现，用色调变化暗示可操作性，而非品牌化强调。

---

## 三、字体体系

| 用途 | 字体 |
|------|------|
| 文章标题 / 装饰性标题 | 思源宋体（Bold 700） |
| 正文 | 思源宋体 |
| UI / 功能层文字 | 思源黑体 |
| 等宽 / 代码 | 系统默认等宽字体 |

---

## 四、组件规范

### 4.1 弹窗类（Modal）

参照基准：**打赏弹窗**（`source-src/css/_partial/reward.styl` / `.reward-modal`）

必须具备：
- `backdrop-filter: blur(16px)` + 半透明背景色
- `border-radius: 12px`
- `1px solid var(--*-border)` 薄边框
- `box-shadow: var(--reward-shadow)`（浅色 `0 6px 24px rgba(0,0,0,0.09)`）
- 入场动画：`opacity 0→1` + `transform scale(0.96→1)`，约 0.3s ease
- 关闭按钮：30px 圆形按钮，`border-radius: 50%`，hover 时背景变色
- 遮罩：优先使用 `visibility + opacity` 方案（如 `#share-mask`），带 0.25s 淡入过渡，避免 `display:none` 阻断 CSS transition。`#mask`（打赏遮罩）为历史遗留的 `display:none` + jQuery `fadeIn/fadeOut` 方案，后续重构时应对齐规范

HTML 结构模式：
```html
<div class="*-modal">
  <div class="*-close"><i class="ri-close-line"></i></div>
  <p class="*-caption">说明文字</p>
  <div class="*-content-frame">
    <!-- 内容 -->
  </div>
</div>
```

### 4.2 下拉气泡（Dropdown）

- `border-radius: 8px`
- 显隐使用**类名驱动**（添加 / 移除 `.open`），不用 jQuery `fadeToggle`
- 默认状态：`opacity: 0; pointer-events: none; transform: translateY(-4px)`
- 展开状态：`opacity: 1; pointer-events: auto; transform: translateY(0)`
- 过渡：`opacity 0.2s ease, transform 0.2s ease`

### 4.3 触发按钮

- **功能层触发器**（打赏等独立功能）：pill button，`backdrop-filter` + `border-radius: 19px` + `box-shadow`
- **行内触发器**（文章尾部分享等）：图标 + 文字链接形式，不强制对齐 pill button，上下文决定形式

### 4.4 图标

使用 **Remix Icon**（`ri-*` 类名）。图标颜色通过 CSS 变量管理，`color: inherit` 传递颜色。

### 4.5 图片处理

深色模式下，文章正文中的 `<img>` 应用 `filter: brightness(0.8)` 自动调暗。

---

## 五、交互行为规范

### Light Dismiss（轻忽略）

所有功能层浮层（气泡、弹窗）**必须**支持点击外部区域关闭：

```javascript
// 气泡 light dismiss
document.addEventListener('click', (e) => {
  if (!e.target.closest('.your-trigger-btn')) {
    closeDropdown();
  }
});

// 弹窗 light dismiss：遮罩覆盖全视口，点击遮罩即关闭
document.querySelector('#your-mask').addEventListener('click', hideModal);
```

### 状态管理

- 使用**类名**而非内联样式或 jQuery 动画管理显隐状态
- 状态类命名统一：`.open`（气泡展开）、`.visible`（弹窗显示）、`.active`（遮罩激活）
- 不使用 `.ready` / `.in` 等历史遗留类名

### JS 文件职责

- `ayeria.js`：全局行为（主题切换、搜索、目录、滚动、打赏弹窗等）
- `share.js`：分享组件（下拉气泡 + 微信二维码弹窗）
- `random-sentences.js`：随机句子组件
- 功能组件应逐步拆分到独立的 `*.js` 文件中（分享已完成此拆分，打赏弹窗逻辑仍在 `ayeria.js` 中，待后续重构）

---

## 六、设计哲学（硬性约束）

这些原则来自博主的核心审美价值观，**不得违反**：

1. **精确、克制、自足**：拒绝堆砌。每个视觉元素必须有存在的必要性。
2. **不创造第三种风格**：所有组件必须归属内容层或功能层之一，不得游离。
3. **Elevation 优于颜色**：用阴影深度区分层级，不用彩色装饰。功能层内部无彩色常态元素。
4. **动效服务于内容**：动效轻盈，不强调自身，不表演。
5. **明暗无缝**：任何新增组件，浅色 / 深色模式的适配是必要条件，不是可选项。
6. **语义化变量**：色值必须通过 CSS 自定义属性管理，硬编码色值是代码异味。

---

## 七、快速对照表

新增组件时，逐条检查：

| 检查项 | 标准 |
|--------|------|
| 归属层 | 内容层 / 功能层（必选其一） |
| 背景 | `backdrop-filter: blur(16px)` + 半透明（功能层） |
| 圆角 | 弹窗 12px / 子容器 8px |
| 边框 | `1px solid var(--*-border)` |
| 阴影 | `var(--*-shadow)`，浅色基准 `0 6px 24px rgba(0,0,0,0.09)` |
| 颜色管理 | 全部 CSS 自定义属性，无硬编码 |
| 入场动画 | `opacity + transform`，0.2–0.3s ease |
| Light dismiss | 气泡 + 弹窗均支持 |
| 深色适配 | 浅 / 深两套变量值均已定义 |
| 品牌色 | 仅 hover 出现，常态中性灰 |
| 图标色 | 静态中性灰，hover 显色调 |
| 状态类 | `.open` / `.visible` / `.active`，无 `display:none` |
