# 博客项目架构分析报告

> **分析日期**: 2026-04-13
> **最后更新**: 2026-09-17（全面复核：新增 §5.5、重排 §13、补充 §16；更正 §1.1/§1.5/§5.1/§5.2/§5.4/§8.3/§9.1/§12.2/§12.4/§14.1.3/§14.4.1 等过期结论）
> **复核基线**: 工作区 `2410a83`（2026-09-11）。本地分支落后 `origin/main` 13 个提交，差异仅为文章/静态页数据与 `pages.yml` 手动触发按钮，主题与站点架构代码未变，本文结论对两者均适用。
> **历史更新**: 2026-05-25（#3.4、#8.2、#3.2、#3.3、#2.1 已修复；#10.2 同步关闭；#1.5、#1.6 已忽略；#3.5 新增亮暗系统遗留问题；§3.4 勘误：`_variables.styl` → `_variables.styl` + `_tokens.styl` 拆分；#3.5.1 已修复）
> **本次复核摘要**: 见 §16，优先级重排见 §13。核心结论：图片体积、搜索索引 eager load、KaTeX `allpost`、外部字体与死依赖是当前最值得处理的性能问题；permalink 扁平化、`category_map` 数据化、`ayeria.js` 六模块大拆分经复核后不建议/降级。
> **分析范围**: 项目整体架构、目录结构、配置体系、主题架构、CI/CD、性能、安全、SEO、可维护性、SOLID 原则
> **参考基准**: Hexo 官方最佳实践、GitHub Pages 部署惯例、静态站点生成器行业通用规范、SOLID 五原则在非 OOP 场景下的适用标准
> **前置审查**: 本报告基于 [2026-03-28 审查报告](archive/audit-report-2026-03-28.md) 的修复成果，不重复已关闭问题，仅关注架构层面

---

## 总评


| 维度    | 评分    | 说明（2026-09-17 复核） |
| ----- | ----- | --------------------------------------------------- |
| 目录结构  | ★★★☆☆ | Hexo 骨架完整；根目录仍有调试脚本与 `themes/.gitkeep`，`source/_drafts/` 混有 42 个非标准文件，`source/test/` 仍会进入生产输出 |
| 配置体系  | ★★★★☆ | 分层配置清晰；`skip_render` 已扩充但漏掉 `test/**`；主题默认配置缺失（只剩 `_config.yml.old`），对主题独立复用/升级有影响 |
| 主题架构  | ★★★☆☆ | 样式模块化与构建产物忽略已完成；主要问题变为：`ayeria.js` 单体、主题无锁文件/默认配置、页面资源加载未按需化 |
| CI/CD | ★★★☆☆ | 部署流程规范且包含主题构建；但依赖安装不可复现、缓存 key 实际为常量、Dependabot 未覆盖主题（§8.3/§10.3） |
| 性能    | ★★☆☆☆ | 图片未优化（目录 29.7MB、单篇文章 22MB）、全文搜索索引 eager load、KaTeX/PhotoSwipe/clipboard/字体等每页加载；详见 §5.4/§5.5 |
| 安全    | ★★★★☆ | OAuth 泄露已修复；仍有 lock 默认密码、51.la 默认追踪、剩余 CDN 资源无 SRI |
| SEO   | ★★☆☆☆ | 仍缺 Sitemap、robots.txt、Open Graph/Twitter Card；旧版 URL 扁平化建议已撤回（§2.3） |
| 可维护性  | ★★★☆☆ | 主题文档/构建工具链陈旧、主题默认配置缺失、根目录调试脚本未归置；改进点已明确 |
| SOLID 原则 | ★★★☆☆ | 模板/样式拆分良好；`ayeria.js` 单体仍是主要问题，但完整拆分收益以维护性为主，优先级已下调（§15/16） |

---

## 一、目录结构

### 1.1 根目录非标准目录已移除，但 `source/_drafts/` 语义仍不纯（部分遗留）

**位置**: `source/_drafts/`

**原问题**: `文章模板暂存处/` 目录位于项目根目录，内含未发布的 Markdown 草稿和无关文件（如 `哲学.py`、`编剧.md`、`生产资料.md`）。

**当前状态（2026-09-17 复核）**: 根目录的 `文章模板暂存处/` 已移除，相关内容迁入 `source/_drafts/` 。但 `source/_drafts/` 仍有 42 个文件（约 326KB），其中 `哲学.py` 为非 Markdown 文件，另有 16 个 Markdown 文件（`ideas.md`、`生产资料.md`、`编剧.md`、`丝路创意文档.md` 等）缺少 Hexo front-matter，不会被构建。它们占用仓库篇幅，并稀释 `_drafts/` 作为文章草稿区的语义。

**建议**: 将 `哲学.py` 等非文章文件移出 `source/_drafts/`（例如 `doc/drafts/` 或 `tools/notes/`）；没有发布计划的 Markdown 归入 `doc/drafts/` 或补齐 front-matter。优先级低，可在下次批量整理草稿时顺手完成。

### ~~1.2 （已修复）残留配置文件~~

~~**位置**: `_config.landscape.yml`~~

~~已删除，无需再跟进。~~

### ~~1.3 （已忽略）主题目录中的 `.gitkeep`~~

~~**位置**: `themes/.gitkeep`~~

~~**问题**: 该文件用于在 Git 中保留空的 `themes/` 目录。由于 `themes/ayeria/` 已有内容，此文件已无必要。~~

~~**建议**: 删除该文件。~~

### 1.4 测试文件残留

~~**位置**:~~

~~- `source/images/test.png`（已删除 ✓）~~
~~- `themes/ayeria/source/test-random-sentences.html`（已删除 ✓）~~

**位置**: `source/test/`（视差滚动效果演示页面，含 `index.md` 和 `img/` 图片）

**问题**: `source/test/index.md` 是视差滚动演示页，会被 Hexo 构建并部署到生产站点（当前未在 `skip_render` 中排除）。

**建议**: 将 `source/test/` 加入 `_config.yml` 的 `skip_render`。

> **2026-09-17 复核**：`source/test/` 仍未加入 `skip_render`，问题依然存在。此后 `skip_render` 新增了 `DDoS-Test-Lab/**` 与 `poetry-stats/**`，但仍未包含 `test/**`；`source/water/water.html` 也未列入。建议统一审查所有独立页面目录（至少 `test/**`），避免演示页进入生产输出与搜索引擎抓取范围。

### ~~1.5 （已忽略）图片文件名使用中文~~

~~**位置**: `source/images/` 下多个文件，如 `丹凤门.jpg`、`京都八坂神社西门.webp`、`伪史论.jpeg` 等~~

~~**问题**: 中文文件名在 URL 编码后会变成长串百分号字符（如 `%E4%B8%B9%E5%87%A4%E9%97%A8.jpg`），影响：~~

~~- URL 可读性和可分享性~~
~~- 部分旧版服务器/CDN 的兼容性~~
~~- 终端操作体验~~

~~**建议**: 将图片文件名统一为英文或拼音，在 Markdown 中更新引用路径。~~

> **2026-09-17 复核更正**：原判据图片数量有限已不成立`source/images/` 现有 50 个文件、约 29.7MB，其中约 21 个中文文件名。中文文件名仍不构成功能性阻塞，维持低优先级；但如果执行 5.4 的图片批量优化，建议顺带改为 ASCII/拼音命名，以改善 URL 可读性、分享和命令行/构建工具兼容性。

### ~~1.6 （已忽略）主题目录内遗留备份文件~~

~~**位置**:~~

~~- `themes/ayeria/_config.yml.old`~~
~~- `themes/ayeria/source/favicon.ico.old`~~
~~- `themes/ayeria/source/favicon.svg.old`~~

~~**问题**: 这些 `.old` 后缀文件是开发过程中遗留的备份，无实际功能，会被 Hexo 原样复制至 `public/`（已确认 `public/favicon.ico.old` 和 `public/favicon.svg.old` 出现在构建产物中）。~~

~~**建议**: 删除上述文件；`_config.yml.old` 中的历史配置如需留存，提交至 Git 历史即可，无需作为文件保留在仓库中。~~

~~> **已忽略（2026-05-25）**：这些备份文件体积微小，不影响构建结果的功能正确性。如需清理可随时删除，但非紧急事项。~~

---

## 二、配置体系

### ~~2.1 （已修复）`future: true` 允许未来日期文章发布~~

~~**位置**: `_config.yml` — `future: true`~~

~~**问题**: 此配置允许发布日期在未来的文章。这在生产环境中是不寻常的——通常仅用于本地预览草稿。如果误设文章日期为未来时间，文章会直接上线。~~

~~**建议**: 将 `future` 设为 `false`。本地预览时使用 `hexo server --future` 参数。~~

~~> **已修复（2026-05-25）**：`_config.yml` 中 `future` 已设为 `false`。~~

### 2.2 `post_asset_folder: false` 导致图片管理分散

**位置**: `_config.yml` — `post_asset_folder: false`

**问题**: 所有文章图片集中在 `source/images/` 全局目录，而非按文章组织。随着文章增多：

- 难以确定某张图片属于哪篇文章
- 删除文章时无法安全清理关联图片
- 图片与文章的引用关系不明确

**建议**: 启用 `post_asset_folder: true`，Hexo 会在创建文章时自动生成同名文件夹，使用 `![img](image.png)` 相对路径引用。对于已有文章，可逐步迁移。

> **2026-09-17 复核**：维持可选、不紧急判断。`post_asset_folder: true` 对已有 50 个全局图片没有帮助，反而增加迁移与相对路径风险；`source/_drafts/2026-09-07-pure-latex-post-support-options.md` 也明确建议不应仅为了 LaTeX 文章全局开启。只有文章专属图片数量显著增长时再评估。

### 2.3 日期型永久链接层级过深（2026-09-17 复核：不建议修改）

**位置**: `_config.yml`  `permalink: :year/:month/:day/:title/`

**问题**: 生成类似 `/2025/10/02/how-to-use-hexo/` 的 URL，层级达 4 层。旧报告认为行业趋势是更扁平的 URL，不利于 SEO 和分享。

**复核结论（2026-09-17）**: **不建议实施**。GitHub Pages 是纯静态托管，没有服务端重定向；更换 permalink 结构会让现有全部文章 URL 404，需要为每篇旧链接生成 HTML meta refresh 跳转页或保留旧路径副本，改造成本与风险都很高。日期型 URL 对博客是常见且稳定的结构，旧报告所称搜索引擎偏好更浅 URL缺乏足以支撑全站迁移风险的证据。保留现状；如果未来确实要做，必须先产出完整重定向方案并一次性执行。

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

~~**原位置**: `themes/ayeria/source/css/custom.styl`（约 973 行）~~

~~**原问题**: 大量使用 `@css {}` 块（原始 CSS 注入），绕过 Stylus 预处理器，无法使用 Stylus 变量、嵌套、混入等特性。~~

~~**修复情况**: 已于 commit `92eb855` 完成全面重构。`custom.styl` 现仅 17 行，作为面向站点用户的覆盖样式入口（空白模板，附使用示例注释）。原有的全部样式逻辑已按功能拆分至 `source-src/css/_partial/` 下的 29 个独立 Stylus partial 文件（`article.styl`、`reward.styl`、`search.styl`、`highlight.styl` 等），通过 `style.styl` 统一 import，经 Rollup 构建输出。~~

**遗留事项（2026-09-17 复核更正）**: `source/css/` 下仍有 `ayeria-layout.styl`（由 `head.ejs` 引用）和 `clipboard.styl`（由 `after-footer.ejs` 在 `copy_btn` 开启时引用）两个独立 Stylus 文件未纳入 Rollup 管线。这是有意的分离（避免与 `dist/main.css` 合并），当前功能正常；建议在主题 README/维护文档中说明，不需要为统一管线重构。`custom.styl` 仍为 17 行，`source-src/css/_partial/` 仍为 29 个文件。

### ~~3.2 （已修复）主题构建产物提交到仓库~~

~~**位置**: `themes/ayeria/source/dist/`（`main.css`、`main.js`）~~

~~**问题**: Rollup 构建的产物（`source/dist/main.css` 和 `source/dist/main.js`）被直接提交到 Git 仓库。这是 Hexo 主题的常见做法（因为 Hexo 直接使用 `source/` 下的文件），但从工程角度看：~~

~~- 每次 `npm run build` 后需手动检查 diff 并提交~~
~~- 构建产物与源码混在同一仓库，增加仓库体积和 diff 噪音~~
~~- 可能出现源码更新但忘记重新构建的情况~~

~~**修复情况（2026-05-25）**: 依赖 §8.2（CI 主题构建已就位），不再需要将构建产物提交至仓库：~~

~~1. `themes/ayeria/.gitignore` 新增 `source/dist/`，忽略构建产物~~
~~2. `git rm --cached` 移除已跟踪的 `main.css`、`main.js`~~
~~3. CI 的 `Build theme` 步骤在每次部署前从 `source-src/` 源码生成最新的 `source/dist/` 文件~~

本地开发时，修改 `source-src/` 后仍需手动执行 `cd themes/ayeria && npm run build`。后续可考虑为 `hexo server` 添加主题 watch 自动构建的脚本。

~~> **⚑ 前置依赖 §8.2**：本修复以 CI 主题构建就位为前提。§8.2 未完成前不可移除 Git 中的构建产物。~~

> **2026-09-17 复核**：结论仍成立。`source/dist/` 未跟踪且 CI 会构建主题；补充：新克隆仓库中没有 `source/dist/`，本地 `hexo server/generate` 前必须先构建主题。这不是缺陷，但应在 README 或根 `package.json` 脚本中说明。主题无锁文件导致的构建不可复现问题见 §8.3/§10.3。

### ~~3.4 （已修复）暗色模式实现架构~~

> **新增于 2026-05-20** | **修复于 2026-05-25**

#### ~~现状描述（修复前）~~

~~暗色模式由三个机制共同构成：~~

~~1. `layout.ejs` 第 3 行：`<body class="darkmode">` — 暗色 class 硬编码在 HTML 源码中（暗色为默认）~~
~~2. `style.styl` 第 33–34 行：`body.darkmode { darkmode() }` — Stylus mixin 覆盖旧版组件样式~~
~~3. 新组件（`reward.styl`、`share.styl` 等）：`:root` 定义亮色 CSS 自定义属性，`body.darkmode` 定义暗色覆盖值~~

~~JS 切换逻辑（`ayeria.js`）：~~
~~- `sessionStorage.getItem("darkmode") == 0` → 移除 `darkmode` class（切换到亮色）~~
~~- 其他情况（默认/1）→ 保留 `darkmode` class（暗色）~~

#### `:root` = 亮色 + `body.darkmode` = 暗色的语义问题

**此模式本身符合业界惯例**：Tailwind CSS 用 `html.dark`，Bootstrap 5.3 用 `data-bs-theme="dark"` on `<html>`。用 `body` 代替 `html` 是轻微的偏离，但由于 `class="darkmode"` 硬编码在 HTML（而非 JS 动态添加），实际上没有暗色用户的 FOUC。

**语义异味（低优先级，无需立即修复）**：`:root` 在 CSS 中语义上代表"默认基准状态"，目前 `:root` = 亮色配置，而运行时默认是暗色。这是从上游 Ayer 主题（亮色默认）演化而来的痕迹，功能正确，但 CSS 语义与网站的实际默认状态相反。若要消除，需将暗色变量移至 `:root`，亮色变量改写在 `body.lightmode` 下，成本较高，收益有限。

#### ~~Bug 1：`sessionStorage` 应改为 `localStorage` 🟡（已修复）~~

~~**位置**：`source-src/js/ayeria.js` 第 210、222、228 行（迁移后为 `darkmode.js`）~~

~~**问题**：`sessionStorage` 的作用域是单个标签页/会话，关闭标签页或新开标签页后偏好丢失，用户每次都须重新切换亮色。业界标准是 `localStorage`（持久化到用户主动清除）。~~

~~**修复**：三处 `sessionStorage.getItem/setItem` 替换为 `localStorage.getItem/setItem`，一行一行改，无副作用。~~

~~> **⚑ 顺序约束**：必须先于 Bug 2 修复。Bug 1 完成后，`localStorage` 持久化偏好的用户数量将持续累积，Bug 2（亮色用户 FOUC）影响范围随即扩大，届时应立即跟进 Bug 2。~~

#### ~~Bug 2：亮色模式用户的 FOUC 🟡（已修复）~~

~~**问题**：页面 HTML 携带 `class="darkmode"` 送达浏览器，CSS 即刻渲染为暗色背景。若用户偏好为亮色（`sessionStorage/localStorage = 0`），需等 JS bundle 加载、解析、执行后才移除该 class，期间有一帧暗色闪烁（FOUC）。暗色用户不受影响。~~

~~**影响范围**：仅影响主动切换过亮色的用户。当前用 `sessionStorage`，每次新标签都重置偏好，实际受影响的人极少；若改为 `localStorage` 后，受影响比例会上升，届时此 bug 优先级应同步提高。~~

~~**修复**：在 `head.ejs` 的 `<head>` 末尾（CSS 链接之后、body 渲染之前）插入内联脚本：~~

~~```html~~
~~<script>~~
~~  if (localStorage.getItem('darkmode') === '0') {~~
~~    document.body.classList.remove('darkmode');~~
~~  }~~
~~</script>~~
~~```~~

~~注意：需在 `<link rel="stylesheet">` 之后、`</head>` 之前执行，使浏览器在首次绘制前即确定正确状态。~~

~~> **⚑ 前置依赖**：Bug 1（`sessionStorage` → `localStorage`）。Bug 1 未完成前，每次新标签页都会重置偏好，实际受影响用户极少，本修复价值有限；Bug 1 完成后优先级上升，应立即跟进。~~

#### ~~双层暗色系统（已知架构债务，已修复）~~

~~`_darkmode.styl` 中的 `darkmode()` mixin（旧系统：Stylus 变量 + `!important` 覆盖）与新组件的 CSS 自定义属性系统（`--reward-*`、`--share-*` 等）并存。`_darkmode.styl` 第 31 行注释已承认部分规则被自定义属性方案覆盖。此问题属于 §3.1 已描述的样式迁移进行中状态，随新组件持续接入自定义属性，旧 mixin 中的规则会逐步被替代直至可以删除。~~

#### ~~优先级汇总~~

~~| 问题 | 优先级 | 修复成本 |~~
~~|------|--------|---------|~~
~~| `sessionStorage` → `localStorage` | 🟡 中 | 极低（三行改动） |~~
~~| 亮色用户 FOUC | 🟡 中（改 localStorage 后升高） | 低（一段内联 script） |~~
~~| `:root` 语义倒置 | 🟢 低 | 高（全局 selector 重写） |~~
~~| 双层暗色系统收敛 | 🟢 低（进行中） | 随新组件自然消化 |~~

#### 修复情况（2026-05-25）

以上问题中，Bug 1（`sessionStorage`）、Bug 2（亮色 FOUC）和双层暗色系统（`_darkmode.styl`）三项已一次性修复，`:root` 语义倒置因成本/收益比不佳而保留。详见下文。

##### 1. `sessionStorage` → `localStorage`

将 `ayeria.js` 中三处 `sessionStorage.getItem/setItem` 替换为 `localStorage.getItem/setItem`。Git 历史证实 `sessionStorage` 是上游 Ayer 主题在"亮色默认、用户手动切暗色"语境下的原始设计——暗色偏好仅需持续一个 session。默认值翻转为暗色后，`sessionStorage` 的语义不再匹配：亮色用户的偏好理应持久化。

##### 2. 亮色用户 FOUC

在 `layout.ejs` 的 `<body class="darkmode">` 后立即插入内联脚本（`<head>` 中无法访问 `document.body`，因为 body 尚未解析）：

```html
<body class="darkmode">
  <script>
    if (localStorage.getItem('darkmode') === '0') {
      document.body.classList.remove('darkmode');
    }
  </script>
```

该脚本在 body 首个可见子元素之前执行，浏览器在首次布局前即确定正确的主题 class，消除闪烁。使用 `=== '0'` 严格匹配以避免 `localStorage` 为空时的歧义。

##### 3. 双层暗色系统收敛——`_darkmode.styl` 拆分

这是本次修复的核心工程，实现了"旧 mixin 集中式覆盖 → CSS 自定义属性联邦自治"的架构迁移：

- **新建全局设计令牌层**：在 `_tokens.styl`（自 `_variables.styl` 拆分出的独立 CSS 自定义属性文件）中定义 `:root` / `body.darkmode` 块，含 17 个全局 CSS 自定义属性（`--color-bg`、`--color-text`、`--color-link`、`--color-border` 等），亮/暗配色统一管理于此。改站点配色只需修改 `_tokens.styl`。
- **文件职责分离**：`_variables.styl` 回归纯 Stylus 变量定义（字体、颜色、布局、断点），零 CSS 输出；`_tokens.styl` 通过 `@import "_variables"` 引用这些变量并映射为 CSS 自定义属性。暗色模式色值也使用 Stylus 变量定义（`dark-bg`、`dark-text` 等），消除裸 hex 值。
- **全局规则迁移**（`style.styl`）：`body`、`a`、`img` 等全局选择器改用 `var()` 引用令牌，替换原有的 Stylus 编译时变量，删除 `body.darkmode { darkmode() }` 调用。
- **组件规则分散迁移**：将 `darkmode()` mixin 中 100 行的组件选择器规则逐一拆入对应的 `_partial/*.styl` 文件（`article.styl`、`archive.styl`、`tocbot.styl`、`friends.styl`、`_extend.styl` 等），各组件使用 `var()` 引用全局令牌或定义局部变量。Valine/Waline 暗色规则移至 `_partial/gitalk.styl`。
- **删除 `_darkmode.styl`**：移除 import 和 mixin 调用后删除该文件（100 行）。

迁移后，新增或修改组件无需再"散弹式修改"——暗色适配代码与组件亮色样式共址存放，组件通过 `var()` 引用令牌，不感知当前主题。全局配色修改只需编辑 `_tokens.styl`。

> **`⚠️` `:root` 语义倒置未修复**：`:root` = 亮色 / `body.darkmode` = 暗色 的约定与网站实际默认（暗色）语义相反，但此模式符合 Tailwind CSS、Bootstrap 5.3 等业界标准。将其翻转（`:root` = 暗色、`body.lightmode` = 亮色）需全局重写选择器，成本高且收益有限，保留现状。

### 3.5 亮暗系统当前遗留问题

> **新增于 2026-05-25**：§3.4 修复完成后，亮暗系统的核心架构（CSS 自定义属性 + 默认暗色防 FOUC + 全局/组件双层 token）已基本合理。以下为剩余的优化空间，优先级均为中低。

#### ~~3.5.1 （已修复）组件级 `body.darkmode` 块中仍使用裸 hex 值~~

~~**位置**：`search.styl`、`reward.styl`、`share.styl`、`friends.styl`、`broadcast.styl`、`highlight.styl`、`gitalk.styl` 共 7 个文件~~

~~**问题**：`_tokens.styl` 已建立"暗色值 = Stylus 变量"的规范（`dark-bg`、`dark-text` 等），但上述组件文件中各自的 `body.darkmode { --component-*: #xxx }` 块仍使用裸 hex 值，与全局令牌文件风格不一致。这些值是组件私有的（如 `--search-bg`、`--reward-border`），不属于全局 token，是否抽成 Stylus 变量取决于是否在多处引用。~~

> **2026-09-17 复核**：问题比旧报告更严重。Google Analytics、百度统计、CNZZ、不蒜子当前全部关闭，51.la 却是无条件加载且无法通过配置关闭，因此它是本站唯一实际在线的第三方统计；这既是 DIP 违规，也是默认追踪行为（5.5.5/12.4）。应优先配置化或删除，而不是仅更换 ID。

~~**建议**：若某个组件级暗色值在两处以上使用，抽为 Stylus 变量；单次使用的裸 hex 可保留现状，避免为抽象而抽象。~~

**修复情况（2026-05-25）**：逐文件分析各裸 hex 值的语义归属，凡与 `_tokens.styl` 中已有 Stylus 变量服务于同一设计意图的颜色，替换为变量引用；确属组件私有的（如 `friends.styl` 的 `rgba` 透明度值、`broadcast.styl` 的 `#ff9fb0` 粉色强调色、`highlight.styl` 的 VS Code 主题色板）保留原样。具体变更：

| 文件 | 替换项 | 保留项（及原因） |
|------|--------|-----------------|
| `search.styl` | `#2a2f3a` → `dark-surface`、`#1c1f26` → `dark-bg`、`#d0d0d0` → `dark-text`、`#aaaaaa` → `dark-text-secondary`、`#3b414c` → `dark-border`（2 处）、`#cccccc` → `dark-tag-text` | `#777777`（与 `dark-input-placeholder` 不同，搜索框有意偏暗）、`#e0e0e0`（标题专用亮色）、`#4a5060`（hover 状态独有色） |
| `reward.styl` | `#d0d0d0` → `dark-text`（2 处）、`#aaaaaa` → `dark-text-secondary`、`#cccccc` → `dark-tag-text` | 全部 rgba 透明度值（半透明叠加效果，属组件私有视觉设计） |
| `share.styl` | `#80cfff` → `dark-link`、`rgba(128,207,255,0.5)` → `rgba(dark-link,0.5)`、`#d0d0d0` → `dark-text` | 其余 rgba 值同理保留 |
| `highlight.styl` | `#2e3440` → `dark-code-bg`、`#ffcc99` → `dark-code-text` | 所有 VS Code Dark+ 语法高亮色（属代码高亮独立色板，非全局语义 token） |
| `friends.styl` | 无需修改（`--friend-link-text` 早已引用 `var(--color-text)`） | — |
| `broadcast.styl` | 无需修改 | 全部 4 个值为组件独有：白色半透明背景/边框、`#f0f0f0`（比 `dark-text` 亮）、`#ff9fb0`（粉色强调） |
| `gitalk.styl` | 无需修改（已全面使用 `var()` 引用全局 token） | — |

#### 3.5.2 缺少 `prefers-color-scheme` 系统偏好跟随

**位置**：`layout.ejs` 第 4-7 行

**问题**：当前仅在 `localStorage` 中存储显式选择（`0` = 亮色，其他 = 暗色），未检测操作系统的 `prefers-color-scheme` 媒体查询。对于首次访问且 OS 使用亮色模式的用户，默认暗色可能与系统偏好冲突——虽然暗色是本站有意为之的设计默认（非疏忽），但提供"跟随系统"选项仍是业界最佳实践。

**建议**：在内联 FOUC 防护脚本中增加 `prefers-color-scheme` 检测：

```html
<script>
  const stored = localStorage.getItem('darkmode');
  if (stored === '0') {
    document.body.classList.remove('darkmode');
  } else if (stored === null && window.matchMedia('(prefers-color-scheme: light)').matches) {
    document.body.classList.remove('darkmode');
  }
</script>
```

此修改成本极低（两行），可消除"OS 亮色 + 首次访问 → 暗色博客"的体验断裂。

> **2026-09-17 复核**：仍未实现；当前 `layout.ejs` 第 4-8 行只处理 `localStorage === '0'`。建议保留本节方案（成本两行），优先级中低：本站若以中国大陆用户为主，系统亮色偏好用户首次访问会看到暗色站点，属于体验不一致而非功能错误。

#### 3.5.3 仅支持二态切换，无"跟随系统"选项

**问题**：`localStorage` 中仅存储 `0`（亮色）或 `1`/空（暗色），无法表达"跟随系统"这一第三态。如未来增加 `auto` 模式，需：

- 存储三态（`'light'` / `'dark'` / `'auto'`）
- 监听 `matchMedia('(prefers-color-scheme: dark)')` 的 `change` 事件
- 在切换按钮上提供三个图标状态（太阳/月亮/自动）

此为锦上添花，当前二态已满足绝大部分用户需求，建议在用户反馈有需求时再实施。

#### 优先级汇总

| 问题 | 优先级 | 修复成本 |
|------|--------|---------|
| ~~组件裸 hex 值~~ | ~~🟢 低（风格一致性问题）~~ | ~~低（仅涉及 7 个文件）~~（已修复） |
| `prefers-color-scheme` 检测 | 🟡 中 | 极低（两行内联脚本） |
| "跟随系统"第三态 | 🟢 低 | 中（需 JS 重构 + UI 变更） |

---

### ~~3.3 （已修复）主题 `index.js` 为空壳~~

~~**位置**: `themes/ayeria/index.js`~~

~~**问题**: 该文件仅包含一行注释，用于防止 `hexo clean` 报错。这是 Hexo 5.0+ 的已知问题，但空壳文件增加了认知负担。~~

~~**建议**: 维持现状（Hexo 框架限制），但可在文件中添加更详细的说明注释。~~

> **已修复（2026-05-25）**：`index.js` 已添加详细注释，说明该文件为何作为空壳存在（Hexo 5.0+ `hexo clean` 要求主题根目录存在 `index.js`）、实际扩展逻辑的所在位置（`scripts/` 目录）及 Hexo 自动加载机制。

---

## 四、自定义页面架构

### ~~4.1 （已忽略）简历页面与 Hexo 模板体系完全脱节~~

~~**位置**: `source/resume/`、`source/resume-en/`~~

~~**问题**: 这两个目录是完整的独立 HTML 站点（含自己的 CSS、JS、字体文件），通过 `skip_render` 跳过 Hexo 渲染。问题包括：~~

~~- 与主站主题风格完全不同（无暗色模式、无导航栏、无页脚）~~
~~- 两个目录间 CSS/JS/字体文件大量重复（约 500KB+）~~
~~- 使用 Font Awesome 4.7（2017 年版本），主站使用 RemixIcon~~
~~- 使用 jQuery 2.1.3（2014 年版本），主站使用 jQuery 3.6.0~~
~~- `baiduanalysis.js` 和 `gtag.js` 中的分析脚本可能包含过时的追踪 ID~~

~~**建议**:~~

~~- 短期：将共享资源提取到 `source/resume-assets/`，两个页面共用~~
~~- 中期：将简历页面重构为 Hexo layout 模板，融入主站主题~~
~~- 长期：考虑使用现代简历生成方案（如 JSON Resume + 主题模板）~~

### ~~4.2 （已忽略）MC 服务器页面架构独立~~

~~**位置**: `source/mc-server/`~~

~~**问题**: 该页面是完全独立的 HTML/CSS/JS 应用，通过 `skip_render` 跳过 Hexo 渲染。虽然功能上合理（该页面有独特的交互需求），但存在以下问题：~~

~~- 与主站无导航关联（用户无法从 MC 页面返回主站，除了左上角 logo）~~
~~- 使用 Font Awesome 4.7 CDN，与主站 RemixIcon 不一致~~
~~- `members.js` 中的数据硬编码在 JS 文件中，而非使用 Hexo 数据文件机制~~
~~- 第三方头像 API `mc-heads.net` 无错误重试机制~~

~~**建议**:~~

~~- 添加返回主站的导航链接~~
~~- 将 Font Awesome 图标替换为 RemixIcon（与主站一致）~~
~~- 考虑将成员数据迁移至 `source/_data/mc-members.yml`，通过 Hexo 模板渲染~~

### ~~4.3 （已忽略）电子手办柜页面使用 `{% raw %}` 嵌入大量 HTML~~

~~**位置**: `source/waifu/index.md`~~

~~**问题**: 该页面通过 `{% raw %}` 标签在 Markdown 文件中嵌入了约 280 行原始 HTML。这实质上是将 Markdown 文件当作 HTML 文件使用，失去了 Markdown 的简洁性优势。~~

~~**建议**: 将该页面改为 `index.html`（直接使用 HTML），或使用 Hexo 数据文件 + 模板方案（将角色数据提取到 `source/_data/waifu.yml`，通过 EJS 模板循环渲染）。~~

### ~~4.4 （已忽略）关于页面混合 Markdown 与 HTML/CSS~~

~~**位置**: `source/about/index.md`~~

~~**问题**: 该文件在 Markdown 中通过 `<link>` 引入外部 CSS、使用大量原始 HTML 标签。虽然 Hexo markdown-it 配置了 `html: true` 允许内联 HTML，但这种混合方式：~~

~~- 增加维护复杂度~~
~~- CSS 文件 `glass-card.css` 独立于主题样式体系~~
~~- 无法通过主题的暗色模式切换自动适配（需手动编写 `body.darkmode` 选择器）~~

~~**建议**: 将 `glass-card.css` 的样式纳入主题的 Stylus 构建管线，通过 CSS 自定义属性实现暗色模式自动跟随。~~

---

## 五、性能

### 5.1 jQuery 在每个页面无条件加载

**位置**: `themes/ayeria/layout/_partial/after-footer.ejs`  第 1 行

**问题**: `jquery-3.6.0.min.js`（主题本地自托管，89,503 字节，约 30KB gzip）在每个页面无条件加载。旧报告称实际使用场景有限（modal、justifiedGallery 等插件依赖），此表述不准确：`source-src/js/ayeria.js` 整个 IIFE 以 `jQuery` 为运行前提，搜索、返回顶部、移动端导航、打赏弹窗、暗色模式、懒加载初始化等 13 项功能全部依赖 `$`，clipboard 内联代码也依赖 `$`。jQuery 不是少数插件的依赖，而是当前前端架构的运行时基础。

**建议（2026-09-17 复核后修订）**:

- `defer`：收益有限。脚本本就在 `</body>` 前，解析阻塞窗口很小；给 jQuery 和 `dist/main.js` 都加 `defer` 只能略微提前 `DOMContentLoaded`，不减少下载量。不建议把它当作主要优化。
- 更有价值的是先做 5.2/5.5 的按需资源裁剪（删除死依赖、搜索索引延迟加载、KaTeX 按页加载），这些不需要触碰 jQuery 架构即可显著降低首屏成本。
- 移除 jQuery 需要重写 `ayeria.js` 的全部 DOM 操作，工程量中等偏高，且没有页面级性能之外的额外收益。建议在 15 的功能重构中逐模块替换，而不是现在专门立项；不作为本轮优先事项。

### 5.2 jquery-modal、justifiedGallery、lazyload 无条件加载

**位置**: `themes/ayeria/layout/_partial/after-footer.ejs`  第 2、22-24 行

**2026-09-17 复核结论（旧报告的条件判断有误）**:

| 资源 | 当前加载 | 实际使用 | 结论 |
|------|---------|---------|------|
| `jquery-modal` JS + CSS（staticfile CDN） | 所有页面无条件 | 全仓库检索 `jquery-modal`、`.modal(`、`rel="modal:open"` 只命中加载代码本身，没有任何调用点 | **死依赖，直接删除**（2 个外部请求/页） |
| `justifiedGallery` JS（staticfile CDN） | 所有页面无条件 | 仅 `post/justifiedGallery.ejs` 在 `post.albums` 非空时渲染 `#gallery`；当前 0 篇文章使用 `albums` | 随 `#gallery` 一起按需加载；建议把 `<script>` 和初始化移入该 partial，而不是在 `after-footer.ejs` 里用 `page.*` 条件判断 |
| `lazyload` JS（本地 4.2KB）+ `$("img.lazy")` 初始化 | 所有页面无条件 | 仅未被任何模板引用的 `post/albums.ejs` 使用 `class="lazy"`；现有文章 0 处 `lazy`、0 处 `data-original` | 当前为死代码；要么删除 `albums.ejs` 与 lazyload，要么把文章图片改为懒加载（推荐后者，见 §5.4） |

旧版建议的条件 `post.photos || post.gallery` 与实际标记不符：`#gallery` 由 `post.albums` 生成，`post.photos` 生成的是 `.article-gallery`，且 `after-footer.ejs` 的上下文是 `page` 而不是文章局部变量 `post`。按旧条件实施会导致需要它的页面不加载、不需要的页面仍加载。正确做法是让资源与使用它的 partial 共址。

> **与 §14.4/§15 的关系**：本节与 §14.4.1 是同一问题；§15 模块化方案不是修复本问题的前提。jquery-modal 删除、justifiedGallery/lazyload 按需化可独立先行，收益明确，成本低于整体拆分。

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

> **2026-09-17 复核**：维持移除/缩减字体的结论，并补充两点更正：
> - `display=swap` 只影响字体文件下载完成前使用回退字体，不能避免 `fonts.font.im` 的 CSS 请求阻塞首次渲染；在中国大陆网络下，该外部样式表仍是关键路径单点。
> - 当前加载 Noto Serif SC 400/700 + Noto Sans SC 300/400 共 4 个字重；中文 WebFont 的实际下载量取决于页面用字与字符子集，可能达到数百 KB 至 MB 级。
>
> **建议优先级上调为高**：优先改用系统中文字体栈（正文衬线可用 `Source Han Serif SC`/`Songti SC`/`SimSun`，界面/代码使用系统 sans/mono），或至少减到 1-2 个字重并自托管子集。移除 WebFont 前必须在 Windows/macOS/iOS/Android 上逐项验证字体栈，不能只依赖当前包含 `Noto Serif SC` 的列表，否则 Windows 可能回退到不理想的默认衬线字体。

### 5.4 图片资源未优化（2026-09-17 复核：由低优先级上调为高优先级）

**位置**: `source/images/`、`source/mc-server/img/`、`source/waifu/img/` 及各文章中的 Markdown 图片引用

**实测规模（2026-09-17）**:

- `source/images/` 共 50 个文件、29,737,111 字节（约 29.7MB）。最大文件为 `kuixingmen.jpg` 5,016KB（3840×2160）、`xian.png` 4,236KB（2048×1371）、`栖云堂.png` 3,222KB（2331×1163）、`background.jpg` 2,015KB、`滕王阁.jpeg` 1,572KB。
- 最重的单篇文章 `source/_posts/2025-10-15-mc-cn-building.md` 引用 25 张标准 Markdown 图片，原始体积合计 21,956,558 字节（约 22.0MB）；这些图片以普通 `<img>` 输出，没有 `loading="lazy"`，浏览器会立即全部下载（其中包含 5MB、4.2MB、3.2MB 三张巨图）。
- 主题的 `lazyload` 初始化和 `class="lazy"` 模板目前是死代码（见 §5.2），并未给文章图片提供任何懒加载。

**收益实测（本机 ffmpeg/libwebp，仅实验，未改动源文件）**: 对最大的 5 张图按最长边 1920px + WebP quality 78转码：

| 文件 | 原始 | 转码后 | 比例 |
|------|------|--------|------|
| kuixingmen.jpg | 5,016KB | 322KB | 6.4% |
| xian.png | 4,236KB | 272KB | 6.4% |
| 栖云堂.png | 3,222KB | 38KB | 1.2% |
| 滕王阁.jpeg | 1,572KB | 221KB | 14.0% |
| background.jpg | 2,015KB | 112KB | 5.6% |

五张合计 16,447,044 字节 → 约 965KB（约 6%）。据此保守估计，全目录在画质可接受的前提下可减少 80% 以上；重文章页可从约 22MB 降到 1-2MB 量级。对以中国大陆移动网络读者为主的站点，这是当前最大的单页体验瓶颈，优先级高于 jQuery 与字体子集外的多数议题。

**建议**:

1. **立即执行一次存量图片优化**：批处理 `source/images/` 与文章图片，统一限制最长边（正文图约 1600-1920px，封面/背景单独评估），照片转 WebP、需要透明或线条图的 PNG 单独压缩；保持文件名与引用路径不变，把编码优化和内容重命名拆开，避免一次 diff 同时承载两类变更。工具可用 `sharp`/`imagemin`/`cwebp` 或本机 ffmpeg；建议脚本化并记录参数。
2. **为文章图片添加原生懒加载**：通过 Hexo `after_post_render` 过滤器给 `post.content` 中的 `<img>` 注入 `loading="lazy"` 与 `decoding="async"`（首图可保留 eager，以保护 LCP）。这比恢复旧的 `lazyload` jQuery 插件更轻、更稳。响应式 `srcset`/`sizes` 可作为后续阶段，不必与本次压缩捆绑。
3. **为持续新增图片设规则**：在 `doc/blog-post-format-standard.md` 中写明尺寸/格式上限，并提供 `scripts/` 下的压缩脚本。当前 29.7MB 存量是一次性问题，是否接入 CI 取决于新增图片频率；CI 图片压缩应是后续增量措施，而不是这次优化的前置条件。
4. **可选**：若执行 1.5 的批量重命名，与本次图片优化合并为同一次引用更新，避免两次大范围改动。

### 5.5 页面级资源按需化（2026-09-17 复核新增）

**背景**: 旧报告分节审查了 jQuery、字体、modal 等单点，但没有给出每个页面实际加载了什么、是否真的需要的完整清单，因此遗漏了比这些单点更大的问题。下表按当前模板条件逐项核对（默认配置）：

| 资源 | 当前加载条件 | 默认配置下的实际行为 | 每页需求评估 |
|------|-------------|-------------------|-------------|
| `dist/main.css` / `dist/main.js` | 无条件 | 站点核心样式与脚本。本机近似构建：`main.js` minified 约 9.2KB；`style.styl` 直接输出约 68.7KB（未 cssnano/autoprefix） | 必需 |
| `jquery-3.6.0.min.js` | 无条件 | 所有交互的运行时，89,503 字节 | 当前架构必需，见 §5.1 |
| `fonts.font.im` CSS（4 字重） | 无条件，位于 `<head>` | 阻塞渲染的外部关键路径 | 非必需，建议系统字体栈，见 §5.3/§12.3 |
| `pace.min.js`（staticfile CDN） | `progressBar: true`（默认） | `<head>` 同步外部脚本 | 功能可选；若保留应自托管 |
| `search.js` + `search.xml` | 只要页面存在 `.local-search` | 侧边栏在所有页面渲染 `.local-search`，因此**首次进入任意页面即下载全文索引并建立搜索函数** | 改为首次交互时加载，见 §5.5.1 |
| `jquery-modal` JS+CSS | 无条件 | 全仓库无任何调用点 | 删除，见 §5.2 |
| `justifiedGallery` JS | 无条件 | 仅 `post.albums` 页面需要；当前 0 篇文章使用 | 随内容按需加载，见 §5.2 |
| `lazyload.min.js` | 无条件 | 模板中无有效使用点 | 删除或改原生 `loading="lazy"`，见 §5.2/§5.4 |
| `viewer.ejs` PhotoSwipe JS2 + CSS2 | `image_viewer: true`（默认） | 所有页面加载，并在页尾扫描图片 | 仅在含图片页面加载或首次点击时加载，见 §5.5.4 |
| `katex` CSS+JS2 | `katex.enable && (allpost \|\| page.math)`；当前 `allpost: true` | **所有页面加载并扫描整个 body 渲染公式** | 改为仅公式文章加载，见 §5.5.3 |
| `clipboard.min.js` | `copy_btn: true`（默认） | 所有页面加载并执行复制按钮初始化 | 仅含代码块的页面需要，见 §5.5.4 |
| `/data/random-sentences.txt` | 页脚模块存在（默认所有页面） | 每个页面 `fetch` 97,672 字节（gzip 53,223 字节，2,613 行） | 缓存或裁剪后按需加载，见 §5.5.4 |
| 51.la SDK | 打包进 `ayeria.js`，无条件 | 所有页面访问 `sdk.51.la`，ID 硬编码 | 配置化并可关闭，见 §5.5.5 |

> 注：本地体积由本机离线文件/近似构建测量；外部 CDN 资源未联网实测，以无条件加载这一可由代码验证的事实为准。完整清单会随配置变化，建议在主题 README 中维护。

#### 5.5.1 全文搜索索引在首屏加载（高优先级）

`source-src/js/ayeria.js` 第 34-39 行：

```js
// Not recommended in mobile, /search.xml is actually large.
if ($(".local-search").length) {
  $.getScript("/js/search.js", function () {
    searchFunc("/search.xml", "local-search-input", "local-search-result");
  });
}
```

`_partial/sidebar.ejs` 在每个页面都渲染 `.local-search`，所以这个 `if` 永远成立。`_config.yml` 中 `hexo-generator-searchdb` 配置为 `content: true`，`search.xml` 包含全部文章（当前 53 篇、源 Markdown 约 399KB）的渲染后 HTML；代码注释本身已承认它 actually large。结果是：无论用户是否使用搜索，每个页面首屏都会下载完整全文索引，随后 `search.js` 为所有文章建立数组。

**建议**:

- 移除 `ayeria.js` 中的 eager `getScript/searchFunc` 调用；首次点击搜索按钮（或首次聚焦输入框）时再加载 `search.js` 并请求索引。必要时可在 `mouseenter`/`requestIdleCallback` 中做低优先级预取，但不要默认下载。
- 搜索路径不再硬编码：在 `post/search.ejs` 上输出 `data-xml="<%- url_for(config.search.path || 'search.xml') %>"` 与 `data-script="<%- url_for('/js/search.js') %>"`，搜索模块读取它们。这同时修复 §14.9 的硬编码问题与子路径部署兼容性。
- 第二阶段可选：在 `after_generate` 过滤器中把 `search.xml` 的 `<content>` 预先剥离 HTML 标签，生成纯文本索引，降低文件体积和客户端解析成本。先做交互时加载即可获得大部分收益。

#### 5.5.2 搜索脚本的算法与正确性问题（高优先级，与 5.5.1 一并修复）

`themes/ayeria/source/js/search.js` 是 2015 年的旧实现，存在三个可复现问题：

1. **用户输入直接进入正则导致搜索崩溃**：高亮时执行 `new RegExp(keyword, "gi")`。搜索词包含正则元字符时会抛异常并中断搜索。Node 实测：`c++`  `Invalid regular expression: /c++/gi: Nothing to repeat`；`(`、`[`、`*` 同样抛错。对一个会写 C/C++ 与数学内容的站点，这是功能性 bug。
2. **每次按键重复做预处理**：输入事件里对每篇文章执行 `replace(/<[^>]+>/g, "")` 并扫描全文，命中后还再 strip 一次；这些 HTML 剥离与输入无关，完全可以预计算。本站规模下桌面端约 0.5ms/键，移动端会放大数倍，并产生大量临时字符串。
3. **摘要截取参数误用**：`content.substr(start, end)` 的第二个参数是长度而非结束下标，匹配位置靠后的结果摘要过长。应改为 `substr(start, end - start)`。

**建议**：XML 解析完成后一次性生成 `titleLower` 与 `plainTextLower`；输入处理加 100-150ms 防抖；高亮前用 `keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")` 转义；修正摘要长度。改动集中在单个文件，收益是搜索可靠性和移动端输入流畅度，不改变搜索语义。

#### 5.5.3 KaTeX 每页加载（高优先级）

`_config.ayeria.yml`：

```yaml
katex:
  enable: true
  allpost: true
  copy_tex: false
```

`after-footer.ejs` 在 `theme.katex.enable` 为真时引入 `partial('katex')`，而 `katex.ejs` 内部条件是 `allpost || page.math`。因此 `allpost: true` 让每一页都从 staticfile CDN 加载 `katex.min.css`、`katex.min.js`、`auto-render.min.js`，并在 `DOMContentLoaded` 时对 `document.body` 执行公式扫描与渲染。

当前全站仅 3 篇文章含 `$$` 块级公式（`2025-03-20-markdown-latex-guide.md`、`2025-08-26-ahu-mathematical-foundations-of-cyber-security.md`、`2025-10-02-how-to-use-hexo.md`），且这些公式都位于 `<!--more-->` 之后，首页摘要不受影响。

**建议**:

- 将 `allpost` 改为 `false`，给上述 3 篇文章的 front-matter 加 `math: true`。这样约 50 个非公式页面不再请求 KaTeX 资源，也不再执行 body 扫描。
- **进一步验证**：本站 Markdown 由 `hexo-renderer-markdown-it-katex` 在构建时渲染公式，正文已经输出 KaTeX HTML；客户端 `renderMathInElement` 很可能完全冗余，只有 KaTeX CSS 是显示公式所必需。若用一篇公式文章构建后确认 DOM 已包含 `.katex` 且没有残留 `$...$`，可把 `katex.ejs` 缩减为按需引入 CSS，删除 auto-render JS。该步骤需要构建验证，但收益明确。
- 这与 `source/_drafts/2026-09-07-pure-latex-post-support-options.md` 的结论一致：该草稿已明确新方案应尽量避免再引入客户端数学运行时。

#### 5.5.4 PhotoSwipe、clipboard、随机句子文本（中优先级）

- **PhotoSwipe 图片查看器**：`viewer.ejs` 在 `image_viewer: true` 时出现在所有页面（`after-footer.ejs` 第 29-31 行），加载 2 个 CSS + 2 个 JS（staticfile CDN），并扫描 `.article-entry img`。建议至少改为当前页面内容含 `<img>` 时才加载；更彻底的做法是把资源和初始化延迟到第一次点击图片时，但这需要把 `viewer_init` 改造成按需加载回调。收益是消除非图片页面的 4 个外部请求。
- **clipboard.js**：`copy_btn: true` 使 `post/clipboard.ejs` 在所有页面加载 staticfile 的 `clipboard.min.js` 并初始化。建议限定在 `is_post()` 且正文含代码块时；或者改用原生 `navigator.clipboard`，去掉外部依赖。首页、归档页等没有代码复制需求，属于浪费。
- **随机句子文本**：`use_local_file: true` 时，`random-sentences.js` 在每个含页脚模块的页面 `fetch('/data/random-sentences.txt')`。该文件 97,672 字节（gzip 53,223 字节），共 2,613 行。浏览器缓存可能覆盖同一会话的重复访问，但首次加载和缓存失效后仍会产生可观开销。建议：裁剪到数百行、在 `localStorage` 中缓存文本并在版本键变化时才重新请求、或把精选句子内联进 bundle（需权衡主 JS 体积）。同时把硬编码的 `/data/random-sentences.txt` 改为 `url_for`/配置注入，避免子路径部署失败。

#### 5.5.5 51.la 统计（中优先级，安全/隐私相关）

`ayeria.js` 末尾的 IIFE（第 255-280 行）会在每个页面动态插入 `https://sdk.51.la/js-sdk-pro.min.js`，统计 ID/ck 硬编码为 `JGjrOr2rebvP6q2a`（§14.5.2）。这意味着：

- 即使站点配置中 Google Analytics、百度统计、CNZZ、不蒜子全部关闭，51.la 仍是实际启用且无法通过配置关闭的第三方统计；
- 每个访客（包括中国大陆以外、不希望被追踪的访客）都会连接第三方域名；
- 更换统计 ID 必须改源码并重新构建主题。

**建议**：在 `_config.ayeria.yml` 增加 `tracking.la51.enable/id`（或直接删除该统计），参照 `google-analytics.ejs`/`baidu-analytics.ejs` 的条件注入方式。若保留，至少让 ID 来自配置而非源码，并评估隐私说明与加载时机。

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

> **2026-09-17 复核**：jQuery、lazyload、tocbot、busuanzi、点击特效等已改为主题内自托管，SRI 覆盖范围比旧报告缩小。当前仍需处理的外部资源为 pace、jquery-modal（建议直接删除）、justifiedGallery（按需）、PhotoSwipe、KaTeX、clipboard、fonts.font.im 与 giscus/51.la。先按 5.2/5.5 删除或按需化，再只为剩余外部 CDN 资源补 `integrity`/`crossorigin`。

### 6.3 网站加密功能安全性不足

**位置**: `_config.ayeria.yml` — `lock` 配置

**问题**: 网站加密功能（`lock.enable: false`，当前已关闭）使用前端 JavaScript 实现密码验证。即使启用，密码以明文存储在配置文件中，验证逻辑在客户端执行，任何人查看源码即可绕过。

**建议**: 如果确实需要内容保护，应使用服务端方案。对于 GitHub Pages 静态站点，可考虑使用加密的 HTML 文件（如 `staticrypt` 方案）。当前已关闭此功能，建议从配置和模板中彻底移除相关代码。

> **2026-09-17 复核**：`lock.enable` 仍为 `false`，但 `_config.ayeria.yml` 保留默认密码 `123456`，`_partial/lock.ejs` 也仍在 `layout.ejs` 中无条件 include。前端密码锁本身可被绕过，但保留默认密码会造成改个 enable 就能上线的错觉。建议至少删除默认密码与示例配置，或整段移除模板；若确实需要内容保护，采用构建期加密方案。

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

> **2026-09-17 复核**：不建议照抄旧版示例中的 `Disallow: /resume/`。简历页是否需要被搜索引擎收录取决于作者意图（求职场景反而可能希望收录）；应先与 Sitemap 一并明确策略，再决定 disallow 列表。至少应把 `test/` 等演示页排除。

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

### ~~8.2 （已修复）主题构建未纳入 CI~~

~~**问题**: 主题的 Rollup 构建（`npm run build` 在 `themes/ayeria/` 下）需在本地手动执行。如果忘记构建，部署的将是旧的 `source/dist/` 文件。~~

~~**修复情况（2026-05-25）**: 在 `.github/workflows/pages.yml` 的 `npm run build`（Hexo 生成）之前新增两步：~~

~~1. `Cache theme NPM dependencies` — 缓存 `themes/ayeria/node_modules`，以 `themes/ayeria/package-lock.json` 为 key~~
~~2. `Build theme` — `cd themes/ayeria && npm install && npm run build`~~

~~构建顺序现为：`npm install（根）→ 缓存主题 node_modules → Build theme（Rollup）→ Build（Hexo）→ Deploy`。CI 每次构建均从 `source-src/` 最新源码生成 `source/dist/`，不再依赖本地手动构建。~~

~~> **⚑ §10.2 同步关闭**：`Build theme` 步骤中的 `npm install` 已安装主题的 `devDependencies`（rollup、autoprefixer 等），§10.2 随之自动修复。~~

### 8.3 依赖安装不可复现（2026-09-17 复核：影响已扩大）

**位置**: `.github/workflows/pages.yml`、`themes/ayeria/.gitignore`

**原问题**: 根目录使用 `npm install` 而非 `npm ci`，可能产生非确定性构建（旧报告已指出）。

**2026-09-17 复核新增证据**:

1. **主题没有锁文件且被刻意忽略**：`themes/ayeria/.gitignore` 第 7 行忽略 `package-lock.json`。因此 CI 的 `npm install` 每次按 `^` 范围解析最新兼容版本，rollup 及构建插件版本会随发布漂移。
2. **主题缓存 key 实际上是常量**：缓存 key 为 `${{ runner.OS }}-npm-theme-${{ hashFiles('themes/ayeria/package-lock.json') }}`，但该文件不会出现在 checkout 中；`hashFiles` 返回空字符串，key 恒为 `Linux-npm-theme-`，restore 前缀也相同。依赖变化不会使缓存失效，最早缓存的 `node_modules` 可能被长期复用；一旦缓存被驱逐，重新 `npm install` 又会解析到与缓存中不同的版本，构建结果前后不一致。
3. **本地 Node 24 构建失败已可复现**：离线安装主题当前依赖后（rollup 2.80、rollup-plugin-styles 3.14.1、其传递依赖 source-map 0.7.6），在 Node 24 下执行 `npm run build` 抛出 `TypeError: Invalid URL`（rollup-plugin-styles → source-map `computeSourceURL`）。CI 使用 Node 20 且缓存了历史依赖，因此目前可能正常，但旧工具链加无锁文件的组合是随时可能爆的构建债。`rollup-plugin-terser@7` 也已在 npm 上标记 deprecated。
4. **Dependabot 未覆盖主题**：`.github/dependabot.yml` 只有 `directory: "/"`，`themes/ayeria/package.json` 的构建依赖不会收到更新提醒，而主题又通过 CI 参与构建。

**建议**:

1. 从 `themes/ayeria/.gitignore` 移除 `package-lock.json`，在主题目录执行一次 `npm install` 生成锁文件并提交；CI 主题步骤改为 `npm ci`，缓存 key 改为锁文件 hash。
2. 根目录 `Install Dependencies` 同步改为 `npm ci`（根锁文件已提交）。
3. 为 `.github/dependabot.yml` 增加 `directory: /themes/ayeria` 的 npm 条目，并按需增加 `github-actions` 生态。
4. 将主题构建工具链升级到维护中的版本（Rollup 4 + `@rollup/plugin-terser` + 替代 `rollup-plugin-styles` 的方案，或改为 Hexo 自带 Stylus 渲染加独立 JS bundle），并在 Node 20 与 Node 24 上各验证一次。升级前，锁文件加 Node 20 CI 可先止血；升级不是本周必须，但应在计划中明确。

---

## 九、可维护性

### 9.1 缺乏代码规范工具（2026-09-17 复核更正）

**位置**: 项目根目录、`themes/ayeria/.stylintrc`、`themes/ayeria/package.json`

**问题（更正）**: 主题目录已有 `.stylintrc` 和 `npm test`（Stylint）脚本，旧报告项目没有配置任何代码规范工具不准确。准确现状是：

- 根目录没有 `.editorconfig`、ESLint、Prettier；
- 主题虽有 Stylint 配置，但 CI 从未执行 `npm test`；
- Stylint 本身已停止维护，主题当前真正有效的语法防线是 Rollup 构建中的 Stylus 编译（能捕获语法错误，但不检查风格/坏味）。

**建议**: 最低成本是添加 `.editorconfig`（统一缩进、换行符、编码）并在 CI 的主题构建步骤后运行一次 `npm run test`。ESLint/Prettier 是否引入，取决于后续 JS/CSS 修改频率与协作人数；不要为了工具齐全同时引入多套职责重叠的格式化工具，以免互相冲突。

### 9.2 根目录调试脚本积累

**位置**: 根目录 `debug.py`、`debug_wsl.py`

**问题**: 两个调试辅助脚本均位于项目根目录。`debug_wsl.py` 于 2026-04-24 新增（"添加 Hexo 博客 WSL 环境一键调试脚本"），与既有的 `debug.py` 并列，根目录调试脚本数量持续增长。此问题在 2026-03-28 审查中被标记为"已忽略"，但现在问题有所扩大。

**建议**: 将 `debug.py`、`debug_wsl.py` 统一移入 `scripts/` 目录，并在 `.gitignore` 中注明这些文件的性质，或通过 `CLAUDE.md` / `README.md` 说明调试脚本的维护规范。

### ~~9.3 （已忽略）Git 提交信息不规范~~

~~**问题**: 此问题在 2026-03-28 审查中被标记为"已忽略"。但从长期可维护性角度，无规范的提交信息使得：~~

~~- 无法通过 `git log` 快速定位变更~~
~~- 无法自动生成 CHANGELOG~~
~~- `git bisect` 定位问题效率极低~~

~~**补充建议**: 最低成本方案是在 `package.json` 中添加 `commitlint` + `husky`，强制提交信息以 `feat:`/`fix:`/`chore:` 等前缀开头。~~

---

## 十、依赖管理

### 10.1 渲染器单点依赖

**位置**: `package.json` — `hexo-renderer-markdown-it-katex`

**问题**: 该渲染器是 `hexo-renderer-markdown-it` 的非官方分支，仅发布过 3 个版本，已停更。如果该包出现安全漏洞或与未来 Node.js 版本不兼容，整个站点的 Markdown 渲染将中断。

**建议**:

- 锁定精确版本号（当前为 `^3.4.4`，建议改为 `3.4.4`）
- 监控该包的维护状态
- 准备备选方案：官方 `hexo-renderer-markdown-it` + 独立 KaTeX 插件

> **2026-09-17 复核**：`package.json` 仍为 `^3.4.4`，`package-lock.json` 锁定 3.4.4；本次离线审查无法核实该包在 npm 上的最新维护状态，因此旧报告仅发布过 3 个版本、已停更应视为待联网复核的外部事实。无论维护状态如何，将范围收紧为精确版本仍是低成本措施；根锁文件已经降低了当前风险，但前提是 CI 改用 `npm ci`（§8.3）。

### ~~10.2 （已修复，随 §8.2）主题 devDependencies 未在 CI 中安装~~

~~**位置**: `themes/ayeria/package.json` — `devDependencies`~~

~~**问题**: 主题的 `devDependencies`（rollup、autoprefixer 等）在 CI 中不会被安装（根目录 `npm install` 不会处理子目录的 `package.json`）。这意味着 CI 无法执行主题构建。~~

~~**建议**: 参见 §8.2，在 CI 中显式安装主题依赖并构建。~~

~~> **已修复（2026-05-25）**：随 §8.2 同步关闭。CI 中 `Build theme` 步骤已包含 `cd themes/ayeria && npm install`，主题 devDependencies 现已在每次 CI 构建中安装。~~

---

### 10.3 主题构建工具链陈旧（2026-09-17 复核新增）

**位置**: `themes/ayeria/package.json`  `rollup@^2.50.2`、`rollup-plugin-styles@^3.14.1`、`rollup-plugin-terser@^7.0.2`、`autoprefixer@^9.8.6`

**问题**: 这些版本均为 2019-2021 年间的工具链，`rollup-plugin-terser` 已被 npm 标记 deprecated；在没有锁文件的情况下，上游传递依赖一旦变化，本地 Node 24 已出现 `TypeError: Invalid URL` 构建失败（§8.3）。这不是代码风格问题，而是构建可复现性与可维护性问题。

**建议**: 与 8.3 一起处理：先提交锁文件并用 `npm ci` 止血，再规划升级到 Rollup 4 + `@rollup/plugin-terser`，或评估改为Hexo 自带 Stylus 渲染 + 独立 JS bundle以减少构建插件数量。升级后必须在 Node 20（CI）和 Node 24（本地）各验证一次。

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

**2026-09-17 复核后的现状**: 旧报告列出 staticfile.org 的 6 项资源；此后的自托管工作完成了一部分，但也新增/遗漏了若干资源。当前第三方 CDN 依赖如下：

| 资源 | 加载位置/条件 | 当前状态 |
|------|--------------|---------|
| pace.js | `head.ejs`，`progressBar: true` | **每页同步加载**，建议自托管（体积小） |
| jquery-modal JS+CSS | `after-footer.ejs`，无条件 | **无任何调用点**，建议直接删除（§5.2） |
| justifiedGallery | `after-footer.ejs`，无条件 | 仅 `post.albums` 页面需要；当前 0 篇，建议随 partial 按需加载 |
| PhotoSwipe CSS2 + JS2 | `viewer.ejs`，`image_viewer: true` | 所有页面加载，建议按页/按需（§5.5.4） |
| KaTeX CSS+JS2 | `katex.ejs`，当前 `allpost: true` | 所有页面加载，建议 `allpost: false` + `math: true`（§5.5.3） |
| clipboard.js | `post/clipboard.ejs`，`copy_btn: true` | 所有页面加载，建议按页/自托管（§5.5.4） |
| sweetalert2 | `head.ejs`，`lock.enable` 为真时 | 功能关闭，条件已包裹；建议随 lock 代码一起清理（§6.3） |
| anime.js | `after-footer.ejs`，`click_effect === 2` 时 | 功能关闭，条件已包裹；非当前风险 |
| mermaid | `head.ejs`，`mermaid.enable` 为真时 | 功能关闭，条件已包裹 |
| MathJax | `mathjax` 为真时 | 功能关闭 |
| Noto WebFont CSS | `head.ejs`，无条件 | 独立的关键路径问题，见 §5.3/§12.3 |
| giscus client.js | 文章页评论 | 功能固有，可接受 |
| 51.la SDK | `ayeria.js`，无条件 | 不适合归为CDN 可用性，是默认追踪行为，见 §5.5.5 |

**已完成的自托管（值得肯定）**: jQuery 3.6.0、lazyload、tocbot、busuanzi、clickLove/clickBoom、dz 等已从 CDN 迁至主题 `source/js/`；核心交互库的本地化已显著降低外部依赖。

**建议（更新）**:

1. 先删除/按需化，再谈自托管：jquery-modal 直接删除；justifiedGallery、PhotoSwipe、KaTeX、clipboard 先按页面能力条件加载。
2. pace.js 体积很小且位于渲染关键路径，优先自托管到主题 `source/js/`，消除 `head.ejs` 的跨境同步请求。
3. 处理完 §5.5 后，再评估剩余 CDN 是否值得自托管或补 SRI；不要为即将删除/按需化的资源做 SRI（旧报告的顺序约束仍适用，但覆盖范围要按新清单更新）。

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

### 12.4 访问统计现状与决策（2026-09-17 复核更正）

**旧报告的不准确之处**: 旧版称当前仅不蒜子提供 PV/UV 计数。实际代码状态是：

- `busuanzi.enable: false`（不蒜子已关闭；脚本已自托管但不会加载）；
- `google_analytics`、`baidu_analytics` 为空；
- `cnzz.enable: false`；
- **51.la 仍在工作**：`ayeria.js` 末尾无条件注入 `sdk.51.la`，ID 硬编码。

因此当前站点并非没有可用统计，而是唯一实际启用的 51.la 不在配置体系中（详见 §14.5.2 与 §5.5.5）。

**建议**:

1. 明确隐私与数据目标：如果不需要统计，删除 51.la 注入代码；如果需要，把它改为 `_config.ayeria.yml` 中的 `tracking.la51.enable/id`，并在隐私说明中披露。
2. 不建议同时启用 Google Analytics 与百度统计：中国大陆无法正常使用 Google Analytics，只会增加一次失败请求；百度统计是否启用取决于对百度生态的接受度。
3. 不蒜子脚本已自托管，这是正确的；若未来启用，其 PV/UV 仍由 busuanzi 服务端计数，脚本本地化并不改变外部请求依赖。
4. 无论采用哪种统计，都不应阻塞渲染；条件加载加 `defer/async` 是底线。

### 12.5 giscus 评论系统在中国大陆的可用性

**分析**: giscus 依赖 GitHub Discussions API。GitHub 在中国大陆处于间歇性不可用状态（非持续封锁，但访问不稳定）。当 GitHub 不可用时：
- 评论模块无法加载，但不影响文章正文阅读（可降级功能）
- 评论加载失败不会阻塞页面渲染

**建议**: 当前方案可接受。建议在前端添加评论加载失败的友好提示（如"评论暂不可用"），并关注 GitHub 在中国大陆的可用性趋势。如果评论功能被证明为高频使用的核心功能，可考虑备选：Waline + Vercel（中国大陆部分地区可用）或 Twikoo + 腾讯云 CloudBase。

---

## 十三、问题优先级汇总（2026-09-17 复核重排）

> **排序原则（本次复核）**: 只保留能带来可验证性能收益或显著维护成本降低的事项；把让代码更优雅但不改变行为/成本的重构降级为可选。旧版表格中的部分高优先级项（如 permalink 扁平化）经复核后撤下，见 §16.4。状态以 2026-09-17 工作区为准。

### 🔴 高优先级（影响真实用户体验、正确性或默认行为）

| # | 问题 | 类别 | 复核依据 |
| --- | --- | --- | --- |
| §5.4 | 图片未优化：目录 29.7MB，单篇文章 22MB 且无懒加载 | 性能/带宽 | 最大 5 张 16.4MB → 实测约 965KB；重文章页可降一个数量级 |
| §5.5.1 | `search.xml` 全文索引在每个页面首屏 eager load | 性能/架构 | 侧边栏 `.local-search` 永远存在，53 篇文章全文索引随每次首屏下载 |
| §5.5.2 | 搜索脚本正则崩溃 + 重复计算 + 摘要截取 bug | 正确性/算法 | `c++`、`(`、`[`、`*` 等搜索词必抛异常 |
| §5.5.3 | KaTeX `allpost: true` 使所有页面加载公式资源并扫描 body | 性能 | 仅 3 篇公式文，其余约 50 个页面白载 |
| §5.3 / §12.3 | `fonts.font.im` 4 字重外部字体位于渲染关键路径 | 性能 | 跨境外链阻塞首屏；系统字体栈可零成本替代 |
| §5.2 | `jquery-modal` 死依赖；`justifiedGallery`/`lazyload` 无条件加载 | 性能/维护 | 全仓库无 modal 调用点；0 篇文章使用 albums/lazy |
| §5.5.5 / §14.5.2 | 51.la 统计无条件加载且 ID 硬编码 | 隐私/性能/配置 | 无法通过配置关闭；所有访客都会连接第三方 |
| §8.3 | 主题无锁文件、CI 缓存 key 恒为常量、`npm install` 非确定 | CI/可维护性 | 本地 Node 24 构建已复现失败；缓存可能长期复用旧依赖 |

### 🟡 中优先级（影响可维护性、部分页面性能或站点可发现性）

| # | 问题 | 类别 | 复核说明 |
| --- | --- | --- | --- |
| §5.5.4 | PhotoSwipe、clipboard.js、随机句子 97KB 文本按页/按需化 | 性能 | 仅影响非图片/非代码页与首访带宽，收益可观但低于上表 |
| §3.5.2 | 缺少 `prefers-color-scheme` 系统偏好检测 | 体验/亮暗系统 | 成本极低，仍未实现；当前仅识别 `localStorage === '0'` |
| §10.3 | 主题构建工具链陈旧（Rollup 2 / plugin-styles 3 / terser 插件已 deprecated） | 构建/可维护性 | 与 §8.3 同源；建议先锁版本止血，再规划升级 |
| §7.1 / §7.2 / §7.3 | 缺少 Sitemap、robots.txt、Open Graph/Twitter Card | SEO | 仍然缺失；robots 不应照抄旧版的 `Disallow: /resume/`，见 §7.2 更正 |
| §2.4 | RSS 订阅未配置 | SEO/订阅 | 仍然缺失；安装插件成本低 |
| §10.1 | `hexo-renderer-markdown-it-katex` 使用 `^3.4.4` 范围版本 | 依赖管理 | 根锁文件已固定 3.4.4，但 CI `npm install` 使范围仍有意义；建议精确版本 |
|  | 主题默认配置缺失：只有 `_config.yml.old`，README/解耦文档却声称有 `_config.yml` | 主题架构/可维护性 | 当前站点无功能影响（用户配置覆盖全部键），但对主题独立发布与默认值升级有实际影响；修复成本近乎为零 |
| §11.1 / §11.2 | 缺少跳过导航链接、社交图标缺少 `aria-label` | 可访问性 | 已复核仍存在；修复成本低 |
| §5.1 | jQuery 无条件加载（89.5KB）且 `ayeria.js` 整体耦合 | 性能/架构 | 移除需中等改造，建议在模块化/逐功能迁移时处理，不单独高优先 |
| §7.4 | `pretty_urls` 仍保留 `index.html`/`.html` 后缀 | SEO | 可低成本改 false，GitHub Pages 同时兼容两种形式；不需重定向，收益中等 |
| §14.5.1 / §14.9 | `core.js` 死代码、搜索路径/统计 ID 硬编码 | SOLID/维护 | 应在 §5.5.1/§5.5.5 的伴随修复中一并解决 |

### 🟢 低优先级（可选清理，不产生显著行为/性能变化）

| # | 问题 | 类别 | 说明 |
| --- | --- | --- | --- |
| §1.1 | `source/_drafts/` 混有 42 个非标准文件（`哲学.py` + 16 个无 front-matter Markdown） | 目录结构 | 不影响构建，整理草稿时顺手处理 |
| §1.4 | `source/test/` 仍未加入 `skip_render` | 目录结构 | 演示页会进入生产输出；建议随 skip_render 审查一起修 |
| §1.5 | 中文图片文件名 | 目录结构 | 维持可忽略；若做 §5.4 批量优化可顺带改 ASCII 命名 |
| §2.2 | `post_asset_folder: false` | 配置 | 维持现状；启用对已有全局图片无收益且有迁移风险 |
| §5.4 后续 | 响应式 `srcset`、CI 增量压缩 | 性能 | 完成第一轮压缩/懒加载后再评估 |
| §6.3 | `lock` 功能未删除，配置仍留默认密码 `123456` | 安全 | 功能关闭且前端锁不可靠；建议删除默认密码/模板 |
| §9.1 / §9.2 | `.editorconfig`、根目录 `debug.py`/`debug_wsl.py` | 可维护性 | 低成本整理；ROI 普通 |
| §14.1 / §15 | `ayeria.js` 模块拆分 | 可维护性 | 只改善维护性，不减少首屏体积；并入伴随修复后再做，非当务之急 |
| §14.7 / §14.8 | `core.js` 死代码、`meta_generator.js` 对 `default_config.js` 的冗余依赖 | 维护 | 低风险清理 |
| §12.5 | giscus 中国大陆可用性 | 架构 | 维持可接受，增加失败提示可在后续处理 |

### ⚫ 不建议实施（本次复核撤下或更正）

| 旧条目 | 不实施/降级理由 |
| --- | --- |
| §2.3 permalink 改为 `:year/:title/` 或 `:title/` | GitHub Pages 无服务端重定向，需为每篇旧文生成跳转页；日期型 URL 对博客是稳定常态，SEO 收益不足以支撑全站 404 风险 |
| §14.1.3 将 `category_map`/`tag_map` 抽到 `source/_data/` | 这是 Hexo 核心配置项，移出后分类/标签路径映射会失效；旧建议不可实施 |
| §3.4 `:root` 语义翻转 | 改动大、收益仅为语义一致性，维持现状 |
| §3.5.3 暗色模式第三态跟随系统 | 需求未出现前不建设；若只做 §3.5.2 的单向跟随，成本更低 |
| §5.1 先加 `defer` 再议 | 脚本已在 body 末尾，defer 不减少下载量，收益有限；按需化资源更有效 |
| §15 六模块大拆分 | 280 行文件拆成 6 个模块只改善可维护性，Rollup 仍输出单 bundle；建议先做伴随修复，需要时再做 3-4 个高内聚模块 |
| §2.2 立即迁移所有图片到 `post_asset_folder` | 与 §5.4 的图片压缩相比收益低、迁移风险高；维持逐步评估 |

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
- `_config.yml` 负责 Hexo 核心配置，`_config.ayeria.yml` 负责主题配置  关注点分离清晰
- `.github/workflows/pages.yml` 单一职责：构建部署流水线
- `.github/dependabot.yml` 单一职责：依赖更新策略

**违规（2026-09-17 复核更正）**：
- `_config.yml` 混合了站点元数据、URL 规则、分类/标签映射、Markdown 渲染器配置  这些确实有不同变更原因。但旧报告将分类/标签映射抽到 `source/_data/`的**建议不可实施**：`category_map`/`tag_map` 是 Hexo 核心配置项，必须由 Hexo 在生成阶段读取；移出后分类/标签路径映射会失效。本条应从改进清单撤下，维持现状。
- `.github/dependabot.yml` 当前只覆盖根目录 npm，主题目录构建依赖不在提醒范围内（§8.3）；这不是职责问题，而是覆盖缺口。
- 根目录 `debug.py`、`debug_wsl.py` 属于工具链脚本，可归入 `scripts/` 或 `tools/`（低优先级）。

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
- `_variables.styl` 集中定义 Stylus 编译时设计令牌（字体、颜色值、尺寸、断点）；`_tokens.styl` 将其映射为 CSS 自定义属性并定义亮/暗双套配色，换肤只需修改 `_tokens.styl`
- Stylus `_mixins.styl` 提供可复用混入（`center()`、`clearfix()` 等），组件样式通过调用混入扩展
- 29 个 `_partial/*.styl` 通过 `style.styl` 的 `@import` 列表组织，新增组件样式文件只需追加一行 import

**违规**：
- ~~部分组件文件（`search.styl`、`reward.styl`、`share.styl` 等 7 个文件）的 `body.darkmode` 块中仍使用裸 hex 值定义组件级 CSS 自定义属性，未抽为 Stylus 变量，降低了通过统一变量体系管理暗色配色的覆盖力（详见 §3.5.1）~~（已修复）

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

**2026-09-17 复核（旧表有误，已修正）**：

| 资源 | 加载位置 | 实际需求 | 复核结论 |
|------|---------|---------|---------|
| `jquery-3.6.0.min.js` (89.5KB) | `after-footer.ejs:1`  无条件加载 | `ayeria.js` 全模块、clipboard 内联代码等均依赖 jQuery | 当前架构的运行时基础，不是少数插件依赖（§5.1） |
| `jquery-modal` JS + CSS | `after-footer.ejs:22-23`  无条件加载 | 全仓库检索不到任何调用点（无 `.modal(`、无 `rel="modal:open"`） | **死依赖，直接删除**，不是仅图片画廊页需要 |
| `jquery.justifiedGallery.min.js` | `after-footer.ejs:24`  无条件加载 | 仅 `post.albums` 非空时生成的 `#gallery` 需要；当前 0 篇文章使用 | 随 `post/justifiedGallery.ejs` 共址按需加载 |
| `lazyload.min.js` (4.2KB) | `after-footer.ejs:2`  无条件加载 | 仅未被引用的 `post/albums.ejs` 使用 `class="lazy"`；现有文章无 lazy/data-original | 死代码，删除或改用原生 `loading="lazy"` |
| `pace.min.js` | `head.ejs:43`  由 `progressBar` 控制 | 已有条件判断 |  条件正确；建议自托管 |
| PhotoSwipe CSS2 + JS2 | `viewer.ejs`  由 `image_viewer` 控制 | 仅含图片页面需要 |  当前所有页面加载，应改条件/按需 |
| KaTeX CSS + JS2 | `katex.ejs`  由 `allpost \|\| page.math` 控制 | 当前 `allpost: true` 导致所有页面加载 |  应改为 `allpost: false` + 文章 `math: true` |
| `clipboard.min.js` | `post/clipboard.ejs`  由 `copy_btn` 控制 | 仅含代码块的页面需要 |  当前所有页面加载，应改条件/自托管 |

**建议**: 不要再沿用把 jquery-modal 和 justifiedGallery 包进 `post.photos || post.gallery`的旧条件：markup 由 `post.albums` 生成，且 `after-footer.ejs` 上下文是 `page`。正确做法是把资源与使用它的 partial 共址：删除 jquery-modal；把 justifiedGallery 的 `<script>` 与初始化移入 `post/justifiedGallery.ejs`；lazyload 与 `post/albums.ejs` 一并删除或改原生懒加载；PhotoSwipe/clipboard/KaTeX 按页面能力加载。这些修复不依赖 §15 的模块拆分。

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
| `ayeria.js:255-280` 硬编码 51.la 统计 ID | `{ id: "JGjrOr2rebvP6q2a", ck: "JGjrOr2rebvP6q2a" }` 直接写在源码中，应通过 HTML `data-*` 属性或 `theme` 配置传入 |
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

> **2026-09-17 复核**：SOLID 相关问题的优先级已统一并入 §13 与 §16，避免重复表格与过期排序。当前仍然成立的核心问题简述如下：
> - `ayeria.js` 单文件 13 职责（SRP）仍存在；但 §15 的完整拆分只带来维护性收益，已降级为伴随修复完成后可选。
> - `after-footer.ejs` 仍承担多类资源加载；真正的问题不是职责数，而是其中 `jquery-modal`/lazyload 是死加载、PhotoSwipe/KaTeX/clipboard 未按需化（§5.2/§5.5）。
> - 51.la ID 硬编码、`share.js` 平台 if/else、`click_effect` 魔法数字、评论 partial 接口不一致仍然存在，分别见 §5.5.5、§14.2.1、§14.3.1。
> - 旧报告未使用 Hexo `_data/`应拆分看：`category_map`/`tag_map` 不可迁移（§14.1.3）；MC 成员/手办柜数据是否迁移仍属低优先级自定义页面决策（§4）。
> - `core.js` 死代码、`meta_generator.js` 冗余依赖、搜索路径硬编码仍待清理，建议随 5.5.1 的伴随修复解决。

---

## 十五、`ayeria.js` 模块化重构方案

> **新增于 2026-05-20**：本节为 §14.1 / §14.4 / §14.5 所描述客户端 JS 问题的专项拆分方案，是近期重构的主要方向。

> **实施状态（2026-09-17 复核）**: 截至本次复核，`source-src/js/ayeria.js` 仍为 280 行单体 IIFE，`main.js` 仍导入 `./js/ayeria`；§15 的拆分方案尚未实施。按本次只做有实际收益的优化标准，建议调整实施顺序：
>
> 1. 先做与 §5.5 重叠且有直接运行时收益的伴随修复：删除 `isMobile` 死代码；搜索索引改为首次交互加载并把路径配置化；51.la 改为配置驱动/移除；justifiedGallery/lazyload/modal 按需化。
> 2. 模块拆分本身只带来可维护性收益（Rollup 仍打成单文件，不减少首屏体积），不应作为最高优先级；若执行，建议合并为 3-4 个高内聚模块，而不是为凑数拆成 6 个。
> 3. 如果未来要移除 jQuery（§5.1），拆分是合理的前置准备，但仍应按功能逐个迁移，避免大爆炸式重写。

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

> **2026-09-17 说明**: 以下清单是方案实施后的历史规划，目前尚未执行。执行时以 §16 的顺序和 13 的优先级为准；其中 51.la 迁移、搜索路径去硬编码仍然需要，但搜索还应增加首次交互加载；justifiedGallery 不应按原 15.3 第 2 点移入 `after-footer.ejs`，而应移入 `post/justifiedGallery.ejs`（5.2/14.4.1）。

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

## 十六、2026-09-17 复核结论与实施顺序

> 本节是 2026-09-17 全面复核的结论汇总，与 §13 的新排序配套。只列值得做的事项，并明确列出不建议做的旧建议及其理由。

### 16.1 旧报告状态修正

| 旧条目 | 2026-09-17 状态 |
|--------|----------------|
| §3.1 `custom.styl` 重构 | 已完成：`custom.styl` 17 行、29 个 Stylus partial 通过 Rollup 输出。更正一处事实：`clipboard.styl` 由 `after-footer.ejs` 引用，不是 `head.ejs`。 |
| §3.2 构建产物提交仓库 | 已完成：`source/dist/` 已被主题 `.gitignore` 忽略且未跟踪；CI 会构建主题。 |
| §3.3 `index.js` 空壳 | 已完成：已添加详细注释。 |
| §3.4 暗色系统架构 | 已完成：`localStorage`、亮色 FOUC 防护、`_darkmode.styl` 拆分均已落地；`:root` 语义倒置按原决策保留。 |
| §2.1 `future: true` | 已修复为 `false`。 |
| §8.2 / §10.2 CI 主题构建 | 已修复构建步骤，但依赖安装仍不可复现，见 §8.3。 |
| §1.1 根目录非标准目录 | 部分完成：根目录已清理，但 `source/_drafts/` 仍混有 42 个非标准文件。 |
| §1.5 中文图片名 | 结论可维持为低优先级，但原判据图片数量有限已过期：现有 50 个文件、29.7MB。 |
| §12.2 staticfile CDN 清单 | 过期：jQuery、lazyload、tocbot、busuanzi、点击特效等已自托管；modal 是死依赖而非画廊页需要。 |
| §12.4 仅不蒜子提供统计 | 不实：不蒜子已关闭，实际唯一在线的统计是硬编码的 51.la。 |
| §13 优先级表 | 已按本次证据重排；permalink 扁平化、`category_map` 数据化等建议撤下。 |
| 主题默认配置 | 主题内部 `decoupling-report` 与 README 声称存在 `themes/ayeria/_config.yml`，实际只有 `_config.yml.old`。 |

### 16.2 本次新增的高价值优化

| 优先级 | 事项 | 核心依据 | 预期收益 | 成本/风险 |
|--------|------|---------|---------|----------|
| P0 | 优化存量图片 + 文章图片原生懒加载 | `source/images` 29.7MB；单篇 22MB；最大 5 张转码实测约 6% | 单页体积下降一个数量级；移动端带宽与 LCP 显著改善；仓库/部署体积同步下降 | 中低；批处理保持引用路径不变，首图保留 eager |
| P0 | 搜索索引改为首次交互加载；修复 `search.js` 正则/预处理/摘要 | `.local-search` 在所有页面；`search.xml` 含全部 53 篇全文；`c++` 等搜索词必崩 | 移除每次首屏的全文索引下载；搜索可靠性恢复；移动端输入更顺滑 | 低到中；改动集中在 `ayeria.js` 与 `search.js` |
| P0 | KaTeX 改为仅公式文章加载，并验证客户端 JS 是否冗余 | 当前 `allpost: true` 导致所有页面加载 CSS+2 JS 并扫描 body；实际仅 3 篇含公式 | 约 50 个页面减少外部资源与 CPU 扫描；若验证成立可再删 JS | 低；需要给 3 篇文章加 `math: true` 并构建验证 |
| P0 | 删除 jquery-modal；justifiedGallery/lazyload/PhotoSwipe/clipboard 按需化 | modal 无调用点；albums/lazy 使用量为 0；PhotoSwipe/clipboard 当前全站加载 | 每页减少多个外部请求；消除死代码 | 低；注意把 justifiedGallery 初始化随 `#gallery` partial 共址 |
| P1 | 中文字体改系统字体栈或大幅缩减并自托管 | `fonts.font.im` 4 字重位于关键路径；中国大陆可用性不可控 | 消除首屏外部阻塞点，减少字体传输 | 中；需在 Windows/macOS/iOS/Android 验证字体栈观感 |
| P1 | 主题锁文件 + CI `npm ci` + Dependabot 覆盖主题 | 锁被 `.gitignore` 忽略；缓存 key 是常量；本地 Node 24 构建已复现失败 | 构建可复现，缓存可失效，依赖更新可被提醒 | 低；先生成锁文件止血，工具链升级另行计划 |
| P1 | 恢复主题 `_config.yml` 默认配置 | README 与主题文档的承诺与实际不符；当前站点靠完整覆盖配置运行 | 主题可独立复用/升级；未配置项有安全默认值 | 低；重命名后需构建验证覆盖优先级 |
| P1 | 51.la 配置化或删除；随机句子文本缓存/裁剪 | 51.la 无法配置关闭；随机句子每页 fetch 97,672 字节 | 明确隐私边界；减少每页传输 | 低 |
| P2 | Sitemap/robots/OG、skip link/aria、`prefers-color-scheme` | 仍缺失，成本低 | 站点可发现性与可访问性改善 | 低；robots 策略需先确定 |
| P2 | 工具链升级、模块拆分、死代码清理、`.editorconfig` | §8.3/§10.3/§14/§15 所列 | 长期维护性 | 中；按需排期 |

### 16.3 复核方法与局限

- 本次复核基于工作区静态代码与文件测量，未联网；外部 CDN 资源的实际体积/可用性未实测。
- 完整 Hexo 构建因根依赖不在本机离线缓存中而未执行；搜索索引实际体积、构建后页面传输量应在 CI 或完整本地环境中用 `public/search.xml`、浏览器 Network/Lighthouse 复测。
- 图片转码数据为本机 ffmpeg/libwebp 实验，用于估算量级；实际优化脚本应采用项目选定的工具与质量参数，并在有代表性的图片上目检。
- 主题构建依赖曾临时安装用于测量，已完成清理；工作区无未跟踪产物。

### 16.4 明确不建议实施的旧建议

| 旧建议 | 理由 |
|--------|------|
| §2.3 permalink 改为扁平结构 | 纯静态 GitHub Pages 无服务端重定向，会为全部旧文制造 404 风险；收益缺乏证据 |
| §14.1.3 将分类/标签映射移出 `_config.yml` | `category_map`/`tag_map` 是 Hexo 核心配置，移出即失效 |
| §3.4 翻转 `:root`/`body.darkmode` 语义 | 全局重写 selector，收益仅为语义一致性 |
| §3.5.3 立即实现跟随系统第三态 | 需求未出现；先做 §3.5.2 的低成本系统偏好检测即可 |
| §5.1 仅为 jQuery 加 `defer` | 脚本已在 body 末尾，收益有限；应先按需化资源 |
| §15 一次性拆成 6 个模块 | 只改善可维护性；可先做伴随修复，需要时再拆为 3-4 个高内聚模块 |

### 16.5 推荐实施顺序（P0 → P2）

1. **P0-1 图片**：批处理存量图片 → 页面网络测量确认 → 加原生懒加载过滤器 → 记录规范。
2. **P0-2 搜索**：搜索索引首次交互加载 + 路径配置化 → `search.js` 预计算/防抖/转义/摘要修复 → 构建后测量 `search.xml` 与搜索体验。
3. **P0-3 KaTeX**：`allpost: false` + 3 篇文章 `math: true` → 构建验证公式显示 → 验证客户端 auto-render 是否可以删除。
4. **P0-4 死资源与按需资源**：删除 jquery-modal → lazyload 删除或接入原生懒加载 → justifiedGallery 随 partial 共址 → PhotoSwipe/clipboard 条件化。
5. **P1-1 字体**：选定并验证系统字体栈 → 移除 `fonts.font.im` 链接；或缩减字重后自托管子集。
6. **P1-2 构建**：提交主题锁文件 → CI 全部 `npm ci` → 修复缓存 key → Dependabot 覆盖主题 → 规划工具链升级。
7. **P1-3 主题配置与追踪**：恢复主题 `_config.yml` → 51.la 配置化/删除 → 随机句子缓存或裁剪。
8. **P2**：SEO 基础设施、可访问性、`prefers-color-scheme`、死代码清理、模块拆分、`.editorconfig`、草稿整理。

### 16.6 验收与复测清单

- [ ] `source/images` 体积显著下降（目标：总量下降 80% 以上，重文章页 1-2MB 量级），所有文章图片仍正常显示。
- [ ] 非首图具备 `loading="lazy"`/`decoding="async"`，首图 LCP 未被懒加载拖慢。
- [ ] 未打开搜索前，Network 中不出现 `search.xml`；首次点击搜索后功能正常；`c++`、`(`、`[`、`*` 等关键词不再报错。
- [ ] 非公式文章不再请求 KaTeX；3 篇公式文章显示正常且无重复渲染/闪烁。
- [ ] 非图片、非代码页面不再请求 PhotoSwipe、clipboard、justifiedGallery、jquery-modal。
- [ ] CI 使用锁文件安装，缓存 key 随主题锁文件变化；Node 20 构建通过。
- [ ] 恢复主题默认配置后，`_config.ayeria.yml` 仍能正确覆盖；主题构建与站点生成通过。
- [ ] 51.la 可由配置关闭；随机句子首次加载后复用缓存或文件已缩小。
- [ ] Lighthouse/Network 复测：首页与重文章页的传输量、LCP、主线程搜索输入耗时均较基线改善。

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
