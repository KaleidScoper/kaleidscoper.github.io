---
title: JavaScript随机碎碎念
date: 2024-10-13 22:35:31
categories: [技术, 开发, Web开发]
tags: [JavaScript]
---

<b>前言：</b>装文艺用，用于在网页的某个位置显示一句诗。托管于[GitHub](https://github.com/KaleidScoper/random-quote)。可前往GitHub页面一键部署。

<!--more-->

## 正文

创建randomQuote.js文件如下：

```javascript
fetch('/txt文本的路径/quotes.txt')
    .then(response => response.text())
    .then(data => {
        // 将文件内容按行分割
        const lines = data.split('\n');
        // 随机选择一行
        const randomLine = lines[Math.floor(Math.random() * lines.length)];
        // 替换双空格为换行符
        const formattedLine = randomLine.replace(/  /g, '\n');
        // 查找页面上所有ID为randomText的元素，并更新其内容
        document.querySelectorAll('#randomText').forEach(element => {
            element.innerText = formattedLine;
        });
    })
    .catch(error => console.error('未能找到文本：', error));

```

展示的文本来自于一个txt文件的随机行（在上面给出的代码中，这个文本是本网站的quotes.txt）。将fetch函数的值改为你的文本文档的相对路径即可。

然后将此js脚本引入你的页面：

```html
<script src="/js脚本的路径/randomQuote.js"></script>
<div id="randomText"></div>
```

如此一来，以后想要修改脚本或者文本时，只需编辑randomQuote.js、quotes.txt（或者上传新文件覆盖之）即可，非常方便。

执行下列命令即可将我正在使用的文本文档（以个人口味收集）下载到你的服务器：

```bash
wget https://testgames.me/random-quote/quotes.txt
```

请注意文本中双空格为换行。如果你没有使用我在js脚本中给出的双空格换行，使用Ctrl+H搜索双空格，替换为你想用的换行符即可。
