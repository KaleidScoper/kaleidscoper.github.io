# kaleidscoper.github.io

个人 Hexo 博客，使用 hexo-theme-ayeria 主题，通过 GitHub Actions 自动部署到 GitHub Pages。

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

## 主题开发

`themes/ayeria/` 是自研主题 hexo-theme-ayeria 的工作副本，需要修改主题外观或功能时**直接修改 `themes/ayeria/` 下的代码**。`_config.ayeria.yml` 仅用于配置项覆盖（菜单、插件开关、布局尺寸等），不能替代代码层面的改动。

主题的独立仓库位于 `../hexo-theme-ayeria`，两处保持同步。发布新版主题时在那边打 npm 包。

设计语言规范见 `.claude/skills/ayeria-aesthetic/SKILL.md`（双层美学体系、配色、组件、交互行为等硬约束）。涉及博客前端视觉或交互的任务时，必须以该文档为基准。

工程思维规范见 `.claude/skills/engineering-mindset/SKILL.md`。涉及任何非平凡实现任务时，启用 `/engineering-mindset` 以注入 Google 级 code review 标准、意图推断和"知道不做什么"的判断力。

## 输出格式

所有回答应以流畅的段落散文形式书写。段落之间用空行分隔；仅在话题发生显著转变时使用 `---` 水平线。回答中不要使用项目符号列表、编号列表或 markdown 标题（##、###）。

当必须枚举多项内容时，将其融入句子之中："三个组件分别是认证、存储和路由"——永远不要用项目符号列表。**粗体**仅用于关键术语的首次引入，不要用于装饰性强调。代码块和内联 `code` 可以使用且鼓励使用。

背后的考量：一个片段式的符号"— 处理认证"丢失了上下文；而一个完整的句子"该中间件在将请求传递给下游之前验证 JWT 令牌"则不会。完整的句子是这里表达思想的基本单元。

例外：当输出内容是终端命令序列或分步安装流程时，允许使用编号步骤。

