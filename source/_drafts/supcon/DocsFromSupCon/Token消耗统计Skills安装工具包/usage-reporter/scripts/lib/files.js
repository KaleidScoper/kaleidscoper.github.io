const fs = require("fs");
const path = require("path");
const { HOME_DIR } = require("./config");

function scanClaudeJsonlFiles() {
  const projectsDir = path.join(
    process.env.HOME || process.env.USERPROFILE,
    ".claude",
    "projects"
  );
  if (!fs.existsSync(projectsDir)) return [];

  const results = [];
  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory() && entry.name !== "node_modules") {
        walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(".jsonl")) {
        results.push(fullPath);
      }
    }
  }
  walk(projectsDir);
  return results.sort();
}

function scanCodexJsonlFiles() {
  const codexDir = path.join(process.env.HOME || process.env.USERPROFILE, ".codex");
  if (!fs.existsSync(codexDir)) return [];

  const targets = [
    path.join(codexDir, "sessions"),
    path.join(codexDir, "archived_sessions"),
  ];
  const results = [];

  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory() && entry.name !== "node_modules") {
        walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(".jsonl")) {
        results.push(fullPath);
      }
    }
  }

  for (const dir of targets) walk(dir);
  return results.sort();
}

function collectJsonlFiles(rootDir) {
  if (!fs.existsSync(rootDir)) return [];

  const results = [];
  const stack = [rootDir];

  while (stack.length > 0) {
    const currentDir = stack.pop();
    let entries = [];
    try {
      entries = fs.readdirSync(currentDir, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory() && entry.name !== "node_modules") {
        stack.push(fullPath);
      } else if (entry.isFile() && fullPath.endsWith(".jsonl")) {
        results.push(fullPath);
      }
    }
  }

  return results.sort();
}

function collectKimiWireJsonlFiles() {
  const kimiHome = process.env.KIMI_CODE_HOME
    || path.join(process.env.HOME || process.env.USERPROFILE, ".kimi-code");
  const kimiSessionsDir = path.join(kimiHome, "sessions");
  if (!fs.existsSync(kimiSessionsDir)) return [];

  const results = [];

  const workDirDirs = fs.readdirSync(kimiSessionsDir, { withFileTypes: true });
  for (const wdDir of workDirDirs) {
    if (!wdDir.isDirectory()) continue;
    const wdPath = path.join(kimiSessionsDir, wdDir.name);

    const sessionDirs = fs.readdirSync(wdPath, { withFileTypes: true });
    for (const sessionDir of sessionDirs) {
      if (!sessionDir.isDirectory()) continue;
      const wireFile = path.join(wdPath, sessionDir.name, "agents", "main", "wire.jsonl");
      if (fs.existsSync(wireFile)) {
        results.push(wireFile);
      }
    }
  }

  return results.sort();
}

function collectCodewhaleSessionFiles() {
  const codewhaleDir = path.join(process.env.HOME || process.env.USERPROFILE, ".codewhale", "sessions");
  if (!fs.existsSync(codewhaleDir)) return [];

  const results = [];
  const entries = fs.readdirSync(codewhaleDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".json")) continue;
    results.push(path.join(codewhaleDir, entry.name));
  }

  return results.sort();
}

module.exports = {
  scanClaudeJsonlFiles,
  scanCodexJsonlFiles,
  collectJsonlFiles,
  collectKimiWireJsonlFiles,
  collectCodewhaleSessionFiles,
};
