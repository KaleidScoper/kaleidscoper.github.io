@echo off
setlocal EnableExtensions

rem Register a Windows scheduled task that uploads skill usage every day at 09:00.
rem Run this script from an elevated Command Prompt if Windows asks for permission.

set "TASK_NAME=UsageReporterDailyUpload"
set "TASK_TIME=09:10"
set "SCRIPT_DIR=%~dp0"
set "UPLOAD_SCRIPT=%SCRIPT_DIR%upload-usage-all.bat"

if not exist "%UPLOAD_SCRIPT%" (
  echo ERROR: upload script was not found:
  echo   %UPLOAD_SCRIPT%
  exit /b 1
)

schtasks /Create ^
  /TN "%TASK_NAME%" ^
  /TR "\"%UPLOAD_SCRIPT%\"" ^
  /SC DAILY ^
  /ST %TASK_TIME% ^
  /F

if errorlevel 1 (
  echo ERROR: failed to create scheduled task "%TASK_NAME%".
  exit /b 1
)

echo Scheduled task created or updated:
echo   Name: %TASK_NAME%
echo   Time: every day at %TASK_TIME%
echo   Command: %UPLOAD_SCRIPT%
echo.
echo To test it now, run:
echo   schtasks /Run /TN "%TASK_NAME%"

exit /b 0
