# Codex、Claude Code Token消耗统计Skills 使用说明

## Codex、Claude Code Token消耗统计Skills 使用说明

## 一、简介

_本Skills工具专为AI代码开发场景打造，可__按照T+1维度__**统计、记录、汇总Codex、Claude Code**__开发工具的Token消耗数据，涵盖输入Token、输出Token、总Token消耗等核心指标，帮助研发团队清晰掌控AI编码资源消耗、规范AI工具使用标准。_

_工具全程无侵入适配Codex、Claude Code常规使用流程，无需修改原有编码操作，自动采集数据并可视化展示，轻量化、易部署、易使用。_

Trae企业版本的用户不用担心，这部分数据已经默认完成对接及数据统计上报。

Cursor工具的统计个人版本已经确定无法统计。

Trae个人版本已经明确无法支持上报。

## 二、Skills下载地址(2026.6.23日更新)

_可通过以下地址获取最新稳定版统计Skills安装包/源码：_

_**官方下载地址**_   http://bap.supcon.com:1236/f/cc134068e5a2478ea517/?dl=1

## 三、安装方式

_本工具安装流程简单，支持一键部署，分为通用安装步骤，适配全平台环境：_

### 1. 前置条件

*   _已正常安装并可使用Codex、Claude Code工具_
    
*   _在公司内网情况下__，支持工具数据上报与本地记录_
    
*   _兼容系统：Windows 10+/Mac OS 11+主流发行版_
    
*   **本地需要提前安装好nodejs**
    
*   **git config --list 可以查看下user.name，需要为域账号，如果不对，可以通过**git config \--global user.name "实际的域账号"进行配置
    

### 2. Windows详细安装步骤

1.  _从上述下载地址获取工具安装文件，解压至C盘/用户/自己的姓名/.codex/skills路径下面，注意层级路径；_
    

_其中执行upload-usage-all.bat会__立刻__上传所有的记录，_

_执行register-usage-upload-task.bat会将上报任务自动注册到windwos任务调度中心，每天早上九点__自动__执行。_

### ![picture](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/1GXn45KopgZYDqDQ/img/8ac1fc24-19fe-4163-b3ab-414627bf7d34.png)

### 3. Mac系统安装步骤

1.  右键Finder，选择前往文件夹，输入相对路径：_~/.codex/_
    
    ![picture](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/1GXn45KopgZYDqDQ/img/c920726c-da19-4b90-9f86-082d2af60683.png)
    
2.  在codex安装目录下：_.codex_ _->_ _skills__，将下载的__usage-reporter__文件夹拖入__skills__文件中。如果没有__skills__文件，手动创建。_
    
    ![picture](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/1GXn45KopgZYDqDQ/img/a8926c04-9819-4ebd-9e47-1c989ce75c7b.png)
    
3.  注意事项！
    

*   下载下来的_usage-reporter.zip__文件中，Mac系统使用的文件是：__upload-usage-all-macos.command__（上传脚本）、__register-usage-upload-task-macos.command__（定时任务注册脚本，每天9点上传使用记录）_ 
    
*   _因Mac系统安全策略，这2个脚本会被识别为非商店脚本应用，首次打开会报错，提示上报失败。需要手动调整权限策略。_
    
*   直接双击_upload-usage-all-macos.command__脚本，提示：_
    

![picture](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/1GXn45KopgZYDqDQ/img/672d7508-e044-41e1-a0b9-0bf2f0815668.png)

*   _在_ _**“系统设置” > “隐私与安全性”**_ _页面的“安全性”区域__，点击仍然打开_
    

![picture](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/1GXn45KopgZYDqDQ/img/caec667e-231a-43d1-a7e2-b25b8aa39181.png)

*   然后在终端输入命令设置文件权限：_chmod +x_ _(注意这里有个空格) + 将脚本文件直接拖动终端会自动识别文件路径_
    

![picture](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/1GXn45KopgZYDqDQ/img/adeb18ac-1f60-4e5b-b7a7-9be1ce3f778a.png)

*   完成上述操作后，双击脚本，显示正常运行则表示设置完成。另一个注册脚本同理。
    

![picture](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/1GXn45KopgZYDqDQ/img/679422fb-4313-4ed3-b8bc-d70fefc5978c.png)

## 四、功能使用介绍

_工具安装生效后，将__**全程静默运行**__，无需手动触发，自动__统计__所有Codex、Claude Code的__消耗token__：_![picture](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/1GXn45KopgZYDqDQ/img/42fdb173-95fb-4f12-ac91-053101de425f.png)http://supdt.supcon.com:9903/token\_usage  HGT事业部范围内，使用自己的域账号即可登录访问使用。**看板数据存在结转时延，在每个整点会自动更新看板数据。**