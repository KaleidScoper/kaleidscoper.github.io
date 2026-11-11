# SPTestLink platform UI notes

## Known entry points

- Base URL: `http://10.48.1.63/sktest`
- Unauthenticated visits redirect to `/sktest/login`.
- The login form requests a domain account. Follow the direct-login rule in `SKILL.md`: use known credentials or obtain them from task-authorized sources before asking the user to log in. Verify the resulting account identity; do not guess credentials or repeatedly retry rejected credentials.
- Primary navigation includes **测试计划**.
- username: zhangyingzhong password: Supcon@1304

## Case execution page

The observed case page contains:

- Case identity and navigation: case ID, title, previous/next controls, and position such as `3/24`.
- Context: module, executor, project, case status, case version, preconditions, and test data.
- Step table: step number, case step, expected result, actual result, and execution status.
- Result panel: **通过**, **失败**, **阻塞**, **跳过**, **未执行**.
- Text fields: **实际结果总结** and **备注说明**.
- Required upload area: **证据截图**.
- Bottom action: **保存**, possibly with a dropdown.

Labels and layout may change. Locate controls by accessible role and visible text first; use selectors only as a last resort. Re-read the page after navigation instead of assuming control positions remain stable.

The target-system URL is a required per-run parameter. If it is absent, ask the user before executing cases. Verify the target-product tab against the hostname supplied for the current run; treat any different hostname as a different environment and stop instead of entering data.

## Evidence minimum

Each completed case needs evidence that shows the asserted result, not merely the SPTestLink form. Include environment/context when necessary to distinguish the tested target. For multi-step cases, use multiple screenshots when one image cannot prove all assertions.

Record timestamps in Asia/Shanghai. Keep local filenames ASCII-safe except for report directory labels, and use the visible case ID as the stable key.
