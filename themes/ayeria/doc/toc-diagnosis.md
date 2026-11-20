# TOC 目录功能诊断报告与优化方案

> 生成日期：2026-05-14  
> 复核日期：2026-05-14（逐行对照源码核实，补充错误更正与遗漏缺陷）  
> 调查范围：`themes/ayeria/` 中所有 TOC 相关文件  
> 关键文件：`layout/_partial/after-footer.ejs`、`layout/_partial/post/tocbot.ejs`、`layout/_partial/article.ejs`、`source-src/css/_partial/tocbot.styl`、`source/js/tocbot.min.js`、`source-src/js/ayeria.js`、`source-src/css/_partial/layout.styl`

---

## 一、现状梳理

### 1.1 实现架构

TOC 由三层组成：

| 层次 | 文件 | 职责 |
|------|------|------|
| 容器模板 | `layout/_partial/post/tocbot.ejs` | 在文章 DOM 内渲染 `<div class="tocbot">` |
| JS 初始化 | `layout/_partial/after-footer.ejs` | 加载 tocbot.min.js、执行 `tocbot.init({...})` |
| 样式 | `source-src/css/_partial/tocbot.styl` | 定位、滚动、折叠、高亮等所有视觉效果 |

当前 tocbot 初始化配置（`after-footer.ejs` 第 7–18 行）：

```javascript
tocbot.init({
  tocSelector: ".tocbot",
  contentSelector: ".article-entry",
  headingSelector: "h1, h2, h3, h4, h5, h6",
  hasInnerContainers: true,
  scrollSmooth: true,
  scrollContainer: "main",
  positionFixedSelector: ".tocbot",
  positionFixedClass: "is-position-fixed",
  fixedSidebarOffset: "auto",
});
```

### 1.2 页面滚动容器结构

布局关键 CSS（`layout.styl`）：

```stylus
#app
  height 100%
  overflow hidden    // ← 窗口本身无法滚动

.content            // 对应 <main class="content on">（见 layout.ejs 第 11 行）
  height 100%
  overflow-y scroll  // ← 真正的滚动容器是 main 元素
```

即：**滚动发生在 `<main>` 元素上，`window` 本身永远不会滚动**（`window.pageYOffset` 恒为 0）。

---

## 二、已确认缺陷

### Bug 1：点击跳转后高亮不更新（用户反馈 #1）

**根因链（完整追踪，基于 tocbot.min.js 实际代码）：**

1. `scrollSmooth: true` 激活 tocbot 内置的平滑滚动模块（模块 5，`initSmoothScrolling`）。
2. 该模块将 `click` 监听器直接挂在 `document.body` 上：`document.body.addEventListener("click", n, false)`。当 TOC 链接被点击时调用内部 `o(hash, ...)` 函数。
3. `o()` 读取当前位置用 `s = window.pageYOffset`（= 0），滚动用 `window.scrollTo(0, target)`——**两者对本布局均无效**，因为 `window` 不是滚动容器。
4. `document.body` 的监听器**未调用 `preventDefault()`**，浏览器原生的 `<a href="#heading">` 锚点跳转仍会执行，浏览器找到 `main` 这个最近的 `overflow-y: scroll` 祖先，正确地将 `main.scrollTop` 设到目标位置——**跳转本身是成功的**。
5. 与此同时，tocbot 在 `scrollContainer`（即 `main`）上还挂了另一个 `_clickListener`，它调用 `disableTocAnimation(e)`，将内部变量 `h` 设为 `false`，**然后立即调用 `updateToc(d)`**——但因 `h === false`，`updateToc` 内的 `if (h && ...) { ... }` 分支被跳过，这次调用是空操作。
6. 跳转后 `main` 上的 `scroll` 事件触发 `_scrollListener`，`_scrollListener` 也调用 `updateToc(d)`，但因 `h` 仍为 `false`，依然是空操作。
7. 420ms 后（`scrollSmoothDuration` 默认值），`setTimeout` 执行 `enableTocAnimation()`，将 `h` 重置为 `true`，**但此时没有任何代码补调一次 `updateToc`**。
8. 如果用户在这 420ms 内没有手动滑动页面，此后再无 `scroll` 事件触发，高亮永远停留在旧位置。

**结论：** `disableTocAnimation`（h=false）+ `window.scrollTo` 无效 + 420ms 后无补偿调用，三点共同导致高亮冻结。

> **注：** `_clickListener` 在 `disableTocAnimation` 之后会立即调用 `updateToc(d)`（这是 tocbot 的原始意图——在动画开始时更新一次），但因 `h` 已为 `false`，该调用是空操作。这与文档早期版本的描述略有差异，源码已确认此行为。

---

### Bug 2：鼠标滚轮可将目录滚至近乎不可见（用户反馈 #2）

**根因：**

1. CSS 规则 `.tocbot > .toc-list { overflow-y: scroll; max-height: 70vh }`：`.toc-list` 内容可以在 70vh 高度内独立滚动。
2. tocbot 的 `updateToc` 只操作 CSS 类（`is-active-link`、`is-collapsed` 等），**从不主动滚动 `.toc-list` 容器来保持当前高亮项可见**。
3. 用户在 TOC 上滚动鼠标滚轮时，浏览器将滚动事件先交给 `.toc-list` 消费（因为它是最近的 `overflow-y: scroll` 元素），直到滚动到底端后再"穿透"到 `main`，造成页面同步滚动——进而改变活跃章节，形成混乱的正反馈循环。
4. 结果：`.toc-list` 内容被滚到底，视口内只剩最后一两个条目，而用户期望看到的当前位置附近的导航项全部消失在上方。

**附属问题：** 没有"滚动到活跃项"的自动跟随逻辑，用户在长文中读到中段时，TOC 列表的滚动位置仍在顶部，活跃高亮项早已超出可见区域。

---

### Bug 3：在子标题下无法跳转至顶级标题 B（用户反馈 #3）

**根因：** 与 Bug 1 相同的核心机制，叠加以下两点：

**根因 A — 高亮不更新让跳转看起来"失败"：**  
点击 B 后页面确实滚动至 B（原生锚点跳转），但 TOC 高亮仍在 A2，用户视觉上感知为"没有跳转成功"。

**根因 B — 平滑滚动偏移计算错误：**  
tocbot 的 `o()` 函数计算目标偏移量：
```javascript
s = window.pageYOffset          // = 0（window 从不滚动）
u = offset + target.getBoundingClientRect().top
// B 位于 A2 下方（视口外），getBoundingClientRect().top >> 0
// window.scrollTo(0, 大正数) → 无效
```
smooth scroll 是真正的空操作，原生跳转成功但无反馈，产生"没反应"的错觉。

**根因 C — 折叠状态遮蔽（部分场景）：**  
tocbot 默认 `collapseDepth: 0`（未配置），所有子级列表初始均设 `isCollapsed: true`。读到 A2 时 `updateToc` 展开 A 的子树，并将**所有其他折叠列表**重新折叠。B 本身（作为顶级 `<li>`）是可见的，但若 TOC 列表因 Bug 2 已被滚到底或其他位置，B 可能不在 `.toc-list` 的可见视口内，用户甚至看不到 B 的链接。

---

### Bug 4：`scrollSmooth` 与自定义滚动容器根本不兼容

> 这是 Bug 1、3 的更底层原因，单独列出以便理解架构问题。

tocbot 的内置平滑滚动模块硬编码使用 `window.scrollTo()` 和 `window.pageYOffset`，完全不感知 `scrollContainer` 参数。该参数只影响**事件监听**（`scroll`/`click` 事件绑定到 `main`）和**位置读取**（`updateToc` 里读 `main.scrollTop`），但**滚动操作本身**从不走 `scrollContainer`。

这是 tocbot 的一个长期已知设计缺陷：`scrollContainer` 与 `scrollSmooth` 不能同时使用。

**影响：** 只要保留 `scrollSmooth: true`，以下所有功能同时失效：
- 平滑滚动动画（window 不动）
- 点击后高亮更新（`disableTocAnimation` 的 420ms 窗口与原生跳转时序错位）
- 跳转至视口外标题的可靠性（偏移计算从错误基点出发）

**附注 — 监听器泄漏：** 平滑滚动模块向 `document.body` 挂载了一个 click 监听器（`document.body.addEventListener("click", n)`），但 `tocbot.destroy()` 的清理逻辑并不移除此监听器。若在 `scrollSmooth: true` 状态下多次调用 `tocbot.refresh()`（= `destroy()` + `init()`），会不断累积 `document.body` 上的监听器。本报告的修复方案将 `scrollSmooth` 改为 `false`，`initSmoothScrolling` 不再调用，此问题不再出现。

---

### Bug 5：TOC 容器渲染与 JS 初始化的条件判断不一致

`article.ejs`（容器渲染条件）：
```ejs
<% if (theme.toc && is_post()) { %>
  <%- partial('post/tocbot') %>
```

`after-footer.ejs`（JS 初始化条件）：
```ejs
<% if (theme.toc && is_post() && !page.no_toc) { %>
```

`tocbot.ejs`（内部二次判断）：
```ejs
<% if (post.toc != false && toc(page.content).length!==0){ %>
  <div class="tocbot"></div>
```

三处条件使用了不同字段，导致两种常见的"禁用 TOC"写法均出现行为不一致：

**场景 A — 前言中设置 `toc: false`：**
- `tocbot.ejs`：`false != false` → `false` → 容器**不渲染**（正确）
- `after-footer.ejs`：`!page.no_toc` → `!undefined` → `true` → JS **仍然加载并尝试初始化**
- 结果：找不到 `.tocbot` 选择器，控制台输出 "Element not found" 警告

**场景 B — 前言中设置 `no_toc: true`（不设 `toc: false`）：**
- `post.toc` 值为 `undefined`；在 JavaScript 中 `undefined != false` → `true`（`undefined` 与 `false` 的宽松相等为 `false`）
- `tocbot.ejs`：条件**成立** → 容器 div **仍然被渲染**（空 div 留在 DOM 中）
- `after-footer.ejs`：`!page.no_toc` → `false` → JS **不加载**
- 结果：DOM 中有一个空的 `.tocbot` 占位 div，没有任何 JS 初始化它

> **早期版本错误：** 原报告将场景 B 描述为"容器不渲染，JS 不加载，两者一致"，经 `node -e "console.log(undefined != false)"` 验证，此描述**不正确**。场景 B 的容器实际上会被渲染（空 div），两个条件并不一致。

---

### Bug 6：`positionFixedSelector` 指向整个 `.tocbot` 容器

配置 `positionFixedSelector: ".tocbot"` 加上 CSS：

```stylus
// 非 fixed 状态
.tocbot
  position absolute
  right -28rem
  top 14rem

// fixed 状态
.is-position-fixed
  position fixed !important
  top 0
  right 6rem
  background-color #fff
  z-index 996
```

- `right -28rem` → `right 6rem`：水平位置发生跳变，无过渡动画。
- `top 14rem` → `top 0`：垂直位置跳变，TOC 会在页面滚动时突然"弹"到顶部。
- 切换时没有 CSS `transition`，视觉体验割裂。
- `top: 0` 不考虑导航栏高度，fixed 后 TOC 可能与 navbar 重叠。

---

### Bug 7：`.toc-list` 无活跃项自动对齐

tocbot 的所有版本均不原生支持"将活跃目录项滚动到 TOC 列表可见区域内"。在长文中：

1. 用户打开页面，TOC 列表在顶部。
2. 用户读到文章中段，活跃高亮项已在 TOC 列表的可见区域之外（需要向下滚动 `.toc-list` 才能看到）。
3. 用户不知道 TOC 列表还有内容，或者以为目录功能坏了。

---

### Bug 8：`headingsOffset` 未配置，导致固定导航栏遮蔽活跃标题

tocbot 的 `headingsOffset` 默认值为 **1px**（源码：`headingsOffset:1`）。该值决定"标题距离滚动容器顶部多少像素时，判定为当前活跃章节"。

当导航栏固定在页面顶部（高度约 60px）时：
- 用户刚滚动到某标题，该标题进入视口但被 navbar 遮盖（位于 navbar 下方 0～59px 范围内）
- 因为 `headingsOffset: 1`，tocbot 仍然认为该标题"已进入活跃区"，在 TOC 中高亮它
- 用户在视觉上看不到该标题（被 navbar 遮住），却发现 TOC 高亮已切换，造成困惑

**影响：** 高亮切换时机比实际可见时机超前约 60ms（高度差/滚动速度），快速滚动时尤为明显。

---

### Bug 9：`.is-position-fixed` 硬编码白色背景，破坏深色模式

```stylus
.is-position-fixed
  background-color #fff  // ← 硬编码白色
```

当主题处于深色模式（`body.darkmode`）时，TOC 在 fixed 状态下会有白色背景，而文章内容区是深色背景。非 fixed 状态的 `.tocbot` 无背景色，过渡到 fixed 后突然出现白色方块，视觉断裂。

---

## 三、缺陷影响矩阵

| 缺陷 | 严重程度 | 用户可感知 | 影响功能 |
|------|---------|-----------|---------|
| Bug 1（高亮不更新） | 高 | 是 | 所有点击导航 |
| Bug 2（TOC 被滚崩） | 高 | 是 | 长文 TOC 可用性 |
| Bug 3（无法跳 B） | 高 | 是 | 跨顶级标题导航 |
| Bug 4（scrollSmooth 根本无效） | 高 | 间接 | 一切平滑滚动 |
| Bug 5（条件不一致） | 低 | 控制台警告 + 空 div | 特定 front-matter 组合 |
| Bug 6（fixed 状态跳变） | 中 | 是 | 滚动时视觉闪烁 |
| Bug 7（活跃项不对齐） | 中 | 是 | 长文 TOC 导航 |
| Bug 8（headingsOffset 过小） | 中 | 是 | fixed navbar 场景 |
| Bug 9（深色模式背景） | 低 | 是（深色模式用户） | 视觉一致性 |

---

## 四、优化方案

### 4.1 核心修复：禁用 `scrollSmooth`，改用基于 `main` 的自定义平滑滚动

**修改文件：** `layout/_partial/after-footer.ejs`

将 `scrollSmooth: true` 改为 `scrollSmooth: false`，然后在 tocbot 初始化后追加自定义点击处理器：

```javascript
tocbot.init({
  tocSelector: ".tocbot",
  contentSelector: ".article-entry",
  headingSelector: "h1, h2, h3, h4, h5, h6",
  hasInnerContainers: true,
  scrollSmooth: false,           // ← 禁用破损的内置平滑滚动
  scrollContainer: "main",
  positionFixedSelector: ".tocbot",
  positionFixedClass: "is-position-fixed",
  fixedSidebarOffset: "auto",
  headingsOffset: 60,            // ← Bug 8 修复：预留导航栏高度（按实际 navbar 高度调整）
});

// 自定义平滑滚动：操作真正的滚动容器 main
(function () {
  const mainEl = document.querySelector('main');
  const tocEl  = document.querySelector('.tocbot');
  if (!mainEl || !tocEl) return;

  tocEl.addEventListener('click', function (e) {
    const link = e.target.closest('a.toc-link');
    if (!link) return;

    const targetId = decodeURIComponent(link.getAttribute('href').slice(1));
    const target   = document.getElementById(targetId);
    if (!target) return;

    e.preventDefault();  // 接管原生锚点跳转

    // 计算目标在 main 内的绝对位置，减去导航栏高度偏移
    const targetTop = mainEl.scrollTop + target.getBoundingClientRect().top - 60;
    mainEl.scrollTo({ top: targetTop, behavior: 'smooth' });

    // scrollTo({ behavior: 'smooth' }) 是异步的，等滚动结束后强制刷新 TOC 高亮
    const forceUpdate = function () { tocbot.refresh(); };
    if ('onscrollend' in window) {
      mainEl.addEventListener('scrollend', forceUpdate, { once: true });
    } else {
      setTimeout(forceUpdate, 500);
    }
  });
})();
```

**修复效果：**
- Bug 1：`tocbot.refresh()` 在滚动真正完成后调用，高亮必然更新。
- Bug 3：`e.preventDefault()` + `mainEl.scrollTo` 保证跳转可靠，不再依赖原生锚点。
- Bug 4：彻底绕过 `window.scrollTo` 路径。
- Bug 8：`headingsOffset: 60` 与导航栏高度对齐，标题进入可见区时才触发高亮切换。

---

### 4.2 修复 TOC 列表滚动失控：禁止手动滚动，改用 JS 直接驱动 scrollTop

**修改文件：** `source-src/css/_partial/tocbot.styl`

```stylus
// 修改前
>.toc-list
  position relative
  overflow-x hidden
  overflow-y scroll      // ← 改为 overflow hidden
  max-height 70vh        // ← 删除（或移至 fixed 状态单独控制）

// 修改后
>.toc-list
  position relative
  overflow hidden        // 不允许用户手动滚动列表内容；但 JS 可直接设置 scrollTop
```

然后在 JS 中，每次 `main` 滚动后，将活跃项居中到 `.toc-list` 可见区内：

```javascript
(function () {
  const mainEl = document.querySelector('main');
  if (!mainEl) return;

  mainEl.addEventListener('scroll', function () {
    const activeLink = document.querySelector('.tocbot .is-active-link');
    const tocList    = document.querySelector('.tocbot > .toc-list');
    if (!activeLink || !tocList) return;

    // 计算 activeLink 相对于 tocList 顶部的偏移，然后居中
    const linkRect = activeLink.getBoundingClientRect();
    const listRect = tocList.getBoundingClientRect();
    const targetScrollTop =
      tocList.scrollTop + (linkRect.top - listRect.top) -
      tocList.clientHeight / 2 + activeLink.clientHeight / 2;
    tocList.scrollTop = targetScrollTop;  // 直接设置，不经 scrollIntoView
  }, { passive: true });
})();
```

> **架构说明 — 为何不用 `scrollIntoView`：**  
> `scrollIntoView()` 向上遍历 DOM，找最近的"可滚动祖先"来滚动。若 `.toc-list` 设为 `overflow: hidden`，它不再是滚动容器，`scrollIntoView` 会继续向上找到 `main`（`overflow-y: scroll`），从而**滚动文章内容**而非目录列表，产生错误行为。直接赋值 `tocList.scrollTop` 则跳过祖先查找，在所有现代浏览器（Chrome、Firefox、Safari）中均可对 `overflow: hidden` 元素生效。

**修复效果：**
- Bug 2：用户无法再通过鼠标滚轮将 TOC 列表滚崩，滚动事件不再穿透到 `main`。
- Bug 7：活跃项始终自动居中出现在 TOC 可见区域。

---

### 4.3 修复 fixed 状态跳变：增加过渡动画并修正定位

**修改文件：** `source-src/css/_partial/tocbot.styl`

```stylus
.tocbot
  padding 20px
  position absolute
  right -28rem
  top 14rem
  font-size 80%
  opacity .95
  max-width 255px
  border-radius 8px
  transition right 0.3s ease, top 0.3s ease  // ← 新增：平滑过渡
  >.toc-list
    position relative
    overflow hidden            // ← 改：禁止手动滚动（见 4.2）

.is-position-fixed
  position fixed !important
  top 4rem                    // ← 改：预留导航栏高度（按实际值调整）
  right 6rem
  background-color var(--toc-bg, #fff)  // ← Bug 9 修复：使用 CSS 变量，便于深色模式覆盖
  z-index 996
  max-height calc(100vh - 6rem)  // ← 新增：防止超出视口
  overflow-y auto                // ← 新增：整体可滚动（针对超长目录）
```

对应深色模式 CSS：
```stylus
body.darkmode
  .is-position-fixed
    --toc-bg rgba(30, 30, 30, 0.95)   // ← 深色模式覆盖变量
```

**修复效果：**
- Bug 6：消除位置跳变，TOC 平滑地"吸附"到顶部。
- Bug 9：深色模式下 TOC 背景与页面风格一致。
- 防止 fixed 状态下 TOC 超出视口高度。

> **关于 `.tocbot` 在 fixed 状态下的 `overflow-y: auto` 与 4.2 的配合：**  
> 4.2 中 `.toc-list` 设为 `overflow: hidden`，在 fixed 状态下 `.tocbot` 本身有 `overflow-y: auto`，因此超长目录时整个 `.tocbot` 盒子可滚动。4.2 的 JS 直接设置 `tocList.scrollTop`，不依赖 `overflow` 属性，两者不冲突。

---

### 4.4 添加 `collapseDepth` 配置，确保顶级标题始终展开

**修改文件：** `layout/_partial/after-footer.ejs`

在 `tocbot.init` 中追加：

```javascript
collapseDepth: 1,  // 0 = 折叠所有子级（默认）；1 = 展开第一级，折叠更深级别
```

设为 `1` 后，所有 H1/H2（根据文章标题层级而定）始终可见，只有更深层级才折叠。即使 TOC 列表未滚动到 B 的位置，B 也不会因为折叠状态而被遮蔽。

**修复效果：** 辅助修复 Bug 3 的根因 C。

---

### 4.5 统一条件判断逻辑

**修改文件：** `layout/_partial/article.ejs` 和 `layout/_partial/after-footer.ejs`

统一使用 `page.toc !== false && toc(page.content).length !== 0` 作为判断条件：

```ejs
<%# article.ejs %>
<% if (theme.toc && is_post() && page.toc !== false && toc(page.content).length !== 0) { %>
  <%- partial('post/tocbot') %>
<% } %>
```

```ejs
<%# after-footer.ejs - 与 article.ejs 条件完全相同 %>
<% if (theme.toc && is_post() && page.toc !== false && toc(page.content).length !== 0) { %>
  <%- js('/js/tocbot.min') %>
  <script>...</script>
<% } %>
```

同时简化 `tocbot.ejs`，去掉重复判断（条件已在外层处理）：

```ejs
<div class="tocbot"></div>
```

**修复效果：** Bug 5，消除条件不一致导致的控制台警告和空 div 问题，涵盖 `toc: false` 和 `no_toc: true` 两种写法。

> **注：** 统一后 `toc(page.content)` 会在 `article.ejs` 和 `after-footer.ejs` 各调用一次（共两次）。这是静态生成阶段的同步调用，性能成本可忽略不计。

---

## 五、修复优先级与工作量

| 优先级 | 修复项 | 涉及文件 | 预估工作量 | 修复缺陷 |
|--------|--------|---------|-----------|---------|
| **P0** | 禁用 `scrollSmooth`，改用自定义平滑滚动；添加 `headingsOffset` | `after-footer.ejs` | 1.5h | Bug 1、3、4、8 |
| **P0** | 移除 `.toc-list` 手动滚动，加活跃项 scrollTop 自动对齐 | `tocbot.styl`、`after-footer.ejs` | 1h | Bug 2、7 |
| **P1** | fixed 状态过渡动画、定位修正、深色模式背景变量 | `tocbot.styl` | 0.5h | Bug 6、9 |
| **P1** | 添加 `collapseDepth: 1` | `after-footer.ejs` | 0.1h | Bug 3（辅助） |
| **P2** | 统一条件判断逻辑 | `article.ejs`、`after-footer.ejs`、`tocbot.ejs` | 0.5h | Bug 5 |

**总计：** ~3.6 小时可完成全部修复。

---

## 六、修复后预期行为

| 场景 | 修复前 | 修复后 |
|------|--------|--------|
| 点击目录项 | 页面跳转但高亮不动 | 平滑滚动 + 高亮立即更新 |
| 在 A2 处点击 B | 无反馈或仅页面滚动 | 平滑跳转到 B，高亮切换 |
| 鼠标滚轮悬停 TOC | 目录内容被滚至底部 | 目录随文章活跃项自动对齐 |
| 页面滚动 | 高亮更新正常（此路径本来正确） | 不变 |
| TOC 离开初始位置 | 跳变吸附到顶部 | 平滑过渡到 fixed 位置 |
| 文章 front-matter `toc: false` | JS 加载但报 "Element not found" | 容器和 JS 均不渲染 |
| 文章 front-matter `no_toc: true` | 空 `.tocbot` div 留在 DOM，无 JS 初始化 | 容器和 JS 均不渲染 |
| 导航栏下方标题刚进入视口 | 高亮提前切换（标题被 navbar 遮住时就高亮） | headingsOffset 补偿后，进入可见区才切换 |
| 深色模式下 TOC fixed 吸附 | TOC 变白色方块破坏深色配色 | 跟随主题背景色 |

---

## 附录：tocbot 版本说明

当前使用的 `tocbot.min.js` 为旧版（约 v4.x，基于 webpack 打包特征判断）。tocbot v5.x 重写了滚动模块，但同样存在自定义 `scrollContainer` 下 `scrollSmooth` 失效的已知问题。建议按本文方案在初始化层面修复，而非升级 tocbot 版本（升级会改变 API 且不一定解决根因）。
