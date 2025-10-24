# Kaleid's Customized Ayer Theme

## 主题说明

本主题基于 [Ayer](https://github.com/Shen-Yu/hexo-theme-ayer) 开发，是一个干净且优雅的 Hexo 主题。经过大量自定义修改，已发展成为一个独特的主题版本。

Ayer（"水"的马来语，"昨日"的西班牙语）原作者：[Eric-Shen](https://github.com/Shen-Yu)

---

## 项目信息

- **网站**: [Ka1eid's SandBox](https://kaleidscoper.github.io)
- **标语**: 千仞高塔，筑基于此
- **作者**: Kaleid Scoper
- **GitHub**: [KaleidScoper](https://github.com/KaleidScoper)

---

## 安装说明

### Hexo >= 5.0 版本

```shell
npm i hexo-theme-ayer -S
```

- 首次安装时，根目录会自动生成 `_config.ayer.yml` 配置文件
- 升级主题时，可以将原配置文件移至根目录并重命名为 `_config.ayer.yml`

### Hexo < 5.0 版本

```shell
git clone https://github.com/Shen-Yu/hexo-theme-ayer.git themes/ayer
```

## 启用主题

在 Hexo 根目录的 `_config.yml` 中修改主题设置：

```yml
theme: ayer
```

## 更新主题

```bash
cd themes/ayer
git pull
```

## 多语言支持

支持以下语言：zh-CN（中文简体）、en（English）、zh-TW（中文繁体）、ja（日本語）、es（Español）、de（Deutsch）、fr（Français）、ru（Русский）、ko（한국어）、vi（Tiếng Việt）、nl（Nederlands）、no（norsk）、pt（Português）

默认语言为英文，可在 Hexo 根目录的 `_config.yml` 中修改 `language` 选项。

## 主题配置

### 侧边栏菜单

```yml
menu:
  主页: /
  全部文章: /archives
  文章分类: /categories
  全部标签: /tags
  书单推荐: /book
  友情链接: /friends
  关于本站: /about
```

### 站点次标题和打字动效

基于 [typed.js](https://github.com/mattboldt/typed.js) 实现

```yml
subtitle:
  enable: true
  text: 第一行文字
  text2: 第二行文字
  text3: 第三行文字 # 最多支持三行
  startDelay: 0
  typeSpeed: 200
  loop: true
  backSpeed: 100
  showCursor: true
```

### 网站图标和Logo

```yml
favicon: /favicon.ico
logo: /images/ayer-side.svg
```

### 封面配置

```yml
cover:
  enable: true
  path: /images/cover1.jpg # 背景图片路径
  logo: /images/ayer.svg # 封面Logo，不需要可设为false
```

### 页面功能

```yml
# 顶部进度条
progressBar: true

# 告示板
broadcast:
  enable: true
  type: 2 # 1：自定义文字，2：一言API
  text: 自定义告示内容

# 文章设置
excerpt_link: 显示更多...
excerpt_all: false # 是否在首页只显示文章归档

# 代码复制按钮
copy_btn: true

# 文章分享
share_enable: true
share_china: true # 是否使用国内社交平台
share_text: 分享

# 文章目录
toc: true

# 图片点击放大
image_viewer: true
```

### 字数统计

需要安装 [hexo-wordcount](https://github.com/willin/hexo-wordcount)

```yml
word_count:
  enable: true
  only_article_visit: true # 只在文章页显示
```

### 打赏功能

```yml
# type: 0-关闭；1-仅在设置了reward:true的文章显示；2-所有文章显示
reward_type: 2
reward_wording: "请我喝杯咖啡~"
alipay: /images/alipay.jpg # 支付宝二维码
weixin: /images/wechat.jpg # 微信二维码
```

### 版权声明

```yml
# type: 0-关闭；1-仅在设置了copyright:true的文章显示；2-所有文章显示
copyright_type: 2
```

### 搜索功能

需要安装 [hexo-generator-searchdb](https://github.com/theme-next/hexo-generator-searchdb)

```yml
search: true
```

### RSS订阅

```yml
rss: /atom.xml # 留空则不显示
```

### 界面设置

```yml
# 深色模式开关
darkmode: true

# 动态背景: 0-关闭，1-动态线条
canvas_bg: 0

# 自定义鼠标样式
mouse:
  enable: false
  path: /images/mouse.cur

# 鼠标点击效果: 0-关闭，1-爱心，2-爆炸，3-粒子
click_effect: 0

# 页面宽度设置
layout:
  article_width: 80rem
  sidebar_width: 8rem
```

### GitHub Ribbons

```yml
github:
  enable: false
  url: https://github.com/your-username/your-repo
```

### 统计分析

```yml
# 不蒜子统计
busuanzi:
  enable: true

# 友盟统计
cnzz:
  enable: true
  url: # 统计代码链接

# Google Analytics
google_analytics: ""

# 百度统计
baidu_analytics: ""
```

### 数学公式

```yml
# Mathjax
mathjax: true

# Katex（需更换渲染器）
katex:
  enable: false
  allpost: true
  copy_tex: false
```

### 网站信息

```yml
# 网站成立年份
since: 2023

# ICP备案
icp:
  enable: false
  url: "https://beian.miit.gov.cn/"
  text: "浙ICP备88888888"

# 公安备案
gongan:
  enable: false
  img: /images/beian.png
  url: "http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=01234567890123"
  text: "浙公网安备01234567890123号"
```

### 友情链接

```yml
friends_link:
  网站名称:
    url: https://example.com
    img: /images/logo.png
```

### 评论系统

支持 Valine、Gitalk、Twikoo 三种评论系统

#### Valine

需要先创建 [LeanCloud](https://console.leancloud.app) 应用

```yml
leancloud:
  enable: true
  app_id: #
  app_key: #

valine:
  enable: true
  avatar: mp
  placeholder: 欢迎留言~
```

#### Gitalk

```yml
gitalk:
  enable: false
  clientID: # GitHub Application Client ID
  clientSecret: # Client Secret
  repo: # 仓库名
  owner: # GitHub用户名
  admin: # GitHub用户名
```

#### Twikoo

```yml
twikoo:
  enable: false
  envId: #
```

### 广告位

```yml
ads:
  ad_1:
    title: 广告标题
    img: /images/ad.jpg
    url: https://example.com
    width: 300
```

### 加密访问

```yml
lock:
  enable: false
  password: 123456
```

---

## 必需插件

### 本地搜索

```bash
npm install hexo-generator-searchdb --save
```

在 Hexo 根目录的 `_config.yml` 中添加：

```yml
search:
  path: search.xml
  field: post
  format: html
```

### RSS订阅

```bash
npm install hexo-generator-feed --save
```

在 Hexo 根目录的 `_config.yml` 中添加：

```yml
feed:
  type: atom
  path: atom.xml
  limit: 20
  hub:
  content:
  content_limit: 140
  content_limit_delim: ' '
  order_by: -date
```

### 文章置顶

```bash
npm uninstall hexo-generator-index --save
npm install hexo-generator-index-pin-top --save
```

---

## 页面创建

### 分类页面

```bash
hexo new page categories
```

在 `/source/categories/index.md` 中添加：

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

在 `/source/tags/index.md` 中添加：

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

在 `/source/friends/index.md` 中添加：

```md
---
title: friends
type: friends
layout: "friends"
---
```

然后在 `_config.ayer.yml` 中配置 `friends_link`。

---

## 相册功能

在文章的 Front-matter 中添加：

```md
---
title: 相册标题
albums: [["图片URL", "图片说明"], ["图片URL", "图片说明"]]
---
```

---

## 目录功能

全局开启目录：

```yml
toc: true
```

单独关闭某篇文章的目录，在 Front-matter 中添加：

```md
---
no_toc: true
---
```

---

## 开源协议

本项目基于原 Ayer 主题的 [SATA License](https://github.com/Shen-Yu/hexo-theme-ayer/blob/master/LICENSE) 许可。

SATA 协议核心思想：在遵守 MIT 许可证的前提下，使用者应该给项目点赞（Star）并感谢作者。

---

## 致谢

感谢 [Ayer](https://github.com/Shen-Yu/hexo-theme-ayer) 原作者 [Eric-Shen](https://github.com/Shen-Yu) 提供的优秀主题框架。
