请修改我的 Hexo 主题中的侧栏模板文件 `sidebar.ejs`，为菜单项添加多种打开方式的支持。

**需求说明**

_config.ayeria.yml 中给出的菜单配置目前为扁平的 `key: url` 结构，需要在保持向下兼容的前提下，扩展为支持对象格式，新增 `target` 字段控制链接打开方式。Schema 如下：

```yaml
menu:
  全部文章: /archives               # 需继续支持的旧格式，行为等同 target: current
  关于本站:
    url: /about
    target: current                 # 在当前标签页打开（默认行为）
  Music:
    url: https://music.example.com
    target: popup                   # 以小窗口打开，后文详述
    popup_width: 380                # 可选，默认 380
    popup_height: 620               # 可选，默认 620
  GitHub:
    url: https://github.com
    target: blank                   # 在新标签页打开
```

**`target` 的三种值**

- `current`：当前标签页打开，即现有默认行为，`target` 未定义时也应回落到此
- `blank`：新标签页打开，渲染为带 `target="_blank" rel="noopener noreferrer"` 的 `<a>` 标签
- `popup`：调用 `window.open` 以小窗口打开，窗口名使用菜单项的 key（如 `popup-Music`），使同一菜单项多次点击复用同一窗口而非重复新开；`href` 保留有效 URL 作为 JS 禁用时的降级跳转

**兼容性要求**

- 旧格式（`key: url` 字符串）必须继续正常工作，不得需要用户修改现有配置
- 所有路径继续使用原方式包裹，避免引发全站bug
- 其他未提到的架构优雅度问题。

**目标文件**

仅应修改与功能有关的文件，其余部分保持不变。
