---
title: "Markdown入门：Md语法和LaTeX公式"
date: 2025-03-20 12:00:00
categories: [技术, 开发, Web开发]
tags: [教程, Markdown, LaTeX]
---

<b>前言：</b> 办公常用的`.wps`、`.doc`等二进制文档格式兼容性很差，不能确保在多数情况下可读，而且排版非常脆弱。纯文本的`.html`的读写体验则又太差，在没有图形化工具的情况下手动编写H5文章可以说是一种酷刑。而Markdown是一种读写体验极佳、排版稳定、对复制粘贴友好，且几乎能在任何设备上阅读的纯文本文档格式，而且几乎各种办公软件都支持将`.md`文件导入为他们的文档格式。我在此推荐任何有大量笔记或撰文需求的人改用Markdown。本教程旨在为任何打算尝试Markdown的人，提供一份Markdown语法和LaTeX（KaTeX）语法火速入门教程，从此彻底告别花里胡哨的笔记软件。

<!--more-->
 
> p.s. 最重要的是，md文件可以很轻松地用在各种静态网站生成器中，这让迁移网站变成了一个非常简单的事情。传统网页的迁移是另一场灾难，但使用md文件就能轻松避免这些问题。
> p.p.s. 第二重要的是，如果你是打算在Hexo博客中使用LaTeX数学公式，<b>必须先更换Markdown渲染器</b>！默认的`hexo-renderer-marked`不支持数学公式渲染。请先阅读本文"零、Hexo配置LaTeX支持"章节完成配置，再学习后续语法。

## 零、Hexo配置LaTeX支持

### <b>为什么需要更换渲染器？</b>

Hexo默认使用`hexo-renderer-marked`作为Markdown渲染器，这个渲染器**不支持LaTeX数学公式**。如果你直接在文章中写`$E=mc^2$`，它会被当成普通文本显示，而不会渲染成数学公式。

因此，要在博客中使用数学公式，你必须更换为支持LaTeX的渲染器。本博客使用的是`hexo-renderer-markdown-it-katex`，它基于markdown-it并集成了KaTeX数学公式渲染引擎。

### <b>配置步骤</b>

**步骤1：卸载默认渲染器**

首先要卸载Hexo默认的Markdown渲染器：

```bash
npm uninstall hexo-renderer-marked --save
```

**步骤2：安装KaTeX渲染器**

安装支持KaTeX的新渲染器：

```bash
npm install hexo-renderer-markdown-it-katex --save
```

**步骤3：配置渲染器**

在博客根目录的`_config.yml`文件中添加markdown-it的配置：

```yaml
# Markdown-it configuration
markdown_it:
  render:
    html: true        # 允许在Markdown中使用HTML标签
    xhtmlOut: false   # 不使用XHTML风格
    breaks: true      # 将换行符转换为<br>
    linkify: true     # 自动将URL转换为链接
    typographer: true # 启用智能标点符号替换
    quotes: '""'''    # 引号样式
  plugins:
    - markdown-it-abbr           # 缩写支持
    - markdown-it-cjk-breaks     # 中日韩文字换行优化
    - markdown-it-container      # 自定义容器
    - markdown-it-deflist        # 定义列表
    - markdown-it-emoji          # Emoji表情支持
    - markdown-it-footnote       # 脚注支持
    - markdown-it-ins            # 下划线<ins>
    - markdown-it-mark           # 高亮<mark>
    - markdown-it-sub            # 下标
    - markdown-it-sup            # 上标
```

> **注意**：`plugins`列表中的插件是可选的，你不需要手动安装它们。`hexo-renderer-markdown-it-katex`会自动处理这些功能。如果某些插件功能不生效也是正常的，不影响核心的Markdown和LaTeX渲染。

**步骤4：配置KaTeX**

在主题配置文件（本博客是`_config.ayer.yml`）中启用KaTeX支持：

```yaml
# Katex数学公式
katex:
  enable: true    # 启用KaTeX
  allpost: true   # 对所有文章生效（设为false则只对设置了math:true的文章生效）
  copy_tex: false # 是否允许复制公式的LaTeX代码
```

**步骤5：清理缓存并重新生成**

配置完成后，必须清理缓存并重新生成静态文件：

```bash
hexo clean
hexo generate
hexo server
```

### <b>常见问题及解决方案</b>

**问题1：更换渲染器后某些Markdown语法失效**

更换为markdown-it后，部分原本能用的Markdown语法可能会失效，这通常是因为：

- **解决方案**：检查`_config.yml`中的`markdown_it.render`配置。特别是`html: true`和`breaks: true`这两个选项，它们分别控制HTML标签支持和换行符处理。

**问题2：数学公式不显示**

如果配置后公式仍不显示：

1. 确认`_config.ayer.yml`（或你的主题配置文件）中`katex.enable`设置为`true`
2. 确认已执行`hexo clean`清理缓存
3. 检查浏览器控制台是否有JavaScript错误
4. 尝试使用`$$公式$$`块级公式而非`$公式$`行内公式进行测试

**问题3：公式渲染但显示异常**

部分LaTeX语法在KaTeX中可能不被支持（KaTeX是LaTeX的子集）：

- **解决方案**：查阅[KaTeX支持的函数列表](https://katex.org/docs/supported.html)，使用KaTeX支持的语法
- 对于复杂公式，可能需要调整写法或拆分为多个公式

**问题4：特殊字符冲突**

Markdown中的某些特殊字符（如`_`、`*`、`\`）可能与LaTeX冲突：

- **解决方案**：在公式内使用时无需转义，但在公式外的Markdown文本中使用这些符号时可能需要用反斜杠转义，如`\_`

### <b>验证配置是否成功</b>

创建一个测试文章，写入以下内容：

```markdown
## 测试行内公式
质能方程：$E = mc^2$

## 测试块级公式
$$
\frac{\partial u}{\partial t} = h^2 \left( \frac{\partial^2 u}{\partial x^2} + \frac{\partial^2 u}{\partial y^2} \right)
$$
```

如果公式能正确渲染成如下数学符号而非纯文本，说明配置成功！

质能方程：$E = mc^2$

$$
\frac{\partial u}{\partial t} = h^2 \left( \frac{\partial^2 u}{\partial x^2} + \frac{\partial^2 u}{\partial y^2} \right)
$$

### <b>换回默认渲染器（可选）</b>

如果你不需要数学公式支持，想换回默认渲染器：

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

有任何其他的Hexo博客使用问题，本文不再赘述，详见[这篇专门的Hexo教程](/2025/10/02/2025-10-02-how-to-use-hexo)。

---

## 一、Markdown基础语法

Markdown是一种轻量级标记语言。“标记语言”的意思是，Markdown类似HTML，只是针对 **纯文本** 格式文档的一种 **纯文本** 标记，这些标记用来告诉各种Markdown解释器，该怎么把它转换成结构丰富的HTML页面。不仅如此，与HTML不同，这些标记非常易读、易写、易记，所以其未经渲染的纯文本 `.md` 文件也非常适合三岁宝宝体质。

既然不只是人类要阅读，有时Markdown解释器也要阅读你的文章，那么文章内的标记就不能太放飞自我，需要遵守一定的规则（类似各种编程语言的 **“语法”** ）。以下是博文写作中的常用语法。

### <b>1. 标题层级</b>

使用`#`号定义标题，一个`#`代表一级标题，两个`##`代表二级标题，以此类推。在博文写作中，合理使用标题层级有助于形成好看的文章结构，尤其是有些Markdown渲染器提供目录功能，这个功能极其依赖你合理设置标题层级。

### <b>2. 强调：加粗与斜体</b>

-   *斜体*：使用一对星号 `*` 或下划线 `_` 包裹文本。
-   **加粗**：使用一对双星号 `**` 进行加粗，例如` **加粗文本** `。
-   ~~删除线~~：使用一对双波浪线 `~~` 包裹文本。

需要注意的是，很多解释器都要求这类语法前有一个空格。

### <b>3. 列表：有序与无序</b>

-   <b>无序列表</b> 使用星号 `*`、加号 `+` 或是减号 `-` 作为列表标记。
-   <b>有序列表</b> 则使用数字接着一个英文句点。

```markdown
- 列表项 A
- 列表项 B

1. 步骤一
2. 步骤二
```

上述语法的渲染效果为：

- 列表项 A
- 列表项 B

1. 步骤一
2. 步骤二

### <b>4. 代码块</b>

对于程序员博主来说代码块必不可少。使用一对反引号 `` `代码` `` （效果为`代码`）来标记行内代码，使用三个反引号 ``` 包裹（类似某些语言的多行注释）来标记多行代码。在代码块内包含代码块语法时，外层代码块需多一个反引号。

````markdown
```javascript
// 在```后指定语言可以实现语法高亮
function hello() {
  console.log("Hello, Hexo!");
}
```
````

上述语法的渲染效果为：

```javascript
// 在```后指定语言可以实现语法高亮
function hello() {
  console.log("Hello, Hexo!");
}
```

### <b>5. 引用、链接与图片</b>

-   <b>引用：</b> 使用 `>` 符号（后接空格）来表示引用块。
-   <b>链接：</b> 语法为 `[链接文本](链接地址)`。
-   <b>图片：</b> 语法为 `![图片描述文本](图片地址)`。

### <b>6. 表格</b>

表格语法略显复杂，但非常实用。使用`|`来分隔不同的单元格，使用`-`来分隔表头和表体。

```markdown
| Header 1 | Header 2 |
| :------- | :------: |
| Cell 1   |  Cell 2  |
| Cell 3   |  Cell 4  |
```
*注：冒号`:`可以用来控制表格内容的对齐方式。*

### <b>7. 其他</b>

Markdown允许在语法内混用HTML语法。有些文本效果在不同版本的Markdown解释器下不一定能稳定实现，但是使用HTML语法就能100%确保兼容性。还有一些文本效果只能通过这种方式正常实现。

## 二、数学公式 (KaTeX)

本博客采用KaTeX来渲染数学公式，它相比MathJax更轻量、渲染速度更快。语法与标准LaTeX基本兼容。

> **KaTeX vs LaTeX**：KaTeX是LaTeX的一个子集，专为Web渲染优化。它支持绝大多数常用的LaTeX数学命令，但不支持一些高级LaTeX包和复杂命令。如果你遇到公式无法渲染的情况，可以查阅[KaTeX支持的函数列表](https://katex.org/docs/supported.html)确认是否支持该语法。

> **前提条件**：确保你已按照"零、Hexo配置LaTeX支持"章节完成了渲染器配置，否则下面的LaTeX语法将无法正常显示。

### <b>1. 公式的两种形式</b>

-   <b>行内公式 (Inline)</b>: 将公式夹在`$`符号中间，例如 `$E=mc^2$`。
-   <b>块级公式 (Display)</b>: 将公式夹在`$$`符号中间，公式会单独成行并居中。

    ```latex
    $$
    \frac{\partial u}{\partial t} = h^2 \left( \frac{\partial^2 u}{\partial x^2} + \frac{\partial^2 u}{\partial y^2} \right)
    $$
    ```

### <b>2. 常用LaTeX命令</b>

-   <b>上下标</b>: `^` 用于上标, `_` 用于下标。例如：`$x_i^2$`。
-   <b>分数</b>: 使用 `\frac{分子}{分母}`。例如：`$\frac{1}{x+1}$`。
-   <b>根号</b>: 使用 `\sqrt{表达式}`。n次方根为 `\sqrt[n]{表达式}`。
-   <b>运算符</b>: `\sum` (求和), `\int` (积分), `\lim` (极限) 等。例如：`$\sum_{i=1}^n a_i$`。
-   <b>括号</b>: 使用 `\left(` 和 `\right)` 来创建可以自动调整大小的括号。

### <b>3. 矩阵与多行公式</b>

编写复杂的矩阵和需要对齐的多行公式，是LaTeX的强项。

1.  <b>矩阵</b>

    使用 `pmatrix`, `bmatrix`, `vmatrix` 等环境来创建不同括号的矩阵。

    ```latex
    $$
    A = \begin{pmatrix}
    a_{11} & a_{12} \\
    a_{21} & a_{22}
    \end{pmatrix}
    $$
    ```

2.  <b>对齐的多行公式</b>

    使用 `aligned` 环境，并用 `&` 来标记对齐点，`\\` 来换行。

    ```latex
    $$
    \begin{aligned}
    v &= v_0 + at \\
    s &= v_0 t + \frac{1}{2}at^2
    \end{aligned}
    $$
    ```

### <b>4. 注意事项</b>

在Markdown文件中书写LaTeX公式时，需要注意特殊字符的转义问题，特别是下划线`_`、星号`*`等。如果公式渲染出现问题，可以尝试使用`\`进行转义。
