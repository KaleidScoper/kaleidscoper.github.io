#!/usr/bin/env node

const { ensureNodeExperimentalSqlite } = require("./lib/common");
const { main } = require("./lib/cli");

ensureNodeExperimentalSqlite(__filename);

main().catch((error) => {
  console.error("ERROR:", error.message);
  process.exit(1);
});
