---
title: 使用LAMP建WordPress博客站
date: 2023-09-06 21:40:43
categories: [技术, 开发, Web开发]
tags: [Linux, Apache, 数据库, PHP, HTML, CSS]
---
<b>前言：</b>阅读本教程不需要任何前置知识。我此前走了很多弯路，不希望后来者还把时间浪费在它们身上。按本教程操作，你将得到一个每年维护成本￥300以下，基于LAMP（Ubuntu22、Apache、MySQL、PHP）的WordPress博客（类似本站），感受Web的精神以及它带来的自由。本文阅读时长可能超过一个小时，有任何问题请直接在评论区讨论。注意：你并不需要现在就准备300元钱，完成本教程支出可能不超过100元。

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

在国内，较大的云主机服务商是阿里云、腾讯云、华为云等，大厂的服务安全性高、种类繁杂、对新人有优惠，但是需要实名认证、备案，流程缓慢。那么，你是否应该去网上寻找诸如“xx云”的广告推广，或是淘宝里的“免备”云主机？并不应该。

我极不建议你选购小服务商的云主机用来建设博客的原因如下：

* 小服务商经常超售、超开，使你选购的配置无法发挥最好性能；
* 小服务商的用户鱼龙混杂，曾经使用此机器的人可能进行了非法活动，导致ipv4地址被注册商拉入黑名单；
* 售后较差，跑路风险高。

在这里我们可以选择外网的云主机服务商，比如LightNode。选择服务商时注意“是否有独立ipv4地址”，以方便新手建站。我建议选择一款2核2g的月付云主机即可，这是比较低的硬件配置。其中，2核指两个处理器核心，2g指2GB的内存（RAM），这是主要的两个性能指标。2核2g+<b>1个IPv4地址</b>+附赠的大约几十G系统盘+3Mbps峰值带宽/按量付费+Ubuntu22系统镜像（推荐使用此操作系统），这个套装售价大约是每月几十元。

我们假设你现在租到了心仪的主机，得到了其公网ipv4地址。现在去域名注册商那里将ip填入就可以了。至此DNS服务就帮你把域名解析到这台主机的IP地址了。

## 三、如何使用云主机？

拥有云主机后，请先进入服务商提供的控制台，复制保存一下此主机的IP地址、root登录密码，再检查一下硬件配置是否如付款时所声称的那样。接下来查看服务器安全组，注意检查以下几个<b>端口</b>（port）是否放开（即允许TCP入方向规则）：22（ssh端口）、80（http端口）、443（https端口）、3306（MySQL端口）。如果没有可以手动添加，允许所有ip（即0.0.0.0/0），入方向，自定义TCP，端口范围填写需要的端口即可。

现在可以使用云主机了，为了方便，我们打开一款<b>终端模拟器</b>软件来进行后续操作，像是Windows Terminal、Tabby、或Termux，以及陈旧的CMD都可以。其他系统我不太熟悉，如果你使用的是Windows系列操作系统，按下Win+R组合键并输入cmd后敲击回车就能打开CMD窗口。

我建议你像我一样用<b>SSH</b>这种简单、方便的连接命令，它的使用方法是在刚才你打开的窗口里输入ssh后回车（前面列出的Tabby等功能比较强大的终端模拟器，已经提供了图形化的ssh连接方式，不再需要每次手动输入命令，在此不做演示）。如果你的设备已经安装了ssh工具，CMD预计会给出以下输出：

```
usage: ssh [-46AaCfGgKkMNnqsTtVvXxYy] [-B buffer_size] [-b bind_address] [-c cipher_spec] [-D [bind_address:]port]
           [-E log_file] [-e escape_char] [-F configfile] [-I pkcs11]
           [-i identity_file] [-J [user@]host[:port]] [-L address]
           [-l login_name] [-m mac_spec] [-O ctl_cmd] [-o option] [-p port]
           [-Q query_option] [-R address] [-S ctl_path] [-W host:port]
           [-w local_tun[:remote_tun]] destination [command]
```

极个别的设备没有预装ssh，需要手动安装。

现在输入以下命令连接你的云主机：

```
ssh root@你购买的云主机的IP
```

<b>注意！</b>（如果你是第一次执行刚才的命令，请无视本提示）<b>在后续操作过程中，你有可能操作失败后，想通过重装系统，来回到这步试图重新操作。如果你这么做了，你可能发现ssh命令拒绝连接你的云主机。</b>如果这发生了，按这个路径打开C:\Users\你的用户名\.ssh进入到一个叫.ssh的文件夹，删除里面的所有文件后即可恢复正常。

然后输入你的密码来连接。你输入的密码不会显示出来，但实际已经输入进去了，输入结束后敲击回车即可完成。这期间操作界面可能看起来是下面的样子：

```
PS C:\Users\你的电脑用户名> ssh root@你的云主机IP地址
root@你的云主机IP地址's password:
Last failed login: Thu Feb 16 03:44:26 UTC 2023 from 某个不怀好意的IP地址 on ssh:notty
There were 114514 failed login attempts since the last successful login.
Last login: Thu Feb 16 03:40:08 2023 from 你自己的IP（有可能是）
[root@云主机名，可能是字母和数字串 ~]#
```

现在你已经成功登入云主机。

以下是几个日常高频使用的指令，你最好记住它们。

```
ls 列出当前目录的所有内容
ll 也是列出当前目录的所有内容，但是包含详细信息，相当于ls -l
cd /var/www 前往www文件夹
cd .. 前往上一层文件夹，对于www文件夹，var就是上级文件夹
cd . 没有任何作用，因为.表示本层文件夹，而..表示上级文件夹
rm readme.txt 删除readme.txt
mv readme.txt fuckme.txt 重命名前者为后面的名字
mv readme.txt /root 剪切此文件到/root文件夹
cp readme.txt /root 复制此文件到/root文件夹
pwd 显示你当前所处的路径
whoami 显示当前用户（如果到目前为止一切正常，此命令应该输出root）
ping baidu.com 测试你和baidu.com是否还可以联通
mkdir file 在此处新建file文件夹
vi readme.txt 编辑readme.txt文件，如果没有则创建一个并编辑。
              命令执行后，按i进入编辑模式，按Esc后输入:wq后回车可保存退出
              注意是输入:wq而不是wq
ctrl键+c键 此组合键会中止你当前执行的命令，别把它当复制用！
ctrl键+z键 挂起当前指令
exit 断开连接
```

你可能发现vi命令似乎格外复杂。

由于服务器的延迟和vi编辑器繁琐的操作，实际上我们不应使用这个命令在服务器编辑文件，而是把想编辑的文件下载下来（或者你可以安装一些更好用的文本编辑器，比如nano）。

现在断开和云主机的连接，输入sftp并执行，预期会出现下面的内容（前面列出的Tabby等功能比较强大的终端模拟器，已经提供了图形化的sftp连接方式，不再需要每次手动输入命令，在此不做演示）：

```
usage: sftp [-46AaCfNpqrv] [-B buffer_size] [-b batchfile] [-c cipher]
          [-D sftp_server_path] [-F ssh_config] [-i identity_file]
          [-J destination] [-l limit] [-o ssh_option] [-P port]
          [-R num_requests] [-S program] [-s subsystem | sftp_server]
```

一般来说，sftp命令是系统自带的ssh工具的一部分。它登录的方式和ssh类似：

```
sftp root@你的云主机IP地址
```

输入密码后：

```
PS C:\Users\你的用户名> sftp root@你的云主机IP地址
root@你的云主机IP地址's password:
Connected to 你的云主机IP地址.
sftp>
```

在sftp模式下你可以把文件上传入服务器，或者从服务器下载文件。

在这种情况下，如果你直接执行刚才那些指令，都会在云主机被执行。而为它们加上<b>小写的L</b>前缀，可以在本地（你的电脑）执行（有些命令在本模式下不再支持执行）：比如ls命令会列出云主机当前文件夹可供下载的文件，而lls会列出当前你电脑所在文件夹里，可供上传的文件。你可以使用get readme.txt来下载一个名叫readme.txt的文件到你电脑当前所在文件夹，也可以用put readme.txt来把你刚才下载的文件上传回去。

现在我演示将云主机/root文件夹内的readme.txt下载到电脑桌面的全部操作。

```
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

```
sudo apt update && sudo apt install apache2 --yes && sudo ufw allow in "Apache"
```

上面的命令完成了三件事情：

* 更新Linux系统软件包索引
* 安装Apache
* 设置系统防火墙，允许进入的流量通过Apache

现在去浏览器输入你的服务器ip地址，应该能看见Apache的默认页面。

## 五、安装MySQL

MySQL是一种广受欢迎的关系型数据库，我们WordPress网站的各种数据都存储在MySQL中。

```
sudo apt install mysql-server -y && sudo mysql
```

执行完上面的命令，你就进入MySQL数据库了。

接下来我们需要设置MySQL数据库的密码，在MySQL中输入以下代码，其中<b>PASSWORD必须替换成你自己的密码</b>。此为数据库root用户密码，后面会用到。

SQL

```
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password by 'PASSWORD';
```

然后输入exit退出MySQL数据库。

执行成功后，你将返回到原来的VPS终端界面。接下来初始化MySQL，输入以下命令：

```
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

```
mysql -u root -p
```

登入MySQL后，依次执行下面每一行MySQL语句，创建一个网站数据库。

SQL

```
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

```
sudo apt install php libapache2-mod-php php-mysql -y

sudo apt update -y && sudo apt install php-curl php-gd php-mbstring php-xml php-xmlrpc php-soap php-intl php-zip -y && sudo systemctl restart apache2
```

然后，运行以下命令以修改Apache配置文件，确保WordPress可以正常运行。**请将”我的域名”替换为你的域名**。

```
sudo nano /etc/apache2/sites-available/我的域名.conf
```

没有正常打开？说明你没有安装nano文本编辑器。

执行以下命令安装nano。

```
sudo apt install nano
```

在打开的文件中，粘贴以下配置，并将”我的域名”替换为你的域名：

Apache

```
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

```
sudo a2ensite 我的域名
```

最后，禁用默认网站，并重启Apache：

```
sudo a2dissite 000-default && sudo a2enmod rewrite && sudo a2enmod rewrite && sudo apache2ctl configtest && sudo systemctl restart apache2
```

## 七、安装网站程序

目前可选的网站程序（CMS）很多，我们在此选择WordPress。运行以下命令以下载WordPress文件，将保存在你的VPS中的/var/www/wordpress路径下：

```
cd /tmp && curl -O https://wordpress.org/latest.tar.gz && tar xzvf latest.tar.gz && touch /tmp/wordpress/.htaccess && cp /tmp/wordpress/wp-config-sample.php /tmp/wordpress/wp-config.php && mkdir /tmp/wordpress/wp-content/upgrade && sudo cp -a /tmp/wordpress/. /var/www/wordpress && sudo chown -R www-data:www-data /var/www/wordpress && sudo find /var/www/wordpress/ -type d -exec chmod 750 {} \; && sudo find /var/www/wordpress/ -type f -exec chmod 640 {} \;
```

运行以下命令获取随机字符串：

```
cd /var/www/wordpress && curl -s https://api.wordpress.org/secret-key/1.1/salt/
```

复制生成的随机字符串。

然后运行以下命令编辑WordPress配置文件，<b>删除原来的字符串，并将你的随机字符串替换到相应的位置</b>。

```
sudo nano /var/www/wordpress/wp-config.php
```

现在，<b>找到配置文件中的数据库用户名、密码和数据库名称，根据前面创建的MySQL用户和数据库信息进行相应的修改（比如我这里数据库是wordpress，用户名是wpuser，密码是wppassword）</b>。此外，还需要添加一个FS_METHOD，也就是下列内容：

PHP

```
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

```
sudo apt install certbot python3-certbot-apache -y
```

接下来调整防火墙规则：

```
sudo ufw allow 'Apache Full' && sudo ufw delete allow 'Apache'
```

然后，启动Certbot来获取SSL证书：

```
sudo certbot --apache
```

Certbot会询问你的电子邮件地址，请确保输入你自己的邮箱地址。

接下来，你会被要求同意服务条款，输入”Y”表示同意。然后，它会问你是否愿意分享你的邮箱地址，你可以选择”N”不分享。接下来，它会问你要为哪些域名启用HTTPS，你可以直接按回车键，表示默认全选。打印“<b>Congratulations! You have successfully enabled HTTPS on</b>”，表明你的SSL证书就安装成功了。

至此，你的网站现在应该可以通过HTTPS访问了。
