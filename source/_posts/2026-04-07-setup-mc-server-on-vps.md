---
title: 使用VPS搭建MC服务器
date: 2026-04-07 18:24:55
updated: 2026-10-05
categories: [杂谈,电子游戏]
tags: [我的世界,原创]
author: KaleidScoper
reward: true
---

**前言：**

本文于 2026 年 10 月 5 日再次更新，补充了 26.1、26.2 的存档迁移与备份方法，并更新了 Java 环境的说明。4 月更新时，关于手动搬动几个目录就能迁移存档的说明存在错误，现已更正。原文于 2024 年 10 月 2 日发布。

<!--more-->

## 一、租用云主机

租用云主机（VPS）用来搭建MC服务器有许多优点：

1. 24h开机。
2. 承载更多玩家。
3. 由于你拥有该VPS的完全操作权限，你可以使用同一台机器来搭建你的服务器官网、服务器在线地图、QQ群机器人等。专用的MC服务器托管服务商一般不会允许你架设网站，你的权限也受到严格限制。
4. 无需下载额外软件来管理服务器，你可以通过任何能联网的设备管理你的服务器。
5. 可以为你的服务器申请独具特色的域名。

与之相伴的缺点：

1. 服务器所有问题只能自己解决，没有客服供你泄愤。
2. 大服务商太贵。
3. 小服务商会偷偷超开超售，而且主频也太低。
4. 国内VPS想开网站需要备案。
5. 国外VPS很卡。

在这里我们可以选择淘宝的国内云主机服务商，比如各种xx云。选择服务商时注意“是否有独立ipv4地址”。我建议选择一款4核4g的云主机即可，这是大概够五个人玩纯净生存的硬件配置。随着玩家的增加，不能无脑地增加核心数与内存，而是同时选择主频更高的服务器。

操作系统可以选择Ubuntu 22.04或24.04 LTS。Java版本要根据服务端选择：1.21.x使用Java 21，本文涉及的26.1、26.2则需要Java 25。系统默认软件源里没有对应的Java，不等于这台机器无法安装，下面会给出安装方法。

现在假设你现在租到了心仪的主机，得到了其公网ipv4地址、root密码。

## 二、使用云主机

拥有云主机后，请先进入服务商提供的控制台，复制保存一下此主机的IP地址、root登录密码，再检查一下硬件配置是否如付款时所声称的那样。接下来查看服务器安全组，注意检查以下几个<b>端口</b>（port）是否放开（即允许TCP入方向规则）：22（ssh端口）、80（http端口）、443（https端口）、25565（MC服务器默认端口）、23333和24444（管理面板端口）。如果没有可以手动添加：【允许所有ip（即0.0.0.0/0），入方向，自定义TCP，端口范围填写需要的端口】即可。

现在可以使用云主机了。我在[使用LAMP建WordPress博客站](https://testgames.me/2023/09/06/49/#3rd)中详细叙述了最简单的使用方法，如果你觉得太长懒得看，现在给出省流版：（以Tabby为例）

在Tabby等软件中新增一个ssh连接，填入ip地址、密码，选择保存并连接即可进入VPS的终端界面。

现在假设你已经通过Xshell、Tabby或者CMD连接到了你的VPS。

## 三、配置云主机环境

这里以26.1、26.2服务端为例安装Java 25。这个要求从[26.1更新](https://www.minecraft.net/en-us/article/minecraft-java-edition-26-1)开始生效，不能继续照搬以前的Java 21安装命令。

在VPS终端界面依次执行下面的命令，添加[Adoptium官方软件源](https://adoptium.net/installation/linux/)，再安装Temurin版Java 25：

```bash
sudo apt update
sudo apt install -y wget apt-transport-https gpg ca-certificates

wget -qO - https://packages.adoptium.net/artifactory/api/gpg/key/public \
  | gpg --dearmor \
  | sudo tee /etc/apt/trusted.gpg.d/adoptium.gpg > /dev/null

echo "deb https://packages.adoptium.net/artifactory/deb $(awk -F= '/^VERSION_CODENAME/{print$2}' /etc/os-release) main" \
  | sudo tee /etc/apt/sources.list.d/adoptium.list

sudo apt update
sudo apt install -y temurin-25-jdk
java -version
```

最后一行用于查看Java版本，输出的主版本号应当是25。如果机器上装了多个Java，稍后还要检查管理面板中实例的启动命令，确认它实际调用的也是Java 25；仅仅在终端里看到25还不够。

现在安装MCSManager，这是一个图形化的管理面板，免去了繁琐的命令行操作。按照[官方文档](https://docs.mcsmanager.com/zh_cn/)执行：

```bash
sudo su -c "wget -qO- https://script.mcsmanager.com/setup_cn.sh | bash"
```

现在依次执行每行命令，设置开机自启、启动MCSmanager：

```bash
systemctl enable mcsm-{daemon,web}.service

systemctl start mcsm-{daemon,web}.service
```

现在可以访问MCSManager面板了。浏览器打开http://你的VPS的公网IP:23333即可，这串链接的意思是通过端口23333（也就是管理面板所监听的端口）访问你的服务器，例如http://123.123.123.123:23333

现在假设你已经进入了服务器管理面板，并查看了新手教程。

## 四、配置MC服务器

MC官网给出了[官方Java版服务端](https://www.minecraft.net/en-us/download/server)，这个服务端是不能安装插件、Mod的。我们以这个服务端为例配置MC服务器，前往官网下载所需版本的server.jar即可。如果需要某个固定版本，可以在对应版本的更新公告末尾找到“Minecraft server jar”链接，比如[26.2更新公告](https://www.minecraft.net/en-us/article/minecraft-java-edition-26-2)。

新开服务器可以选择合适的新版本；迁移已有服务器时，则应先确认目标版本以及Mod、数据包的兼容情况，不要看见“最新版”就直接覆盖旧服务端。

现在前往服务器管理面板，在应用实例中创建一个新的实例，选择Java版服务端->上传单个服务器软件，将server.jar上传即可。

首次运行通常会因为尚未同意Mojang的服务条款而退出，并生成eula.txt。阅读并同意条款后，在实例配置文件中将`eula=false`改为`eula=true`。如果要新建指定种子的世界，应当在生成世界前设置server.properties中的`level-seed`；如果要迁入旧存档，先不要急着开服，按下面的备份与迁移步骤操作。

## 五、Q&A

<b>Q：</b>服务器存档的格式是什么样的？

<b>A：</b>以下以原版Java版服务端为例，假设server.properties中的`level-name=world`，那么服务器根目录下的`world`就是这个世界的存档目录。Fabric通常沿用原版的目录结构。

1.21.x的主要结构如下，未列出的文件也属于存档，不要因此漏掉：

```text
world/
├── level.dat
├── level.dat_old
├── data/
├── playerdata/
├── advancements/
├── stats/
├── datapacks/
├── entities/
├── poi/
├── region/
├── DIM1/
│   ├── data/
│   ├── entities/
│   ├── poi/
│   └── region/
├── DIM-1/
│   ├── data/
│   ├── entities/
│   ├── poi/
│   └── region/
└── （其余文件已省略）
```

从26.1开始，存档结构发生了较大的调整。26.1、26.2的主要结构如下，各项变化可以查阅[官方更新说明中的World Storage一节](https://www.minecraft.net/en-us/article/minecraft-java-edition-26-1)：

```text
world/
├── level.dat
├── level.dat_old
├── data/
│   └── minecraft/
│       ├── world_gen_settings.dat
│       ├── game_rules.dat
│       ├── world_clocks.dat
│       ├── maps/
│       │   ├── 0.dat
│       │   ├── （其他地图编号）.dat
│       │   └── last_id.dat
│       └── （其余全局数据已省略）
├── players/
│   ├── data/
│   ├── advancements/
│   └── stats/
├── datapacks/
├── dimensions/
│   └── minecraft/
│       ├── overworld/
│       │   ├── data/
│       │   ├── entities/
│       │   ├── poi/
│       │   └── region/
│       ├── the_end/
│       │   ├── data/
│       │   ├── entities/
│       │   ├── poi/
│       │   └── region/
│       └── the_nether/
│           ├── data/
│           ├── entities/
│           ├── poi/
│           └── region/
└── （其余文件已省略）
```

换句话说，三个维度的数据现在放到了同一层级，玩家数据也集中到了`players`里，但这不代表`dimensions`就是整个存档。建筑、地形还在，只能说明相应区块还在，不能说明出生点、玩家进度、统计信息和地图物品的数据也都完整。

尤其要区分两个`data`：存档根目录的`data`存放跨维度共享的数据，各维度内部的`data`存放该维度自己的数据。旧版根目录的`data`混合了这两类内容，不能把它整个搬进主世界的维度目录。新版还会把部分原本位于`level.dat`中的内容拆成独立文件，例如世界生成设置、游戏规则等。只保留`level.dat`也不够。

**原文“把四个目录按新规则搬过去就能打开”的说法不成立。** 对于目标版本支持升级的完整原版存档，应当保留原有结构，让服务端自己完成升级。目录示意图仅供参考，从 1.* 时代升级到 26.* 时代，存档格式已经不是仅靠移动目录就能完成，所以不是很建议你手动改造旧存档。

<b>Q：</b>如何正确备份、迁移或者升级存档？

<b>A：</b>现在假设你准备将一台VPS上的原版服务器迁到另一台VPS，并升级为新版原版或者Fabric服务器。可以只通过管理面板完成，不要求使用ssh。

1. 先确认目标MC版本需要的Java、Fabric Loader、Mod和数据包版本，并查看它们的升级说明。有自定义方块、物品或者维度的Mod，不能在迁移时随意删掉。条件允许时，先在副本上完成同版本搬家或更换服务端并验证，再升级游戏版本，出了问题更容易定位。
2. 检查新旧机器的剩余磁盘空间，要留出保存世界、打包、解压和升级时产生额外文件的余量。不要为了在原机器上放一份压缩包，反而把磁盘塞满。如果已经出现过存储不足或保存报错，先处理并检查存档；打包成功不会让已经损坏的数据自动恢复。
3. 正常关闭旧服务器，等待保存完成、进程退出。可以在控制台输入`stop`，或使用面板的正常停止功能，不要强制结束进程。停服后再复制、压缩、下载文件，备份期间也不要让面板自动重启实例。
4. 最省事的办法当然是备份整个服务端目录，并把备份下载到本地或另一台机器。不过一般我们没必要这么做，只要能保留完整的`world`，以及server.properties、白名单、管理员名单、Mod或插件及其配置，并另行记下启动命令和Java、服务端版本，就可以完成迁移。对于打算玩很久的服务器，我建议保留几份不同日期的备份，供你和朋友缅怀光辉岁月。
5. 在新机器上准备好对应的运行环境和服务端。为了生成配置文件而提前启动过一次没有关系，但之后必须完全停服。在确认旧服完整备份已经下载并验证后，删除新机器自动生成的整个`world`，再上传旧服完整的`world`。不要把旧世界的几个目录覆盖进新生成的世界里。
6. 检查上传后的路径和配置。服务器根目录下应当直接出现`world/level.dat`，不能多套一层变成`world/world/level.dat`；`level-name`要指向实际的存档目录，`online-mode`等玩家身份设置应与原服一致。如果使用代理，也要核对身份转发配置，否则同一名玩家可能被识别成另一个UUID，看起来像背包和进度丢失。原有存档**通常**不需要靠重新填写种子来保证种子的一致性。
7. 先限制玩家进入，启动新服，让目标版本处理完整存档的升级，并查看日志是否有加载或保存失败。进游戏检查三个维度、主要建筑、实体、玩家背包和末影箱、进度与统计、展示框中的地图，再核对世界种子和默认出生点。出生点有随机落点范围，不能凭玩家重生的位置判断它是否改变，应该把物品（建议是末影珍珠，或者下落的重力方块）从末地扔进传送门，它的落点将是世界出生点，而不是玩家的床或者随机位置。确认正常后才正式开放。一旦世界出生点改变，说明存档的种子因故发生了改变，需要立刻排查。
8. 升级前的完整备份最好继续保留。

如果只在原VPS上升级，就不需要重新上传世界。停服并完成上述备份后，按目标版本的要求更新Java、服务端和相关Mod，保留完整存档，再做同样的测试。

这里的完整存档指的是同一次停服后的整份世界。缺少文件时，不能随便从其他日期的备份里挑几个补进去：地图编号、玩家状态和世界进度可能已经发生变化。那属于故障修复，需要逐项比对，不是正常升级的步骤。

如果你使用的是Paper、Spigot或其他服务端，先查对应服务端、对应版本的迁移说明。比如[Paper官方迁移文档](https://docs.papermc.io/paper/migration/)就区分了26.1前后的操作；旧教程里移动`world_nether`、`world_the_end`的做法，不能直接套在所有版本上。

<b>Q：</b>地图物品还在，为什么会显示“未知地图”？

<b>A：</b>这里的“地图”指拿在手里或者放在物品展示框中的地图物品，和整个世界的地形不是一回事。物品保存着地图编号，实际图像等数据另存在文件里。如果对应文件丢失、损坏或放错位置，就可能出现物品还在，却无法显示内容的情况。

在26.1、26.2原版存档中，这些文件位于`world/data/minecraft/maps/`，例如编号0对应`0.dat`，编号计数保存在`last_id.dat`。旧版的`map_0.dat`和`idcounts.dat`不应该直接塞进某个维度的`data`里，也不要仅修改文件名就假定完成了迁移。正常升级应当让服务端转换完整的旧存档。

顺便一提，通过面板上传时，特别注意它当前打开的是哪一层目录。上传整个`maps`文件夹时，应当打开父目录`world/data/minecraft/`；如果已经打开了`world/data/minecraft/maps/`，就上传里面的文件。最终应当能直接找到`world/data/minecraft/maps/0.dat`，不要多出一层`maps/maps/`。整份`world`的上传也是同样的道理。

<b>Q：</b>如何更换服务器图标？

<b>A：</b>使用管理面板的文件管理功能，将你准备用来作为服务器图标的64*64的png图片，重命名为server-icon.png后，上传至服务器根目录即可。
