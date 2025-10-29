---
title: 基于 WordPress + VPS 的建站教程
date: 2023-09-06 21:40:43
categories: [技术, 开发, Web开发]
tags: [Linux, Apache, 数据库, PHP, HTML, CSS, 原创]
---
<b>前言：</b> 阅读本教程不需要任何前置知识。我此前走了很多弯路，不希望后来者还把时间浪费在它们身上。按本教程操作，你将得到一个每年维护成本 ￥300 以下，基于 LAMP（Ubuntu22、Apache、MySQL、PHP）的 WordPress 博客，感受 Web 的精神以及它带来的自由。☝️🤓欸，那我为啥需要个WordPress博客呢，BB空间不香吗。理由有很多，一是如今海内外的社交媒体，个个是食贴兽，你写了那点玩意鬼知道哪天被吞了。二是如果你打算学点Web开发，直接从零开始搭个网站不现实，选择博客托管平台呢又锻炼不到，而WordPress能先帮你建个站出来，还不剥夺你的自定义空间。

<!--more-->

## 一、注册域名

一串典型的网址长下面这个样子：

```
https://testgames.me/mcserver
```

在“https://”后面有一个“testgames.me”，这就是域名（Domain），它<b>通常</b>指向某个网站。我们现在需要为你的网站注册一串这个东西。首先百度搜索“域名注册”，选一家服务商来采购，比如腾讯云、华为云、阿里云等，它们一般都有对新用户的优惠。在国内的平台注册域名需要实名，一般来说步骤不会太繁琐，本文不再单独讲述域名的实名、备案。

如果有能力，你也可以在一些境外的平台、或者小服务商注册域名，限制会更少，你可以选择一些海外的知名注册商，比如NameSilo。

选好服务商后就可以构思域名了。注册不同后缀的域名价格不一，一般来说，xxxx.top或.me这种域名后缀较为便宜，而xxxx.net或.com这种比较正式的域名贵一些。请不要使用.xyz这个域名后缀，由于被广泛应用于非法网站，现在人们（尤其是墙）对xyz的网站带有偏见。我个人建议随便挑一个￥200/年以下的域名来减小开支。

## 二、租用主机

目前你的域名没有指向任何一台挂载着Web服务的设备，这意味着如果有人在浏览器地址栏键入你的域名，什么也不会发生。为了能发生点什么，现在应该租用一台云主机（VPS）用来搭建网站，然后让域名指向这台主机的IP地址——通常是一串形如下面这个的数字：

```
163.197.247.117
```

在国内，较大的云主机服务商是阿里云、腾讯云、华为云等，大厂的服务安全性高、有客服用来压力、对新用户有优惠，但是需要实名认证、备案，流程非常缓慢，而且一个Whois查询能直接把你开了，又不方便又不隐私。

☝️🤓欸，那我直接去网上找各种“xx云”的广告推广，或者淘宝里的“免备”不就行了吗？很可惜，也不行。鉴于本人血与泪的教训，我极不建议你用小服务商的云主机用来建设博客：

- 小服务商经常超售、超开，使你选购的配置无法发挥正常性能；
- 售后较差，有跑路风险；
- 小服务商的用户鱼龙混杂，曾经使用此设备的人可能进行了非法活动，导致 IPV4 地址被注册商拉入黑名单，一旦你将珍贵的域名解析至这个不干净的 IP ，遭到ServerHold，那就写小作文跪求解封去吧(本人两次遭到ServerHold，零次解封成功)。

所以我们选择外网的云主机服务商，比如 LightNode 。挑选商品时，务必确保它具有独立 ipv4 地址。我建议选择一款2核2g的月付云主机即可，这是比较低的硬件配置。其中，2核指两个处理器核心，2g指2GB的内存（RAM），这是主要的两个性能指标。

2核2g + 1个IPv4地址 + 约几十G系统盘 + Ubuntu 22 系统镜像，这个套装售价大约是每月几十元。记得选择东亚地区的机器以确保连接速度。

租到了心仪的主机，得到了其公网ipv4地址之后，就可以去域名注册商那里将ip填入了。至此DNS服务就帮你把域名解析到这台主机的IP地址了。

## 三、如何使用云主机？

拥有云主机后，请先进入服务商提供的控制台，复制保存一下此主机的IP地址、root登录密码，再检查一下硬件配置是否如付款时所声称的那样。

接下来查看服务器安全组。
1. TCP 入方向：注意检查以下几个端口（port）是否放开：22（ssh端口）、80（http端口）、443（https端口）、3306（MySQL端口）。如果没有，可以手动为端口添加自定义TCP规则：入方向允许所有ip（即0.0.0.0/0）。
2. TCP 出方向：一般已经默认开放全部端口。

现在可以使用云主机了，为了方便，我们打开一款终端模拟器软件来进行后续操作，像是Windows Terminal、CMD，或者图形化的终端软件[Tabby](https://tabby.sh/)等等都可以。其他系统我不太熟悉，如果你使用的是Windows系列操作系统，按下Win+R组合键并输入cmd后敲击回车，就能打开CMD窗口。

一般用SSH命令（极个别的设备没有预装ssh，需要手动安装。而前面列出的Tabby等功能比较强大的终端模拟器，已经提供了图形化的ssh连接方式，不再需要每次手动输入命令，在此不做演示）连接服务器。

使用方法是在刚才你打开的窗口里输入下列内容后回车：

```bash
ssh root@你购买的云主机的IP
```

用户名一般是root。如果你的设备已经安装了ssh工具，现在就可以输入你的密码来连接。你输入的密码不会显示出来，但实际已经输入进去了。输入结束后敲击回车即可登入。

<b>注意！</b> 在后续操作过程中，你有可能操作失败后，直接重装系统回到这步试图重新操作。如果你这么做了，你可能发现ssh命令拒绝连接你的云主机，或者提示你遭到了中间人攻击。解决方法是打开这个路径：`C:\Users\你的用户名\.ssh`，删除文件夹内所有文件后即可恢复正常。

以下是几个日常高频使用的指令：

``` shell
ls #列出当前目录的所有内容
ll #也是列出当前目录的所有内容，但是包含详细信息，相当于ls -l

cd /var/www #前往www文件夹
cd .. #前往上一层文件夹，对于www文件夹，var就是上级文件夹
cd . #没有任何作用，因为.表示本层文件夹，而..表示上级文件夹

nano readme.txt #编辑readme.txt文件，如果没有则创建一个并编辑。请自行查询nano编辑器的使用方法
mkdir file #在此处新建file文件夹

rm readme.txt #删除readme.txt
mv readme.txt new.txt #重命名前者为后面的名字
mv readme.txt /root #剪切此文件到/root文件夹
cp readme.txt /root #复制此文件到/root文件夹

pwd #显示你当前所处的路径
whoami #显示当前用户，如果到目前为止一切正常，此命令应该输出root
ping baidu.com #测试你是否能访问baidu.com

exit #断开连接

#ctrl键+c键 此组合键会中止你当前执行的命令
#ctrl键+z键 挂起当前指令
#在终端中，选中文本点击右键才是复制，未选中文本时点击右键则粘贴
```

由于服务器的延迟和TUI文本编辑器繁琐的操作，实际上我们应避免使用命令在服务器编辑文件，而是把想编辑的文件下载下来编辑。

现在断开和云主机的连接，输入sftp并执行，预期会出现下面的内容（前面列出的Tabby等功能比较强大的终端模拟器，已经提供了图形化的sftp连接方式，不再需要每次手动输入命令，在此不做演示）：

```bash
usage: sftp [-46AaCfNpqrv] [-B buffer_size] [-b batchfile] [-c cipher]
          [-D sftp_server_path] [-F ssh_config] [-i identity_file]
          [-J destination] [-l limit] [-o ssh_option] [-P port]
          [-R num_requests] [-S program] [-s subsystem | sftp_server]
```

一般来说，sftp命令是系统自带的ssh工具的一部分。它登录的方式和ssh类似：

```bash
sftp root@你的云主机IP地址
```

输入密码后：

```bash
PS C:\Users\你的用户名> sftp root@你的云主机IP地址
root@你的云主机IP地址's password:
Connected to 你的云主机IP地址.
sftp>
```

在sftp模式下你可以把文件上传入服务器，或者从服务器下载文件。

在这种情况下，如果你直接执行刚才那些指令，都会在云主机被执行。而为它们加上<b>小写的L</b>前缀，可以在本地（你的电脑）执行（有些命令在本模式下不再支持执行）：比如ls命令会列出云主机当前文件夹可供下载的文件，而lls会列出当前你电脑所在文件夹里，可供上传的文件。你可以使用get readme.txt来下载一个名叫readme.txt的文件到你电脑当前所在文件夹，也可以用put readme.txt来把你刚才下载的文件上传回去。

现在我演示将云主机/root文件夹内的readme.txt下载到电脑桌面的全部操作。

```bash
sftp root@你的云主机IP地址

root@你的云主机IP地址's password:
Connected to 你的云主机IP地址.

sftp> ls
readme.txt
sftp> lls
此处会列出一系列你电脑上的文件夹
sftp> lcd Desktop
sftp> get readme.txt
sftp> lls
此处列出一系列桌面文件，其中有readme.txt
```

最后我们在电脑桌面发现了原本位于云主机上的readme.txt，说明下载成功。

能使用sftp后，我们就可以把要编辑的文件下载下来，在本地而不是云主机上编辑。待完成编辑后，再上传回去覆盖掉旧文件，这样的编辑方式更加方便。

## 四、安装Web服务器软件

现在我们终于开始了网站建设的第一步。我们需要选择一种Web服务器来负责接收用户请求、实现网站各种功能：这样的服务器有很多，比如Nginx、Apache和TomCat，我们选择Apache，这种服务器配置简单、功能强大，现在使用之前提到的ssh登录你的云主机，执行下面的命令安装Apache：

```bash
sudo apt update && sudo apt install apache2 --yes && sudo ufw allow in "Apache"
```

上面的命令完成了三件事情：

* 更新Linux系统软件包索引
* 安装Apache
* 设置系统防火墙，允许进入的流量通过Apache

现在去浏览器输入你的服务器ip地址，应该能看见Apache的默认页面。

## 五、安装MySQL

MySQL是一种广受欢迎的关系型数据库，我们WordPress网站的各种数据都存储在MySQL中。

```bash
sudo apt install mysql-server -y && sudo mysql
```

执行完上面的命令，你就进入MySQL数据库了。

接下来我们需要设置MySQL数据库的密码，在MySQL中输入以下代码，其中<b>PASSWORD必须替换成你自己的密码</b>。此为数据库root用户密码，后面会用到。

```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password by 'PASSWORD';
```

然后输入exit退出MySQL数据库。

执行成功后，你将返回到原来的VPS终端界面。接下来初始化MySQL，输入以下命令：

```bash
sudo mysql_secure_installation
```

在运行该命令后，会要求你输入密码，直接输入上面设置的密码即可。

然后，按照以下提示进行选择：

* 是否启用密码强度检查：选择Y。
* 密码强度要求：选择 0（代表最低强度，适合初学者；如果你有经验，可以选择 1 或 2）。
* 是否要重新设置root用户密码：选择N。
* 是否删除匿名用户：选择Y。
* 是否禁止root用户远程登录：选择Y。
* 是否删除测试数据库：选择Y。
* 是否刷新权限表：选择Y。

一切结束后，输入以下命令登入数据库：

```bash
mysql -u root -p
```

登入MySQL后，依次执行下面每一行MySQL语句，创建一个网站数据库。

```sql
CREATE DATABASE 数据库名称 DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci;

CREATE USER '数据库用户名'@'%' IDENTIFIED WITH mysql_native_password BY '数据库密码';

GRANT ALL ON 数据库名称.* TO '数据库用户名'@'%';

FLUSH PRIVILEGES;

EXIT;
```

请务必牢记你写下的“数据库名称”、“数据库用户名”、“数据库密码”，不要动除了汉字以外的部分。

现在将他们抄写下来，稍后建站时马上就会用到。

## 六、安装PHP

依次执行下列命令，将安装包括PHP的所有所需的文件、重启Apache。

```bash
sudo apt install php libapache2-mod-php php-mysql -y

sudo apt update -y && sudo apt install php-curl php-gd php-mbstring php-xml php-xmlrpc php-soap php-intl php-zip -y && sudo systemctl restart apache2
```

然后，运行以下命令以修改Apache配置文件，确保WordPress可以正常运行。**请将”我的域名”替换为你的域名**。

```bash
sudo nano /etc/apache2/sites-available/我的域名.conf
```

没有正常打开？说明你没有安装nano文本编辑器。

执行以下命令安装nano。

```bash
sudo apt install nano
```

在打开的文件中，粘贴以下配置，并将”我的域名”替换为你的域名：

```Apache
<VirtualHost *:80>
    ServerName 我的域名
    ServerAlias www.我的域名
    ServerAdmin webmaster@localhost
    DocumentRoot /var/www/wordpress
    ErrorLog ${APACHE_LOG_DIR}/error.log
    CustomLog ${APACHE_LOG_DIR}/access.log combined
    <Directory /var/www/wordpress/>
	    AllowOverride All
    </Directory>
</VirtualHost>
```

保存文件并退出文本编辑器，<b>Ctrl+x，接着按Y，然后按Enter回车键</b>退出。

然后启用新的网站配置，**其中”我的域名”需要替换为你的域名**：

```bash
sudo a2ensite 我的域名
```

最后，禁用默认网站，并重启Apache：

```bash
sudo a2dissite 000-default && sudo a2enmod rewrite && sudo a2enmod rewrite && sudo apache2ctl configtest && sudo systemctl restart apache2
```

## 七、安装网站程序

目前可选的网站程序（CMS）很多，我们在此选择WordPress，大名鼎鼎的星月号就是基于WordPress的网站。运行以下命令以下载WordPress文件，将保存在你的VPS中的/var/www/wordpress路径下：

```bash
cd /tmp && curl -O https://wordpress.org/latest.tar.gz && tar xzvf latest.tar.gz && touch /tmp/wordpress/.htaccess && cp /tmp/wordpress/wp-config-sample.php /tmp/wordpress/wp-config.php && mkdir /tmp/wordpress/wp-content/upgrade && sudo cp -a /tmp/wordpress/. /var/www/wordpress && sudo chown -R www-data:www-data /var/www/wordpress && sudo find /var/www/wordpress/ -type d -exec chmod 750 {} \; && sudo find /var/www/wordpress/ -type f -exec chmod 640 {} \;
```

运行以下命令获取随机字符串：

```bash
cd /var/www/wordpress && curl -s https://api.wordpress.org/secret-key/1.1/salt/
```

复制生成的随机字符串。

然后运行以下命令编辑WordPress配置文件，<b>删除原来的字符串，并将你的随机字符串替换到相应的位置</b>。

```bash
sudo nano /var/www/wordpress/wp-config.php
```

现在，<b>找到配置文件中的数据库用户名、密码和数据库名称，根据前面创建的MySQL用户和数据库信息进行相应的修改（比如我这里数据库是wordpress，用户名是wpuser，密码是wppassword）</b>。此外，还需要添加一个FS_METHOD，也就是下列内容：

PHP

```bash
define('FS_METHOD', 'direct');
```

保存文件后退出。

## 八、开始建设网站

现在可以在浏览器地址栏里面键入你的域名了，如果网站可以正常访问，表明你上面的操作都配置成功了。你将会看到WordPress的安装页面。待你选择完语言后，输入下列信息：

1. 数据库名称
2. 数据库用户名称
3. 数据库密码
4. 数据库主机，保持默认是localhost即可
5. 表格前缀，保持默认的_wp即可

现在回到VPS的控制台，首先我们要安装Certbot：

```bash
sudo apt install certbot python3-certbot-apache -y
```

接下来调整防火墙规则：

```bash
sudo ufw allow 'Apache Full' && sudo ufw delete allow 'Apache'
```

然后，启动Certbot来获取SSL证书：

```bash
sudo certbot --apache
```

Certbot会询问你的电子邮件地址，请确保输入你自己的邮箱地址。

接下来，你会被要求同意服务条款，输入”Y”表示同意。然后，它会问你是否愿意分享你的邮箱地址，你可以选择”N”不分享。接下来，它会问你要为哪些域名启用HTTPS，你可以直接按回车键，表示默认全选。打印“<b>Congratulations! You have successfully enabled HTTPS on</b>”，表明你的SSL证书就安装成功了。

至此，你的网站现在应该可以通过HTTPS访问了。
