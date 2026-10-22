@echo off
title Career Command Center
cd /d "%~dp0"
echo =======================================================
echo   Starting Career Command Center Dashboard...
echo   URL: http://localhost:3001
echo   User: vikastirumanyam@gmail.com
echo =======================================================
call npm run server
pause
