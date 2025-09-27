@echo off
echo ========================================
echo    DEPLOY SELL.ON - FRONTEND + BACKEND
echo ========================================
echo.

echo [1/4] Adicionando arquivos ao Git...
git add .

echo [2/4] Fazendo commit das alterações...
git commit -m "fix: corrigir erro 404 - reestruturar para Vercel API

- Criar api/index.js para estrutura correta do Vercel
- Atualizar vercel.json para usar api/index.js
- Manter server.js para desenvolvimento local
- Corrigir roteamento e resolver erro 404
- Garantir funcionamento completo da API"

echo [3/4] Enviando para o repositório...
git push origin main

echo [4/4] Deploy concluído!
echo.
echo ✅ Frontend: https://sellonn.vercel.app
echo ✅ Backend: https://backend-sable-eta-89.vercel.app
echo.
echo Aguarde alguns minutos para o Vercel processar as alterações...
pause
