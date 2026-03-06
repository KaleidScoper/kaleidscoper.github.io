---
title: CSS绘制简易水滴
date: 2023-09-06 21:18:09
categories: [技术, 开发, Web开发]
tags: [HTML, CSS, 转载]
---

<b>前言：</b>

从B站看到一个有趣的教程，现在把实现它的代码放在这里。将下面的代码直接复制粘贴入一个.html文件保存并打开，即可得到一个简单的动态水滴💧。你可以自行修改动画中将要展现的border-radius效果，阴影范围，高光（即下文#water::before和#water::after两个）的形状和大小，以及动画播放的速度。

<!--more-->

```HTML
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>water</title>
    <style>
        *{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body{
            width: 100vw;
            height: 100vh;
            display: flex;
            justify-content: center;
            background-color: #00a8ff;
        }
        #water{
            margin-top: 200px;
            width: 300px;
            height: 300px;
            /*border: 1px solid #000000;*/
            border-radius: 23% 77% 55% 45% / 19% 51% 49% 81% ;
            box-shadow: inset 10px 20px 30px rgba(0,0,0,0.5),
                              10px 10px 20px rgba(0,0,0,0.3),
                              15px 15px 30px rgba(0,0,0,0.05),
                        inset -10px -10px 15px rgba(225,225,225,0.8);
            animation: action 5s linear infinite alternate;
        }
        #water::after{
            content: '';
            width: 20px;
            height: 20px;
            position: absolute;
            top: 240px;
            left: 48%;
            background-color: rgba(225,225,225,0.8);
            border-radius: 50% 50% 63% 37% / 54% 63% 37% 46% ;
            animation: action 5s linear infinite alternate;
        }
        #water::before{
            content: '';
            width: 10px;
            height: 10px;
            position: absolute;
            top: 265px;
            left: 47%;
            background-color: rgba(225,225,225,0.8);
            border-radius: 42% 58% 63% 37% / 63% 71% 29% 37% ;
            animation: action 5s linear infinite alternate;
        }
        @keyframes action{
            25%{
                border-radius: 72% 28% 55% 45% / 52% 31% 69% 48% ;
            }
            50%{
                border-radius: 32% 68% 36% 64% / 37% 58% 42% 63% ;
            }
            100%{
                border-radius: 64% 36% 80% 20% / 66% 39% 61% 34% ;
            }
        }
    </style>
</head>
<body>
    <dev id="water"></dev>
</body>
</html>
```

[点击查看示例。](/craft/water.html)
