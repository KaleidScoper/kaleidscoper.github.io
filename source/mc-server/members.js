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
 *   id          — (必填) MC 用户名。作为卡片标题显示，同时用于拉取 mc-heads 头像
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
 *     role: "成员",
 *     tag: "红石工程师",
 *     color: "#80cfff",
 *     description: "第一行描述\n第二行描述",
 *     link: "https://example.com",
 *     fallback: "img/placeholder.png",
 *   },
 */

const TEAM_MEMBERS = [
  {
    id: "KaleidScoper",
    role: "服主",
    tag: "艺术家",
    color: "#f1c40f",
    description: "服务器的创建者与维护者，负责日常运维和版本更新。\n住在出生点奢靡的宅院中。",
    link: "https://kaleidscoper.github.io",
    fallback: "img/kale.png",
  },
  {
    id: "b1ack_51av3",
    role: "成员",
    tag: "工程师",
    color: "#80cfff",
    description: "在出生点附近建立了最大的工业体系，是服内最活跃的资源生产者。\n有传闻称他住在其中一部机器里。",
    fallback: "img/cs.png",
  },
  {
    id: "404tomato",
    role: "成员",
    tag: "农学家",
    color: "#80cfff",
    description: "运营着位于出生点的农牧场。\n据说她的农场是全服最好看的。",
    fallback: "img/tomato.png",
  },
  {
    id: "syr2004",
    role: "成员",
    tag: "地质学家",
    color: "#80cfff",
    description: "痴迷于地底探险与矿脉开采，是服务器矿产资源的重要供给者。\n据说她从未在地表被目击到过。",
    fallback: "img/member_placeholder.webp",
  },
];
