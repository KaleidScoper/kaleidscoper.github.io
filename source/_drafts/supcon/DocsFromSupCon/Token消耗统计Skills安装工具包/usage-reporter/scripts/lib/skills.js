const fs = require("fs");
const { SOURCE_LABELS } = require("./config");
const { scanClaudeJsonlFiles, scanCodexJsonlFiles } = require("./files");
const { generateOriginalId, getCutoffTimestamp, hasWorkspaceFilter, isAllowedWorkspace, truncate, formatTimestamp, formatWorkspaceScope, formatSourceForUpload, parseJsonSafely, isOpenCodeInstalled, getOpenCodeDbPath, tryOpenSqliteDb, reportOpenCodeDbStatus } = require("./common");

function extractUserText(entry) {
  const content = entry.message?.content;
  if (typeof content === "string") return content.trim();
  if (Array.isArray(content)) {
    for (const item of content) {
      if (item.type === "text") return (item.text || "").trim();
    }
  }
  return "";
}

function extractCodexUserText(content) {
  if (!Array.isArray(content)) return "";

  const texts = content
    .filter((item) => item?.type === "input_text" && typeof item.text === "string")
    .map((item) => item.text.trim())
    .filter(Boolean);

  return texts.join("\n").trim();
}

function extractSkillNamesFromCommand(command) {
  if (typeof command !== "string" || !/SKILL\.md/i.test(command)) return [];

  const normalizedCommand = command.replace(/\\/g, "/");
  const regex = /(?:^|[/"'\s])(?:[^"'\\s]*\/)?skills\/(?:\.system\/)?([^\/"'\s]+)\/SKILL\.md\b/gi;
  const names = [];
  let match;

  while ((match = regex.exec(normalizedCommand)) !== null) {
    names.push(match[1]);
  }

  return [...new Set(names)];
}

function extractSkillNamesFromValue(value) {
  const names = [];

  function visit(current) {
    if (typeof current === "string") {
      names.push(...extractSkillNamesFromCommand(current));
      return;
    }
    if (Array.isArray(current)) {
      current.forEach(visit);
      return;
    }
    if (current && typeof current === "object") {
      Object.values(current).forEach(visit);
    }
  }

  visit(value);
  return [...new Set(names)];
}

function getCommandsFromCodexExecEvent(payload) {
  if (!payload || payload.type !== "exec_command_end") return [];

  const commands = [];
  if (Array.isArray(payload.command) && payload.command.length) {
    const commandText = payload.command[payload.command.length - 1];
    if (typeof commandText === "string" && commandText.trim()) {
      commands.push(commandText);
    }
  }

  if (Array.isArray(payload.parsed_cmd)) {
    for (const item of payload.parsed_cmd) {
      if (typeof item?.cmd === "string" && item.cmd.trim()) {
        commands.push(item.cmd);
      }
    }
  }

  return commands;
}

function extractCodexSkillNames(entry) {
  if (entry?.type === "event_msg") {
    return [...new Set(getCommandsFromCodexExecEvent(entry.payload).flatMap(extractSkillNamesFromCommand))];
  }

  if (entry?.type !== "response_item") return [];

  const payload = entry.payload || {};
  if (payload.type !== "function_call") return [];

  const args = parseJsonSafely(payload.arguments);
  if (!args) return [];

  return extractSkillNamesFromValue(args);
}

function collectClaudeSkillUsage(period = "all") {
  const cutoff = getCutoffTimestamp(period);
  const files = scanClaudeJsonlFiles();
  const records = [];
  const requiresWorkspaceCheck = hasWorkspaceFilter();

  for (const filePath of files) {
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      const lines = content.split("\n");
      let lastUserText = "";
      let shouldProcessFile = requiresWorkspaceCheck ? null : true;

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        let entry;
        try {
          entry = JSON.parse(trimmed);
        } catch {
          continue;
        }

        if (requiresWorkspaceCheck && shouldProcessFile === null && typeof entry.cwd === "string") {
          shouldProcessFile = isAllowedWorkspace(entry.cwd);
        }
        if (shouldProcessFile === false) break;
        if (shouldProcessFile === null) continue;

        const entryType = entry.type || "";
        const role = entry.message?.role || "";

        // 追踪最近的用户文本消息（排除 tool_result）
        if (entryType === "user" && role === "user") {
          const msgContent = entry.message?.content;
          if (typeof msgContent === "string" && msgContent.trim()) {
            lastUserText = msgContent.trim();
          } else if (Array.isArray(msgContent)) {
            const isToolResult = msgContent.some(
              (item) => typeof item === "object" && item.type === "tool_result"
            );
            if (!isToolResult) {
              const text = extractUserText(entry);
              if (text) lastUserText = text;
            }
          }
        }

        // 检测 Skill 调用
        if (entryType === "assistant") {
          const ts = entry.timestamp || "";
          if (cutoff && ts < cutoff) continue;

          const msgContent = entry.message?.content;
          if (!Array.isArray(msgContent)) continue;

          for (const item of msgContent) {
            if (item.type === "tool_use" && item.name === "Skill") {
              const skillName = item.input?.skill || "unknown";
              records.push({
                original_id: generateOriginalId(ts, skillName, "claude"),
                original_question: truncate(lastUserText),
                skill_name: skillName,
                call_time: ts,
                source: "claude",
              });
            }
          }
        }
      }
    } catch {
      continue;
    }
  }

  // 按时间倒序排列
  records.sort((a, b) => (b.call_time || "").localeCompare(a.call_time || ""));
  return records;
}

function collectCodexSkillUsage(period = "all") {
  const cutoff = getCutoffTimestamp(period);
  const files = scanCodexJsonlFiles();
  const records = [];
  const requiresWorkspaceCheck = hasWorkspaceFilter();

  for (const filePath of files) {
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      const lines = content.split("\n");
      let lastUserText = "";
      let currentTurnId = "";
      let sessionId = filePath;
      const seenTurnSkills = new Set();
      let shouldProcessFile = requiresWorkspaceCheck ? null : true;

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        let entry;
        try {
          entry = JSON.parse(trimmed);
        } catch {
          continue;
        }

        const ts = entry.timestamp || "";
        if (entry.type === "session_meta") {
          sessionId = entry.payload?.id || sessionId;
          if (requiresWorkspaceCheck) {
            shouldProcessFile = isAllowedWorkspace(entry.payload?.cwd || "");
          }
          continue;
        }

        if (shouldProcessFile === false) break;
        if (shouldProcessFile === null) continue;

        if (entry.type === "event_msg" && entry.payload?.type === "task_started") {
          currentTurnId = entry.payload.turn_id || ts || currentTurnId;
          continue;
        }

        if (
          entry.type === "response_item" &&
          entry.payload?.type === "message" &&
          entry.payload?.role === "user"
        ) {
          const text = extractCodexUserText(entry.payload.content);
          if (text) lastUserText = text;
          continue;
        }

        if (cutoff && ts && ts < cutoff) continue;

        const skillNames = extractCodexSkillNames(entry);
        if (!skillNames.length) continue;

        for (const skillName of skillNames) {
          const turnSkillKey = `${sessionId}|${currentTurnId || "session"}|${skillName}`;
          if (seenTurnSkills.has(turnSkillKey)) continue;
          seenTurnSkills.add(turnSkillKey);

          records.push({
            original_id: generateOriginalId(ts, skillName, "codex"),
            original_question: truncate(lastUserText),
            skill_name: skillName,
            call_time: ts,
            source: "codex",
          });
        }
      }
    } catch {
      continue;
    }
  }

  records.sort((a, b) => (b.call_time || "").localeCompare(a.call_time || ""));
  return records;
}

function collectOpenCodeSkillUsage(period = "all") {
  if (!isOpenCodeInstalled()) return [];

  const dbPath = getOpenCodeDbPath();
  if (!dbPath || !fs.existsSync(dbPath)) return [];

  const db = tryOpenSqliteDb(dbPath);
  if (!db) {
    reportOpenCodeDbStatus();
    return [];
  }

  const cutoffIso = getCutoffTimestamp(period);
  const cutoffMs = cutoffIso ? Date.parse(cutoffIso) : null;
  try {
    const records = [];
    const seen = new Set();

    const maxPartTime = Number(db.query("SELECT MAX(time_created) AS max FROM part").get()?.max);
    const timeFactor = Number.isFinite(maxPartTime) && maxPartTime > 0 && maxPartTime < 1e12 ? 1000 : 1;
    const cutoffDb =
      cutoffMs && Number.isFinite(cutoffMs) ? Math.floor(cutoffMs / timeFactor) : null;

    const partQuerySql =
      cutoffDb && Number.isFinite(cutoffDb)
        ? "SELECT id, session_id, time_created, COALESCE(json_extract(data, '$.state.input.name'), json_extract(data, '$.state.input.skill')) AS skill_name FROM part WHERE json_valid(data) AND json_extract(data, '$.type') = 'tool' AND json_extract(data, '$.tool') = 'skill' AND time_created >= ? ORDER BY time_created ASC"
        : "SELECT id, session_id, time_created, COALESCE(json_extract(data, '$.state.input.name'), json_extract(data, '$.state.input.skill')) AS skill_name FROM part WHERE json_valid(data) AND json_extract(data, '$.type') = 'tool' AND json_extract(data, '$.tool') = 'skill' ORDER BY time_created ASC";
    const partQuery = db.query(partQuerySql);
    const partRows =
      cutoffDb && Number.isFinite(cutoffDb) ? partQuery.all(cutoffDb) : partQuery.all();

    const userMsgQuery = db.query(
      "SELECT id, time_created FROM message WHERE session_id = ? AND time_created <= ? AND json_valid(data) AND json_extract(data, '$.role') = 'user' ORDER BY time_created ASC"
    );
    const buildTextPartsQuery = (placeholders) =>
      db.query(
        `SELECT message_id, COALESCE(json_extract(data, '$.text'), '') AS text, time_created FROM part WHERE message_id IN (${placeholders}) AND json_valid(data) AND json_extract(data, '$.type') IN ('text','input_text') ORDER BY message_id ASC, time_created ASC`
      );
    const questionByMessageId = new Map();

    const skillsBySession = new Map();
    for (const row of partRows) {
      const timeCreatedDb = Number(row.time_created);
      const timeCreated = Number.isFinite(timeCreatedDb) ? timeCreatedDb * timeFactor : NaN;
      if (!Number.isFinite(timeCreated)) continue;
      const sessionId = row.session_id;
      if (!sessionId) continue;
      const skillName = row.skill_name || "unknown";
      const key = `${row.id}|${skillName}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const list = skillsBySession.get(sessionId) || [];
      list.push({ id: row.id, timeCreated, skillName });
      skillsBySession.set(sessionId, list);
    }

    const userMsgsBySession = new Map();
    for (const [sessionId, skills] of skillsBySession.entries()) {
      skills.sort((a, b) => a.timeCreated - b.timeCreated);
      const maxTimeMs = skills[skills.length - 1]?.timeCreated;
      const maxTimeDb = Number.isFinite(maxTimeMs) ? Math.floor(maxTimeMs / timeFactor) : NaN;
      const msgs = Number.isFinite(maxTimeDb) ? userMsgQuery.all(sessionId, maxTimeDb) : [];
      userMsgsBySession.set(sessionId, Array.isArray(msgs) ? msgs : []);
    }

    for (const [sessionId, skills] of skillsBySession.entries()) {
      const msgs = userMsgsBySession.get(sessionId) || [];
      let msgIdx = 0;
      let lastUserMsgId = "";

      const neededMsgIds = new Set();
      for (const skill of skills) {
        while (
          msgIdx < msgs.length &&
          Number(msgs[msgIdx].time_created) * timeFactor <= skill.timeCreated
        ) {
          lastUserMsgId = msgs[msgIdx].id;
          msgIdx++;
        }
        skill.userMsgId = lastUserMsgId || "";
        if (skill.userMsgId) neededMsgIds.add(skill.userMsgId);
      }

      const missingMsgIds = [...neededMsgIds].filter((id) => !questionByMessageId.has(id));
      const CHUNK_SIZE = 200;
      for (let i = 0; i < missingMsgIds.length; i += CHUNK_SIZE) {
        const chunk = missingMsgIds.slice(i, i + CHUNK_SIZE);
        const placeholders = chunk.map(() => "?").join(",");
        const q = buildTextPartsQuery(placeholders);
        const rows = q.all(...chunk);

        const partsByMsg = new Map();
        for (const r of rows) {
          if (!r.message_id) continue;
          const arr = partsByMsg.get(r.message_id) || [];
          if (typeof r.text === "string" && r.text) arr.push(r.text);
          partsByMsg.set(r.message_id, arr);
        }
        for (const [mid, arr] of partsByMsg.entries()) {
          questionByMessageId.set(mid, arr.join("\n").trim());
        }

        for (const mid of chunk) {
          if (!questionByMessageId.has(mid)) questionByMessageId.set(mid, "");
        }
      }

      for (const skill of skills) {
        const originalQuestion =
          (skill.userMsgId && questionByMessageId.get(skill.userMsgId)) || "";

        const callTime = new Date(skill.timeCreated).toISOString();
        records.push({
          original_id: generateOriginalId(callTime, skill.skillName, "opencode"),
          original_question: truncate(originalQuestion),
          skill_name: skill.skillName,
          call_time: callTime,
          source: "opencode",
        });
      }
    }

    records.sort((a, b) => (b.call_time || "").localeCompare(a.call_time || ""));
    return records;
  } finally {
    db.close();
  }
}

function collectSkillUsage(period = "all") {
  const records = [
    ...collectClaudeSkillUsage(period),
    ...collectCodexSkillUsage(period),
    ...collectOpenCodeSkillUsage(period),
  ];
  records.sort((a, b) => (b.call_time || "").localeCompare(a.call_time || ""));
  return records;
}

// ============ Codex 任务耗时收集 ============

function formatReport(records, userName) {
  if (!records.length) return "未找到任何 Skill 调用记录。";

  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const timeStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  const sourceCount = {
    claude: 0,
    codex: 0,
    opencode: 0,
  };

  for (const record of records) {
    if (record.source && sourceCount[record.source] !== undefined) {
      sourceCount[record.source]++;
    }
  }

  const lines = [
    "## Skill 使用数据报告",
    "",
    `**用户**: ${userName || "未知"}`,
    `**统计范围**: ${formatWorkspaceScope()}`,
    `**记录总数**: ${records.length} 条`,
    `**Claude Code**: ${sourceCount.claude} 条`,
    `**Codex**: ${sourceCount.codex} 条`,
    `**OpenCode**: ${sourceCount.opencode} 条`,
    `**统计时间**: ${timeStr}`,
    "",
    "| 序号 | 来源 | 原始问题 | 人员名称 | Skill 名称 | 调用时间 |",
    "|------|------|---------|---------|-----------|---------|",
  ];

  records.forEach((r, i) => {
    const q = r.original_question.replace(/\|/g, "｜");
    const name = r.skill_name.replace(/\|/g, "｜");
    const t = formatTimestamp(r.call_time);
    const source = SOURCE_LABELS[r.source] || r.source || "未知";
    lines.push(`| ${i + 1} | ${source} | ${q} | ${userName} | ${name} | ${t} |`);
  });

  return lines.join("\n");
}

function toJsonRecords(records, userName, options = {}) {
  const includeSource = options.includeSource === true;
  return records.map((r) => {
    const item = {
      original_id: r.original_id,
      original_question: r.original_question,
      user_name: userName,
      skill_name: r.skill_name,
      call_time: formatTimestamp(r.call_time),
    };
    if (includeSource) item.source = formatSourceForUpload(r.source);
    return item;
  });
}

// ============ API 上报（使用 Node.js 内置 http 模块） ============

module.exports = {
  extractUserText,
  extractCodexUserText,
  extractSkillNamesFromCommand,
  extractSkillNamesFromValue,
  getCommandsFromCodexExecEvent,
  extractCodexSkillNames,
  collectClaudeSkillUsage,
  collectCodexSkillUsage,
  collectOpenCodeSkillUsage,
  collectSkillUsage,
  formatReport,
  toJsonRecords,
};