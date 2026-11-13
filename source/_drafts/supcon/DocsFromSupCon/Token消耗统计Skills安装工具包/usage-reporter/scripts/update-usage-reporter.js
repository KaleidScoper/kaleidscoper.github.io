#!/usr/bin/env node

const { checkForUpdates } = require("./lib/updater");

function parseArgs(argv) {
  return {
    force: argv.includes("--force"),
    quiet: argv.includes("--quiet"),
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const result = await checkForUpdates({ force: args.force });

  if (args.quiet && !result.updated) return;

  if (!result.checked) {
    console.log(`Usage reporter update skipped: ${result.reason}`);
    return;
  }

  if (!result.updated) {
    console.log(`Usage reporter is current: ${result.version} (${result.reason})`);
    return;
  }

  console.log(`Usage reporter updated to ${result.version}. Files: ${result.files}`);
  console.log(`Backup: ${result.backupRoot}`);
}

main().catch((error) => {
  console.error(`Usage reporter update failed: ${error.message}`);
  process.exit(1);
});
