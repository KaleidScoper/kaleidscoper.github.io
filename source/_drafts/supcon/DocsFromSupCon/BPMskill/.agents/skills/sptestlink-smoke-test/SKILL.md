---
name: sptestlink-smoke-test
description: Operate the internal SPTestLink intelligent R&D testing platform at http://10.48.1.63/sktest to execute or explicitly correct a selected smoke test plan case by case, follow test steps in the target product, capture and upload screenshot evidence, record actual results and notes, choose pass/fail/blocked/skipped outcomes, save each case, verify persistence, and produce an evidence-backed smoke report. Use when the user asks to run, continue, rerun, correct, reset, supplement, verify, or report SPTestLink/智能产研测试平台/测试计划/冒烟测试 cases.
---

# SPTestLink Smoke Test

Execute test cases conservatively and leave an auditable evidence trail. Read [references/platform-ui.md](references/platform-ui.md) before operating the platform. Copy [assets/smoke-report-template.html](assets/smoke-report-template.html) when producing the final report.

## Language and encoding

1. Default all narrative content written to SPTestLink and all delivered reports to Simplified Chinese. This includes step-level **实际结果**, **实际结果总结**, **备注说明**, evidence captions, failure or blocker descriptions, and report prose.
2. Preserve case IDs, URLs, version numbers, API fields, source identifiers, and exact product text where technical accuracy requires the original value.
3. Use another language only when the user explicitly requests it or an exact source value must remain unchanged.
4. Never switch narrative output to English to work around terminal, shell, browser-automation, or file-encoding problems. Use UTF-8, Unicode-safe strings, or another encoding-safe input method instead.
5. Before saving each case and before delivering the report, verify that all narrative fields are in Simplified Chinese. Correct unintended English or garbled text before saving; if an incorrect record was already saved, create or save a corrected Chinese record and verify that it is the latest applicable record.

## Establish the run

1. Confirm the intended project, test plan, target-system URL, environment, and scope from the request or visible page. If the target-system URL is missing, ask the user for it before executing any case; never guess or hard-code it. Ask about the plan only when multiple plausible plans exist or the choice materially changes results.
2. If the user has not supplied local source locations, proactively ask once before execution for the relevant frontend path and, when applicable, backend path. Explain that source access is optional supporting context and that declining or omitting it does not block ordinary UI testing.
3. By default, directly launch a new visible Google Chrome window for this run with the dedicated persistent profile `D:\project\.codex-work\browser-profiles\sptestlink-smoke-test`. Reuse this profile across runs so a user-completed login survives, but do not first attempt an in-app browser, Browser/Chrome plugin connection, or the user's everyday browser session. Control the launched Chrome through local UI automation or DevTools/CDP as needed. Only use another browser path when the user explicitly requests it or Chrome cannot be launched, and report the fallback.
4. In the newly launched Chrome, open `http://10.48.1.63/sktest`. If authentication is required, use credentials already known or obtainable from references and credential sources authorized for this task, and log in directly without asking the user to do it or reconfirm permission. Check those sources before asking for credentials. Verify the logged-in identity and target tenant after login. Ask the user for assistance only when no usable credentials can be obtained, a verified credential is rejected without a corrected credential available, or an interactive challenge such as MFA or CAPTCHA requires the user. Do not guess passwords or repeatedly retry a rejected credential. Apply the same rule to the target system; keep credentials out of reports, screenshots, and logs.
5. Create the run directory under `D:\project\冒烟报告\YYYY-MM-DD\<项目>-<测试计划>-<HHmmss>`. Put screenshots in its `evidence` subdirectory and the HTML report at its root.
6. Record the plan name, project, environment, start time, visible case total, and pre-existing execution statuses before changing anything.

## Select the test plan

1. Enter **测试计划**, select the exact project and plan requested, and verify the plan name and case count.
2. Read the currently logged-in operator identity from the account/profile UI. Do not infer it only from a previously seen executor name.
3. By default, restrict the run to cases where both conditions are true: the visible **执行人** exactly matches the current operator, and the visible **执行结果** is not passed. Treat **未执行**, **失败**, **阻塞**, and an explicit **未通过** value as not passed; exclude **通过**. Do not automatically re-run **跳过** cases unless the user explicitly includes them. If the user explicitly asks to modify, reset, rerun, or supplement completed/passed cases, include only the exact cases or clearly bounded scope they named and record their prior status before changing them.
4. Apply executor and result filters when the UI supports them, plus only other filters required by the requested scope. Record every active filter and the resulting count.
5. Treat filtering as convenience, not authorization. Before opening a case, verify its executor and result in the list. After opening it, verify the executor and current result/status again in the detail page. If either check fails or identity is unclear, leave the case unchanged and record it as excluded.
6. Never modify, upload evidence to, save, batch-play, or otherwise execute a case assigned to another person. Do not change an already completed/passed case unless the user explicitly requested that correction, reset, rerun, or supplemental evidence; an explicit request overrides the passed-case exclusion only for the named or clearly bounded scope.
7. Open the first authorized case and verify its case ID, title, module, preconditions, test data, steps, expected results, current status, and case position.

## Execute one case

Repeat this workflow for every in-scope case:

1. Reconfirm that the case executor exactly matches the logged-in operator. For an ordinary run, also confirm that its execution result is not passed. For an explicitly requested completed-case correction, verify that the case is inside the user-authorized correction scope and capture its prior result. Stop this case without writes when the applicable check fails. Then capture the case ID/title and read all preconditions, test data, step descriptions, and expected results before touching the target product.
2. Open the user-provided target-system URL and verify the hostname, environment, and tenant/project against the current run parameters. Never reuse a target URL from a prior run unless the user explicitly provided or confirmed it for this run. Do not run destructive, irreversible, production, billing, notification, permission, or bulk-data actions unless the user explicitly authorized that exact effect.
3. Execute steps in order. After each meaningful action, compare the observable behavior with the matching expected result. Never treat successful clicking or page loading as proof of a pass.
4. Capture evidence after the assertion is visible. Prefer one focused screenshot per independent assertion; add a context screenshot when identity or environment is otherwise unclear.
5. Name local evidence `evidence/<sequence>-<case-id>-<step>-<short-result>.png`. Avoid secrets, tokens, personal data, unrelated tabs, and password fields; redact or crop when needed.
6. Fill every visible **实际结果** field with concise observed facts. Include key values and deviations; do not copy the expected result as if it were observed.
7. Determine the outcome:
   - **通过**: every required assertion was observed and evidence is sufficient.
   - **失败**: an assertion differs from expected; describe the exact difference and reproducible step.
   - **阻塞**: execution cannot continue because of environment, permission, data, dependency, or platform failure.
   - **跳过**: the case is intentionally out of scope or explicitly excluded.
   - Leave **未执行** when no meaningful execution occurred and no justified terminal result exists.
8. Fill **实际结果总结** and **备注说明** with the outcome rationale. For failure or blockage, include reproduction context and the blocker; never disguise it as a pass.
9. Upload the relevant screenshot(s) to **证据截图**. Verify thumbnails or uploaded-file indicators appear before saving.
10. Take a local screenshot of the completed result form before saving, then click **保存** once. Wait for success feedback or stable completion.
11. Re-open or navigate away and back to verify that outcome, text, and evidence persisted. If verification fails, do not click repeatedly; capture the error and mark/report the case as blocked where possible.
12. Append the case result and evidence image elements to the report immediately, then move to the next in-scope case and verify its ID before proceeding. Use relative `evidence/...` image URLs so the report remains portable with its evidence directory.

## Correct completed cases

Use this workflow only when the user explicitly requests changing, resetting, rerunning, or supplementing completed cases:

1. Identify the exact case IDs or clearly bounded scope and record each prior outcome and evidence state.
2. Prefer the platform's visible **重新执行** or **继续执行未完成的用例** workflow. Use an existing empty/running rerun only when its plan, executor, and case scope match the request.
3. Re-execute the relevant assertions in the target system. A corrected screenshot must visibly contain the claimed result; do not reuse evidence that missed the assertion.
4. Save a new factual result and upload the corrected evidence. Do not claim success merely because a local screenshot was replaced.
5. Re-open the case or execution history and verify that the new execution is persisted and is the latest applicable record. If the platform prevents the change, report the exact permission or persistence failure and leave the old result described accurately.

## Handle uncertainty and failures

- Stop and ask when the test step is ambiguous enough that different interpretations could change data or the result.
- If the user did not provide source paths during the initial optional request and UI interaction, control meaning, expected state transition, or test-data setup later becomes unclear, ask again for the relevant local project code path. Read the applicable `AGENTS.md` chain before inspecting that project. Use source code only to understand routes, controls, validation, and expected interactions; do not modify code unless separately requested.
- Treat source inspection as supporting context, never as test evidence. Execute the behavior in the target system and capture the observed result before assigning an outcome.
- Use observable facts. Do not infer hidden backend state from UI appearance alone.
- On an application defect, capture the state, console/network evidence when available, exact reproduction steps, and timestamps; do not alter expected results to make the case pass.
- On automation instability, retry a read-only observation once. Do not repeat state-changing actions unless idempotence is clear.
- If the browser, network, login, environment, or upload is unavailable, preserve completed evidence and report progress instead of manufacturing results.
- Never mass-mark remaining cases or use pass-all shortcuts. Do not overwrite another executor's recorded result unless the user explicitly authorizes that exact scope and the platform permits it.
- Never use **批量播放** or any bulk operation for this workflow because authorization must be checked per case.

## Complete the run

1. Reconcile processed cases against the selected scope and visible plan counts.
2. Confirm every saved result has an outcome, factual actual result, required uploaded evidence, and local evidence path.
3. Complete the HTML report with counts for total, passed, failed, blocked, skipped, and unexecuted cases. List failures and blockers first.
4. Render each test case as a readable card containing its ID, title, result, observed facts, notes, and inline evidence thumbnails exactly where that case is described. Wrap each thumbnail in a link to the full-size image. Never collect case evidence into a detached gallery at the end, and do not deliver a report that exposes only evidence filenames or filesystem paths.
5. Save the report and screenshots only under `D:\project\冒烟报告`; keep browser profiles and temporary automation artifacts under `D:\project\.codex-work`.
6. Open the generated HTML locally and verify summary layout, Chinese text, image rendering, and full-size image links before delivery.
7. Report the exact plan, scope, counts, unresolved blockers, and HTML report path. Never claim the plan passed when any required case failed, remained blocked, or was unexecuted.
