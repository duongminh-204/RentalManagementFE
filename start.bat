@echo off

echo =========================
echo Starting Docker Project...
echo =========================

docker compose up -d --build

echo.
echo =========================
echo Project started!
echo =========================
echo Open browser:
echo http://localhost:5173
echo.

pause