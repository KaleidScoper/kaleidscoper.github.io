# Highlight.js Token 类型参考手册

## 说明

这份文档列出了Highlight.js生成的常见token类型（class名），以及建议的配色方案。

## 一、通用Token类型

### 1. 关键字（Keywords）

| Class名 | 说明 | 示例 | 建议颜色 |
|---------|------|------|----------|
| `.keyword` | 通用关键字 | `if`, `for`, `while`, `class`, `def` | `#66d9ef` (蓝色) |
| `.keyword.control` | 流程控制 | `return`, `break`, `continue` | `#f92672` (红色) |
| `.keyword.operator` | 操作符关键字 | `new`, `instanceof`, `typeof` | `#f92672` (红色) |

### 2. 字符串（Strings）

| Class名 | 说明 | 示例 | 建议颜色 |
|---------|------|------|----------|
| `.string` | 普通字符串 | `"hello"`, `'world'` | `#e6db74` (黄色) |
| `.string.quoted` | 带引号字符串 | 同上 | `#e6db74` (黄色) |
| `.template-string` | 模板字符串(JS) | \`hello ${name}\` | `#e6db74` (黄色) |
| `.char` | 字符 | `'a'` | `#e6db74` (黄色) |

### 3. 注释（Comments）

| Class名 | 说明 | 示例 | 建议颜色 |
|---------|------|------|----------|
| `.comment` | 通用注释 | `// comment`, `/* comment */` | `#75715e` (灰绿) |
| `.comment.block` | 块注释 | `/* ... */` | `#75715e` (灰绿) |
| `.comment.line` | 行注释 | `// ...` | `#75715e` (灰绿) |
| `.doctag` | 文档标签 | `@param`, `@return` | `#a6e22e` (绿色) |

### 4. 数字（Numbers）

| Class名 | 说明 | 示例 | 建议颜色 |
|---------|------|------|----------|
| `.number` | 通用数字 | `123`, `3.14` | `#ae81ff` (紫色) |
| `.number.integer` | 整数 | `42` | `#ae81ff` (紫色) |
| `.number.float` | 浮点数 | `3.14` | `#ae81ff` (紫色) |
| `.number.hex` | 十六进制 | `0xFF` | `#ae81ff` (紫色) |
| `.number.octal` | 八进制 | `0o77` | `#ae81ff` (紫色) |
| `.number.binary` | 二进制 | `0b1010` | `#ae81ff` (紫色) |

### 5. 函数（Functions）

| Class名 | 说明 | 示例 | 建议颜色 |
|---------|------|------|----------|
| `.function` | 函数声明 | `function foo() {}` | `#a6e22e` (绿色) |
| `.function.call` | 函数调用 | `foo()` | `#a6e22e` (绿色) |
| `.title.function` | 函数名 | `function main() {}` | `#a6e22e` (绿色) |
| `.title.function_` | 函数名(新版) | 同上 | `#a6e22e` (绿色) |
| `.built_in` | 内置函数 | `print()`, `len()` | `#66d9ef` (蓝色) |

### 6. 类型和类（Types & Classes）

| Class名 | 说明 | 示例 | 建议颜色 |
|---------|------|------|----------|
| `.class` | 类声明 | `class MyClass {}` | `#a6e22e` (绿色) |
| `.title.class` | 类名 | `class Person {}` | `#a6e22e` (绿色) |
| `.title.class_` | 类名(新版) | 同上 | `#a6e22e` (绿色) |
| `.type` | 类型声明 | `String`, `int`, `List<T>` | `#66d9ef` (蓝色) |
| `.type.builtin` | 内置类型 | `int`, `float`, `bool` | `#66d9ef` (蓝色) |

### 7. 变量（Variables）

| Class名 | 说明 | 示例 | 建议颜色 |
|---------|------|------|----------|
| `.variable` | 变量 | `var x = 10;` | `#f8f8f2` (白色) |
| `.variable.language` | 语言特殊变量 | `this`, `self`, `super` | `#fd971f` (橙色) |
| `.variable.parameter` | 参数 | `function(param1, param2)` | `#fd971f` (橙色) |
| `.params` | 参数列表 | `(String name, int age)` | `#f8f8f2` (白色) |

### 8. 操作符和标点（Operators & Punctuation）

| Class名 | 说明 | 示例 | 建议颜色 |
|---------|------|------|----------|
| `.operator` | 操作符 | `+`, `-`, `*`, `/`, `=` | `#f92672` (红色) |
| `.punctuation` | 标点符号 | `.`, `,`, `;`, `:` | `#f8f8f2` (白色) |

### 9. 常量和字面量（Constants & Literals）

| Class名 | 说明 | 示例 | 建议颜色 |
|---------|------|------|----------|
| `.literal` | 字面量 | `true`, `false`, `null`, `undefined` | `#ae81ff` (紫色) |
| `.constant` | 常量 | `MAX_VALUE`, `PI` | `#ae81ff` (紫色) |
| `.constant.builtin` | 内置常量 | `None`, `True`, `False` | `#ae81ff` (紫色) |

### 10. 属性和字段（Properties & Attributes）

| Class名 | 说明 | 示例 | 建议颜色 |
|---------|------|------|----------|
| `.property` | 对象属性 | `obj.property` | `#f8f8f2` (白色) |
| `.attribute` | 属性/特性 | `@property`, HTML属性 | `#a6e22e` (绿色) |
| `.attr` | 属性简写 | 同上 | `#a6e22e` (绿色) |

## 二、Java特定Token

| Class名 | 说明 | 示例 | 建议颜色 |
|---------|------|------|----------|
| `.annotation` | 注解 | `@Override`, `@Autowired` | `#e6db74` (黄色) |
| `.package` | 包声明 | `package com.example;` | `#f8f8f2` (白色) |
| `.import` | 导入语句 | `import java.util.*;` | `#f92672` (红色) |
| `.modifier` | 修饰符 | `public`, `private`, `static` | `#f92672` (红色) |

## 三、Python特定Token

| Class名 | 说明 | 示例 | 建议颜色 |
|---------|------|------|----------|
| `.decorator` | 装饰器 | `@decorator` | `#66d9ef` (蓝色) |
| `.meta` | 元数据 | 装饰器、指令等 | `#66d9ef` (蓝色) |
| `.params` | 参数 | `def func(param):` | `#fd971f` (橙色) |

## 四、JavaScript/TypeScript特定Token

| Class名 | 说明 | 示例 | 建议颜色 |
|---------|------|------|----------|
| `.template-string` | 模板字符串 | \`Hello ${name}\` | `#e6db74` (黄色) |
| `.template-variable` | 模板变量 | `${variable}` | `#f8f8f2` (白色) |
| `.arrow` | 箭头函数 | `() => {}` | `#f92672` (红色) |
| `.regexp` | 正则表达式 | `/pattern/gi` | `#f92672` (红色) |

## 五、HTML特定Token

| Class名 | 说明 | 示例 | 建议颜色 |
|---------|------|------|----------|
| `.tag` | 标签 | `<div>`, `</div>` | `#f92672` (红色) |
| `.name` | 标签名 | `<div>` 中的 `div` | `#f92672` (红色) |
| `.attr-name` | 属性名 | `class="..."` 中的 `class` | `#a6e22e` (绿色) |
| `.attr-value` | 属性值 | `class="container"` 中的 `container` | `#e6db74` (黄色) |
| `.attr` | 属性(通用) | 整个属性 | - |

## 六、CSS特定Token

| Class名 | 说明 | 示例 | 建议颜色 |
|---------|------|------|----------|
| `.selector-tag` | 标签选择器 | `div`, `body` | `#f92672` (红色) |
| `.selector-id` | ID选择器 | `#header` | `#a6e22e` (绿色) |
| `.selector-class` | 类选择器 | `.container` | `#a6e22e` (绿色) |
| `.selector-attr` | 属性选择器 | `[type="text"]` | `#a6e22e` (绿色) |
| `.selector-pseudo` | 伪类/伪元素 | `:hover`, `::before` | `#a6e22e` (绿色) |
| `.property` | CSS属性 | `color`, `margin` | `#66d9ef` (蓝色) |
| `.value` | 属性值 | `red`, `10px` | `#f8f8f2` (白色) |
| `.unit` | 单位 | `px`, `em`, `%` | `#ae81ff` (紫色) |

## 七、SQL特定Token

| Class名 | 说明 | 示例 | 建议颜色 |
|---------|------|------|----------|
| `.keyword` | SQL关键字 | `SELECT`, `FROM`, `WHERE` | `#f92672` (红色) |
| `.built_in` | 内置函数 | `COUNT()`, `SUM()` | `#66d9ef` (蓝色) |
| `.type` | 数据类型 | `VARCHAR`, `INT` | `#66d9ef` (蓝色) |

## 八、Bash/Shell特定Token

| Class名 | 说明 | 示例 | 建议颜色 |
|---------|------|------|----------|
| `.meta` | Shebang | `#!/bin/bash` | `#75715e` (灰绿) |
| `.variable` | 变量 | `$VAR`, `${VAR}` | `#f8f8f2` (白色) |
| `.built_in` | 内置命令 | `echo`, `cd`, `export` | `#a6e22e` (绿色) |

## 九、完整CSS规则模板（Monokai配色）

```stylus
// 基础背景和前景色
.article-entry pre,
.article-entry .highlight {
  background: #272822;
  color: #f8f8f2;
}

// 关键字
pre .keyword,
pre .keyword.control,
pre .keyword.operator {
  color: #f92672;
  font-weight: bold;
}

// 字符串
pre .string,
pre .string.quoted,
pre .template-string,
pre .char {
  color: #e6db74;
}

// 注释
pre .comment,
pre .comment.block,
pre .comment.line {
  color: #75715e;
  font-style: italic;
}

// 数字
pre .number,
pre .number.integer,
pre .number.float,
pre .number.hex,
pre .literal {
  color: #ae81ff;
}

// 函数
pre .function,
pre .function.call,
pre .title.function,
pre .title.function_ {
  color: #a6e22e;
}

// 内置函数
pre .built_in {
  color: #66d9ef;
}

// 类和类型
pre .class,
pre .title.class,
pre .title.class_,
pre .type,
pre .type.builtin {
  color: #66d9ef;
  font-style: italic;
}

// 变量
pre .variable,
pre .variable.parameter,
pre .params {
  color: #fd971f;
}

// 特殊变量
pre .variable.language {
  color: #fd971f;
  font-style: italic;
}

// 操作符
pre .operator {
  color: #f92672;
}

// 标点符号
pre .punctuation {
  color: #f8f8f2;
}

// 常量
pre .constant,
pre .constant.builtin {
  color: #ae81ff;
}

// 属性
pre .property,
pre .attribute,
pre .attr {
  color: #a6e22e;
}

// Java 注解
pre .annotation {
  color: #e6db74;
}

// Python 装饰器
pre .decorator,
pre .meta {
  color: #66d9ef;
}

// HTML 标签
pre .tag,
pre .name {
  color: #f92672;
}

// HTML 属性名
pre .attr-name {
  color: #a6e22e;
}

// HTML 属性值
pre .attr-value {
  color: #e6db74;
}

// CSS 选择器
pre .selector-tag,
pre .selector-id,
pre .selector-class,
pre .selector-attr,
pre .selector-pseudo {
  color: #a6e22e;
}

// CSS 属性
pre .property {
  color: #66d9ef;
}

// 正则表达式
pre .regexp {
  color: #f92672;
}

// 文档标签
pre .doctag {
  color: #a6e22e;
}

// 标题
pre .title,
pre .section {
  color: #a6e22e;
  font-weight: bold;
}

// 符号
pre .symbol {
  color: #66d9ef;
}

// 链接
pre .link {
  color: #ae81ff;
  text-decoration: underline;
}
```

## 十、使用建议

### 1. 渐进式实现

不需要一次性实现所有规则，可以按优先级分步实施：

**优先级1（核心）**：
- 关键字（keyword）
- 字符串（string）
- 注释（comment）
- 数字（number）
- 函数（function）

**优先级2（常用）**：
- 类型和类（type, class）
- 变量（variable）
- 操作符（operator）
- 内置函数（built_in）

**优先级3（语言特定）**：
- Java注解（annotation）
- Python装饰器（decorator）
- HTML标签（tag）
- CSS选择器（selector-*）

### 2. 测试方法

创建一个测试页面 `test-highlight.md`：

```markdown
---
title: 代码高亮测试
---

## Java
\`\`\`java
@Override
public static void main(String[] args) {
    int number = 42;
    String text = "Hello";
    System.out.println(text + number);
}
\`\`\`

## Python
\`\`\`python
@decorator
def hello(name: str) -> None:
    print(f"Hello, {name}!")
\`\`\`

## JavaScript
\`\`\`javascript
const greeting = (name) => {
    return \`Hello, \${name}!\`;
};
\`\`\`
```

### 3. 颜色主题参考

**Monokai**（当前推荐）：
- 背景：`#272822`
- 前景：`#f8f8f2`
- 关键字：`#f92672` (红色)
- 字符串：`#e6db74` (黄色)
- 函数：`#a6e22e` (绿色)
- 类型：`#66d9ef` (蓝色)
- 数字：`#ae81ff` (紫色)
- 注释：`#75715e` (灰绿)

**One Dark**：
- 背景：`#282c34`
- 关键字：`#c678dd` (紫色)
- 字符串：`#98c379` (绿色)
- 函数：`#61afef` (蓝色)

**GitHub**：
- 背景：`#ffffff`
- 关键字：`#d73a49` (红色)
- 字符串：`#032f62` (深蓝)
- 函数：`#6f42c1` (紫色)

---

**参考资源**：
- [Highlight.js GitHub](https://github.com/highlightjs/highlight.js)
- [Highlight.js 演示站点](https://highlightjs.org/static/demo/)
- [Monokai 配色方案](https://monokai.pro/)

