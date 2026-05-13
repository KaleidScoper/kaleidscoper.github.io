# hexo-theme-ayeria

一个干净且优雅的 Hexo 博客主题，基于 [Ayer](https://github.com/Shen-Yu/hexo-theme-ayer) 深度定制。

Ayeria —— 源自 Ayer（马来语"水"、西班牙语"昨日"），独立维护的衍生主题。原作者：[Eric-Shen](https://github.com/Shen-Yu)。

## 功能特性

- 全屏封面 + typed.js 打字动效
- 深色模式一键切换
- 本地搜索（XML 索引 + 前端全文检索）
- 四种评论系统（Valine / Gitalk / Twikoo / Giscus）
- 数学公式（MathJax / KaTeX）+ Mermaid 流程图
- 打赏功能（数据驱动，支持多渠道、子渠道、品牌色、图标）
- 文章 TOC 目录、字数统计、代码复制、图片放大、版权声明
- 随机句子（本地 txt 文件或内置句子库，防重复队列）
- 告示板（自定义文字 / 一言 API）
- 访问量统计（不蒜子 / 友盟 CNZZ / Google Analytics / 百度统计）
- 网易云音乐嵌入
- 鼠标特效（自定义光标、点击爱心/爆炸/粒子）
- Canvas 动态背景
- 加密锁屏（SweetAlert2）
- 广告位、ICP/公安备案信息
- 14 种语言支持
- 自定义 CSS（`source/css/custom.styl`）
- Rollup 构建流水线

## 安装

### 方式一：npm（Hexo >= 5.0）

```bash
npm i hexo-theme-ayeria -S
```

### 方式二：Git

```bash
git clone https://github.com/KaleidScoper/hexo-theme-ayeria.git themes/ayeria
```

在站点根目录的 `_config.yml` 中启用主题：

```yml
theme: ayeria
```

## 配置

主题自带默认配置文件 `themes/ayeria/_config.yml`。你**不应直接修改**这个文件，而是在站点根目录创建 `_config.ayeria.yml`，只填写需要覆盖的选项。Hexo 5+ 会自动将其与主题默认配置合并。

下文列出所有可配置项。

### 侧边栏菜单

```yml
menu:
  主页: /
  全部文章: /archives
  文章分类: /categories
  全部标签: /tags
  友情链接: /friends
  关于本站: /about
```

添加的页面需要先用 `hexo new page <name>` 创建（详见下方[页面创建](#页面创建)）。

### 封面

全屏背景图封面，可选叠加 Logo。主题内附一张示例封面图 `source/images/cover2.webp`。

```yml
cover:
  enable: true
  path: /images/cover.jpg    # 背景图路径（放在主题或站点的 source/images/ 下）
  logo: false                # 封面 Logo 图片路径，不需要设为 false
```

### 打字动效

封面上基于 [typed.js](https://github.com/mattboldt/typed.js) 的文字滚动效果。

```yml
subtitle:
  enable: true
  text: 第一行文字
  text2: 第二行文字          # 可留空
  text3: 第三行文字          # 最多三行
  startDelay: 1000
  typeSpeed: 200
  loop: true
  backSpeed: 100
  showCursor: true
```

### 网站图标与 Logo

```yml
favicon: /favicon.svg        # 浏览器标签页图标
logo: /favicon.svg           # 侧边栏顶部 Logo
```

请将你自己的 favicon 放到站点 `source/` 或主题 `source/` 目录下。

### 进度条

页面顶部加载进度条（Pace.js CDN）。

```yml
progressBar: true
```

### 告示板

```yml
broadcast:
  enable: true
  type: 2                    # 1: 自定义文字；2: 一言 API (hitokoto.cn)
  text: 自定义告示内容        # type 为 1 时有效
```

### 随机句子

页脚展示随机句子，支持本地 txt 文件（`source/data/random-sentences.txt`）或内置句子库。具有防重复队列机制。

```yml
random_sentences:
  enable: true
  use_local_file: true       # true: 读取 source/data/random-sentences.txt；false: 内置句子库
  queue_size: 5              # 防重复队列大小，建议为句子总数的 1/4 ~ 1/3
```

本地 txt 文件格式：每行一句，`#` 开头为注释，双空格会转换为换行，空行自动忽略。

### 文章功能

```yml
excerpt_link: 显示更多...     # 截断按钮文字（在文章中插入 <!--more--> 标记截断位置）
excerpt_all: false            # true: 首页只显示文章归档，不展示正文

copy_btn: true                # 代码复制按钮
share_enable: true            # 文章分享按钮
share_china: true             # 使用国内社交平台
share_text: 分享

toc: true                     # 文章目录（单篇可通过 front-matter no_toc: true 关闭）
image_viewer: true            # 图片点击放大
```

### 分页文字

```yml
nav_text:
  page_prev: 上一页
  page_next: 下一页
  post_prev: 上一篇
  post_next: 下一篇
```

### 字数统计

需要安装插件：`npm i hexo-wordcount -S`

```yml
word_count:
  enable: true
  only_article_visit: true    # 只在文章详情页显示（不在首页显示）
```

单篇文章可通过 `no_word_count: true` 关闭。

### 打赏

```yml
reward_type: 1                # 0: 关闭；1: front-matter 中 reward:true 才显示；2: 所有文章
reward_wording: "如果这篇文章对你有帮助，可以请我喝杯茶"

reward:
  button_text: "赏杯茶"       # 留空则使用语言包默认值
  channels:
    - name: "支付宝"
      icon: "ri-alipay-line"         # RemixIcon 类名
      color: "#1677FF"               # 品牌主题色
      qrcode: "/images/reward/alipay.jpg"
      description: "支付宝扫一扫"

    - name: "微信支付"
      icon: "ri-wechat-pay-line"
      color: "#07C160"
      qrcode: "/images/reward/wechat.jpg"
      description: "微信扫一扫"

    - name: "USDT"                   # 支持子渠道
      icon: "ri-coin-line"
      color: "#50AF95"
      description: "选择网络后扫码转账"
      children:
        - name: "TRC-20"
          badge: "推荐"
          qrcode: "/images/reward/USDT-TRC20.webp"
          description: "Tron 链 · 手续费最低"
        - name: "ERC-20"
          qrcode: "/images/reward/USDT-ERC20.webp"
          description: "以太坊主网"
```

二维码图片建议放在站点 `source/images/reward/` 目录下。单篇文章可通过 `no_reward: true` 强制关闭。

### 版权声明

```yml
copyright_type: 0             # 0: 关闭；1: front-matter 中 copyright:true 才显示；2: 所有文章
```

### 搜索

需要安装插件：`npm i hexo-generator-searchdb -S`

并在站点 `_config.yml` 中添加：

```yml
search:
  path: search.xml
  field: post
  format: html
```

然后启用主题搜索：

```yml
search: true
```

### RSS 订阅

需要安装插件：`npm i hexo-generator-feed -S`

并在站点 `_config.yml` 中配置 feed。然后在主题配置中：

```yml
rss: /atom.xml               # 留空则不在侧边栏显示 RSS 入口
```

### 深色模式

```yml
darkmode: true                # 侧边栏显示深色模式切换按钮
```

### 视觉效果

```yml
canvas_bg: 0                  # 动态背景：0-关闭，1-动态线条（跟随鼠标）

mouse:
  enable: false
  path: /images/mouse.cur     # 自定义鼠标样式文件路径

click_effect: 0               # 鼠标点击效果：0-关闭，1-爱心，2-爆炸烟花，3-粒子烟花
```

### 布局宽度

```yml
layout:
  article_width: 80rem
  sidebar_width: 8rem
```

### GitHub Ribbon

封面右上角 Fork-me 图标。可替换 `source/images/` 下的 forkme 图片自定义样式。

```yml
github:
  enable: false
  url: https://github.com/your-username/your-repo
```

### 音乐播放器

嵌入网易云音乐。

```yml
music:
  enable: false
  type: 1                    # 1: 小尺寸；2: 大尺寸
  id: 22707008                # 网易云音乐 ID
  autoPlay: true
```

### 统计分析

```yml
busuanzi:
  enable: true                # 不蒜子页面访问量统计

cnzz:
  enable: false
  url:                        # 友盟 CNZZ 的 js 代码 src 链接

google_analytics: ""          # Google Analytics 追踪 ID
baidu_analytics: ""           # 百度统计追踪 ID
```

### 数学公式

MathJax 和 KaTeX 二选一。使用 KaTeX 需要更换渲染器：

```bash
npm un hexo-renderer-marked -S && npm i hexo-renderer-markdown-it-katex -S
```

```yml
mathjax: false

katex:
  enable: false
  allpost: true               # false: 仅 front-matter 中 math:true 的文章开启
  copy_tex: false
```

### Mermaid 流程图

```yml
mermaid:
  enable: false
  cdn: https://cdn.staticfile.org/mermaid/8.14.0/mermaid.min.js
  theme: forest
```

### 网站信息

```yml
since: 2019                   # 网站成立年份，小于当前年份时显示为 "2019-2026" 格式

icp:
  enable: false
  url: "https://beian.miit.gov.cn/"
  text: "浙ICP备88888888"

gongan:
  enable: false
  img: /images/beian.png
  url: ""
  text: ""
```

### 友情链接

```yml
friends_link:
  网站名称:
    url: https://example.com
    img: /images/logo.png     # 可省略
```

友链图片建议放在站点 `source/images/` 目录下。

### 评论系统

四种评论系统任选其一，其余保持 `enable: false`。

#### Valine

需要先创建 [LeanCloud](https://console.leancloud.app) 应用。

```yml
leancloud:
  enable: true
  app_id: # LeanCloud App ID
  app_key: # LeanCloud App Key

valine:
  enable: true
  avatar: monsterid
  placeholder: 给我的文章加点评论吧~
```

#### Gitalk

```yml
gitalk:
  enable: true
  clientID: # GitHub OAuth App Client ID
  clientSecret: # Client Secret
  repo: # 存储评论的仓库名
  owner: # 仓库所有者的 GitHub 用户名
  admin: # 管理员的 GitHub 用户名
```

#### Twikoo

```yml
twikoo:
  enable: true
  envId: # 环境 ID
```

#### Giscus（推荐）

基于 GitHub Discussions，无需 OAuth Secret。前往 [giscus.app](https://giscus.app/) 获取配置参数。

```yml
giscus:
  enable: true
  repo: owner/repo            # 启用了 Discussions 的仓库
  repo_id:                     # 从 giscus.app 获取
  category: Announcements
  category_id:                 # 从 giscus.app 获取
  mapping: pathname
  reactions_enabled: 1
  emit_metadata: 0
  input_position: top
  lang: zh-CN
```

### 广告位

可自行增加 `ad_2`、`ad_3` 等条目。建议图片和 URL 避免包含 "ad" 等关键词，以免被广告拦截插件屏蔽。

```yml
ads:
ad_1:
  title: 广告标题
  img: /images/banner.jpg
  url: https://example.com
  width: 300
```

### 加密访问

使用 SweetAlert2 实现的密码保护。

```yml
lock:
  enable: false
  password: 123456
```

### 自定义 CSS

主题提供 `source/css/custom.styl` 文件用于用户自定义样式覆盖，修改此文件不会影响主题升级。

## 页面创建

主题支持以下特殊页面，需要手动创建：

### 分类页面

```bash
hexo new page categories
```

编辑生成的 `source/categories/index.md`：

```md
---
title: categories
type: categories
layout: "categories"
---
```

### 标签页面

```bash
hexo new page tags
```

编辑生成的 `source/tags/index.md`：

```md
---
title: tags
type: tags
layout: "tags"
---
```

### 友情链接页面

```bash
hexo new page friends
```

编辑生成的 `source/friends/index.md`：

```md
---
title: friends
type: friends
layout: "friends"
---
```

然后在 `_config.ayeria.yml` 中配置 `friends_link`。

## Front-matter 参数

除了 Hexo 内置的 front-matter 字段外，本主题额外支持：

| 字段 | 类型 | 说明 |
|------|------|------|
| `reward` | boolean | 是否显示打赏（`reward_type: 1` 时生效） |
| `no_reward` | boolean | 强制关闭打赏 |
| `copyright` | boolean | 是否显示版权声明（`copyright_type: 1` 时生效） |
| `no_toc` | boolean | 关闭本文目录 |
| `no_word_count` | boolean | 关闭本文字数统计 |
| `math` | boolean | 开启本文数学公式（KaTeX `allpost: false` 时生效） |
| `albums` | array | 相册模式，格式：`[["图片URL", "说明"], ...]` |

建议在 `scaffolds/post.md` 中预设常用字段：

```md
---
title: {{ title }}
date: {{ date }}
categories:
tags:
reward: false
copyright: true
---
```

## 多语言

支持 14 种语言，语言包位于 `languages/` 目录：

zh-CN（简体中文）、zh-TW（繁体中文）、en（English）、ja（日本語）、ko（한국어）、es（Español）、de（Deutsch）、fr（Français）、ru（Русский）、vi（Tiếng Việt）、nl（Nederlands）、no（Norsk）、pt（Português）

在站点 `_config.yml` 中设置：

```yml
language: zh-CN
```

## 开发

主题使用 Rollup 构建 CSS/JS。源码位于 `source-src/`，产出位于 `source/dist/`。

```bash
cd themes/ayeria
npm install
npm run dev    # 开发模式（监听变更）
npm run build  # 生产构建
```

## 开源协议

[SATA License](LICENSE) — 基于 MIT，额外要求使用者给原项目点 Star 并感谢原作者。

感谢原作者 [Eric-Shen](https://github.com/Shen-Yu) 提供的优秀主题框架。
