@echo off
setlocal enabledelayedexpansion

REM ============================================================
REM One-time setup (run these manually before the first deploy):
REM   1. Install Podman for Windows (needs WSL2):
REM      https://podman.io/docs/installation#windows
REM   2. podman machine init
REM   3. podman machine start
REM   4. podman login docker.io
REM      (log in with your hub.docker.com account/token)
REM ============================================================

REM Configuration
set IMAGE_NAME=edniesalconsulting/cioclubawards
set VERSION=0.0.6
set REGISTRY=docker.io
set FULL_IMAGE=%REGISTRY%/%IMAGE_NAME%:%VERSION%

echo ============================================
echo Building and Deploying Image with Podman
echo ============================================
echo.

REM Step 0: Make sure the Podman machine (Linux VM) is up.
REM Podman on Windows needs this running to build Linux containers.
REM If it's already running this just prints a harmless warning.
echo [0/2] Making sure Podman machine is running...
podman machine start >nul 2>&1

REM Step 1: Build the image
REM Tag with the docker.io/ prefix so push doesn't hit an ambiguous
REM "which registry did you mean" prompt.
echo [1/2] Building image...
podman build -t %FULL_IMAGE% .

if errorlevel 1 (
    echo Build failed!
    echo If this is the first time using Podman, make sure you ran:
    echo   podman machine init
    echo   podman machine start
    exit /b 1
)

echo Build successful!
echo.

REM Step 2: Push to Docker Hub
echo [2/2] Pushing to Docker Hub...
podman push %FULL_IMAGE%

if errorlevel 1 (
    echo Push failed!
    echo Make sure you're logged in: podman login docker.io
    exit /b 1
)

echo.
echo ============================================
echo Deployment Complete!
echo ============================================
echo Image: %FULL_IMAGE%
echo.
echo Next steps:
echo 1. Pull the image in Dokploy: %IMAGE_NAME%:%VERSION%
echo 2. Set environment variables in Dokploy dashboard
echo 3. Deploy!
echo ============================================

endlocal
