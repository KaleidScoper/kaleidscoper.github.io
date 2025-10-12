---
title: 关于
date: 2025-03-19 12:00:00
layout: page
---

<style>
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 30px;
  margin: 20px 0;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  display: flex;
  align-items: center;
  gap: 30px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.glass-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: var(--bg-image);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 20px;
  z-index: 0;
}

.glass-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 20px;
  z-index: 1;
}

.glass-card > * {
  position: relative;
  z-index: 2;
}

.glass-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.5);
}

.profile-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  cursor: pointer;
}

.profile-avatar::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    transparent 0%,
    transparent 40%,
    rgba(255, 255, 255, 0.9) 50%,
    transparent 60%,
    transparent 100%
  );
  transform: translateX(-100%) translateY(-100%) rotate(45deg);
  transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  z-index: 2;
  pointer-events: none;
}

.profile-avatar:hover {
  transform: scale(1.05) rotate(2deg);
  box-shadow: 
    0 8px 32px 0 rgba(31, 38, 135, 0.37),
    0 4px 16px 0 rgba(31, 38, 135, 0.2),
    0 0 0 1px rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
}

.profile-avatar:hover::before {
  transform: translateX(100%) translateY(100%) rotate(45deg);
}

.profile-avatar img {
  position: relative;
  z-index: 0;
}

.avatar-link {
  display: inline-block;
  text-decoration: none;
  transition: all 0.3s ease;
}

.avatar-link:hover {
  text-decoration: none;
}

.profile-info {
  flex: 1;
  color: #f8f9fa;
}

.profile-name {
  font-size: 28px;
  font-weight: bold;
  margin: 0 0 10px 0;
  color: #ffffff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.profile-title {
  font-size: 18px;
  color: #e9ecef;
  margin: 0 0 15px 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.profile-desc {
  font-size: 16px;
  line-height: 1.6;
  color: #f1f3f4;
  margin: 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

@media (max-width: 768px) {
  .glass-card {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }
  
  .profile-avatar {
    width: 100px;
    height: 100px;
  }
  
  .profile-avatar:hover {
    transform: scale(1.08) rotate(1deg);
    box-shadow: 
      0 8px 32px 0 rgba(31, 38, 135, 0.37),
      0 4px 16px 0 rgba(31, 38, 135, 0.2),
      0 0 0 1px rgba(255, 255, 255, 0.2);
  }
  
  .profile-name {
    font-size: 24px;
  }
  
  .profile-title {
    font-size: 16px;
  }
}
</style>

<div class="glass-card" data-bg style="--bg-image: url('/images/about-background.jpg')">
  <a href="/" class="avatar-link">
    <img src="/waifu/img/fanghe.jpg" alt="" class="profile-avatar">
  </a>
  <div class="profile-info">
    <h2 class="profile-name">Kaleid Scoper</h2>
    <p class="profile-title">安徽大学 | 博主</p>
    <p class="profile-desc">
      欢迎来到我的博客！我是Kale，一名信息安全专业的本科生。此博客将作为我的电子日记本，用于堆放我本人写的一些没用的内容。祝您拥有美好的一天。
    </p>
  </div>
</div>

本站曾经采用 WordPress + VPS 搭建，现换用 Hexo + GitHub Page 搭建，详情请前往[本站 GitHub 仓库页面](https://github.com/KaleidScoper/kaleidscoper.github.io)查看。我保证本站无任何评论审核、封禁、禁言、敏感词条等规则，这也意味着网站内可能出现非预期的恶意内容。<b>您在此处发布的内容最好遵守您居住地的相关法律法规。</b>

**隐私政策：**

- 当您留下评论时，我可能会收集评论表单数据、您的IP地址、浏览器UA等信息。
- 当您上传包含“嵌入地理位置信息（EXIF）”的图片，此网站的访客将可以下载并提取图片中的位置信息。
- 除非您或公安机关要求我提供、删除您的个人数据，否则您留下的任何信息将被无限期保存。
- 此站点上的文章可能会包含嵌入的内容（如视频、图片、文章等）。来自其他站点的嵌入内容的行为和您直接访问这些其他站点没有区别。这些站点可能会收集关于您的数据、使用cookies、嵌入额外的第三方跟踪程序，监视您与这些嵌入内容的交互，包括在您有这些站点的账户并登录了这些站点时，跟踪您与嵌入内容的交互。我对此不提供技术支持、也不负任何责任。
- 此博客上所有我的原创内容，均采用 [知识共享署名-相同方式共享 4.0 国际许可协议](https://creativecommons.org/licenses/by-sa/4.0/deed.zh) 进行许可。
- <b>*When you share, everyone wins.*</b>

**查成分：**

- **游戏：**
  - Minecraft
  - 饥荒联机版
  - 三国杀（手杀）
  - P 社

- **二次元坑：**
  - 咒术
  - 芙莉莲
  - 电锯人
  - 波兰球
  - R&M

- **三次元坑：**
  - 冷媒 Airsoft
  - 乐高
  - 倭刀
  - 汝瓷
  - 汉服

- **键政：**
  - 左翼民粹主义
  - 历史情景主义
  - 海盗党

- **其他：**
  - INTP
  <!-- - IQ 138（经 [Mensa Norway](https://test.mensa.no/) 测试）-->
  - AHU 信息安全专业本科生
  - AHU Minecraft 社区成员
  - [Red Pixiv Union](https://www.pixiv.net/) 管理员
  - [中国秦皇岛 Steam 群组](https://steamcommunity.com/) 管理员
  - 河坝黄牌
  - 三国杀业余一段（？）
