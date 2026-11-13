@echo off
setlocal EnableExtensions

rem Upload all usage records via usage-reporter.
rem Default mode scans all history and uploads only records newer than the
rem local state file. Pass "force" as the first argument to reset local state.

set "SCRIPT_DIR=%~dp0"
for %%I in ("%SCRIPT_DIR%..") do set "DEFAULT_SKILL_DIR=%%~fI"

if defined USAGE_REPORTER_SKILL_DIR (
  set "SKILL_DIR=%USAGE_REPORTER_SKILL_DIR%"
) else (
  set "SKILL_DIR=%DEFAULT_SKILL_DIR%"
)

set "COLLECT_JS=%SKILL_DIR%\scripts\collect.js"
set "UPDATE_JS=%SKILL_DIR%\scripts\update-usage-reporter.js"
set "STATE_FILE=%USERPROFILE%\.claude\usage-reporter-state.json"
set "LOG_DIR=%SKILL_DIR%\logs"

if not exist "%LOG_DIR%" mkdir "%LOG_DIR%" >nul 2>nul

for /f %%I in ('powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-Date -Format yyyyMMdd-HHmmss"') do set "RUN_TS=%%I"
set "LOG_FILE=%LOG_DIR%\upload-all-%RUN_TS%.log"

echo [%date% %time%] usage-reporter upload started. > "%LOG_FILE%"
echo Skill directory: %SKILL_DIR% >> "%LOG_FILE%"
echo Log file: %LOG_FILE% >> "%LOG_FILE%"

where node >nul 2>nul
if errorlevel 1 (
  echo ERROR: node.exe was not found in PATH. >> "%LOG_FILE%"
  echo ERROR: node.exe was not found in PATH.
  exit /b 1
)

if not exist "%COLLECT_JS%" (
  echo ERROR: collect.js was not found: %COLLECT_JS% >> "%LOG_FILE%"
  echo ERROR: collect.js was not found: %COLLECT_JS%
  exit /b 1
)

if exist "%UPDATE_JS%" (
  echo Checking for usage-reporter updates... >> "%LOG_FILE%"
  node "%UPDATE_JS%" >> "%LOG_FILE%" 2>>&1
  if errorlevel 1 (
    echo WARN: update check failed; continuing with local reporter. >> "%LOG_FILE%"
  )
) else (
  echo Update script not found, skipping update check: %UPDATE_JS% >> "%LOG_FILE%"
)

if /i "%~1"=="force" (
  echo Force mode enabled. Removing local state file: %STATE_FILE% >> "%LOG_FILE%"
  if exist "%STATE_FILE%" del /f /q "%STATE_FILE%" >> "%LOG_FILE%" 2>>&1
)

echo Running: node "%COLLECT_JS%" all upload >> "%LOG_FILE%"
node "%COLLECT_JS%" all upload >> "%LOG_FILE%" 2>>&1
set "EXIT_CODE=%ERRORLEVEL%"

echo [%date% %time%] upload finished with exit code %EXIT_CODE%. >> "%LOG_FILE%"

if not "%EXIT_CODE%"=="0" (
  echo Upload failed. See log: %LOG_FILE%
  exit /b %EXIT_CODE%
)

echo Upload succeeded. Log: %LOG_FILE%
exit /b 0
