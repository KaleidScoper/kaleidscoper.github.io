const http = require("http");
const { REPORT_API, TOKEN_REPORT_API, CODEX_TASK_REPORT_API, TOKEN_UPLOAD_BATCH_SIZE, CODEX_TASK_UPLOAD_BATCH_SIZE, SOURCE_LABELS } = require("./config");
const { toJsonRecords } = require("./skills");

function postRecord(record) {
  return new Promise((resolve) => {
    const url = new URL(REPORT_API);
    const data = JSON.stringify(record);
    const options = {
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data),
      },
      timeout: 10000,
    };

    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => { body += chunk; });
      res.on("end", () => {
        // 200-299: 成功; 409: 重复(original_id+user_name已存在)，视为成功
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ ok: true, duplicate: false });
        } else if (res.statusCode === 409) {
          resolve({ ok: true, duplicate: true });
        } else {
          resolve({ ok: false, duplicate: false, status: res.statusCode });
        }
      });
    });

    req.on("error", (error) => resolve({ ok: false, duplicate: false, error: error.message }));
    req.on("timeout", () => { req.destroy(); resolve({ ok: false, duplicate: false, error: "timeout" }); });
    req.write(data);
    req.end();
  });
}

function postTokenBatch(records) {
  return new Promise((resolve) => {
    const url = new URL(TOKEN_REPORT_API);
    const data = JSON.stringify({ records });
    const options = {
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data),
      },
      timeout: 10000,
    };

    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => { body += chunk; });
      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ ok: true, duplicate: false });
        } else if (res.statusCode === 409) {
          resolve({ ok: true, duplicate: true });
        } else {
          resolve({ ok: false, duplicate: false, status: res.statusCode, body });
        }
      });
    });

    req.on("error", (error) => resolve({ ok: false, duplicate: false, error: error.message }));
    req.on("timeout", () => { req.destroy(); resolve({ ok: false, duplicate: false, error: "timeout" }); });
    req.write(data);
    req.end();
  });
}

function parseResponseJson(body) {
  if (typeof body !== "string" || !body.trim()) return null;
  try {
    return JSON.parse(body);
  } catch {
    return null;
  }
}

function postTaskBatch(records) {
  return new Promise((resolve) => {
    const url = new URL(CODEX_TASK_REPORT_API);
    const data = JSON.stringify({ records });
    const options = {
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data),
      },
      timeout: 10000,
    };

    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => { body += chunk; });
      res.on("end", () => {
        const payload = parseResponseJson(body);
        const okStatus = res.statusCode >= 200 && res.statusCode < 300;
        if (okStatus && payload?.success !== false) {
          resolve({ ok: true, status: res.statusCode, payload });
        } else {
          resolve({ ok: false, status: res.statusCode, body, payload });
        }
      });
    });

    req.on("error", (error) => resolve({ ok: false, error: error.message }));
    req.on("timeout", () => { req.destroy(); resolve({ ok: false, error: "timeout" }); });
    req.write(data);
    req.end();
  });
}

async function uploadRecords(records, userName) {
  const items = records
    .slice()
    .sort((a, b) => {
      const sourceCompare = (a.source || "").localeCompare(b.source || "");
      if (sourceCompare !== 0) return sourceCompare;

      const timeCompare = (a.call_time || "").localeCompare(b.call_time || "");
      if (timeCompare !== 0) return timeCompare;

      return (a.skill_name || "").localeCompare(b.skill_name || "");
    })
    .map((record) => ({
      record,
      payload: toJsonRecords([record], userName, { includeSource: true })[0],
    }));
  let success = 0;
  let duplicate = 0;
  let fail = 0;
  const errors = [];

  for (const item of items) {
    const result = await postRecord(item.payload);
    const source = item.record.source || "claude";

    if (result.ok && !result.duplicate) {
      success++;
    } else if (result.duplicate) {
      duplicate++;
    } else {
      fail++;
      errors.push(
        `${SOURCE_LABELS[source] || source} / ${item.record.skill_name} (HTTP ${result.status || "N/A"}${result.error ? `, ${result.error}` : ""})`
      );
    }
  }
  return { success, duplicate, fail, errors };
}

async function uploadTokenRecords(records) {
  let success = 0;
  let duplicate = 0;
  let fail = 0;
  const errors = [];

  for (let index = 0; index < records.length; index += TOKEN_UPLOAD_BATCH_SIZE) {
    const batch = records.slice(index, index + TOKEN_UPLOAD_BATCH_SIZE);
    const result = await postTokenBatch(batch);
    if (result.ok && !result.duplicate) {
      success += batch.length;
    } else if (result.duplicate) {
      duplicate += batch.length;
    } else {
      fail += batch.length;
      errors.push(
        `第 ${Math.floor(index / TOKEN_UPLOAD_BATCH_SIZE) + 1} 批，共 ${batch.length} 条 (HTTP ${result.status || "N/A"}${result.error ? `, ${result.error}` : ""})`
      );
    }
  }

  return { success, duplicate, fail, errors };
}

async function uploadTaskRecords(records) {
  const totals = {
    received: 0,
    inserted: 0,
    updated: 0,
    duplicated: 0,
    failed: 0,
  };
  const errors = [];

  for (let index = 0; index < records.length; index += CODEX_TASK_UPLOAD_BATCH_SIZE) {
    const batch = records.slice(index, index + CODEX_TASK_UPLOAD_BATCH_SIZE);
    const result = await postTaskBatch(batch);
    const batchNumber = Math.floor(index / CODEX_TASK_UPLOAD_BATCH_SIZE) + 1;

    if (result.ok) {
      const data = result.payload?.data || {};
      totals.received += Number.isFinite(Number(data.received)) ? Number(data.received) : batch.length;
      totals.inserted += Number(data.inserted) || 0;
      totals.updated += Number(data.updated) || 0;
      totals.duplicated += Number(data.duplicated) || 0;
      totals.failed += Number(data.failed) || 0;
      continue;
    }

    totals.received += batch.length;
    totals.failed += batch.length;
    const serverMessage = result.payload?.message || result.body || result.error || "unknown error";
    errors.push(
      `第 ${batchNumber} 批，共 ${batch.length} 条 (HTTP ${result.status || "N/A"}, ${serverMessage})`
    );
  }

  return { ...totals, errors };
}

// ============ 主逻辑 ============

module.exports = {
  postRecord,
  postTokenBatch,
  parseResponseJson,
  postTaskBatch,
  uploadRecords,
  uploadTokenRecords,
  uploadTaskRecords,
};
