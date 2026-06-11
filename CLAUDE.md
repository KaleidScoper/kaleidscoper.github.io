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

## 主题和网站开发

`themes/ayeria/` 是自研主题 hexo-theme-ayeria 的工作副本，需要修改主题外观或功能时**直接修改 `themes/ayeria/` 下的代码**。`_config.ayeria.yml` 仅用于配置项覆盖（菜单、插件开关、布局尺寸等），不能替代代码层面的改动。

主题的独立仓库位于 `../hexo-theme-ayeria`，两处保持同步。发布新版主题时在那边打 npm 包。

设计语言规范见 `.claude/skills/ayeria-aesthetic/SKILL.md`（双层美学体系、配色、组件、交互行为等硬约束）。涉及博客前端视觉或交互的任务时，必须以该文档为基准。

工程思维规范见 `.claude/skills/engineering-mindset/SKILL.md`。涉及任何非平凡实现任务时，启用 `/engineering-mindset` 以注入 Google 级 code review 标准、意图推断和"知道不做什么"的判断力。

在用户未主动要求的情况下，不进行任何修改 Git 树的操作，比如 commit 或 push。

## 回答质量约束

回答的开头给出一个时间戳，格式为：[YYYY.MM.DD-HH:MM]（24h制，上海），如[2026.03.14-15:22]

### 事实与推论的分隔

回答中，凡是**不能直接从项目现有代码、配置、文档或用户明确陈述的事实中推导出**的内容，均视为推论。

- 推论性内容在输出时须显式标注（例如："推测"、"根据通常实践"、"需确认"）。
- 若推论涉及可联网核实的事项（版本兼容性、库的行为、外部服务规范等），**在回答前主动通过网络搜索核实，而非直接输出未经验证的推断**。

### 工具调用失败时的降级行为

任何涉及信息获取的工具调用失败（包括但不限于：网络搜索不可用、`cat`/`read` 等文件读取失败、外部 API 无响应），**不得静默忽视，不得以推测内容冒充已核实结论**。

须在相关内容前明确声明，例如：

> "网络搜索不可用，以下内容来自推测，建议自行核实。"
> "文件读取失败，无法获取实际配置，以下基于常见实践推断。"

降级本身可以接受，静默降级不可接受。

### 信源选择（依任务性质判断，非固定规则）

**优先信源：** 官方文档、权威机构发布、学术期刊、官方统计数据、企业财报、权威媒体报道。

**谨慎对待：** 个人博客、社交媒体内容——可作为线索，不作为事实依据。

**关于 Issue 的特殊处理：**
- Issue 可作为 **bug 存在性与实际表现** 的有效证据；
- Issue 中对**原理的推测**和**潜在解决方案**不具备可信度，须另行验证。

**上下文决定信源：** 网络梗、社区用法、行业八卦等本身就产生于非正式渠道，此时非正式信源是合理的第一手来源。
