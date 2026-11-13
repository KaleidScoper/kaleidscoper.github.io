#!/bin/bash

set -u

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DEFAULT_SKILL_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
SKILL_DIR="${USAGE_REPORTER_SKILL_DIR:-$DEFAULT_SKILL_DIR}"

COLLECT_JS="$SKILL_DIR/scripts/collect.js"
UPDATE_JS="$SKILL_DIR/scripts/update-usage-reporter.js"
STATE_FILE="$HOME/.claude/usage-reporter-state.json"
LOG_DIR="$SKILL_DIR/logs"

# launchd 的 PATH 很精简，补上常见 Node 安装目录。
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"

mkdir -p "$LOG_DIR"

RUN_TS="$(date '+%Y%m%d-%H%M%S')"
LOG_FILE="$LOG_DIR/upload-all-$RUN_TS.log"

pause_if_interactive() {
  if [ -t 0 ] && [ -t 1 ]; then
    printf '\n按回车键关闭窗口...'
    read -r _
  fi
}

log() {
  printf '%s\n' "$1" | tee -a "$LOG_FILE"
}

log "[$(date '+%Y-%m-%d %H:%M:%S')] usage-reporter upload started."
log "Skill directory: $SKILL_DIR"
log "Log file: $LOG_FILE"

NODE_BIN="$(command -v node 2>/dev/null || true)"
if [ -z "$NODE_BIN" ]; then
  for candidate in /opt/homebrew/bin/node /usr/local/bin/node; do
    if [ -x "$candidate" ]; then
      NODE_BIN="$candidate"
      break
    fi
  done
fi

if [ -z "$NODE_BIN" ]; then
  log "ERROR: node was not found in PATH."
  pause_if_interactive
  exit 1
fi

if [ ! -f "$COLLECT_JS" ]; then
  log "ERROR: collect.js was not found: $COLLECT_JS"
  pause_if_interactive
  exit 1
fi

if [ -f "$UPDATE_JS" ]; then
  log "Checking for usage-reporter updates..."
  if ! "$NODE_BIN" "$UPDATE_JS" >>"$LOG_FILE" 2>&1; then
    log "WARN: update check failed; continuing with local reporter."
  fi
else
  log "Update script not found, skipping update check: $UPDATE_JS"
fi

if [ "${1:-}" = "force" ]; then
  log "Force mode enabled. Removing local state file: $STATE_FILE"
  if [ -f "$STATE_FILE" ]; then
    rm -f "$STATE_FILE" >>"$LOG_FILE" 2>&1
  fi
fi

log "Running: $NODE_BIN $COLLECT_JS all upload"
"$NODE_BIN" "$COLLECT_JS" all upload >>"$LOG_FILE" 2>&1
EXIT_CODE=$?

log "[$(date '+%Y-%m-%d %H:%M:%S')] upload finished with exit code $EXIT_CODE."

if [ "$EXIT_CODE" -ne 0 ]; then
  log "Upload failed. See log: $LOG_FILE"
  pause_if_interactive
  exit "$EXIT_CODE"
fi

log "Upload succeeded. Log: $LOG_FILE"
pause_if_interactive
exit 0
