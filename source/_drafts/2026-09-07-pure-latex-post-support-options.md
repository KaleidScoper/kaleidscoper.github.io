---
title: "让Hexo博客支持纯LaTeX文章：职责边界、方案与实施路线"
date: 2026-09-07 00:00:00
categories: [技术, 开发, Web开发]
tags: [原创, Hexo, LaTeX, 博客]
author: KaleidScoper
reward: false
copyright: true
---

<b>前言：</b> 本站目前能够在Markdown博文中书写LaTeX数学公式，但这不等于能够把一份完整的`.tex`文档直接发布为博文。本文先界定“纯LaTeX文章”的含义，再比较Pandoc预构建、自研Hexo Renderer、LaTeXML或make4ht转换以及PDF优先发布等方案，最后给出适合本站现状的实施路线。

<!--more-->

## 一、先定义什么叫“支持纯LaTeX文章”

本站现有的`hexo-renderer-markdown-it-katex`解决的是**Markdown正文中的数学公式**。它可以处理`$...$`和`$$...$$`中的部分LaTeX数学语法，却不能理解完整文档中的`\documentclass`、`\section`、`\includegraphics`、`\bibliography`和自定义宏包。

本文所说的“纯LaTeX文章”，是指正文源文件满足以下条件：

- 源文件是一份完整的`.tex`文档，可以包含`\documentclass`和`\begin{document}`。
- `.tex`不需要在顶部插入Hexo专属的YAML Front Matter，仍可被标准LaTeX工具独立处理。
- 文章可以拥有Hexo所需的标题、日期、分类、标签、摘要和永久链接。
- 发布结果应成为真正的博客文章，进入首页、归档、分类、标签、前后篇导航和站内搜索，而不是只把`.tex`当作下载附件。
- HTML正文继续由Ayeria组装和呈现，并满足桌面端、移动端、亮色与暗色模式的基本阅读要求。

如果只把文件扩展名改成`.tex`，再在顶部写入普通的`---` Front Matter，这只能算“以`.tex`为扩展名的Hexo内容文件”。它不再是能够原样交给XeLaTeX、LuaLaTeX或其他标准工具的严格纯LaTeX文档。

还需要承认一个现实边界：**不存在能够无损地把任意TeX程序转换成语义化网页的通用方案。** 标准文章结构、数学公式和常见引用可以支持得很好；任意文类、自定义宏编程、TikZ、`minted`以及依赖特殊编译流程的宏包，则必须限定支持范围或采用PDF兜底。

## 二、这是谁的能力：博客、Hexo还是Ayeria

结论是：**接收和转换`.tex`主要属于博客站点的内容构建能力，不属于Ayeria主题本体。**

当前根目录的`package.json`安装了Markdown、EJS和Stylus渲染器，没有为`tex`扩展名注册渲染器；`.github/workflows/pages.yml`也只准备Node.js，然后依次构建主题和执行`hexo generate`，没有安装Pandoc、TeX Live、LaTeXML或Tectonic。

Ayeria在`themes/ayeria/layout/_partial/article.ejs`中直接输出`post.content`。只要上游能够把LaTeX转换成合适的HTML正文片段，现有的文章标题、日期、分类、标签、评论、分享和前后篇导航就可以继续工作。因此，各层职责应该保持如下边界：

| 能力 | 推荐归属 |
|---|---|
| 发现`.tex`、读取元数据、调用转换器 | 博客根目录的构建脚本或独立Hexo插件 |
| 固定工具版本、安装依赖、缓存和失败处理 | GitHub Actions与本地开发环境 |
| 文章模型、永久链接、归档、分类、标签、搜索 | Hexo |
| 转换后HTML的字体、间距、公式溢出和移动端表现 | Ayeria内容层 |
| 供其他Hexo站点或主题复用 | 独立插件，不与Ayeria捆绑 |

Ayeria最多需要补充有限的兼容样式，例如`figure`、`figcaption`、脚注、参考文献、定理块、MathML和宽表格。新增样式应限制在`.latex-article`之内，遵守内容层“书斋式克制”的设计原则，不应为了支持一种输入格式重做整套文章模板。

## 三、所有方案都必须先解决元数据

LaTeX标准字段只有`\title`、`\author`和`\date`等有限信息，不能完整表达本站的分类、标签、摘要、打赏和永久链接规则。若要让`.tex`保持独立可编译，推荐为每篇文章提供一个sidecar元数据文件：

```text
source-latex/
├── _drafts/
│   └── example-post/
│       ├── index.tex
│       ├── post.yml
│       ├── references.bib
│       └── assets/
└── _posts/
    └── published-post/
        ├── index.tex
        ├── post.yml
        └── assets/
```

其中`post.yml`只保存Hexo元数据：

```yaml
title: 示例文章
date: 2026-09-07 00:00:00
categories: [技术, 开发, Web开发]
tags: [原创, Hexo, LaTeX]
author: KaleidScoper
summary: 这是一段用于首页列表的摘要。
reward: false
copyright: true
```

构建工具根据`summary`生成本站约定的前言和摘要分隔标记，并以`post.yml`作为Hexo元数据的唯一来源。`.tex`中的`\title`和`\author`可以用于一致性校验，但不应再次输出，以免页面出现两个标题。

如果特别在意“文章只由一个文件组成”，也可以把元数据写进以`%`开头的LaTeX注释块。不过这会创造一套本站专属语法，需要自行维护解析器、错误位置和转义规则。相比之下，sidecar虽然多一个文件，边界更清楚，也更容易验证。

## 四、方案一：Pandoc构建前预转换

这是最适合本站第一版的方案。

```text
index.tex + post.yml + references.bib + assets
                    │
                    │ 固定版本的Pandoc
                    ▼
       带Hexo Front Matter的HTML正文片段
                    │
                    │ 现有hexo generate
                    ▼
            Ayeria文章页与public/
```

站点级脚本扫描`source-latex/_posts/`和`source-latex/_drafts/`，调用Pandoc将LaTeX转换为HTML5片段，再写入一个被`.gitignore`精确排除的生成目录。Hexo只看到生成后的临时文章，`.tex`仍是唯一正文源，生成文件不提交。

建议的关键规则如下：

- 显式使用`--from=latex --to=html5`，输出正文片段，不生成第二套`<html>`、`<head>`和`<body>`。
- 使用`--shift-heading-level-by=1`，让LaTeX的`\section`从正文`h2`开始；文章标题继续由Ayeria输出为唯一的`h1`。
- 第一版优先验证`--math-method=mathml`。这样公式在构建时成为MathML，不必让Pandoc和主题分别加载一套数学运行时。
- 若使用BibTeX或BibLaTeX数据，通过`--citeproc`和固定的CSL样式生成引用与参考文献。
- 转换结果外包一层`<div class="latex-article">`，为必要的主题兼容样式提供稳定作用域。
- 自动生成的Front Matter应禁用不需要的Nunjucks处理，避免转换结果被误认成Hexo Tag Plugin。
- 图片从文章自己的`assets/`复制到一个明确保留的站点资源目录，并重写URL；缺失图片必须让构建失败。
- 每次构建只清理专门的生成目录，不得模糊匹配或删除作者源文件。

当前`post_asset_folder`为`false`，不应仅为了LaTeX文章全局开启。资源转换脚本应自行管理专用输出路径；如果未来改变这一配置，必须重新验证Hexo对`.tex`扩展名和文章资源目录的识别行为。

这一方案的优点是不会替换已经稳定工作的`hexo-renderer-markdown-it-katex`，现有Markdown文章的回归风险最低；生成的正文仍是原生HTML，可以被搜索、选择、链接和响应式排版。它的主要限制是Pandoc并不执行任意LaTeX宏包：复杂自定义文类、TikZ、高级表格和部分交叉引用可能丢失或退化。

本地作者体验也需要正面设计。第一版可以让`npm run build`和`npm run server`在启动Hexo前统一执行转换；修改`.tex`后需要重启预览或重新运行准备命令。只有真实使用证明有需要时，再增加watcher和增量缓存，不必在第一版提前建设。

## 五、方案二：自研Hexo `.tex` Renderer和Processor

Hexo允许插件按输入扩展名注册Renderer：

```javascript
hexo.extend.renderer.register("tex", "html", renderLatex);
```

最简单的实现是在博客根目录的`scripts/`中注册`.tex → .html`，Renderer内部调用Pandoc。这样`.tex`可以直接放在Hexo内容目录中，`hexo server`和`hexo generate`也自然使用同一条链路。

但是，只写Renderer并不能优雅解决严格纯LaTeX的元数据问题：

- 如果直接使用Hexo YAML Front Matter，实现简单，但`.tex`不能再作为标准LaTeX文档原样编译。
- 如果继续使用`index.tex + post.yml`，就还需要Processor负责发现sidecar、建立文章模型和管理资源。
- 如果解析`%`注释元数据，则要维护一套专属语法和诊断逻辑。

因此，“Renderer + Processor”的完整实现并不会明显比预构建脚本更小，只是把同样的复杂度搬进了Hexo生命周期。它还要处理并发子进程、watch模式、缓存、超时、stderr、图片副产物和构建中断。

现成的`hexo-renderer-pandoc`也不是可以直接安装的答案。它的主要定位是用Pandoc替换Markdown渲染器，默认注册的是`md`、`markdown`、`mkd`等扩展，而不是`tex`；直接采用还会无谓影响本站已有的Markdown与KaTeX链路。

这个方案真正的价值在于**产品化和复用**。建议先用方案一验证输入规范和转换边界；当LaTeX文章达到一定数量，或者第二个Hexo站点也需要同一能力时，再把已经稳定的逻辑提炼为独立的`hexo-latex-posts`插件。即使届时要让Ayeria文档声明兼容该插件，转换器本身也不应放进主题包。

实现时必须使用`spawn`或`execFile`配合参数数组调用外部程序，不能把文件名拼进shell命令；还应限制工作目录、输入路径、执行时间和输出大小。转换警告、缺失资源和未解析引用应形成可定位的构建错误，而不是生成表面成功的残缺文章。

## 六、方案三：LaTeXML或make4ht/TeX4ht生成语义HTML

当真实文章证明Pandoc的兼容范围不够时，可以引入更接近传统LaTeX工具链的HTML转换器。

### 3.1 LaTeXML

LaTeXML先把TeX或LaTeX转换为内部XML，再处理交叉引用、索引、数学和图形，最终可以输出HTML5与Presentation MathML。它适合希望保留学术文档语义、站内搜索和无障碍结构的文章。

它的代价是更重的运行环境。官方安装涉及Perl、XML相关库，图片处理还可能涉及ImageMagick等依赖；非标准宏包能否工作也取决于LaTeXML是否具有相应binding。输出的CSS、类名和图片目录仍然需要映射到Ayeria，不能因为它能生成HTML就假定主题已经兼容。

### 3.2 make4ht/TeX4ht

make4ht是TeX4ht的现代构建前端，会调用真实LaTeX工具链生成HTML5、MathML、SVG或图片资源，也可以执行BibTeX、Biber、MakeIndex和DOM后处理。对于复杂交叉引用、传统宏包和多轮编译，它通常比Pandoc更有机会接近原文。

代价同样明显：CI需要较完整的TeX Live及文章所需宏包，构建更慢，依赖漂移和错误诊断更复杂；生成HTML往往带有大量专属类名和样式，与Ayeria冲突的概率也最高。它适合专项支持少数复杂学术文章，不适合作为所有`.tex`的默认第一方案。

无论使用LaTeXML还是make4ht，都应复用方案一的sidecar元数据、专用资源目录和生成物边界。转换器只是可替换后端，不应反过来决定Hexo文章模型。

## 七、方案四：PDF优先或HTML与PDF双输出

如果目标是忠实保留复杂LaTeX排版，可以用Tectonic、latexmk、XeLaTeX或LuaLaTeX把`index.tex`编译为PDF，再由Hexo生成一篇包含摘要、元数据、下载链接和可选内嵌预览的Ayeria文章外壳。

```text
index.tex ──Tectonic/LaTeX──► article.pdf
post.yml ───────────────────► Ayeria摘要与下载页面
```

该方案对自定义文类、分页、浮动体、字体、TikZ和复杂宏包的保真度最高，也是HTML转换失败时最可靠的退路。但它严格来说不是原生网页博文：PDF正文难以进入站内搜索和页面目录，移动端重排、暗色模式、SEO、复制引用和无障碍体验也明显较弱。

因此，PDF适合两种角色：一是作为Pandoc HTML文章的保真附件；二是少数超出HTML支持范围的文章的显式回退。页面必须同时提供普通下载链接、文件类型和大小，不能只嵌入一个在部分浏览器中不可用的`iframe`。

## 八、方案比较

| 方案 | 严格纯`.tex` | 原生网页体验 | LaTeX兼容范围 | CI负担 | 既有Markdown回归风险 | 推荐定位 |
|---|---|---|---|---|---|---|
| Pandoc预构建 | 是 | 高 | 中 | 中 | 低 | 第一版首选 |
| 自研Renderer + Processor | 是 | 高 | 取决于转换后端 | 中 | 低至中 | 稳定后产品化 |
| LaTeXML | 是 | 高 | 中高 | 高 | 低 | 语义化学术HTML专项 |
| make4ht/TeX4ht | 是 | 中高 | 高 | 很高 | 低 | 复杂文档专项 |
| PDF优先或双输出 | 是 | 低至中 | 最高 | 中高 | 低 | 保真附件或回退 |

综合本站现状，推荐采用下面的组合，而不是试图选出一个覆盖所有LaTeX的万能转换器：

1. 默认路径使用**Pandoc预构建HTML5/MathML + sidecar元数据**。
2. 超出Pandoc支持范围但仍需要网页语义时，再用同一批样本比较LaTeXML和make4ht。
3. 对精确版式有要求的文章，同时生成PDF；无法可靠转换时明确回退为PDF发布页。
4. 等方案经过真实文章验证后，再决定是否抽成独立Hexo插件。

## 九、建议的分阶段实施路线

### 9.1 第一阶段：定义支持范围并制作验收样本

先建立三份不发布的`.tex`样本：

- **基础样本：** 中文与英文、`\section`、`\subsection`、列表、引用、代码、普通表格、脚注、行内公式和行间公式。
- **学术样本：** `\label`、`\ref`、定理、PNG或SVG图片、BibTeX引用和参考文献。
- **压力样本：** 自定义宏、`align`、复杂表格、TikZ、`cleveref`和`biblatex/biber`。

这一阶段只验证Pandoc的真实输出，不先修改主题。测试结果应该明确分成“支持”“可降级”“拒绝构建”三类，而不是笼统声称兼容LaTeX。

### 9.2 第二阶段：落地Pandoc预构建MVP

- 建立`source-latex/`和`post.yml`约定。
- 编写站点级转换与元数据校验脚本。
- 输出到被精确忽略的专用目录，构建前后不让`git status`变脏。
- 在`npm run build`和`npm run server`前执行转换。
- 在GitHub Actions中安装并固定Pandoc版本。
- 保留现有Markdown Renderer和所有`.md`文章不变。
- 只针对样本实际生成的HTML补充Ayeria样式。

### 9.3 第三阶段：完善作者体验

- 提供明确的本地环境检查和错误提示。
- 错误信息包含源文件、行号和转换器stderr。
- 确有需要时再加入`.tex` watcher和按内容哈希生成的增量缓存。
- 可选同时生成PDF作为下载附件。

### 9.4 第四阶段：决定是否产品化

只有在多个站点确实需要同一能力后，才把稳定逻辑提炼成独立Hexo插件。Ayeria主题本身只保留内容样式、兼容说明和测试页面；如果主题工作副本产生修改，还应按仓库约定同步评估独立主题仓库。

## 十、验收标准

- 一份不含Hexo Front Matter的完整`.tex`能够独立编译，也能生成第一等Hexo博文。
- 标题、日期、分类、标签、摘要和永久链接正确，页面只有一个文章级`h1`。
- `\section`从`h2`开始，Ayeria目录能够生成稳定链接。
- 文章正常进入首页、归档、分类、标签、前后篇导航和站内搜索。
- 公式不会重复渲染或闪烁，长公式在窄屏上不会撑破正文。
- 图片、题注、脚注、交叉引用、引用列表和相对路径全部有效。
- 本地Windows环境与Ubuntu GitHub Actions使用固定版本，输出结构一致。
- 缺少sidecar、转换器、图片或bibliography时明确失败，不得悄悄生成残缺页面。
- `.tex`不会因为未被识别而意外原样复制到`public/`。
- 生成目录不会污染Git状态，现有Markdown文章没有功能回归。
- 真实TeX编译不得开启`shell-escape`，也不得在带有部署密钥的环境中处理来源不可信的文档。
- 新增Ayeria样式仅作用于`.latex-article`，并覆盖亮色、暗色、桌面端、移动端和打印预览。

## 十一、第一版明确不做什么

- 不承诺支持所有document class、宏包、自定义宏、TikZ、`minted`、glossary、index或任意多文件工程。
- 不为了`.tex`输入替换现有`hexo-renderer-markdown-it-katex`。
- 不把Pandoc或TeX工具链塞进Ayeria主题的npm包。
- 不在浏览器中编译任意LaTeX；这会损害首屏速度、SEO、搜索、错误体验和安全边界。
- 不把转换器生成的完整`<html>`文档嵌进`post.content`。
- 不把生成的Markdown、HTML或PDF当成第二份正文源提交。
- 不默认公开`.tex`、`.bib`、日志和中间文件；源码下载必须由文章显式配置。
- 不开启`shell-escape`，不执行来源不可信的TeX。
- 不在看到真实转换结果之前大规模增加主题CSS。

## 十二、参考资料

- [Hexo：Writing](https://hexo.io/docs/writing)
- [Hexo：Renderer API](https://hexo.io/api/renderer)
- [Hexo：Rendering API](https://hexo.io/api/rendering)
- [Hexo：Front-matter](https://hexo.io/docs/front-matter)
- [Pandoc User's Guide](https://pandoc.org/MANUAL.html)
- [Pandoc官方GitHub Actions](https://github.com/pandoc/actions)
- [LaTeXML文档](https://math.nist.gov/~BMiller/LaTeXML/docs.html)
- [make4ht项目与文档](https://ctan.org/pkg/make4ht)
- [Tectonic：compile命令](https://tectonic-typesetting.github.io/book/latest/v2cli/compile.html)
