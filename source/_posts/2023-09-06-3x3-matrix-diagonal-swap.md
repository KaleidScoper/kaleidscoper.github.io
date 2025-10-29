---
title: 3x3矩阵沿对角线镜像对调
date: 2023-09-06 21:13:29
categories: [技术, 开发, 桌面开发]
tags: [C, 原创]
---

与左右对调搭配使用，可以实现矩阵的任何旋转。

<!--more-->

```c
#include <stdio.h>
//旋转函数。在此处沿着“\”对角线旋转，所以只遍历
//对角线左侧那些项，把它们与角标相反的那些项对调。
void trans(int cube[3][3]){
    for(int i=0; i<3; ++i){
        for(int j=0; j<i; ++j){
            cube[i][j]=cube[i][j]+cube[j][i];
            cube[j][i]=cube[i][j]-cube[j][i];
            cube[i][j]=cube[i][j]-cube[j][i];
        }
    }
    //打印新矩阵处
    for(int i=0; i<3; ++i){
        for(int j=0; j<3; ++j){
            printf("%d ",cube[i][j]);
            if(j==2){
                printf("\n");
            }
        }
    }
}

//打印原矩阵处
int main(){
    int cube[3][3]={1,2,3,4,5,6,7,8,9};
    for(int i=0; i<3; ++i){
        for(int j=0; j<3; ++j){
            printf("%d ",cube[i][j]);
            if(j==2){
                printf("\n");
            }
        }
    }
    trans(cube);
}
```
