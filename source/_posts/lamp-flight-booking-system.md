---
title: 基于LAMP的机票预订系统
date: 2024-10-09 17:05:49
categories: [技术, 开发, Web开发]
tags: [PHP, 数据库, HTML, CSS]
---
**前言：**这是安徽大学“数据库实验”（大三秋冬）期末作业，是一个演示性质的机票预订系统。代码托管于Github，可通过下方命令下载：

Bash

```
git clone https://github.com/KaleidScoper/LAMP_Flight_Booking.git
```

## 目录

1. [环境要求](#环境要求)
2. [功能演示](#功能演示)

## 一、环境要求

开发及测试环境如下：

* **Ubuntu** 22.04 **VPS**
* **Apache** 2.4.52 (Ubuntu)
* **MySQL** 8.0.39-0ubuntu0.22.04.1
* **PHP** 8.1.2-1ubuntu2.18
* 开放端口3306（TCP，MySQL默认端口）

## 二、功能演示

项目包含下列页面：

* 登录页面[login.php](https://github.com/KaleidScoper/LAMP_Flight_Booking/blob/main/src/login.php)
* 注册页面[register.php](https://github.com/KaleidScoper/LAMP_Flight_Booking/blob/main/src/register.php)
* 个人主页[welcome.php](https://github.com/KaleidScoper/LAMP_Flight_Booking/blob/main/src/welcome.php)（可查看航班、登出）
* 机票查询[show_ticket.php](https://github.com/KaleidScoper/LAMP_Flight_Booking/blob/main/src/show_ticket.php)（可在此页面退票）

只实现了最基础的演示功能：用户注册、登录、注销，机票的预订和退订，展示航班列表和个人所订机票列表。用于糊弄官差。
