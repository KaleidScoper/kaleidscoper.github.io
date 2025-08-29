---
title: 安徽大学信息安全数学基础备考教程
date: 2025-08-26 12:00:00
categories: [技术, 安全, 密码学]
tags: [教程]
---

<b>前言：</b>安徽摆烂大学的大多数课程，都可以考前突击然后低分掠过，对我这种摆子很友好。然而有一个例外是信息安全数学基础，这门课是由近世代数和初等数论拼凑在一起的，网上找不到什么速成资料，下周考试了这周发现不知道备考啥。现给出安徽大学某年期末考试真题解析，以飨后人。

<!--more-->

## 第一题

<b>解同余式组：</b>

$$
\begin{cases}
3x \equiv 1 \pmod{10} \\
5x \equiv 3 \pmod{12} \\
2x \equiv 9 \pmod{15} \\
\end{cases}
$$

<b>解：</b>

对应教材（见《信息安全数学基础教程（第二版）》，清华大学出版社，第95页）模数两两不互素的中国剩余定理应用。这教材原文我看得云里雾里。

这里选择先求$a_i$逆元（求逆元过程略），得方程组如下：

$$
\begin{cases}
x \equiv 7 \pmod{10} &(1) \\
x \equiv 3 \pmod{12} &(2) \\
x \equiv 12 \pmod{15} &(3) \\
\end{cases}
$$

将（1）式写为$ x = 7 + 10 t $，将其代入（2）式：

$$
\begin{aligned}
7 + 10t &\equiv 3 \pmod{12} \\
10t &\equiv 3 - 7 \pmod{12} \\
10t &\equiv -4 \pmod{12} \\
10t &\equiv 8 \pmod{12} \\
5t &\equiv 4 \pmod{6} \\
t &\equiv -4 \pmod{6} & \text{求逆元} \\
t &\equiv 2 \pmod{6}
\end{aligned}
$$

解得$t=2+6k$，$x=7+10t=27+60k$，解即为：

$$
x\equiv27\pmod{60}
$$

对k随意取值（如0、1）计算得到的 x 代入（3）式验证，无误。

## 第二题

<b>一次同余方程求解：</b>

$$

20x\equiv16\pmod{24}

$$

<b>解：</b>

本题 $\gcd(a,m) \mid b$，故有解。化简：

$$
\begin{aligned}
20x&\equiv16\pmod{24}\\
5x&\equiv4\pmod{6}\\
x&\equiv2\pmod{6}\\
\end{aligned}
$$

即 $ x=2+6k $，但原式模数为 24 。改写为对24取模的版本：

$$
\begin{cases}
k=0 & x=2\\
k=1 & x=8\\
k=2 & x=14\\
k=3 & x=20\\
k=4 & x=26 & \text{大于24舍去} \\
\end{cases}
$$

最终答案：

$$

x \equiv 2,8,14,20 \pmod{24}

$$

## 第三题

<b>用费马小定理化简多项式：</b>

$$

3x^{14}+4x^{13}+2x^{11}+x^{9}+5x^{8}+x^{6}+x^{3}+12x^{2}+1\equiv0\pmod{5}

$$

<b>解：</b>

费马小定理，其中 p 为素数，a 为整数：

$$

a^{p} \equiv a \pmod{p}

$$

据此有

$$

x^{5} \equiv x \pmod{5}\\
x^{4} \equiv 1 \pmod{5}\\
x^{6} \equiv x \cdot x^{5} \equiv x \cdot x \pmod{5}\\

$$

借助上式得到：

$$

x^{14} \equiv (x^{4})^{3} \cdot x^{2} \equiv x^{2} \pmod{5}\\
x^{13} \equiv (x^{4})^{3} \cdot x \equiv x \pmod{5}\\
x^{12} \equiv (x^{4})^{3} \equiv 1 \pmod{5}\\

$$

以此类推。

$$
\begin{aligned}
3x^{14} &\equiv 3x^{2} \pmod{5} \\
4x^{13} &\equiv 4x^{1} \pmod{5} \\
2x^{11} &\equiv 2x^{3} \pmod{5} \\
x^{9} &\equiv x^{1} \pmod{5} \\
5x^{8} &\equiv 0 \pmod{5} \quad \text{因为 } 5 \equiv 0 \pmod{5} \\
x^{6} &\equiv x^{2} \pmod{5} \\
x^{3} &\equiv x^{3} \pmod{5} \\
12x^{2} &\equiv 2x^{2} \pmod{5} \quad \text{因为 } 12 \equiv 2 \pmod{5} \\
1 &\equiv 1 \pmod{5}
\end{aligned}
$$

替换原式内的每项，然后合并同类项：

$$
\begin{aligned}
&3x^{2} + 4x + 2x^{3} + x + 0 + x^{2} + x^{3} + 2x^{2} + 1 \\
&\equiv (3 + 1 + 2)x^{2} + (4 + 1)x + (2 + 1)x^{3} + 1 \pmod{5} \\
&\equiv 6x^{2} + 5x + 3x^{3} + 1 \pmod{5} \\
&\equiv x^{2} + 0 \cdot x + 3x^{3} + 1 \pmod{5} \\
&\equiv 3x^{3} + x^{2} + 1 \pmod{5}
\end{aligned}
$$

也就是：

$$
 3x^{3} + x^{2} + 1 \equiv 0 \pmod{5}
$$

依次代入 x=0~4 即可得出结果。

$$
\begin{aligned}
x \equiv 0 \pmod{5}: \quad &3(0)^3 + (0)^2 + 1 \equiv 1 \not\equiv 0 \pmod{5} \\
x \equiv 1 \pmod{5}: \quad &3(1)^3 + (1)^2 + 1 \equiv 3 + 1 + 1 \equiv 5 \equiv 0 \pmod{5} \\
x \equiv 2 \pmod{5}: \quad &3(8) + 4 + 1 \equiv 24 + 5 \equiv 4 \not\equiv 0 \pmod{5} \\
x \equiv 3 \pmod{5}: \quad &3(27) + 9 + 1 \equiv 81 + 10 \equiv 1 \not\equiv 0 \pmod{5} \\
x \equiv 4 \pmod{5}: \quad &3(64) + 16 + 1 \equiv 192 + 17 \equiv 4 \not\equiv 0 \pmod{5}
\end{aligned}
$$

仅在 1 时符合题意，解为$x \equiv 1 \pmod{5}$，即$x=1+5k$。

## 第四题

<b>在有限域 GF(2)[x] 上检验下列多项式可约性，并分解可约者：</b>

$$

x^{5}+x^{4}+1\\
x^{5}+x^{2}+1\\

$$

<b>解：</b>

对于有限域 GF(2)[x] ，有已知的不可约因式如下（五次以内）：

$$
\begin{cases}
一次因子：x,&x+1\\
\\
二次因子：x^{2}+x+1\\
\\
三次因子：x^{3}+x^{2}+1,&x^{3}+x+1\\
\\
四次因子：x^{4}+x^{3}+x^{2}+x+1 & x^{4}+x^{3}+1 \\ & x^{4}+x+1 \\
\\
五次因子：& x^{5}+x^{3}+x^{2}+x+1 \\ & x^{5}+x^{4}+x^{2}+x+1 \\ & x^{5}+x^{4}+x^{3}+x+1 \\ & x^{5}+x^{4}+x^{3}+x^{2}+1 \\ & x^{5}+x^{3}+1 \\ & x^{5}+x^{2}+1
\end{cases}
$$

故$x^{5}+x^{2}+1$不可分解，$x^{5}+x^{4}+1$可分解，以可分解的式子为例，判断过程如下：

$$
\text{检查一次因子}\begin{cases}

\text{代入0} \quad \begin{cases}

 =0 \quad \text{存在因子x} \\
 =1 \quad \text{不存在因子x} \quad \checkmark \\

\end{cases} \\

\text{代入1} \quad \begin{cases}

 =0 \quad \text{存在因子x+1} \\
 =1 \quad \text{不存在因子x+1} \quad \checkmark \\

\end{cases} \\

\end{cases}
$$

故可以排除一次-四次分解，再检查二次-三次分解。列方程：

$$

(x^{2}+x+1)\cdot(x^{3}+ax^{2}+bx+c)=x^{5}+x^{4}+1

$$

解得$x^{3}-x+1$，其中减法在有限域 GF(2)[x] 内与加法等价，最终分解为：

$$

(x^{2}+x+1)\cdot(x^{3}+x+1)

$$

## 第五题

<b>题干：</b>