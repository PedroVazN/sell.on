@echo off
echo ========================================
echo    DEPLOY SELL.ON - FRONTEND + BACKEND
echo ========================================
echo.

echo [1/4] Adicionando arquivos ao Git...
git add .

echo [2/4] Fazendo commit das alterações...
git commit -m "feat: atualizar URLs e configurações para Vercel

- Atualizar URL do backend para https://backend-sable-eta-89.vercel.app
- Otimizar configuração de CORS para frontend https://sellonn.vercel.app
- Remover rotas duplicadas no servidor
- Adicionar configurações de timeout no Vercel
- Garantir integração completa entre frontend e backend"

echo [3/4] Enviando para o repositório...
git push origin main

echo [4/4] Deploy concluído!
echo.
echo ✅ Frontend: https://sellonn.vercel.app
echo ✅ Backend: https://backend-sable-eta-89.vercel.app
echo.
echo Aguarde alguns minutos para o Vercel processar as alterações...
pause
