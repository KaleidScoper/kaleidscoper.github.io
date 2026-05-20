# 博客项目架构分析报告

> **分析日期**: 2026-04-13
> **最后更新**: 2026-05-20（新增十五、ayeria.js 模块化重构方案；新增 3.4 暗色模式实现架构）
> **分析范围**: 项目整体架构、目录结构、配置体系、主题架构、CI/CD、性能、安全、SEO、可维护性、SOLID 原则
> **参考基准**: Hexo 官方最佳实践、GitHub Pages 部署惯例、静态站点生成器行业通用规范、SOLID 五原则在非 OOP 场景下的适用标准
> **前置审查**: 本报告基于 [2026-03-28 审查报告](archive/audit-report-2026-03-28.md) 的修复成果，不重复已关闭问题，仅关注架构层面

---

## 总评


| 维度    | 评分    | 说明                                                  |
| ----- | ----- | --------------------------------------------------- |
| 目录结构  | ★★★☆☆ | Hexo 标准骨架完整，但根目录存在非标准文件，`source/_drafts/` 仍混有非 Markdown 文件 |
| 配置体系  | ★★★★☆ | 分层配置清晰（`_config.yml` + `_config.ayeria.yml`），少数配置项可优化 |
| 主题架构  | ★★★★☆ | 样式系统已全面重构为模块化 Stylus partials，主要遗留问题为构建产物仍提交仓库 |
| CI/CD | ★★★★☆ | GitHub Actions 流程规范，缺少质量门禁                          |
| 性能    | ★★★☆☆ | 存在无条件加载资源、字体加载策略欠佳等问题                               |
| 安全    | ★★★★☆ | 已修复 OAuth 泄露，仍有少量风险点                                |
| SEO   | ★★☆☆☆ | 缺少 Sitemap、RSS、robots.txt 等基础设施                     |
| 可维护性  | ★★★☆☆ | 根目录调试脚本增多，缺乏自动化质量检查                                  |
| SOLID 原则 | ★★★☆☆ | 模板/样式体系遵循良好，客户端 JS 和部分模板存在 SRP/DIP 违规 |


---

## 一、目录结构

### ~~1.1 （已修复）根目录存在非标准目录~~

**位置**: 项目根目录

**原问题**: `文章模板暂存处/` 目录位于项目根目录，内含未发布的 Markdown 草稿和无关文件（如 `哲学.py`、`编剧.md`、`生产资料.md`）。

**修复情况**: `文章模板暂存处/` 目录已从根目录移除，相关内容迁移至 `source/_drafts/`，符合 Hexo 草稿约定。但 `source/_drafts/` 中仍残留不符合 Hexo 草稿规范的文件：其中 `哲学.py` 为非 Markdown 文件，`生产资料.md`、`编剧.md`、`丝路创意文档.md`、`漂海录创意文档.md` 等虽为 Markdown 但缺少 Hexo 前置信息（front-matter），不会被 Hexo 构建。这些文件增加了仓库的认知负担，不符合 `_drafts/` 目录作为文章草稿区的语义。

**建议**: 将 `哲学.py` 等非 Markdown 文件移出 `_drafts/`，缺少 front-matter 的 `.md` 文件若无需发布则归入 `doc/drafts/`。

### ~~1.2 （已修复）残留配置文件~~

**位置**: `_config.landscape.yml`

已删除，无需再跟进。

### ~~1.3 （已忽略）主题目录中的 `.gitkeep`~~

**位置**: `themes/.gitkeep`

**问题**: 该文件用于在 Git 中保留空的 `themes/` 目录。由于 `themes/ayeria/` 已有内容，此文件已无必要。

**建议**: 删除该文件。

### ~~1.4 （已忽略）测试文件残留~~

**位置**:

- ~~`source/images/test.png`~~（已删除 ✓）
- ~~`themes/ayeria/source/test-random-sentences.html`~~（已删除 ✓）
- `source/test/`（新增：视差滚动效果演示页面，含 `index.md` 和 `img/` 图片）

**问题**: `source/test/index.md` 是视差滚动演示页，会被 Hexo 构建并部署到生产站点（当前未在 `skip_render` 中排除）。

**建议**: 将 `source/test/` 加入 `_config.yml` 的 `skip_render`。

### 1.5 图片文件名使用中文

**位置**: `source/images/` 下多个文件，如 `丹凤门.jpg`、`京都八坂神社西门.webp`、`伪史论.jpeg` 等

**问题**: 中文文件名在 URL 编码后会变成长串百分号字符（如 `%E4%B8%B9%E5%87%A4%E9%97%A8.jpg`），影响：

- URL 可读性和可分享性
- 部分旧版服务器/CDN 的兼容性
- 终端操作体验

**建议**: 将图片文件名统一为英文或拼音，在 Markdown 中更新引用路径。

### 1.6 主题目录内遗留备份文件

**位置**:

- `themes/ayeria/_config.yml.old`
- `themes/ayeria/source/favicon.ico.old`
- `themes/ayeria/source/favicon.svg.old`

**问题**: 这些 `.old` 后缀文件是开发过程中遗留的备份，无实际功能，会被 Hexo 原样复制至 `public/`（已确认 `public/favicon.ico.old` 和 `public/favicon.svg.old` 出现在构建产物中）。

**建议**: 删除上述文件；`_config.yml.old` 中的历史配置如需留存，提交至 Git 历史即可，无需作为文件保留在仓库中。

---

## 二、配置体系

### 2.1 `future: true` 允许未来日期文章发布

**位置**: `_config.yml` — `future: true`

**问题**: 此配置允许发布日期在未来的文章。这在生产环境中是不寻常的——通常仅用于本地预览草稿。如果误设文章日期为未来时间，文章会直接上线。

**建议**: 将 `future` 设为 `false`。本地预览时使用 `hexo server --future` 参数。

### 2.2 `post_asset_folder: false` 导致图片管理分散

**位置**: `_config.yml` — `post_asset_folder: false`

**问题**: 所有文章图片集中在 `source/images/` 全局目录，而非按文章组织。随着文章增多：

- 难以确定某张图片属于哪篇文章
- 删除文章时无法安全清理关联图片
- 图片与文章的引用关系不明确

**建议**: 启用 `post_asset_folder: true`，Hexo 会在创建文章时自动生成同名文件夹，使用 `![img](image.png)` 相对路径引用。对于已有文章，可逐步迁移。

### 2.3 日期型永久链接层级过深

**位置**: `_config.yml` — `permalink: :year/:month/:day/:title/`

**问题**: 生成类似 `/2025/10/02/how-to-use-hexo/` 的 URL，层级达 4 层。行业趋势是更扁平的 URL 结构：

- 不利于 SEO（搜索引擎偏好浅层 URL）
- URL 过长，不利于分享

**建议**: 考虑使用 `:year/:title/` 或 `:title/` 等更简洁的格式。修改后需设置重定向以避免旧链接 404。

> **⚑ 与 §7.4 协调**：§2.3（permalink 层级）与 §7.4（trailing_index/html URL 后缀）共同决定站点最终 URL 形态。若计划同时处理，应统一规划重定向规则；若分步处理，建议先完成本节（permalink 结构）再处理 §7.4（后缀），以避免两次变更产生冲突。

### 2.4 RSS 订阅未配置

**位置**: `_config.yml` — `rss:` 为空；`_config.ayeria.yml` — `rss:` 为空

**问题**: 站点没有 RSS feed。虽然 RSS 使用率下降，但对于技术博客而言，仍有相当比例的读者通过 RSS 阅读器订阅。

**建议**:

1. 安装 `hexo-generator-feed`
2. 在 `_config.yml` 中配置：
  ```yaml
   feed:
     type: atom
     path: atom.xml
     limit: 20
  ```
3. 在 `_config.ayeria.yml` 的 `rss:` 字段填入 `/atom.xml`

---

## 三、主题架构

### ~~3.1 （已修复）`custom.styl` 严重偏离 Stylus 范式~~

**原位置**: `themes/ayeria/source/css/custom.styl`（约 973 行）

**原问题**: 大量使用 `@css {}` 块（原始 CSS 注入），绕过 Stylus 预处理器，无法使用 Stylus 变量、嵌套、混入等特性。

**修复情况**: 已于 commit `92eb855` 完成全面重构。`custom.styl` 现仅 17 行，作为面向站点用户的覆盖样式入口（空白模板，附使用示例注释）。原有的全部样式逻辑已按功能拆分至 `source-src/css/_partial/` 下的 29 个独立 Stylus partial 文件（`article.styl`、`reward.styl`、`search.styl`、`highlight.styl` 等），通过 `style.styl` 统一 import，经 Rollup 构建输出。

**遗留事项**: `source/css/` 下仍有 `ayeria-layout.styl` 和 `clipboard.styl` 两个独立 Stylus 文件直接被 `head.ejs` 引用，未纳入 Rollup 构建管线（作为独立 CSS 输出）。这是有意的架构选择（避免与 `dist/main.css` 合并），但需在主题文档中说明。

### 3.2 主题构建产物提交到仓库

**位置**: `themes/ayeria/source/dist/`（`main.css`、`main.js`）

**问题**: Rollup 构建的产物（`source/dist/main.css` 和 `source/dist/main.js`）被直接提交到 Git 仓库。这是 Hexo 主题的常见做法（因为 Hexo 直接使用 `source/` 下的文件），但从工程角度看：

- 每次 `npm run build` 后需手动检查 diff 并提交
- 构建产物与源码混在同一仓库，增加仓库体积和 diff 噪音
- 可能出现源码更新但忘记重新构建的情况

**建议**: 短期维持现状（Hexo 生态的普遍做法）。长期可考虑在 GitHub Actions 中增加主题构建步骤，使 `source/dist/` 不再需要提交。

### 3.4 暗色模式实现架构

> **新增于 2026-05-20**

#### 现状描述

暗色模式由三个机制共同构成：

1. `layout.ejs` 第 3 行：`<body class="darkmode">` — 暗色 class 硬编码在 HTML 源码中（暗色为默认）
2. `style.styl` 第 33–34 行：`body.darkmode { darkmode() }` — Stylus mixin 覆盖旧版组件样式
3. 新组件（`reward.styl`、`share.styl` 等）：`:root` 定义亮色 CSS 自定义属性，`body.darkmode` 定义暗色覆盖值

JS 切换逻辑（`ayeria.js`）：
- `sessionStorage.getItem("darkmode") == 0` → 移除 `darkmode` class（切换到亮色）
- 其他情况（默认/1）→ 保留 `darkmode` class（暗色）

#### `:root` = 亮色 + `body.darkmode` = 暗色的语义问题

**此模式本身符合业界惯例**：Tailwind CSS 用 `html.dark`，Bootstrap 5.3 用 `data-bs-theme="dark"` on `<html>`。用 `body` 代替 `html` 是轻微的偏离，但由于 `class="darkmode"` 硬编码在 HTML（而非 JS 动态添加），实际上没有暗色用户的 FOUC。

**语义异味（低优先级，无需立即修复）**：`:root` 在 CSS 中语义上代表"默认基准状态"，目前 `:root` = 亮色配置，而运行时默认是暗色。这是从上游 Ayer 主题（亮色默认）演化而来的痕迹，功能正确，但 CSS 语义与网站的实际默认状态相反。若要消除，需将暗色变量移至 `:root`，亮色变量改写在 `body.lightmode` 下，成本较高，收益有限。

#### Bug 1：`sessionStorage` 应改为 `localStorage` 🟡

**位置**：`source-src/js/ayeria.js` 第 210、222、228 行（迁移后为 `darkmode.js`）

**问题**：`sessionStorage` 的作用域是单个标签页/会话，关闭标签页或新开标签页后偏好丢失，用户每次都须重新切换亮色。业界标准是 `localStorage`（持久化到用户主动清除）。

**修复**：三处 `sessionStorage.getItem/setItem` 替换为 `localStorage.getItem/setItem`，一行一行改，无副作用。

> **⚑ 顺序约束**：必须先于 Bug 2 修复。Bug 1 完成后，`localStorage` 持久化偏好的用户数量将持续累积，Bug 2（亮色用户 FOUC）影响范围随即扩大，届时应立即跟进 Bug 2。

#### Bug 2：亮色模式用户的 FOUC 🟡

**问题**：页面 HTML 携带 `class="darkmode"` 送达浏览器，CSS 即刻渲染为暗色背景。若用户偏好为亮色（`sessionStorage/localStorage = 0`），需等 JS bundle 加载、解析、执行后才移除该 class，期间有一帧暗色闪烁（FOUC）。暗色用户不受影响。

**影响范围**：仅影响主动切换过亮色的用户。当前用 `sessionStorage`，每次新标签都重置偏好，实际受影响的人极少；若改为 `localStorage` 后，受影响比例会上升，届时此 bug 优先级应同步提高。

**修复**：在 `head.ejs` 的 `<head>` 末尾（CSS 链接之后、body 渲染之前）插入内联脚本：

```html
<script>
  if (localStorage.getItem('darkmode') === '0') {
    document.body.classList.remove('darkmode');
  }
</script>
```

注意：需在 `<link rel="stylesheet">` 之后、`</head>` 之前执行，使浏览器在首次绘制前即确定正确状态。

> **⚑ 前置依赖**：Bug 1（`sessionStorage` → `localStorage`）。Bug 1 未完成前，每次新标签页都会重置偏好，实际受影响用户极少，本修复价值有限；Bug 1 完成后优先级上升，应立即跟进。

#### 双层暗色系统（已知架构债务）

`_darkmode.styl` 中的 `darkmode()` mixin（旧系统：Stylus 变量 + `!important` 覆盖）与新组件的 CSS 自定义属性系统（`--reward-*`、`--share-*` 等）并存。`_darkmode.styl` 第 31 行注释已承认部分规则被自定义属性方案覆盖。此问题属于 §3.1 已描述的样式迁移进行中状态，随新组件持续接入自定义属性，旧 mixin 中的规则会逐步被替代直至可以删除。

#### 优先级汇总

| 问题 | 优先级 | 修复成本 |
|------|--------|---------|
| `sessionStorage` → `localStorage` | 🟡 中 | 极低（三行改动） |
| 亮色用户 FOUC | 🟡 中（改 localStorage 后升高） | 低（一段内联 script） |
| `:root` 语义倒置 | 🟢 低 | 高（全局 selector 重写） |
| 双层暗色系统收敛 | 🟢 低（进行中） | 随新组件自然消化 |

---

### 3.3 主题 `index.js` 为空壳

**位置**: `themes/ayeria/index.js`

**问题**: 该文件仅包含一行注释，用于防止 `hexo clean` 报错。这是 Hexo 5.0+ 的已知问题，但空壳文件增加了认知负担。

**建议**: 维持现状（Hexo 框架限制），但可在文件中添加更详细的说明注释。

---

## 四、自定义页面架构

### ~~4.1 （已忽略）简历页面与 Hexo 模板体系完全脱节~~

**位置**: `source/resume/`、`source/resume-en/`

**问题**: 这两个目录是完整的独立 HTML 站点（含自己的 CSS、JS、字体文件），通过 `skip_render` 跳过 Hexo 渲染。问题包括：

- 与主站主题风格完全不同（无暗色模式、无导航栏、无页脚）
- 两个目录间 CSS/JS/字体文件大量重复（约 500KB+）
- 使用 Font Awesome 4.7（2017 年版本），主站使用 RemixIcon
- 使用 jQuery 2.1.3（2014 年版本），主站使用 jQuery 3.6.0
- `baiduanalysis.js` 和 `gtag.js` 中的分析脚本可能包含过时的追踪 ID

**建议**:

- 短期：将共享资源提取到 `source/resume-assets/`，两个页面共用
- 中期：将简历页面重构为 Hexo layout 模板，融入主站主题
- 长期：考虑使用现代简历生成方案（如 JSON Resume + 主题模板）

### ~~4.2 （已忽略）MC 服务器页面架构独立~~

**位置**: `source/mc-server/`

**问题**: 该页面是完全独立的 HTML/CSS/JS 应用，通过 `skip_render` 跳过 Hexo 渲染。虽然功能上合理（该页面有独特的交互需求），但存在以下问题：

- 与主站无导航关联（用户无法从 MC 页面返回主站，除了左上角 logo）
- 使用 Font Awesome 4.7 CDN，与主站 RemixIcon 不一致
- `members.js` 中的数据硬编码在 JS 文件中，而非使用 Hexo 数据文件机制
- 第三方头像 API `mc-heads.net` 无错误重试机制

**建议**:

- 添加返回主站的导航链接
- 将 Font Awesome 图标替换为 RemixIcon（与主站一致）
- 考虑将成员数据迁移至 `source/_data/mc-members.yml`，通过 Hexo 模板渲染

### ~~4.3 （已忽略）电子手办柜页面使用 `{% raw %}` 嵌入大量 HTML~~

**位置**: `source/waifu/index.md`

**问题**: 该页面通过 `{% raw %}` 标签在 Markdown 文件中嵌入了约 280 行原始 HTML。这实质上是将 Markdown 文件当作 HTML 文件使用，失去了 Markdown 的简洁性优势。

**建议**: 将该页面改为 `index.html`（直接使用 HTML），或使用 Hexo 数据文件 + 模板方案（将角色数据提取到 `source/_data/waifu.yml`，通过 EJS 模板循环渲染）。

### ~~4.4 （已忽略）关于页面混合 Markdown 与 HTML/CSS~~

**位置**: `source/about/index.md`

**问题**: 该文件在 Markdown 中通过 `<link>` 引入外部 CSS、使用大量原始 HTML 标签。虽然 Hexo markdown-it 配置了 `html: true` 允许内联 HTML，但这种混合方式：

- 增加维护复杂度
- CSS 文件 `glass-card.css` 独立于主题样式体系
- 无法通过主题的暗色模式切换自动适配（需手动编写 `body.darkmode` 选择器）

**建议**: 将 `glass-card.css` 的样式纳入主题的 Stylus 构建管线，通过 CSS 自定义属性实现暗色模式自动跟随。

---

## 五、性能

### 5.1 jQuery 在每个页面无条件加载

**位置**: `themes/ayeria/layout/_partial/after-footer.ejs` — 第 1 行

**问题**: `jquery-3.6.0.min.js`（约 90KB minified）在每个页面无条件加载。jQuery 在现代前端中已非必需，且该主题中 jQuery 的实际使用场景有限（modal、justifiedGallery 等插件依赖）。

**建议**:

- 短期：为 jQuery 及其依赖插件添加 `defer` 属性
- 中期：评估是否可用原生 JS 替代 jQuery 依赖
- 长期：移除 jQuery，使用原生 DOM API 或轻量级替代库

> **⚑ 顺序约束**：中/长期"移除 jQuery"方向，建议在 §15（`ayeria.js` 模块化重构）完成后再推进。模块化后各功能块相互隔离，可逐模块替换 jQuery 调用，成本显著低于在单体文件中整体替换。短期 `defer` 改造无此约束，可提前独立执行。

### 5.2 jquery-modal 和 justifiedGallery 无条件加载

**位置**: `themes/ayeria/layout/_partial/after-footer.ejs` — 第 22-24 行

**问题**: `jquery-modal`（JS + CSS）和 `justifiedGallery` 在每个页面加载，但仅在包含图片画廊的文章页中使用。

**建议**: 添加条件判断，仅在文章页且文章包含画廊标记时加载：

```ejs
<% if (!index && (post.photos || post.gallery)) { %>
  <script src="...jquery.modal.min.js"></script>
  <link rel="stylesheet" href="...jquery.modal.min.css" />
  <script src="...jquery.justifiedGallery.min.js"></script>
<% } %>
```

> **⚑ 与 §14.4 重复；覆盖于 §15**：本条目与 §14.4（ISP 违规审查）描述同一问题。§15.2 的 `ayeria.js` 模块化重构方案已统一规划 justifiedGallery 初始化的迁移（移入 `after-footer.ejs` 并添加页面类型条件判断）。建议以 §15 方案为主入口实施，不单独修复本条目。

### 5.3 Google Fonts 加载策略欠佳

**位置**: `themes/ayeria/layout/_partial/head.ejs` — 第 35-37 行

**问题**:

- 使用 `fonts.font.im` 镜像加载 Noto Serif SC 和 Noto Sans SC 字体
- 字体在 `<head>` 中同步加载（虽使用了 `preconnect`），会阻塞首屏渲染
- Noto 系列中文字体文件体积巨大（单个字重可达 5-15MB），即使使用 CDN 分片加载，仍显著影响首屏性能
- `font.im` 是第三方镜像服务，可用性和隐私政策不受控

**建议**:

- 使用 `font-display: swap` 确保文字先以系统字体显示（CDN 链接中已含 `display=swap`，确认生效）
- 评估是否真的需要两个字体家族四个字重——考虑减少至 1-2 个字重
- 考虑使用 `fonts.googleapis.com` 官方源（配合 `fonts.gstatic.com`），或完全自托管字体子集
- 对于中文内容，评估系统字体栈是否已足够美观（macOS 的苹方、Windows 的微软雅黑）

> **⚑ 与 §12.3 合并**：§12.3 是本节的扩展分析，针对中国大陆用户场景提供了更完整的系统字体栈方案及第三方镜像可用性评估。修复时应以 §12.3 的方案为基准实施，而非仅参考本节。

### 5.4 缺少图片优化管线

**问题**: 项目中没有图片压缩、格式转换或响应式图片的自动化流程。`source/images/` 下同时存在 `.jpg`、`.png`、`.webp` 格式，但无统一规范。

**建议**:

- 在 CI 中添加图片压缩步骤（如 `imagemin`）
- 统一使用 WebP 格式（保留 JPG 作为 fallback）
- 在文章模板中使用 `<picture>` 元素实现格式回退
- 为文章图片添加 `loading="lazy"` 和 `decoding="async"` 属性

---

## 六、安全

### 6.1 简历页面分析脚本可能包含过时追踪 ID

**位置**: `source/resume/js/gtag.js`、`source/resume/js/baiduanalysis.js`、`source/resume-en/js/gtag.js`、`source/resume-en/js/baiduanalysis.js`

**问题**: 这些文件中的 Google Analytics 追踪 ID 和百度统计 ID 是硬编码的。如果 ID 已失效，这些脚本仍会执行并向第三方发送请求，造成不必要的隐私暴露和性能开销。

**建议**: 检查追踪 ID 是否仍然有效。如果简历页面不再需要独立统计，删除这些脚本。

### 6.2 CDN 资源缺少 SRI 校验

**位置**: `themes/ayeria/layout/_partial/head.ejs`、`after-footer.ejs`、`source/mc-server/index.html`

**问题**: 所有通过 CDN 加载的第三方脚本和样式表均未设置 `integrity` 属性（Subresource Integrity）。如果 CDN 被入侵或文件被篡改，浏览器无法检测并拒绝执行恶意代码。

**建议**: 为所有 CDN 资源添加 `integrity` 和 `crossorigin="anonymous"` 属性。例如：

```html
<script src="https://cdn.staticfile.org/pace/1.2.4/pace.min.js"
        integrity="sha384-..."
        crossorigin="anonymous"></script>
```

> **⚑ 前置影响**：§12.2（核心 CDN 资源自托管）落地后，本条目对已自托管资源的 SRI 要求自动消除。建议在 §12.2 落地范围确定后再处理本条目，可避免为即将自托管的资源做无效 SRI 配置。

### 6.3 网站加密功能安全性不足

**位置**: `_config.ayeria.yml` — `lock` 配置

**问题**: 网站加密功能（`lock.enable: false`，当前已关闭）使用前端 JavaScript 实现密码验证。即使启用，密码以明文存储在配置文件中，验证逻辑在客户端执行，任何人查看源码即可绕过。

**建议**: 如果确实需要内容保护，应使用服务端方案。对于 GitHub Pages 静态站点，可考虑使用加密的 HTML 文件（如 `staticrypt` 方案）。当前已关闭此功能，建议从配置和模板中彻底移除相关代码。

---

## 七、SEO

### 7.1 缺少 Sitemap

**问题**: 项目未安装 `hexo-generator-sitemap`，搜索引擎无法通过 `sitemap.xml` 高效发现站点页面。

**建议**:

```bash
npm install hexo-generator-sitemap --save
```

在 `_config.yml` 中配置：

```yaml
sitemap:
  path: sitemap.xml
  template: ./sitemap_template.xml
```

并在 Google Search Console 和 Bing Webmaster Tools 中提交。

> **⚑ 顺序约束**：应先于 §7.2（robots.txt）完成。robots.txt 中的 `Sitemap:` 字段需填入已生效的 sitemap.xml URL，Sitemap 路径确认后 robots.txt 方可正确填写。

### 7.2 缺少 robots.txt

**问题**: `source/` 目录下没有 `robots.txt` 文件，搜索引擎爬虫将默认抓取所有页面。

**建议**: 创建 `source/robots.txt`：

```
User-agent: *
Allow: /
Sitemap: https://kaleidscoper.github.io/sitemap.xml

Disallow: /resume/
Disallow: /resume-en/
```

> **⚑ 前置依赖**：§7.1（Sitemap）。robots.txt 中的 `Sitemap: https://kaleidscoper.github.io/sitemap.xml` 字段依赖 §7.1 中已生成并确认的 sitemap.xml 路径，两者应按序完成。

### 7.3 缺少 Open Graph 和 Twitter Card 元数据

**位置**: `themes/ayeria/layout/_partial/head.ejs`

**问题**: 页面 `<head>` 中没有 Open Graph（`og:title`、`og:description`、`og:image` 等）和 Twitter Card 元标签。分享链接到社交平台时无法显示预览卡片。

**建议**: 在 `head.ejs` 中添加 Open Graph 和 Twitter Card 元标签，或安装 `hexo-auto-canonical` 等插件。

### 7.4 URL 保留冗余后缀

**位置**: `_config.yml` — `pretty_urls.trailing_index: true`、`trailing_html: true`

**问题**: 生成的 URL 包含 `index.html` 或 `.html` 后缀，不够简洁。此问题在 2026-03-28 审查中被标记为"已忽略"。

**补充说明**: 从 SEO 角度，干净的 URL（如 `/about/` 而非 `/about/index.html`）更受搜索引擎青睐。GitHub Pages 会自动处理目录的 `index.html` 回退，因此关闭这两个选项不会导致 404。建议重新评估此决定。

> **⚑ 与 §2.3 协调**：§7.4（URL 后缀）与 §2.3（permalink 层级）共同影响最终 URL 结构。两者建议一次规划、同步实施，统一设置重定向规则，避免分步处理引入冲突。

---

## 八、CI/CD

### 8.1 缺少质量门禁

**位置**: `.github/workflows/pages.yml`

**问题**: CI 流程仅包含 `install → build → deploy`，没有质量检查步骤：

- 无 HTML 有效性验证
- 无死链检测
- 无 Lighthouse 性能评分
- 无 ESLint/Stylelint 代码检查

**建议**: 在 `build` 和 `deploy` 之间增加验证步骤：

```yaml
- name: Lint
  run: npx htmlhint public/**/*.html || true
- name: Check broken links
  run: npx linkinator public/ --recurse --skip "^(?!https://kaleidscoper)" || true
```

### 8.2 主题构建未纳入 CI

**问题**: 主题的 Rollup 构建（`npm run build` 在 `themes/ayeria/` 下）需在本地手动执行。如果忘记构建，部署的将是旧的 `source/dist/` 文件。

**建议**: 在 CI 的 `npm run build` 之前添加主题构建步骤：

```yaml
- name: Build theme
  run: cd themes/ayeria && npm install && npm run build
```

> **⚑ 与 §10.2 合并处理**：本节的 CI 步骤（`cd themes/ayeria && npm install && npm run build`）已涵盖 §10.2（主题 devDependencies 未在 CI 安装）所描述的问题。两者应合并为一次 CI 变更，优先推进本节即可同步关闭 §10.2。

### 8.3 缺少部署环境锁定

**问题**: `package-lock.json` 虽已提交，但 CI 中使用 `npm install`（而非 `npm ci`），可能产生非确定性构建。

**建议**: 将 CI 中的 `npm install` 改为 `npm ci`，确保严格按照 `package-lock.json` 安装依赖。

---

## 九、可维护性

### 9.1 缺乏代码规范工具

**问题**: 项目没有配置任何代码规范工具：

- 无 `.editorconfig`（统一缩进、换行符等）
- 无 ESLint（JS 代码检查）
- 无 Stylelint（CSS/Stylus 代码检查）
- 无 Prettier（代码格式化）

**建议**: 至少添加 `.editorconfig` 和 Prettier 配置，确保多人协作时代码风格一致。

### 9.2 根目录调试脚本积累

**位置**: 根目录 `debug.py`、`debug_wsl.py`

**问题**: 两个调试辅助脚本均位于项目根目录。`debug_wsl.py` 于 2026-04-24 新增（"添加 Hexo 博客 WSL 环境一键调试脚本"），与既有的 `debug.py` 并列，根目录调试脚本数量持续增长。此问题在 2026-03-28 审查中被标记为"已忽略"，但现在问题有所扩大。

**建议**: 将 `debug.py`、`debug_wsl.py` 统一移入 `scripts/` 目录，并在 `.gitignore` 中注明这些文件的性质，或通过 `CLAUDE.md` / `README.md` 说明调试脚本的维护规范。

### ~~9.3 （已忽略）Git 提交信息不规范~~

**问题**: 此问题在 2026-03-28 审查中被标记为"已忽略"。但从长期可维护性角度，无规范的提交信息使得：

- 无法通过 `git log` 快速定位变更
- 无法自动生成 CHANGELOG
- `git bisect` 定位问题效率极低

**补充建议**: 最低成本方案是在 `package.json` 中添加 `commitlint` + `husky`，强制提交信息以 `feat:`/`fix:`/`chore:` 等前缀开头。

---

## 十、依赖管理

### 10.1 渲染器单点依赖

**位置**: `package.json` — `hexo-renderer-markdown-it-katex`

**问题**: 该渲染器是 `hexo-renderer-markdown-it` 的非官方分支，仅发布过 3 个版本，已停更。如果该包出现安全漏洞或与未来 Node.js 版本不兼容，整个站点的 Markdown 渲染将中断。

**建议**:

- 锁定精确版本号（当前为 `^3.4.4`，建议改为 `3.4.4`）
- 监控该包的维护状态
- 准备备选方案：官方 `hexo-renderer-markdown-it` + 独立 KaTeX 插件

### 10.2 主题 devDependencies 未在 CI 中安装

**位置**: `themes/ayeria/package.json` — `devDependencies`

**问题**: 主题的 `devDependencies`（rollup、autoprefixer 等）在 CI 中不会被安装（根目录 `npm install` 不会处理子目录的 `package.json`）。这意味着 CI 无法执行主题构建。

**建议**: 参见 8.2，在 CI 中显式安装主题依赖并构建。

> **⚑ 与 §8.2 合并处理**：本条目是 §8.2 的子任务，§8.2 的 CI 步骤中显式执行 `cd themes/ayeria && npm install` 即可同步解决。优先推进 §8.2，本条目将随之自动关闭，无需单独处理。

---

## 十一、可访问性（Accessibility）

### 11.1 （问题需复查）缺少跳过导航链接

**问题**: 站点没有 "Skip to content" 链接，使用键盘导航的用户每次需跳过侧边栏才能到达正文。

**建议**: 在 `layout.ejs` 的 `<body>` 开头添加：

```html
<a href="#main" class="skip-link">跳至正文</a>
```

### 11.2 社交图标缺少可访问文本

**位置**: `source/about/index.md` — 社交链接区域

**问题**: 社交图标使用 `<i>` 标签（RemixIcon），屏幕阅读器无法识别其含义。虽然有 `title` 属性，但缺少 `aria-label`。

**建议**: 为每个社交链接添加 `aria-label` 属性：

```html
<a href="..." aria-label="GitHub" class="social-icon">
```

---

## 十二、中国大陆用户专项分析

> **新增于 2026-05-14**：基于本站主要受众为中国大陆各地用户的假设，补充以下架构与性能专项分析。海外用户体验作为次要约束，不做过度牺牲，但也不引入仅对中国生效的方案。

### 12.1 GitHub Pages 在中国大陆的访问性能

**问题**: GitHub Pages 使用 Fastly CDN，在中国大陆无边缘节点。用户访问 `kaleidscoper.github.io` 时，DNS 解析和 TLS 握手均需经过跨境链路，首字节时间（TTFB）通常在 300-800ms，移动网络或偏远地区可能更高。这直接影响所有页面的首屏渲染速度。

**建议**:
- **中期方案**: 绑定自定义域名，通过 Cloudflare CDN 代理（Cloudflare 在亚太有多个边缘节点，中国大陆邻近地区如香港、东京、新加坡可提供 50-150ms 的 TLS 终端延迟）。无需备案，对海外用户同样友好。
- **长期方案**: 如果中国大陆用户体验是核心指标，可考虑国内 OSS + CDN + ICP 备案，但这是需要持续投入的方案。
- 静态资源的 CDN 加速容易实现，HTML 文档本身的加载速度是关键瓶颈，任何 DNS/边缘节点层面的改进都会全局受益。

### 12.2 第三方 CDN 资源对中国大陆的可用性风险

**现状**: 站点多个功能依赖 `staticfile.org`（360 维护的 CDN）：

| 资源 | 功能 | 当前状态 |
|------|------|---------|
| pace.js | 页面顶部进度条 | 已启用 |
| jquery-modal | 图片画廊弹窗 | 无条件加载 |
| justifiedGallery | 图片画廊布局 | 无条件加载 |
| sweetalert2 | 网站加密锁 | 功能已关闭，但代码仍引用 |
| anime.js | 点击爆炸特效 | 功能已关闭，但代码仍引用 |
| mermaid | 流程图渲染 | 功能已关闭 |

**问题**: `staticfile.org` 历史上经历过服务调整。一旦不可用，进度条、图片画廊等功能将静默失败。此外，部分已关闭功能（lock、click_effect、mermaid）的 CDN 引用仍保留在模板中，虽不会被加载，但增加了代码债务。

**建议**:
- 将核心功能依赖（pace.js、jquery-modal、justifiedGallery）自托管至 `themes/ayeria/source/js/`
- 为自托管不可行的 CDN 资源添加本地 fallback：
  ```html
  <script src="https://cdn.staticfile.org/pace/1.2.4/pace.min.js" defer></script>
  <script>window.Pace||document.write('<script src="/js/pace.min.js"><\/script>')</script>
  ```
- 清理已关闭功能的 CDN 引用（sweetalert2、anime.js、mermaid），或将这些引用也包裹在条件判断中

> **⚑ 顺序约束（影响 §6.2）**：核心资源（pace.js、jquery-modal、justifiedGallery）自托管完成后，§6.2（CDN 资源缺少 SRI）对这些资源的 SRI 覆盖需求自动消除。建议先实施本节，再评估 §6.2 剩余 CDN 引用的范围，可避免为即将自托管的资源做无效配置。

### 12.3 中文字体加载——对中国大陆用户的成本收益分析

**补充分析**（对 5.3 的扩展）:

针对中国大陆用户，`fonts.font.im`（Google Fonts 第三方镜像）引入的 Noto Serif SC + Noto Sans SC 共 4 个字重，存在以下问题：
- 第三方镜像 `fonts.font.im` 在国内部分地区的可用性和解析速度不明
- 4 个字重加在一起，在 3G/4G 移动网络下字体下载可能耗时 5-15 秒
- 中国大陆主流操作系统已内置优质中文字体：Windows（微软雅黑）、macOS/iOS（苹方）、Android（思源黑体/Noto Sans CJK）、Linux 桌面（文泉驿/思源）

**建议**（更新 5.3 的优先级）:
- **首选方案**: 移除外部字体加载，使用系统字体栈：
  ```css
  body {
    font-family: "PingFang SC", "Noto Serif SC", "Source Han Serif SC", 
                 "STSong", "SimSun", "Songti SC", "Microsoft YaHei", 
                 "STHeiti", "Noto Sans SC", "Source Han Sans SC", sans-serif;
  }
  ```
- 系统字体栈对所有地区用户都零开销，海外用户（macOS 苹方 / Windows 微软雅黑 / Linux 思源）同样获得良好体验
- 如果认为 Web Font 是品牌体验的必要部分，至少减少至 1 个字重，并评估改用 `fonts.googleapis.com` 官方源（中国大陆部分地区可访问）的可行性

### 12.4 缺少面向中国大陆的访问统计分析

**问题**:
- `google_analytics` 为空 — Google Analytics 在中国大陆被封锁，即使填写也无法收集数据，反而拖慢页面
- `baidu_analytics` 为空 — 百度统计是中国大陆最常用的站点分析工具
- `cnzz.enable: false` — 友盟统计也未启用
- 当前仅不蒜子（busuanzi）提供 PV/UV 计数，不蒜子是个人维护的免费服务，稳定性时有波动，且不提供用户行为分析

**建议**:
- 如需了解中国大陆用户访问情况，至少启用百度统计（`baidu_analytics` 填入统计 ID）
- 不蒜子 JS 建议添加 `defer` + 超时 fallback，避免其服务不稳定时阻塞页面渲染
- 如果出于隐私考量不使用任何分析工具，可在本报告中明确说明决策理由

### 12.5 giscus 评论系统在中国大陆的可用性

**分析**: giscus 依赖 GitHub Discussions API。GitHub 在中国大陆处于间歇性不可用状态（非持续封锁，但访问不稳定）。当 GitHub 不可用时：
- 评论模块无法加载，但不影响文章正文阅读（可降级功能）
- 评论加载失败不会阻塞页面渲染

**建议**: 当前方案可接受。建议在前端添加评论加载失败的友好提示（如"评论暂不可用"），并关注 GitHub 在中国大陆的可用性趋势。如果评论功能被证明为高频使用的核心功能，可考虑备选：Waline + Vercel（中国大陆部分地区可用）或 Twikoo + 腾讯云 CloudBase。

---

## 十三、问题优先级汇总

> **注**：部分问题之间存在实施顺序约束，已在各问题详情节中以 **⚑ 顺序约束** / **⚑ 前置依赖** / **⚑ 与 X.X 合并** 等方式标注。汇总表不重复展示，实施前请参阅对应详情节。

### 🔴 高优先级（影响用户体验或站点可发现性）


| #   | 问题                              | 类别    |
| --- | ------------------------------- | ----- |
| 7.1 | 缺少 Sitemap                      | SEO   |
| 7.2 | 缺少 robots.txt                   | SEO   |
| 5.1 | jQuery 每页无条件加载                  | 性能    |
| 8.2 | 主题构建未纳入 CI                      | CI/CD |
| 8.3 | CI 使用 `npm install` 而非 `npm ci` | CI/CD |
| 12.2 | 第三方 CDN 资源可用性风险（staticfile.org）     | 性能/架构 |
| 12.1 | GitHub Pages 中国大陆访问性能              | 架构/性能 |
| 14.1 | `ayeria.js` 单文件承担 13 种职责       | SOLID/SRP |
| 14.4 | jquery-modal / justifiedGallery 无条件加载 | SOLID/ISP |
| 14.5 | 51.la 统计 ID 硬编码在 JS 源码中       | SOLID/DIP |


### 🟡 中优先级（影响可维护性或工程规范）


| #    | 问题                                  | 类别    |
| ---- | ----------------------------------- | ----- |
| 4.1  | 简历页面与主站脱节                           | 自定义页面 |
| 2.4  | RSS 未配置                             | 配置    |
| 5.2  | jquery-modal/justifiedGallery 无条件加载 | 性能    |
| 5.3  | Google Fonts 加载策略（参见 12.3 中国大陆分析）    | 性能    |
| 6.2  | CDN 资源缺少 SRI                        | 安全    |
| 7.3  | 缺少 Open Graph / Twitter Card        | SEO   |
| 9.1  | 缺乏代码规范工具                            | 可维护性  |
| 10.1 | 渲染器单点依赖                             | 依赖管理  |
| 14.2 | `click_effect` 魔法数字分支                | SOLID/OCP |
| 14.3 | 评论系统 partial 参数接口不一致              | SOLID/LSP |
| 14.6 | 未使用 Hexo `_data/` 目录存储数据           | SOLID/OCP |


### 🟢 低优先级（优化建议，不影响功能）


| #    | 问题                          | 类别    |
| ---- | --------------------------- | ----- |
| 1.1  | `source/_drafts/` 混有非 Markdown 文件 | 目录结构  |
| 1.3  | 无用的 `.gitkeep`              | 目录结构  |
| 1.4  | 测试文件/页面残留                   | 目录结构  |
| 1.5  | 图片文件名使用中文                   | 目录结构  |
| 1.6  | 主题目录内遗留 `.old` 备份文件         | 目录结构  |
| 2.1  | `future: true`              | 配置    |
| 2.2  | `post_asset_folder: false`  | 配置    |
| 2.3  | 日期型永久链接层级过深                 | 配置    |
| 3.2  | 主题构建产物提交仓库                  | 主题架构  |
| 3.3  | `index.js` 为空壳              | 主题架构  |
| 4.2  | MC 页面架构独立                   | 自定义页面 |
| 4.3  | 手办柜页面 raw HTML              | 自定义页面 |
| 4.4  | 关于页面混合 Markdown/HTML        | 自定义页面 |
| 5.4  | 缺少图片优化管线                    | 性能    |
| 6.1  | 简历分析脚本可能过时                  | 安全    |
| 6.3  | 网站加密功能安全性不足                 | 安全    |
| 7.4  | URL 保留冗余后缀                  | SEO   |
| 8.1  | 缺少质量门禁                      | CI/CD |
| 9.2  | 根目录调试脚本积累（debug.py + debug_wsl.py） | 可维护性  |
| 9.3  | Git 提交信息不规范                 | 可维护性  |
| 10.2 | 主题 devDependencies 未在 CI 安装 | 依赖管理  |
| 11.1 | 缺少跳过导航链接                    | 可访问性  |
| 11.2 | 社交图标缺少可访问文本                 | 可访问性  |
| 12.4 | 缺少面向中国大陆的访问统计分析             | 可维护性  |
| 12.5 | giscus 评论系统中国大陆可用性            | 架构    |
| 14.7 | `core.js` 保留死代码 / `head.ejs` 内联样式泄漏 | SOLID/SRP |
| 14.8 | `meta_generator.js` 对 default_config 不必要依赖 | SOLID/DIP |
| 14.9 | `ayeria.js` 硬编码 `/search.xml` 路径      | SOLID/DIP |


---

## 十四、SOLID 原则审查

> **新增于 2026-05-18**：从 SOLID 五原则视角审查 ayeria 自研主题与项目本身的设计质量。由于本项目为 Hexo 博客（模板 + 预处理样式 + 少量 JS），而非 OOP 代码库，各原则的应用方式须调整：SRP 关注模块/文件的职责单一性；OCP 关注是否可通过配置/扩展点新增行为而无需修改现有代码；LSP 关注模板 partial 的可替换性；ISP 关注模块接口的聚焦程度；DIP 关注是否依赖抽象（Hexo 扩展点、配置接口）而非具体实现。

### 14.1 单一职责原则（SRP）

#### 14.1.1 主题模板层

**遵循良好**：
- 布局 partial 拆分细致：`head.ejs`（元数据）、`sidebar.ejs`（导航）、`footer.ejs`（页脚）、`article.ejs`（文章），各司其职
- `_partial/post/` 下将文章组件的标题、日期、分类、标签、分享、评论等拆分为 20 个独立 partial，每个只做一件事
- 样式系统 `source-src/css/_partial/` 有 29 个独立 Stylus partial（`article.styl`、`reward.styl`、`search.styl` 等），每文件只针对一个 UI 区域
- 主题 scripts 按功能域拆分：`helpers/`（模板辅助函数）、`filters/`（渲染过滤器）、`events/`（生命周期事件）、`utils/`（工具函数）

**违规**：

| 文件 | 问题 |
|------|------|
| `source-src/js/ayeria.js` | 单一文件混合 13 种职责：搜索弹窗、移动端检测、图片懒加载、画廊布局、锚点滚动、返回顶部、图片标题、移动端导航、打赏弹窗、暗色模式切换、Console 品牌 Banner、51.la 统计追踪 |
| `layout/_partial/after-footer.ejs` | 同时负责：jQuery 加载、Tocbot 初始化、画廊库加载、MathJax/Katex 条件注入、不蒜子统计、点击特效、代码复制、Canvas 背景、Mermaid 初始化 |
| `layout/_partial/head.ejs` | 内联 `<style>` 块（sweetalert2 按钮样式），属于样式职责泄漏到模板 |
| `scripts/lib/core.js` | 仅含注释掉的死代码，不存在有效功能却保留为独立文件 |

**评分**: ★★☆☆☆ — 局部优秀（partial/样式拆分），但 `ayeria.js` 和 `after-footer.ejs` 的严重违规拉低总分

#### 14.1.2 客户端 JS 层

| 文件 | 职责数 | 评估 |
|------|--------|------|
| `ayeria.js` | 13 | 🔴 严重违规 — 建议按功能拆分为 search.js, nav.js, darkmode.js, reward.js 等独立模块 |
| `share.js` | 1 | 🟢 良好 — 仅处理社交分享 |
| `random-sentences.js` | 1 | 🟢 良好 — 仅处理随机句子 |
| `main.js` | 0（仅 import） | 🟢 入口文件，职责为组装模块 |

**建议**: 将 `ayeria.js` 拆分为至少 6-8 个独立模块，通过 `main.js` 的 import 图组装。拆分后每个模块可独立测试、按需加载。

> **⚑ 统一方案见 §15**：§15 已提供完整的模块化拆分规划（拆分粒度、迁移策略、伴随修复项、提交顺序建议）。本条目、§14.4（justifiedGallery 无条件加载）、§14.5（51.la ID 硬编码）、§14.9（搜索路径硬编码）将在 §15 实施过程中统一解决，不应逐条单独修复。

#### 14.1.3 项目层面

**遵循良好**：
- `_config.yml` 负责 Hexo 核心配置，`_config.ayeria.yml` 负责主题配置 — 关注点分离清晰
- `.github/workflows/pages.yml` 单一职责：构建部署流水线
- `.github/dependabot.yml` 单一职责：依赖更新策略

**违规**：
- `_config.yml` 混合了站点元数据、URL 规则、分类/标签映射（内容分类学）、Markdown 渲染器配置 — 这些是不同变更原因的数据。建议将分类/标签映射抽到 `source/_data/` 下的独立数据文件
- 根目录 `debug.py`、`debug_wsl.py` 两个调试脚本与项目核心职责无关，属于工具链脚本，应归入 `scripts/`

---

### 14.2 开闭原则（OCP）

> 对扩展开放，对修改封闭。在 Hexo 主题语境下，核心检验标准是：新增功能/内容能否仅通过配置或新增文件完成，而无需修改已有模板或脚本。

#### 14.2.1 主题模板层

**遵循良好**：
- 菜单系统由 `_config.ayeria.yml` 的 `menu` 字段驱动，新增菜单项仅需追加 YAML 条目，`sidebar.ejs` 通过 `for` 循环渲染
- 打赏系统采用数据驱动设计：`reward.channels` 数组新增渠道只需追加 YAML 条目（含子选项 `children`），无需修改 `article.ejs` 或 JS
- 友情链接由 `_config.ayeria.yml` 的 `friends_link` 字段驱动，`friends.ejs` 遍历渲染
- 功能开关（`toc`、`image_viewer`、`share_enable`、`copy_btn`、`busuanzi` 等）通过 `theme.*` 配置控制，行为扩展通过新增 type 值（如 `reward_type: 0|1|2`）而不需改模板结构

**违规**：

| 位置 | 问题 | 建议 |
|------|------|------|
| `share.js:45-62` | 社交平台通过 `if/else if` 硬编码；新增平台需修改函数体 | 改为配置驱动的 URL 模板映射：`const platforms = { weibo: 'http://service.weibo.com/...', ... }` |
| `layout.ejs:5-10` | `click_effect` 使用魔法数字 1/2/3，各自硬编码 `<canvas>` 元素和脚本加载；新增效果类型需改 layout | 定义效果注册表，通过配置驱动而非硬编码分支 |
| `after-footer.ejs:54-67` | 点击特效 1/2/3 各占一个独立条件块，加载不同 CDN 脚本；无统一抽象 | 将所有效果整合为统一的条件加载逻辑 |
| `head.ejs:46-57` | 网站锁（lock）的 sweetalert2 CDN 引用和内联样式硬编码在 `<head>` 中 | 若功能已关闭（当前 enable: false），应删除相关代码或将 CDN 加载包裹在条件内（已包裹但多余） |

#### 14.2.2 主题样式层

**遵循良好**：
- `_variables.styl` 集中定义设计令牌（颜色、字体、尺寸、断点），换肤只需修改变量值
- Stylus `_mixins.styl` 提供可复用混入（`center()`、`clearfix()` 等），组件样式通过调用混入扩展
- 29 个 `_partial/*.styl` 通过 `style.styl` 的 `@import` 列表组织，新增组件样式文件只需追加一行 import

**违规**：
- 部分样式 partial 内部硬编码颜色值而非引用变量（如 `_partial/reward.styl` 中可能存在），降低了通过 `_variables.styl` 换肤的覆盖力

#### 14.2.3 项目层面

**遵循良好**：
- Hexo 插件体系：安装新的 generator/renderer 只需 `npm install` + 追加 `_config.yml` 配置
- `skip_render` 列表支持按需添加独立页面目录
- `category_map`、`tag_map` 支持无限扩展分类/标签映射

**违规**：
- 新增独立页面（如 `mc-server`、`resume`）需手动在 `source/` 创建目录并更新 `skip_render`，无脚手架或自动化支持
- 未使用 Hexo `source/_data/` 数据目录机制；MC 服务器成员数据硬编码在 `source/mc-server/js/members.js` 中，手办柜数据嵌入在 `source/waifu/index.md` 的 HTML 块中 — 修改这些数据需编辑源文件内容而非纯数据文件

**评分**: ★★★☆☆ — 配置驱动的菜单/打赏/友链设计是亮点，但 JS 层的硬编码 `if/else` 链和页面数据的嵌入式管理拖低评分

---

### 14.3 里氏替换原则（LSP）

> 在 OOP 中要求子类型可替换基类型。在 Hexo 模板语境下，LSP 映射为：**模板 partial 是否可被同接口的替代实现替换而不破坏页面**。

#### 14.3.1 评论系统 partial 的可替换性

评论系统 partial（`giscus.ejs`、`gitalk.ejs`、`valine.ejs`、`twikoo.ejs`）在 `article.ejs` 中通过条件判断引用：

```ejs
<% if (theme.valine && theme.valine.enable && !post.no_valine) { %>
  <%- partial('post/valine', { key: ..., title: ..., url: ... }) %>
<% } %>
<% if (!index) { %>
  <%- partial('post/giscus') %>
<% } %>
```

**问题**: 评论 partial 的参数接口不一致 — `valine` 接收 `{key, title, url}` 参数对象，而 `giscus` 不接收参数（从 `theme.giscus` 直接读取）。切换评论系统时，调用侧的参数传递逻辑需要修改。

**建议**: 统一评论 partial 的调用接口，例如全部通过 `theme` 配置读取参数，使调用侧统一为 `<%- partial('post/comment') %>`，内部再根据配置分发到具体实现。

#### 14.3.2 文章组件 partial

`_partial/post/` 下的组件（`title.ejs`、`date.ejs`、`category.ejs`、`tag.ejs` 等）在 `article.ejs` 中通过统一的 `partial()` 调用，接口一致（接收 `{class_name}` 等可选参数），可替换性良好。

**评分**: ★★★☆☆ — 文章组件 partial 遵循良好，评论系统 partial 接口不一致是主要问题

---

### 14.4 接口隔离原则（ISP）

> 要求模块不应被迫依赖它不需要的接口。在 Hexo/前端语境下，映射为：客户端不应加载不需要的 JS/CSS，模板不应被迫包含无关逻辑。

#### 14.4.1 客户端 JS 资源加载

**严重违规**：

| 资源 | 加载位置 | 实际需求 | 浪费 |
|------|---------|---------|------|
| `jquery-3.6.0.min.js` (90KB) | `after-footer.ejs:1` — 无条件加载 | 仅 modal、justifiedGallery、lazyload 等少数功能使用 | 所有页面均加载 |
| `jquery.modal.min.js` + CSS | `after-footer.ejs:22-23` — 无条件加载 | 仅图片画廊文章页使用 | 首页、归档页、分类页等均加载 |
| `jquery.justifiedGallery.min.js` | `after-footer.ejs:24` — 无条件加载 | 仅含画廊标记的文章页使用 | 同上 |
| `pace.min.js` | `head.ejs:43` — 由 progressBar 配置控制 | 有条件判断（`theme.progressBar`） | ✅ 已有条件 |
| `sweetalert2` JS + CSS | `head.ejs:46-57` — 由 lock.enable 控制 | lock 功能已关闭 | ✅ 已包裹条件 |

**建议**: 将 jquery-modal 和 justifiedGallery 加载包裹在页面类型条件中（仅文章详情页且有画廊标记时加载）。

> **⚑ 与 §5.2 重复；覆盖于 §15**：本条目与 §5.2 描述同一问题。§15.2 的模块化重构方案已统一规划（justifiedGallery 初始化移入 `after-footer.ejs` 并添加页面条件），应在 §15 实施时一并完成，不单独修复。

#### 14.4.2 客户端 JS 模块

- `ayeria.js` 是典型的"胖接口"问题 — 每个页面只需其中 2-3 个功能（如首页只需搜索+暗色模式），却被迫加载全部 13 个功能模块
- `share.js` 和 `random-sentences.js` 通过独立文件加载是好的 ISP 实践，但它们通过 `main.js` 汇总，仍然是全量打包。当前的 Rollup 配置将所有模块打包为一个 `main.js`，按需加载需要代码分割（code splitting）

**评分**: ★★☆☆☆ — JS 和第三方库的全量加载是本站性能最大的可改进空间，也是 ISP 最明显的违规

#### 14.4.3 Hexo 脚本 helpers

`scripts/helpers/` 下的 helper 函数通过 `hexo.extend.helper.register()` 注册，各 helper 独立注册，模板按需调用。这是良好的 ISP 实践：
- `wordcount.js` 注册 `min2read`、`wordcount`、`totalcount` 三个聚焦 helper
- `category-tree.js` 仅注册 `category_tree` 一个 helper
- `ayeria-plus-vendors.js` 仅注册 `ayeria_plus_vendors` 一个 helper

---

### 14.5 依赖反转原则（DIP）

> 高层模块不应依赖低层模块，二者都应依赖抽象。在 Hexo 主题语境下，核心检验标准是：主题代码是否依赖 Hexo 提供的抽象接口，而非直接耦合具体实现或全局变量。

#### 14.5.1 主题服务端（scripts/）

**遵循良好**：
- Helper 通过 `hexo.extend.helper.register()` 注册 — 依赖 Hexo 扩展 API 而非直接操作文件系统
- Filter 通过 `hexo.extend.filter.register()` 注册 — 依赖 Hexo 渲染管线抽象
- Event handler 通过 `hexo.on()` 绑定 — 依赖 Hexo 生命周期事件
- `merge-configs.js` 依赖 `object.js` 的 `merge()` 工具函数 — 工具函数是纯函数抽象，不依赖外部状态

**违规**：
- `meta_generator.js` 依赖 `default_config.js` 的具体模块（硬编码 `require('../default_config')`），而非通过 Hexo 的 `hexo.theme.config` 接口读取配置。`default_config.js` 仅有一个 `meta_generator: true` 属性，此依赖不仅冗余且造成不必要的耦合
- `core.js` 的 `hexo.on('new', ...)` 和 `before_post_render` 过滤器为无操作的死代码，但对 Hexo 事件总线的注册仍在执行

#### 14.5.2 客户端 JS（source-src/js/）

**严重违规**：

| 违规项 | 详情 |
|--------|------|
| `ayeria.js` 全模块依赖 jQuery | 整个模块包裹在 `(function($){...})(jQuery)` 中，与 jQuery 紧耦合。无法在无 jQuery 环境下运行，单元测试需要 jQuery DOM 模拟 |
| `ayeria.js:245-269` 硬编码 51.la 统计 ID | `{ id: "JGjrOr2rebvP6q2a", ck: "JGjrOr2rebvP6q2a" }` 直接写在源码中，应通过 HTML `data-*` 属性或 `theme` 配置传入 |
| `ayeria.js:37` 硬编码搜索文件路径 | `/search.xml`、`/js/search.js` 路径硬编码，若配置修改 `search.path` 则搜索功能静默失败 |
| `share.js` 依赖全局 DOM | 直接访问 `window.location.href`、`document.querySelector` 等全局对象，无抽象层。这使得模块无法脱离浏览器环境测试 |

**特别值得关注**：`ayeria.js` 中的 51.la 追踪 ID 与 `footer.ejs` 中 cnzz 统计的配置驱动模式形成对比 — cnzz 通过 `theme.cnzz.url` 配置，51.la 却硬编码在 JS 中，风格不一致。

> **⚑ 覆盖于 §15**：51.la 硬编码 ID（14.5 条目）和搜索路径硬编码（14.9 条目）均在 §15.3 第 3–4 点规划了具体迁移方案，应作为 §15 模块化重构的组成部分统一实施，不单独修复。

#### 14.5.3 模板与 CDN 依赖

- 所有 CDN URL（staticfile.org、fonts.font.im）硬编码在 EJS 模板中，未通过配置变量引用
- 主题的 Rollup 构建管线（`rollup.config.js` 或等效的 rollup -c）正确处理了 `source-src/` → `source/dist/` 的抽象：源码与构建产物分离，模板引用构建后的抽象路径 `dist/main`

**评分**: ★★★☆☆ — scripts/ 服务端遵循良好，客户端 JS 的 jQuery 耦合和硬编码配置是核心问题

---

### 14.6 SOLID 审查总结

#### 主题评分

| 原则 | 评分 | 关键依据 |
|------|------|---------|
| SRP | ★★☆☆☆ | 模板/样式拆分优秀，但 `ayeria.js` (13 职责) 和 `after-footer.ejs` (10+ 职责) 严重违规 |
| OCP | ★★★☆☆ | 菜单/打赏/友链数据驱动是亮点，但 JS 的 `if/else` 链和点击特效的硬编码分支破坏扩展性 |
| LSP | ★★★☆☆ | 文章组件 partial 可替换性好，评论系统 partial 接口不一致 |
| ISP | ★★☆☆☆ | 第三方库全量加载、`ayeria.js` 胖接口、Rollup 全量打包是主要问题 |
| DIP | ★★★☆☆ | 服务端 helpers/filters 依赖 Hexo 抽象正确；客户端 JS 紧耦合 jQuery 且硬编码外部依赖 |

**主题 SOLID 总评**: ★★★☆☆

#### 项目评分

| 原则 | 评分 | 关键依据 |
|------|------|---------|
| SRP | ★★★★☆ | `_config.yml` / `_config.ayeria.yml` 关注点分离清晰，CI 文件职责单一 |
| OCP | ★★★☆☆ | Hexo 插件体系提供良好扩展性，但 `_data/` 目录缺失导致数据耦合在页面文件中 |
| LSP | N/A | 项目层不涉及模板/组件的替换场景，此原则不适用 |
| ISP | ★★★☆☆ | Dependabot、GitHub Actions 各司其职；配置文件的分类/标签映射与核心配置混合 |
| DIP | ★★★★☆ | CI 依赖版本化 Action 抽象，`package.json` 依赖 npm 包接口，架构层面依赖倒置良好 |

**项目 SOLID 总评**: ★★★☆☆

#### 问题优先级（SOLID 相关）

##### 🔴 高优先级

| # | 问题 | 原则 | 影响 |
|---|------|------|------|
| 14.1 | `ayeria.js` 单一文件承担 13 种职责 | SRP | 维护困难、无法按需加载、无法独立测试 |
| 14.4 | `after-footer.ejs` 无条件加载 jquery-modal + justifiedGallery | ISP | 所有页面浪费带宽 |
| 14.5 | 51.la 统计 ID 硬编码在 JS 源码中 | DIP | 更换 ID 需修改源码并重新构建 |
| 14.5 | `share.js` 硬编码 `if/else` 平台链 | OCP | 新增社交平台需修改函数体 |

##### 🟡 中优先级

| # | 问题 | 原则 | 影响 |
|---|------|------|------|
| 14.2 | `click_effect` 魔法数字分支 | OCP | 新增效果需改 layout |
| 14.3 | 评论系统 partial 参数接口不一致 | LSP | 切换评论系统需修改调用侧代码 |
| 14.3 | `head.ejs` 内联 sweetalert2 样式 | SRP | 样式泄漏到模板 |
| 14.6 | 未使用 Hexo `_data/` 目录 | OCP/DIP | 数据修改需接触源文件 |

##### 🟢 低优先级

| # | 问题 | 原则 | 影响 |
|---|------|------|------|
| 14.7 | `core.js` 保留死代码 | SRP | 增加认知负担 |
| 14.8 | `meta_generator.js` 对 `default_config.js` 的不必要依赖 | DIP | 轻微耦合 |
| 14.9 | ayeria.js 硬编码 `/search.xml` 路径 | DIP | 与 `_config.yml` 的解耦缺失 |

---

## 十五、`ayeria.js` 模块化重构方案

> **新增于 2026-05-20**：本节为 §14.1 / §14.4 / §14.5 所描述客户端 JS 问题的专项拆分方案，是近期重构的主要方向。

### 15.1 问题归纳

`ayeria.js` 是一个包裹在 `(function($){...})(jQuery)` 内的单体 IIFE，共 280 行，包含 13 个功能块：

| # | 功能块 | 行范围 | 附带问题 |
|---|--------|--------|----------|
| 1 | 搜索弹窗（open/close 动画 + 懒加载 search.js）| 1–39 | 硬编码 `/search.xml`、`/js/search.js` 路径（§14.9） |
| 2 | 移动端检测（`isMobile` 对象）| 42–67 | **死代码**：文件内从未调用 |
| 3 | 图片懒加载初始化 | 69–72 | — |
| 4 | JustifiedGallery 初始化 | 74–78 | 每页执行，仅画廊文章需要；库在 after-footer.ejs 中加载（§14.4） |
| 5 | 封面 Anchor 滚动 | 80–86 | — |
| 6 | 返回顶部按钮 | 88–116 | — |
| 7 | 图片 alt → caption | 118–129 | — |
| 8 | 移动端侧边栏切换 | 131–139 | — |
| 9 | Popup 弹出窗口菜单项 | 141–150 | — |
| 10 | 打赏弹窗（open/close/tab/sub-tab/Escape）| 152–196 | SKILL.md 已标注"待后续重构" |
| 11 | 暗色模式切换（含 giscus 同步）| 198–231 | — |
| 12 | Console 品牌 Banner | 233–252 | — |
| 13 | 51.la 统计追踪（IIFE 外部）| 255–280 | ID 硬编码在 JS 源码中（§14.5） |

所有功能块均紧耦合 jQuery（`$(...)`），无法脱离 jQuery + 浏览器环境独立运行。

---

### 15.2 拆分方案

将 `source-src/js/ayeria.js` 按功能域拆分为 6 个独立模块，并对 4 项附带问题做伴随修复：

| 新文件 | 迁入功能块 | 备注 |
|--------|-----------|------|
| `search-modal.js` | #1 | 同步修复 §14.9：搜索路径改从 `<meta>` 或 `data-*` 属性读取，不再硬编码 |
| `nav.js` | #8、#9 | 移动端 Nav + Popup 菜单，同一关注点合并 |
| `scroll.js` | #5、#6 | Anchor 滚动 + 返回顶部，均属页面滚动行为 |
| `article.js` | #3、#7 | 懒加载初始化 + alt→caption，均属文章内容增强 |
| `reward.js` | #10 | 完成 SKILL.md 中已预告的拆分 |
| `darkmode.js` | #11 | — |

**不迁入新文件的功能块：**

| 功能块 | 处置方式 |
|--------|---------|
| #2 `isMobile` | 直接删除（死代码） |
| #4 JustifiedGallery 初始化 | 移入 `after-footer.ejs`，与库加载代码合并并添加页面条件，不作为独立 JS 模块 |
| #12 Console Banner | 保留在 `main.js` 入口顶层作为一次性副作用 |
| #13 51.la 追踪 | 从 JS bundle 中完全移除；改为新增 `_partial/tracking.ejs`，ID 写入 `_config.ayeria.yml` 配置项，参照 `google-analytics.ejs` / `baidu-analytics.ejs` 模式 |

重构后 `main.js` 结构：

```js
import "./css/style.styl";
import "./js/search-modal";
import "./js/nav";
import "./js/scroll";
import "./js/article";
import "./js/reward";
import "./js/darkmode";
import "./js/share";
import "./js/random-sentences";
// Console banner 作为入口副作用内联于此
```

---

### 15.3 实施要点

**1. jQuery 依赖处理**

拆分阶段保留各模块内的 jQuery 调用，不同步去 jQuery 化（工程量翻倍且目标不同）。去掉外层 `(function($){...})(jQuery)` IIFE 包裹即可；各模块直接引用全局 `$`，Rollup 打包为 IIFE 格式时与现行行为等价。后续若推进 §5.1（移除 jQuery），针对每个独立模块逐一替换为原生 DOM API，成本更低。

**2. JustifiedGallery 迁移到模板**

删除 `ayeria.js` 中的 `$("#gallery").justifiedGallery(...)` 调用，在 `after-footer.ejs` 的 justifiedGallery CDN 引用后追加初始化，并将整段包裹在条件中（同步解决 §14.4）：

```ejs
<% if (!index && (page.photos || page.gallery)) { %>
  <script src="https://cdn.staticfile.org/justifiedGallery/3.8.1/js/jquery.justifiedGallery.min.js"></script>
  <script>$("#gallery").justifiedGallery({ rowHeight: 200, margins: 5 });</script>
<% } %>
```

**3. 51.la 迁移**

在 `_config.ayeria.yml` 增加 `tracking.la51_id` 配置项；新增 `_partial/tracking.ejs`，由 `after-footer.ejs` 在配置非空时条件引用。原 `ayeria.js` 末尾的整段 IIFE（第 255–280 行）删除。

**4. 搜索路径去硬编码**

`search-modal.js` 中的 `/search.xml` 和 `/js/search.js` 改从 EJS 模板注入的 `data-*` 属性读取：

```ejs
<%# 在 search.ejs partial 中 %>
<div class="local-search" data-xml="<%= config.search.path || '/search.xml' %>" data-script="/js/search.js">
```

---

### 15.4 善后操作清单

重构完成后，按序执行以下文档和配置更新：

#### A. 更新 `doc/SKILL.md`

将「五、交互行为规范 → JS 文件职责」小节替换为以下内容（反映新模块列表，删除"待后续重构"备注）：

```
- `search-modal.js`：搜索弹窗开关动画
- `nav.js`：移动端侧边栏切换、Popup 弹出菜单
- `scroll.js`：封面 Anchor 滚动、返回顶部
- `article.js`：文章内容增强（图片懒加载初始化、alt→caption）
- `reward.js`：打赏弹窗（open/close/tab/sub-tab/Escape）
- `darkmode.js`：暗色模式切换，含 giscus 主题同步
- `share.js`：分享组件（下拉气泡 + 微信二维码弹窗）
- `random-sentences.js`：随机句子组件
- `main.js`：模块组装入口 + Console 品牌 Banner
```

#### B. 更新本文档

- §14.1.1、§14.1.2 中 `ayeria.js` 的 SRP 违规条目标记为 **已修复**，注明新模块结构
- §14.4（jquery-modal/justifiedGallery 无条件加载）中 justifiedGallery 部分标记为 **已修复**
- §14.5 中 51.la 硬编码 ID 的条目标记为 **已修复**
- §14.9 中 `/search.xml` 硬编码路径的条目标记为 **已修复**
- §14.6 SOLID 评分表：客户端 JS SRP 违规消除，整体 SRP 评分由 ★★☆☆☆ → ★★★★☆
- §13 优先级汇总：将 14.1、14.5 相关条目从 🔴 移除（或标注已解决）
- 文档顶部总评表：「SOLID 原则」★★★☆☆ → ★★★★☆

#### C. 构建与功能验证

```bash
cd themes/ayeria
npm run build
# 验证 source/dist/main.js 正常输出且体积无异常增大
```

本地 `hexo server` 逐项验证：

- [ ] 搜索弹窗开关、搜索结果正常
- [ ] 移动端侧边栏切换正常
- [ ] 返回顶部按钮正常
- [ ] 文章页图片 caption 正常
- [ ] 打赏弹窗 open/close/tab 切换正常
- [ ] 暗色模式切换正常，刷新后状态保持
- [ ] 画廊页面 JustifiedGallery 正常，非画廊页无加载
- [ ] 分享组件正常
- [ ] 随机句子正常

#### D. 提交规范

建议按模块逐次提交，便于日后 `git bisect`：

```
refactor(js): extract reward.js from ayeria.js
refactor(js): extract darkmode.js from ayeria.js
refactor(js): extract nav.js from ayeria.js
refactor(js): extract scroll.js from ayeria.js
refactor(js): extract article.js from ayeria.js
refactor(js): extract search-modal.js from ayeria.js
refactor(js): remove isMobile dead code
refactor(template): move justifiedGallery init to after-footer.ejs
feat(tracking): migrate 51.la to EJS template with config-driven ID
docs: update SKILL.md JS file responsibilities
```

---

## 附录：架构亮点

本节列出项目中值得肯定的设计决策，供参考：

1. **主题 "吸收式" 管理**：将已停更的上游 Ayer 主题吸收为项目一等公民代码，并完成品牌重命名（Ayeria），避免了 submodule 同步负担，是合理的架构选择。
2. **样式系统模块化重构**：`custom.styl` 从 973 行 `@css {}` 堆砌重构为 17 行用户覆盖入口，29 个 Stylus partial 分功能管理样式，彻底纳入 Rollup 构建管线，是本报告周期内最重要的架构改进。
3. **评论系统迁移**：从 Gitalk（存在 OAuth Secret 泄露风险）迁移至 giscus（基于 GitHub Discussions，无需 Secret），安全性和可维护性显著提升。
4. **数据驱动的打赏系统**：`_config.ayeria.yml` 中的 `reward.channels` 采用数据驱动设计，新增渠道只需追加 YAML 条目，无需修改模板代码，且已支持带子选项的多链路加密货币打赏。
5. **MC 服务器成员数据分离**：`members.js` 将成员数据与渲染逻辑分离，新增成员只需编辑数据数组。
6. **GitHub Actions 部署流程**：使用 `actions/cache` 缓存 npm 依赖、`upload-pages-artifact` + `deploy-pages` 官方 Action，流程规范。
7. **Dependabot 配置**：已调整为每周检查、最多 5 个 PR，减少噪音同时保持依赖更新。
8. **搜索弹窗重设计**：使用 CSS 自定义属性实现亮/暗模式自动跟随，交互体验良好。
9. **代码块样式系统**：通过 CSS 自定义属性实现 VS Code 风格的亮/暗双模式代码高亮，支持语言标签显示。
10. **SRP — 模板/样式/Helper 细粒度拆分**：20+ 个 post partial、29 个 Stylus partial、独立的 helpers/filters/events 目录，职责分离在模板层的落实程度是主题工程化的基石。
11. **OCP — 数据驱动的配置体系**：菜单、友情链接、打赏渠道（含多级子选项）均由 YAML 配置数组驱动，新增条目无需修改模板代码，这是 SOLID 在主题中最成功的落地。
12. **DIP — 服务端依赖 Hexo 抽象接口**：scripts 下所有 helper、filter、event handler 通过 `hexo.extend.*` 和 `hexo.on` 注册，未直接操作文件系统或 Hexo 内部实现。
