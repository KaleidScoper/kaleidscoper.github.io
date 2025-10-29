---
title: Beekeeper数据库管理软件
date: 2024-09-24 19:43:03
categories: [技术, 开发, 桌面开发]
tags: [数据库, 原创]
---
<b>前言：</b>Beekeeper Studio是一款开源免费（其社区版免费提供）的图形化数据库管理软件，在一众同类软件里，算是界面颜值比较高的了。十分推荐大家采用本软件远程连接自己的数据库。

<!--more-->

## 一、远程数据库配置

在远程连接数据库之前，请先确认自己是否在VPS的安全组、防火墙中放行了3306端口。

现在以root身份登入MySQL，我们需要为远程连接数据库创建一个专用的用户：

```Bash
mysql -u root -p
```

然后创建一个远程用户，命令中的%代表允许任何ip连接：

```SQL
CREATE USER '数据库用户名'@'%' IDENTIFIED WITH mysql_native_password BY '数据库密码';
```

将需要管理的数据库授权给该用户操作：

```SQL
GRANT ALL ON 数据库名称.* TO '数据库用户名'@'%';
```

配置完毕，现在查询所有MySQL用户的Host信息：

```SQL
SELECT User, Host FROM mysql.user;
```

如果输出的表格中显示了你新建的用户，其host为%，说明成功。

现在退出MySQL，编辑此MySQL配置文件：

```Bash
nano /etc/mysql/mysql.conf.d/mysqld.cnf
```

将其中的值bind-address从127.0.0.1修改为0.0.0.0后，保存并推出即可（即从监听本机改为监听所有ip）。

## 二、本地软件配置

通过此链接前往Beekeeper Studio官网，下载其社区版：<https://www.beekeeperstudio.io/get-community>

安装完毕后，在“新建连接”中选择你的数据库类型，比如MySQL，填写信息后，点击test按钮测试连接，一切正常后点击保存即可。

现在从左侧列表找到你新建的连接，右键选择连接，然后就可以图形化地管理你的数据库了。
