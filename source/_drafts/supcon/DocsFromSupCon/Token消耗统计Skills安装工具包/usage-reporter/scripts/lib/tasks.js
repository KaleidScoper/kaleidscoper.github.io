const fs = require("fs");
const path = require("path");
const { PERIOD_LABELS } = require("./config");
const { scanClaudeJsonlFiles, scanCodexJsonlFiles } = require("./files");
const { extractUserText, extractCodexUserText } = require("./skills");
const { extractCodexTokenTotals, diffCodexTokenTotals } = require("./tokens");
const { simpleHash, truncate, getCutoffTimestamp, hasWorkspaceFilter, isAllowedWorkspace, parseJsonSafely, parseTimestamp, formatTimestamp, formatWorkspaceScope, formatNumber, formatDuration, formatSourceForUpload, isOpenCodeInstalled, getOpenCodeDbPath, tryOpenSqliteDb, reportOpenCodeDbStatus } = require("./common");

function createEmptyTaskMetrics() {
  return {
    inputTokens: 0,
    outputTokens: 0,
    cacheCreationTokens: 0,
    cacheReadTokens: 0,
    reasoningOutputTokens: 0,
    totalTokens: 0,
  };
}

function getDurationSeconds(startTime, endTime) {
  const start = parseTimestamp(startTime);
  const end = parseTimestamp(endTime);
  if (!start || !end || end < start) return 0;
  return Math.round((end.getTime() - start.getTime()) / 1000);
}

function getTimestampFromUuidV7(value) {
  if (typeof value !== "string") return "";
  const hex = value.replace(/-/g, "").slice(0, 12);
  if (!/^[0-9a-f]{12}$/i.test(hex)) return "";

  const millis = parseInt(hex, 16);
  if (!Number.isFinite(millis) || millis <= 0) return "";

  const date = new Date(millis);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

function isCompressedCodexReplayTask(task) {
  if (!task || task.source !== "codex") return false;

  const decodedStartTime = getTimestampFromUuidV7(task.turn_id);
  const eventStart = parseTimestamp(task.start_time);
  const decodedStart = parseTimestamp(decodedStartTime);
  if (!eventStart || !decodedStart) return false;

  const timestampDriftSeconds = Math.abs(eventStart.getTime() - decodedStart.getTime()) / 1000;
  return timestampDriftSeconds > 60 && getDurationSeconds(task.start_time, task.end_time || task.last_event_time) <= 2;
}

function repairCompressedCodexReplayTasks(tasks) {
  const orderedTasks = Array.from(tasks.values());
  for (let index = 0; index < orderedTasks.length; index++) {
    const task = orderedTasks[index];
    if (!isCompressedCodexReplayTask(task)) continue;

    const decodedStartTime = getTimestampFromUuidV7(task.turn_id);
    const nextDecodedStartTime = getTimestampFromUuidV7(orderedTasks[index + 1]?.turn_id);
    const fallbackDurationSeconds = Math.max(60, Math.ceil(Number(task.command_duration_seconds) || 0));

    task.start_time = decodedStartTime;
    task.last_event_time = decodedStartTime;

    if (getDurationSeconds(decodedStartTime, nextDecodedStartTime) > 0) {
      task.end_time = nextDecodedStartTime;
    } else {
      task.end_time = new Date(parseTimestamp(decodedStartTime).getTime() + fallbackDurationSeconds * 1000).toISOString();
    }

    task.duration_seconds = getDurationSeconds(task.start_time, task.end_time);
    if (task.status === "running") task.status = "completed";
  }
}

function getCommandDurationSeconds(duration) {
  if (!duration || typeof duration !== "object") return 0;
  const secs = Number(duration.secs || 0);
  const nanos = Number(duration.nanos || 0);
  if (!Number.isFinite(secs) || !Number.isFinite(nanos)) return 0;
  return secs + nanos / 1e9;
}

function parseWallTimeSeconds(output) {
  if (typeof output !== "string") return 0;
  const match = output.match(/Wall time:\s*([\d.]+)\s*(milliseconds?|ms|seconds?|secs?|s)\b/i);
  if (!match) return 0;

  const value = Number(match[1]);
  if (!Number.isFinite(value)) return 0;

  const unit = match[2].toLowerCase();
  return unit === "ms" || unit.startsWith("millisecond") ? value / 1000 : value;
}

function createCodexTaskRecord({ sessionId, turnId, startTime, workspace, originalQuestion }) {
  return createTaskRecord({
    source: "codex",
    sessionId,
    turnId,
    startTime,
    workspace,
    originalQuestion,
  });
}

function createClaudeTaskRecord({ sessionId, turnId, startTime, workspace, originalQuestion }) {
  return createTaskRecord({
    source: "claude",
    sessionId,
    turnId,
    startTime,
    workspace,
    originalQuestion,
  });
}

function createTaskRecord({ source, sessionId, turnId, startTime, workspace, originalQuestion }) {
  return {
    original_id: simpleHash(`${source}|${sessionId}|${turnId}`),
    source,
    session_id: sessionId,
    turn_id: turnId,
    workspace,
    original_question: truncate(originalQuestion || ""),
    start_time: startTime,
    end_time: "",
    last_event_time: startTime,
    duration_seconds: 0,
    status: "running",
    command_count: 0,
    command_duration_seconds: 0,
    input_tokens: 0,
    output_tokens: 0,
    cache_creation_tokens: 0,
    cache_read_tokens: 0,
    reasoning_output_tokens: 0,
    total_tokens: 0,
    last_agent_message: "",
  };
}

function applyClaudeUsage(task, usage) {
  if (!task || !usage) return;
  const inputTokens = Number(usage.input_tokens) || 0;
  const outputTokens = Number(usage.output_tokens) || 0;
  const cacheCreationTokens = Number(usage.cache_creation_input_tokens) || 0;
  const cacheReadTokens = Number(usage.cache_read_input_tokens) || 0;

  task.input_tokens += inputTokens;
  task.output_tokens += outputTokens;
  task.cache_creation_tokens += cacheCreationTokens;
  task.cache_read_tokens += cacheReadTokens;
  task.total_tokens += inputTokens + outputTokens;
}

function applyTaskTokenDelta(task, delta) {
  if (!task || !delta) return;
  task.input_tokens += delta.inputTokens || 0;
  task.output_tokens += delta.outputTokens || 0;
  task.cache_creation_tokens += delta.cacheCreationTokens || 0;
  task.cache_read_tokens += delta.cacheReadTokens || 0;
  task.reasoning_output_tokens += delta.reasoningOutputTokens || 0;
  task.total_tokens += delta.totalTokens || 0;
}

function isClaudeToolResult(entry) {
  const content = entry.message?.content;
  return Array.isArray(content) && content.some((item) => item?.type === "tool_result");
}

function isClaudeUserTaskStart(entry) {
  return entry?.type === "user" && entry.message?.role === "user" && !isClaudeToolResult(entry);
}

function getClaudeToolUseNames(entry) {
  const content = entry.message?.content;
  if (!Array.isArray(content)) return [];
  return content
    .filter((item) => item?.type === "tool_use" && typeof item.name === "string")
    .map((item) => item.name);
}

function finishTask(task, endTime, status = "completed") {
  if (!task) return;
  task.end_time = endTime || task.last_event_time || task.start_time;
  task.duration_seconds = getDurationSeconds(task.start_time, task.end_time);
  task.status = status;
  task.command_duration_seconds = Math.round(task.command_duration_seconds * 1000) / 1000;
}

function collectClaudeTaskUsage(period = "all") {
  const cutoff = getCutoffTimestamp(period);
  const files = scanClaudeJsonlFiles();
  const records = [];
  const requiresWorkspaceCheck = hasWorkspaceFilter();
  const scannedFiles = { claude: 0 };

  for (const filePath of files) {
    scannedFiles.claude += 1;

    let lines = [];
    try {
      lines = fs.readFileSync(filePath, "utf-8").split("\n");
    } catch {
      continue;
    }

    let sessionId = filePath;
    let workspace = "";
    let shouldProcessFile = requiresWorkspaceCheck ? null : true;
    let currentTask = null;
    let sequence = 0;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      const entry = parseJsonSafely(trimmed);
      if (!entry) continue;

      if (entry.sessionId) sessionId = entry.sessionId;
      if (typeof entry.cwd === "string" && entry.cwd) {
        workspace = entry.cwd;
        if (requiresWorkspaceCheck && shouldProcessFile === null) {
          shouldProcessFile = isAllowedWorkspace(workspace);
        }
      }

      if (shouldProcessFile === false) break;
      if (shouldProcessFile === null) continue;

      const ts = entry.timestamp || "";

      if (isClaudeUserTaskStart(entry)) {
        const text = extractUserText(entry);
        if (currentTask && ts && ts !== currentTask.start_time) {
          finishTask(currentTask, currentTask.last_event_time, "completed");
          if (!cutoff || !currentTask.start_time || currentTask.start_time >= cutoff) {
            records.push(currentTask);
          }
          currentTask = null;
        }

        if (!currentTask) {
          const turnId = entry.uuid || `${sessionId}:${++sequence}`;
          currentTask = createClaudeTaskRecord({
            sessionId,
            turnId,
            startTime: ts,
            workspace,
            originalQuestion: text,
          });
        } else if (!currentTask.original_question && text) {
          currentTask.original_question = truncate(text);
        }
        continue;
      }

      if (currentTask && ts) {
        currentTask.last_event_time = ts;
      }

      if (entry.type !== "assistant" || !currentTask) continue;

      applyClaudeUsage(currentTask, entry.message?.usage);

      const toolNames = getClaudeToolUseNames(entry);
      currentTask.command_count += toolNames.filter((name) => name === "Bash").length;

      const textItems = Array.isArray(entry.message?.content)
        ? entry.message.content.filter((item) => item?.type === "text" && typeof item.text === "string")
        : [];
      if (textItems.length) {
        currentTask.last_agent_message = truncate(textItems.map((item) => item.text).join("\n"), 500);
      }
    }

    if (currentTask) {
      finishTask(currentTask, currentTask.last_event_time || currentTask.start_time, "completed");
      if (!cutoff || !currentTask.start_time || currentTask.start_time >= cutoff) {
        records.push(currentTask);
      }
    }
  }

  records.sort((a, b) => (b.start_time || "").localeCompare(a.start_time || ""));
  return { records, scannedFiles };
}

function collectCodexTaskUsage(period = "all") {
  const cutoff = getCutoffTimestamp(period);
  const files = scanCodexJsonlFiles();
  const records = [];
  const requiresWorkspaceCheck = hasWorkspaceFilter();
  const scannedFiles = { codex: 0 };

  for (const filePath of files) {
    scannedFiles.codex += 1;

    let lines = [];
    try {
      lines = fs.readFileSync(filePath, "utf-8").split("\n");
    } catch {
      continue;
    }

    let sessionId = filePath;
    let workspace = "";
    let shouldProcessFile = requiresWorkspaceCheck ? null : true;
    let lastUserText = "";
    let currentTask = null;
    const tasksByTurnId = new Map();
    const commandCalls = new Map();
    let previousTotals = createEmptyTaskMetrics();

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      const entry = parseJsonSafely(trimmed);
      if (!entry) continue;

      const ts = entry.timestamp || "";

      if (entry.type === "session_meta") {
        sessionId = entry.payload?.id || sessionId;
        workspace = entry.payload?.cwd || "";
        if (requiresWorkspaceCheck) {
          shouldProcessFile = isAllowedWorkspace(workspace);
        }
        continue;
      }

      if (shouldProcessFile === false) break;
      if (shouldProcessFile === null) continue;

      if (currentTask && ts) {
        currentTask.last_event_time = ts;
      }

      if (
        entry.type === "response_item" &&
        entry.payload?.type === "message" &&
        entry.payload?.role === "user"
      ) {
        const text = extractCodexUserText(entry.payload.content);
        if (text) {
          lastUserText = text;
          if (currentTask && !currentTask.original_question) {
            currentTask.original_question = truncate(text);
          }
        }
        continue;
      }

      if (entry.type === "response_item" && entry.payload?.type === "function_call") {
        if (entry.payload.name === "shell_command" && currentTask) {
          currentTask.command_count += 1;
          if (entry.payload.call_id) {
            commandCalls.set(entry.payload.call_id, currentTask.turn_id);
          }
        }
        continue;
      }

      if (entry.type === "response_item" && entry.payload?.type === "function_call_output") {
        const turnId = commandCalls.get(entry.payload.call_id || "");
        const task = turnId ? tasksByTurnId.get(turnId) : currentTask;
        if (task) {
          task.command_duration_seconds += parseWallTimeSeconds(entry.payload.output);
        }
        continue;
      }

      if (entry.type !== "event_msg") continue;

      const payload = entry.payload || {};

      if (payload.type === "task_started") {
        const turnId = payload.turn_id || ts || `${sessionId}:${tasksByTurnId.size + 1}`;
        currentTask = createCodexTaskRecord({
          sessionId,
          turnId,
          startTime: ts,
          workspace,
          originalQuestion: lastUserText,
        });
        tasksByTurnId.set(turnId, currentTask);
        continue;
      }

      if (payload.type === "exec_command_end") {
        const turnId = payload.turn_id || currentTask?.turn_id || "";
        const task = tasksByTurnId.get(turnId) || currentTask;
        if (task) {
          task.command_count += 1;
          task.command_duration_seconds += getCommandDurationSeconds(payload.duration);
        }
        continue;
      }

      if (payload.type === "token_count") {
        const currentTotals = extractCodexTokenTotals(payload.info);
        if (!currentTotals) continue;

        const delta = diffCodexTokenTotals(currentTotals, previousTotals);
        previousTotals = currentTotals;
        if (delta && currentTask) {
          applyTaskTokenDelta(currentTask, delta);
        }
        continue;
      }

      if (payload.type === "task_complete") {
        const turnId = payload.turn_id || currentTask?.turn_id || "";
        const task = tasksByTurnId.get(turnId) || currentTask;
        if (task) {
          task.end_time = ts;
          task.duration_seconds = getDurationSeconds(task.start_time, task.end_time);
          task.status = "completed";
          task.command_duration_seconds = Math.round(task.command_duration_seconds * 1000) / 1000;
          task.last_agent_message = truncate(payload.last_agent_message || "", 500);
        }
        if (currentTask && currentTask.turn_id === turnId) {
          currentTask = null;
        }
      }
    }

    for (const task of tasksByTurnId.values()) {
      if (task.status !== "completed") {
        task.duration_seconds = getDurationSeconds(task.start_time, task.last_event_time || task.start_time);
        task.command_duration_seconds = Math.round(task.command_duration_seconds * 1000) / 1000;
      }
    }

    repairCompressedCodexReplayTasks(tasksByTurnId);

    for (const task of tasksByTurnId.values()) {
      if (cutoff && task.start_time && task.start_time < cutoff) continue;
      records.push(task);
    }
  }

  records.sort((a, b) => (b.start_time || "").localeCompare(a.start_time || ""));
  return { records, scannedFiles };
}

function collectOpenCodeTaskUsage(period = "all") {
  if (!isOpenCodeInstalled()) return { records: [], scannedFiles: { opencode: 0 } };

  const dbPath = getOpenCodeDbPath();
  if (!dbPath || !fs.existsSync(dbPath)) return { records: [], scannedFiles: { opencode: 0 } };

  const db = tryOpenSqliteDb(dbPath);
  if (!db) {
    reportOpenCodeDbStatus();
    return { records: [], scannedFiles: { opencode: 0 } };
  }

  const cutoff = getCutoffTimestamp(period);
  const cutoffMs = cutoff ? Date.parse(cutoff) : 0;
  try {
    const records = [];
    const sessions = db.query(
      "SELECT id FROM session"
    ).all();

    if (!sessions.length) return { records: [], scannedFiles: { opencode: 1 } };

    for (const session of sessions) {
      const sessionId = session.id;
      const msgs = db.query(
        `SELECT id, time_created, COALESCE(json_extract(data, '$.role'), '') as role,
                COALESCE(json_extract(data, '$.tokens.input'), 0) as input_tokens,
                COALESCE(json_extract(data, '$.tokens.output'), 0) as output_tokens,
                COALESCE(json_extract(data, '$.tokens.cache.read'), 0) as cache_read_tokens,
                COALESCE(json_extract(data, '$.tokens.cache.write'), 0) as cache_write_tokens,
                COALESCE(json_extract(data, '$.tokens.reasoning'), 0) as reasoning_tokens,
                COALESCE(json_extract(data, '$.tokens.total'), 0) as total_tokens
         FROM message
         WHERE session_id = ?
         ORDER BY time_created ASC`
      ).all(sessionId);

      if (!msgs.length) continue;

      let currentTask = null;
      let sequence = 0;

      for (const msg of msgs) {
        const timeMs = Number(msg.time_created);
        if (!Number.isFinite(timeMs)) continue;
        const ts = new Date(timeMs).toISOString();

        const role = msg.role;

        if (role === "user") {
          if (currentTask) {
            finishTask(currentTask, currentTask.last_event_time || ts, "completed");
            if (currentTask.duration_seconds > 0) {
              records.push(currentTask);
            }
          }

          const text = truncate(extractUserTextFromDb(db, msg.id) || "");
          const turnId = `${sessionId}:${++sequence}`;
          currentTask = createTaskRecord({
            source: "opencode",
            sessionId,
            turnId,
            startTime: ts,
            workspace: "",
            originalQuestion: text,
          });
          continue;
        }

        if (role === "assistant" && currentTask) {
          currentTask.last_event_time = ts;
          currentTask.input_tokens += Number(msg.input_tokens) || 0;
          currentTask.output_tokens += Number(msg.output_tokens) || 0;
          currentTask.cache_read_tokens += Number(msg.cache_read_tokens) || 0;
          currentTask.cache_creation_tokens += Number(msg.cache_write_tokens) || 0;
          currentTask.reasoning_output_tokens += Number(msg.reasoning_tokens) || 0;
          currentTask.total_tokens += Number(msg.total_tokens) || 0;

          const bashCount = db.query(
            `SELECT COUNT(*) as cnt FROM part WHERE message_id = ? AND json_valid(data) AND json_extract(data, '$.type') = 'tool' AND json_extract(data, '$.tool') = 'bash'`
          ).get(msg.id)?.cnt || 0;
          currentTask.command_count += Number(bashCount) || 0;
        }
      }

      if (currentTask) {
        finishTask(currentTask, currentTask.last_event_time || currentTask.start_time, "completed");
        if (currentTask.duration_seconds > 0) {
          records.push(currentTask);
        }
      }
    }

    records.sort((a, b) => (b.start_time || "").localeCompare(a.start_time || ""));
    const filtered = cutoffMs
      ? records.filter((r) => !r.start_time || new Date(r.start_time).getTime() >= cutoffMs)
      : records;
    return { records: filtered, scannedFiles: { opencode: 1 } };
  } finally {
    db.close();
  }
}

function extractUserTextFromDb(db, messageId) {
  try {
    const parts = db.query(
      `SELECT COALESCE(json_extract(data, '$.text'), '') as text
       FROM part
       WHERE message_id = ? AND json_valid(data) AND json_extract(data, '$.type') IN ('text', 'input_text')
       ORDER BY time_created ASC`
    ).all(messageId);

    if (!parts || !parts.length) return "";
    return parts.map((p) => p.text || "").join("\n").trim();
  } catch {
    return "";
  }
}

function collectTaskUsage(period = "all") {
  const claudeState = collectClaudeTaskUsage(period);
  const codexState = collectCodexTaskUsage(period);
  const opencodeState = collectOpenCodeTaskUsage(period);
  const records = [...claudeState.records, ...codexState.records, ...opencodeState.records]
    .sort((a, b) => (b.start_time || "").localeCompare(a.start_time || ""));

  return {
    records,
    scannedFiles: {
      claude: claudeState.scannedFiles.claude || 0,
      codex: codexState.scannedFiles.codex || 0,
      opencode: opencodeState.scannedFiles.opencode || 0,
    },
  };
}

// ============ Token 数据收集 ============

function toTaskJsonRecords(state, userName) {
  return state.records.map((record) => ({
    original_id: record.original_id,
    user_name: userName,
    tool_type: formatSourceForUpload(record.source),
    session_id: record.session_id,
    turn_id: record.turn_id,
    workspace: record.workspace,
    original_question: record.original_question,
    start_time: formatTimestamp(record.start_time),
    end_time: record.end_time ? formatTimestamp(record.end_time) : "",
    last_event_time: record.last_event_time ? formatTimestamp(record.last_event_time) : "",
    duration_seconds: record.duration_seconds,
    status: record.status,
    command_count: record.command_count,
    command_duration_seconds: record.command_duration_seconds,
    input_tokens: record.input_tokens,
    output_tokens: record.output_tokens,
    cache_creation_tokens: record.cache_creation_tokens,
    cache_read_tokens: record.cache_read_tokens,
    reasoning_output_tokens: record.reasoning_output_tokens,
    total_tokens: record.total_tokens,
    last_agent_message: record.last_agent_message,
  }));
}

function buildTaskUploadRecords(state, userName) {
  return state.records
    .map((record) => ({
      original_id: record.original_id,
      user_name: userName,
      tool_type: formatSourceForUpload(record.source),
      session_id: record.session_id,
      turn_id: record.turn_id,
      original_question: record.original_question,
      start_time: formatTimestamp(record.start_time),
      end_time: record.end_time ? formatTimestamp(record.end_time) : "",
      last_event_time: record.last_event_time ? formatTimestamp(record.last_event_time) : "",
      duration_seconds: Math.max(0, Math.round(Number(record.duration_seconds) || 0)),
      status: record.status,
      command_count: Math.max(0, Math.round(Number(record.command_count) || 0)),
      command_duration_seconds: Math.max(0, Number(record.command_duration_seconds) || 0),
      input_tokens: Math.max(0, Math.round(Number(record.input_tokens) || 0)),
      output_tokens: Math.max(0, Math.round(Number(record.output_tokens) || 0)),
      cache_creation_tokens: Math.max(0, Math.round(Number(record.cache_creation_tokens) || 0)),
      cache_read_tokens: Math.max(0, Math.round(Number(record.cache_read_tokens) || 0)),
      reasoning_output_tokens: Math.max(0, Math.round(Number(record.reasoning_output_tokens) || 0)),
      total_tokens: Math.max(0, Math.round(Number(record.total_tokens) || 0)),
    }))
    .filter((record) => (
      record.original_id &&
      record.user_name &&
      ["Claude Code", "Codex", "OpenCode"].includes(record.tool_type) &&
      record.session_id &&
      record.turn_id &&
      record.start_time &&
      ["completed", "running", "incomplete", "aborted"].includes(record.status)
    ))
    .sort((a, b) => (
      a.start_time === b.start_time
        ? a.turn_id.localeCompare(b.turn_id)
        : a.start_time.localeCompare(b.start_time)
    ));
}

function formatTaskReport(state, period, userName) {
  const records = state.records;
  const lines = [
    `### 任务耗时统计 - ${PERIOD_LABELS[period] || period}`,
    "",
    `**用户**: ${userName || "未知"}`,
    `**统计范围**: ${formatWorkspaceScope()}`,
    `**记录总数**: ${records.length} 条`,
    `**扫描文件数**: Claude Code ${state.scannedFiles.claude || 0} 个，Codex ${state.scannedFiles.codex || 0} 个，OpenCode ${state.scannedFiles.opencode === 1 ? "数据库" : `${state.scannedFiles.opencode || 0} 个`}`,
    "",
  ];

  if (!records.length) {
    lines.push("未找到任务记录。");
    return lines.join("\n");
  }

  const completed = records.filter((record) => record.status === "completed");
  const totalDuration = completed.reduce((sum, record) => sum + record.duration_seconds, 0);
  const totalCommandDuration = records.reduce((sum, record) => sum + record.command_duration_seconds, 0);
  const totalCommands = records.reduce((sum, record) => sum + record.command_count, 0);
  const totalTokens = records.reduce((sum, record) => sum + record.total_tokens, 0);
  const avgDuration = completed.length ? totalDuration / completed.length : 0;

  lines.push(
    `**已完成任务**: ${completed.length} 条`,
    `**平均总耗时**: ${formatDuration(avgDuration)}`,
    `**命令执行总耗时**: ${formatDuration(totalCommandDuration)}`,
    `**命令总数**: ${formatNumber(totalCommands)}`,
    `**总 tokens**: ${formatNumber(totalTokens)}`,
    "",
    "| 序号 | 来源 | 状态 | 原始问题 | 工作目录 | 开始时间 | 总耗时 | 命令数 | 命令耗时 | 总 tokens |",
    "|------|------|------|---------|---------|---------|-------:|-------:|---------:|----------:|"
  );

  records.forEach((record, index) => {
    const q = (record.original_question || "").replace(/\|/g, "｜") || "-";
    const workspace = (record.workspace || "").replace(/\|/g, "｜") || "-";
    const source = formatSourceForUpload(record.source).replace(/\|/g, "｜") || "-";
    lines.push(
      `| ${index + 1} | ${source} | ${record.status} | ${q} | ${workspace} | ${formatTimestamp(record.start_time)} | ${formatDuration(record.duration_seconds)} | ${formatNumber(record.command_count)} | ${formatDuration(record.command_duration_seconds)} | ${formatNumber(record.total_tokens)} |`
    );
  });

  lines.push("");
  lines.push("说明：Codex 总耗时按 task_started 到 task_complete 计算，并兼容导入/回放日志中同一毫秒完成的历史任务；Claude Code 总耗时按真实用户消息到下一次真实用户消息前的最后活跃日志计算；命令耗时兼容 Codex exec_command_end.duration 与 function_call_output 中的 Wall time，Claude Code 目前仅统计 Bash 命令数量。");
  return lines.join("\n");
}

module.exports = {
  createEmptyTaskMetrics,
  getDurationSeconds,
  getCommandDurationSeconds,
  parseWallTimeSeconds,
  createTaskRecord,
  createCodexTaskRecord,
  createClaudeTaskRecord,
  applyClaudeUsage,
  applyTaskTokenDelta,
  collectClaudeTaskUsage,
  collectCodexTaskUsage,
  collectOpenCodeTaskUsage,
  extractUserTextFromDb,
  collectTaskUsage,
  toTaskJsonRecords,
  buildTaskUploadRecords,
  formatTaskReport,
};
