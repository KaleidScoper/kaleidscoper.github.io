---
title: AHU CTF 某 Java 逆向题解
date: 2022-11-03 00:00:00
categories: [技术, 安全, 逆向工程]
tags: [原创, Java]
---

**前言：** 这是一道AHU-CTF比赛中的Java逆向题目分析。

<!--more-->

## 题目概述

这道题目给出了一个Java程序，要求输入正确的flag。程序会对输入进行一系列变换和校验。

题目提示：**"Maybe this transform is reversible"** （也许这种转变是可逆的）

> 注：原代码中有一个注释掉的构造函数，里面有一句话：
> ```java
> /*
> public code() {
>     String hint = "Maybe this transform is reversible";   
>     即提示："也许这种转变是可逆的"
>     System.out.println(hint);
> }
> */
> ```
> 这就是告诉我们，所有的变换都是可以反向推导的。

## 程序结构分析

### 主程序入口

首先看`main`方法，程序的基本逻辑如下：

```java
public static void main(String[] var0) {
    Scanner var1 = new Scanner(System.in);
    System.out.print("Enter the flag: ");  //用户输入字符串"var2"（flag）
    String var2 = var1.next();
    
    if (var2.length() != 43) {   //如果字符串var2长度不为43
                                 // 换句话说flag长度必为43, flag{m123456789abcdefghijklmnopqrstuvwxyz1}
        System.out.println("Oops, wrong flag!");
    } else {                     //正确道路~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        String var3 = var2.substring(0, length);   //拿var2前6个字符输入var3(头)
        String var4 = var2.substring(length, var2.length() - 1);//var2第7个开始到倒数第二个字符给var4（后半段）
                                                                //就是flag除了开头m以外的内容给var4
        String var5 = var2.substring(var2.length() - 1);//var2最后一个字符给var5（尾）
        
        //——————————————————————————————————————
        //System.out.println("input: "+var2);
        //System.out.println("start: "+var3);
        //System.out.println("end: "+var4);
        //System.out.println("var5: "+var5);
        //return;
        //——————————————————————————————————————
        
        if (var3.equals("flag{m") && var5.equals("}")) {//如果用户输入符合此标准（flag{m**********}）
            //assert var4.length() == length * length;要求var4长度必须为length平方（36）
            System.out.println(var4);  //输出m后flag核心值，没pi用
            
            if (solve(var4)) {        //如果它满足solve，则为flag
                System.out.println("Congratulations, you got the flag!");
            } else {
                System.out.println("Oops, wrong flag!");
            }
        } else {
            System.out.println("Oops, wrong flag!");
        }
    }
}
```

**关键信息：**
- `length = (int)Math.pow(2.0, 3.0) - 2 = 6` （写死length为6，main方法开始时为此值）
- flag总长度为43
- flag格式：`flag{m` + 36个字符 + `}`
- 核心校验在`solve()`方法中

### transform方法：一维转二维

`transform`方法将36个字符的一维数组转换为6×6的二维数组：

```java
public static char[][] transform(char[] var0, int var1) {    //transform索要一个char数组（var0，即var4碎片）
    // 和一个int值（6）。
    char[][] var2 = new char[var1][var1];          //开辟数组，var2二维数组有6个子数组，每个数组长为6。

    for(int i = 0; i < 36; ++i) {      //从i=0到i=35
        var2[i / 6][i % 6] = var0[i];     //分var4碎片为6段，形成var2二维数组，返回。
    }
    
    //System.out.print("var1="+var1);        测试证明var1==6

    return var2;
}
```

**作用：** 将输入的36个字符按顺序填充到6×6矩阵中。例如：
```
123456
789abc
defghi
jklmno
pqrstu
vwxyz1
```

### solve方法：矩阵旋转

`solve`方法是核心校验逻辑：

```java
public static boolean solve(String var0) {             //solve, 一个布尔方法，索要一个字符串var4（核心）赋给var0

    char[][] var1 = transform( var0.toCharArray(), length );  //调用transform，其返回值类型char[][]，赋给var1
                                                              //实际上返回了var1为六个数组集合，每个有6个字符
                                                              //即拆开了原来的var4（核心）
                                                              //123456
                                                              //789abc
                                                              //defghi
                                                              //jklmno
                                                              //pqrstu
                                                              //vwxyz1
    for(int var2 = 0; var2 <= 3; ++var2) {  //0、1、2、3
        for(int var3 = 0; var3 < length - 2 * var2 - 1; ++var3) {//0、1、2、3、4。--0
                                                                 //0、1、2.      --1
                                                                 //0。           --2
                                                                 //结束。         --3
            //var2和var3两个循环标志分别为以下数对
            //00 01 02 03 04
            //10 11 12
            //20
            char var4 = var1[var2][var2 + var3];//依次将var4赋值为碎片数组第一行的第一二三四五个值、
                                                //第二轮会赋值为第二行前三个
                                                //第三轮，三行第一个
            var1[var2][var2 + var3] = var1[length - 1 - var2 - var3][var2];
            //依次将赋值过var4的数组的值，用对称数组对称位置的值代替。
            //此时该数组前三组变成：
            //1zyxw 6
            //uts abc
            //o efghi
            //
            var1[length - 1 - var2 - var3][var2] = var1[length - 1 - var2][length - 1 - var2 - var3];
            //依次将后三组刚才参与赋值的那些"对称值"
            //但是别管了，看下面验证结果
            var1[length - 1 - var2][length - 1 - var2 - var3] = var1[var2 + var3][length - 1 - var2];
            var1[var2 + var3][length - 1 - var2] = var4;
        }
    }
    //for(int x=0;x<=5;x++){
    //    for(int y=0;y<=5;y++){
    //        System.out.print(" "+var1[x][y]);
    //    }
    //}
    //这个验证点证明这是一个颠倒函数，会把完整的碎片数组顺时针旋转90度。
    
    
    
    String var10001 = encrypt(getArray(var1, 0, 5), 2);   //encrypt（长度十二的缝合怪数组，2）
                                                           //输出按位加密的新缝合怪，叫做var10001
                                                           //缝合怪：vpjd711uoic6
    return "6]fRv37g6mp#uy2x0^^^rg^tr1cr0Nsoy_y0".equals( var10001 + encrypt(getArray(var1, 1, 4), 1) + encrypt(getArray(var1, 2, 3), 0) );
    //boolean
}
```

**关键发现：** 这个嵌套循环实际上是将矩阵**顺时针旋转90度**！

循环遍历的位置对：
- var2=0: (0,0) (0,1) (0,2) (0,3) (0,4)
- var2=1: (1,0) (1,1) (1,2)
- var2=2: (2,0)
- var2=3: 结束

### getArray方法：提取行并缝合

`getArray`方法从二维数组中提取两行并拼接：

```java
public static char[] getArray(char[][] var0, int zero, int five) {//缝合方法

    //那个二维数组"var0"就是旋转后的碎片数组，solve的var1

    char[] var3 = new char[length * 2];//字符数组var3是一个长度为12的东西。

    int var4 = 0;//数组角标标志器

    int var5;
    for(var5 = 0; var5 < length; ++var5) {  //0、1、2、3、4、5
        var3[var4] = var0[zero][var5];//依次把旋转后的碎片数组第一行赋给这个数列var3
        ++var4;
    }

    //System.out.println("var4=="+var4);//测试点，此时var4==6；

    for(var5 = 0; var5 < length; ++var5) {
        var3[var4] = var0[five][length - 1 - var5];//依次把旋转后的碎片数组第六行赋给这个数列var3
        ++var4;
    }

    for(int x=0;x<=5;x++){
        //for(int y=0;y<=5;y++){
            System.out.print(" "+var3[x]);
        //}
    }

    return var3;//结果是把旋转后的数组头行和尾行输出
}
```

**作用：** 这个方法很有意思，我称之为"缝合怪"制造器。
- `getArray(var1, 0, 5)` → 第1行 + 第6行逆序 = 12个字符的缝合怪
- `getArray(var1, 1, 4)` → 第2行 + 第5行逆序 = 12个字符的缝合怪
- `getArray(var1, 2, 3)` → 第3行 + 第4行逆序 = 12个字符的缝合怪

### encrypt方法：加密

`encrypt`方法对12个字符进行两步变换：

```java
public static String encrypt(char[] var0, int var1) {//返回一个string。
    //索要的数组是长度12的缝合怪数组，int是2
    char[] var2 = new char[12];//又一个长度12？
    int var3 = 5;
    int var4 = 6;
    //————————————————————————————————————————————————————
    int var5;
    for(var5 = 0; var5 < 12; ++var5) {//12次吗，不是，是6次。
        var2[var5] = var0[var3--];//缝合怪依次赋值给缝合怪二号。
        var2[var5 + 1] = var0[var4++];//实现交错赋值：旧：123456 789abc
        ++var5;                                   //新：67 58 49 3a 2b 1c
    }
    for(var5 = 0; var5 < 12; ++var5) {//真搞12次哦，每一位做如下处理。
                                      //var1==2，char类型下二进制为：00 00 00 10
        var2[var5] ^= (char)var1;      //此符号：相同得0不同得1，然后得到新字符们，储存于缝合怪二号里面
    }
    //—————————————————————————————————————————————————————
    //接下来返回已经被按位加密的var2——新缝合怪
    return String.valueOf(var2);//毫无疑问也是一个string，拼接而成
}
```

**交错重排示例：**
- 输入：`123456 789abc`（前6个+后6个）
- 输出：`67 58 49 3a 2b 1c`（前半逆序，后半正序，交错拼接）

**异或加密：** 每个字符与参数`var1`进行异或运算。这个符号`^`的意思是：相同得0不同得1。

## 解题思路

好了，现在来看看怎么逆向求解。最终的校验条件是：
```java
"6]fRv37g6mp#uy2x0^^^rg^tr1cr0Nsoy_y0".equals(
    encrypt(getArray(var1, 0, 5), 2) + 
    encrypt(getArray(var1, 1, 4), 1) + 
    encrypt(getArray(var1, 2, 3), 0)
)
```

目标字符串被分成三段，每段12个字符：
1. `6]fRv37g6mp#` ← encrypt(..., 2)
2. `uy2x0^^^rg^t` ← encrypt(..., 1)
3. `r1cr0Nsoy_y0` ← encrypt(..., 0)

**逆向步骤：**

根据题目提示"Maybe this transform is reversible"（也许这种转变是可逆的），我们可以这样做：

1. 对三段密文分别解密（逆向`encrypt`过程）：先异或回去，再把交错的缝合怪拆开
2. 还原旋转前的6×6矩阵（逆时针旋转90度，或者顺时针转3次也行）
3. 将矩阵转回36个字符的字符串
4. 拼接得到完整flag：`flag{m` + 36字符 + `}`

关键在于每一步都是可逆的：
- encrypt的异或可以再异或一次还原
- 交错重排可以按照相反的规则拆开
- 矩阵旋转可以反向旋转

## 完整源代码

```java
import java.util.Scanner;

public class code {
    private static final int length = (int)Math.pow(2.0, 3.0) - 2;

    public static void main(String[] var0) {
        Scanner var1 = new Scanner(System.in);
        System.out.print("Enter the flag: ");
        String var2 = var1.next();
        
        if (var2.length() != 43) {
            System.out.println("Oops, wrong flag!");
        } else {
            String var3 = var2.substring(0, length);
            String var4 = var2.substring(length, var2.length() - 1);
            String var5 = var2.substring(var2.length() - 1);
            
            if (var3.equals("flag{m") && var5.equals("}")) {
                if (solve(var4)) {
                    System.out.println("Congratulations, you got the flag!");
                } else {
                    System.out.println("Oops, wrong flag!");
                }
            } else {
                System.out.println("Oops, wrong flag!");
            }
        }
    }

    public static boolean solve(String var0) {
        char[][] var1 = transform(var0.toCharArray(), length);
        
        for(int var2 = 0; var2 <= 3; ++var2) {
            for(int var3 = 0; var3 < length - 2 * var2 - 1; ++var3) {
                char var4 = var1[var2][var2 + var3];
                var1[var2][var2 + var3] = var1[length - 1 - var2 - var3][var2];
                var1[length - 1 - var2 - var3][var2] = var1[length - 1 - var2][length - 1 - var2 - var3];
                var1[length - 1 - var2][length - 1 - var2 - var3] = var1[var2 + var3][length - 1 - var2];
                var1[var2 + var3][length - 1 - var2] = var4;
            }
        }
        
        String var10001 = encrypt(getArray(var1, 0, 5), 2);
        return "6]fRv37g6mp#uy2x0^^^rg^tr1cr0Nsoy_y0".equals(
            var10001 + encrypt(getArray(var1, 1, 4), 1) + encrypt(getArray(var1, 2, 3), 0)
        );
    }

    public static String encrypt(char[] var0, int var1) {
        char[] var2 = new char[12];
        int var3 = 5;
        int var4 = 6;
        
        int var5;
        for(var5 = 0; var5 < 12; ++var5) {
            var2[var5] = var0[var3--];
            var2[var5 + 1] = var0[var4++];
            ++var5;
        }
        
        for(var5 = 0; var5 < 12; ++var5) {
            var2[var5] ^= (char)var1;
        }
        
        return String.valueOf(var2);
    }

    public static char[][] transform(char[] var0, int var1) {
        char[][] var2 = new char[var1][var1];
        for(int i = 0; i < 36; ++i) {
            var2[i / 6][i % 6] = var0[i];
        }
        return var2;
    }

    public static char[] getArray(char[][] var0, int zero, int five) {
        char[] var3 = new char[length * 2];
        int var4 = 0;
        
        int var5;
        for(var5 = 0; var5 < length; ++var5) {
            var3[var4] = var0[zero][var5];
            ++var4;
        }
        
        for(var5 = 0; var5 < length; ++var5) {
            var3[var4] = var0[five][length - 1 - var5];
            ++var4;
        }
        
        return var3;
    }
}
```

## 总结

这道题目的核心是理解三个变换：
1. **矩阵转换**：一维→二维（把36个字符的一维数组变成6×6的碎片数组）
2. **矩阵旋转**：顺时针90度（这个嵌套循环就是干这个的）
3. **加密变换**：交错重排 + 异或（制造缝合怪，然后按位加密）

解题的关键在于**逆向这些操作**，从最终的密文推导出原始输入。好在题目都提示了"Maybe this transform is reversible"，所以每一步都是可逆的，只要耐心反推就能解出来。