---
title: Windows包管理Chocolatey
date: 2024-10-13 16:18:28
categories: [技术, 开发]
tags: []
---
计科新生大一开学，遇到的第一个麻烦事就是配环境。从下载、安装、配置环境，到以后更新、回滚、卸载都要手动操作，时间一久都把路径忘掉了，等换电脑时又得再享受一遍。

包管理器的方便之处就体现在这里了：它可以把配置环境、更新环境等等操作自动化。像自带包管理器的Linux各发行版一样，Windows也有适用于它的包管理器：Chocolatey。

Chocolatey[1](#2862beb1-6032-4e76-a84c-9cc4dd2d8982)，一个专为 Windows 系统设计的包管理器，类似于 Linux 系统中的 APT 或 MacOS 中的 Homebrew。它通过命令行界面提供了一种快速、高效的方式来处理软件包的安装、更新和管理。

以管理员身份打开PowerShell，运行下列命令安装Chocolatey：

```
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

使用它搜索软件：

```
choco search 软件包名称
```

安装、更新、卸载软件：

```
choco install 要安装的软件包名称 -y

choco upgrade 要更新的软件包名称 -y

choco uninstall 要卸载的软件包名称 -y
```

Chocolatey的默认下载路径为“C:\Program Files\”，你可以通过修改它的配置文件来更改下载路径：

```
choco config set cacheLocation "此处填绝对路径如D:\ChocolateyCache"
```

比如用它安装Java 22：

```
choco install openjdk --version=22.0.2 -y
```

从此你就基本告别了手动配置环境。

---

脚注：
