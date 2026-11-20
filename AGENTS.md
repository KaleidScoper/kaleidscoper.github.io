# kaleidscoper.github.io

个人 Hexo 博客，使用 hexo-theme-ayeria 主题，通过 GitHub Actions 自动部署到 GitHub Pages。

## 仓库沿革

本仓库于 2026-11-21 重建，Git 历史已清零：

- `main` 只有一个根提交（`chore: rebuild from main@7a5dd39`），内容快照自旧仓库的 `main@7a5dd39`。
- 旧仓库已改名为 `KaleidScoper/kaleidscoper.github.io.old` 并设为私有，仅作归档；本地副本在 `../kaleidscoper.github.io.old`。
- 因此 `git log` 里看不到 2026-11-21 之前的提交，这是预期行为，不代表仓库损坏。不要尝试恢复旧历史，也不要改写当前根提交。
- 需要追溯旧内容时，只读访问本地归档目录或私有旧仓库。

## 技术栈

- **框架**：Hexo 8.1.1
- **主题**：hexo-theme-ayeria（自研主题，源码在 `themes/ayeria/`，同步维护于 `../hexo-theme-ayeria`）
- **渲染器**：markdown-it-katex（数学公式）、EJS、Stylus
- **搜索**：hexo-generator-searchdb
- **CI/CD**：GitHub Actions（`.github/workflows/pages.yml`）

## 常用命令

```bash
# 安装依赖
npm install

# 本地预览（默认 http://localhost:4000）
npm run server   # hexo server

# 构建静态文件
npm run build    # hexo generate

# 清理缓存
npm run clean    # hexo clean

# 部署（通过 GitHub Actions 自动触发，无需手动执行）
# npm run deploy
```

## 内容目录

```
source/_posts/      博客文章（Markdown）
source/             其他页面（about、tags、categories 等）
scaffolds/          文章模板
themes/ayeria/      自研主题源码（直接修改此处）
```

## 工作流

1. 在 `source/_posts/` 写文章（Markdown）
2. `npm run server` 本地预览
3. `git push` 触发 GitHub Actions 自动构建并部署

**注意**：`public/` 目录（本地生成的静态文件）不提交到 git，由 CI 构建。

## 内容规范

文章格式与脚注规范见 [doc/blog-post-format-standard.md](doc/blog-post-format-standard.md)：解释性/补充性括号改写为脚注；脚注文本不加句号，让注文在视觉上区别于正文（只是排版选择，不是内容禁忌）；语气、节奏、对译、缩写、读音、规格等不宜作脚注的括号保留。

## 主题开发

`themes/ayeria/` 是自研主题 hexo-theme-ayeria 的工作副本，需要修改主题外观或功能时**直接修改 `themes/ayeria/` 下的代码**。`_config.ayeria.yml` 仅用于配置项覆盖（颜色、菜单、插件开关等），不能替代代码层面的改动。

主题的独立仓库位于 `../hexo-theme-ayeria`，两处保持同步。发布新版主题时在那边打 npm 包。

设计语言规范见 [.agents/skills/ayeria-aesthetic/SKILL.md](.agents/skills/ayeria-aesthetic/SKILL.md)（双层美学体系、配色、组件、交互行为等硬约束）。涉及博客前端视觉或交互的任务时，必须以该文档为基准。

