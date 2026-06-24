# 侧边栏打开方式扩充方案

**需求说明**

修改自研 Hexo 主题 Ayeria 中的侧边栏功能，为菜单项添加多种打开方式的支持。`_config.ayeria.yml` 中给出的菜单配置目前为扁平的 `key: url` 结构，需要在保持向下兼容的前提下，扩展为支持对象格式，新增 `target` 字段控制链接打开方式。Schema 如下：

```yaml
menu:
  全部文章: /archives               # 需继续支持的旧格式，行为等同 target: current
  关于本站:
    url: /about
    target: current                 # 在当前标签页打开（默认行为）
  Music:
    url: https://music.example.com
    target: popup                   # 以小窗口打开，后文详述
    popup_width: 380                # 可选，默认 380
    popup_height: 620               # 可选，默认 620
  GitHub:
    url: https://github.com
    target: blank                   # 在新标签页打开
```

**`target` 的三种值**

- `current`：当前标签页打开，即现有默认行为，`target` 未定义时也应回落到此
- `blank`：新标签页打开，渲染为带 `target="_blank" rel="noopener noreferrer"` 的 `<a>` 标签
- `popup`：调用 `window.open` 以小窗口打开，窗口名使用菜单项的 key（如 `popup-Music`），使同一菜单项多次点击复用同一窗口而非重复新开；`href` 保留有效 URL 作为 JS 禁用时的降级跳转

**兼容性要求**

- 旧格式（`key: url` 字符串）必须继续正常工作，不得需要用户修改现有配置
- 所有路径继续使用 `url_for()` 包裹，避免引发全站 bug

---

## 架构分析

### 侧边栏实现位置

当前侧边栏功能分布在以下文件中：

| 文件 | 职责 |
|---|---|
| `themes/ayeria/layout/_partial/sidebar.ejs` | 菜单渲染模板，`for...in` 遍历 `theme.menu`，渲染 `<a>` 标签 |
| `themes/ayeria/layout/layout.ejs` (第 18-20 行) | 通过 `<aside class="sidebar on">` 引入 sidebar partial |
| `themes/ayeria/layout/_partial/float-btns.ejs` | 提供 `navbar-toggle` 按钮（移动端侧边栏开关） |
| `themes/ayeria/source-src/css/_partial/navbar.styl` | 侧边栏和导航的样式 |
| `themes/ayeria/source-src/js/ayeria.js` (第 131-138 行) | 移动端侧边栏 toggle 逻辑 |
| `themes/ayeria/source-src/main.js` | JS 入口，import `ayeria.js` |

### 模板现状

`sidebar.ejs` 当前实现（简化）：

```ejs
<% for (var i in theme.menu){ %>
<li class="nav-item">
  <a class="nav-item-link" href="<%- url_for(theme.menu[i]) %>"><%= i %></a>
</li>
<% } %>
```

`theme.menu[i]` 当前始终为字符串（URL），`url_for()` 直接包裹即可。


## 目标文件

本次需求应修改以下 2 个文件，其余保持不变：

1. **`themes/ayeria/layout/_partial/sidebar.ejs`** —— 模板层：判断 `theme.menu[i]` 为字符串（旧格式）或对象（新格式），据此渲染不同的 `<a>` 属性
2. **`themes/ayeria/source-src/js/ayeria.js`** —— 行为层：为 popup 类型的菜单项添加事件委托，调用 `window.open`

注意：`ayeria.js` 修改后需重新构建 `source/dist/main.js`（`npm run build` 在主题目录下执行 webpack）。

---

## 实现方案

### 模板层（sidebar.ejs）

在 `for...in` 循环内通过 `typeof` 判断值类型：

```ejs
<% for (var key in theme.menu) {
   var item = theme.menu[key];
   var isObj = typeof item === 'object';
   var url = isObj ? item.url : item;
   var target = isObj ? (item.target || 'current') : 'current';
%>
<li class="nav-item">
  <a class="nav-item-link"
     href="<%- url_for(url) %>"
     <% if (target === 'blank') { %>
     target="_blank" rel="noopener noreferrer"
     <% } else if (target === 'popup') { %>
     data-target="popup"
     data-popup-name="popup-<%= key %>"
     data-popup-width="<%= item.popup_width || 380 %>"
     data-popup-height="<%= item.popup_height || 620 %>"
     <% } %>
  ><%= key %></a>
</li>
<% } %>
```

要点：
- `url_for()` 始终包裹最终 URL，与旧行为一致
- `data-*` 属性将 popup 参数传递给 JS 层，模板不写 inline `onclick`，保持关注点分离
- `href` 保留有效值，JS 禁用时降级为普通页面跳转
- `target` 缺失或为 `current` 时不输出额外属性，行为与旧版完全一致

### 行为层（ayeria.js）

在 navbar 上使用事件委托，统一处理 popup 点击：

```js
// Popup menu items（在 $(document).ready 或顶层 IIFE 中注册）
$('.nav-main').on('click', '.nav-item-link[data-target="popup"]', function (e) {
  e.preventDefault();
  var $this = $(this);
  window.open(
    $this.attr('href'),
    $this.data('popup-name'),
    'width=' + $this.data('popup-width') + ',height=' + $this.data('popup-height')
  );
});
```

要点：
- 事件委托在 `.nav-main` 父元素上，避免为每个菜单项单独绑定
- `e.preventDefault()` 阻止默认导航，`window.open` 接管
- 窗口名使用 `popup-<key>`，同一菜单项重复点击复用同一窗口
- `href` 取自 `<a>` 的 `href` 属性，与 JS 禁用降级路径一致

---

## 合理性判定

| 维度 | 结论 |
|---|---|
| **需求合理性** | 合理。为侧边栏菜单提供外链打开方式（blank/popup）是博客主题的常见需求，Music 播放器、GitHub 外链等场景确实需要非默认的打开方式 |
| **Schema 设计** | 合理。`key: url`（旧）与 `key: {url, target, ...}`（新）通过 `typeof` 即可区分，无需引入 breaking change |
| **target 值枚举** | 合理。三种值覆盖了所有实际场景，popup 的窗口名复用机制（使用 menu key）设计良好 |
| **降级策略** | 合理。`href` 保留有效 URL 确保 JS 禁用时不会产生死链接 |
| **关注点分离** | 方案将渲染逻辑（EJS 模板）与交互行为（JS 事件委托）分离，避免了模板中写 inline `onclick` 的做法 |
