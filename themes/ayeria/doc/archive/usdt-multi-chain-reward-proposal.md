# USDT 多链打赏渠道方案

> 日期: 2026-03-29
> 状态: 已实施 (Implemented) — 2026-03-29 采纳方案 B 并完成代码落地

## 1. 问题背景

USDT (Tether) 是一种多链稳定币，同时部署在 Tron (TRC-20)、Ethereum (ERC-20)、BSC (BEP-20)、Polygon、Solana 等多条链上。用户转账时**必须选择正确的链**，否则资产将丢失。因此，在打赏 UI 中必须为 USDT 提供「链选择」步骤。

### 当前打赏系统架构

配置 (`_config.ayer.yml`) 采用扁平的 `channels` 数组，每个渠道包含 `name / icon / color / qrcode / description / link` 字段。模板 (`modal.ejs`) 将数组渲染为一级 tab + 对应的二维码面板，JS (`ayer.js`) 通过 `data-index` 完成切换。

**核心矛盾**: 当前架构是「一个渠道 = 一个二维码」的扁平映射，不支持「一个渠道下有多个子选项」。

---

## 2. 方案对比

### 方案 A — 扁平展开：每条链作为独立顶级渠道

将 USDT 各链拆成独立 channel 条目：

```yaml
reward:
  channels:
    # ...微信、支付宝、BTC...
    - name: "USDT (TRC-20)"
      icon: "ri-coin-line"
      color: "#50AF95"
      qrcode: "/images/reward/USDT-TRC20.webp"
      description: "Tron 链 · 推荐"
    - name: "USDT (ERC-20)"
      icon: "ri-coin-line"
      color: "#50AF95"
      qrcode: "/images/reward/USDT-ERC20.webp"
      description: "以太坊链"
```

| 维度 | 评价 |
|------|------|
| 代码改动 | **零**，纯配置 |
| UX | **差** — 顶级 tab 膨胀，同一币种出现多个外观相同的 tab，用户需从杂乱列表中辨认链名 |
| 可扩展性 | **差** — 每增加一条链就多一个顶级 tab；若未来支持 ETH、SOL 等多链币种，tab 数量将爆炸 |
| 业界惯例 | **不符合** — 主流加密货币支付页面 (BitPay, Coinbase Commerce, NOWPayments) 均采用「先选币种 → 再选网络」的两级交互 |

**结论: 仅适合临时验证，不推荐作为正式方案。**

---

### 方案 B — 嵌套子渠道 `children`（推荐）

在 channel schema 中引入可选的 `children` 数组，实现「选币种 → 选链」的二级交互。

```yaml
reward:
  channels:
    - name: "微信支付"
      icon: "ri-wechat-pay-line"
      color: "#07C160"
      qrcode: "/images/reward/wechat.jpg"
      description: "微信扫一扫"

    - name: "支付宝"
      icon: "ri-alipay-line"
      color: "#1677FF"
      qrcode: "/images/reward/alipay.jpg"
      description: "支付宝扫一扫"

    - name: "比特币"
      icon: "ri-bitcoin-line"
      color: "#F7931A"
      qrcode: "/images/reward/BTC.webp"
      description: "扫码转账 BTC"

    - name: "USDT"
      icon: "ri-coin-line"
      color: "#50AF95"
      description: "选择网络后扫码转账"
      children:
        - name: "TRC-20"
          badge: "推荐"
          qrcode: "/images/reward/USDT-TRC20.webp"
          description: "Tron 链 · 手续费最低"
        - name: "ERC-20"
          qrcode: "/images/reward/USDT-ERC20.webp"
          description: "以太坊主网"
        - name: "BEP-20"
          qrcode: "/images/reward/USDT-BEP20.webp"
          description: "BSC (币安智能链)"
```

| 维度 | 评价 |
|------|------|
| 代码改动 | 中等 — 需修改 `modal.ejs` / `ayer.js` / `custom.styl` 三个文件 |
| UX | **优秀** — 顶级 tab 仍为「USDT」一个，点击后在面板内展示链选择器，符合「先选币 → 再选链」的直觉 |
| 可扩展性 | **好** — 任何多链币种 (USDC、ETH L2 等) 都可复用 `children` 结构；单链币种保持原有写法，完全向后兼容 |
| 业界惯例 | **符合** — 与 BitPay、Binance Pay、OKX 等主流支付界面的二级选择模式一致 |
| 向后兼容 | **完全兼容** — 没有 `children` 的渠道走原有逻辑，不影响微信/支付宝/BTC 等现有渠道 |

**结论: 推荐采用此方案。**

---

## 3. 方案 B 详细设计

### 3.1 配置 Schema

在现有 channel 字段基础上，增加可选的 `children` 数组。当 `children` 存在且非空时，父级的 `qrcode` 字段**不再需要**（由子项各自提供），父级的 `description` 作为面板顶部的引导文字。

```
channel (顶级渠道)
├── name         : string    # 显示名称（必填）
├── icon         : string    # RemixIcon 类名（必填）
├── color        : string    # 品牌色（必填）
├── qrcode       : string    # 二维码路径（无 children 时必填）
├── description  : string    # 辅助文字（可选）
├── link         : string    # 外链（可选）
└── children     : array     # 子渠道（可选，存在时为多链模式）
    └── sub-channel
        ├── name        : string  # 链/网络名称（必填）
        ├── badge       : string  # 角标文字如「推荐」（可选）
        ├── qrcode      : string  # 二维码路径（必填）
        ├── description : string  # 辅助说明（可选）
        └── link        : string  # 外链（可选）
```

### 3.2 交互流程

```
用户点击「赏杯茶」按钮
  └─ 弹出打赏弹层
      └─ 顶部一级 Tab: [微信支付] [支付宝] [比特币] [USDT]
          │
          ├─ 点击 [微信支付] → 直接显示微信二维码（原有逻辑）
          ├─ 点击 [支付宝]   → 直接显示支付宝二维码（原有逻辑）
          ├─ 点击 [比特币]   → 直接显示 BTC 二维码（原有逻辑）
          └─ 点击 [USDT]     → 面板内显示二级链选择器:
              │
              │  ┌─────────────────────────────────────┐
              │  │  选择网络后扫码转账                    │  ← 父级 description
              │  │                                       │
              │  │  [TRC-20 推荐] [ERC-20] [BEP-20]     │  ← 子渠道 sub-tabs
              │  │                                       │
              │  │       ┌──────────────┐                │
              │  │       │  QR Code     │                │  ← 当前选中子渠道的二维码
              │  │       └──────────────┘                │
              │  │   Tron 链 · 手续费最低                 │  ← 子渠道 description
              │  └─────────────────────────────────────┘
              │
              └─ 切换子 tab → 面板内二维码平滑切换
```

### 3.3 模板修改 (`modal.ejs`)

需改动的区域是 `reward-panels` 内的 `forEach` 循环。当渠道有 `children` 时，渲染二级 sub-tabs 和对应的 sub-panels；否则保持原有的单二维码渲染。

```ejs
<div class="reward-panels">
  <% channels.forEach(function(ch, i) { %>
  <div class="reward-panel<%= i === 0 ? ' active' : '' %>" data-index="<%= i %>">

    <% if (ch.children && ch.children.length) { %>
      <%/* ── 多链模式: 二级选择器 ── */%>
      <% if (ch.description) { %>
      <p class="reward-chain-hint"><%= ch.description %></p>
      <% } %>
      <div class="reward-sub-tabs">
        <% ch.children.forEach(function(sub, j) { %>
        <button class="reward-sub-tab<%= j === 0 ? ' active' : '' %>"
                data-parent="<%= i %>" data-sub="<%= j %>">
          <%= sub.name %>
          <% if (sub.badge) { %>
          <span class="reward-sub-badge"><%= sub.badge %></span>
          <% } %>
        </button>
        <% }); %>
      </div>
      <% ch.children.forEach(function(sub, j) { %>
      <div class="reward-sub-panel<%= j === 0 ? ' active' : '' %>"
           data-parent="<%= i %>" data-sub="<%= j %>">
        <div class="reward-qrcode-wrap">
          <img class="reward-qrcode" src="<%- url_for(sub.qrcode) %>" alt="<%= ch.name %> - <%= sub.name %>">
        </div>
        <% if (sub.description) { %>
        <p class="reward-desc"><%= sub.description %></p>
        <% } %>
        <% if (sub.link) { %>
        <a class="reward-link" href="<%= sub.link %>" target="_blank" rel="noopener">
          前往<%= sub.name %> <i class="ri-external-link-line"></i>
        </a>
        <% } %>
      </div>
      <% }); %>

    <% } else { %>
      <%/* ── 单渠道模式: 原有逻辑不变 ── */%>
      <div class="reward-qrcode-wrap">
        <img class="reward-qrcode" src="<%- url_for(ch.qrcode) %>" alt="<%= ch.name %>">
      </div>
      <% if (ch.description) { %>
      <p class="reward-desc"><%= ch.description %></p>
      <% } %>
      <% if (ch.link) { %>
      <a class="reward-link" href="<%= ch.link %>" target="_blank" rel="noopener">
        前往<%= ch.name %> <i class="ri-external-link-line"></i>
      </a>
      <% } %>
    <% } %>

  </div>
  <% }); %>
</div>
```

### 3.4 JS 修改 (`ayer.js`)

在现有 tab 切换逻辑之后，增加 sub-tab 切换处理：

```js
// Sub-channel tab switching (multi-chain support)
$(document).on("click", ".reward-sub-tab", function () {
  var $this = $(this);
  var parent = $this.data("parent");
  var sub = $this.data("sub");

  // 只切换同一父面板内的 sub-tab
  var $panel = $('.reward-panel[data-index="' + parent + '"]');
  $panel.find(".reward-sub-tab").removeClass("active");
  $this.addClass("active");

  $panel.find(".reward-sub-panel").removeClass("active");
  $panel.find('.reward-sub-panel[data-sub="' + sub + '"]').addClass("active");
});
```

这段代码的设计要点：
- 通过 `data-parent` 限定作用域，确保多个多链渠道不会互相干扰
- 不影响一级 tab 的切换逻辑
- 沿用现有的 `active` class 切换模式，保持代码一致性

### 3.5 CSS 修改 (`custom.styl`)

在 `@css { ... }` 块内 reward 相关样式之后追加：

```css
/* ===== 打赏弹层 — 多链子选择器 ===== */
.reward-chain-hint {
  text-align: center;
  font-size: 13px;
  color: var(--reward-subtext) !important;
  margin: 0 0 12px 0;
}

.reward-sub-tabs {
  display: flex;
  gap: 6px;
  justify-content: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.reward-sub-tab {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 14px;
  border: 1px solid var(--reward-border);
  border-radius: 14px;
  background: transparent;
  color: var(--reward-tab-text);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.25s ease;
  font-family: inherit;
  line-height: 1.4;
}

.reward-sub-tab:hover {
  border-color: var(--reward-accent);
  color: var(--reward-accent);
}

.reward-sub-tab.active {
  background: var(--reward-accent);
  border-color: var(--reward-accent);
  color: #fff !important;
}

.reward-sub-badge {
  font-size: 10px;
  padding: 1px 5px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.25);
  line-height: 1.3;
}

.reward-sub-tab:not(.active) .reward-sub-badge {
  background: var(--reward-tab-bg);
  color: var(--reward-accent);
}

/* 子面板复用父级面板的动画 */
.reward-sub-panel {
  display: none;
  text-align: center;
  animation: rewardFadeIn 0.25s ease;
}

.reward-sub-panel.active {
  display: block;
}
```

设计要点:
- 二级 sub-tab 使用 `border` 风格（而非实底），视觉上与一级 tab 形成层级区分
- `badge` 角标用半透明背景，不喧宾夺主
- 复用已有的 `rewardFadeIn` 动画，保持切换体验一致
- 暗色模式自动继承 CSS 变量，无需额外适配

---

## 4. 改动清单

| 文件 | 改动类型 | 说明 |
|------|---------|------|
| `_config.ayer.yml` | 配置 | 添加 USDT 渠道条目及 `children` |
| `themes/ayer/layout/_partial/modal.ejs` | 模板 | `reward-panels` 循环内增加 `children` 分支 |
| `themes/ayer/source-src/js/ayer.js` | 脚本 | 增加 `.reward-sub-tab` 点击事件 |
| `themes/ayer/source/css/custom.styl` | 样式 | 增加 sub-tabs / sub-panel 相关样式 |
| `source/images/reward/USDT-*.webp` | 资源 | 各链收款二维码图片（需自行生成） |

---

## 5. 向后兼容性说明

- 没有 `children` 字段的渠道（微信、支付宝、比特币等）走原有的 `else` 分支，逻辑和渲染**完全不变**
- 模板通过 `ch.children && ch.children.length` 做特性检测，不会因缺少字段而报错
- JS 事件委托绑定在 `.reward-sub-tab` 上，若页面无此元素则不会触发
- CSS 样式仅在存在 `.reward-sub-tabs` 时生效

因此此方案是**纯增量改动**，不会影响任何现有功能。

---

## 6. 未来扩展

此 `children` 机制同样适用于：

- **USDC** — 同为多链稳定币
- **ETH** — 主网 + L2 (Arbitrum, Optimism, Base 等)
- 任何未来的多链资产

无需再对架构做任何修改，只需在配置中追加 `children` 条目即可。
