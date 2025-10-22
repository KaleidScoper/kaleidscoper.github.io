---
title: Hexo + GitHub Page 建站教程
date: 2025-10-02 20:00:00
categories: [技术, 开发, Web开发]
tags: [教程,Hexo]
---

<b>前言：</b>Hexo是一个快速、简洁且高效的静态站点生成器，基于Node.js开发。与WordPress这种开箱即用的动态网站框架不同，Hexo是将Markdown文档转换为静态网站，极其轻量化，非常适合技术博客和个人网站。结合GitHub Pages的免费托管服务，可以零成本搭建一个很唬人的个人博客。本教程将带你从零开始搭建一个Hexo博客并部署到GitHub Pages。

<!--more-->

## 一、环境准备

在开始之前，需要安装以下软件：

### <b>Node.js</b>
Hexo基于Node.js开发，首先需要安装Node.js。访问[Node.js官网](https://nodejs.org/)下载LTS版本。

安装完成后，在命令行验证：
```bash
node --version
npm --version
```

### <b>Git</b>
用于版本控制和部署到GitHub。访问[Git官网](https://git-scm.com/)下载安装。各种流行IDE的内置图形化Git工具，一般也需要你先自行安装Git。

安装完成后配置用户信息：
```bash
git config --global user.name "你的用户名"
git config --global user.email "你的邮箱"
```

## 二、安装Hexo

使用npm全局安装Hexo：
```bash
npm install -g hexo-cli
```

验证安装：
```bash
hexo version
```

## 三、创建博客项目

在合适的位置创建博客目录：
```bash
hexo init my-blog
cd my-blog
npm install
```

项目结构大致如下：
```
my-blog/
├── _config.yml    # 站点配置文件
├── package.json   # 项目依赖
├── scaffolds/     # 模板文件夹
├── source/        # 资源文件夹
│   └── _posts/    # 文章文件夹
│   └── test/      # test页面文件夹
│       └── index.md
└── themes/        # 主题文件夹
```

### <b>项目结构详解</b>

**根目录文件：**
- `_config.yml`：站点主配置文件，控制网站的基本信息、URL、插件等
- `package.json`：Node.js项目配置文件，记录依赖包和脚本命令
- `package-lock.json`：锁定依赖版本，确保环境一致性

**scaffolds/ 目录：**
- 存放文章模板文件
- `post.md`：新文章的默认模板
- `page.md`：新页面的默认模板
- `draft.md`：草稿文章的模板

**source/ 目录：**
- 存放网站的源文件，除了`_posts/`外的文件会直接复制到网站根目录
- `_posts/`：存放所有文章（Markdown格式）
- `images/`：存放图片资源
- `css/`：存放自定义样式文件
- `js/`：存放自定义JavaScript文件
- 其他`.md`文件：会生成对应的页面

**themes/ 目录：**
- 存放主题文件
- 每个主题都有自己的配置文件和模板
- 主题修改后需要重新生成网站

**public/ 目录（生成后出现）：**
- 存放构建后的静态文件
- 这个目录会被部署到GitHub Pages
- 不要手动修改，每次`hexo generate`会重新生成

## 四、配置站点

编辑`_config.yml`文件，修改基本信息：
```yaml
# Site
title: 我的博客
subtitle: 一个技术博客
description: 分享技术心得
author: 你的名字
language: zh-CN
timezone: Asia/Shanghai

# URL
url: https://你的用户名.github.io
root: /
permalink: :year/:month/:day/:title/
```

## 五、选择主题

Hexo有丰富的主题选择，这里以Ayer主题为例：

### <b>安装主题</b>
```bash
git clone https://github.com/Shen-Yu/hexo-theme-ayer.git themes/ayer
```

### <b>启用主题</b>
在`_config.yml`中启用主题：
```yaml
theme: ayer
```

### <b>主题配置</b>
大多数主题都有自己的配置文件，通常位于`themes/主题名/_config.yml`。你可以：
1. 复制主题配置文件到根目录：`cp themes/ayer/_config.yml _config.ayer.yml`
2. 在根目录的`_config.ayer.yml`中修改主题设置
3. 这样修改不会在主题更新时丢失

### <b>主题修改后的操作</b>

主题修改分为两种情况，操作流程不同：

#### <b>情况一：仅修改主题配置文件</b>

如果只修改了主题配置文件（如`_config.ayer.yml`或`themes/ayer/_config.yml`），操作如下：

```bash
hexo clean    # 清理缓存
hexo generate # 重新生成
hexo server   # 本地预览效果
```

#### <b>情况二：修改主题源文件</b>

如果修改了主题的源文件（如CSS、JavaScript、模板文件等），需要**先构建主题**，然后再构建网站。

**为什么需要先构建主题？**

现代Hexo主题通常使用预处理器和构建工具：
- **CSS预处理器**：Stylus、SCSS、Less等
- **JavaScript打包**：Webpack、Rollup等
- **代码优化**：压缩、合并、Tree-shaking等

以Ayer主题为例，它的目录结构包括：
```
themes/ayer/
├── source-src/       # 主题源码（你修改的地方）
│   ├── css/          # Stylus源文件
│   │   ├── _partial/
│   │   │   └── categories.styl  # 例如修改这个文件
│   │   └── style.styl
│   └── js/           # JavaScript源文件
│       └── ayer.js
├── source/           # 编译后的文件（Hexo实际使用的）
│   └── dist/
│       ├── main.css  # 编译后的CSS
│       └── main.js   # 打包后的JS
└── package.json      # 主题构建脚本
```

**关键理解**：Hexo在生成网站时，使用的是`source/dist/`中的编译后文件，而不是`source-src/`中的源文件。因此，修改源文件后必须先编译。

**完整操作流程：**

```bash
# 步骤1：进入主题目录
cd themes/ayer

# 步骤2：安装主题依赖（首次修改时需要）
npm install

# 步骤3：构建主题（将source-src/编译到source/dist/）
npm run build

# 步骤4：返回站点根目录
cd ../..

# 步骤5：清理Hexo缓存
hexo clean

# 步骤6：重新生成网站
hexo generate

# 步骤7：本地预览
hexo server
```

**简化命令（在站点根目录执行）：**

```bash
# Windows PowerShell
cd themes/ayer; npm run build; cd ../..; hexo clean; hexo generate; hexo server

# Linux/Mac
cd themes/ayer && npm run build && cd ../.. && hexo clean && hexo generate && hexo server
```

#### <b>常见主题文件修改场景</b>

| 修改内容 | 是否需要构建主题 | 示例 |
|---------|----------------|------|
| 主题配置文件 | ❌ 不需要 | `_config.ayer.yml` |
| 模板文件（EJS等） | ❌ 不需要 | `layout/_partial/footer.ejs` |
| 预处理CSS（Stylus/SCSS） | ✅ 需要 | `source-src/css/_partial/categories.styl` |
| 源码JavaScript | ✅ 需要 | `source-src/js/ayer.js` |
| 已编译的CSS | ⚠️ 不推荐直接修改 | `source/dist/main.css` |
| 已编译的JS | ⚠️ 不推荐直接修改 | `source/dist/main.js` |

**注意**：直接修改`source/dist/`中的编译后文件会在下次构建时被覆盖，应该修改`source-src/`中的源文件。

#### <b>开发模式：实时监听修改</b>

如果需要频繁修改主题样式，可以使用开发模式：

**终端1（主题开发服务器）：**
```bash
cd themes/ayer
npm run dev  # 监听source-src/变化，自动构建到source/dist/
```

**终端2（Hexo服务器）：**
```bash
hexo server  # 启动网站预览
```

这样修改`source-src/`中的文件后：
1. Rollup自动重新构建到`source/dist/`
2. 刷新浏览器即可看到效果（某些修改可能需要重启Hexo服务器）

#### <b>主题构建工具对照表</b>

不同主题使用不同的构建工具，常见命令：

| 主题 | 构建工具 | 构建命令 |
|------|---------|---------|
| Ayer | Rollup | `npm run build` |
| Butterfly | Gulp | `npm run build` |
| Next | 无需构建 | 直接修改即可 |
| Fluid | Webpack | `npm run build` |

**如何判断主题是否需要构建？**

1. 查看主题目录是否有`package.json`文件
2. 检查是否有`source-src/`、`src/`等源码目录
3. 查看`package.json`中是否有`build`脚本

如果以上都没有，说明主题不需要构建，直接修改后运行`hexo clean && hexo generate`即可。

#### <b>主题修改调试技巧</b>

1. **使用浏览器开发者工具**：
   - 按F12打开开发者工具
   - 在Elements面板中实时修改CSS样式
   - 找到满意的样式后，再修改源文件

2. **查看构建日志**：
   ```bash
   npm run build --verbose  # 查看详细构建信息
   ```

3. **清理缓存**：
   如果修改未生效，尝试清理所有缓存：
   ```bash
   hexo clean              # 清理Hexo缓存
   rm -rf themes/ayer/node_modules/.cache  # 清理主题构建缓存（如果存在）
   ```

4. **强制刷新浏览器**：
   - Windows/Linux：`Ctrl + F5`
   - Mac：`Cmd + Shift + R`

#### <b>主题修改最佳实践</b>

1. **版本控制**：
   - 使用Git跟踪主题修改
   - 修改前创建分支：`git checkout -b theme-custom`

2. **备份原文件**：
   ```bash
   cp source-src/css/_partial/categories.styl source-src/css/_partial/categories.styl.bak
   ```

3. **文档记录**：
   在项目中创建`THEME_MODIFICATIONS.md`记录修改内容

4. **避免直接修改主题**：
   如果可能，通过主题配置或自定义CSS实现，避免修改主题核心文件

5. **主题更新策略**：
   - 不要直接在主题目录使用`git pull`更新
   - 先备份你的修改，更新后再手动合并

### <b>常用主题推荐</b>
- **Ayer**：简洁现代，支持数学公式
- **Next**：功能丰富，文档完善
- **Butterfly**：美观实用，动画效果丰富
- **Fluid**：响应式设计，适合移动端

### 主题工作原理详解

很多人对主题的作用有误解，以为主题只是为网站添加一些额外功能或美化样式。实际上，**主题是Hexo构建过程中的核心组成部分**，它深度参与整个网站生成流程，决定了网站的呈现方式。

#### <b>主题在构建过程中的作用</b>

Hexo的构建过程可以简化为：**源文件（Markdown等） → 渲染引擎处理 → 主题模板渲染 → 最终HTML**

主题并不是在网站生成后才"装饰"网站，而是在构建阶段就**全程干预网站的生成**：

1. **模板渲染阶段**：主题提供模板文件（如EJS、Pug等），Hexo会将处理后的数据注入这些模板，生成最终的HTML
2. **样式和脚本注入**：主题决定了CSS和JavaScript的加载方式和内容
3. **页面布局控制**：主题决定了首页、文章页、标签页等各类页面的结构和布局
4. **功能实现**：主题可以实现评论系统、搜索功能、目录生成等各种功能

**关键理解**：主题不是可有可无的"皮肤"，而是**必需的构建组件**。没有主题，Hexo无法生成完整的网站。

#### <b>主题的目录结构</b>

一个典型的主题目录结构如下：

```
themes/主题名/
├── _config.yml           # 主题配置文件
├── languages/            # 多语言支持
│   ├── zh-CN.yml
│   └── en.yml
├── layout/               # 模板文件（核心）
│   ├── _partial/         # 模板片段
│   │   ├── head.ejs      # HTML头部
│   │   ├── header.ejs    # 页面头部
│   │   ├── footer.ejs    # 页面底部
│   │   ├── sidebar.ejs   # 侧边栏
│   │   └── comments.ejs  # 评论区
│   ├── index.ejs         # 首页模板
│   ├── post.ejs          # 文章页模板
│   ├── page.ejs          # 独立页面模板
│   ├── archive.ejs       # 归档页模板
│   ├── category.ejs      # 分类页模板
│   └── tag.ejs           # 标签页模板
├── source/               # 静态资源
│   ├── css/              # 样式文件
│   ├── js/               # JavaScript文件
│   └── images/           # 图片资源
└── scripts/              # 扩展脚本（可选）
    └── custom.js         # 自定义功能
```

#### <b>主题如何控制网站生成</b>

**1. 模板系统（最核心）**

主题通过模板文件控制HTML的生成。以文章页为例，`layout/post.ejs`可能是这样的：

```ejs
<!DOCTYPE html>
<html>
<head>
  <%- partial('_partial/head') %>
</head>
<body>
  <%- partial('_partial/header') %>
  
  <article class="post">
    <h1><%= page.title %></h1>
    <div class="post-meta">
      <time><%= date(page.date, 'YYYY-MM-DD') %></time>
    </div>
    <div class="post-content">
      <%- page.content %>
    </div>
  </article>
  
  <%- partial('_partial/comments') %>
  <%- partial('_partial/footer') %>
</body>
</html>
```

当你执行`hexo generate`时：
- Hexo读取`source/_posts/`中的Markdown文件
- Markdown渲染器将Markdown转换为HTML片段
- Hexo将数据（标题、日期、内容等）传递给主题的`post.ejs`模板
- 模板引擎处理`<%=`和`<%-`标记，生成最终的HTML
- 生成的HTML保存到`public/`目录

**如果没有主题**，Hexo就缺少了模板，无法生成完整的HTML页面。

**2. 样式和布局**

主题的CSS文件完全控制网站的视觉呈现：

- **页面布局**：单栏、双栏、三栏布局
- **颜色方案**：背景色、文字颜色、链接颜色
- **响应式设计**：移动端适配
- **动画效果**：过渡、悬停效果

同一个Markdown文件，使用不同主题生成的网站可能完全不同。

**3. 功能集成**

主题可以集成各种功能：

- **评论系统**：通过在模板中插入第三方评论代码（Gitalk、Valine等）
- **搜索功能**：生成搜索索引，提供搜索界面
- **数学公式**：加载KaTeX或MathJax库
- **代码高亮**：集成Prism或Highlight.js
- **目录生成**：自动生成文章目录（TOC）
- **阅读统计**：集成访问量统计代码

这些功能**不是Hexo核心提供的**，而是主题开发者在主题中实现的。

**4. 数据处理和过滤**

主题可以通过`scripts/`目录中的JavaScript文件扩展Hexo功能：

```javascript
// themes/主题名/scripts/custom.js
hexo.extend.helper.register('excerpt', function(post, length) {
  // 自定义摘要生成逻辑
  return post.content.substring(0, length) + '...';
});
```

这些脚本在构建过程中运行，可以：
- 修改页面数据
- 添加自定义标签
- 处理文件
- 生成额外内容

#### <b>主题配置与站点配置的关系</b>

Hexo有两个配置文件系统：

| 配置文件 | 作用范围 | 典型内容 |
|---------|---------|---------|
| **根目录`_config.yml`** | 站点全局配置 | 网站标题、URL、部署设置、渲染器配置 |
| **`_config.主题名.yml`** | 主题配置 | 主题样式、功能开关、菜单设置、评论配置 |
| **`themes/主题名/_config.yml`** | 主题默认配置 | 主题的默认设置（不建议直接修改） |

**配置优先级**：根目录的`_config.主题名.yml` > 主题目录的`_config.yml`

建议将主题配置复制到根目录：
```bash
cp themes/ayer/_config.yml _config.ayer.yml
```

这样做的好处：
- 主题更新时不会覆盖你的配置
- 配置集中管理，便于版本控制
- 可以同时维护多个主题配置

#### <b>更换主题的影响</b>

**更换主题 = 重新定义网站的生成规则**，会导致：

1. **页面结构完全改变**：不同主题的HTML结构可能完全不同
2. **样式重置**：颜色、字体、布局全部改变
3. **功能变化**：某些功能可能消失或新增（取决于新主题是否支持）
4. **配置需要重新设置**：每个主题的配置选项不同
5. **兼容性问题**：某些插件可能与新主题不兼容

#### <b>主题开发进阶</b>

如果你想深度定制主题，需要了解：

**1. 模板引擎**
- EJS（类似HTML，易学）
- Pug（简洁语法，学习曲线稍高）
- Nunjucks（功能强大）

**2. Hexo变量和辅助函数**
```ejs
<%= config.title %>           <!-- 站点标题 -->
<%= page.title %>             <!-- 当前页面标题 -->
<%= date(page.date, 'YYYY-MM-DD') %>  <!-- 格式化日期 -->
<%- list_categories() %>      <!-- 生成分类列表 -->
```

**3. 主题继承**
可以基于现有主题进行修改：
```bash
# 复制主题
cp -r themes/ayer themes/my-theme

# 修改主题名
# 在_config.yml中设置
theme: my-theme
```

#### <b>主题性能优化</b>

主题会影响网站性能：

- **减少HTTP请求**：合并CSS和JS文件
- **代码压缩**：压缩CSS、JS、HTML
- **延迟加载**：图片懒加载、按需加载JS
- **CDN加速**：将静态资源托管到CDN
- **缓存策略**：设置合理的浏览器缓存

#### <b>总结：主题的本质</b>

> **主题不是网站的"外衣"，而是网站的"骨架和血肉"。**

- **骨架**：主题的模板文件定义了网站的结构
- **血肉**：主题的样式和脚本赋予网站生命和交互
- **灵魂**：你的Markdown内容填充到主题提供的框架中

**Hexo的工作流程**：
```
Markdown文件（内容）
    ↓
渲染器（转换为HTML片段）
    ↓
主题模板（组装成完整页面）
    ↓
静态HTML网站（public/目录）
```

如果把Hexo比作一个汽车工厂：
- **Markdown文件**是原材料
- **渲染器**是加工车间
- **主题**是组装生产线和最终设计
- **public/目录**是成品仓库

没有主题，整个生产线就无法运转！

## 六、创建文章

### <b>创建新文章</b>
使用命令创建新文章：
```bash
hexo new "文章标题"
```

文章会生成在`source/_posts/`目录下，文件名格式为`年-月-日-文章标题.md`。

### <b>文章头部信息（Front Matter）</b>
每篇文章开头都有YAML格式的配置信息：
```yaml
---
title: 文章标题
date: 2025-10-02 20:00:00
categories: [分类1, 分类2]
tags: [标签1, 标签2]
---
```

**常用字段说明：**
- `title`：文章标题
- `date`：发布日期
- `categories`：分类（支持多级分类）
- `tags`：标签（支持多个标签）
- `description`：文章描述
- `permalink`：自定义链接
- `comments`：是否启用评论
- `toc`：是否显示目录

### <b>文章内容编写</b>
使用Markdown语法编写文章内容，支持：
- 标题、段落、列表
- 代码块、引用
- 链接、图片
- 表格、数学公式
- HTML标签

### <b>文章管理</b>
- **草稿**：`hexo new draft "标题"` 创建草稿
- **发布草稿**：`hexo publish "标题"` 将草稿转为正式文章
- **删除文章**：直接删除`source/_posts/`中的文件
- **修改文章**：编辑对应的`.md`文件

## 七、本地预览

### <b>启动本地服务器</b>
```bash
hexo server
# 或简写
hexo s
```

访问`http://localhost:4000`查看效果。

### <b>预览选项</b>
```bash
# 指定端口
hexo server -p 5000

# 指定IP地址
hexo server -i 192.168.1.100

# 不打开浏览器
hexo server --no-open
```

### <b>预览时的注意事项</b>
- 修改文章后，浏览器会自动刷新
- 修改配置文件后，需要重启服务器
- 修改主题文件后，需要重启服务器
- 使用`Ctrl+C`停止服务器

### <b>生成静态文件</b>
```bash
hexo generate
# 或简写
hexo g
```

生成的文件在`public/`目录中，可以直接部署到任何静态网站托管服务。

## 八、部署到GitHub Pages

有两种主要的部署方式，推荐使用**方案一**（GitHub Actions自动化部署）：

### <b>方案一：GitHub Actions自动化部署（推荐）</b>

这种方案将整个项目推送到GitHub，通过GitHub Actions自动构建和部署，适合需要随时随地修改文章的场景。

#### <b>1. 创建GitHub仓库</b>
在GitHub上创建一个名为`你的用户名.github.io`的仓库。

#### <b>2. 推送整个项目到GitHub</b>
```bash
# 初始化Git仓库（如果还没有）
git init

# 添加远程仓库
git remote add origin https://github.com/你的用户名/你的用户名.github.io.git

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit"

# 推送到main分支
git push -u origin main
```

#### <b>3. 配置GitHub Actions</b>
在项目根目录创建`.github/workflows/pages.yml`文件：

```yaml
name: Pages

on:
  push:
    branches:
      - main # default branch

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          submodules: recursive
      - name: Use Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
      - name: Cache NPM dependencies
        uses: actions/cache@v4
        with:
          path: node_modules
          key: ${{ runner.OS }}-npm-cache
          restore-keys: |
            ${{ runner.OS }}-npm-cache
      - name: Install Dependencies
        run: npm install
      - name: Build
        run: npm run build
      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./public
  deploy:
    needs: build
    permissions:
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

#### <b>4. 配置package.json构建脚本</b>
确保`package.json`中有构建脚本：
```json
{
  "scripts": {
    "build": "hexo generate",
    "clean": "hexo clean",
    "deploy": "hexo deploy",
    "server": "hexo server"
  }
}
```

#### <b>5. 启用GitHub Pages</b>
1. 进入GitHub仓库的Settings页面
2. 找到Pages设置
3. 选择Source为"GitHub Actions"
4. 保存设置

#### <b>6. 日常使用</b>
以后只需要：
```bash
# 修改文章后
git add .
git commit -m "更新文章"
git push origin main
```

GitHub Actions会自动构建和部署，几分钟后网站就会更新。

### <b>方案二：仅部署构建产物（传统方式）</b>

这种方案只将构建后的静态文件推送到GitHub，适合不需要频繁修改的场景。

#### <b>1. 创建GitHub仓库</b>
在GitHub上创建一个名为`你的用户名.github.io`的仓库。

#### <b>2. 安装部署插件</b>
```bash
npm install hexo-deployer-git --save
```

#### <b>3. 配置部署</b>
在`_config.yml`中添加：
```yaml
deploy:
  type: git
  repo: https://github.com/你的用户名/你的用户名.github.io.git
  branch: main
```

#### <b>4. 部署</b>
```bash
hexo clean
hexo generate
hexo deploy
```

### <b>两种方案对比</b>

| 特性 | GitHub Actions方案 | 传统方案 |
|------|-------------------|----------|
| **部署复杂度** | 一次配置，后续简单 | 每次需要手动执行命令 |
| **版本控制** | 完整项目历史 | 只有构建产物 |
| **多设备协作** | 支持，可随时拉取修改 | 不支持，需要本地环境 |
| **自动化程度** | 完全自动化 | 需要手动操作 |
| **学习成本** | 稍高（需要了解GitHub Actions） | 较低 |
| **适用场景** | 需要随时随地修改文章 | 偶尔更新，固定环境使用 |

**推荐使用方案一**，特别是对于需要随时随地修改文章的用户。

## 九、图片管理

### <b>添加图片</b>
1. 将图片文件放入`source/images/`目录
2. 在文章中使用相对路径引用：
```markdown
![图片描述](../images/图片名.jpg)
```

### <b>图片优化建议</b>
- 使用WebP格式减少文件大小
- 压缩图片提高加载速度
- 为图片添加alt属性提高可访问性
- 考虑使用CDN加速图片加载

### <b>图片引用方式</b>
```markdown
<!-- 相对路径 -->
![图片](../images/example.jpg)

<!-- 绝对路径 -->
![图片](/images/example.jpg)

<!-- 带链接的图片 -->
[![图片](../images/example.jpg)](https://example.com)

<!-- HTML标签（更多控制） -->
<img src="../images/example.jpg" alt="图片描述" width="300" height="200">
```

## 十、创建页面

### <b>创建新页面</b>
```bash
hexo new page "页面名称"
```

页面会生成在`source/页面名称/index.md`。

### <b>常用页面类型</b>
- **关于页面**：`hexo new page "about"`
- **友链页面**：`hexo new page "friends"`
- **标签页面**：`hexo new page "tags"`
- **分类页面**：`hexo new page "categories"`
- **归档页面**：`hexo new page "archives"`

### <b>页面配置</b>
在页面文件中添加配置：
```yaml
---
title: 关于我
date: 2025-10-02 20:00:00
type: "about"
layout: "about"
---
```

### <b>添加导航菜单</b>
在主题配置文件中添加菜单项：
```yaml
menu:
  首页: /
  归档: /archives/
  分类: /categories/
  标签: /tags/
  关于: /about/
  友链: /friends/
```

## 十一、插件和功能扩展

### <b>常用插件</b>
```bash
# 搜索功能
npm install hexo-generator-search --save

# 站点地图
npm install hexo-generator-sitemap --save

# RSS订阅
npm install hexo-generator-feed --save

# 字数统计
npm install hexo-wordcount --save

# 代码高亮
npm install hexo-prism-plugin --save
```

### <b>插件配置</b>
在`_config.yml`中添加插件配置：
```yaml
# 搜索
search:
  path: search.xml
  field: post
  content: true

# 站点地图
sitemap:
  path: sitemap.xml

# RSS
feed:
  type: atom
  path: atom.xml
  limit: 20
```

### <b>自定义功能</b>
- 在`source/js/`中添加自定义JavaScript
- 在`source/css/`中添加自定义样式
- 修改主题模板文件（需要了解EJS语法）

## 十二、常用命令

### <b>文章和页面管理</b>
```bash
# 创建新文章
hexo new "文章标题"

# 创建新页面
hexo new page "页面名称"

# 创建草稿
hexo new draft "草稿标题"

# 发布草稿
hexo publish "草稿标题"

# 列出所有文章
hexo list post

# 列出所有页面
hexo list page

# 列出所有草稿
hexo list draft
```

### <b>构建和预览</b>
```bash
# 生成静态文件
hexo generate
# 或简写
hexo g

# 启动本地服务器
hexo server
# 或简写
hexo s

# 清理缓存和生成的文件
hexo clean

# 清理并重新生成
hexo clean && hexo generate

# 生成并启动服务器
hexo generate --watch
```

### <b>部署相关</b>
```bash
# 部署到远程仓库
hexo deploy
# 或简写
hexo d

# 生成并部署
hexo generate --deploy
# 或简写
hexo g -d

# 清理、生成并部署
hexo clean && hexo generate --deploy
```

### <b>调试和帮助</b>
```bash
# 显示帮助信息
hexo help

# 显示版本信息
hexo version

# 显示配置信息
hexo config

# 显示调试信息
hexo --debug
```

### <b>常用组合命令</b>
```bash
# 开发环境：清理、生成、启动服务器
hexo clean && hexo generate && hexo server

# 生产环境：清理、生成、部署
hexo clean && hexo generate && hexo deploy

# 快速预览：生成并启动服务器
hexo g && hexo s
```

## 十、更换Markdown渲染器

Hexo支持多种Markdown渲染器，不同的渲染器有不同的功能和特性。以下是常用渲染器对比：

| 渲染器 | 特点 | 适用场景 |
|--------|------|----------|
| `hexo-renderer-marked` | 默认渲染器，轻量快速 | 一般博客写作 |
| `hexo-renderer-markdown-it` | 功能丰富，插件支持多 | 需要扩展功能 |
| `hexo-renderer-markdown-it-katex` | 支持数学公式渲染 | 学术写作、技术文档 |
| `hexo-renderer-kramed` | 基于marked的增强版 | 兼容性要求高 |

### <b>更换到KaTeX渲染器（支持数学公式）</b>

如果你需要在博客中写数学公式，可以更换到支持KaTeX的渲染器：

**步骤1：卸载默认渲染器**
```bash
npm uninstall hexo-renderer-marked --save
```

**步骤2：安装KaTeX渲染器**
```bash
npm install hexo-renderer-markdown-it-katex --save
```

**步骤3：配置渲染器**
在`_config.yml`中添加：
```yaml
# Markdown-it configuration
markdown_it:
  render:
    html: true
    xhtmlOut: false
    breaks: true
    linkify: true
    typographer: true
    quotes: '""'''
  plugins:
    - markdown-it-abbr
    - markdown-it-cjk-breaks
    - markdown-it-container
    - markdown-it-deflist
    - markdown-it-emoji
    - markdown-it-footnote
    - markdown-it-ins
    - markdown-it-mark
    - markdown-it-sub
    - markdown-it-sup
```

**步骤4：配置KaTeX支持**
在主题配置文件中启用KaTeX：
```yaml
katex:
  enable: true
  allpost: true
  copy_tex: false
```

**步骤5：清理并重新生成**
```bash
hexo clean
hexo generate
```

### <b>换回默认渲染器</b>

如果不需要数学公式支持，可以换回默认渲染器：

```bash
npm uninstall hexo-renderer-markdown-it-katex --save
npm install hexo-renderer-marked --save
```

然后从`_config.yml`中删除或注释掉`markdown_it`配置，在主题配置中禁用KaTeX：
```yaml
katex:
  enable: false
  allpost: false
  copy_tex: false
```

### <b>验证渲染器更换</b>

检查当前渲染器：
```bash
npm list | grep renderer
```

测试数学公式（如果使用KaTeX渲染器）：
```markdown
$$E = mc^2$$
```

## 十一、Q&A

<b>Q：</b>如何更换主题？

<b>A：</b>下载主题到themes文件夹，在`_config.yml`中修改`theme`字段，然后执行`hexo clean && hexo generate`重新生成。

<b>Q：</b>如何添加评论系统？

<b>A：</b>可以使用Gitalk、Valine等评论系统，在主题配置文件中添加相关配置即可。

<b>Q：</b>如何自定义域名？

<b>A：</b>在仓库根目录创建`CNAME`文件，写入你的域名，然后在域名服务商处添加CNAME记录指向`你的用户名.github.io`。

<b>Q：</b>文章如何分类和标签？

<b>A：</b>在文章头部添加：
```yaml
---
title: 文章标题
date: 2025-10-02 20:00:00
categories: [分类1, 分类2]
tags: [标签1, 标签2]
---
```

<b>Q：</b>数学公式不显示怎么办？

<b>A：</b>确保已安装KaTeX渲染器，检查主题配置中KaTeX是否启用，确认数学公式使用正确的分隔符（`$$`或`$`）。

<b>Q：</b>渲染器更换后出现问题？

<b>A：</b>确保只安装一个Markdown渲染器，检查`package.json`中的依赖项，尝试清理缓存：`hexo clean`。

<b>Q：</b>GitHub Actions部署失败怎么办？

<b>A：</b>检查GitHub Actions日志，常见问题包括：Node.js版本不兼容、依赖安装失败、构建脚本错误。确保`.github/workflows/pages.yml`配置正确，`package.json`中有正确的构建脚本。

<b>Q：</b>如何从传统部署方式迁移到GitHub Actions？

<b>A：</b>1. 创建`.github/workflows/pages.yml`文件；2. 确保`package.json`有构建脚本；3. 在GitHub仓库设置中启用GitHub Actions作为Pages源；4. 删除`_config.yml`中的deploy配置；5. 推送代码触发自动部署。

<b>Q：</b>GitHub Actions方案需要本地安装Hexo吗？

<b>A：</b>不需要。GitHub Actions会在云端自动安装依赖并构建，你只需要推送Markdown文件即可。但建议本地安装用于预览和测试。

<b>Q：</b>如何添加图片到文章中？

<b>A：</b>1. 将图片放入`source/images/`目录；2. 在文章中使用`![描述](../images/图片名.jpg)`引用；3. 确保路径正确，建议使用相对路径。

<b>Q：</b>修改主题后网站没有变化怎么办？

<b>A：</b>这取决于你修改了什么：
1. **修改主题配置文件**：执行`hexo clean && hexo generate && hexo server`
2. **修改主题源文件**（如Stylus、SCSS等）：需要先构建主题。对于Ayer主题，执行：
   ```bash
   cd themes/ayer && npm run build && cd ../.. && hexo clean && hexo generate && hexo server
   ```
3. **仍然无效**：尝试强制刷新浏览器（Ctrl+F5）或清理主题构建缓存。详见"主题修改后的操作"章节。

<b>Q：</b>如何创建关于页面、友链页面等？

<b>A：</b>使用`hexo new page "页面名"`创建，然后在主题配置中添加菜单项。页面文件位于`source/页面名/index.md`。

<b>Q：</b>如何添加搜索功能？

<b>A：</b>安装搜索插件：`npm install hexo-generator-search --save`，然后在`_config.yml`中配置搜索选项。

<b>Q：</b>文章中的代码高亮不显示怎么办？

<b>A：</b>1. 确保代码块使用正确的语法：```语言名；2. 安装代码高亮插件；3. 检查主题是否支持代码高亮；4. 清理缓存重新生成。

<b>Q：</b>如何备份博客内容？

<b>A：</b>如果使用GitHub Actions方案，整个项目都在GitHub上，天然有版本控制。也可以定期导出`source/_posts/`目录备份文章。

<b>Q：</b>如何更换博客主题？

<b>A：</b>1. 下载新主题到`themes/`目录；2. 修改`_config.yml`中的`theme`字段；3. 配置新主题的配置文件；4. 执行`hexo clean && hexo generate`。

<b>Q：</b>本地预览正常但部署后有问题怎么办？

<b>A：</b>1. 检查GitHub Actions日志；2. 确保所有依赖都正确安装；3. 检查文件路径是否正确；4. 清理缓存重新部署。

<b>Q：</b>如何添加评论系统？

<b>A：</b>根据主题选择评论系统（如Gitalk、Valine、Disqus等），在主题配置文件中添加相关配置。大多数主题都支持多种评论系统。