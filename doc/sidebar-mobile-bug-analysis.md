# 移动端侧边栏 Bug 分析报告（已修复 · 已归档）

> **分析日期**: 2026-05-19  
> **修复日期**: 2026-05-19  
> **问题**: 移动端侧边栏半透明效果丢失 & 收起按钮点击后侧边栏不移动  
> **严重程度**: 高 — 影响移动端核心交互  
> **根因归类**: 主题 CSS 编译缺陷（Stylus 解析器边界情况）+ 样式设计冲突  
> **状态**: ✅ 已修复，编译验证通过

---

## 问题描述

1. **Bug A**：移动端侧边栏打开时，背景为不透明纯色，丢失了桌面端的半透明遮罩效果（`rgba(0,0,0,.8)`）。
2. **Bug B**：移动端点击侧边栏收起按钮后，正文部分正常移动，但侧边栏停留在原位（`left: 0`），继续遮挡内容区域。

---

## 根因分析

此 Bug 涉及两个独立但关联的根因，分别位于主题的两个 CSS 源文件中。

### Bug A 根因：layout.styl 移动端覆写了背景色

**文件**: `themes/ayeria/source-src/css/_partial/layout.styl:114`

```stylus
// 桌面端默认
.sidebar
  background-color rgba(0,0,0,.8)   // 半透明黑色遮罩

// 移动端覆写 (line 114)
@media (max-width: 768px)
  .sidebar
    background-color body-color      // body-color = darken(#5c5858, 30%) ≈ #403e3e
```

**机制**: `body-color` 是一个不透明的深色（`#403e3e`），由 `_variables.styl` 中 `body-color = darken(sand-dark, 30%)` 定义。移动端媒体查询直接将其设为侧边栏背景，完全替换了桌面端的半透明 `rgba(0,0,0,.8)`。

**判定**: 此变更是有意为之的设计选择（移动端全屏侧边栏使用不透明背景避免下层内容透视），但副作用是丢失了桌面端的半透明视觉效果。是否为 bug 取决于设计意图，但当前行为与桌面端不一致，且无法通过配置调节。

---

### Bug B 根因：Stylus 编译器无法解析 `-$aside-width` 表达式

**文件**: `themes/ayeria/source/css/ayeria-layout.styl:23,42`

这是本次调查的核心发现。

#### 问题代码

```stylus
$aside-width = convert(hexo-config('layout.sidebar_width'))  // = 8rem

// 第 23 行 — 桌面端基值（非媒体查询内）
.sidebar
  left: -$aside-width    // ← 编译后输出字面量 "-$aside-width"，变量未解析
  width: $aside-width    // ← 编译后正常输出 "8rem"

// 第 42 行 — 移动端
@media (max-width: 768px)
  .sidebar.on
    left: -$aside-width  // ← 同上，编译后输出字面量 "-$aside-width"
```

#### 实际编译产物（`public/css/ayeria-layout.css`）

```css
/* 第 2 行 */
.sidebar {
  left: -$aside-width;   /* ← 无效 CSS！浏览器静默丢弃此声明 */
  width: 8rem;
}

/* 第 22 行 */
@media (max-width: 768px) {
  .sidebar.on {
    left: -$aside-width; /* ← 无效 CSS！浏览器静默丢弃此声明 */
  }
}
```

#### 为什么 Bug B 只在移动端出现？

CSS 的 `left` 属性由两个 CSS 文件共同控制，加载顺序为：

1. `dist/main.css`（Rollup 编译自 `source-src/css/`）
2. `css/ayeria-layout.css`（Hexo Stylus 编译自 `source/css/ayeria-layout.styl`）

**桌面端（生效路径 — 侥幸正常）**：

| 来源 | 规则 | left 值 | 是否生效 |
|------|------|---------|----------|
| main.css | `.sidebar` | `-8rem` | ✅ 生效 |
| main.css | `.sidebar.on` | `0` | ✅ 生效 |
| ayeria-layout.css | `.sidebar` | `-$aside-width` | ❌ 无效 CSS（被忽略） |
| ayeria-layout.css | `.sidebar.on` | `0` | ✅ 与 main.css 一致 |

→ 桌面端**因 main.css 提供有效 fallback 而"侥幸"正常**。

**移动端（失效路径）**：

| 来源 | 规则 | left 值 | 是否生效 |
|------|------|---------|----------|
| main.css | `.sidebar` | `-8rem` | ✅ 但被后续规则覆盖 |
| ayeria-layout.css (mobile MQ) | `.sidebar` | `0` | ✅ **有效 CSS，覆盖 main.css** |
| ayeria-layout.css (mobile MQ) | `.sidebar.on` | `-$aside-width` | ❌ **无效 CSS！本应把侧边栏推到屏幕外** |

→ 在移动端，`.sidebar { left: 0 }` 有效，而 `.sidebar.on { left: -8rem }` 无效。  
→ 侧边栏**永远停留在 `left: 0`**，无论 `.on` 类是否被切换。

#### 为什么 `width: $aside-width` 正常但 `left: -$aside-width` 失败？

这是 **Stylus 0.62.0 解析器的边界情况**。Stylus 允许省略属性值的冒号，因此 `-$aside-width` 在 `left:` 之后存在歧义：

- 预期解析：属性 `left`，值 `-($aside-width)`（取反）
- 实际解析：Stylus 将 `-$aside-width` 识别为一个整体 token（类似属性名 `-webkit-*`），未能将前导 `-` 识别为取反运算符

`width: $aside-width` 不涉及取反，因此正常解析。

> 技术验证：Hexo 项目使用 `hexo-renderer-stylus@3.0.1`，其依赖 `stylus@0.62.0`。

---

## Bug 历史溯源

通过 `git log --follow` 对两个缺陷文件进行逐提交追溯，确定各 Bug 的引入时间点。

### 关键提交链（按时间顺序）

| 提交 | 日期 | 说明 |
|------|------|------|
| `9cca2f2` | 2025-03-20 | 初始提交 "re-ayer-1"，主题名为 Ayer |
| `310ad09` | 2026-04-12 | 按钮样式重构，`layout.styl` 移动端 MQ 未受影响 |
| `e7ca545` | 2026-04-14 | 纯重命名 "Fix: Rename Ayer to Ayeria"，无内容变更 |
| `92eb855` | 2026-04-23 | **创建 `ayeria-layout.styl`** 并加入 CSS 加载链 |

### Bug A 溯源：半透明效果丢失

- **引入提交**：`9cca2f2`（初始提交，2025-03-20）
- **存活时长**：~14 个月（426 天）
- **详情**：`layout.styl` 的移动端媒体查询从主题诞生第一天就写了 `background-color body-color`，`body-color = darken(#5c5858, 30%) ≈ #403e3e`，与桌面端的 `rgba(0,0,0,.8)` 不一致。
- **变更历史**：`310ad09`（按钮重构）和 `e7ca545`（纯重命名）均未触及这行代码。

### Bug B 溯源：侧边栏无法收起

- **引入提交**：`92eb855`（2026-04-23）
- **存活时长**：~26 天
- **详情**：该提交同时完成了三件事，构成完整的缺陷引入链：
  1. **创建** `source/css/ayeria-layout.styl`，其中 `left: -$aside-width`（Stylus 取反解析失败）
  2. **修改** `head.ejs`，新增 `<%- css('css/ayeria-layout') %>`，使其在 `main.css` 之后加载
  3. 该文件的设计意图是用 Hexo Stylus 动态覆盖 `layout.styl` 的硬编码布局值
- **此前无此文件**：`ayeria-layout.styl` 是全新创建，无旧版本可回退。创建即携带 Bug。
- **桌面端为何侥幸**：`main.css`（先加载）中 `left: -8rem` 有效；`ayeria-layout.css`（后加载）中 `left: -$aside-width` 因无效被浏览器丢弃，未覆盖前值。
- **移动端为何暴露**：`ayeria-layout.css` 移动端 MQ 中 `.sidebar { left: 0 }` 有效（覆盖了 `main.css` 的 `-8rem`），但 `.sidebar.on { left: -$aside-width }` 无效，隐藏态无法生效。

---

## 潜在关联 Bug

此根因（Stylus 取反表达式编译失败）还可能引发以下连锁问题：

### 1. 桌面端侧边栏位置依赖隐式 fallback（高风险）

`ayeria-layout.styl:23` 的 `left: -$aside-width` 在桌面端也无效。  
桌面端当前正常是因为 `main.css` 中硬编码了 `left: -8rem`。如果未来 `main.css` 中的 `aside-width` 变量值被修改，或该规则被重构，桌面端侧边栏将**同时出现显示异常**。

### 2. `layout.sidebar_width` 配置变更导致布局错位（中风险）

用户在 `_config.ayeria.yml` 中修改 `layout.sidebar_width` 时：

| 属性 | 是否随配置更新 | 来源 |
|------|---------------|------|
| `width` | ✅ 正确更新 | `ayeria-layout.styl` 的 `width: $aside-width` 正常编译 |
| `left` (隐藏态) | ❌ **不更新** | `ayeria-layout.styl` 的 `left: -$aside-width` 编译失败 |
| `transform: translateX()` | ✅ 正确更新 | `ayeria-layout.styl` 的 `transform: translateX($aside-width)` 正常编译 |

**后果**：如果用户将侧边栏宽度改为 `10rem`：
- 侧边栏宽度变为 `10rem`
- 内容区 `translateX(10rem)` 正常偏移
- 但侧边栏 `left` 偏移量仍通过 main.css 回退为 `-8rem`（配置未生效 + fallback 不变）  
→ **侧边栏有 2rem 始终留在屏幕内，无法完全隐藏**。

### 3. `navbar-toggle` 按钮位置与侧边栏不匹配（低风险）

`ayeria-layout.styl:30` 中 `left: 1.5rem + $aside-width` 正常编译。如果用户修改侧边栏宽度，toggle 按钮位置会更新，但侧边栏 left 偏移不会（因根因 bug），造成按钮与侧边栏位置不同步。

### 4. CSS 双源管理侧边栏样式的架构隐患（中风险）

当前 `.sidebar` 的 `left` 属性同时在两个独立编译的 CSS 文件中定义：
- `main.css`（硬编码 `-8rem`）
- `ayeria-layout.css`（动态变量但编译失败的 `-$aside-width`）

两份样式通过加载顺序隐性协调，缺乏单一事实来源。未来任一文件的修改都可能引入难以排查的样式冲突。

---

## 修复方案

### 立即修复（Bug B — 取反表达式编译失败）

**文件**: `themes/ayeria/source/css/ayeria-layout.styl:23,42`

将取反表达式改为 Stylus 能正确解析的形式：

```stylus
// 方案 A：显式括号（推荐 — 语义最清晰）
left: (-($aside-width))

// 方案 B：乘法计算
left: $aside-width * -1

// 方案 C：加空格分隔（可能仍不稳定）
left: - ($aside-width)
```

具体修改：

```diff
 .sidebar
-  left: -$aside-width
+  left: 0 - $aside-width
   width: $aside-width
   &.on
     left: 0
```

```diff
 @media (max-width: 768px)
   .sidebar
     left: 0
     &.on
-      left: -$aside-width
+      left: 0 - $aside-width
```

### Bug A 修复（半透明效果丢失）

**文件**: `themes/ayeria/source-src/css/_partial/layout.styl:114`

如果移动端也需半透明效果：

```diff
 @media (max-width: 768px)
   .sidebar
-    background-color body-color
+    background-color rgba(0,0,0,.8)
```

如果希望该行为可配置，建议在 `_config.ayeria.yml` 中新增配置项并通过 `hexo-config()` 在 `ayeria-layout.styl` 中引用。

### 架构改进建议

1. **统一侧边栏样式源**：将侧边栏的布局属性（`left`、`width`、`transform`）全部收归 `ayeria-layout.styl` 管理，删除 `layout.styl` 中对侧边栏 `left` 的硬编码定义，消除双源冲突。
2. **为 `ayeria-layout.styl` 增加编译校验**：在 CI 流程中增加对编译产物的检查，确保 Stylus 变量全部正确解析，无残留变量名。
3. **`.anim` 类管理**：考虑在侧边栏动画结束后移除 `.anim` 类，避免永久挂载的 `transition: all` 影响侧边栏内子元素的意外过渡。

---

## 影响范围

| 影响 | 范围 |
|------|------|
| 移动端侧边栏无法隐藏 | 所有移动端访问（≤768px 视口宽度） |
| 移动端侧边栏无半透明效果 | 所有移动端访问 |
| 桌面端侧边栏位置（当前正常但脆弱） | 桌面端 ≥768px |
| 配置 `sidebar_width` 变更后布局错位 | 修改过 `_config.ayeria.yml` 中 `layout.sidebar_width` 的用户 |

---

## 相关文件清单

| 文件 | 角色 |
|------|------|
| `themes/ayeria/source/css/ayeria-layout.styl` | **核心缺陷所在** — Stylus 变量取反编译失败 |
| `themes/ayeria/source-src/css/_partial/layout.styl` | 移动端背景色覆写 + 桌面端侧边栏基值（fallback） |
| `themes/ayeria/source-src/css/_variables.styl` | `aside-width`、`body-color` 变量定义 |
| `themes/ayeria/source-src/js/ayeria.js` | 侧边栏 toggle 逻辑（经确认正常） |
| `themes/ayeria/source/dist/main.css` | Rollup 编译产物（含硬编码 fallback） |
| `public/css/ayeria-layout.css` | Hexo Stylus 编译产物（含未解析的变量名） |
| `themes/ayeria/layout/_partial/head.ejs` | CSS 加载顺序定义 |
| `themes/ayeria/layout/layout.ejs` | `.content.on` / `.sidebar.on` 初始状态定义 |
| `_config.ayeria.yml` | `layout.sidebar_width` 配置项 |

---

## 修复记录

**修复日期**: 2026-05-19  
**修复人**: Claude Code (Co-Authored-By)  
**验证方式**: Rollup 构建 + Hexo 生成后检查编译产物

### Bug B 修复（核心缺陷）

**文件**: `themes/ayeria/source/css/ayeria-layout.styl:23,42`

**方式**: 将 `left: -$aside-width` → `left: 0 - $aside-width`

选用减法表达式 (`0 - $var`) 而非括号 `(-($var))` 或乘法 `($var * -1)`，原因：
- 语义清晰：`0 - x` 即 `-x`，无需 Stylus 特有语法
- 解析稳定：不依赖 Stylus 对前导 `-` 后紧跟 `$` 的歧义消除行为
- 业界通用：CSS 预处理器中 `0 - $var` 是生成负值的惯用写法

**验证结果**: `public/css/ayeria-layout.css` 
```
/* 修复前 */  left: -$aside-width;   /* 无效 CSS */
/* 修复后 */  left: -8rem;            /* 正确解析 */
```

移动端 MQ 中 `.sidebar.on { left: -8rem }` 同期修复，侧边栏可正常隐藏。

### Bug A 修复（视觉一致性）

**文件**: `themes/ayeria/source-src/css/_partial/layout.styl:113-114`

**初版修复**: 将移动端 MQ 中 `background-color body-color` → `background-color rgba(0,0,0,.8)`

**终版修复**: 直接删除移动端 MQ 中的 `.sidebar` 块（两行），原因：
- 基类规则 `.sidebar { background-color: rgba(0,0,0,.8) }`（同文件第 42 行）已覆盖桌面端和移动端
- 移动端 MQ 覆写的唯一理由是提供与桌面端**不同**的值；既然现在要求一致，覆写即冗余
- 删除后基类规则成为单一真相来源，遵守 DRY 原则

**删除位置注释**: 说明了旧实现 `body-color` 的设计意图——移动端全屏侧边栏使用不透明底色遮挡下层内容，营造原生 App 抽屉面板体验。移除理由：该行为与桌面端半透明遮罩不一致且不可配置。

**验证结果**: `public/dist/main.css` 中 `.sidebar` 背景色仅存一处定义：
```css
.sidebar{...background-color:rgba(0,0,0,.8)}  /* 基类规则，桌面端/移动端共用 */
```
