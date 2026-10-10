# 暗色模式与代码块重构历史审查

审查日期：2026-10-10。基线：`main` / `origin/main`，`2a544f8`。开始时工作区干净，执行 `git pull --ff-only origin main` 后确认已是远端最新版本。

本轮仅审查和提出修复优先级，不修改主题实现，不提交或推送。本报告是本轮唯一新增的仓库文件。

## 结论

现有重构方向可以保留：用 CSS 自定义属性切换配色、移除全局暗色通配覆盖、让 Hexo 在构建时完成语法高亮，都有明确的维护收益。没有证据支持为了清债再次重写主题或改变目前认可的视觉设计。

但“视觉已经生效”确实没有覆盖完整验收。确认存在 **7 项需要修复的问题**：评论区状态迁移遗漏、高亮器与样式类名不匹配、多标签页切换失效、Windows 主题构建失败、主题依赖未锁定、普通代码块复制按钮定位错误，以及切换/复制控件的键盘访问问题。其中有本批迁移引入的问题，也有本批重构沿用的旧债，不能全部归因于同一批提交。

本报告将这些问题定为 P2：应安排修复，但目前没有证据表明它们导致全站不可用或数据损坏。实施顺序与严重程度分开：**先恢复可复现的主题构建，再修复状态和渲染契约，最后处理控件与低风险清理。**

## 历史范围与实际链路

| 时间与提交 | 实际改变 | 本次判断 |
| --- | --- | --- |
| 2025-12-04 `8a33c84` | 重写代码高亮规则，使用 VS Code Dark+ 配色；把 `.built_in` 等旧规则改为 `.builtin` 等规则 | 是当前高亮类名问题的重要前身；不是 2026 年才出现的问题 |
| 2026-03-29 `cf8336d` | 删除浏览器端 highlight.js 加载/重复高亮，将亮暗代码配色放入 `custom.styl` | 构建期高亮的方向合理，但沿用了错误/不完整的语法类名映射 |
| 2026-03-29 `9e062bf` | 引入 giscus，增加主题同步和异步就绪后的修正 | 当时读取 `sessionStorage`；后续存储迁移必须同时覆盖这里 |
| 2026-04-23 `92eb855` | 将大型 `custom.styl` 拆回主题 partial；高亮规则、语言标签和普通 `pre/code` 兜底进入 `highlight.styl` | 职责比先前清晰，但复制按钮仍有独立样式与交互契约，未一起验收 |
| 2026-05-25 `97e6a97` | CI 增加主题安装和构建，忽略主题生成产物 | 解决了线上遗漏主题构建的问题；缓存仍引用未提交的主题锁文件 |
| 2026-05-25 `5e64ccf` | 删除 `_darkmode.styl` 全局覆盖，改用 CSS 变量；提前恢复主题；主脚本改用 `localStorage` | 方向正确，但漏迁 giscus，且点击逻辑仍假设存储值等于当前页面状态 |
| 2026-05-25 `4de095f`、`3ff54ae` | 拆出 `_tokens.styl`，复用部分暗色常量 | 不需要推倒；存在少量无消费者的 token 和重复定义 |
| 2026-10-08 至 10-09 | 引用块、打赏弹窗和文章链接的后续调整 | 作为当前基线保留；不能以旧版本配色覆盖已经接受的后续设计 |

当前执行关系如下：

1. 文章经过 Hexo 的高亮处理及 Markdown 渲染，常规围栏代码生成 `figure.highlight > table > td.gutter / td.code`。本站配置为 `syntax_highlighter: highlight.js`、`hljs: false`、`line_number: true`。
2. `source-src/css/style.styl` 导入全局 token 和各 partial，Rollup 输出 `source/dist/main.css`；主脚本打包到 `main.js`。
3. `source/css/ayeria-layout.styl` 和 `source/css/clipboard.styl` 由 Hexo 另行编译。前者需要 `hexo-config()`，这种分离本身不是缺陷。
4. `layout.ejs` 在正文解析前恢复明暗偏好；`ayeria.js` 处理图标和点击；giscus 模板另有异步初始化逻辑。
5. CI 会先构建主题，再运行 Hexo。根目录单独运行 `npm run build` 只运行 Hexo，不能证明主题源码已成功重新打包。

## 已确认问题

### F1 · P2：giscus 遗漏存储迁移，评论区会与正文主题不一致

**位置：** `themes/ayeria/layout/_partial/post/giscus.ejs:14–36`；`themes/ayeria/source-src/js/ayeria.js:224–252`。

**来源：** `5e64ccf` 把主脚本改为 `localStorage`，没有修改 `9e062bf` 引入的 giscus 就绪逻辑。

giscus 仍以 `data-theme="dark"` 启动，只有 `sessionStorage.darkmode == 0` 才注册异步主题修正。主站却依据 `localStorage.darkmode` 恢复主题。当用户已选择亮色、giscus iframe 晚于主脚本加载时，主脚本发送主题时找不到 iframe，模板又没有注册补偿监听，最终正文为亮色、评论区仍为暗色。

**复现证据：** 直接提取仓库中两段主题脚本，在 Node VM 中模拟 iframe 延迟出现：`localStorage='0'`、`sessionStorage=null` 时，正文移除暗色类，监听器未注册，iframe 没有收到主题消息。反向场景 `localStorage='1'`、旧 `sessionStorage='0'` 会在异步回调中错误发送 `light`。

**最小修复方向：** 统一主题状态来源；giscus 就绪时读取当前页面实际主题，而不是在另一套存储上预先决定只发送 `light`。保留默认暗色和用户持久化选择。

**验收：** 保存亮色后重新进入文章，分别模拟 iframe 提前和延后加载；在 iframe 未就绪前切换主题；旧 session 值不能覆盖当前选择。本轮完成的是受控时序复现，没有操作线上评论服务。

### F2 · P2：语法高亮规则与实际输出类名不匹配

**位置：** `themes/ayeria/source-src/css/_partial/highlight.styl:88–101`。

**来源：** `8a33c84` 已包含问题映射，`cf8336d` 和 `92eb855` 将其继续复制、迁移至当前结构。

本地安装的 highlight.js 为 `11.11.1`。使用本项目的 `hexo-util.highlight` 和当前配置生成代码后，实际结果如下：

| 语法内容 | 实际生成的 class | 当前对应规则 | 结果 |
| --- | --- | --- | --- |
| JavaScript/Python 函数名 | `title function_` | `.function` | 不匹配 |
| JavaScript/Python 类名 | `title class_` | `.class` | 不匹配 |
| Python `print` 等内置函数 | `built_in` | `.builtin` | 不匹配 |
| JavaScript/Python 布尔字面量 | `literal` | `.boolean` | 不匹配 |
| JSON 键名、HTML 属性名 | `attr` | `.attribute` | 不匹配；`.attribute` 在 CSS 等语言中另有合法用途 |

这不是“所有高亮都失效”：关键字、字符串、数字仍能着色，所以视觉上容易误判为完整工作。部分语言也确实生成 `.function`，不能简单删除旧规则或做全局字符串替换。

**复现证据：** 浏览器加载从当前 Stylus 源码直接编译的 CSS，在暗色模式下，`Reader`、`run`、`print`、`True` 都是普通前景色 `rgb(212, 212, 212)`；亮色下都回退到 `rgb(56, 58, 66)`。同页关键字、字符串、数字能正确使用各自颜色。

本次本地生成目录中，18 篇文章包含 168 个 `figure.highlight`；其中出现 `built_in` 122 次、`attr` 144 次、`function_` 67 次、`class_` 14 次。计数说明这是实际内容使用的契约，不是仅针对未来语言的推测。

**最小修复方向：** 以现有语法输出为依据补齐选择器，复用现有 `--hl-*` 配色，不更换高亮器。对没有既定配色的语法类别，不凭审查自行增加颜色。

**验收：** JavaScript、Python、JSON、HTML、CSS 样例在亮暗模式下核验实际计算颜色，同时保留 Java 等既有语言的匹配。修复会恢复原先声明但未生效的语法颜色，需要做小范围视觉确认。

### F3 · P2：共享 `localStorage` 后，另一标签页的第一次切换可能没有效果

**位置：** `themes/ayeria/source-src/js/ayeria.js:243–252`。

**来源：** `5e64ccf` 将单标签页的 `sessionStorage` 改成共享的 `localStorage`，但点击分支仍由存储值决定，而不是由该页面当前显示状态决定。

**复现步骤与结果：**

1. A、B 两个页面都显示暗色，存储为 `1`。
2. 在 A 点击切换后，A 为亮色、存储为 `0`；B 仍显示暗色，因为没有跨页同步。
3. 在 B 点击时，逻辑读取 `0`，再次为 B 添加暗色类、写入 `1`。用户点击了切换，但 B 的显示没有改变。

直接运行仓库中 DarkMode 段、共享一份存储并分别保留两份页面状态，已复现这一结果。

**最小修复方向：** 点击基于本页当前状态取反，存储负责持久化。如果产品希望跨页立即同步，再加 `storage` 监听；不把跨页同步扩展为本次最小修复的必要条件。

**验收：** 两个标签页交替切换时，每次点击都必须改变被点击页面；刷新后恢复最后保存的选择。

### F4 · P2：Windows 本地主题构建失败，不能用 Hexo 成功替代验收

**位置：** `themes/ayeria/rollup.config.js:13`；构建依赖链 `rollup-plugin-styles → Stylus/source-map`。

**来源边界：** 旧架构报告 §8.3 已记录构建失败，本轮复现并进一步定位了具体输入。不把这个问题错误归因于新增的 CSS 变量语法，也没有证据把它唯一归因于某个 Node 大版本。

在当前 Windows、Node `v24.18.0` 环境下，`npm --prefix themes/ayeria run build` 退出码为 1，错误为 `TypeError: Invalid URL`。当前配置已经设置 `sourceMap: false`，但插件的 Stylus loader 内部仍先生成并解析 source map，所以这个开关未避开失败路径。

**更小的复现：** 单独让 Stylus 输出 source map，再交给同一份 `source-map@0.7.6`，不经过压缩或 Hexo，也会失败。失败输入形如：

```text
//?/D:/CodexWorkSpace/.../source-src/css/_tokens.styl
base: http://host/
code: ERR_INVALID_URL
```

Windows 扩展长度路径被标准化为 `//?/D:/...` 后，URL 解析器将其当作 URL 处理。仅在诊断脚本的内存对象里把这些来源转换为 `file:///D:/...`，同一 consumer 即可解析 32 个 source。主题文件、配置及 node_modules 均未修改。

**影响：** 当前环境不能通过标准命令从源码产出新主题；根目录 Hexo 仍可能复制本地残留的 `source/dist`，形成“构建成功但主题没有重新生成”的假阳性。本轮浏览器样式复现使用新编译的临时 CSS，不依赖旧 dist。

**最小修复方向：** 先解决该路径处理链，再要求完整 Rollup 构建通过。临时直接编译 Stylus 可以定位 CSS 问题，但不能作为正式发布替代方案。不直接以全面升级 Rollup 或降级 Node 作为未经验证的处方。

**验收：** Windows 工作目录下完整主题构建成功，产出 CSS 和 JS；在 CI 所用 Linux/Node 环境复核同一组锁定依赖。本轮未运行远端 CI，不能据此断言线上部署也失败。

### F5 · P2：主题锁文件被忽略，CI 缓存无法按依赖变化区分

**位置：** `themes/ayeria/.gitignore:7`；`.github/workflows/pages.yml:31–39`；`themes/ayeria/package.json`。

**来源：** 忽略锁文件是更早的主题配置；`97e6a97` 新增 CI 主题安装时却以这个未提交文件的 hash 作为缓存 key。旧架构报告 §8.3 已识别此债，当前仍未解决。

当前本地存在主题 `package-lock.json`，但它被忽略，`git ls-files '*lock*'` 没有该文件。干净 checkout 中缓存步骤发生在主题安装之前，取不到该锁文件 hash，缓存键不会随主题依赖声明变化。主题依赖又使用 `^` 范围，CI 执行 `npm install`，仓库提交本身无法固定完整依赖树。

这说明构建不可复现；不代表每次安装一定不同，也不能把 F4 的某个传递依赖版本直接断言为唯一根因。

**最小修复方向：** 在确认可构建的依赖组合后提交主题锁文件、改用 `npm ci`，让现有缓存 key 实际包含锁文件 hash。根项目已有锁文件，CI 安装也可同时改成 `npm ci`。

**验收：** 空缓存的干净 checkout 与缓存命中构建使用一致依赖；修改锁文件会改变缓存键；不能只在本机已有 node_modules 上通过。

### F6 · P2：普通 `pre/code` 的复制按钮没有对应定位容器

**位置：** `themes/ayeria/source/css/clipboard.styl:3–4,23–25`；`themes/ayeria/layout/_partial/post/clipboard.ejs:13–17`；`themes/ayeria/source-src/css/_partial/highlight.styl:174–187`。

**来源：** 原始复制逻辑可追溯至 `9cca2f2`，`78238d3` 修改按钮外观。后来的代码块重构保留了普通 `pre/code` 兜底，却未补齐其定位契约。这是沿用的旧债。

JS 同时向高亮块和 `.article pre code` 插入复制按钮；CSS 却仅为 `.highlight` 设置定位上下文。普通 `pre` 没有 `position: relative`，绝对定位的按钮会落到更外层的定位祖先。

**复现证据：** 临时页面中普通代码块顶部为 `y=1076px`，其按钮顶部却为 `y=25px`，位置明显不属于代码块。本地实际文章 `2023-09-06-javascript-redirect-snippet` 生成的就是 `<pre><code class="language-html">`，并非不存在的支持分支。该文章围栏未闭合是另一个内容问题，不改变主题已有兜底分支应正确定位的事实。

**最小修复方向：** 为普通代码块明确复制按钮的定位容器，并核对长行滚动后的可达性；保留正常高亮块现有布局。

**验收：** 两类代码块的按钮都位于所属块内，宽窄视口和横向滚动后仍可操作。本轮只验证按钮布局，未用临时 ClipboardJS 替身声称真实剪贴板写入已通过。

### F7 · P2：主题切换与复制控件的键盘路径不完整

**位置：** `themes/ayeria/layout/_partial/float-btns.ejs:4–7`；`themes/ayeria/source/css/clipboard.styl:26–37`；`themes/ayeria/source-src/css/style.styl:49–51`。

**来源：** 更早的控件实现遗留，`310ad09` 等外观调整沿用了其结构；不是五月变量重构独有的回归。

- 主题开关是仅监听 `click` 的 `div`，没有 `tabindex`、可访问名称或原生按钮语义，不能通过常规 Tab/Enter/Space 操作。
- 复制按钮虽然是 `button`，但仅在鼠标 hover 时显现。Tab 聚焦后仍为 `opacity: 0`，全局 `outline: 0` 又消除了默认焦点提示。

**复现证据：** 在浏览器中从测试页首个按钮按 Tab，焦点进入 COPY，计算样式仍为 `opacity: 0`、`outline: none 0px`。

**最小修复方向：** 主题开关使用有名称和状态的原生按钮；复制按钮在 `:focus-visible` / 容器 `:focus-within` 时显示，并提供焦点提示。不改变默认鼠标浏览时的外观。

**验收：** 仅使用键盘即可找到、辨认并激活两类控件，且图标、主题与可访问状态一致。

## P3：可在对应修复中顺带处理的维护债

1. **未消费的全局代码 token。** `_tokens.styl` 定义 `--color-code-bg` / `--color-code-text`，实际行内代码却使用 `highlight.styl` 中另一套 `--inline-code-*`。扫描当前主题和站点 CSS/Stylus，前者只有定义、没有消费。应选择复用或删除，避免维护者修改一个看似有效却没有效果的入口；不必扩大为全站 token 重命名。
2. **代码表格受正文表格规则影响。** `_extend.styl` 的正文 `table td` 比 `.highlight td` 更具体。本轮浏览器中 gutter/code 的 padding 实际都是 `5px 10px`，并非 `highlight.styl` 声明的 `0`。这首先是规则归属不清，而不是必须立刻改掉的视觉缺陷。先记录当前尺寸基线，再在整理作用域时保持计算后的视觉尺寸，不能只删 `!important` 或加更强覆盖。
3. **维护文档需要随修复更正。** 旧架构报告 §3.4 将存储迁移视为完成，但没有覆盖 giscus；设计技能仍把切换描述为 `sessionStorage`。这些应在实际修复验收后更新，而不是现在继续标“已修复”。本轮未改技能或旧报告。

## 修复批次与验收边界

| 批次 | 范围 | 完成标准 |
| --- | --- | --- |
| 第一批：构建基础 | F4、F5 | 修通 Windows 完整主题构建；锁定依赖；干净 checkout 与 CI 构建均可重复 |
| 第二批：暗色状态 | F1、F3，主题开关部分 F7 | 默认暗色、持久化亮色、iframe 延迟和多标签页点击均正确；不引入跟随系统第三态 |
| 第三批：代码块 | F2、F6，复制按钮部分 F7 | 补齐实际语法类名；两类代码块可复制且按钮定位/焦点正确；保留现有色板、字体与整体尺寸 |
| 后续清理 | P3 项 | 在相关修复里小范围消除重复与过期说明，不开展无关组件重构 |

每批独立审查 diff，并在实施时依据仓库约定同步独立主题仓库。本轮没有修改或验证独立主题仓库。

**不建议顺带做：** 翻转 `:root` 与 `body.darkmode` 的含义、取消本站默认暗色、增加自动跟随系统、替换高亮引擎、移除全部 jQuery、重写所有 CSS 变量或机械清除 `!important`。这些都不是解决上述已复现问题的前置条件。

## 本轮验证记录及限制

| 检查 | 结果与含义 |
| --- | --- |
| 拉取与基线 | `git pull --ff-only origin main` 返回已是最新；基线 `2a544f8` |
| 历史追踪 | 检查关键提交 diff、重命名前的 `themes/ayer` 历史、当前消费者和相关 blame；不依据提交说明直接判定修复完成 |
| 主题标准构建 | Windows / Node `v24.18.0` 失败，退出码 1；已缩小至 source map 路径解析 |
| Stylus 直接编译 | 成功；生成临时审查 CSS，未覆盖仓库主题产物；编译 CSS 中未发现使用了却未定义的 CSS 自定义属性 |
| 主题现有测试 | `npm --prefix themes/ayeria test` 通过；该命令只是 Stylint，不能覆盖本报告的交互、渲染契约和完整打包问题 |
| Hexo 构建 | 根目录 `npm run build` 退出码 0；仍报告 `_drafts/漂海录创意文档.md` 的 YAML 错误及 KaTeX 警告。这些是已有内容问题，未纳入主题修复 |
| 实际内容扫描 | 本地生成目录中识别到 18 篇含高亮块的文章、168 个高亮块，以及一篇普通 `pre/code` 文章；这不是对线上部署的抓取统计 |
| 浏览器复现 | 使用当前源码编译的 CSS、实际高亮器生成的 HTML、仓库复制按钮注入逻辑，核验亮暗颜色、普通代码块定位和键盘焦点；剪贴板库使用替身，仅用于隔离布局验证 |
| 主题状态复现 | Node VM 直接执行提取的主题脚本，模拟 iframe 晚到和共享存储双页面；不是线上评论服务的端到端测试 |
| 变更范围 | 只新增本报告；未修复主题、未更新依赖、未 commit/push、未触发部署 |

已有验证足以支持上述具体发现，不代表完成了全站安全审计或所有浏览器、移动设备的全面兼容性验收。
