# About 页面社交按钮故障：根因分析与修复参考方案

> 文档日期：2026-05-13  
> 影响范围：`about/` 页面的 Bilibili、Twitter、Steam 三个社交媒体按钮

---

## 一、现象描述

`about/` 页面共有 5 个社交媒体图标，从左到右依次为：GitHub、Bilibili、Twitter、Steam、Email。

| 按钮 | 加载速度 | 可点击 | 滚轮有效 |
|------|----------|--------|----------|
| GitHub（第 1） | 正常 | ✓ | ✓ |
| Bilibili（第 2） | 慢 | ✗ | ✗ |
| Twitter（第 3） | 慢 | ✗ | ✗ |
| Steam（第 4） | 慢 | ✗ | ✗ |
| Email（第 5） | 正常 | ✓ | ✓ |

**规律性异常**：将页面稍向下滚动、使按钮移至视口上方后，所有五个按钮均恢复正常。

---

## 二、根因确认

### 2.1 根因

**`.wx-share-modal` 缺少默认 `display: none`，在页面加载后作为不可见的覆盖层持续拦截鼠标事件。**

`share.ejs` 始终将以下结构渲染到 DOM 中（只要 `share_enable: true` 且当前页面非列表页，`about/` 页满足条件）：

```html
<div class="wx-share-modal">
    <a class="modal-close" href="javascript:;">...</a>
    <p>扫一扫，分享到微信</p>
    <div class="wx-qrcode">
      <img src="//api.qrserver.com/v1/create-qr-code/?size=150x150&data=..." alt="...">
    </div>
</div>
```

`share.styl` 对 `.wx-share-modal` 的默认样式为：

```stylus
.wx-share-modal
  position fixed        /* ← 固定定位，脱离文档流 */
  top 50%
  left 50%
  z-index 9999
  padding 28px 24px 24px
  opacity 0             /* ← 视觉上不可见 */
  transform translate(-50%, -50%) scale(0.96)
  backdrop-filter blur(16px)
  /* 缺少 display: none  ← 根本缺陷 */
  /* 缺少 pointer-events: none ← 次要缺陷 */
```

`<div>` 元素的默认 `display` 是 `block`，因此该元素在不打开分享功能时仍然存在于布局中，占据整个视口中心区域，视觉透明但完整拦截鼠标点击和滚轮事件。

### 2.2 为何"中间三个"受影响，两端不受影响

QR 码图片尺寸为 `150×150`，加上 `padding: 28px 24px 24px`，弹窗内容宽度约 `198px`，`scale(0.96)` 后约 `190px`，从视口中心向两侧各延伸约 **95px**。

按钮相对于视口中心的水平偏移（5 个按钮总宽 `5×52 + 4×18 = 332px`，中心对齐，各按钮中心偏移依次为 `±166px, ±96px, 0px`）：

| 按钮 | 中心偏移 | 覆盖区域（±95px） | 结果 |
|------|----------|------------------|------|
| GitHub | −166px | 超出 | 未被覆盖 ✓ |
| Bilibili | −96px | 边缘刚好超出→被覆盖 | 被拦截 ✗ |
| Twitter | 0px | 完全在内 | 被拦截 ✗ |
| Steam | +96px | 边缘刚好超出→被覆盖 | 被拦截 ✗ |
| Email | +166px | 超出 | 未被覆盖 ✓ |

### 2.3 为何"加载较慢"

用户感知有误。QR 码图片从外部 API `api.qrserver.com` 加载，导致鼠标悬停在此时，浏览器左下角提示正在加载。正在加载的其实是这个遮盖内容，而非按钮。

### 2.4 为何"滚轮失效"

`.wx-share-modal` 是 `position: fixed` 元素。当鼠标悬停于其上时，滚轮事件的目标是该元素。浏览器尝试滚动视口（`window`），但 `#app` 有 `overflow: hidden`，真正的滚动容器是 `.content`（`overflow-y: scroll`）。固定定位元素的滚轮事件不会冒泡到 `.content`，因此滚动无效。

### 2.5 为何"向下滚动后恢复"

`.content` 滚动使按钮向视口上方移动，而 `position: fixed` 的弹窗始终锁定在视口中心。当按钮离开弹窗的 Y 轴覆盖范围后，不再被拦截。

---

## 三、分享功能其他故障审查

### 3.1 `#share-mask` 无关闭事件绑定（功能 Bug）

`main.js` 中的事件绑定逻辑：

```javascript
function s() { $(".wx-share-modal").removeClass("in ready"); $("#share-mask").hide() }

document.querySelector("#mask").onclick = s;        // 奖励弹窗的遮罩 ← 绑定对象错误
document.querySelector(".modal-close").onclick = s; // 分享弹窗的关闭按钮 ✓
```

`#mask` 是**奖励弹窗**（打赏）的遮罩，`#share-mask` 才是**分享弹窗**的遮罩。代码将关闭函数绑定到了错误的元素上。

实际后果：
- `#share-mask`（分享遮罩）点击**无法关闭**分享弹窗，用户只能点击弹窗内的 `×` 按钮关闭；
- 奖励弹窗的 `#mask` 被额外绑定了关闭分享弹窗的逻辑，奖励遮罩与分享关闭函数产生耦合。

### 3.2 外部 API 在页面加载时即发起请求（隐私 + 性能）

`share.ejs` 在模板渲染时静态写入 QR 码图片 URL：

```html
<img src="//api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://example.com/about/" ...>
```

这意味着：
- 每次页面访问，浏览器都会向 `api.qrserver.com` 发出请求，**即使用户从未点开微信分享**；
- 该请求泄露了用户正在访问的页面 URL 给第三方服务；
- 网络延迟和图片加载时间直接影响弹窗展开尺寸的时序，放大了主 Bug 的视觉影响。

### 3.3 `.share-wrap` 下拉面板无点击外部关闭逻辑（体验缺陷）

`.share-wrap` 通过 `fadeToggle()` 切换显示。当用户点击分享按钮展开面板后，点击页面其他位置**不会自动收起**面板，只有再次点击分享按钮才能关闭。这是较常见的下拉 UX 缺陷。

### 3.4 `#mask` 与 `#reward` 遮罩和分享模块共享（隐患）

`#mask` 由奖励弹窗使用，但分享模块的 `main.js` 也监听了 `#mask.onclick`。两套模块通过 DOM 元素 id 隐式耦合，任何一方的修改都可能破坏另一方。

---

## 四、前次分析自查

### 4.1 错误之处

| 结论 | 错误原因 |
|------|----------|
| 将 `.search-form-wrap` 的 `backdrop-filter` 定为根因 | `.search-form-wrap` 已有 `visibility: hidden`，该属性与 `display: none` 一样抑制指针事件，并非无效遮挡 |
| 推测 compositor layer 残留导致点击失效 | GPU 合成层不拦截 DOM 指针事件；此路线在未确认根因前过早进入底层推测 |
| 推测 `.float_btns` 浮动定位影响布局 | 与社交按钮问题无关 |
| 推测 `border-radius` 和 51LA SDK 等因素 | 无根据的排列式排查，稀释了分析焦点 |

### 4.2 正确之处

| 结论 | 正确原因 |
|------|----------|
| 某个 `position: fixed` 的不可见元素拦截了事件 | 模式正确，只是误判了是哪个元素 |
| 覆盖层是视口相对定位，解释了向下滚动后恢复的现象 | 推导正确 |
| 异步加载导致覆盖面积随时间变化 | 与 QR 图片懒加载逻辑吻合 |
| `.glass-card::after` 缺少 `pointer-events: none` | 次要问题，属实，值得独立修复 |

### 4.3 根因识别滞后的原因

根因 `.wx-share-modal` 在较早阶段就可以通过以下路径推导出来：`share_enable: true` → `article.ejs` 渲染 `share.ejs` → 其中含 `div.wx-share-modal` → 默认 `display: block` 且无 `pointer-events: none`。但分析过程过度关注了 CSS 合成层等底层机制，未能优先检查"最近的可见嫌疑人"——与布局相关的模板和样式。

---

## 五、修复参考方案

### 方案 A：最小手术修复（推荐首选）

**文件**：`themes/ayeria/source-src/css/_partial/share.styl`

在 `.wx-share-modal` 的默认状态中增加 `display: none`：

```stylus
.wx-share-modal
  display none          /* ← 新增，修复根因 */
  position fixed
  top 50%
  left 50%
  z-index 9999
  /* ... 其余属性不变 ... */
```

`.ready` 和 `.in` 状态已有 `display block`，状态机逻辑本身正确，只缺初始状态的声明。改动一行，影响面最小。

同时补充防御层（不影响功能，但提供双重保护）：

```stylus
.wx-share-modal
  display none
  pointer-events none   /* ← 防御层 */
  /* ... */
  
  &.in
    display block
    pointer-events auto /* ← 激活时恢复 */
    visibility visible
    opacity 1
```

### 方案 B：修复 `#share-mask` 事件绑定

**文件**：`themes/ayeria/source-src/js/main.js`（或直接修改 `source/dist/main.js` 作为临时修复）

将错误绑定：
```javascript
document.querySelector("#mask").onclick = s;
```
改为：
```javascript
document.querySelector("#share-mask").onclick = s;
```

### 方案 C：QR 码懒加载（架构优化）

将 QR 码图片的 `src` 从模板静态渲染改为 JS 动态注入，仅在用户实际点击微信分享时才发起请求：

**`share.ejs` 改动**：
```html
<div class="wx-qrcode">
  <!-- src 留空，data-url 存储模板变量 -->
  <img class="wx-qrcode-img"
       src=""
       data-url="<%- 'qrcode' in locals ? qrcode(sUrl) : '//api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + encodeURIComponent(sUrl) %>"
       alt="微信分享二维码">
</div>
```

**`main.js` 改动**：在打开微信分享时补充加载：
```javascript
"weixin" === e && (
  // 懒加载 QR 码
  const img = document.querySelector(".wx-qrcode-img");
  if (img && !img.src) img.src = img.dataset.url;
  $(".wx-share-modal").addClass("in ready");
  $("#share-mask").show();
)
```

### 方案 D：`.glass-card::after` 修复（独立）

**文件**：`source/about/glass-card.css`

`.glass-card::after` 是纯装饰性伪元素（背景模糊效果），应明确排除指针事件：

```css
.glass-card::after {
  /* ... 现有属性 ... */
  pointer-events: none; /* ← 新增 */
}
```

---

## 六、修复优先级建议

| 优先级 | 方案 | 原因 |
|--------|------|------|
| P0 | 方案 A（`display: none`） | 直接修复核心功能故障 |
| P1 | 方案 B（`#share-mask` 绑定） | 修复关闭交互逻辑 |
| P2 | 方案 C（QR 懒加载） | 消除隐私泄露和不必要的外部请求 |
| P3 | 方案 D（`glass-card::after`） | 防御性修复，当前无实际影响 |

方案 A + B 可作为一次 commit 同步完成，方案 C 涉及 JS 与模板联动，建议单独提交。
