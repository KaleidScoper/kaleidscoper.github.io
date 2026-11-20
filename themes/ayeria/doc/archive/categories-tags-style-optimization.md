# 分类页与标签页视觉风格优化方案

> **起草日期**: 2026-04-09
> **适用范围**: `themes/ayer/layout/categories.ejs`、`themes/ayer/layout/tags.ejs`、`themes/ayer/source-src/css/_partial/categories.styl`、`themes/ayer/source-src/css/_partial/tag.styl`
> **主题**: ayer（EJS + Stylus）
> **约束**: 纯样式调整，不变更模板结构与 JS 交互逻辑

---

## 〇、现状分析

### Ayer 主题的视觉语言

| 特征 | 主题做法 |
|------|----------|
| 配色 | 纯色为主，强调色 `sea-blue #3d85c6`，文字 `#333`/`#555`/`#bbb`，背景纯白 |
| 圆角 | 全局 `border-radius: 0.4rem`（≈ 4px），Archive 分页按钮 6px |
| 阴影 | 几乎不使用 box-shadow，整体风格扁平克制 |
| 过渡 | `all 0.3s ease-in-out`，仅用于链接色、opacity 等轻量属性 |
| 动画 | 除首屏封面箭头外无入场动画 |
| 模糊/毛玻璃 | 不使用 |
| 渐变 | 不使用 |

### 两个页面的 Vibe Coding 特征

| 问题 | Categories 页 | Tags 页 | 偏离程度 |
|------|--------------|---------|----------|
| **渐变色滥用** | Badge 背景使用 `linear-gradient(135deg, …)` 共 4 处（depth 1/2 + 暗色模式） | Level 5 标签背景使用 `linear-gradient(135deg, …)` 共 2 处 | 严重 — 全站无渐变先例 |
| **毛玻璃效果** | `backdrop-filter: blur(10px)` + 半透明 `rgba()` 背景 | `backdrop-filter: blur(12px)` + 半透明 `rgba()` 背景 | 严重 — 全站无毛玻璃先例 |
| **圆角过大** | `border-radius: 16px`（depth 1）、12px/10px（深层级） | 容器 16px、标签 10px | 中等 — 主题全局 ≈ 4px |
| **阴影过重** | 4 级阴影系统 + hover 加深，如 `0 8px 32px rgba(…, 0.17)` | 容器阴影 `0 8px 32px` + 标签 hover 阴影 | 严重 — 主题几乎无阴影 |
| **入场动画** | 无 | `tagFadeIn`：scale(0.90) → scale(1) + 25ms 逐个延迟 | 中等 — 主题无入场动画 |
| **Hover 过度** | 背景色 + 阴影双重变化 | `translateY(-2px) scale(1.06)` + 阴影 | 中等 — 主题 hover 仅改色/opacity |
| **CSS 变量膨胀** | 约 40 个 `--cat-*` 自定义属性 | 约 55 个 `--tag-*` 自定义属性 | 轻微 — 可维护但体量偏大 |

---

## 一、渐变色 → 纯色

### 1.1 Categories Badge

将所有 `--cat-badge-bg` 和 `--cat-child-badge-bg` 从 `linear-gradient(…)` 改为纯色：

| 变量 | 当前值 | 建议值 |
|------|--------|--------|
| `--cat-badge-bg`（亮色） | `linear-gradient(135deg, #3d85c6, #0681d0)` | `#3d85c6` |
| `--cat-badge-bg`（暗色） | `linear-gradient(135deg, #5ca9e6, #3d85c6)` | `#5ca9e6` |
| `--cat-child-badge-bg`（亮色） | `linear-gradient(135deg, #5ca9e6, #3d85c6)` | `#5ca9e6` |
| `--cat-child-badge-bg`（暗色） | `linear-gradient(135deg, #7abce8, #5ca9e6)` | `#7abce8` |

### 1.2 Tags Level 5

| 变量 | 当前值 | 建议值 |
|------|--------|--------|
| `--tag-bg-5`（亮色） | `linear-gradient(135deg, #3d85c6, #0681d0)` | `#3d85c6` |
| `--tag-bg-5`（暗色） | `linear-gradient(135deg, #5ca9e6, #3d85c6)` | `#5ca9e6` |

> 修改后 `background` 属性可统一为 `background-color`，减少渲染开销。

---

## 二、去除毛玻璃效果

### 2.1 Categories 卡片

删除 depth 1 节点上的 `backdrop-filter` 和 `-webkit-backdrop-filter`，将半透明背景改为实色：

```stylus
// 修改前
--cat-bg: rgba(255, 255, 255, 0.6)
backdrop-filter: blur(10px)

// 修改后
--cat-bg: #ffffff
// 删除 backdrop-filter 两行
```

暗色模式同理：`rgba(40, 40, 40, 0.6)` → 改为主题暗色背景的实色（如 `#282828`）。

### 2.2 Tags 容器

同上，`.tag-cloud` 去掉 `backdrop-filter`，`--tag-card-bg` 改为实色。

---

## 三、收敛圆角

按照主题的克制风格，统一收拢圆角至 4–8px 范围：

| 元素 | 当前 | 建议 |
|------|------|------|
| Categories depth 1 卡片 | 16px | 8px |
| Categories depth 2 | 12px | 6px |
| Categories depth 3+ | 10px | 4px |
| Tags 容器 | 16px | 8px |
| Tags 单项 | 10px | 6px |
| 排序/搜索按钮 | 8px | 6px |

---

## 四、减轻阴影

### 4.1 方案 A：完全去除（推荐）

与主题 archive、article 风格一致，卡片不加 `box-shadow`，仅靠边框 + 背景色区分层级。用 `border: 1px solid var(--cat-border)` 即可。

### 4.2 方案 B：保留但收敛

若希望保持一定立体感，阴影统一为单级轻阴影：

```stylus
--cat-shadow: 0 2px 8px rgba(0, 0, 0, 0.06)
--cat-shadow-hover: 0 2px 8px rgba(0, 0, 0, 0.06)  // hover 不加深
```

标签页容器同理。

---

## 五、简化动画与交互

### 5.1 去除标签入场动画

删除 `@keyframes tagFadeIn` 及相关的 `.tag-cloud-wrap.is-animated` 样式。标签直接可见（`opacity: 1`），删除 `will-change` 属性。

同步清理 `tags.ejs` 中 `triggerEntrance()` 函数的调用（函数可保留空壳以免报错，或一并移除）。

### 5.2 收敛 Hover 效果

**Tags 标签项**：去掉 `translateY(-2px) scale(1.06)`，改为仅变色：

```stylus
.tag-cloud-item
  &:hover
    color: var(--tag-accent)
    // 不移位，不缩放，不加阴影
```

**Categories 卡片**：hover 仅改边框色或背景色微调，去掉 `box-shadow` 变化。

---

## 六、精简 CSS 变量

当前两个文件合计约 95 个 `--cat-*` / `--tag-*` 自定义属性，许多只是在亮/暗之间重复定义 hover 变体。建议：

1. **合并 hover 变体**：shadow-hover、bg-hover 等在 hover 不再变化后可直接删除。
2. **复用主题变量**：accent 色直接引用 `sea-blue`（Stylus 变量），border-color 复用主题 `border-color`/`froth`，不另起自定义属性。
3. **目标**：Categories 变量 ≤ 15 个，Tags 变量 ≤ 20 个。

---

## 七、变更清单

| 文件 | 操作 | 工作量 |
|------|------|--------|
| `_partial/categories.styl` | 替换 6 处渐变为纯色；删除 backdrop-filter；调整圆角/阴影/hover；精简变量 | 中 |
| `_partial/tag.styl` | 替换 2 处渐变为纯色；删除 backdrop-filter + keyframes；调整圆角/阴影/hover；精简变量 | 中 |
| `tags.ejs` | 删除或空置 `triggerEntrance()` 逻辑；可选：移除 `is-animated` 类操作 | 小 |
| `categories.ejs` | 无需修改 | — |
| `source-src/css/style.styl` | 无需修改（import 路径不变） | — |
| Rollup 重新构建 `dist/main.css` | 修改 Stylus 源码后需要重新打包 | 小 |

---

## 八、预期效果

- 分类页和标签页视觉上回归 Ayer 主题的**扁平、克制、纯色**风格
- 去除"AI 生成"的典型标记（渐变、毛玻璃、弹跳动画）
- 保留已有的功能性交互（分类树折叠、标签搜索/排序）
- CSS 体量缩减约 30–40%
