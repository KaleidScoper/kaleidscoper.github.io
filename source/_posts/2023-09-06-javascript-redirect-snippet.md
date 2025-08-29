---
title: JavaScript实现网页重定向
date: 2023-09-06 21:11:04
categories: [技术, 开发, Web开发]
tags: [HTML, JavaScript]
---

<b>前言：</b>以下代码是我从v50to.me这个有着可爱域名网站偷来的，进行了微小的修饰。它颇具幽默感的作者令他的网站在星期四时重定向至KFC官网，其他时候则定向至汉堡王、华莱士或麦当劳等官网。

<!--more-->

将这个文件加入你网站某个页面的head可以起到类似的效果。

```html
<script type="text/javascript">
  function Redirect()
  {
  var random = Math.round(Math.random()*10);
  var week = new Date().getDay();  
  if (random == 0) {
  window.location="https://www.cnhls.com/";
  }
  else if (week == 0) {  
  window.location="https://www.mcdonalds.com.cn/"; 
} else if (week == 1) {  
  window.location="https://www.mcdonalds.com.cn/"; 
} else if (week == 2) {  
  window.location="https://www.mcdonalds.com.cn/"; 
} else if (week == 3) {  
  window.location="https://www.bkchina.cn/";  
} else if (week == 4) {  
  window.location="https://m.kfc.com.cn/";
} else if (week == 5) {  
  window.location="https://www.mcdonalds.com.cn/"; 
} else if (week == 6) {  
  window.location="https://www.mcdonalds.com.cn/";  
} 
  }
  Redirect();
</script>

