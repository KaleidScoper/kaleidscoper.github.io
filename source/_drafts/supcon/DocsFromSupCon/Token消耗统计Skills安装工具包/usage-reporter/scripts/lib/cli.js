const { REPORT_API, TOKEN_REPORT_API, CODEX_TASK_REPORT_API, CODEX_TASK_UPLOAD_BATCH_SIZE, VALID_PERIODS, VALID_TARGETS, VALID_MODES } = require("./config");
const { getUserName } = require("./common");
const { collectSkillUsage, formatReport, toJsonRecords } = require("./skills");
const { collectTokenUsage, formatTokenReport, buildTokenUploadRecords } = require("./tokens");
const { collectTaskUsage, formatTaskReport, toTaskJsonRecords, buildTaskUploadRecords } = require("./tasks");
const { uploadRecords, uploadTokenRecords, uploadTaskRecords } = require("./uploader");

function normalizePeriod(period) {
  return VALID_PERIODS.includes(period) ? period : "30d";
}

function parseCliArgs(argv) {
  const args = {
    period: "30d",
    target: "all",
    mode: "report",
  };

  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--period") {
      args.period = argv[i + 1] || args.period;
      i++;
      continue;
    }
    if (arg === "--target" || arg === "--type") {
      args.target = argv[i + 1] || args.target;
      i++;
      continue;
    }
    if (arg === "--mode") {
      args.mode = argv[i + 1] || args.mode;
      i++;
      continue;
    }
    if (arg === "--upload") {
      args.mode = "upload";
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      args.mode = "help";
      continue;
    }
    positional.push(arg);
  }

  if (positional.length > 0) {
    const [first, second, third] = positional;

    if (first === "all" && second === "upload") {
      // 新的简写：node collect.js all upload，表示默认时间范围内全部类型上报。
      args.target = "all";
      args.mode = second;
    } else if (VALID_PERIODS.includes(first) && VALID_TARGETS.includes(second)) {
      args.period = first;
      args.target = second;
      if (third) args.mode = third;
    } else if (VALID_PERIODS.includes(first) && VALID_MODES.includes(second)) {
      // 兼容旧用法：node collect.js 30d upload，仅上报 Skill。
      args.period = first;
      args.target = "skills";
      args.mode = second;
    } else if (VALID_PERIODS.includes(first)) {
      args.period = first;
    } else if (VALID_TARGETS.includes(first)) {
      args.target = first;
      if (VALID_MODES.includes(second)) args.mode = second;
    } else if (VALID_MODES.includes(first)) {
      args.mode = first;
    }
  }

  args.period = normalizePeriod(args.period);
  if (args.target === "skill") args.target = "skills";
  if (args.target === "token") args.target = "tokens";
  if (args.target === "task") args.target = "tasks";
  if (!["skills", "tokens", "tasks", "all"].includes(args.target)) args.target = "skills";
  if (!["report", "json", "upload", "help"].includes(args.mode)) args.mode = "report";
  return args;
}

function printHelp() {
  console.log(`Usage Reporter

用法:
  node collect.js <period> report
  node collect.js <period> upload
  node collect.js <period> skills report
  node collect.js <period> tokens report
  node collect.js <period> tasks report
  node collect.js <period> tasks upload
  node collect.js <period> all upload

参数:
  period: today / week / 7d / 30d / 90d / all
  target: skills / tokens / tasks / all
  mode: report / json / upload

说明:
  不指定 period 时默认使用 30d
  token 上报固定使用 ${TOKEN_REPORT_API}
  任务耗时上报固定使用 ${CODEX_TASK_REPORT_API}
  user_name 固定使用 git config user.name
`);
}

async function runSkillTarget(period, mode, userName) {
  let records = collectSkillUsage(period);

  if (mode === "json") {
    console.log(JSON.stringify(toJsonRecords(records, userName, { includeSource: true }), null, 2));
    return;
  }

  if (mode === "report") {
    console.log(formatReport(records, userName));
    return;
  }

  console.log(formatReport(records, userName));
  console.log();

  if (!userName) {
    throw new Error("无法从 git config user.name 获取 user_name，已取消 Skill 上报。");
  }

  if (!records.length) {
    console.log("无 Skill 记录，跳过上报。");
    return;
  }

  console.log(`正在上报 ${records.length} 条 Skill 记录到 ${REPORT_API}，重复记录由服务端 409 去重 ...`);
  const result = await uploadRecords(records, userName);
  const parts = [`成功 ${result.success} 条`];
  if (result.duplicate > 0) parts.push(`重复跳过 ${result.duplicate} 条`);
  parts.push(`失败 ${result.fail} 条`);
  console.log(`Skill 上报完成：${parts.join("，")}`);

  if (result.errors.length) {
    console.log("Skill 失败详情：");
    result.errors.forEach((e) => console.log(`  - ${e}`));
  }

}

async function runTokenTarget(period, mode, userName) {
  const state = collectTokenUsage(period);

  if (mode === "json") {
    console.log(JSON.stringify(buildTokenUploadRecords(state, userName), null, 2));
    return;
  }

  if (mode === "report") {
    console.log(formatTokenReport(state, period, userName));
    return;
  }

  console.log(formatTokenReport(state, period, userName));
  console.log();

  if (!userName) {
    throw new Error("无法从 git config user.name 获取 user_name，已取消 token 上报。");
  }

  const records = buildTokenUploadRecords(state, userName);
  if (!records.length) {
    console.log("无 token 记录，跳过上报。");
    return;
  }

  console.log(`正在上报 ${records.length} 条 Token usage 记录到 ${TOKEN_REPORT_API} ...`);
  const result = await uploadTokenRecords(records);
  const parts = [`成功 ${result.success} 条`];
  if (result.duplicate > 0) parts.push(`重复跳过 ${result.duplicate} 条`);
  parts.push(`失败 ${result.fail} 条`);
  console.log(`Token 上报完成：${parts.join("，")}`);

  if (result.errors.length) {
    console.log("Token 失败详情：");
    result.errors.forEach((e) => console.log(`  - ${e}`));
  }
}

async function runTaskTarget(period, mode, userName) {
  const state = collectTaskUsage(period);

  if (mode === "json") {
    console.log(JSON.stringify(toTaskJsonRecords(state, userName), null, 2));
    return;
  }

  console.log(formatTaskReport(state, period, userName));

  if (mode === "upload") {
    console.log();
    if (!userName) {
      throw new Error("无法从 git config user.name 获取 user_name，已取消任务耗时上报。");
    }

    const records = buildTaskUploadRecords(state, userName);
    if (!records.length) {
      console.log("无任务耗时记录，跳过上报。");
      return;
    }

    console.log(`正在上报 ${records.length} 条任务耗时记录到 ${CODEX_TASK_REPORT_API}，每批最多 ${CODEX_TASK_UPLOAD_BATCH_SIZE} 条 ...`);
    const result = await uploadTaskRecords(records);
    console.log(
      `任务耗时上报完成：接收 ${result.received} 条，新增 ${result.inserted} 条，更新 ${result.updated} 条，重复 ${result.duplicated} 条，失败 ${result.failed} 条`
    );

    if (result.errors.length) {
      console.log("任务耗时上报失败详情：");
      result.errors.forEach((e) => console.log(`  - ${e}`));
    }
  }
}

async function main() {
  const args = parseCliArgs(process.argv.slice(2));

  if (args.mode === "help") {
    printHelp();
    return;
  }

  const userName = getUserName();

  if (args.target === "skills") {
    await runSkillTarget(args.period, args.mode, userName);
    return;
  }

  if (args.target === "tokens") {
    await runTokenTarget(args.period, args.mode, userName);
    return;
  }

  if (args.target === "tasks") {
    await runTaskTarget(args.period, args.mode, userName);
    return;
  }

  if (args.target === "all") {
    if (args.mode === "json") {
      const skillRecords = collectSkillUsage(args.period);
      const tokenState = collectTokenUsage(args.period);
      const taskState = collectTaskUsage(args.period);
      console.log(JSON.stringify({
        skills: toJsonRecords(skillRecords, userName, { includeSource: true }),
        tokens: buildTokenUploadRecords(tokenState, userName),
        tasks: toTaskJsonRecords(taskState, userName),
      }, null, 2));
      return;
    }

    await runSkillTarget(args.period, args.mode, userName);
    console.log("\n---\n");
    await runTokenTarget(args.period, args.mode, userName);
    console.log("\n---\n");
    await runTaskTarget(args.period, args.mode, userName);
    return;
  }
}

module.exports = {
  normalizePeriod,
  parseCliArgs,
  printHelp,
  runSkillTarget,
  runTokenTarget,
  runTaskTarget,
  main,
};
