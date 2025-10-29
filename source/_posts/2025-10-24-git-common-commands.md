---
title: Git常用命令速查（自用）
date: 2025-10-24 20:00:00
categories: [技术, 开发, 桌面开发]
tags: [Git, 教程, 计算机科学, 原创]
---

**前言：** 本人记忆力过于差，导致实习期间浏览器里堆满了搜索基础命令的选项卡。整理了实际工作中高频使用的命令在此，以飨自己。

<!--more-->

## 一、基础操作

### <b>列出所有分支</b>

查看项目中的分支是最基础的操作：

```sh
# 列出所有本地分支
git branch

# 列出所有分支（包括远程分支）
git branch -a
```

### <b>切换分支</b>

切换分支是Git最常用的操作之一。根据目标分支是否已存在，有两种情况：

```sh
# 当本地已存在分支B时，直接切换
git checkout B

# 当本地不存在分支B时
# 基于远程分支 origin/B 创建并切换到本地分支 B
git checkout -b B origin/B
```

**提示**：也可以使用`git switch`命令（Git 2.23+版本）：
```sh
# 切换到已存在的分支
git switch B

# 创建并切换到新分支
git switch -c B
```

### <b>查看分支从属关系</b>

在协作开发中，经常需要确认某个分支是否基于另一个分支创建。可以使用以下命令：

```sh
git merge-base --is-ancestor A B && echo "✅ B 基于 A 创建" || echo "⚠️ B 不是基于 A"
```

这个命令会检查分支B是否是从分支A衍生出来的。如果是，输出"✅ B 基于 A 创建"；否则输出"⚠️ B 不是基于 A"。

### <b>切换传输协议</b>

如果你需要在HTTPS和SSH协议之间切换（比如配置了SSH密钥后，想要免密推送），可以使用：

```sh
# 将远程仓库URL改为SSH协议
git remote set-url origin git@github.com:yourname/yourrepo.git

# 检查是否成功
git remote -v
```

**注意**：使用SSH协议前，需要先在GitHub/GitLab等平台配置SSH公钥。

### **全局切换传输协议**

你也可以让ssh成为你的Git的默认协议，日后所有操作都将使用ssh。

```sh
git config --global url."git@github.com:".insteadOf "https://github.com/"

# 当你想要切换回来时：
git config --global --unset url."git@github.com:".insteadOf
```

## 二、拉取更新

### <b>更新本地某个非当前分支</b>

有时候你正在分支A上工作，但需要更新分支B到最新状态。这时有两种方法：

**方法一：使用`git fetch`和`git branch -f`**

```sh
# 获取远程所有更新
git fetch

# 更新某个非当前分支（强制对齐远程）
git branch -f target-branch origin/target-branch
```

这种方法的优点是不需要切换分支，当前工作不受影响。

**方法二：切换过去再拉取**

```sh
# 切换到目标分支
git switch target-branch

# 拉取最新内容
git pull
```

这种方法更直观，适合需要检查目标分支内容的情况。

### <b>强制对齐远程分支</b>

如果你的本地分支出现了问题，或者需要完全放弃本地修改，可以强制对齐远程分支：

```sh
# a. 下载远程分支 B 的最新历史记录
git fetch

# b. 强制将本地分支 B 重置到远程分支 B 的最新提交
# ⚠️ 注意：这将永久性丢弃本地分支 B 上所有未推送到远程的提交！
git reset --hard origin/B
```

**警告**：`git reset --hard`是危险操作，会丢失所有未提交的修改和未推送的提交。使用前请确保你不需要这些内容，或者已经做好备份。

## 三、提交修改

### <b>将本地分支A的状态推送到远程分支B</b>

有时候你在本地分支A上开发，但需要将这些修改推送到远程的分支B（而不是远程分支A），可以使用：

```sh
git push origin A:B
```

这个命令的格式是`git push <远程仓库名> <本地分支>:<远程分支>`。它会将本地分支A的当前状态推送到远程仓库的分支B。

**使用场景**：
- 你在本地feature分支开发完成，想要推送到远程的dev分支
- 本地分支名和远程分支名不一致的情况
- 临时将某个分支的内容推送到另一个分支进行测试

**注意**：这个操作会覆盖远程分支B的内容，使用时要小心，确保不会影响他人工作。

## 四、其他实用命令

### <b>查看提交历史</b>

```sh
# 查看提交历史
git log

# 查看简洁的提交历史
git log --oneline

# 查看分支图
git log --graph --oneline --all
```

### <b>暂存当前修改</b>

当你需要临时切换到其他分支，但又不想提交当前的修改时：

```sh
# 暂存当前修改
git stash

# 恢复暂存的修改
git stash pop

# 查看暂存列表
git stash list
```

### <b>撤销操作</b>

```sh
# 撤销工作区的修改（未add）
git checkout -- <文件名>

# 撤销已add但未commit的修改
git reset HEAD <文件名>

# 修改最近一次commit的信息
git commit --amend
```

## 五、总结

建议根据自己的工作流程整理一份个人速查表，遇到不常用的命令可以随时查阅。

如果你对某个命令不熟悉，可以使用`git <命令> --help`查看详细文档。熟练掌握这些命令，能够大大提高开发效率。
