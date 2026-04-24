# 博客项目架构分析报告

> **分析日期**: 2026-04-13
> **最后更新**: 2026-04-24（勘误：主题品牌改名 ayer → ayeria；更新 3.1 修复状态；新增 1.4/1.6/9.2 变动）
> **分析范围**: 项目整体架构、目录结构、配置体系、主题架构、CI/CD、性能、安全、SEO、可维护性
> **参考基准**: Hexo 官方最佳实践、GitHub Pages 部署惯例、静态站点生成器行业通用规范
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


---

## 一、目录结构

### 1.1 （已修复）根目录存在非标准目录

**位置**: 项目根目录

**原问题**: `文章模板暂存处/` 目录位于项目根目录，内含未发布的 Markdown 草稿和无关文件（如 `哲学.py`、`编剧.md`、`生产资料.md`）。

**修复情况**: `文章模板暂存处/` 目录已从根目录移除，相关内容迁移至 `source/_drafts/`，符合 Hexo 草稿约定。但 `source/_drafts/` 中仍残留非 Markdown 文件（`哲学.py`、`生产资料.md`、`编剧.md`、`丝路创意文档.md`、`漂海录创意文档.md` 等），这些文件虽不会被 Hexo 构建，但增加了仓库的认知负担，不符合 `_drafts/` 目录作为文章草稿区的语义。

**建议**: 将 `source/_drafts/` 中的非 Markdown 文件（特别是 `哲学.py`）移出仓库，或归入 `doc/drafts/`。

### 1.2 （已修复）残留配置文件

**位置**: `_config.landscape.yml`

已删除，无需再跟进。

### 1.3 （已忽略）主题目录中的 `.gitkeep`

**位置**: `themes/.gitkeep`

**问题**: 该文件用于在 Git 中保留空的 `themes/` 目录。由于 `themes/ayeria/` 已有内容，此文件已无必要。

**建议**: 删除该文件。

### 1.4 （已忽略）测试文件残留

**位置**:

- ~~`source/images/test.png`~~（已删除 ✓）
- `themes/ayeria/source/test-random-sentences.html`（仍存在）
- `source/test/`（新增：视差滚动效果演示页面，含 `index.md` 和 `img/` 图片）

**问题**: `test-random-sentences.html` 是随机句子功能的测试页，通过站点可直接访问。`source/test/index.md` 是视差滚动演示页，也会被 Hexo 构建并部署到生产站点（当前未在 `skip_render` 中排除）。

**建议**: 删除或将 `source/test/` 加入 `_config.yml` 的 `skip_render`，`test-random-sentences.html` 同理。

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

### 3.1 （已修复）`custom.styl` 严重偏离 Stylus 范式

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

### 3.3 主题 `index.js` 为空壳

**位置**: `themes/ayeria/index.js`

**问题**: 该文件仅包含一行注释，用于防止 `hexo clean` 报错。这是 Hexo 5.0+ 的已知问题，但空壳文件增加了认知负担。

**建议**: 维持现状（Hexo 框架限制），但可在文件中添加更详细的说明注释。

---

## 四、自定义页面架构

### 4.1 （已忽略）简历页面与 Hexo 模板体系完全脱节

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

### 4.2 （已忽略）MC 服务器页面架构独立

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

### 4.3 （已忽略）电子手办柜页面使用 `{% raw %}` 嵌入大量 HTML

**位置**: `source/waifu/index.md`

**问题**: 该页面通过 `{% raw %}` 标签在 Markdown 文件中嵌入了约 280 行原始 HTML。这实质上是将 Markdown 文件当作 HTML 文件使用，失去了 Markdown 的简洁性优势。

**建议**: 将该页面改为 `index.html`（直接使用 HTML），或使用 Hexo 数据文件 + 模板方案（将角色数据提取到 `source/_data/waifu.yml`，通过 EJS 模板循环渲染）。

### 4.4 （已忽略）关于页面混合 Markdown 与 HTML/CSS

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

### 7.3 缺少 Open Graph 和 Twitter Card 元数据

**位置**: `themes/ayeria/layout/_partial/head.ejs`

**问题**: 页面 `<head>` 中没有 Open Graph（`og:title`、`og:description`、`og:image` 等）和 Twitter Card 元标签。分享链接到社交平台时无法显示预览卡片。

**建议**: 在 `head.ejs` 中添加 Open Graph 和 Twitter Card 元标签，或安装 `hexo-auto-canonical` 等插件。

### 7.4 URL 保留冗余后缀

**位置**: `_config.yml` — `pretty_urls.trailing_index: true`、`trailing_html: true`

**问题**: 生成的 URL 包含 `index.html` 或 `.html` 后缀，不够简洁。此问题在 2026-03-28 审查中被标记为"已忽略"。

**补充说明**: 从 SEO 角度，干净的 URL（如 `/about/` 而非 `/about/index.html`）更受搜索引擎青睐。GitHub Pages 会自动处理目录的 `index.html` 回退，因此关闭这两个选项不会导致 404。建议重新评估此决定。

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

### 9.3 （已忽略）Git 提交信息不规范

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

## 十二、问题优先级汇总

### 🔴 高优先级（影响用户体验或站点可发现性）


| #   | 问题                              | 类别    |
| --- | ------------------------------- | ----- |
| 7.1 | 缺少 Sitemap                      | SEO   |
| 7.2 | 缺少 robots.txt                   | SEO   |
| 5.1 | jQuery 每页无条件加载                  | 性能    |
| 8.2 | 主题构建未纳入 CI                      | CI/CD |
| 8.3 | CI 使用 `npm install` 而非 `npm ci` | CI/CD |


### 🟡 中优先级（影响可维护性或工程规范）


| #    | 问题                                  | 类别    |
| ---- | ----------------------------------- | ----- |
| 4.1  | 简历页面与主站脱节                           | 自定义页面 |
| 2.4  | RSS 未配置                             | 配置    |
| 5.2  | jquery-modal/justifiedGallery 无条件加载 | 性能    |
| 5.3  | Google Fonts 加载策略                   | 性能    |
| 6.2  | CDN 资源缺少 SRI                        | 安全    |
| 7.3  | 缺少 Open Graph / Twitter Card        | SEO   |
| 9.1  | 缺乏代码规范工具                            | 可维护性  |
| 10.1 | 渲染器单点依赖                             | 依赖管理  |


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
