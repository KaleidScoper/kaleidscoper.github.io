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

`themes/ayeria/` 是自研主题 hexo-theme-ayeria 的工作副本，需要修改主题外观或功能时**直接修改 `themes/ayeria/` 下的代码**。`_config.ayeria.yml` 仅用于配置项覆盖（颜色、菜单、插件开关等），不能替代代码层面的改动。

主题的独立仓库位于 `../hexo-theme-ayeria`，两处保持同步。发布新版主题时在那边打 npm 包。

