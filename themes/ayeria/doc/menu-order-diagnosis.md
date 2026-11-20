# 侧边栏菜单顺序不可覆盖问题诊断报告

> 生成日期：2026-05-14  
> 调查范围：`themes/ayeria/` 全目录、Hexo 核心库 `node_modules/hexo/`、`node_modules/hexo-util/`、`node_modules/deepmerge/`  
> 关键文件：`themes/ayeria/_config.yml`、站点根 `_config.ayeria.yml`、`layout/_partial/sidebar.ejs`、`node_modules/hexo/dist/hexo/load_theme_config.js`、`node_modules/hexo/dist/hexo/index.js`、`node_modules/hexo-util/dist/deep_merge.js`、`node_modules/deepmerge/dist/cjs.js`

---

## 一、问题描述

用户将主题发布后，安装者按推荐流程操作——

1. 将 `themes/ayeria/_config.yml` 复制到站点根目录，重命名为 `_config.ayeria.yml`；
2. 在 `_config.ayeria.yml` 中自定义 `menu` 映射的条目及顺序。

实际渲染结果与预期不符，具体表现为：

- **主题内置的菜单项**（如 `主页`、`全部文章` 等）按**主题默认配置文件的相对顺序**排列，而非用户在 `_config.ayeria.yml` 中指定的顺序；
- **用户新增的菜单项**（即仅存在于 `_config.ayeria.yml`、不存在于主题 `_config.yml` 的条目）被追加到列表**末尾**，而非用户指定的位置；
- **用户已从 `_config.ayeria.yml` 中删除的主题内置菜单项**仍然出现在渲染页面上。

---

## 二、配置合并链路溯源

### 2.1 阶段一：主题默认配置加载

Hexo 主题盒子（`hexo/dist/theme/processors/config.js`）在扫描 `themes/ayeria/` 目录时，使用正则 `^_config\.\w+$` 匹配配置文件。命中 `_config.yml` 后，将其解析结果直接赋给 `file.box.config`，即 `ctx.theme.config`。

```
ctx.theme.config ← themes/ayeria/_config.yml（主题默认配置）
```

### 2.2 阶段二：站点级覆盖配置加载

`hexo/dist/hexo/load_theme_config.js` 在 `load_theme_config` 钩子中执行：

```js
// node_modules/hexo/dist/hexo/load_theme_config.js，第 38–39 行
ctx.config.theme_config = ctx.config.theme_config
    ? deepMerge(config, ctx.config.theme_config) : config;
```

其中 `config` 为 `_config.ayeria.yml` 的解析结果。若站点主配置 `_config.yml` 未使用旧式内联 `theme_config:` 块（绝大多数用户），则：

```
ctx.config.theme_config ← _config.ayeria.yml（用户覆盖配置）
```

### 2.3 阶段三：最终合并

渲染前，`hexo/dist/hexo/index.js` 的 `mergeCtxThemeConfig()` 函数执行：

```js
// node_modules/hexo/dist/hexo/index.js，第 40–42 行
if (ctx.config.theme_config) {
    ctx.theme.config = deepMerge(ctx.theme.config, ctx.config.theme_config);
}
```

调用形式为：

```
ctx.theme.config = deepMerge(主题默认配置, 用户覆盖配置)
```

第一参数（**target**）是主题默认配置；第二参数（**source**）是用户覆盖配置。

---

## 三、根因：deepmerge 的对象合并语义

`deepMerge` 最终调用 `deepmerge` 库（`node_modules/deepmerge/dist/cjs.js`）的 `mergeObject(target, source)` 函数：

```js
function mergeObject(target, source, options) {
    var destination = {};

    // 第一步：将 target（主题默认配置）的所有键原序复制进 destination
    if (options.isMergeableObject(target)) {
        getKeys(target).forEach(function(key) {
            destination[key] = clone(target[key]);
        });
    }

    // 第二步：遍历 source（用户覆盖配置）的键
    getKeys(source).forEach(function(key) {
        if (key 已存在于 target 且 source[key] 是可合并对象) {
            destination[key] = deepmerge(target[key], source[key]); // 递归合并
        } else {
            destination[key] = clone(source[key]); // 用 source 值覆盖，或追加新键
        }
    });

    return destination;
}
```

### 3.1 对 `menu` 对象的具体作用

`menu` 在 YAML 中是一个**映射（plain object）**，所有值均为字符串（非可合并对象）。以下面的典型场景为例：

**主题默认 `_config.yml`（target）：**
```yaml
menu:
  主页: /
  全部文章: /archives
  文章分类: /categories
  全部标签: /tags
  友情链接: /friends
  关于本站: /about
```

**用户 `_config.ayeria.yml`（source）：**
```yaml
menu:
  全部文章: /archives
  文章分类: /categories
  全部标签: /tags
  电子手办: /waifu        # 用户新增
  MC 私服: /mc-server    # 用户新增
  友情链接: /friends
  关于本站: /about
  # 用户删除了"主页"
```

`mergeObject` 执行过程：

**第一步（第 3–5 行）**——将 target 所有键原序写入 `destination`：

```
destination = {
    主页: '/',          ← 用户已删除，仍被复制进来
    全部文章: '/archives',
    文章分类: '/categories',
    全部标签: '/tags',
    友情链接: '/friends',
    关于本站: '/about'
}
```

**第二步（第 7–11 行）**——遍历 source 的键：

| source 键 | 已存在于 destination？ | 操作 | 结果 |
|---|---|---|---|
| `全部文章` | 是 | 值覆盖，**键位置不变** | 位置仍在第二 |
| `文章分类` | 是 | 值覆盖，**键位置不变** | 位置仍在第三 |
| `全部标签` | 是 | 值覆盖，**键位置不变** | 位置仍在第四 |
| `电子手办` | **否** | 插入新键 → **追加到末尾** | 位置第七 |
| `MC 私服` | **否** | 插入新键 → **追加到末尾** | 位置第八 |
| `友情链接` | 是 | 值覆盖，**键位置不变** | 位置仍在第五 |
| `关于本站` | 是 | 值覆盖，**键位置不变** | 位置仍在第六 |

**最终 `destination` 对象（键序即插入序）：**

```
主页 → /            # 用户已删除但仍存在
全部文章 → /archives
文章分类 → /categories
全部标签 → /tags
友情链接 → /friends   # 顺序仍按主题默认
关于本站 → /about
电子手办 → /waifu     # 被追加到末尾
MC 私服 → /mc-server  # 被追加到末尾
```

V8/现代 JS 引擎对非整数字符串属性保证保留插入顺序，因此上述键序在模板遍历时得到忠实体现。

### 3.2 三种表现的统一解释

| 用户观察到的现象 | 直接原因 |
|---|---|
| 内置菜单项按主题默认顺序排列 | `mergeObject` 第一步先按 target 的键序填充 `destination` |
| 用户新增的菜单项出现在末尾 | 新键在第二步被追加，JavaScript 对象新键始终位于已有键之后 |
| 用户删除的主题内置项仍出现 | 第一步无条件复制 target 所有键；第二步不处理"source 中不存在的 target 键" |

---

## 四、受影响的配置项

`deepmerge` 对所有 YAML **映射（plain object）** 类型的配置项均使用相同语义。与 `menu` 结构相同、同样受到顺序/删除问题影响的配置项还包括：

- **`friends_link`**（友链列表）：与 `menu` 完全同构，顺序和删除行为受到同等影响。

`subtitle`、`cover`、`reward`、`nav_text` 等**嵌套对象**类型的配置项同样经过 `deepmerge`，但用户通常只需要覆盖其中特定键的值，不需要控制键序，因此不表现为可感知的 bug。

---

## 五、模板层的关联行为

`layout/_partial/sidebar.ejs` 使用 `for...in` 遍历 `theme.menu`：

```ejs
<% for (var i in theme.menu){ %>
<li class="nav-item">
  <a class="nav-item-link" href="<%- url_for(theme.menu[i]) %>"><%= i %></a>
</li>
<% } %>
```

`for...in` 在现代 JS 引擎中对非整数字符串属性同样遵循插入顺序，与 `deepmerge` 产生的键序一致。因此模板层不会额外引入乱序，根因完全在配置合并层。

---

## 六、问题边界

- **此问题仅在用户同时拥有主题 `_config.yml` 与站点 `_config.ayeria.yml` 时触发。** 在主题作者自己的开发环境中，`_config.yml` 被重命名为 `_config.yml.old`（不符合正则 `^_config\.\w+$`，不会被加载），`ctx.theme.config` 初始为空对象 `{}`，`deepMerge({}, userOverride)` 的结果即 userOverride 本身，顺序完全正确——这也是为何开发者无法在本地复现的原因。

- **此问题与 Hexo 版本无关。** 合并逻辑存在于 `hexo-util` 的 `deepMerge` 及其依赖的 `deepmerge` 库，是 Hexo 5 引入 `_config.[theme].yml` 机制以来所有版本的一致行为。

---

*报告结束*
