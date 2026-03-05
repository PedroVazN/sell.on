@echo off
echo ========================================
echo Deploying Frontend to Vercel...
echo ========================================
echo.
echo Building React app...
call npm run build
echo.
echo Checking Vercel CLI...
vercel --version
echo.
echo Deploying to production...
vercel --prod --yes
echo.
echo ========================================
echo Deploy completed!
echo ========================================
pause
