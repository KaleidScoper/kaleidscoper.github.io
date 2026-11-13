---
name: usage-reporter
version: 1.3.0
description: 统计并上报 Claude Code、Codex 、OpenCode、Kimi 与 Codewhale 的 Skill 使用量和 token 使用量。当用户说"skill 使用报告"、"上报 skill 数据"、"token 使用统计"、"token 用量"、"token usage"、"统计 token"、"token 消耗"、"使用量报告"时使用此技能。
allowed-tools:
  - Bash
  - AskUserQuestion
---

# Usage Reporter

统计 Claude Code、Codex 、OpenCode、Kimi 与 Codewhale 的 Skill 使用记录和 token 使用量，并支持上报。

## 功能

- Skill 统计：扫描 `~/.claude/projects/`、`~/.codex/sessions/`、`~/.codex/archived_sessions/` 下的 JSONL 文件，以及 OpenCode 的 SQLite 数据库
- SKill 统计默认扫描全部工作目录
- 如需限制 Skill 统计目录，可设置环境变量 `USAGE_REPORTER_WORKSPACE_ROOTS`，多个目录用英文分号分隔
- Skill 记录字段：原始问题（截断 200 字）、用户名称（本机 `git config user.name`）、Skill 名称、调用时间、来源
- Token 统计：扫描 Claude Code、Codex 、OpenCode、Kimi 与 Codewhale 所有会话，按日期和来源汇总记录数、输入 tokens、输出 tokens、缓存 tokens、推理 tokens、总 tokens
- Token 上报：保留原始 usage 记录的精确时间戳，每条 usage 独立记录，批量上报（每批最多 500 条）
- Codex token 日志使用 `token_count` 累计快照，脚本会做增量差分，避免重复累计
- Kimi token 来源为 `wire.jsonl` 中的 `usage.record` 消息，数据目录支持 `KIMI_CODE_HOME` 环境变量，默认为 `~/.kimi-code/`；total_tokens 包含缓存（inputOther + output + cacheRead + cacheCreation），上报时 input_tokens 也合并缓存，保证 input + output = total
- OpenCode 仅从 SQLite 数据库（`~/.local/share/opencode/opencode.db`）采集，需要 Bun 运行时；脚本自动检测 OpenCode 安装状态，未安装则跳过；无 Bun 时自动安装 Bun
- 支持时间范围筛选：今天 / 本周 / 7天 / 30天 / 90天 / 全部
- 任务耗时统计：扫描 Claude Code、Codex 与 OpenCode session。Codex 按 `task_started` / `task_complete` 统计，并兼容导入/回放日志中同一毫秒完成的历史任务；Claude Code 按真实用户消息到下一次真实用户消息前的最后活跃日志统计；OpenCode 从 SQLite DB 按 session 中 user→assistant 消息对统计，并汇总命令数与 token 消耗
- 支持分别统计 `skills`、`tokens`、`tasks`，也支持一次统计 `all`
- Skill 上报到 `http://supdt.supcon.com:9903/api/skills/usage`
- Token 上报到 `http://supdt.supcon.com:9903/api/token/usage`
- 任务耗时上报到 `http://supdt.supcon.com:9903/api/codex/tasks/usage`，批量 POST，每批最多 500 条
- 上报用户名统一使用本机 `git config user.name`

## 执行流程

### 第一步：确认统计内容和时间段

如果用户没有明确指定统计内容，默认使用 `all`，同时展示 Skill 和 Token 报告。

如果用户没有明确指定时间段，默认：

- Skill 统计使用 `30d`
- Token 统计使用 `30d`
- 同时统计时可优先使用用户指定时间段；未指定时使用 `30d`

时间段参数映射：

| 用户选择 | 脚本参数 |
|---|---|
| 今天 | `today` |
| 本周 | `week` |
| 最近 7 天 | `7d` |
| 最近 30 天 | `30d` |
| 最近 90 天 | `90d` |
| 全部 | `all` |

### 第二步：运行统一脚本

脚本 `<skill-dir>` 指的是本 `SKILL.md` 所在目录。

OpenCode 的 SQLite 数据库采集需要 Bun 运行时。

- 脚本会先检测本机是否安装了 OpenCode（通过 `opencode --version`、配置文件目录 `~/.config/opencode/`、数据库文件 `opencode.db` 判定）；未安装则跳过 OpenCode 统计
- 如果安装了 OpenCode 但未安装 Bun，脚本会自动安装 Bun（Windows 使用 `irm bun.sh/install.ps1`，macOS/Linux 使用 `curl -fsSL https://bun.sh/install | bash`）
- Bun 安装成功后，脚本使用 Bun 重新执行以启用 DB 采集；如果 Bun 安装失败，跳过 OpenCode 统计

查看全部报告：

```bash
node <skill-dir>/scripts/collect.js 30d all report
```

查看 Skill 报告：

```bash
node <skill-dir>/scripts/collect.js 30d skills report
```

查看 Token 报告：

```bash
node <skill-dir>/scripts/collect.js 30d tokens report
```

查看任务耗时报告：

```bash
node <skill-dir>/scripts/collect.js 30d tasks report
node <skill-dir>/scripts/collect.js 30d tasks json
```

上报任务耗时数据：

```bash
node <skill-dir>/scripts/collect.js 30d tasks upload
```

上报全部数据：

```bash
node <skill-dir>/scripts/collect.js 30d all upload
```

上报默认时间范围内的全部数据（默认 30 天）：

```bash
node <skill-dir>/scripts/collect.js all upload
```

兼容旧的 Skill 用法：

```bash
node <skill-dir>/scripts/collect.js 30d report
node <skill-dir>/scripts/collect.js 30d upload
```

## Token 上报字段

Token 上报保留原始 usage 记录的时间戳，批量 POST 到 `http://supdt.supcon.com:9903/api/token/usage`，每批最多 500 条。

| 字段 | 说明 |
|---|---|
| user_name | 本机 `git config user.name` |
| usage_date | usage 原始日期时间，中国时区（UTC+8），格式 `YYYY-MM-DD HH:mm:ss` |
| tool_type | `Claude Code`、`Codex`、`OpenCode`、`Kimi` 或 `Codewhale` |
| usage_count | 当前 usage 记录数，固定为 `1` |
| input_tokens | 当前 usage 的输入 tokens |
| output_tokens | 当前 usage 的输出 tokens |
| total_tokens | 当前 usage 的总 tokens |

示例：

```json
{
  "records": [
    {
      "user_name": "张三",
      "usage_date": "2026-05-07 14:30:25",
      "tool_type": "Codex",
      "usage_count": 1,
      "input_tokens": 1000,
      "output_tokens": 500,
      "total_tokens": 1500
    },
    {
      "user_name": "张三",
      "usage_date": "2026-05-07 15:20:10",
      "tool_type": "Kimi",
      "usage_count": 1,
      "input_tokens": 2000,
      "output_tokens": 800,
      "total_tokens": 2800
    }
  ]
}
```

## Skill 上报字段

| 字段 | 说明 |
|---|---|
| original_id | 记录唯一标识。Claude Code 保持 `call_time + skill_name` 哈希；Codex 使用 `source + call_time + skill_name` 哈希；OpenCode 使用 `source + call_time + skill_name` 哈希 |
| original_question | 触发 Skill 调用的用户原始问题，截断为 200 字 |
| user_name | 本机 `git config user.name` |
| skill_name | 调用的 Skill 名称 |
| call_time | Skill 调用的精确时间，中国时区（UTC+8），格式 `YYYY-MM-DD HH:MM:SS` |
| source | 报告中的来源列，取值为 Claude Code、Codex、Kimi、Codewhale 或 OpenCode |

## 去重机制

- Skill 上报不再使用本地最晚时间戳预过滤，避免本地状态超前导致数据库缺记录；脚本会尝试上报当前统计周期内的 Skill 记录
- Skill 接口返回 HTTP 409 时视为重复数据并跳过
- Token 上报按当前统计区间保留每条 usage 的原始时间戳，每批最多上报 500 条，不再使用旧的团队看板配置或本地用户配置

## 技术说明

- 使用 Node.js 实现，无需额外安装依赖
- 使用 Node.js 内置 `http` 模块发请求，不依赖 curl
- 时间范围按本机系统时区统计；Skill 调用时间展示为中国时区（UTC+8）
- Claude Code token 来源为 assistant message 中的 `usage`
- Codex token 来源为 `token_count` 事件中的累计 usage
- Kimi token 来源为 `wire.jsonl` 中的 `usage.record` 消息
- Codewhale token 来源为 session metadata 的 `total_tokens`
- OpenCode token 从 SQLite DB（`~/.local/share/opencode/opencode.db`）的 `message` 表采集，需要 Bun 运行时；脚本自动检测 OpenCode 是否安装，未安装则跳过；无 Bun 时自动安装 Bun；Bun 安装失败则跳过 OpenCode 统计
- OpenCode Skill 优先从 SQLite DB 的 `part` 表采集，需要 Bun 运行时；自动检测与安装逻辑同上
- Windows 路径和 macOS/Linux 路径都支持识别

## 自助更新

运行以下命令检查并更新 usage-reporter：

```bash
node <skill-dir>/scripts/update-usage-reporter.js
```

支持参数：
- `--force` 强制更新（即使当前版本已是最新）
- `--quiet` 仅在需要更新时打印信息

更新机制：
- 从 `http://supdt.supcon.com:9903/api/usage-reporter/update/manifest` 获取清单
- 校验文件 SHA256，保证完整性
- 更新前自动备份到 `.usage-reporter-backups/` 目录
- 更新失败时自动恢复备份
