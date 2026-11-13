#!/bin/bash

set -u

TASK_LABEL="com.usage-reporter.daily-upload"
TASK_HOUR=9
TASK_MINUTE=10

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
UPLOAD_SCRIPT="$SCRIPT_DIR/upload-usage-all-macos.command"
PLIST_DIR="$HOME/Library/LaunchAgents"
PLIST_PATH="$PLIST_DIR/$TASK_LABEL.plist"
LOG_DIR="$(cd "$SCRIPT_DIR/.." && pwd)/logs"

pause_if_interactive() {
  if [ -t 0 ] && [ -t 1 ]; then
    printf '\n按回车键关闭窗口...'
    read -r _
  fi
}

if [ ! -f "$UPLOAD_SCRIPT" ]; then
  printf 'ERROR: upload script was not found:\n  %s\n' "$UPLOAD_SCRIPT"
  pause_if_interactive
  exit 1
fi

mkdir -p "$PLIST_DIR" "$LOG_DIR"
chmod +x "$UPLOAD_SCRIPT"

cat >"$PLIST_PATH" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>$TASK_LABEL</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string>
    <string>$UPLOAD_SCRIPT</string>
  </array>
  <key>WorkingDirectory</key>
  <string>$SCRIPT_DIR</string>
  <key>StartCalendarInterval</key>
  <dict>
    <key>Hour</key>
    <integer>$TASK_HOUR</integer>
    <key>Minute</key>
    <integer>$TASK_MINUTE</integer>
  </dict>
  <key>RunAtLoad</key>
  <false/>
  <key>StandardOutPath</key>
  <string>$LOG_DIR/launchd-stdout.log</string>
  <key>StandardErrorPath</key>
  <string>$LOG_DIR/launchd-stderr.log</string>
</dict>
</plist>
EOF

if launchctl print "gui/$(id -u)/$TASK_LABEL" >/dev/null 2>&1; then
  launchctl bootout "gui/$(id -u)" "$PLIST_PATH" >/dev/null 2>&1 || true
fi

if ! launchctl bootstrap "gui/$(id -u)" "$PLIST_PATH"; then
  printf 'ERROR: failed to load LaunchAgent: %s\n' "$PLIST_PATH"
  pause_if_interactive
  exit 1
fi

launchctl enable "gui/$(id -u)/$TASK_LABEL" >/dev/null 2>&1 || true

printf 'LaunchAgent created or updated:\n'
printf '  Label: %s\n' "$TASK_LABEL"
printf '  Time: every day at %02d:%02d\n' "$TASK_HOUR" "$TASK_MINUTE"
printf '  Command: %s\n' "$UPLOAD_SCRIPT"
printf '  Plist: %s\n' "$PLIST_PATH"
printf '\nTo test it now, run:\n'
printf '  launchctl kickstart -k gui/%s/%s\n' "$(id -u)" "$TASK_LABEL"

pause_if_interactive
exit 0
