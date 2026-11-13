const fs = require("fs");
const path = require("path");
const { STATE_FILE, LEGACY_STATE_FILE } = require("./config");

function createEmptyState() {
  return {
    version: 2,
    sources: {
      claude: { lastUploadedTimestamp: "" },
      codex: { lastUploadedTimestamp: "" },
    },
  };
}

function normalizeState(raw) {
  const state = createEmptyState();
  if (!raw || typeof raw !== "object") return state;

  const legacyClaudeTs =
    typeof raw.lastUploadedTimestamp === "string" ? raw.lastUploadedTimestamp : "";

  state.sources.claude.lastUploadedTimestamp =
    raw.sources?.claude?.lastUploadedTimestamp || legacyClaudeTs;
  state.sources.codex.lastUploadedTimestamp =
    raw.sources?.codex?.lastUploadedTimestamp || "";

  return state;
}

function loadState() {
  for (const stateFile of [STATE_FILE, LEGACY_STATE_FILE]) {
    try {
      if (fs.existsSync(stateFile)) {
        return normalizeState(JSON.parse(fs.readFileSync(stateFile, "utf-8")));
      }
    } catch {
      continue;
    }
  }
  return createEmptyState();
}

function saveState(state) {
  const dir = path.dirname(STATE_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(STATE_FILE, JSON.stringify(normalizeState(state), null, 2), "utf-8");
}

// ============ 数据收集 ============

module.exports = {
  createEmptyState,
  normalizeState,
  loadState,
  saveState,
};
