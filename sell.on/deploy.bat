@echo off
echo ========================================
echo    DEPLOY SELL.ON - FRONTEND + BACKEND
echo ========================================
echo.

echo [1/4] Adicionando arquivos ao Git...
git add .

echo [2/4] Fazendo commit das alterações...
git commit -m "fix: testar configuração simples do Vercel

- Criar test.js para teste básico do Vercel
- Simplificar vercel.json para debug
- Testar se o problema é na estrutura complexa
- Resolver erro 404 com abordagem minimalista"

echo [3/4] Enviando para o repositório...
git push origin main

echo [4/4] Deploy concluído!
echo.
echo ✅ Frontend: https://sellonn.vercel.app
echo ✅ Backend: https://backend-sable-eta-89.vercel.app
echo.
echo Aguarde alguns minutos para o Vercel processar as alterações...
pause
