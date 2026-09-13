/**
 * ===========================
 *    团队成员数据配置
 * ===========================
 *
 * 编辑此文件以添加、修改或删除团队成员卡片。
 * 页面会自动读取此文件并渲染成员卡片，无需修改 HTML。
 *
 * 字段说明
 * ────────────────────────────────────────────────
 *   id          — (必填) MC 用户名。作为卡片标题显示
 *   uuid        — (必填) 玩家的 Mojang UUID（无连字符）。用于拉取 mcheads.org 头像，
 *                 避免运行时用户名解析（minotar/mc-heads 的用户名解析均已失效）
 *   role        — (必填) 服务器管理身份，如"服主""管理员""成员"
 *   tag         — (必填) 游戏内角色头衔，如"出生点建筑师""工业领主"
 *   color       — (必填) 卡片主题色，十六进制色值，如 "#f1c40f"
 *   description — (必填) 成员描述文本。用 \n 换行
 *   link        — (可选) 个人主页 URL；填写后成员名称变为可点击链接
 *   fallback    — (可选) 头像 API 不可用时的本地回退图片路径
 *
 * 添加新成员示例
 * ────────────────────────────────────────────────
 *   {
 *     id: "Steve",
 *     uuid: "8667ba71b85a4004af54457a9734eed7",
 *     role: "成员",
 *     tag: "红石工程师",
 *     color: "#80cfff",
 *     description: "第一行描述\n第二行描述",
 *     link: "https://example.com",
 *     fallback: "img/member_placeholder.webp",
 *   },
 */

const TEAM_MEMBERS = [
  {
    id: "KaleidScoper",
    uuid: "a86d98df724b4e7a98a67a71345386d6",
    role: "服主",
    tag: "艺术家",
    color: "#f1c40f",
    description: "服务器的创建者与维护者，负责日常运维和版本更新",
    link: "https://kaleidscoper.github.io",
    fallback: "img/kale.png",
  },
  {
    id: "b1ack_51av3",
    uuid: "5aa7b312fcc24bacb9aae3775c1077a2",
    role: "成员",
    tag: "工程师",
    color: "#80cfff",
    description: "服内最活跃的资源生产者",
    fallback: "img/cs.png",
  },
  {
    id: "404tomato",
    uuid: "904280edf7e54343884fa6e10f59219f",
    role: "成员",
    tag: "农学家",
    color: "#c74005",
    description: "杨柳依依",
    fallback: "img/tomato.png",
  },
  {
    id: "syr2004",
    uuid: "29dc4bb35820418a89b3213040d332cc",
    role: "成员",
    tag: "地质学家",
    color: "#80cfff",
    description: "从未在地表被目击到过",
    fallback: "img/member_placeholder.webp",
  },
  {
    id: "eeee567",
    uuid: "51cbfe94e0454cd2a5dfc80131ed0a23",
    role: "成员",
    tag: "探险家",
    color: "#80cfff",
    description: "率先抵达末地",
    fallback: "img/member_placeholder.webp",
  },
  {
    id: "InRedBaglu",
    uuid: "da1b3123711540c8b1f3ba17557bdf2b",
    role: "成员",
    tag: "吉祥物",
    color: "#80cfff",
    description: "非常可爱\n除此之外我们对他一无所知",
    fallback: "img/member_placeholder.webp",
  },
  {
    id: "yxjygcty123",
    uuid: "ff9b0fb67ff24f939512c918b9d13ad6",
    role: "成员",
    tag: "探险家",
    color: "#80cfff",
    description: "执着于踹开别人的门",
    fallback: "img/member_placeholder.webp",
  },
  {
    id: "Zn_0817",
    uuid: "2dceb3a5f54f4d49a3a02ca80cf9b74b",
    role: "成员",
    tag: "建筑师",
    color: "#80cfff",
    description: "在出生点附近建造了“令人印象深刻”的“建筑物”",
    fallback: "img/member_placeholder.webp",
  },
];
