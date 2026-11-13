const path = require("path");

const REPORT_API = process.env.USAGE_REPORTER_SKILL_API || "http://supdt.supcon.com:9903/api/skills/usage";
const TOKEN_REPORT_API = process.env.USAGE_REPORTER_TOKEN_API || "http://supdt.supcon.com:9903/api/token/usage";
const CODEX_TASK_REPORT_API = process.env.USAGE_REPORTER_CODEX_TASK_API || "http://supdt.supcon.com:9903/api/codex/tasks/usage";
const TOKEN_UPLOAD_BATCH_SIZE = 500;
const CODEX_TASK_UPLOAD_BATCH_SIZE = 500;

const HOME_DIR = process.env.HOME || process.env.USERPROFILE || ".";
const STATE_DIR = path.join(HOME_DIR, ".claude");
const STATE_FILE = path.join(STATE_DIR, "usage-reporter-state.json");
const LEGACY_STATE_FILE = path.join(STATE_DIR, "skill-usage-reporter-state.json");

const SOURCE_LABELS = {
  claude: "Claude Code",
  codex: "Codex",
  kimi: "Kimi",
  codewhale: "Codewhale",
  opencode: "OpenCode",
};

const PERIOD_LABELS = {
  today: "Today",
  week: "This week",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
  all: "All",
};

const VALID_PERIODS = Object.keys(PERIOD_LABELS);
const VALID_TARGETS = ["skills", "skill", "tokens", "token", "tasks", "task", "all"];
const VALID_MODES = ["report", "json", "upload", "help"];

const ORIGINAL_QUESTION_MAX_LEN = 200;

module.exports = {
  REPORT_API,
  TOKEN_REPORT_API,
  CODEX_TASK_REPORT_API,
  TOKEN_UPLOAD_BATCH_SIZE,
  CODEX_TASK_UPLOAD_BATCH_SIZE,
  HOME_DIR,
  STATE_DIR,
  STATE_FILE,
  LEGACY_STATE_FILE,
  SOURCE_LABELS,
  PERIOD_LABELS,
  VALID_PERIODS,
  VALID_TARGETS,
  VALID_MODES,
  ORIGINAL_QUESTION_MAX_LEN,
};