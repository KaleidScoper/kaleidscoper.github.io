---
title: Hexo + GitHub Page 建站教程
date: 2025-10-02 20:00:00
categories: [开发,Web开发]
tags: [教程,Hexo]
---

<b>前言：</b>Hexo是一个快速、简洁且高效的博客框架，基于Node.js开发。它可以将Markdown文档转换为静态网站，非常适合技术博客和个人网站。结合GitHub Pages的免费托管服务，可以零成本搭建一个专业的个人博客。本教程将带你从零开始搭建一个Hexo博客并部署到GitHub Pages。

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
用于版本控制和部署到GitHub。访问[Git官网](https://git-scm.com/)下载安装。

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

项目结构如下：
```
my-blog/
├── _config.yml    # 站点配置文件
├── package.json   # 项目依赖
├── scaffolds/     # 模板文件夹
├── source/        # 资源文件夹
│   └── _posts/    # 文章文件夹
└── themes/        # 主题文件夹
```

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

```bash
git clone https://github.com/Shen-Yu/hexo-theme-ayer.git themes/ayer
```

在`_config.yml`中启用主题：
```yaml
theme: ayer
```

## 六、创建文章

使用命令创建新文章：
```bash
hexo new "文章标题"
```

文章会生成在`source/_posts/`目录下，使用Markdown格式编写。

## 七、本地预览

启动本地服务器：
```bash
hexo server
```

访问`http://localhost:4000`查看效果。

## 八、部署到GitHub Pages

### <b>创建GitHub仓库</b>
在GitHub上创建一个名为`你的用户名.github.io`的仓库。

### <b>安装部署插件</b>
```bash
npm install hexo-deployer-git --save
```

### <b>配置部署</b>
在`_config.yml`中添加：
```yaml
deploy:
  type: git
  repo: https://github.com/你的用户名/你的用户名.github.io.git
  branch: main
```

### <b>部署</b>
```bash
hexo clean
hexo generate
hexo deploy
```

## 九、常用命令

```bash
# 创建新文章
hexo new "文章标题"

# 创建新页面
hexo new page "页面名称"

# 生成静态文件
hexo generate
# 或简写
hexo g

# 启动本地服务器
hexo server
# 或简写
hexo s

# 部署到远程仓库
hexo deploy
# 或简写
hexo d

# 清理缓存和生成的文件
hexo clean
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