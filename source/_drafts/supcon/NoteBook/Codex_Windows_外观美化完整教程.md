# Codex Windows 外观美化完整教程

> 目标：在 Windows 版 Codex 中使用“思源宋体 VF”作为界面字体、`SF Mono` 作为代码字体，并导入指定的暖色浅色主题。
>
> 本文档是自包含操作手册。除 Codex、Windows 和网络连接外，不需要自行搜索其他资料。文中已经列出下载链接、手动操作步骤、自动化提示词和故障排查方法。
>
> 最后核对日期：2026-07-20。

---

## 1. 最终效果与原始主题

需要导入的主题如下：

```text
codex-theme-v1:{"codeThemeId":"absolutely","theme":{"accent":"#da7756","contrast":60,"fonts":{"code":"SF Mono","ui":"思源宋体 VF"},"ink":"#1d1b16","opaqueWindows":true,"semanticColors":{"diffAdded":"#00c853","diffRemoved":"#ff5f38","skill":"#cc7d5e"},"surface":"#f5f3ee"},"variant":"light"}
```

该主题的主要视觉设置：

- 模式：浅色。
- 窗口背景：暖米白色 `#f5f3ee`。
- 主要文字：暖黑色 `#1d1b16`。
- 强调色：陶土橙色 `#da7756`。
- 界面字体：思源宋体可变字体。
- 代码字体：SF Mono。
- Diff 新增：绿色 `#00c853`。
- Diff 删除：橙红色 `#ff5f38`。
- Skill 标识：棕橙色 `#cc7d5e`。
- 窗口背景不透明。

---

## 2. 下载链接

### 2.1 思源宋体 VF

推荐下载 Windows 适用的 TTF 可变字体：

- 直接下载：  
  <https://github.com/adobe-fonts/source-han-serif/raw/release/Variable/TTF/SourceHanSerifSC-VF.ttf>

- Adobe 官方 GitHub 项目：  
  <https://github.com/adobe-fonts/source-han-serif>

- 官方 Releases 页面：  
  <https://github.com/adobe-fonts/source-han-serif/releases/latest>

直接下载文件名应为：

```text
SourceHanSerifSC-VF.ttf
```

这是简体中文语言版本的可变字体。Windows 上优先使用 TTF 版本，可避开旧版 Windows 对部分 CFF2 可变 OTF 字体的兼容问题。

### 2.2 SF Mono

Apple 官方下载页：

- 字体页面：  
  <https://developer.apple.com/fonts/>

- SF Mono 官方安装包直链：  
  <https://devimages-cdn.apple.com/design/resources/download/SF-Mono.dmg>

Apple 提供的是 macOS 使用的 `.dmg` 安装包，而不是直接提供 Windows `.otf` 文件。字体本身位于安装包内部，Windows 用户需要解包后再安装。本文后面提供全自动提示词。

### 2.3 7-Zip

用于在 Windows 上解开 Apple 的 DMG 和 PKG 安装包。

- 官方网站：  
  <https://www.7-zip.org/>

Codex 也可以直接通过 Windows 包管理器安装：

```powershell
winget install --id 7zip.7zip --exact --accept-package-agreements --accept-source-agreements
```

---

## 3. 推荐方案：让 Codex 完成大部分操作

这是最省事的方式。

### 3.1 准备工作

1. 打开 Windows 版 Codex。
2. 新建一个临时空目录，例如：

```text
D:\CodexThemeSetup
```

3. 在 Codex 中打开该目录。
4. 使用允许执行 PowerShell 和访问网络的模式。若你的 Codex 提供 `Full Access`，可使用该模式。
5. 将下面的完整提示词交给 Codex。

### 3.2 完整自动化提示词

```text
请在当前 Windows 电脑上配置 Codex 外观主题。你可以执行 PowerShell 命令、下载文件、解压文件和安装字体，但必须遵守以下限制：

1. 不修改、替换、注入或反编译 Codex 的程序文件。
2. 不编辑 Codex 安装目录中的内部资源。
3. 字体只允许从下列明确列出的来源下载。
4. 不从搜索引擎、字体下载站或其他第三方来源下载字体。
5. 不绕过 Windows 权限控制；需要管理员权限时，正常触发 UAC。
6. 所有下载文件先保存到当前工作目录下的 downloads 子目录。
7. 所有解压文件保存到当前工作目录下的 extracted 子目录。
8. 执行前先检查当前状态，避免重复安装。
9. 每一阶段完成后，将结果写入当前目录下的 codex-theme-setup-log.md。
10. 如果某一步失败，先分析并尝试合理替代方案；不要修改 Codex 内部文件作为替代。

需要使用的主题：

codex-theme-v1:{"codeThemeId":"absolutely","theme":{"accent":"#da7756","contrast":60,"fonts":{"code":"SF Mono","ui":"思源宋体 VF"},"ink":"#1d1b16","opaqueWindows":true,"semanticColors":{"diffAdded":"#00c853","diffRemoved":"#ff5f38","skill":"#cc7d5e"},"surface":"#f5f3ee"},"variant":"light"}

下载来源：

思源宋体 VF：
https://github.com/adobe-fonts/source-han-serif/raw/release/Variable/TTF/SourceHanSerifSC-VF.ttf

SF Mono：
https://devimages-cdn.apple.com/design/resources/download/SF-Mono.dmg

7-Zip 官方包：
优先使用 winget：
winget install --id 7zip.7zip --exact --accept-package-agreements --accept-source-agreements

请按以下阶段执行。

第一阶段：检查环境

- 确认 Windows 版本。
- 检查 Codex 是否正在运行。
- 检查 7-Zip 是否已经安装，并定位 7z.exe。
- 检查以下字体族是否已经存在：
  - SF Mono
  - 思源宋体 VF
  - Source Han Serif SC VF
- 检查当前目录是否可写。
- 建立 downloads 和 extracted 目录。
- 将检查结果写入 codex-theme-setup-log.md。

第二阶段：安装思源宋体 VF

- 如果系统中尚未安装对应字体，从指定 GitHub 直链下载：
  https://github.com/adobe-fonts/source-han-serif/raw/release/Variable/TTF/SourceHanSerifSC-VF.ttf
- 下载后确认文件扩展名为 .ttf，文件大小合理且不是 HTML 错误页面。
- 尝试读取字体元数据，确认字体属于 Source Han Serif / 思源宋体系列。
- 优先为当前用户安装字体，避免不必要的管理员权限。
- 可将字体复制到：
  $env:LOCALAPPDATA\Microsoft\Windows\Fonts
- 同时写入当前用户字体注册表：
  HKCU:\Software\Microsoft\Windows NT\CurrentVersion\Fonts
- 如果当前用户安装方式不可用，再使用 Windows Shell 的标准字体安装机制。
- 安装后重新查询字体注册信息。
- 记录其实际字体族名称和字体文件路径。

第三阶段：下载并解包 SF Mono

- 如果没有 7-Zip，通过 winget 安装官方 7-Zip：
  winget install --id 7zip.7zip --exact --accept-package-agreements --accept-source-agreements
- 从 Apple 官方直链下载：
  https://devimages-cdn.apple.com/design/resources/download/SF-Mono.dmg
- 确认下载文件不是 HTML 页面。
- 使用 7-Zip逐层解压 SF-Mono.dmg。
- 在解压结果中递归查找：
  - *.pkg
  - Payload
  - Payload~
  - *.otf
  - *.ttf
- 如果存在 .pkg，继续用 7-Zip 解开 .pkg。
- 如果存在 Payload 或 Payload~，继续用 7-Zip 解开。
- 最终递归查找名称包含 SFMono 或 SF-Mono 的 OTF/TTF 文件。
- 不要安装其他 Apple 字体。
- 至少安装 Regular。
- 如能找到完整字重，安装以下字重：
  - SFMono-Regular.otf
  - SFMono-RegularItalic.otf
  - SFMono-Medium.otf
  - SFMono-MediumItalic.otf
  - SFMono-Semibold.otf
  - SFMono-SemiboldItalic.otf
  - SFMono-Bold.otf
  - SFMono-BoldItalic.otf
- 如果实际文件名略有不同，以字体元数据中字体族为 SF Mono 为准。
- 优先为当前用户安装。
- 安装后确认 Windows 字体注册表中出现 SF Mono。
- 记录安装文件、字体族名和字体路径。

第四阶段：验证字体

- 使用 PowerShell 查询当前用户与系统字体注册表。
- 确认 Codex 可用的准确字体族名称。
- 重点判断界面字体究竟注册为：
  - 思源宋体 VF
  - Source Han Serif SC VF
  - Source Han Serif SC
  - 其他实际名称
- 重点确认代码字体是否注册为：
  - SF Mono
- 输出一个字体名称结论。

第五阶段：生成最终主题字符串

- 原始主题中的 UI 字体名称是“思源宋体 VF”。
- 如果系统实际注册名称不同，用实际名称替换 fonts.ui。
- fonts.code 应使用实际注册的 SF Mono 字体族名称。
- 验证 codex-theme-v1 后面的 JSON 可以正常解析。
- 不要随意修改颜色。
- 暂时保留 codeThemeId 为 absolutely。
- 输出最终完整主题字符串，并写入：
  final-codex-theme.txt

第六阶段：处理 codeThemeId

- 不要直接编辑 Codex 内部配置文件。
- 尝试判断当前 Codex 外观设置中是否存在代码主题 absolutely。
- 如果能可靠操作 Codex 界面：
  1. 打开 Settings。
  2. 打开 Appearance 或 Theme。
  3. 查找代码主题列表。
  4. 确认 absolutely 是否存在。
- 如果 absolutely 不存在：
  - 不要猜测主题 ID。
  - 请指导我先在 Codex 中选择任意现有代码主题并使用 Export/Share Theme 导出主题字符串。
  - 从导出的字符串中读取真实 codeThemeId。
  - 再将 final-codex-theme.txt 中的 absolutely 替换为真实 ID。
- 如果 Codex 支持直接导入并且 absolutely 有效，则导入主题。

第七阶段：应用与验证

- 完全退出 Codex。
- 确认 Codex 相关进程退出后重新启动。
- 打开 Settings → Appearance/Theme。
- 导入 final-codex-theme.txt 中的完整字符串。
- 验证：
  - 背景接近 #f5f3ee。
  - 主要文字接近 #1d1b16。
  - 强调色接近 #da7756。
  - UI 中文显示为思源宋体风格。
  - 代码显示为 SF Mono。
  - Diff 新增为绿色。
  - Diff 删除为橙红色。

最后，请在 codex-theme-setup-log.md 中给出：

1. Windows 版本。
2. 7-Zip 安装状态和路径。
3. 下载的文件及来源。
4. 安装的字体文件列表。
5. 字体实际注册名称。
6. 最终 codeThemeId。
7. 最终主题字符串。
8. 已完成步骤。
9. 仍需我手动完成的步骤。
10. 任何失败项及原因。
```

---

## 4. 手动安装方案

不希望让 Codex直接安装字体时，可按本节操作。

### 4.1 安装思源宋体 VF

1. 在浏览器打开：

   <https://github.com/adobe-fonts/source-han-serif/raw/release/Variable/TTF/SourceHanSerifSC-VF.ttf>

2. 浏览器应下载：

   ```text
   SourceHanSerifSC-VF.ttf
   ```

3. 在资源管理器中找到该文件。
4. 右键该文件。
5. Windows 11 如未显示完整菜单，选择“显示更多选项”。
6. 选择：
   - “安装”；或
   - “为所有用户安装”。

普通用户推荐先使用“安装”。如果 Codex 识别不到，再尝试“为所有用户安装”。

7. 打开 Windows：

   ```text
   设置 → 个性化 → 字体
   ```

8. 搜索：

   ```text
   思源宋体
   ```

   以及：

   ```text
   Source Han Serif
   ```

9. 记下 Windows 显示的准确字体族名称。

可能出现的名称包括：

```text
思源宋体 VF
Source Han Serif SC VF
Source Han Serif SC
```

主题中的字体名称必须与系统实际注册名称一致。

### 4.2 下载 SF Mono

打开：

<https://devimages-cdn.apple.com/design/resources/download/SF-Mono.dmg>

下载文件：

```text
SF-Mono.dmg
```

### 4.3 安装 7-Zip

在 PowerShell 中运行：

```powershell
winget install --id 7zip.7zip --exact --accept-package-agreements --accept-source-agreements
```

安装完成后，7-Zip 通常位于：

```text
C:\Program Files\7-Zip\7z.exe
```

### 4.4 解开 SF Mono 安装包

以下命令假设：

```text
SF-Mono.dmg
```

位于：

```text
C:\Users\你的用户名\Downloads
```

先创建工作目录：

```powershell
$Work = "$env:USERPROFILE\Downloads\SFMonoExtract"
New-Item -ItemType Directory -Force -Path $Work | Out-Null
```

解开 DMG：

```powershell
& "C:\Program Files\7-Zip\7z.exe" x `
  "$env:USERPROFILE\Downloads\SF-Mono.dmg" `
  "-o$Work\stage1" -y
```

查找 PKG、Payload 和字体文件：

```powershell
Get-ChildItem "$Work\stage1" -Recurse -Force |
  Where-Object {
    $_.Extension -in ".pkg", ".otf", ".ttf" -or
    $_.Name -in "Payload", "Payload~"
  } |
  Select-Object FullName
```

如果找到了 `.pkg`，例如：

```text
...\SF Mono Fonts.pkg
```

将实际路径替换到下面命令：

```powershell
& "C:\Program Files\7-Zip\7z.exe" x `
  "这里替换为实际PKG完整路径" `
  "-o$Work\stage2" -y
```

然后查找 Payload：

```powershell
Get-ChildItem "$Work\stage2" -Recurse -Force |
  Where-Object {
    $_.Name -in "Payload", "Payload~" -or
    $_.Extension -in ".otf", ".ttf"
  } |
  Select-Object FullName
```

如果发现 `Payload` 或 `Payload~`，继续解开：

```powershell
& "C:\Program Files\7-Zip\7z.exe" x `
  "这里替换为Payload完整路径" `
  "-o$Work\stage3" -y
```

最终查找字体：

```powershell
Get-ChildItem $Work -Recurse -File |
  Where-Object {
    $_.Extension -in ".otf", ".ttf" -and
    $_.Name -match "SF.?Mono"
  } |
  Select-Object FullName, Length
```

由于 Apple 可能调整安装包内部层级，实际可能需要再对某个中间文件执行一次 7-Zip 解压。原则是持续查找：

```text
*.pkg
Payload
Payload~
*.otf
*.ttf
```

直到看到 SF Mono 字体文件。

### 4.5 安装 SF Mono

找到 OTF 文件后，至少安装：

```text
SFMono-Regular.otf
```

建议同时安装常用字重：

```text
SFMono-Regular.otf
SFMono-RegularItalic.otf
SFMono-Medium.otf
SFMono-MediumItalic.otf
SFMono-Semibold.otf
SFMono-SemiboldItalic.otf
SFMono-Bold.otf
SFMono-BoldItalic.otf
```

操作方式：

1. 选中这些 OTF 文件。
2. 右键。
3. 选择“安装”或“为所有用户安装”。
4. 打开：

   ```text
   设置 → 个性化 → 字体
   ```

5. 搜索：

   ```text
   SF Mono
   ```

---

## 5. 检查 Windows 中的字体名称

可在 PowerShell 中执行：

```powershell
$fontKeys = @(
  "HKCU:\Software\Microsoft\Windows NT\CurrentVersion\Fonts",
  "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Fonts"
)

foreach ($key in $fontKeys) {
  if (Test-Path $key) {
    Write-Host "`n[$key]"
    (Get-ItemProperty $key).PSObject.Properties |
      Where-Object {
        $_.Name -match "Source Han|思源|SF Mono|SFMono"
      } |
      Select-Object Name, Value
  }
}
```

需要确认：

```text
SF Mono
```

以及思源宋体的实际名称。

如果 Windows 显示的是：

```text
Source Han Serif SC VF
```

则主题必须将：

```json
"ui":"思源宋体 VF"
```

改成：

```json
"ui":"Source Han Serif SC VF"
```

---

## 6. 在 Codex 中导入主题

字体安装完成后：

1. 完全退出 Codex。
2. 打开任务管理器，确认没有残留 Codex 进程。
3. 重新启动 Codex。
4. 打开：

   ```text
   Settings → Appearance
   ```

   某些版本中可能显示为：

   ```text
   Settings → Theme
   ```

5. 找到类似以下入口：

   ```text
   Import Theme
   Import
   ```

6. 粘贴完整主题字符串：

```text
codex-theme-v1:{"codeThemeId":"absolutely","theme":{"accent":"#da7756","contrast":60,"fonts":{"code":"SF Mono","ui":"思源宋体 VF"},"ink":"#1d1b16","opaqueWindows":true,"semanticColors":{"diffAdded":"#00c853","diffRemoved":"#ff5f38","skill":"#cc7d5e"},"surface":"#f5f3ee"},"variant":"light"}
```

7. 点击导入。
8. 确认该主题已经被应用。

注意：Codex 版本更新后，菜单名称或位置可能略有变化，但入口应位于外观或主题设置附近。

---

## 7. `codeThemeId: "absolutely"` 无效时怎么办

主题中包含：

```json
"codeThemeId":"absolutely"
```

该字段表示 Codex 使用的代码语法高亮主题。

不同 Codex 版本可用的 `codeThemeId` 可能不同。如果当前版本没有 `absolutely`，可能出现：

- Import 按钮不可点击。
- 提示主题配置无效。
- 导入后代码颜色未应用。
- 导入直接失败。

不要随意猜测 ID。使用下面的方法获得当前版本真实有效的 ID。

### 方法一：导出当前主题

1. 在 Codex 中打开：

   ```text
   Settings → Appearance/Theme
   ```

2. 选择任意内置代码主题。
3. 找到：

   ```text
   Export Theme
   Share Theme
   Copy Theme
   ```

4. 复制导出的 `codex-theme-v1:` 字符串。
5. 找到其中类似：

   ```json
   "codeThemeId":"某个真实值"
   ```

6. 复制该真实值。
7. 将原主题的 `absolutely` 替换掉。

例如，假设导出结果表明当前 ID 是：

```json
"codeThemeId":"codex"
```

则最终主题可改为：

```text
codex-theme-v1:{"codeThemeId":"codex","theme":{"accent":"#da7756","contrast":60,"fonts":{"code":"SF Mono","ui":"思源宋体 VF"},"ink":"#1d1b16","opaqueWindows":true,"semanticColors":{"diffAdded":"#00c853","diffRemoved":"#ff5f38","skill":"#cc7d5e"},"surface":"#f5f3ee"},"variant":"light"}
```

这里的 `codex` 只是示例。必须以你当前 Codex 实际导出的值为准。

### 方法二：让 Codex 帮你合并

把导出的主题字符串和原主题一起交给 Codex：

```text
下面有两个 Codex 主题字符串。

第一个是我想使用的主题，但它的 codeThemeId 可能无效：

<粘贴原主题>

第二个是从我当前 Codex 版本导出的有效主题：

<粘贴导出的主题>

请只从第二个主题中提取 codeThemeId，并用它替换第一个主题的 codeThemeId。不要修改第一个主题中的其他字段。验证 JSON 后，输出最终完整的 codex-theme-v1 字符串。
```

---

## 8. 字体没有生效时怎么办

### 8.1 颜色生效，UI 字体不生效

最常见原因：字体族名称不匹配。

例如系统实际名称是：

```text
Source Han Serif SC VF
```

而主题中写的是：

```text
思源宋体 VF
```

修正为：

```json
"fonts":{
  "code":"SF Mono",
  "ui":"Source Han Serif SC VF"
}
```

### 8.2 代码字体不生效

检查：

1. Windows 字体设置中是否能搜索到 `SF Mono`。
2. 是否至少安装了 Regular 字重。
3. 字体是否只被解压但尚未安装。
4. 安装字体后是否彻底重启 Codex。
5. 主题中的名称是否准确写为：

   ```json
   "code":"SF Mono"
   ```

### 8.3 SF Mono 中的中文不是同一种字体

这是正常现象。

SF Mono 主要覆盖拉丁字母、希腊字母、西里尔字母、数字和代码符号，不包含完整中文字符。代码中的中文注释会由 Windows 或 Codex 回退到另一套中文字体。

### 8.4 思源宋体显示乱码或字符损坏

优先检查 Windows 是否已更新。

Adobe 在 Source Han Serif 2.003 发布说明中指出，较旧 Windows 10/11 构建曾存在 CFF2 可变字体处理问题。本文推荐的文件是 TTF 版本，可降低该风险。

仍然异常时：

1. 删除当前安装的 OTF 可变版本。
2. 保留本文下载的：

   ```text
   SourceHanSerifSC-VF.ttf
   ```

3. 重启 Windows。
4. 再重启 Codex。

### 8.5 主题导入按钮灰色

依次检查：

1. 是否完整复制了 `codex-theme-v1:` 前缀。
2. JSON 是否少了括号或引号。
3. `codeThemeId` 是否有效。
4. 字体名称中是否混入特殊引号。
5. 是否复制了 Markdown 代码围栏，例如误把三个反引号也复制进去。

正确粘贴内容以：

```text
codex-theme-v1:
```

开头，不包含：

```text
```
```

---

## 9. 可直接尝试的主题变体

### 9.1 原始版本

```text
codex-theme-v1:{"codeThemeId":"absolutely","theme":{"accent":"#da7756","contrast":60,"fonts":{"code":"SF Mono","ui":"思源宋体 VF"},"ink":"#1d1b16","opaqueWindows":true,"semanticColors":{"diffAdded":"#00c853","diffRemoved":"#ff5f38","skill":"#cc7d5e"},"surface":"#f5f3ee"},"variant":"light"}
```

### 9.2 英文字体族名称版本

当 Windows 将思源宋体注册为 `Source Han Serif SC VF` 时：

```text
codex-theme-v1:{"codeThemeId":"absolutely","theme":{"accent":"#da7756","contrast":60,"fonts":{"code":"SF Mono","ui":"Source Han Serif SC VF"},"ink":"#1d1b16","opaqueWindows":true,"semanticColors":{"diffAdded":"#00c853","diffRemoved":"#ff5f38","skill":"#cc7d5e"},"surface":"#f5f3ee"},"variant":"light"}
```

### 9.3 无 SF Mono 时的临时版本

如果 SF Mono 尚未安装，可先使用 Windows 常见等宽字体：

```text
codex-theme-v1:{"codeThemeId":"absolutely","theme":{"accent":"#da7756","contrast":60,"fonts":{"code":"Cascadia Mono","ui":"思源宋体 VF"},"ink":"#1d1b16","opaqueWindows":true,"semanticColors":{"diffAdded":"#00c853","diffRemoved":"#ff5f38","skill":"#cc7d5e"},"surface":"#f5f3ee"},"variant":"light"}
```

这只是临时方案。完成 SF Mono 安装后，再改回：

```json
"code":"SF Mono"
```

---

## 10. 最终检查清单

完成后逐项检查：

- [ ] 已下载 `SourceHanSerifSC-VF.ttf`。
- [ ] 已安装思源宋体可变字体。
- [ ] Windows 字体设置能搜索到思源宋体。
- [ ] 已从 Apple 官方链接下载 `SF-Mono.dmg`。
- [ ] 已用 7-Zip 解开 DMG/PKG/Payload。
- [ ] 已找到并安装 SF Mono OTF 文件。
- [ ] Windows 字体设置能搜索到 SF Mono。
- [ ] 已彻底退出并重启 Codex。
- [ ] 已确认当前 Codex 版本中的有效 `codeThemeId`。
- [ ] 已导入 `codex-theme-v1:` 字符串。
- [ ] 背景呈暖米白色。
- [ ] 强调色呈陶土橙色。
- [ ] UI 中文呈思源宋体风格。
- [ ] 代码英文和符号呈 SF Mono 风格。
- [ ] Diff 新增和删除颜色符合预期。

---

## 11. 来源与安全说明

本教程使用以下来源：

1. Adobe 官方开源字体仓库：  
   <https://github.com/adobe-fonts/source-han-serif>

2. Source Han Serif 官方发布页：  
   <https://github.com/adobe-fonts/source-han-serif/releases/latest>

3. Apple Developer 官方字体页面：  
   <https://developer.apple.com/fonts/>

4. Apple 官方 SF Mono 下载地址：  
   <https://devimages-cdn.apple.com/design/resources/download/SF-Mono.dmg>

5. 7-Zip 官方网站：  
   <https://www.7-zip.org/>

SF Mono 的授权由 Apple 管理。请根据 Apple 随字体包提供的许可条款使用。本文只说明在本机 Codex 界面中配置字体的方法，不重新分发字体文件。

---

## 12. 最简执行路径

只希望尽快完成时：

1. 新建目录：

   ```text
   D:\CodexThemeSetup
   ```

2. 用 Windows Codex 打开该目录。
3. 将第 3.2 节的完整自动化提示词交给 Codex。
4. 等 Codex 安装和验证字体。
5. 打开 Codex 的 Appearance/Theme 设置。
6. 粘贴 Codex 生成的 `final-codex-theme.txt` 内容。
7. 如 `absolutely` 无效，导出任一当前主题，将其真实 `codeThemeId` 交给 Codex合并。
8. 重启 Codex并检查效果。
