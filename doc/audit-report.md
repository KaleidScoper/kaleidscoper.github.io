# 博客项目代码审查报告

> **审查日期**: 2026-03-28
> **审查范围**: 主题配置、Hexo 配置文件、自定义脚本/插件/功能、模板文件、CSS/样式文件、项目根目录结构、CI/CD
> **排除范围**: 构建产物（public/、node_modules/）、source/_posts/ 下的文章、"文章模板暂存处" 目录
>
> 本文档仅列出**尚未修复**的问题，供协作者参考处理。
>
> 标记说明：✅ 表示**已修复**，🔇 表示**已忽略**，对应条目以删除线标注。

---

## 一、严重 — 安全

### ✅ ~~1. Gitalk OAuth Client Secret 泄露~~

- ~~**位置**: `_config.ayer.yml` — `gitalk.clientSecret` 字段~~
- ~~**问题**: `clientSecret` 被硬编码在配置文件中并提交到仓库。若仓库公开，该 Secret 已泄露，攻击者可冒充 OAuth 应用发起请求。~~
- ~~**建议**:~~
  1. ~~立即到 GitHub Developer Settings 中 regenerate Client Secret~~
  2. ~~Gitalk 的纯前端架构决定了 clientSecret 必须暴露给浏览器，这是已知设计缺陷~~
  3. ~~长期方案：迁移到 [giscus](https://giscus.app/)（基于 GitHub Discussions，无需 Secret）~~
- **修复（2026-03-29）**: OAuth App 已删除；`clientID` 与 `clientSecret` 已从配置中清除；评论系统已迁移至 giscus（基于 GitHub Discussions，无需 Secret）。旧 Gitalk/Twikoo 模板代码以注释形式保留供参考。

---

## 二、项目结构

### ✅ ~~2. 主题的开发元文件被提交到仓库~~

- ~~**位置**: `themes/ayer/` 下~~
- ~~**涉及文件**:~~
  - ~~`themes/ayer/.github/`（FUNDING.yml、ISSUE_TEMPLATE/、workflows/npmpublish.yml）~~
  - ~~`themes/ayer/.travis.yml`~~
  - ~~`themes/ayer/.npmignore`~~
  - ~~`themes/ayer/.gitattributes`~~
  - ~~`themes/ayer/.stylintrc`~~
  - ~~`themes/ayer/README-random-sentences.md`~~
- ~~**问题**: 这些是上游 Ayer 主题的开发用文件，与站点运行无关，增加仓库噪音。~~
- ~~**建议**: 使用 `git rm` 删除并在 `.gitignore` 中排除。若需要从上游同步更新，考虑用 git submodule 或 npm 方式管理主题。~~
- **修复（2026-03-29）**: 原作者已永久停止更新，本项目为 Ayer 的唯一维护副本，无上游同步需求，采用 "absorb & own" 策略将主题视为一等公民代码。已 `git rm` 移除纯上游开发产物（`.github/`、`.travis.yml`、`.npmignore`、`.gitattributes`、`move_config.js`）；根目录 `.gitignore` 添加对应条目防止重新引入；`package.json` 元数据已更新为当前维护者信息（原作者保留于 `contributors` 字段）。保留有构建/lint 价值的 `.stylintrc`、`rollup.config.js`、`README*.md` 及法律要求的 `LICENSE`。

### 🔇 ~~3. `debug.py` 放在项目根目录~~

- ~~**位置**: 根目录 `debug.py`~~
- ~~**问题**: 本地调试启动脚本，不应出现在生产仓库中。~~
- ~~**建议**: 将 `debug.py` 加入 `.gitignore`，或移入 `tools/` 目录。~~

### 🔇 ~~4. `source/test/` 测试页面被提交~~

- ~~**位置**: `source/test/index.md`~~
- ~~**问题**: 视差滚动效果演示页会被构建并部署到正式站点的 `/test/` 路径。~~
- ~~**建议**: 删除该目录，或将 `test/**` 加入 `_config.yml` 的 `skip_render` 列表。~~

### 🔇 ~~5. 简历目录大量代码重复~~

- ~~**位置**: `source/resume/` 与 `source/resume-en/`~~
- ~~**问题**: 两个目录下的 `css/`（含 font-awesome、micons 等）和 `js/`（jquery-2.1.3.min.js、modernizr.js、plugins.js 等）完全重复，约 500KB+ 冗余。~~
- ~~**建议**: 将共享的 CSS/JS 抽到 `source/resume-assets/` 公共目录，两个简历页面共用。~~
- **忽略（2026-03-29）**: 两份简历面向不同语言的雇主，计划未来各自独立定制（布局/样式可能分化），保持目录独立是刻意设计。

### 6. 项目中存在多个不同版本的 jQuery

- **位置**:
  - `themes/ayer/source/js/jquery-3.6.0.min.js`（全站）
  - `source/resume/js/jquery-2.1.3.min.js` 和 `source/resume-en/js/jquery-2.1.3.min.js`（简历页）
  - `source/mc-server/index.html` 第 14 行：从 Staticfile CDN 加载 jQuery 3.5.1
- **建议**: 至少将 MC 服务器页面的 jQuery 版本与主站统一（3.6.0 或更新）。简历页如果模板允许也建议升级。

---

## 三、配置质量

### ✅ ~~7. `description` 和 `keywords` 为空 — SEO 不利~~

- ~~**位置**: `_config.yml` — `description` 和 `keywords` 字段~~
- ~~**问题**: 两个字段为空，导致页面 `<meta>` 标签缺失，对搜索引擎收录不利。~~
- ~~**建议**: 填写有意义的站点描述和关键词，例如：~~
  ```yaml
  description: 'Kaleid Scoper 的个人技术博客，记录安全研究、Web 开发与生活随笔'
  keywords: 安全,Web开发,博客,技术笔记
  ```
- **修复（2026-03-29）**: 已在 `_config.yml` 中填入站点描述与关键词。`head.ejs` 模板已具备完整的分级渲染逻辑（文章页优先使用 front-matter 的 `description`/`keywords`，回退到站点级配置），无需修改模板代码。

### ✅ ~~8. 语法高亮可能存在冲突~~

- ~~**位置**: `_config.yml`（`syntax_highlighter: highlight.js`）+ `themes/ayer/layout/_partial/head.ejs`（CDN 加载 highlight.js）~~
- ~~**问题**: Hexo 在构建时使用内置 highlight.js 渲染代码块，同时 `head.ejs` 从 CDN 额外加载了 highlight.js 11.8.0，可能导致客户端重复渲染。~~
- ~~**建议**: 二选一：~~
  - ~~**方案 A**（推荐）：删除 `head.ejs` 中的 CDN highlight.js 引用（第 38-40 行），保留 Hexo 内置构建时渲染~~
  - ~~**方案 B**：将 `_config.yml` 中 `syntax_highlighter` 设为空，完全由客户端 CDN 渲染~~
- ~~**注意**: 方案 A 可能使代码块配色变化（从 "github" 主题变为主题内置样式），请在本地预览后决定。~~
- **修复（2026-03-29）**: 采用方案 A 并进一步优化：移除 CDN highlight.js 引用及 `ayer.ejs` 中的冗余初始化脚本（节省约 40KB/页）；在 `source/css/custom.styl` 中通过 CSS 自定义属性重建整个代码块样式系统，实现亮色（VS Code Light+）/ 暗色（VS Code Dark+）双模式自动跟随全站主题切换；新增语言标签显示、行内代码独立样式、响应式字体尺寸及未高亮代码块的兜底样式。

### ✅ ~~9. 评论系统逻辑混乱~~

- ~~**位置**: `themes/ayer/layout/_partial/article.ejs` 第 66-71 行~~
- ~~**问题**:~~
  - ~~Gitalk 的显示条件为 `!index`（全站非列表页生效）~~
  - ~~Twikoo 的显示条件为 `is_post()`（仅文章页生效）~~
  - ~~第 70 行注释提到想"全站支持评论区"，但只修改了 Gitalk，Twikoo 未同步修改~~
  - ~~Twikoo 已被禁用（envId 为空），当前仅 Gitalk 在工作~~
- ~~**建议**: 明确保留一个评论系统。若只用 Gitalk，清理 Twikoo 相关模板代码；若要迁移到 giscus（见问题 #1），统一替换。~~
- **修复（2026-03-29）**: 统一替换为 giscus，使用 `!index` 条件（全站非列表页）。Gitalk 与 Twikoo 的 partial 引用已注释，对应模板文件（`gitalk.ejs`、`twikoo.ejs`）内保留完整原始代码及停用说明。新增 `giscus.ejs` 模板，并在 `ayer.js` 中实现暗色模式联动。

### 🔇 ~~10. `markdown-it` 插件声明但未显式安装~~

- ~~**位置**: `_config.yml` — `markdown_it.plugins` 列表（10 个插件）vs `package.json`~~
- ~~**问题**: 配置了 `markdown-it-abbr`、`markdown-it-emoji`、`markdown-it-footnote` 等插件，但未在 `package.json` 中显式声明。它们可能作为 `hexo-renderer-markdown-it-katex` 的间接依赖被安装，但这种隐式依赖很脆弱。~~
- ~~**建议**: 执行 `npm ls markdown-it-abbr` 等命令确认这些包是否存在。如果是独立依赖，使用 `npm install --save` 显式添加。~~
- **忽略（2026-03-29）**: 经 `npm ls` 验证，全部 10 个插件均为 `hexo-renderer-markdown-it-katex@3.4.4` 的**直接 `dependencies`**（非 peer/optional），不存在真正的隐式依赖风险。该渲染器已停更（仅 3 个版本）且本项目锁定 `^3.4.4`，依赖链稳定。博客有多篇文章使用 KaTeX 数学公式，渲染器为必要依赖。额外显式安装反而可能引入版本去重问题，当前状态即为最佳实践。

### ✅ ~~11. 缺少 `hexo-generator-searchdb` 依赖~~

- ~~**位置**: `_config.ayer.yml`（`search: true`）+ `themes/ayer/source/js/search.js`~~
- ~~**问题**: 搜索功能已启用且有对应 JS，但 `package.json` 中没有 `hexo-generator-searchdb` 或 `hexo-generator-search`。搜索功能可能完全不工作。~~
- ~~**建议**:~~
  ```bash
  npm install hexo-generator-searchdb --save
  ```
  ~~然后在 `_config.yml` 中添加：~~
  ```yaml
  search:
    path: search.xml
    field: post
    content: true
  ```
- **修复（2026-03-29）**: 已安装 `hexo-generator-searchdb` 并在 `_config.yml` 中添加 `search` 配置段（`path: search.xml`、`field: post`、`content: true`、`format: html`）。

---

## 四、CI / 部署

### 12. Dependabot 每日检查过于频繁

- **位置**: `.github/dependabot.yml`
- **问题**: `interval: daily` 且 `open-pull-requests-limit: 20`，对博客项目来说产生过多噪音。
- **建议**: 将 `interval` 改为 `weekly` 或 `monthly`，`open-pull-requests-limit` 降至 `5`。

---

## 五、代码质量

### 13. SweetAlert2 在每个页面无条件加载

- **位置**: `themes/ayer/layout/_partial/head.ejs` 第 46-50 行
- **问题**: 即使页面不需要弹窗，SweetAlert2 的 CSS 和 JS（约 40KB）也会在每个页面加载，影响首屏性能。
- **建议**: 通过配置项条件加载，或为 `<script>` 添加 `defer` 属性。

### ✅ ~~14. CDN 来源不统一~~

- ~~**涉及文件**: `head.ejs`、`after-footer.ejs`、`source/mc-server/index.html`~~
- ~~**问题**: 同时使用 `cdn.staticfile.org`、`cdn.jsdelivr.net`、`cdnjs.cloudflare.com`、`ajax.googleapis.com` 等多个 CDN，增加 DNS 查询次数。~~
- ~~**建议**: 统一使用一个 CDN 提供商（推荐 `cdn.jsdelivr.net`），便于维护并减少连接开销。~~
- **修复（2026-03-29）**: 已将所有第三方库 CDN 统一为 `cdn.staticfile.org`；移除 `mc-server` 中对 `fonts.bunny.net` 的外部字体引用（回退至系统 sans-serif 字体）。

### ✅ ~~15. EJS 模板可读性差~~

- ~~**位置**: `themes/ayer/layout/_partial/article.ejs` 等多个 `_partial/*.ejs` 文件~~
- ~~**问题**: 大量 EJS 条件逻辑被压缩到单行，例如：~~
  ```ejs
  <% if (!index){ %> <%- partial('post/nav') %> <% } %> <% if (theme.valine &&
  theme.valine.enable && !post.no_valine){ %> <%- partial('post/valine', { key:
  ```
- ~~**建议**: 对条件块进行适当换行缩进，每个 `<% if %>` 独占一行，提高可维护性。~~
- **修复（2026-03-29）**: 对 `article.ejs`、`after-footer.ejs`、`ayer.ejs` 进行格式化重排，所有 `<% if %>` 条件块独占一行并带合理缩进，功能逻辑不变。

### ✅ ~~16. `layout.ejs` 中的内联样式~~

- ~~**位置**: `themes/ayer/layout/layout.ejs` 第 7-15 行（fireworks canvas 样式）~~
- ~~**建议**: 将内联 `<style>` 移入 `source-src/css/` 下的 Stylus 文件中，通过构建流程统一打包。~~
- **修复（2026-03-29）**: 移除 `layout.ejs` 中 `click_effect` 2/3 的内联 `<style>` 和 `style` 属性，统一使用 `.click-effect-canvas` CSS 类；样式写入 `source/css/custom.styl`；同步更新 `clickBoom1.js` 中的选择器。

### ✅ ~~17. `mc-server/index.html` 内联脚本过多~~

- ~~**位置**: `source/mc-server/index.html` 中有 4 段内联 `<script>`（导航切换、复制、平滑滚动等，约 40 行）~~
- ~~**建议**: 创建 `source/mc-server/script.js`，将所有内联脚本迁入。~~
- **修复（2026-03-29）**: 新建 `source/mc-server/script.js`，将 4 段内联脚本（导航折叠、IP 复制、平滑滚动、邮箱复制）全部迁入；HTML 末尾通过 `<script src="script.js">` 引用。

### ✅ ~~18. `footer.ejs` 中 `random-sentences` 配置传递逻辑有误~~

- ~~**位置**: `themes/ayer/layout/_partial/footer.ejs` 第 57 行~~
  ```ejs
  data-random-sentences-config='{"use_local_file": <%= theme.random_sentences.use_local_file || true %>}'
  ```
- ~~**问题**: `|| true` 使得该值**永远**为 `true`，即使配置为 `false` 也会被覆盖。~~
- ~~**建议**: 改为：~~
  ```ejs
  data-random-sentences-config='{"use_local_file": <%= theme.random_sentences.use_local_file !== undefined ? theme.random_sentences.use_local_file : true %>}'
  ```
- **修复（2026-03-29）**: 已将 `|| true` 改为三元运算符 `!== undefined ? value : true`，正确尊重用户配置的 `false` 值。

---

## 六、工程规范

### 🔇 ~~19. Git 提交信息不规范~~

- ~~**近期提交**: `up`, `fix`, `final`, `up5`, `up3`~~
- ~~**问题**: 无描述性信息，无法从日志回溯变更内容。~~
- ~~**建议**: 采用 [Conventional Commits](https://www.conventionalcommits.org/) 规范。~~

### ✅ ~~20. Scaffold 模板过于简陋~~

- ~~**位置**: `scaffolds/post.md`~~
- ~~**问题**: 仅有 `title`、`date`、`tags`，但项目有 `categories`、`reward`、`copyright`、`no_word_count` 等常用 front-matter 选项，每次新建文章需手动添加。~~
- ~~**建议**: 丰富 scaffold。~~
- **修复（2026-03-29）**: 更新 `scaffolds/post.md` 和 `scaffolds/draft.md`，新增 `categories`、`reward: false`、`copyright: true` 字段。`reward` 默认关闭（配合 `reward_type: 1` 逐篇开启策略）；`copyright` 默认开启（当 `copyright_type` 调整为 `1` 或 `2` 时即刻生效）。

### 🔇 ~~21. URL 中保留冗余的 `index.html`~~

- ~~**位置**: `_config.yml` — `pretty_urls.trailing_index: true` 和 `trailing_html: true`~~
- ~~**问题**: 生成的 URL 会包含 `/index.html` 后缀（如 `example.com/about/index.html`），不够简洁。~~
- ~~**建议**: 将两者设为 `false`，获得更干净的 URL（如 `example.com/about/`）。~~

### ✅ ~~22. 友盟 CNZZ 统计可能已过时~~

- ~~**位置**: `_config.ayer.yml` — `cnzz.enable: true`~~
- ~~**问题**: 友盟 CNZZ 已逐步淘汰部分功能，且脚本加载在 `<footer>` 的 `<li>` 中，语义不当。~~
- ~~**建议**: 考虑移除或替换为其他统计方案（如百度统计、Umami 等自托管方案）。~~
- **修复（2026-03-29）**: 已将 `cnzz.enable` 设为 `false`，CNZZ 脚本不再加载。配置项保留以供参考。
