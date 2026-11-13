const fs = require("fs");
const path = require("path");
const { HOME_DIR, SOURCE_LABELS, PERIOD_LABELS } = require("./config");
const { collectJsonlFiles, collectKimiWireJsonlFiles, collectCodewhaleSessionFiles } = require("./files");
const { parseJsonSafely, parseTimestamp, formatTimestamp, formatSourceForUpload, formatNumber, isOpenCodeInstalled, getOpenCodeDbPath, tryOpenSqliteDb, reportOpenCodeDbStatus } = require("./common");

function startOfLocalDay(date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function getSinceDate(period) {
  if (period === "all") return null;

  const now = new Date();
  const today = startOfLocalDay(now);

  if (period === "today") return today;
  if (period === "week") {
    const day = today.getDay();
    const daysSinceMonday = (day + 6) % 7;
    today.setDate(today.getDate() - daysSinceMonday);
    return today;
  }

  const days = Number.parseInt(String(period).replace("d", ""), 10);
  if (Number.isNaN(days)) return null;
  today.setDate(today.getDate() - days);
  return today;
}

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function createEmptyTokenMetrics() {
  return {
    count: 0,
    inputTokens: 0,
    outputTokens: 0,
    cacheCreationTokens: 0,
    cacheReadTokens: 0,
    reasoningOutputTokens: 0,
    totalTokens: 0,
  };
}

function createTokenStatsState() {
  return {
    daily: new Map(),
    bySource: new Map(),
    uploadRecords: [],
    scannedFiles: {
      claude: 0,
      codex: 0,
      kimi: 0,
      codewhale: 0,
    },
  };
}

function getTokenMetricsBucket(map, key) {
  if (!map.has(key)) {
    map.set(key, createEmptyTokenMetrics());
  }
  return map.get(key);
}

function addTokenMetrics(target, addition) {
  target.count += addition.count;
  target.inputTokens += addition.inputTokens;
  target.outputTokens += addition.outputTokens;
  target.cacheCreationTokens += addition.cacheCreationTokens;
  target.cacheReadTokens += addition.cacheReadTokens;
  target.reasoningOutputTokens += addition.reasoningOutputTokens;
  target.totalTokens += addition.totalTokens;
}

function recordTokenUsage(state, { source, timestamp, metrics }) {
  const dateKey = toDateKey(timestamp);
  addTokenMetrics(getTokenMetricsBucket(state.daily, dateKey), metrics);
  addTokenMetrics(getTokenMetricsBucket(state.bySource, source), metrics);
  state.uploadRecords.push({ source, timestamp, metrics });
}

function processClaudeTokenFile(filePath, since, state) {
  state.scannedFiles.claude += 1;

  let lines = [];
  try {
    lines = fs.readFileSync(filePath, "utf-8").split("\n");
  } catch {
    return;
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const entry = parseJsonSafely(trimmed);
    if (!entry || entry.type !== "assistant") continue;

    const usage = entry.message?.usage;
    if (!usage) continue;

    const timestamp = parseTimestamp(entry.timestamp);
    if (!timestamp || (since && timestamp < since)) continue;

    const metrics = {
      count: 1,
      inputTokens: usage.input_tokens ?? 0,
      outputTokens: usage.output_tokens ?? 0,
      cacheCreationTokens: usage.cache_creation_input_tokens ?? 0,
      cacheReadTokens: usage.cache_read_input_tokens ?? 0,
      reasoningOutputTokens: 0,
      totalTokens: (usage.input_tokens ?? 0) + (usage.output_tokens ?? 0),
    };

    recordTokenUsage(state, {
      source: "claude",
      timestamp,
      metrics,
    });
  }
}

function extractCodexTokenTotals(info) {
  const totals = info?.total_token_usage;
  if (!totals) return null;

  return {
    inputTokens: totals.input_tokens ?? 0,
    outputTokens: totals.output_tokens ?? 0,
    cacheCreationTokens: 0,
    cacheReadTokens: totals.cached_input_tokens ?? 0,
    reasoningOutputTokens: totals.reasoning_output_tokens ?? 0,
    totalTokens: totals.total_tokens ?? ((totals.input_tokens ?? 0) + (totals.output_tokens ?? 0)),
  };
}

function diffCodexTokenTotals(current, previous) {
  const diff = {
    count: 0,
    inputTokens: current.inputTokens - previous.inputTokens,
    outputTokens: current.outputTokens - previous.outputTokens,
    cacheCreationTokens: 0,
    cacheReadTokens: current.cacheReadTokens - previous.cacheReadTokens,
    reasoningOutputTokens: current.reasoningOutputTokens - previous.reasoningOutputTokens,
    totalTokens: current.totalTokens - previous.totalTokens,
  };

  const hasNegative =
    diff.inputTokens < 0 ||
    diff.outputTokens < 0 ||
    diff.cacheReadTokens < 0 ||
    diff.reasoningOutputTokens < 0 ||
    diff.totalTokens < 0;

  if (hasNegative) return null;

  const hasUsage =
    diff.inputTokens > 0 ||
    diff.outputTokens > 0 ||
    diff.cacheReadTokens > 0 ||
    diff.reasoningOutputTokens > 0 ||
    diff.totalTokens > 0;

  if (!hasUsage) return null;

  diff.count = 1;
  return diff;
}

function processCodexTokenFile(filePath, since, state) {
  state.scannedFiles.codex += 1;

  let lines = [];
  try {
    lines = fs.readFileSync(filePath, "utf-8").split("\n");
  } catch {
    return;
  }

  let previousTotals = {
    inputTokens: 0,
    outputTokens: 0,
    cacheCreationTokens: 0,
    cacheReadTokens: 0,
    reasoningOutputTokens: 0,
    totalTokens: 0,
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const entry = parseJsonSafely(trimmed);
    if (!entry || entry.type !== "event_msg" || entry.payload?.type !== "token_count") {
      continue;
    }

    const timestamp = parseTimestamp(entry.timestamp);
    if (!timestamp) continue;

    const currentTotals = extractCodexTokenTotals(entry.payload.info);
    if (!currentTotals) continue;

    const delta = diffCodexTokenTotals(currentTotals, previousTotals);
    previousTotals = currentTotals;

    if (!delta || (since && timestamp < since)) continue;

    recordTokenUsage(state, {
      source: "codex",
      timestamp,
      metrics: delta,
    });
  }
}

function processOpenCodeTokenDb(since, state) {
  if (!isOpenCodeInstalled()) return false;

  const dbPath = getOpenCodeDbPath();
  if (!dbPath || !fs.existsSync(dbPath)) return false;

  const db = tryOpenSqliteDb(dbPath);
  if (!db) {
    reportOpenCodeDbStatus();
    return false;
  }
  try {
    const cutoffTime = since ? since.getTime() : 0;
    const rows = db.query(
      `SELECT
        m.time_created,
        COALESCE(json_extract(m.data, '$.tokens.input'), 0) as input_tokens,
        COALESCE(json_extract(m.data, '$.tokens.output'), 0) as output_tokens,
        COALESCE(json_extract(m.data, '$.tokens.reasoning'), 0) as reasoning_tokens,
        COALESCE(json_extract(m.data, '$.tokens.cache.read'), 0) as cache_read_tokens,
        COALESCE(json_extract(m.data, '$.tokens.cache.write'), 0) as cache_write_tokens,
        COALESCE(json_extract(m.data, '$.tokens.total'), COALESCE(json_extract(m.data, '$.tokens.input'), 0) + COALESCE(json_extract(m.data, '$.tokens.output'), 0)) as total_tokens
      FROM session s
      JOIN message m ON m.session_id = s.id
      WHERE json_extract(m.data, '$.role') = 'assistant'
        AND m.time_created >= ?
      ORDER BY m.time_created ASC`
    ).all(cutoffTime);

    for (const row of rows) {
      const timestamp = new Date(row.time_created);
      const metrics = {
        count: 1,
        inputTokens: Number(row.input_tokens),
        outputTokens: Number(row.output_tokens),
        cacheCreationTokens: Number(row.cache_write_tokens),
        cacheReadTokens: Number(row.cache_read_tokens),
        reasoningOutputTokens: Number(row.reasoning_tokens),
        totalTokens: Number(row.total_tokens),
      };

      recordTokenUsage(state, {
        source: "opencode",
        timestamp,
        metrics,
      });
    }

    state.scannedFiles.opencode = 1;
  } finally {
    db.close();
  }

  return true;
}

function processKimiTokenFile(filePath, since, state) {
  state.scannedFiles.kimi += 1;

  let lines = [];
  try {
    lines = fs.readFileSync(filePath, "utf-8").split("\n");
  } catch {
    return;
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const entry = parseJsonSafely(trimmed);
    if (!entry || entry.type !== "usage.record") continue;

    const usage = entry.usage;
    if (!usage) continue;

    const timestamp = parseTimestamp(entry.time);
    if (!timestamp || (since && timestamp < since)) continue;

    const inputOther = usage.inputOther ?? 0;
    const output = usage.output ?? 0;
    const cacheRead = usage.inputCacheRead ?? 0;
    const cacheCreation = usage.inputCacheCreation ?? 0;

    const metrics = {
      count: 1,
      inputTokens: inputOther,
      outputTokens: output,
      cacheCreationTokens: cacheCreation,
      cacheReadTokens: cacheRead,
      reasoningOutputTokens: 0,
      totalTokens: inputOther + output + cacheRead + cacheCreation,
    };

    recordTokenUsage(state, {
      source: "kimi",
      timestamp,
      metrics,
    });
  }
}

function processCodewhaleSessionFile(filePath, since, state) {
  state.scannedFiles.codewhale += 1;

  let content;
  try {
    content = fs.readFileSync(filePath, "utf-8");
  } catch {
    return;
  }

  const session = parseJsonSafely(content);
  if (!session || !session.metadata) return;

  const metadata = session.metadata;
  const totalTokens = metadata.total_tokens ?? 0;
  if (totalTokens === 0) return;

  const timestamp = parseTimestamp(metadata.updated_at || metadata.created_at);
  if (!timestamp || (since && timestamp < since)) return;

  const metrics = {
    count: 1,
    inputTokens: totalTokens,
    outputTokens: 0,
    cacheCreationTokens: 0,
    cacheReadTokens: 0,
    reasoningOutputTokens: 0,
    totalTokens: totalTokens,
  };

  recordTokenUsage(state, {
    source: "codewhale",
    timestamp,
    metrics,
  });
}

function collectTokenUsage(period = "7d") {
  const since = getSinceDate(period);
  const state = createTokenStatsState();
  const homeDir = process.env.HOME || process.env.USERPROFILE;

  for (const file of collectJsonlFiles(path.join(homeDir, ".claude", "projects"))) {
    processClaudeTokenFile(file, since, state);
  }

  const codexRoots = [
    path.join(homeDir, ".codex", "archived_sessions"),
    path.join(homeDir, ".codex", "sessions"),
  ];
  for (const root of codexRoots) {
    for (const file of collectJsonlFiles(root)) {
      processCodexTokenFile(file, since, state);
    }
  }

  for (const file of collectKimiWireJsonlFiles()) {
    processKimiTokenFile(file, since, state);
  }

  for (const file of collectCodewhaleSessionFiles()) {
    processCodewhaleSessionFile(file, since, state);
  }

  processOpenCodeTokenDb(since, state);

  return state;
}

function renderTokenSourceSummary(state) {
  const lines = [];
  const totals = createEmptyTokenMetrics();

  for (const source of ["claude", "codex", "kimi", "codewhale", "opencode"]) {
    const metrics = state.bySource.get(source);
    if (!metrics || metrics.count === 0) continue;

    addTokenMetrics(totals, metrics);
    lines.push(
      `| ${SOURCE_LABELS[source]} | ${formatNumber(metrics.count)} | ${formatNumber(metrics.inputTokens)} | ${formatNumber(metrics.outputTokens)} | ${formatNumber(metrics.cacheCreationTokens)} | ${formatNumber(metrics.cacheReadTokens)} | ${formatNumber(metrics.reasoningOutputTokens)} | ${formatNumber(metrics.totalTokens)} |`
    );
  }

  if (!lines.length) return "";

  return [
    "#### 来源汇总",
    "",
    "| 来源 | 记录数 | 输入 tokens | 输出 tokens | 缓存创建 | 缓存读取 | 推理输出 | 总 tokens |",
    "|---|---:|---:|---:|---:|---:|---:|---:|",
    ...lines,
    `| **合计** | **${formatNumber(totals.count)}** | **${formatNumber(totals.inputTokens)}** | **${formatNumber(totals.outputTokens)}** | **${formatNumber(totals.cacheCreationTokens)}** | **${formatNumber(totals.cacheReadTokens)}** | **${formatNumber(totals.reasoningOutputTokens)}** | **${formatNumber(totals.totalTokens)}** |`,
    "",
  ].join("\n");
}

function renderTokenDailyTable(state) {
  const dates = [...state.daily.keys()].sort().reverse();
  const totals = createEmptyTokenMetrics();
  const lines = dates.map((date) => {
    const metrics = state.daily.get(date);
    addTokenMetrics(totals, metrics);
    return `| ${date} | ${formatNumber(metrics.count)} | ${formatNumber(metrics.inputTokens)} | ${formatNumber(metrics.outputTokens)} | ${formatNumber(metrics.cacheCreationTokens)} | ${formatNumber(metrics.cacheReadTokens)} | ${formatNumber(metrics.reasoningOutputTokens)} | ${formatNumber(metrics.totalTokens)} |`;
  });

  return [
    "| 日期 | 记录数 | 输入 tokens | 输出 tokens | 缓存创建 | 缓存读取 | 推理输出 | 总 tokens |",
    "|---|---:|---:|---:|---:|---:|---:|---:|",
    ...lines,
    `| **合计** | **${formatNumber(totals.count)}** | **${formatNumber(totals.inputTokens)}** | **${formatNumber(totals.outputTokens)}** | **${formatNumber(totals.cacheCreationTokens)}** | **${formatNumber(totals.cacheReadTokens)}** | **${formatNumber(totals.reasoningOutputTokens)}** | **${formatNumber(totals.totalTokens)}** |`,
  ].join("\n");
}

function formatTokenReport(state, period, userName) {
  const lines = [
    `### Token 使用统计 - ${PERIOD_LABELS[period] || period}`,
    "",
    `**用户**: ${userName || "未知"}`,
    "",
  ];

  if (state.daily.size === 0) {
    lines.push("未找到任何 token 使用记录。", "");
    lines.push(
      `扫描文件数：Claude Code ${state.scannedFiles.claude} 个，Codex ${state.scannedFiles.codex} 个，Kimi ${state.scannedFiles.kimi} 个，Codewhale ${state.scannedFiles.codewhale} 个，OpenCode ${state.scannedFiles.opencode || 0} 个。`
    );
    return lines.join("\n");
  }

  const sourceSummary = renderTokenSourceSummary(state);
  if (sourceSummary) {
    lines.push(sourceSummary, "");
  }

  lines.push(renderTokenDailyTable(state), "");
  const opencodeScanned = state.scannedFiles.opencode === 1
    ? "数据库"
    : `${state.scannedFiles.opencode || 0} 个`;
  lines.push(
    `扫描文件数：Claude Code ${state.scannedFiles.claude} 个，Codex ${state.scannedFiles.codex} 个，Kimi ${state.scannedFiles.kimi} 个，Codewhale ${state.scannedFiles.codewhale} 个，OpenCode ${opencodeScanned}。`
  );
  lines.push("说明：Codex 按 token_count 事件的累计值做增量差分，避免重复统计相同快照；Kimi 按 usage.record 逐条统计；Codewhale 按 session metadata.total_tokens 统计。");
  return lines.join("\n");
}

function buildTokenUploadRecords(state, userName) {
  return state.uploadRecords
    .map(({ source, timestamp, metrics }) => {
      const inputTokens = metrics.inputTokens + metrics.cacheCreationTokens + metrics.cacheReadTokens;
      const outputTokens = metrics.outputTokens + metrics.reasoningOutputTokens;
      return {
        user_name: userName,
        usage_date: formatTimestamp(timestamp),
        tool_type: formatSourceForUpload(source),
        usage_count: metrics.count,
input_tokens: inputTokens,
        output_tokens: outputTokens,
        total_tokens: inputTokens + outputTokens,
      };
    })
    .filter((record) => record.usage_count > 0)
    .sort((a, b) => (
      a.usage_date === b.usage_date
        ? a.tool_type.localeCompare(b.tool_type)
        : a.usage_date.localeCompare(b.usage_date)
    ));
}

// ============ 格式化输出 ============

module.exports = {
  startOfLocalDay,
  getSinceDate,
  toDateKey,
  createEmptyTokenMetrics,
  createTokenStatsState,
  getTokenMetricsBucket,
  addTokenMetrics,
  recordTokenUsage,
  processClaudeTokenFile,
  extractCodexTokenTotals,
  diffCodexTokenTotals,
  processCodexTokenFile,
  processKimiTokenFile,
  processCodewhaleSessionFile,
  processOpenCodeTokenDb,
  collectTokenUsage,
  renderTokenSourceSummary,
  renderTokenDailyTable,
  formatTokenReport,
  buildTokenUploadRecords,
};
