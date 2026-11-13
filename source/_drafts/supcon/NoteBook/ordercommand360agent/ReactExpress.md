React + Express 快速入门纯文本教程

目标：
做一个最小全栈项目：

1. React 前端显示一个输入框和按钮
2. 用户输入一条 todo
3. React 调用 Express 后端接口
4. Express 保存 todo 并返回数据
5. React 把 todo 显示出来

你需要先会一点点 JavaScript，比如变量、函数、数组、对象、async/await。

一、项目结构

创建一个文件夹：

fullstack-demo

里面放两个子项目：

fullstack-demo
client    前端 React
server    后端 Express

二、创建 React 前端

进入 fullstack-demo，执行：

npm create vite@latest client

选择：
React
JavaScript

然后进入 client：

cd client
npm install
npm run dev

打开终端显示的网址，例如：

http://localhost:5173

你能看到 React 页面，说明前端启动成功。

三、React 最重要的几个概念

1. 组件

React 页面由组件组成。组件本质上就是一个返回 HTML-like 结构的 JavaScript 函数。

例如：

function App() {
return <h1>Hello React</h1>
}

export default App

2. JSX

React 里这种写法：

<h1>Hello</h1>

看起来像 HTML，但其实是 JSX。它允许你在 JavaScript 里写页面结构。

3. State 状态

页面上会变化的数据，通常放在 state 里。

例如：

const [count, setCount] = useState(0)

count 是当前值。
setCount 是修改 count 的函数。

4. 事件

按钮点击事件这样写：

<button onClick={handleClick}>点击</button>

5. 表单输入

输入框通常这样绑定：

<input value={text} onChange={(e) => setText(e.target.value)} />

意思是：
输入框显示 text 的值。
用户输入时，把新值保存到 text。

四、修改 React 前端

打开：

client/src/App.jsx

替换成：

import { useState } from "react";

function App() {
const [text, setText] = useState("");
const [todos, setTodos] = useState([]);

async function addTodo() {
if (!text.trim()) return;

```
const res = await fetch("http://localhost:3000/todos", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ text })
});

const newTodo = await res.json();

setTodos([...todos, newTodo]);
setText("");
```

}

return (
<div style={{ padding: 24 }}> <h1>Todo App</h1>

```
  <input
    value={text}
    onChange={(e) => setText(e.target.value)}
    placeholder="输入 todo"
  />

  <button onClick={addTodo}>添加</button>

  <ul>
    {todos.map((todo) => (
      <li key={todo.id}>{todo.text}</li>
    ))}
  </ul>
</div>
```

);
}

export default App;

这段代码做了几件事：

1. text 保存输入框内容
2. todos 保存 todo 列表
3. 点击按钮时调用 addTodo
4. addTodo 用 fetch 请求后端
5. 后端返回新的 todo
6. React 把新 todo 加到页面上

五、创建 Express 后端

回到 fullstack-demo 文件夹：

cd ..

创建 server 文件夹：

mkdir server
cd server
npm init -y

安装 Express 和 CORS：

npm install express cors

创建文件：

server/index.js

写入：

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

let todos = [];

app.get("/", (req, res) => {
res.send("Express server is running");
});

app.get("/todos", (req, res) => {
res.json(todos);
});

app.post("/todos", (req, res) => {
const { text } = req.body;

if (!text) {
return res.status(400).json({ error: "text is required" });
}

const newTodo = {
id: Date.now(),
text
};

todos.push(newTodo);

res.status(201).json(newTodo);
});

app.listen(PORT, () => {
console.log(`Server running at http://localhost:${PORT}`);
});

启动后端：

node index.js

浏览器访问：

http://localhost:3000

看到：

Express server is running

说明后端成功。

六、Express 最重要的几个概念

1. app

app 是 Express 应用对象。

const app = express();

你通过 app 定义路由、中间件和启动服务器。

2. 路由

路由就是“某个 URL 对应什么处理逻辑”。

例如：

app.get("/todos", handler)

表示：
当前端请求 GET /todos 时，执行 handler。

3. HTTP 方法

常见方法：

GET：读取数据
POST：新增数据
PUT/PATCH：修改数据
DELETE：删除数据

比如：

GET /todos        获取所有 todo
POST /todos       新增一个 todo
DELETE /todos/1   删除 id 为 1 的 todo

4. req 和 res

req 表示请求。
res 表示响应。

例如：

app.post("/todos", (req, res) => {
console.log(req.body);
res.json({ ok: true });
});

req.body 是前端发来的数据。
res.json 是后端返回 JSON。

5. 中间件

中间件是在请求到达路由之前先执行的函数。

例如：

app.use(express.json());

它的作用是让 Express 能读 JSON 请求体。

app.use(cors());

它的作用是允许 React 前端跨端口请求 Express 后端。

七、让前后端一起运行

你需要开两个终端。

终端一：启动后端

cd fullstack-demo/server
node index.js

终端二：启动前端

cd fullstack-demo/client
npm run dev

然后打开：

http://localhost:5173

输入 todo，点击添加。

如果页面出现 todo，说明 React 和 Express 已经打通。

八、前端调用后端的核心套路

React 里这样请求后端：

const res = await fetch("http://localhost:3000/todos");
const data = await res.json();

POST 请求这样写：

const res = await fetch("http://localhost:3000/todos", {
method: "POST",
headers: {
"Content-Type": "application/json"
},
body: JSON.stringify({ text: "学习 React" })
});

const data = await res.json();

记住：
前端发对象之前，要 JSON.stringify。
后端要 app.use(express.json()) 才能读取 JSON。

九、常见错误

1. CORS 报错

如果浏览器控制台出现 CORS 错误，说明后端没允许跨域。

解决：

npm install cors

然后在 Express 里：

const cors = require("cors");
app.use(cors());

2. Cannot GET /xxx

说明你访问了后端没有定义的路由。

比如你访问：

http://localhost:3000/users

但后端没有：

app.get("/users", ...)

就会报这个。

3. req.body 是 undefined

通常是因为忘了写：

app.use(express.json());

4. 前端页面没变化

检查这几件事：

后端是否启动？
前端 fetch 地址是否正确？
浏览器控制台是否报错？
Network 面板里请求是否成功？
setTodos 是否正确更新了数组？

十、你真正要掌握的最小知识清单

React 必会：

组件
JSX
useState
事件处理
表单输入
map 渲染列表
fetch 调接口
useEffect 读取初始数据

Express 必会：

创建服务器
app.get
app.post
req.body
res.json
express.json
cors
路由拆分
错误处理

HTTP/API 必会：

GET
POST
PUT/PATCH
DELETE
状态码 200、201、400、404、500
JSON
REST API

十一、下一步练习

练习 1：
给 todo 增加删除功能。

后端增加：

DELETE /todos/:id

前端点击删除按钮后请求这个接口。

练习 2：
页面加载时自动读取已有 todos。

React 里用 useEffect：

useEffect(() => {
async function loadTodos() {
const res = await fetch("http://localhost:3000/todos");
const data = await res.json();
setTodos(data);
}

loadTodos();
}, []);

练习 3：
把 todos 保存到文件或数据库。

刚开始可以用内存数组。
之后再学 SQLite、PostgreSQL 或 MongoDB。

十二、学习顺序建议

第一天：
跑通 React + Express demo。

第二天：
理解 React 的 state、props、事件、表单。

第三天：
理解 Express 的 get、post、delete、req、res。

第四天：
做完整 CRUD：新增、读取、修改、删除。

第五天：
接数据库。

第六天：
学习项目结构，比如 routes、controllers、services。

第七天：
部署前后端。

十三、最小全栈心智模型

React 负责页面。
Express 负责接口。
浏览器通过 fetch 请求 Express。
Express 返回 JSON。
React 收到 JSON 后更新 state。
state 变化后，页面自动重新渲染。

你可以把它记成：

用户操作页面
React 发送请求
Express 处理请求
Express 返回数据
React 更新页面
