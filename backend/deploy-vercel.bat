@echo off
echo ========================================
echo    DEPLOY DO BACKEND NA VERCEL
echo ========================================
echo.

echo 1. Fazendo login na Vercel...
npx vercel login

echo.
echo 2. Fazendo deploy do backend...
npx vercel --prod --yes

echo.
echo 3. Deploy concluido!
echo.
echo IMPORTANTE: Configure as variaveis de ambiente no painel da Vercel:
echo - MONGODB_URI
echo - JWT_SECRET  
echo - NODE_ENV=production
echo.
pause
