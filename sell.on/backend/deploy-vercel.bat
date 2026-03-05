@echo off
echo ========================================
echo Deploying Backend to Vercel...
echo ========================================
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