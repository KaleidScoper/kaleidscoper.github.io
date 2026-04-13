# Ayer 主题解耦合调查报告与方案

> 生成日期：2026-04-14
> 调查范围：`themes/ayer` 全目录、站点根 `_config.ayer.yml`、`source/`、`scaffolds/`、`package.json` 等

---

## 一、主题功能调查

### 1.1 当前主题可独立提供的功能

`themes/ayer` 目录包含 **约 143 个文件**，布局模板 49 个 EJS，14 种语言包，Rollup 构建流水线，以下功能已在主题内实现并可独立工作：

| 功能类别 | 具体能力 | 关键文件 |
|----------|---------|---------|
| **布局系统** | 首页、文章页、归档、分类、标签、友链、通用页、纯内容页 | `layout/*.ejs`（9 个） + `layout/_partial/`（40 个） |
| **侧边栏导航** | 配置式菜单、Logo、搜索入口、RSS 入口 | `_partial/sidebar.ejs` |
| **封面** | 全屏背景图 + typed.js 打字动效 | `_partial/ayer.ejs` |
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
| **GitHub Ribbon** | 封面右上角 Fork-me 图标 | `_partial/ayer.ejs` |
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

以下是**如果立即将 `themes/ayer` 目录单独发布为 npm 包或 Git 仓库**时会遇到的问题：

#### A. 缺少默认配置文件 `_config.yml`（严重）

主题内**不存在** `_config.yml`。所有 325 行主题配置完全存放于站点根目录的 `_config.ayer.yml`，`scripts/default_config.js` 仅包含一个 `meta_generator: true` 的兜底值。

**影响**：用户安装主题后无法获知任何可配置项的默认值，主题无法开箱即用。

#### ~~B. 缺少必要的 JS 第三方库~~ （已更正：误报）

> **勘误（2026-04-14）**：Glob 搜索工具无法检索二进制文件，导致此前误判为缺失。经文件系统直接核实，以下文件**全部存在**且已被 Git 跟踪：`jquery-3.6.0.min.js`、`tocbot.min.js`、`busuanzi-2.3.pure.min.js`、`clickLove.js`、`dz.js`。主题 JS 库完整，共 10 个文件。

#### ~~C. 缺少字体文件~~ （已更正：误报）

> **勘误（2026-04-14）**：同上原因。`remixicon.eot`、`.woff2`、`.woff`、`.ttf` 四个字体文件**全部存在**于 `source/css/fonts/` 中，图标功能正常。

#### D. 硬编码的站点专属内容

| 文件 | 硬编码内容 |
|------|-----------|
| `scripts/events/lib/hello.js` | 启动横幅写死 "Ka1eid's SandBox"、`https://kaleidscoper.github.io` |
| `package.json` | `repository.url`、`bugs.url`、`homepage` 均指向个人站仓库 |
| `README.md` | 第 13 行写死个人网站链接和标语 |

#### E. 不适合发布的文件

| 文件 | 原因 |
|------|------|
| `source/favicon.svg.old` | 旧文件备份 |
| `source/favicon.ico.old` | 旧文件备份 |
| `source/test-random-sentences.html` | 测试文件 |
| `source/favicon.svg` | 站主的个人 favicon，非通用 |
| `README-random-sentences.md` | 单功能说明，应合并入主 README 或独立为文档 |

#### F. 缺少标准发布文件

- **无 `CHANGELOG.md`**：无变更日志
- **无 `.npmignore`**（被 `.gitignore` 显式排除了）：发布 npm 时会将 `source-src/`、`.stylintrc` 等开发文件全部打包
- **无示例配置**：缺少 `_config.example.yml` 供用户参考

---

## 二、站点功能调查

### 2.1 应归入主题但目前在站点侧的功能

| 功能 | 当前位置 | 应归属 | 说明 |
|------|---------|--------|------|
| **完整默认配置** | `_config.ayer.yml`（站点根） | 主题内 `_config.yml` | 用户首次安装需要一份开箱即用的默认配置；Hexo 5+ 的 `_config.[theme].yml` 机制本就是让用户*覆盖*主题内默认值，而非替代 |
| **Scaffold 模板** | `scaffolds/post.md`、`scaffolds/draft.md` | 主题可附带示例 scaffold | 模板中包含 `reward: false`、`copyright: true` 等 Ayer 专有 front-matter 字段。新用户不知道需要手动创建这些 scaffold |
| **打赏二维码图片** | `source/images/reward/*.jpg/webp` | 保留在站点侧 ✓ | 正确做法：这是用户个人资源，不属于主题；但主题 README 应说明路径约定 |
| **友链头像图片** | 实际位于 `themes/ayer/source/images/`（`ahumc.png`、`PASRC.png` 等） | 应迁至站点侧 `source/images/` | 这些是站主个人的友链头像，属于站点内容而非主题资源。之所以能正常显示，是因为 Hexo 会合并主题和站点两侧的 `source/` 目录到 `public/`。发布主题后其他用户会自带这些图片 |
| **大尺寸背景图** | `themes/ayer/source/images/background.jpg`（2MB） | 考虑移除或缩小 | 主题附带的示例封面图应尽量轻量；`cover1-6.jpg` 共约 1.8MB 可酌情保留几张作为示例 |
| **分类/标签/友链页面** | `source/categories/index.md` 等 | 保留在站点侧 ✓ | 正确做法：这是用户内容页面，主题只提供对应 layout |

### 2.2 在站点侧且不应移动的功能（确认无耦合问题）

以下功能正确地保持在站点侧，与主题无耦合：

- `source/about/index.md` + `glass-card.css` — 用户自定义的关于页，使用通用 `page` layout
- `source/waifu/index.md` + `style.css` — 用户自定义的手办页，使用通用 `page` layout
- `source/resume/`、`source/resume-en/` — 跳过渲染的静态简历页
- `source/mc-server/` — 跳过渲染的静态页
- `source/water/` — 静态 HTML
- `.github/workflows/` — CI/CD 配置

### 2.3 分类树 Helper 中的硬编码文本

`scripts/helpers/category-tree.js` 第 77 行硬编码了中文 `"篇文章"` 字符串，未走 i18n。对于非中文用户，此处应改为调用语言包。

---

## 三、解耦合方案

### 3.1 文件层面的具体操作清单

#### 第一步：补齐缺失文件

> **勘误**：原报告列出的 JS 库和 RemixIcon 字体文件经文件系统实际核查**均存在且已被 Git 跟踪**。此前判断为缺失系 Glob 搜索工具无法检索二进制文件导致的误报。

| 操作 | 说明 |
|------|------|
| 创建 `themes/ayer/_config.yml` | 以当前 `_config.ayer.yml` 为蓝本，**将所有个人数据替换为通用默认值/空值**，作为主题的默认配置 |

#### 第二步：去除站点专属硬编码

| 文件 | 操作 |
|------|------|
| `scripts/events/lib/hello.js` | 将横幅文本改为通用的 Ayer 主题介绍，移除个人站 URL；可从 `hexo.config.title` 和 `hexo.config.url` 动态读取 |
| `package.json` | `repository.url` 改为主题独立仓库地址；`bugs.url` 和 `homepage` 同步更新 |
| `README.md` | 重写为面向用户的通用安装/配置文档，移除个人站点链接和标语 |

#### 第三步：迁出站点专属图片资源

主题的 `source/images/` 目录中混入了站主个人的友链头像和大尺寸背景图。Hexo 会将主题和站点两侧的 `source/` 合并输出到 `public/`（站点侧优先），因此只需将文件从主题侧移至站点侧，URL 路径不变，前端无感。

**需从主题迁出到 `source/images/` 的文件**：

| 文件 | 性质 |
|------|------|
| `ahumc.png` | 友链头像（安徽大学 MC 社区） |
| `PASRC.png` | 友链头像（杭州泛美） |
| `unialogo.png` | 友链头像（Unia） |
| `xmoon.png` | 友链头像（星月号） |
| `background.jpg`（2MB） | 大尺寸背景图，不适合作为主题默认资源 |

**可保留在主题中的文件**（属于主题功能资源）：

| 文件 | 用途 |
|------|------|
| `ayer.svg`、`ayer-side.svg` | 主题 Logo |
| `cover1-6.*` | 示例封面图（可酌情保留 1-2 张，其余移除以减小包体积） |
| `forkme.png` | GitHub Ribbon 功能所需 |
| `hexo.png` | 通用的 Hexo 图标 |
| `beian.png` | 备案图标 |
| `mouse.cur` | 自定义鼠标功能所需 |
| `gitee.png`、`github.png`、`hexo-tag-chart.png` | 主题文档/功能所需 |

#### 第四步：清理不应发布的文件

| 文件 | 操作 |
|------|------|
| `source/favicon.svg` | 替换为一个通用占位 favicon，或移除（让用户自行配置） |
| `source/favicon.svg.old`、`source/favicon.ico.old` | 删除 |
| `source/test-random-sentences.html` | 删除或移到 `test/` 目录 |
| `README-random-sentences.md` | 内容合并入主 README 后删除 |

#### 第五步：创建发布配套文件

| 文件 | 说明 |
|------|------|
| `_config.yml` | 完整默认配置（见第一步） |
| `.npmignore` | 排除 `source-src/`、`.stylintrc`、`rollup.config.js`、`.github/`、`test-*`、`*.old` 等开发文件 |
| `CHANGELOG.md` | 变更日志，记录从原版 Ayer 以来的改动 |

#### 第六步：i18n 修复

- `scripts/helpers/category-tree.js`：将 `"篇文章"` 改为 `this.__('posts_count')` 并在各语言包中添加对应翻译条目。

#### 第七步：scaffold 示例

在主题目录下创建 `_scaffolds/`（或在 README 中说明），提供包含 Ayer 专属 front-matter 字段的 scaffold 示例：

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

1. **保留 `_config.ayer.yml`**：这是 Hexo 5+ 的标准覆盖机制，用户的个人配置继续存放于此，它会自动覆盖主题内 `_config.yml` 的默认值。
2. **保留 `source/images/reward/`**：打赏二维码等个人资源继续放在站点侧。
3. **接收从主题迁出的友链头像**：将 `themes/ayer/source/images/` 中的站点专属图片（`ahumc.png`、`PASRC.png`、`unialogo.png`、`xmoon.png`、`lup9304.jpg` 等）移至 `source/images/`。由于 Hexo 的源文件合并机制，路径不变，前端无感。
4. **保留 `scaffolds/`**：已有的 scaffold 继续使用。

### 3.3 解耦后的目录对照

```
站点根目录/
├── _config.yml              # 站点配置（theme: ayer）
├── _config.ayer.yml          # 用户的主题配置覆盖（个人数据在此）
├── scaffolds/                # 用户的文章模板
├── source/
│   ├── _posts/               # 文章内容
│   ├── images/reward/        # 用户的打赏图片
│   ├── images/friends/       # 用户的友链图片
│   ├── about/                # 用户自定义页面
│   └── ...
└── themes/ayer/              # 主题（可独立发布）
    ├── _config.yml           # 默认配置（通用值）
    ├── package.json          # 指向独立仓库
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

**核心思路**：将 `themes/ayer` 目录作为 Git subtree 管理，主题拥有独立仓库，站点仓库通过 subtree 引入。

```bash
# 一次性设置：将现有目录推送到独立的主题仓库
git subtree split --prefix=themes/ayer -b ayer-standalone
git push <theme-repo-url> ayer-standalone:main

# 添加远端
git remote add ayer-theme <theme-repo-url>

# 日常开发：在站点仓库中照常修改 themes/ayer 下的文件

# 发布主题：将站点仓库中的改动推送到主题仓库
git subtree push --prefix=themes/ayer ayer-theme main

# 反向合并：将主题仓库的改动拉回站点
git subtree pull --prefix=themes/ayer ayer-theme main --squash
```

**优势**：
- 日常开发中 `themes/ayer` 就是普通目录，无特殊工作流
- 不需要 submodule 的 `.gitmodules` 和 detached HEAD 痛点
- 站点与主题的提交历史可双向同步
- 发布时只需一条 `subtree push` 命令

**劣势**：
- subtree 操作的 `--prefix` 参数较长
- 合并历史可能较杂，建议 `--squash`

### 4.2 Git Submodule（备选方案）

```bash
# 将 themes/ayer 改为 submodule
git submodule add <theme-repo-url> themes/ayer
```

**优势**：主题仓库完全独立。
**劣势**：开发体验差——每次改动需要进入子目录单独提交、推送，然后回到站点仓库更新 submodule 引用。对于"站主 = 主题作者"的场景，过于繁琐。

### 4.3 npm 包发布（推荐配合使用）

无论选择 subtree 还是 submodule，都建议同时在 npm 发布主题包：

```bash
cd themes/ayer
npm publish
```

用户安装方式：`npm i hexo-theme-ayer -S`，Hexo 5+ 会自动从 `node_modules` 加载主题。

**版本管理建议**：
- 遵循 [语义化版本](https://semver.org/lang/zh-CN/) (SemVer)
- 每次发布前更新 `package.json` 版本号和 `CHANGELOG.md`
- 打 Git tag：`git tag v2.0.0 && git push --tags`

### 4.4 推荐的工作流总结

```
日常开发                          发布主题
┌─────────────┐                 ┌───────────────┐
│ 站点仓库     │   subtree push  │ 主题独立仓库   │
│ themes/ayer/ │ ──────────────► │ hexo-theme-ayer│
│              │                 │               │
│ 直接编辑     │   subtree pull  │ npm publish   │
│ 直接提交     │ ◄────────────── │ git tag       │
└─────────────┘                 └───────────────┘
```

1. **日常**：在站点仓库中直接编辑 `themes/ayer/` 下的文件，正常 commit。
2. **发布**：积累到一个版本节点时，执行 `git subtree push` 推送到主题仓库，然后在主题仓库打 tag 并 `npm publish`。
3. **用户反馈**：如果主题仓库收到外部 PR，在主题仓库合并后 `git subtree pull` 拉回站点仓库。

这样就无需每次都重复"清点 → 解耦 → 发布"的流程。

---

## 五、优先级与实施建议

| 优先级 | 任务 | 预估工作量 |
|--------|------|-----------|
| ~~P0~~ | ~~补齐缺失 JS 库~~ — **误报**，文件存在（Glob 工具不检索二进制文件） | — |
| ~~P0~~ | ~~补齐 RemixIcon 字体文件~~ — **误报**，文件存在 | — |
| **P0 — 阻断发布** | 创建主题内 `_config.yml` 默认配置 | 1h |
| **P1 — 必须修复** | 去除 `hello.js`、`package.json`、`README.md` 中的硬编码 | 1h |
| **P1 — 必须修复** | 迁出站点专属图片（友链头像、大背景图）到站点侧 `source/images/` | 0.5h |
| **P1 — 必须修复** | 清理旧文件和测试文件 | 0.5h |
| **P2 — 建议修复** | 创建 `.npmignore`、`CHANGELOG.md` | 0.5h |
| **P2 — 建议修复** | i18n 修复（category-tree 硬编码中文） | 0.5h |
| **P3 — 可选** | 提供 scaffold 示例 | 0.5h |
| **P3 — 可选** | 建立 subtree 工作流 | 1h |
