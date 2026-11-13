完整的新图景是这样的：


```
整个新系统{
    “应用（应用指针对某业务的agent集合）A”{
        agent A1{
            skills
            tools
            mcps
            system prompt
            其他重要内容
        }
        agent A2{
            如上内容
        }
    }
    应用B{
        agent B1{}
        agent B2{}
    }
    特殊通用应用{
        通用agent{}
    }
}
```



整个系统类似一个agent商城。用户进入，页面形似一个work agent（比如，qclaw），用户开始聊天后，有一个通用agent做意图识别