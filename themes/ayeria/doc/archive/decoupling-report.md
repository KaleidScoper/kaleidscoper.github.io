# Ayer → Ayeria 主题解耦合与发布方案

> 生成日期：2026-04-14
> 调查范围：`themes/ayeria` 全目录、站点根 `_config.ayeria.yml`、`source/`、`scaffolds/`、`package.json` 等

---

## 一、主题功能调查

### 1.1 当前主题可独立提供的功能

`themes/ayeria` 目录包含 **约 143 个文件**，布局模板 49 个 EJS，14 种语言包，Rollup 构建流水线，以下功能已在主题内实现并可独立工作：

| 功能类别 | 具体能力 | 关键文件 |
|----------|---------|---------|
| **布局系统** | 首页、文章页、归档、分类、标签、友链、通用页、纯内容页 | `layout/*.ejs`（9 个） + `layout/_partial/`（40 个） |
| **侧边栏导航** | 配置式菜单、Logo、搜索入口、RSS 入口 | `_partial/sidebar.ejs` |
| **封面** | 全屏背景图 + typed.js 打字动效 | `_partial/ayeria.ejs` |
| **深色模式** | 一键切换 dark/light | `source-src/css/_darkmode.styl`、`dist/main.js` |
| **进度条** | 页面顶部加载进度条（Pace.js CDN） | `_partial/head.ejs` |
| **公告栏** | 自定义文本 / 一言 API | `_partial/broadcast.ejs` |
| **随机句子** | 本地 txt 文件或内置句子库 | `source/js/random-sentences.js`、`source/data/random-sentences.txt` |
| **文章功能** | TOC 目录、字数统计、代码复制、图片放大、分享按钮、摘要截断、版权声明、打赏（支持多渠道数据驱动）| 各 `_partial/post/*.ejs` |
| **评论系统** | Valine / Gitalk / Twikoo / Giscus（四选一） | `_partial/post/valine.ejs` 等 |
| **数学公式** | MathJax / KaTeX | `_partial/mathjax.ejs`、`_partial/katex.ejs` |
| **Mermaid** | 流程图（CDN） | `_partial/head.ejs` |
| **本地搜索** | XML 索引 + 前端搜索 | `source/js/search.js`、`_partial/post/search.ejs` |
| **统计** | 不蒜子、友盟 CNZZ、Google Analytics、百度统计 | 各 partial |
| **广告位** | 可配置广告栏 | `_partial/ads.ejs` |
| **加密锁屏** | SweetAlert2 密码保护 | `_partial/lock.ejs` |
| **备案信息** | ICP / 公安备案页脚 | `_partial/footer.ejs` |
| **GitHub Ribbon** | 封面右上角 Fork-me 图标 | `_partial/ayeria.ejs` |
| **鼠标特效** | 自定义光标、点击爱心/爆炸/粒子 | `source/js/clickBoom*.js` 等 |
| **Canvas 背景** | 动态线条跟随鼠标 | `_partial/after-footer.ejs` |
| **音乐播放器** | 网易云音乐嵌入 | `_partial/music.ejs` |
| **404 页面** | 自定义 404 | `source/404.html` |
| **多语言** | zh-CN/en 等 14 种 | `languages/*.yml` |
| **构建流水线** | Rollup 打包 CSS/JS | `rollup.config.js`、`source-src/` |
| **自定义 CSS** | 用户可覆盖样式 | `source/css/custom.styl` |
| **图片懒加载** | lazyload.min.js | `source/js/lazyload.min.js` |
| **SEO** | meta 标签、keywords、description、meta_generator 过滤器 | `_partial/head.ejs`、`scripts/filters/` |
| **内置 Helper** | 字数统计、阅读时间、分类树、vendor 链接 | `scripts/helpers/*.js` |

### 1.2 直接发布会缺失的关键文件

以下是**如果立即将 `themes/ayeria` 目录单独发布为 npm 包或 Git 仓库**时会遇到的问题：

#### A. 硬编码的站点专属内容

| 文件 | 硬编码内容 | 状态 |
|------|-----------|------|
| ~~`package.json`~~ | ~~`repository.url`、`bugs.url`、`homepage` 均指向个人站仓库~~ | **已完成** |
| ~~`README.md`~~ | ~~第 13 行写死个人网站链接和标语~~ | **已完成** |

> `hello.js` 的硬编码已修复，现从 `hexo.config.title` 和 `hexo.config.url` 动态读取。`package.json` 已更新为指向独立仓库 `hexo-theme-ayeria`。

#### B. 不适合发布的文件

| 文件 | 原因 |
|------|------|
| `source/favicon.svg.old` | 旧文件备份 |
| `source/favicon.ico.old` | 旧文件备份 |
| `source/test-random-sentences.html` | 测试文件 |
| `source/favicon.svg` | 站主的个人 favicon，非通用 |
| `README-random-sentences.md` | 单功能说明，已合并入主 README，待删除 |

#### C. 缺少标准发布文件

- **无 `CHANGELOG.md`**：无变更日志
- **无 `.npmignore`**（被 `.gitignore` 显式排除了）：发布 npm 时会将 `source-src/`、`.stylintrc` 等开发文件全部打包

---

## 二、站点功能调查

### 2.1 应归入主题但目前在站点侧的功能

| 功能 | 当前位置 | 应归属 | 说明 |
|------|---------|--------|------|
| ~~**完整默认配置**~~ | ~~`_config.ayer.yml`（站点根）~~ | ~~主题内 `_config.yml`~~ | **已完成**：`themes/ayeria/_config.yml` 已创建，个人数据均替换为通用默认值。 |
| **Scaffold 模板** | `scaffolds/post.md`、`scaffolds/draft.md` | 主题可附带示例 scaffold | 模板中包含 `reward: false`、`copyright: true` 等 Ayeria 专有 front-matter 字段。新用户不知道需要手动创建这些 scaffold |
| **打赏二维码图片** | `source/images/reward/*.jpg/webp` | 保留在站点侧 ✓ | 正确做法：这是用户个人资源，不属于主题；但主题 README 应说明路径约定 |
| **分类/标签/友链页面** | `source/categories/index.md` 等 | 保留在站点侧 ✓ | 正确做法：这是用户内容页面，主题只提供对应 layout |

> 友链头像图片（`ahumc.png`、`PASRC.png`、`unialogo.png`、`xmoon.png`）和大尺寸背景图 `background.jpg` 已从主题侧迁出到 `source/images/`。由于 Hexo 的源文件合并机制，URL 路径不变，前端无感。

### 2.2 在站点侧且不应移动的功能（确认无耦合问题）

以下功能正确地保持在站点侧，与主题无耦合：

- `source/about/index.md` + `glass-card.css` — 用户自定义的关于页，使用通用 `page` layout
- `source/waifu/index.md` + `style.css` — 用户自定义的手办页，使用通用 `page` layout
- `source/resume/`、`source/resume-en/` — 跳过渲染的静态简历页
- `source/mc-server/` — 跳过渲染的静态页
- `source/water/` — 静态 HTML
- `.github/workflows/` — CI/CD 配置

---

## 三、解耦合方案

### 3.1 文件层面的具体操作清单

#### ~~第一步：去除剩余站点专属硬编码~~

> **已完成**：`package.json` 已更新为指向独立仓库 `hexo-theme-ayeria`。`hello.js` 已完成动态化改造，`source/images/` 中的站点专属图片已迁出，`README.md` 已重写为通用文档。

#### 第二步：清理不应发布的文件

| 文件 | 操作 |
|------|------|
| `source/favicon.svg` | 替换为一个通用占位 favicon，或移除（让用户自行配置） |
| `source/favicon.svg.old`、`source/favicon.ico.old` | 删除 |
| `source/test-random-sentences.html` | 删除或移到 `test/` 目录 |
| `README-random-sentences.md` | 内容已合并入主 README，删除即可 |

#### 第三步：创建发布配套文件

| 文件 | 说明 |
|------|------|
| `.npmignore` | 排除 `source-src/`、`.stylintrc`、`rollup.config.js`、`.github/`、`test-*`、`*.old` 等开发文件 |
| `CHANGELOG.md` | 变更日志，记录从原版 Ayer 以来的改动 |

#### 第四步：scaffold 示例

在主题目录下创建 `_scaffolds/`（或在 README 中说明），提供包含 Ayeria 专属 front-matter 字段的 scaffold 示例：

```yaml
---
title: {{ title }}
date: {{ date }}
categories:
tags:
reward: false
copyright: true
---
```

### 3.2 站点侧配合改动

完成上述操作后，站点侧需要：

1. **保留 `_config.ayeria.yml`**：这是 Hexo 5+ 的标准覆盖机制，用户的个人配置继续存放于此，它会自动覆盖主题内 `_config.yml` 的默认值。
2. **保留 `source/images/reward/`**：打赏二维码等个人资源继续放在站点侧。
3. **保留 `scaffolds/`**：已有的 scaffold 继续使用。

> 友链头像已迁入 `source/images/`，无需额外操作。

### 3.3 解耦后的目录对照

```
站点根目录/
├── _config.yml              # 站点配置（theme: ayeria）
├── _config.ayeria.yml        # 用户的主题配置覆盖（个人数据在此）
├── scaffolds/                # 用户的文章模板
├── source/
│   ├── _posts/               # 文章内容
│   ├── images/reward/        # 用户的打赏图片
│   ├── images/friends/       # 用户的友链图片
│   ├── about/                # 用户自定义页面
│   └── ...
└── themes/ayeria/            # 主题（可独立发布）
    ├── _config.yml           # 默认配置（通用值）
    ├── package.json          # 指向独立仓库（hexo-theme-ayeria）
    ├── README.md             # 通用文档
    ├── CHANGELOG.md
    ├── LICENSE
    ├── .npmignore
    ├── layout/               # 模板
    ├── source/               # 主题静态资源（含完整 JS 库和字体）
    ├── source-src/           # 构建源码
    ├── scripts/              # Hexo 脚本
    └── languages/            # 语言包
```

---

## 四、持续维护方案——业界惯例

### 4.1 Git Subtree（推荐方案）

**核心思路**：将 `themes/ayeria` 目录作为 Git subtree 管理，主题拥有独立仓库，站点仓库通过 subtree 引入。

```bash
# 一次性设置：将现有目录推送到独立的主题仓库
git subtree split --prefix=themes/ayeria -b ayeria-standalone
git push <theme-repo-url> ayeria-standalone:main

# 添加远端
git remote add ayeria-theme <theme-repo-url>

# 日常开发：在站点仓库中照常修改 themes/ayeria 下的文件

# 发布主题：将站点仓库中的改动推送到主题仓库
git subtree push --prefix=themes/ayeria ayeria-theme main

# 反向合并：将主题仓库的改动拉回站点
git subtree pull --prefix=themes/ayeria ayeria-theme main --squash
```

**优势**：
- 日常开发中 `themes/ayeria` 就是普通目录，无特殊工作流
- 不需要 submodule 的 `.gitmodules` 和 detached HEAD 痛点
- 站点与主题的提交历史可双向同步
- 发布时只需一条 `subtree push` 命令

**劣势**：
- subtree 操作的 `--prefix` 参数较长
- 合并历史可能较杂，建议 `--squash`

### 4.2 Git Submodule（备选方案）

```bash
# 将 themes/ayeria 改为 submodule
git submodule add <theme-repo-url> themes/ayeria
```

**优势**：主题仓库完全独立。
**劣势**：开发体验差——每次改动需要进入子目录单独提交、推送，然后回到站点仓库更新 submodule 引用。对于"站主 = 主题作者"的场景，过于繁琐。

### 4.3 npm 包发布（推荐配合使用）

无论选择 subtree 还是 submodule，都建议同时在 npm 发布主题包：

```bash
cd themes/ayeria
npm publish
```

用户安装方式：`npm i hexo-theme-ayeria -S`，Hexo 5+ 会自动从 `node_modules` 加载主题。

**版本管理建议**：
- 遵循 [语义化版本](https://semver.org/lang/zh-CN/) (SemVer)
- 每次发布前更新 `package.json` 版本号和 `CHANGELOG.md`
- 打 Git tag：`git tag v2.0.0 && git push --tags`

### 4.4 推荐的工作流总结

```
日常开发                             发布主题
┌────────────────┐                 ┌─────────────────┐
│ 站点仓库        │   subtree push  │ 主题独立仓库     │
│ themes/ayeria/ │ ──────────────► │hexo-theme-ayeria│
│                │                 │                 │
│ 直接编辑        │   subtree pull  │ npm publish     │
│ 直接提交        │ ◄────────────── │ git tag         │
└────────────────┘                 └─────────────────┘
```

1. **日常**：在站点仓库中直接编辑 `themes/ayeria/` 下的文件，正常 commit。
2. **发布**：积累到一个版本节点时，执行 `git subtree push` 推送到主题仓库，然后在主题仓库打 tag 并 `npm publish`。
3. **用户反馈**：如果主题仓库收到外部 PR，在主题仓库合并后 `git subtree pull` 拉回站点仓库。

这样就无需每次都重复"清点 → 解耦 → 发布"的流程。

---

## ~~五、主题重命名：Ayer → Ayeria~~

> **已完成**（2026-04-14）。所有文件/目录重命名、代码引用、配置文件、文档均已更新。`source/dist/` 构建产物待重新执行 `npm run build`。

---

## 六、优先级与实施建议

| 优先级 | 任务 | 预估工作量 | 状态 |
|--------|------|-----------|------|
| **P1 — 必须修复** | 清理旧文件和测试文件 | 0.5h | 待处理 |
| **P2 — 建议修复** | 创建 `.npmignore`、`CHANGELOG.md` | 0.5h | 待处理 |
| **P3 — 可选** | 提供 scaffold 示例 | 0.5h | 待处理 |
| **P3 — 可选** | 建立 subtree 工作流（仓库名同步改为 `hexo-theme-ayeria`） | 1h | 待处理 |
| ~~P0~~ | ~~主题重命名 Ayer → Ayeria（文件/目录/代码/配置/文档）~~ | — | **已完成** |
| ~~P1~~ | ~~去除 `package.json` 中的硬编码~~ | — | **已完成** |
| ~~P0~~ | ~~创建主题内 `_config.yml` 默认配置~~ | — | **已完成** |
| ~~P1~~ | ~~重写 `README.md` 为通用安装/配置文档~~ | — | **已完成** |
| ~~P1~~ | ~~去除 `hello.js` 硬编码~~ | — | **已完成** |
| ~~P1~~ | ~~迁出站点专属图片到 `source/images/`~~ | — | **已完成** |
| ~~P2~~ | ~~i18n 修复（category-tree 硬编码中文）~~ | — | **已完成** |
