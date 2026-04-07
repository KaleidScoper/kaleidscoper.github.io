# MC 服务器页面「我们是谁」栏目优化方案

> **起草日期**: 2026-04-08
> **适用范围**: `source/mc-server/index.html` + `source/mc-server/style.css`
> **约束**: 纯前端实现（HTML + CSS + 少量 vanilla JS），不引入额外构建工具或 npm 包；延续现有暗色主题设计语言

---

## 〇、现状分析

### 当前结构

```html
<div class="main5">
  <a class="headline">我们是谁</a>
  <div class="main5_supporter_div">
    <!-- 4 张横向卡片，每张: 左侧 5rem 圆角头像 + 右侧「角色/用户名/描述」 -->
  </div>
</div>
```

| 元素 | 现状 | 问题 |
|------|------|------|
| 栏目标题 | "我们是谁" | 不符合 MC 服务器社区惯例 |
| 角色标签 | 服主 / 出生 / 农民 / 矿工 | 仅"服主"一项符合通用称谓，其余为内部梗，新访客无法理解 |
| 成员描述 | 以 `- xxx` 列表形式呈现趣味描述 | 缺少成员在服务器内的真实职能说明 |
| 头像来源 | 本地静态图片（kale.png、cs.png 等） | 非 MC 社区通行做法，需手动更新，不自动跟随皮肤变更 |
| 卡片布局 | 固定宽 23.5rem 的横向卡片，flex-wrap 排列 | 大屏每行仅放 2 张，利用率低；`min-height: 16rem` 导致大量空白 |
| 层级区分 | 仅通过头像边框颜色区分（金/红/蓝） | 视觉层级不明显，服主卡片与普通成员卡片在尺寸和布局上无差异 |
| 语义化 | 全部使用 `<a>` 标签显示纯文本 | 滥用锚点标签，不符合 HTML 语义规范，影响可访问性 |
| 交互动效 | 无 | 栏目缺乏 hover/入场动效，与页面其他栏目（特色卡片有 hover 缩放）体验不一致 |
| 招募入口 | 无 | 优秀 MC 服务器通常在团队栏目附近提供「加入我们」引导 |

### 参考案例总结

| 服务器 / 模板 | 亮点 | 来源 |
|---------------|------|------|
| **Age of Elysian** | 按职能分组（Core Team → Admin → Mod → Dev → Builder）；每组有一段总述解释该角色的职责；成员描述聚焦真实贡献 | [ageofelysian.com/team](https://ageofelysian.com/team/) |
| **Parallel SMP** | 每位成员有第一人称自述，含代词、职责、在服内的日常；按 Owner → Admin → Dev → Mod → Builder → Artist 分层 | [parallelmc.org/meet-the-team](https://parallelmc.org/meet-the-team/) |
| **Evo / Modern MC Templates (BuiltByBit)** | 使用 MC 皮肤渲染头像；卡片网格布局；Apple 级毛玻璃美学；角色标签为规范化称谓 | [builtbybit.com](https://builtbybit.com/resources/evo-minecraft-server-website-template.77702/) |
| **CreeperHost** | 头像 + 昵称 + 职位 + 完整 bio；注重人格化但保持专业度 | [creeperhost.net/staff](https://creeperhost.net/staff) |

---

## 一、栏目标题优化

### 问题

"我们是谁" 是企业官网式的 "About Us" 直译，在 MC 服务器社区中不常见。社区主流用语是 **"团队" / "Staff" / "Meet the Team"**。

### 建议

将标题改为 **"团队成员"** 或 **"服务器团队"**。既直观又符合 MC 社区惯例，同时锚点 id 保持 `about` 不变以免破坏导航链接。

```html
<!-- 之前 -->
<a class="headline">我们是谁</a>

<!-- 之后 -->
<h2 class="headline">团队成员</h2>
```

> 同步修改导航栏文字：`关于我们` → `团队`，保持 `href="#about"` 不变。

---

## 二、角色体系规范化

### 问题

当前角色命名（出生 / 农民 / 矿工）属于玩家间的趣味称呼，但放在宣传页面上会让新访客无法判断成员的真实身份，也不便于表达服务器的管理架构。

### 建议方案：「服务器身份 + 游戏内角色」双头衔结构

每位玩家实际上承担着两个身份：

- **服务器身份**：反映其在服务器管理/运营层面的职能（服主、管理员、成员……），这是面向新访客的**首要信息**——他找谁反馈问题？谁有管理权限？
- **游戏内角色**：反映其在游戏世界内扮演的角色与定位（建筑师、矿工、农场主……），这是面向已入服玩家的**社交信息**——体现社区个性与活力。

两者缺一不可：只有服务器身份会显得冷冰冰像企业通讯录；只有游戏内角色会让新访客一头雾水（现状）。

#### 2.1 数据表

| 成员 | 服务器身份（主标签） | 游戏内角色（副标签） | 主标签颜色 |
|------|-------------------|-------------------|-----------|
| KaleidScoper | 服主 | 出生点建筑师 | 金色 `#f1c40f` |
| b1ack_51av3 | 管理员 | 工业领主 | 红色 `#f82f2f` |
| 404tomato | 成员 | 首席农业官 | 蓝色 `#80cfff` |
| syr2004 | 成员 | 地底探险家 | 蓝色 `#80cfff` |

#### 2.2 视觉层级关系

两个头衔在卡片上的排版遵循 **主 → 副递减** 的视觉层级：

```
┌────────────────────────────────────┐
│  [头像]   服主              ← 主标签：大号、彩色、加粗，一眼可识别管理层级
│           ── 出生点建筑师   ← 副标签：小号、淡色药丸胶囊，趣味性补充
│           KaleidScoper      ← 用户名
│           描述文本...        ← 正文描述
└────────────────────────────────────┘
```

核心设计意图：
- **主标签（服务器身份）** 是最先被阅读的标签，用于建立信任和管理层级感
- **副标签（游戏内角色）** 紧随其后但视觉权重明显降低，用于传递个性和活力
- 两者之间通过**字号差 + 颜色对比 + 形态差异（纯文字 vs 胶囊）**形成清晰的主从关系

#### 2.3 HTML 结构

```html
<div class="member-titles">
  <!-- 主标签：服务器身份 -->
  <span class="member-role member-role--owner">服主</span>
  <!-- 副标签：游戏内角色 -->
  <span class="member-tag">出生点建筑师</span>
</div>
```

将两个标签包裹在 `.member-titles` 容器中，便于统一控制间距和换行行为。

#### 2.4 CSS 样式对比

```css
/* ── 主标签：服务器身份 ── */
.member-role {
  display: inline-block;
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.05em;
}

.member-role--owner { color: #f1c40f; }
.member-role--admin { color: #f82f2f; }
.member-role--member { color: #80cfff; }

/* ── 副标签：游戏内角色 ── */
.member-tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 400;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.5);
  margin-left: 0.5rem;
  vertical-align: middle;
  letter-spacing: 0.02em;
}

/* ── 容器 ── */
.member-titles {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 0.25rem;
}
```

#### 2.5 视觉对比数据

| 维度 | 主标签（服务器身份） | 副标签（游戏内角色） | 对比度 |
|------|-------------------|-------------------|--------|
| 字号 | 0.95rem | 0.75rem | 主 > 副约 27% |
| 字重 | 700 (Bold) | 400 (Regular) | 强/弱 |
| 颜色 | 角色专属彩色（金/红/蓝） | 统一半透明白 `rgba(255,255,255,0.5)` | 鲜明/低调 |
| 形态 | 纯文字 | 胶囊药丸（圆角 + 背景 + 边框） | 标题感/标签感 |
| 间距 | 无内边距 | `2px 10px` 内边距 | 紧凑/包裹 |

这种对比确保：从 3 米外的屏幕看（或快速扫视），主标签是唯一跳入视野的信息；只有在近距离细读时，副标签才被注意到。

#### 2.6 服主大卡中的双头衔展示

服主大卡因空间充裕，可以让双头衔**纵向堆叠**而非横向并排，增强仪式感：

```html
<div class="member-titles member-titles--stacked">
  <span class="member-role member-role--owner">服主 · Owner</span>
  <span class="member-tag">出生点建筑师</span>
</div>
```

```css
.member-titles--stacked {
  flex-direction: column;
  align-items: flex-start;
  gap: 0.35rem;
}

.member-titles--stacked .member-tag {
  margin-left: 0;
}
```

在大卡中，主标签下方紧跟副标签，形成类似军衔章的纵向排列，与大卡的宽松布局相匹配。

#### 2.7 文案风格指南

| | 服务器身份（主标签） | 游戏内角色（副标签） |
|---|---|---|
| **语体** | 正式、通用 | 趣味、个性化 |
| **字数** | 2-4 字（服主 / 管理员 / 成员） | 3-6 字（首席农业官 / 地底探险家） |
| **命名来源** | MC 服务器社区通用角色体系 | 玩家在服内的实际行为特征 |
| **可理解性** | 新访客应能立即理解 | 允许一定程度的"内部梗"，但不应完全不可解 |
| **避免** | 自创层级（如"出生"这种无意义称谓） | 负面/攻击性描述（如"屠戮无数生灵"） |

> **反例**："出生"作为角色名——既不是服务器身份（这不是一个管理层级），也不是游戏内角色（"出生"不描述任何游戏行为），完全无法归入任何一个维度。
>
> **正例**："管理员" + "工业领主"——前者让新访客知道他有管理权限可以帮忙处理问题，后者让老玩家会心一笑。

---

## 三、头像改用 MC 皮肤 API

### 问题

当前使用本地静态图片，与 MC 社区通行做法不一致。绝大多数 MC 服务器网站使用在线 API 动态渲染玩家皮肤头像——头像自动跟随皮肤更新，且风格统一。

### 推荐方案

使用 **[Crafatar](https://crafatar.com/)** 或 **[MCHeads](https://mc-heads.net/)** API。

#### 方案 A：Crafatar 3D 头部渲染（推荐）

```html
<!-- 用玩家 UUID 获取 3D 等距头部渲染，128px -->
<img src="https://crafatar.com/renders/head/UUID?overlay&size=128"
     alt="KaleidScoper"
     class="member-avatar">
```

优点：3D 等距视角，更有 MC 味道；自动显示头盔层。

#### 方案 B：MCHeads 2D 正面头像

```html
<img src="https://mc-heads.net/avatar/USERNAME/128"
     alt="KaleidScoper"
     class="member-avatar">
```

优点：支持用户名直接查询（无需 UUID）；2D 头像更简洁。

#### 方案 C：MCHeads 全身渲染

```html
<img src="https://mc-heads.net/body/USERNAME/128"
     alt="KaleidScoper"
     class="member-avatar member-avatar--body">
```

优点：展示完整皮肤，视觉冲击力强；适合服主/管理员的突出展示。

### 降级策略

为避免 API 不可用时出现破图，添加 `onerror` 回退到本地图片：

```html
<img src="https://crafatar.com/renders/head/UUID?overlay&size=128"
     onerror="this.src='img/member_placeholder.webp'"
     alt="KaleidScoper"
     class="member-avatar">
```

---

## 四、成员描述内容优化

### 问题

当前描述风格过于随意（"很可爱"、"屠戮无数生灵"），对于宣传页来说既无法传达成员的真实职能，也可能让新访客产生困惑。

### 建议

参考 Parallel SMP 的模式，每位成员的描述应包含：

1. **职能说明**（1 句）—— 在服务器中做什么
2. **个人特色**（1-2 句）—— 保留趣味性，但可理解

| 成员 | 当前描述 | 建议描述 |
|------|---------|---------|
| KaleidScoper | 盘踞出生点 / 大兴土木 / 很可爱 | 服务器的创建者与维护者，负责日常运维和版本更新。热衷于在出生点大兴土木，建造各种宏伟建筑。 |
| b1ack_51av3 | 统治者 / 造成工业污染 / 屠戮无数生灵 | 服务器管理员，协助处理日常事务与玩家问题。在出生点附近建立了庞大的工业体系，是服内最活跃的资源生产者。 |
| 404tomato | 提供农产品 / 消耗下界合金 | 服务器的首席农业专家，建设了多个大型农场，为大家提供稳定的食物供给。 |
| syr2004 | 提供矿石 / 很少上地面 | 痴迷于地底探险与矿脉开采，是服务器矿产资源的重要供给者。 |

> 以上仅为示例文案，实际措辞请根据各成员真实情况调整。核心原则：**先说职能，再说个性**。

---

## 五、卡片布局重构

### 问题

当前所有成员使用统一的小卡片（23.5rem 宽，头像 5rem），缺乏视觉层级。服主卡片与普通成员卡片几乎无差异。

### 建议方案：「核心成员大卡 + 成员网格」双层布局

参考 Age of Elysian 的分层设计：核心团队（服主/管理员）使用大尺寸突出卡片，普通成员使用紧凑网格卡片。

```
┌───────────────────────────────────────────────┐
│  ▎ 栏目标题：团队成员                          │
├───────────────────────────────────────────────┤
│                                               │
│  ┌──────────────────────────────────────────┐  │
│  │  服主大卡（居中，全宽）                    │  │
│  │  [3D全身渲染]  名称 / 角色 / 详细描述     │  │
│  └──────────────────────────────────────────┘  │
│                                               │
│  ┌─────────────┐  ┌─────────────┐            │
│  │ 管理员卡片   │  │ 管理员卡片   │  ← 中等   │
│  └─────────────┘  └─────────────┘            │
│                                               │
│  ┌────────┐ ┌────────┐ ┌────────┐            │
│  │ 成员   │ │ 成员   │ │ 成员   │  ← 紧凑   │
│  └────────┘ └────────┘ └────────┘            │
│                                               │
└───────────────────────────────────────────────┘
```

### 5.1 服主大卡

```html
<div class="team-featured">
  <img src="https://mc-heads.net/body/KaleidScoper/180"
       onerror="this.src='img/kale.png'"
       alt="KaleidScoper"
       class="team-featured__avatar">
  <div class="team-featured__info">
    <span class="member-role member-role--owner">服主 · Owner</span>
    <a href="https://kaleidscoper.github.io" class="team-featured__name">KaleidScoper</a>
    <p class="team-featured__desc">
      服务器的创建者与维护者，负责日常运维和版本更新。热衷于在出生点大兴土木，建造各种宏伟建筑。
    </p>
  </div>
</div>
```

```css
.team-featured {
  display: flex;
  align-items: center;
  gap: 2rem;
  max-width: 48rem;
  margin: 2rem auto 1.5rem;
  padding: 2rem;
  background: var(--background1);
  border-radius: var(--roundness);
  border: 1px solid rgba(241, 196, 15, 0.2);
  transition: all 0.4s ease;
}

.team-featured:hover {
  border-color: rgba(241, 196, 15, 0.4);
  box-shadow: 0 8px 32px rgba(241, 196, 15, 0.1);
  transform: translateY(-4px);
}

.team-featured__avatar {
  width: 160px;
  height: auto;
  flex-shrink: 0;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.4));
  transition: transform 0.4s ease;
  image-rendering: pixelated; /* 保持 MC 像素风格 */
}

.team-featured:hover .team-featured__avatar {
  transform: scale(1.08) rotate(-2deg);
}

.team-featured__info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.team-featured__name {
  font-size: 1.8rem;
  font-weight: 700;
  color: #fff;
  text-decoration: none;
  transition: color 0.3s ease;
}

.team-featured__name:hover {
  color: var(--accent1);
}

.team-featured__desc {
  font-size: 1.05rem;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}
```

### 5.2 成员网格卡片

```html
<div class="team-grid">
  <div class="team-card team-card--admin">
    <img src="https://crafatar.com/renders/head/UUID?overlay&size=96"
         onerror="this.src='img/cs.png'"
         alt="b1ack_51av3"
         class="team-card__avatar">
    <div class="team-card__info">
      <span class="member-role member-role--admin">管理员</span>
      <span class="team-card__name">b1ack_51av3</span>
      <span class="member-tag">出生点统治者</span>
      <p class="team-card__desc">
        协助处理日常事务与玩家问题。在出生点建立了庞大的工业体系。
      </p>
    </div>
  </div>

  <div class="team-card team-card--member">
    <img src="https://crafatar.com/renders/head/UUID?overlay&size=96"
         onerror="this.src='img/tomato.png'"
         alt="404tomato"
         class="team-card__avatar">
    <div class="team-card__info">
      <span class="member-role member-role--member">成员</span>
      <span class="team-card__name">404tomato</span>
      <span class="member-tag">首席农业官</span>
      <p class="team-card__desc">
        建设了多个大型农场，为大家提供稳定的食物供给。
      </p>
    </div>
  </div>

  <!-- 更多成员... -->
</div>
```

```css
.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  max-width: 48rem;
  margin: 0 auto 2rem;
  padding: 0 1rem;
}

.team-card {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem;
  background: var(--background1);
  border-radius: var(--roundness);
  border: 1px solid transparent;
  transition: all 0.4s ease;
}

.team-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.team-card--admin {
  border-color: rgba(248, 47, 47, 0.15);
}
.team-card--admin:hover {
  border-color: rgba(248, 47, 47, 0.35);
  box-shadow: 0 8px 24px rgba(248, 47, 47, 0.08);
}

.team-card--member {
  border-color: rgba(128, 207, 255, 0.1);
}
.team-card--member:hover {
  border-color: rgba(128, 207, 255, 0.3);
  box-shadow: 0 8px 24px rgba(128, 207, 255, 0.08);
}

.team-card__avatar {
  width: 72px;
  height: auto;
  flex-shrink: 0;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));
  image-rendering: pixelated;
  transition: transform 0.3s ease;
}

.team-card:hover .team-card__avatar {
  transform: scale(1.1);
}

.team-card__info {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.team-card__name {
  font-size: 1.2rem;
  font-weight: 700;
  color: #fff;
}

.team-card__desc {
  font-size: 0.95rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.6);
  margin: 0.25rem 0 0;
}
```

### 5.3 角色标签统一样式

```css
.member-role {
  display: inline-block;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.05em;
}

.member-role--owner {
  color: #f1c40f;
}

.member-role--admin {
  color: #f82f2f;
}

.member-role--member {
  color: #80cfff;
}
```

---

## 六、HTML 语义化修正

### 问题

当前所有文本内容都包裹在 `<a>` 标签中（如 `<a class="headline">我们是谁</a>`、`<a class="main5_supporters_description">...</a>`），但这些元素不是超链接，滥用了锚点标签。这会导致：

- 屏幕阅读器将其识别为可交互链接，误导辅助技术用户
- 无法获得正确的 focus/tab 行为
- 不符合 W3C 规范

### 修正映射

| 当前用法 | 修正为 | 理由 |
|---------|--------|------|
| `<a class="headline">` | `<h2 class="headline">` | 栏目标题应使用标题标签 |
| `<a class="...description_rank">` | `<span class="...">` | 纯展示文本 |
| `<a class="...description_title" href="...">` | 保持 `<a>`（有链接时）或改 `<span>`（无链接时） | 有实际 URL 的保留 |
| `<a class="...description">` | `<p class="...">` | 段落文本 |

---

## 七、交互动效增强

### 问题

"我们的特色"栏目的卡片有 hover 缩放效果，"马上开玩"栏目有毛玻璃样式，但"团队成员"栏目完全没有交互反馈，体验不一致。

### 7.1 卡片 Hover 效果

已在第五节 CSS 中包含（`translateY(-3px)` + `box-shadow` + 头像 `scale(1.1)`）。

### 7.2 滚动入场动画（可选）

参考页面已有的 `transition: all .5s` 设计语言，为卡片添加滚动入场效果：

```javascript
document.addEventListener('DOMContentLoaded', () => {
  const observer = new IntersectionObserver(
    (entries) => entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity = '1';
        e.target.style.transform = 'translateY(0)';
        observer.unobserve(e.target);
      }
    }),
    { threshold: 0.1 }
  );
  document.querySelectorAll('.team-card, .team-featured').forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = `opacity 0.5s ease ${i * 0.1}s, transform 0.5s ease ${i * 0.1}s`;
    observer.observe(el);
  });
});
```

### 7.3 MC 皮肤头像 Tooltip（可选）

鼠标悬停在头像上时显示 MC 用户名 tooltip：

```css
.team-card__avatar {
  position: relative;
}

.team-card__avatar[title] {
  cursor: help;
}
```

---

## 八、移动端适配

### 问题

当前移动端（600px 以下）没有针对团队栏目的特殊适配规则。

### 建议

```css
@media only screen and (max-width: 600px) {
  .team-featured {
    flex-direction: column;
    text-align: center;
    padding: 1.5rem;
    gap: 1.25rem;
  }

  .team-featured__avatar {
    width: 120px;
  }

  .team-featured__name {
    font-size: 1.4rem;
  }

  .team-grid {
    grid-template-columns: 1fr;
    padding: 0 0.75rem;
  }
}
```

---

## 九、新增「加入我们」引导（可选增强）

### 动机

Age of Elysian 和 Parallel SMP 等优秀服务器均在团队栏目下方提供招募入口。对于一个希望发展壮大的社区来说，这是将访客转化为参与者的重要环节。

### 建议

在团队成员卡片下方添加一行简洁的招募引导：

```html
<div class="team-recruit">
  <p class="team-recruit__text">想加入我们？</p>
  <a href="#community" class="team-recruit__btn scroll">联系服主</a>
</div>
```

```css
.team-recruit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.team-recruit__text {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

.team-recruit__btn {
  padding: 0.5rem 1.5rem;
  border: 1px solid var(--accent1);
  border-radius: var(--roundness);
  color: #fff;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.4s ease;
}

.team-recruit__btn:hover {
  background: var(--accent2);
  border-color: var(--accent2);
  transform: scale(1.05);
}
```

---

## 十、完整 HTML 结构参考

以下为整合所有优化后的完整 HTML 结构（替换现有 `main5` 区域）：

```html
<div id="about"></div>
<div class="main5">
  <h2 class="headline">团队成员</h2>

  <!-- 服主大卡 -->
  <div class="team-featured">
    <img src="https://mc-heads.net/body/KaleidScoper/180"
         onerror="this.src='img/kale.png'"
         alt="KaleidScoper"
         class="team-featured__avatar">
    <div class="team-featured__info">
      <span class="member-role member-role--owner">服主 · Owner</span>
      <a href="https://kaleidscoper.github.io"
         class="team-featured__name">KaleidScoper</a>
      <p class="team-featured__desc">
        服务器的创建者与维护者，负责日常运维和版本更新。
        热衷于在出生点大兴土木，建造各种宏伟建筑。
      </p>
    </div>
  </div>

  <!-- 成员网格 -->
  <div class="team-grid">
    <div class="team-card team-card--admin">
      <img src="https://mc-heads.net/head/b1ack_51av3/96"
           onerror="this.src='img/cs.png'"
           alt="b1ack_51av3"
           class="team-card__avatar">
      <div class="team-card__info">
        <span class="member-role member-role--admin">管理员</span>
        <span class="team-card__name">b1ack_51av3</span>
        <span class="member-tag">出生点统治者</span>
        <p class="team-card__desc">
          协助处理日常事务与玩家问题。在出生点建立了庞大的工业体系。
        </p>
      </div>
    </div>

    <div class="team-card team-card--member">
      <img src="https://mc-heads.net/head/404tomato/96"
           onerror="this.src='img/tomato.png'"
           alt="404tomato"
           class="team-card__avatar">
      <div class="team-card__info">
        <span class="member-role member-role--member">成员</span>
        <span class="team-card__name">404tomato</span>
        <span class="member-tag">首席农业官</span>
        <p class="team-card__desc">
          建设了多个大型农场，为大家提供稳定的食物供给。
        </p>
      </div>
    </div>

    <div class="team-card team-card--member">
      <img src="https://mc-heads.net/head/syr2004/96"
           onerror="this.src='img/member_placeholder.webp'"
           alt="syr2004"
           class="team-card__avatar">
      <div class="team-card__info">
        <span class="member-role member-role--member">成员</span>
        <span class="team-card__name">syr2004</span>
        <span class="member-tag">地底探险家</span>
        <p class="team-card__desc">
          痴迷于地底探险与矿脉开采，是服务器矿产资源的重要供给者。
        </p>
      </div>
    </div>
  </div>

  <!-- 招募引导 -->
  <div class="team-recruit">
    <p class="team-recruit__text">想加入我们？</p>
    <a href="#community" class="team-recruit__btn scroll">联系服主</a>
  </div>
</div>
```

---

## 十一、实施优先级

| 优先级 | 改动项 | 工作量 | 价值 |
|--------|--------|--------|------|
| **P0** | 栏目标题改为"团队成员" | 极低 | 高 — 符合社区惯例 |
| **P0** | 角色称谓规范化（服主/管理员/成员） | 低 | 高 — 消除新访客困惑 |
| **P0** | HTML 语义化修正（`<a>` → `<h2>`/`<span>`/`<p>`） | 低 | 高 — 基础规范 |
| **P1** | 头像改用 MC 皮肤 API + 降级回退 | 低 | 高 — MC 社区标配做法 |
| **P1** | 卡片布局重构（服主大卡 + 成员网格） | 中 | 高 — 显著提升视觉层级 |
| **P1** | 成员描述内容重写 | 低 | 中 — 需服主提供真实信息 |
| **P2** | 卡片 hover 动效 | 低 | 中 — 与页面其他栏目体验统一 |
| **P2** | 移动端适配补充 | 低 | 中 — 手机端体验改善 |
| **P2** | 趣味标签（member-tag） | 低 | 低 — 锦上添花，保留个性 |
| **P3** | 滚动入场动画 | 低 | 低 — 纯视觉装饰 |
| **P3** | 「加入我们」招募引导 | 低 | 低 — 依据实际运营需求决定 |

---

## 十二、文件变更清单

| 文件 | 操作 |
|------|------|
| `source/mc-server/index.html` | 重写 `main5` 区域的 HTML 结构 |
| `source/mc-server/style.css` | 新增 `.team-featured` / `.team-grid` / `.team-card` / `.member-role` / `.member-tag` / `.team-recruit` 系列样式；可移除旧的 `.main5_supporters_*` 和 `.main5_admins_*` 样式 |
| `source/mc-server/script.js` | （可选）添加滚动入场动画的 IntersectionObserver 代码 |
| `source/mc-server/img/` | 保留现有头像文件作为 API 降级回退 |

> 所有改动局限于 `source/mc-server/` 目录，不影响博客主站或主题模板。

---

## 十三、参考资料汇总

| 参考 | 来源 | 要点 |
|------|------|------|
| Age of Elysian 团队页 | [ageofelysian.com/team](https://ageofelysian.com/team/) | 按职能分层、角色职责说明、强调协作而非等级 |
| Parallel SMP 团队页 | [parallelmc.org/meet-the-team](https://parallelmc.org/meet-the-team/) | 第一人称 bio、细致的角色分类（Owner → Artist → Writer） |
| Evo MC 模板 | [builtbybit.com](https://builtbybit.com/resources/evo-minecraft-server-website-template.77702/) | MC 皮肤头像渲染、Apple 级毛玻璃美学 |
| CreeperHost Staff 页 | [creeperhost.net/staff](https://creeperhost.net/staff) | 头像+职位+详细 bio 的专业化展示 |
| Crafatar API | [crafatar.com](https://crafatar.com/) | 3D MC 皮肤渲染 API，支持 head/body |
| MCHeads API | [mc-heads.net](https://mc-heads.net/) | 2D/3D MC 皮肤头像 API，支持用户名查询 |
