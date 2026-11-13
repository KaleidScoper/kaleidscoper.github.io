const path = require("path");
const fs = require("fs");
const { execFileSync } = require("child_process");
const { ORIGINAL_QUESTION_MAX_LEN, SOURCE_LABELS } = require("./config");

function normalizeForComparison(targetPath) {
  if (typeof targetPath !== "string" || !targetPath.trim()) return "";
  return path.resolve(targetPath).replace(/\\/g, "/").replace(/\/+$/, "");
}

function isPathWithinRoot(targetPath, rootPath) {
  const normalizedTarget = normalizeForComparison(targetPath);
  const normalizedRoot = normalizeForComparison(rootPath);
  if (!normalizedTarget || !normalizedRoot) return false;
  return (
    normalizedTarget === normalizedRoot ||
    normalizedTarget.startsWith(`${normalizedRoot}/`)
  );
}

function getWorkspaceRoots() {
  const configured = String(process.env.USAGE_REPORTER_WORKSPACE_ROOTS || "").trim();
  if (!configured) return [];
  return configured
    .split(/[;\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function isAllowedWorkspace(targetPath) {
  const roots = getWorkspaceRoots();
  if (roots.length === 0) return true;
  return roots.some((root) => isPathWithinRoot(targetPath, root));
}

function formatWorkspaceScope() {
  const roots = getWorkspaceRoots();
  return roots.length > 0 ? roots.join(", ") : "全部工作目录";
}

function hasWorkspaceFilter() {
  return getWorkspaceRoots().length > 0;
}

/**
 * 简单哈希函数，返回正整数字符串
 */

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash = ((hash << 5) - hash + ch) | 0;
  }
  return String(Math.abs(hash));
}

/**
 * 基于记录内容生成稳定的 original_id
 * 为兼容已有 Claude 数据，Claude 继续沿用旧规则；
 * Codex 加入 source 参与哈希，避免跨来源碰撞。
 */

function generateOriginalId(callTime, skillName, source = "claude") {
  if (source === "claude") {
    return simpleHash(`${callTime}|${skillName}`);
  }
  return simpleHash(`${source}|${callTime}|${skillName}`);
}

function getUserName() {
  try {
    const name = execFileSync("git", ["config", "user.name"], {
      timeout: 5000,
      encoding: "utf-8",
      shell: false,
      windowsHide: true,
    }).trim();
    return name || process.env.USERNAME || process.env.USER || "";
  } catch {
    return process.env.USERNAME || process.env.USER || "";
  }
}

function formatSourceForUpload(source) {
  return SOURCE_LABELS[source] || source || "";
}

function truncate(text, maxLen = ORIGINAL_QUESTION_MAX_LEN) {
  text = text.replace(/[\r\n]+/g, " ").trim();
  return text.length <= maxLen ? text : text.slice(0, maxLen) + "...";
}

/**
 * 将 ISO 时间戳转换为中国时间（UTC+8）并格式化
 */

function formatTimestamp(ts) {
  try {
    const d = new Date(ts);
    // UTC+8
    const cst = new Date(d.getTime() + 8 * 60 * 60 * 1000);
    const pad = (n) => String(n).padStart(2, "0");
    return `${cst.getUTCFullYear()}-${pad(cst.getUTCMonth() + 1)}-${pad(cst.getUTCDate())} ${pad(cst.getUTCHours())}:${pad(cst.getUTCMinutes())}:${pad(cst.getUTCSeconds())}`;
  } catch {
    return ts;
  }
}

function getCutoffTimestamp(period) {
  const now = new Date();
  switch (period) {
    case "week": {
      const day = now.getDay();
      const daysSinceMonday = (day + 6) % 7;
      return new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - daysSinceMonday
      ).toISOString();
    }
    case "today":
      return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    case "7d":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    case "30d":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    case "90d":
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
    case "all":
      return null;
    default:
      return null;
  }
}

// ============ 状态管理（去重） ============

function parseJsonSafely(text) {
  if (typeof text !== "string" || !text.trim()) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function parseTimestamp(value) {
  if (!value) return null;
  let numValue = value;
  if (typeof value === "number" && value < 1e12) {
    numValue = value * 1000;
  }
  const date = new Date(numValue);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatDuration(seconds) {
  const total = Math.max(0, Math.round(Number(seconds) || 0));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
}

// ============ OpenCode 支持函数 ============

function getOpenCodeDbPath() {
  if (process.env.OPENCODE_DB_PATH) return process.env.OPENCODE_DB_PATH;
  return path.join(process.env.HOME || process.env.USERPROFILE, ".local", "share", "opencode", "opencode.db");
}

function getOpenCodeConfigDir() {
  return process.env.OPENCODE_CONFIG_DIR || path.join(process.env.HOME || process.env.USERPROFILE, ".config", "opencode");
}

function isOpenCodeInstalled() {
  const { spawnSync } = require("child_process");
  try {
    const r = spawnSync("opencode", ["--version"], { encoding: "utf8", timeout: 5000 });
    if (r.status === 0) return true;
  } catch {}
  const configDir = getOpenCodeConfigDir();
  if (configDir && fs.existsSync(configDir)) return true;
  const dbPath = getOpenCodeDbPath();
  if (dbPath && fs.existsSync(dbPath)) return true;
  return false;
}

function isBunAvailable() {
  try {
    const { spawnSync } = require("child_process");
    const r = spawnSync("bun", ["--version"], { encoding: "utf8" });
    return r.status === 0;
  } catch {
    return false;
  }
}

function ensureBunInstalled() {
  if (isBunAvailable()) return true;
  const isWin = process.platform === "win32";
  const installCmd = isWin
    ? ['powershell', '-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', 'irm bun.sh/install.ps1 | iex']
    : ['bash', '-c', 'curl -fsSL https://bun.sh/install | bash'];
  try {
    const { spawnSync } = require("child_process");
    console.log("正在安装 Bun 运行时环境，预计需要 1~10 分钟，请稍候 ...");
    const r = spawnSync(installCmd[0], installCmd.slice(1), {
      stdio: "inherit",
      timeout: 600000,
      shell: isWin,
    });
    if (r.status === 0) {
      console.log("Bun 运行时环境安装成功。请执行 `bun --version` 确认安装，然后重启应用以启用 OpenCode 数据库采集。");
      return true;
    }
    console.error("Bun 运行时环境安装失败，跳过 OpenCode 统计。");
    return false;
  } catch (e) {
    console.error("Bun 安装过程出错:", e.message);
    return false;
  }
}

function ensureNodeExperimentalSqlite(scriptFilename) {
  const isBunRuntime = !!process.versions?.bun;
  if (isBunRuntime) return;

  const nodeMajor = Number(process.versions?.node?.split(".")[0]) || 0;
  if (nodeMajor !== 22) return;

  if (process.execArgv.some((a) => a.includes("experimental-sqlite"))) return;

  try {
    require("node:sqlite");
    return;
  } catch {}

  if (!isOpenCodeInstalled()) return;

  const dbPath = getOpenCodeDbPath();
  if (!dbPath || !fs.existsSync(dbPath)) return;

  const { spawnSync } = require("child_process");
  console.log("Node.js v22 需要 --experimental-sqlite 标志，正在自动重新执行 ...");
  const r = spawnSync(process.execPath, ["--experimental-sqlite", scriptFilename, ...process.argv.slice(2)], { stdio: "inherit" });
  process.exit(typeof r.status === "number" ? r.status : 1);
}

function tryOpenSqliteDb(dbPath) {
  try {
    const { Database } = require("bun:sqlite");
    return new Database(dbPath, { readonly: true });
  } catch {}

  try {
    const { DatabaseSync } = require("node:sqlite");
    const db = new DatabaseSync(dbPath, { readOnly: true });
    db.query = db.prepare.bind(db);
    return db;
  } catch {}

  return null;
}

function reportOpenCodeDbStatus() {
  if (!isOpenCodeInstalled()) return false;
  const dbPath = getOpenCodeDbPath();
  if (!dbPath || !fs.existsSync(dbPath)) return false;

  try {
    require("bun:sqlite");
    return true;
  } catch {}

  try {
    require("node:sqlite");
    return true;
  } catch {}

  const nodeMajor = Number(process.versions?.node?.split(".")[0]) || 0;
  let msg;
  if (nodeMajor === 22) {
    msg = `当前 Node.js v${process.versions.node} 未启用 --experimental-sqlite 标志，请使用 \`node --experimental-sqlite collect.js\` 或 Bun 运行时（\`bun run collect.js\`）重新执行。`;
  } else if (nodeMajor && nodeMajor < 23) {
    msg = `当前 Node.js v${process.versions.node} 不支持内置 SQLite（需 Node.js 23+），请使用 Bun 运行时（\`bun run collect.js\`）重新执行。`;
  } else {
    msg = `当前运行时缺少 SQLite 支持，请使用 Bun 运行时（\`bun run collect.js\`）重新执行。`;
  }
  console.warn("检测到 OpenCode 但无法读取数据库：" + msg);
  return false;
}

module.exports = {
  normalizeForComparison,
  isPathWithinRoot,
  getWorkspaceRoots,
  isAllowedWorkspace,
  formatWorkspaceScope,
  hasWorkspaceFilter,
  simpleHash,
  generateOriginalId,
  getUserName,
  formatSourceForUpload,
  truncate,
  formatTimestamp,
  getCutoffTimestamp,
  parseJsonSafely,
  parseTimestamp,
  formatNumber,
  formatDuration,
  getOpenCodeDbPath,
  getOpenCodeConfigDir,
  isOpenCodeInstalled,
  isBunAvailable,
  ensureBunInstalled,
  tryOpenSqliteDb,
  ensureNodeExperimentalSqlite,
  reportOpenCodeDbStatus,
};