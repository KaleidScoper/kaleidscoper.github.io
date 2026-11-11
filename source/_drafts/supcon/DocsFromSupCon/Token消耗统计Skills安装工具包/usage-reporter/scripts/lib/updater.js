const fs = require("fs");
const http = require("http");
const https = require("https");
const path = require("path");
const crypto = require("crypto");

const DEFAULT_TIMEOUT_MS = 15000;
const DEFAULT_MAX_FILE_BYTES = 5 * 1024 * 1024;
const DEFAULT_MANIFEST_URL = "http://supdt.supcon.com:9903/api/usage-reporter/update/manifest";

function getMaxFileBytes() {
  const configured = Number(process.env.USAGE_REPORTER_UPDATE_MAX_BYTES);
  return Number.isFinite(configured) && configured > 0 ? configured : DEFAULT_MAX_FILE_BYTES;
}

function getSkillDir() {
  return path.resolve(__dirname, "..", "..");
}

function getStatePath() {
  return path.join(getSkillDir(), ".usage-reporter-update.json");
}

function readUpdateState() {
  try {
    return JSON.parse(fs.readFileSync(getStatePath(), "utf-8"));
  } catch {
    return {};
  }
}

function writeUpdateState(state) {
  fs.writeFileSync(getStatePath(), JSON.stringify(state, null, 2), "utf-8");
}

function requestUrl(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      reject(new Error(`unsupported update URL protocol: ${parsed.protocol}`));
      return;
    }

    const client = parsed.protocol === "https:" ? https : http;
    const req = client.request(parsed, {
      method: "GET",
      timeout: options.timeoutMs || DEFAULT_TIMEOUT_MS,
      headers: {
        "Accept": options.accept || "application/json",
      },
    }, (res) => {
      const chunks = [];
      let total = 0;

      res.on("data", (chunk) => {
        total += chunk.length;
        if (total > (options.maxBytes || getMaxFileBytes())) {
          req.destroy(new Error("response too large"));
          return;
        }
        chunks.push(chunk);
      });

      res.on("end", () => {
        const body = Buffer.concat(chunks);
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error(`HTTP ${res.statusCode}: ${body.toString("utf-8").slice(0, 200)}`));
          return;
        }
        resolve(body);
      });
    });

    req.on("timeout", () => req.destroy(new Error("timeout")));
    req.on("error", reject);
    req.end();
  });
}

async function fetchJson(url) {
  const body = await requestUrl(url, { accept: "application/json" });
  return JSON.parse(body.toString("utf-8"));
}

async function fetchFile(url) {
  return requestUrl(url, { accept: "application/octet-stream" });
}

function sha256(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

function resolveRelativeFile(relativePath) {
  if (typeof relativePath !== "string" || !relativePath.trim()) {
    throw new Error("manifest file path is required");
  }

  const normalized = relativePath.replace(/\\/g, "/");
  if (normalized.startsWith("/") || normalized.split("/").includes("..")) {
    throw new Error(`unsafe update path: ${relativePath}`);
  }

  const skillDir = getSkillDir();
  const absolute = path.resolve(skillDir, normalized);
  if (absolute !== skillDir && !absolute.startsWith(skillDir + path.sep)) {
    throw new Error(`update path escapes skill directory: ${relativePath}`);
  }

  return absolute;
}

function validateManifest(manifest) {
  if (!manifest || typeof manifest !== "object") {
    throw new Error("manifest must be a JSON object");
  }
  if (typeof manifest.version !== "string" || !manifest.version.trim()) {
    throw new Error("manifest.version is required");
  }
  if (!Array.isArray(manifest.files) || manifest.files.length === 0) {
    throw new Error("manifest.files must be a non-empty array");
  }
  for (const file of manifest.files) {
    if (!file || typeof file !== "object") throw new Error("manifest file item must be an object");
    if (typeof file.path !== "string") throw new Error("manifest file.path is required");
    if (typeof file.url !== "string") throw new Error(`manifest file.url is required for ${file.path}`);
    if (typeof file.sha256 !== "string" || !/^[a-f0-9]{64}$/i.test(file.sha256)) {
      throw new Error(`manifest file.sha256 is required for ${file.path}`);
    }
    resolveRelativeFile(file.path);
  }
}

function ensureDirectory(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function backupExistingFile(filePath, backupRoot) {
  if (!fs.existsSync(filePath)) return;
  const relative = path.relative(getSkillDir(), filePath);
  const backupPath = path.join(backupRoot, relative);
  ensureDirectory(backupPath);
  fs.copyFileSync(filePath, backupPath);
}

function restoreBackups(downloads, backupRoot) {
  for (const file of downloads) {
    const backupPath = path.join(backupRoot, path.relative(getSkillDir(), file.absolutePath));
    if (!fs.existsSync(backupPath)) continue;
    writeFileAtomically(file.absolutePath, fs.readFileSync(backupPath));
  }
}

function writeFileAtomically(filePath, content) {
  ensureDirectory(filePath);
  const tempPath = `${filePath}.tmp-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  fs.writeFileSync(tempPath, content);
  fs.renameSync(tempPath, filePath);
}

async function downloadAndVerifyFiles(files) {
  const downloads = [];
  for (const file of files) {
    const body = await fetchFile(file.url);
    const actualHash = sha256(body);
    if (actualHash.toLowerCase() !== file.sha256.toLowerCase()) {
      throw new Error(`sha256 mismatch for ${file.path}`);
    }
    downloads.push({
      path: file.path,
      absolutePath: resolveRelativeFile(file.path),
      body,
      sha256: actualHash,
    });
  }
  return downloads;
}

async function checkForUpdates(options = {}) {
  const manifestUrl = options.manifestUrl || process.env.USAGE_REPORTER_UPDATE_MANIFEST_API || DEFAULT_MANIFEST_URL;

  const state = readUpdateState();
  const manifest = await fetchJson(manifestUrl);
  validateManifest(manifest);

  if (!options.force && state.version === manifest.version) {
    return { checked: true, updated: false, version: manifest.version, reason: "already current" };
  }

  const downloads = await downloadAndVerifyFiles(manifest.files);
  const backupRoot = path.join(getSkillDir(), ".usage-reporter-backups", new Date().toISOString().replace(/[:.]/g, "-"));

  for (const file of downloads) {
    backupExistingFile(file.absolutePath, backupRoot);
  }

  try {
    for (const file of downloads) {
      writeFileAtomically(file.absolutePath, file.body);
    }
  } catch (error) {
    restoreBackups(downloads, backupRoot);
    throw new Error(`update write failed and backups were restored: ${error.message}`);
  }

  writeUpdateState({
    version: manifest.version,
    updated_at: new Date().toISOString(),
    files: downloads.map((file) => ({ path: file.path, sha256: file.sha256 })),
    manifest_url: manifestUrl,
  });

  return {
    checked: true,
    updated: true,
    version: manifest.version,
    files: downloads.length,
    backupRoot,
  };
}

module.exports = {
  DEFAULT_MANIFEST_URL,
  checkForUpdates,
  validateManifest,
  resolveRelativeFile,
};
