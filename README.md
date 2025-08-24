# kaleidscoper.github.io

KaleidScoper testing his Hexo blog.

# 关于

我原本是采用 WordPress + VPS 的方案部署的博客，该方案优缺点如下：

1. 锻炼自己的全栈能力（更像缺点）；
2. 服务器控制权在你，所以能做一些很好玩的 web 小玩具；
3. WordPress 功能丰富，颜值和性能还可以；
4. 域名和服务器代价高昂；
5. 境内需要备案而境外太卡；
6. 并不“优雅”，我无数次想要是能一键 push 文章该有多爽。

而 Hexo + Github Page 就比较扬长避短：

1. 部署相对来说简单一点，成本也更低；
2. 一键 push 更新，更新博文连浏览器都不用开，还能反映到Github活跃度。
3. GitHub 提供 CDN ，国内访问速度比较好。

# 部署

仓 库 数：单仓库，工程文件与站点不分离，push不提交本地生成的静态网站`public`

构建方法：GitHub Page -> Action，具体代码位于`\.github\workflows\pages.yml`

总之先用一段时间再说。每个新功能更新将尽量留下说明文件。
