# 分享组件改进方案（第二版）

> 文档日期：2026-05-13  
> 前置文档：`archive/about-social-links-bug-analysis.md`（指针事件 Bug 的修复记录）  
> 范围：分享组件的视觉重设计与交互行为统一

---

## 一、设计体系定位

### 1.1 本站双层美学

本站存在两套并行的审美标准，各自完整，不应混用：

**内容层**（文章正文、阅读区域）  
书斋式克制。衬线字体、充足行距、无装饰边框、颜色仅作语义区分（链接色、代码高亮）。可读性第一，任何视觉元素都不能干扰阅读。

**功能层**（边栏、搜索弹窗、打赏弹窗、导航栏）  
现代克制。`backdrop-filter: blur`、薄边框、CSS 自定义属性管理明暗两套色值、`border-radius: 12px`、`box-shadow` 提供深度感。动效存在但轻盈，不强调自身。

### 1.2 分享组件的现状

分享组件游离于两层之外，呈现第三种风格：**遗留网页风格**。

具体表现：
- 触发器是带 Remix Icon 图标的裸文字链接，没有任何容器、边框、或背景
- 下拉气泡是扁平白卡，图标在 hover 前完全灰色，hover 后直接跳变到饱和品牌色
- 微信弹窗仅有裸 `<p>` 文字和裸 `<img>`，没有任何结构层次

从视觉语气看，它更像 2010 年代初"分享到 XX"插件的默认样式，与打赏弹窗、搜索弹窗的质感差距超过 10 年。

### 1.3 改进目标

**将分享组件纳入功能层**，视觉语言对齐打赏弹窗（`reward.styl` 是参照基准）：

| 属性 | 打赏弹窗（基准） | 分享组件（目标） |
|------|-----------------|-----------------|
| 背景 | `backdrop-filter: blur(16px)` + 半透明色 | 同 |
| 圆角 | `12px` | `12px`（弹窗）/ `8px`（气泡） |
| 边框 | `1px solid var(--*-border)` | 同 |
| 阴影 | `0 6px 24px rgba(0,0,0,0.09)` | 同量级 |
| 明暗切换 | CSS 自定义属性 | 已有，继续维护 |
| 入场动画 | `opacity + transform scale` | 同 |
| 图标色 | 墨色静态，hover 显品牌色 | 已有，保持 |
| 关闭交互 | 轻忽略（点击遮罩或外部区域） | 见第三节 |

---

## 二、诊断

### 2.1 视觉问题

#### 触发器
裸文字链接，无视觉容器。用户无法直观感知这是一个可以展开的控件。对比打赏触发器的 pill button（`backdrop-filter` + `border-radius: 19px` + `box-shadow`），分享触发器显得单薄。

#### 下拉气泡（`.share-wrap`）
品牌色直接跳变（`color: weibo-color`）属于拟物时代的设计语言，过于强调平台品牌。功能层的图标应以单色为主，通过 hover 时的色调变化（而非全饱和品牌色）暗示可操作性。打赏弹窗内完全没有彩色——用 elevation（阴影深度）而非颜色区分状态。

当前气泡的品牌色 hover 已经是"仅 hover 才出现"的模式（`--share-icon-color` 平时是中性灰），这一点方向正确，但饱和度仍然过高。

#### 微信二维码弹窗（`.wx-share-modal`）
结构扁平，没有与打赏弹窗对等的层次：

```
当前结构                    打赏弹窗结构（参照）
─────────────────────       ─────────────────────
裸 <a.modal-close>          div.reward-close（30px 圆形按钮）
裸 <p>（无类名）            p.reward-wording（14px，subtext 色）
裸 <img>                    div.reward-qrcode-wrap（白色衬底框）
                              img.reward-qrcode
```

> **注**：`api.qrserver.com` 返回的 QR 图片自带白色背景，深色模式下可扫性无问题。P0 不成立，白色衬底包装框属于结构对齐改进，而非可用性修复。

### 2.2 JS 架构问题

当前分享逻辑分散在两个文件：

| 文件 | 负责的分享行为 |
|------|--------------|
| `ayeria.js` | `.share-outer` 点击 → `.share-wrap` fadeToggle |
| `share.js` | 图标点击 → 跳转链接 / 微信弹窗 |

这一分裂导致**轻忽略（light dismiss）**无法在一处统一实现：关闭气泡的逻辑和关闭弹窗的逻辑分属两个文件，任何涉及"点击外部区域关闭"的需求都要横跨两处修改。

### 2.3 交互问题（当前实际状态）

| 控件 | 关闭方式 | 问题 |
|------|----------|------|
| 下拉气泡 `.share-wrap` | 仅再次点击触发器按钮 | 无点击外部关闭；用户直觉是点击页面任意处可关闭 |
| 微信弹窗 `.wx-share-modal` | 仅点击 ✕ 按钮 | `#share-mask` 点击已绑定关闭函数，但遮罩无入场动画，体验割裂 |

---

## 三、改进方案

方案按**架构先行**的顺序组织：先统一 JS 责任，再做视觉升级，每一步都以上一步为前提。

### 3.1 JS 整合（前提）

将所有分享交互迁移到 `share.js`，`ayeria.js` 中删除气泡 toggle 逻辑。

**`ayeria.js` 中删除**：
```javascript
// 删除以下行（当前在 ayeria.js 中）：
$(".share-outer").on("click", () => $(".share-wrap").fadeToggle())
```

**`share.js` 中新增气泡控制 + 统一 light dismiss**：
```javascript
// ── 气泡开关 ──────────────────────────────────────────────────────────
function toggleDropdown() {
  const wrap = document.querySelector('.share-wrap');
  const isOpen = wrap.classList.contains('open');
  isOpen ? closeDropdown() : openDropdown();
}

function openDropdown() {
  document.querySelector('.share-wrap').classList.add('open');
}

function closeDropdown() {
  document.querySelector('.share-wrap').classList.remove('open');
}

// ── 气泡 light dismiss ─────────────────────────────────────────────────
// 冒泡顺序：.share-outer click → toggleDropdown → 气泡展开
// → 同一事件继续冒泡至 document → closest('.share-btn') 命中 → 不关闭
// 下一次点击页面其他位置：document click → closest 未命中 → 关闭
document.addEventListener('click', (e) => {
  if (!e.target.closest('.share-btn')) {
    closeDropdown();
  }
});

// ── 微信弹窗 light dismiss ─────────────────────────────────────────────
// #share-mask 覆盖全视口（z-index 999），点击弹窗之外的区域命中遮罩
// 弹窗自身 z-index 9999，点击弹窗本身不会穿透到遮罩
document.querySelector('#share-mask').addEventListener('click', hideWX);

// ── 触发器绑定 ──────────────────────────────────────────────────────────
const shareOuter = document.querySelector('.share-outer');
if (shareOuter) shareOuter.addEventListener('click', (e) => {
  e.stopPropagation(); // 防止同一 click 触发 document light-dismiss
  toggleDropdown();
});
```

> **为何对 `.share-outer` 用 `stopPropagation`**：  
> 不阻止冒泡时，`toggleDropdown` 展开气泡，紧接着 document handler 检测到点击不在 `.share-btn` 上（因为 `.share-outer` 的 `closest('.share-btn')` 实际上*能*命中——它在 `.share-btn` 内部，所以其实无需 stopPropagation）。  
> 实际上 `.share-outer` 是 `.share-btn` 的子元素，`closest('.share-btn')` 可以命中，document handler 不会关闭气泡。如果实际测试发现冒泡顺序有问题再加 `stopPropagation`。

**CSS：`.share-wrap` 改用类名控制替代 jQuery fadeToggle**

```stylus
.share-wrap
  // … 现有属性（定位、背景、边框等）…
  display block          // 改：始终 display:block，靠 opacity+pointer-events 控隐
  opacity 0
  pointer-events none
  transform translateY(-4px)
  transition opacity 0.2s ease, transform 0.2s ease

  &.open
    opacity 1
    pointer-events auto
    transform translateY(0)
```

这样去掉了 jQuery `fadeToggle()`，气泡入场有平滑动画，与搜索/打赏弹窗的动效语气一致。

### 3.2 状态机简化（`.wx-share-modal`）

`.ready`/`.in` 两个类名是历史遗留，`.ready` 当时是为了在 `opacity: 0` 期间保持 `display: block` 使 CSS transition 可以运作。现在默认状态已有 `pointer-events: none`，元素始终 `display: block`，`.ready` 完全是多余的。

**`share.styl`**：

```stylus
.wx-share-modal
  // … 现有属性 …
  pointer-events none    // 已有（上次修复）
  opacity 0
  transform translate(-50%, -50%) scale(0.96)
  transition opacity 0.3s ease, transform 0.3s ease
  // 删除 &.ready 块

  &.visible              // 原 &.in，重命名与 reward-modal 统一
    opacity 1
    pointer-events auto
    transform translate(-50%, -50%) scale(1)
```

**`share.js`**（更新 showWX / hideWX）：

```javascript
function showWX() {
  var img = document.querySelector('.wx-qrcode-img');
  if (img && img.dataset.url && !img.dataset.loaded) {
    img.src = img.dataset.url;
    img.dataset.loaded = '1';
  }
  document.querySelector('.wx-share-modal').classList.add('visible');   // 原: addClass('in ready')
  document.querySelector('#share-mask').classList.add('active');
}

function hideWX() {
  document.querySelector('.wx-share-modal').classList.remove('visible');
  document.querySelector('#share-mask').classList.remove('active');
}
```

**`#share-mask` 补淡入过渡**（替换原 `display: none` 方案）：

```stylus
#share-mask
  position fixed
  width 100%
  height 100%
  left 0
  top 0
  background var(--share-mask-bg)
  z-index 999
  // display none ← 删除
  visibility hidden
  opacity 0
  pointer-events none
  transition opacity 0.25s ease, visibility 0.25s ease

  &.active
    visibility visible
    opacity 1
    pointer-events auto
```

### 3.3 微信弹窗视觉升级

对齐打赏弹窗结构。

**`share.ejs`**（HTML 结构调整）：

```html
<div class="wx-share-modal">
  <div class="wx-modal-close">
    <i class="ri-close-line"></i>
  </div>
  <p class="wx-modal-caption">扫一扫，分享到微信</p>
  <div class="wx-qrcode-frame">
    <img class="wx-qrcode-img" src="" data-url="..." alt="微信分享二维码">
  </div>
</div>
```

**`share.styl`**（新增规则）：

```stylus
// ─── 关闭按钮（对齐 .reward-close）─────────────────────────────────────────
.wx-modal-close
  position absolute
  right 10px
  top 10px
  width 30px
  height 30px
  display flex
  align-items center
  justify-content center
  border-radius 50%
  cursor pointer
  transition background 0.2s ease
  color var(--share-modal-close)

  &:hover
    background var(--share-icon-bg-hover)
    color var(--share-modal-close-hover)

  i
    font-size 18px
    color inherit

// ─── 标题文字（对齐 .reward-wording）──────────────────────────────────────
.wx-modal-caption
  margin 4px 0 16px
  font-size 14px
  color var(--share-modal-text)
  line-height 1.5

// ─── QR 图容器（结构对齐，非可用性修复）──────────────────────────────────
.wx-qrcode-frame
  display inline-block
  line-height 0
  padding 8px
  border 1px solid var(--share-modal-border)
  border-radius 8px

.wx-qrcode-img
  display block
  width 150px
  height 150px
```

同时为弹窗加显式宽度约束（防止内容撑开时的不可预期布局）：

```stylus
.wx-share-modal
  // … 现有属性 …
  width 220px
  max-width 92vw
  text-align center
```

**`share.js`**（更新 close 选择器）：

```javascript
// hideWX 中的 querySelector：
// 原: '.modal-close'
// 改: '.wx-modal-close'（在 share_init 末尾绑定）
document.querySelector('.wx-modal-close').addEventListener('click', hideWX);
```

### 3.4 下拉气泡图标品牌色降饱和（可选）

当前 hover 状态直接使用全饱和变量（`weibo-color = #d81e06`）。若想与功能层"克制彩色"的原则保持一致，可将饱和度降低约 30%，让 hover 色调化而非品牌化。

```stylus
// 改前
&.weibo:hover
  color weibo-color          // #d81e06

// 改后（示例，具体数值需视觉调校）
&.weibo:hover
  color desaturate(weibo-color, 30%)   // Stylus 内置函数
```

这一改动属于品味判断，不强制，可视实际效果决定。

---

## 四、实施顺序与文件一览

```
提交 1：JS 整合 + light dismiss
  themes/ayeria/source-src/js/ayeria.js   删除 share-outer 绑定
  themes/ayeria/source-src/js/share.js    新增 toggleDropdown、document click、mask active
  themes/ayeria/source-src/css/_partial/share.styl
    .share-wrap 改为 class-driven 显隐
    #share-mask 改为 visibility+opacity 方案

提交 2：微信弹窗结构与状态机
  themes/ayeria/layout/_partial/post/share.ejs   HTML 结构调整
  themes/ayeria/source-src/css/_partial/share.styl
    .wx-share-modal 状态机 .ready/.in → .visible
    新增 .wx-modal-close、.wx-modal-caption、.wx-qrcode-frame
  themes/ayeria/source-src/js/share.js   showWX/hideWX 更新

提交 3（可选）：品牌色降饱和
  themes/ayeria/source-src/css/_partial/share.styl
```

每个提交后需执行 `npm run build` 编译 `source/dist/main.css` 和 `main.js`，并将编译产物一同提交。

---

## 五、不改动的部分

- **下拉气泡图标布局本身**：icon-only 简洁，无需加文字标签
- **触发器样式**：分享触发器是文章尾部行内元素，与打赏 pill button 的上下文不同；当前"图标 + 文字"形式合理，不强制对齐
- **平台链接逻辑**：`handleClick` 中各平台的 URL 拼接不涉及本次改动
- **`glass-card.css`**：`pointer-events: none` 已在上次修复中添加，无需再动
