@echo off
echo ========================================
echo    DEPLOY SELLONE BACKEND PARA VERCEL
echo ========================================
echo.

echo [1/5] Verificando se o Vercel CLI está instalado...
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Vercel CLI não encontrado!
    echo 💡 Instale com: npm install -g vercel
    pause
    exit /b 1
)
echo ✅ Vercel CLI encontrado

echo.
echo [2/5] Verificando arquivos necessários...
if not exist "server.js" (
    echo ❌ server.js não encontrado!
    pause
    exit /b 1
)
if not exist "package.json" (
    echo ❌ package.json não encontrado!
    pause
    exit /b 1
)
if not exist "vercel.json" (
    echo ❌ vercel.json não encontrado!
    pause
    exit /b 1
)
if not exist "api\index.js" (
    echo ❌ api\index.js não encontrado!
    pause
    exit /b 1
)
echo ✅ Arquivos necessários encontrados

echo.
echo [3/5] Instalando dependências...
npm install
if %errorlevel% neq 0 (
    echo ❌ Falha na instalação das dependências!
    pause
    exit /b 1
)
echo ✅ Dependências instaladas

echo.
echo [4/5] Fazendo login no Vercel...
vercel login
if %errorlevel% neq 0 (
    echo ❌ Falha no login!
    pause
    exit /b 1
)
echo ✅ Login realizado com sucesso

echo.
echo [5/5] Fazendo deploy...
vercel --prod
if %errorlevel% neq 0 (
    echo ❌ Falha no deploy!
    pause
    exit /b 1
)

echo.
echo ========================================
echo    DEPLOY CONCLUÍDO COM SUCESSO! 🎉
echo ========================================
echo.
echo 🌐 Sua API está disponível em:
vercel ls
echo.
echo 📊 Para ver os logs em tempo real:
echo    vercel logs --follow
echo.
echo 🔧 Para configurar variáveis de ambiente:
echo    vercel env add MONGODB_URI
echo.
echo 🧪 Para testar a API:
echo    curl https://seu-projeto.vercel.app/api/test
echo.
pause
