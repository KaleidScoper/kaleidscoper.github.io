---
title: C语言最简开平方（娱乐）
date: 2023-09-06 22:44:32
categories: [技术, 开发]
tags: [C]
---

Talk is cheap, show you my code.

<!--more-->

```c
#include <stdio.h>
void main(){
    int x, y=0;
    scanf("%d",&x);
    for(;x>=y*y;y++){}
    printf("%d",--y);
}
```

他仅能实现整数的开平方，且只能输出结果的整数部分。
