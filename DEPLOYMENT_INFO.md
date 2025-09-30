# 🚀 Informações de Deploy - SellOne CRM

## ✅ Status do Deploy
- **Backend**: ✅ Funcionando
- **Frontend**: ✅ Funcionando
- **Comunicação**: ✅ Configurada

## 🌐 URLs de Produção

### Backend (API)
- **URL Principal**: https://backend-sable-eta-89.vercel.app
- **API Base**: https://backend-sable-eta-89.vercel.app/api
- **Teste**: https://backend-sable-eta-89.vercel.app/api/test
- **Health Check**: https://backend-sable-eta-89.vercel.app/health

### Frontend (Interface)
- **URL Principal**: https://frontend-sigma-rouge-40.vercel.app
- **URL Alternativa**: https://frontend-jt6pxkboe-pedrovazns-projects.vercel.app

## 🔧 Configurações

### Backend
- **Arquivo**: `backend/vercel.json`
- **Entry Point**: `api/index.js`
- **Node Version**: 22.x
- **Environment**: production

### Frontend
- **Arquivo**: `frontend/vercel.json`
- **Build Command**: `npm run build`
- **Output Directory**: `build`
- **Environment**: production

## 🔗 Comunicação Frontend ↔ Backend

O frontend está configurado para se comunicar com o backend através da URL:
```
https://backend-sable-eta-89.vercel.app/api
```

Esta configuração está no arquivo `frontend/src/services/api.ts`:
```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://backend-sable-eta-89.vercel.app/api';
```

## 🛠️ Scripts de Deploy

### Backend
```bash
cd backend
vercel --prod --yes
```

### Frontend
```bash
cd frontend
npm run build
vercel --prod --yes
```

## 📋 Endpoints da API

- `GET /api` - Informações da API
- `GET /api/test` - Teste do servidor
- `GET /api/test-db` - Teste do MongoDB
- `GET /api/clients` - Listar clientes
- `POST /api/clients` - Criar cliente
- `GET /api/products` - Listar produtos
- `POST /api/products` - Criar produto
- `GET /api/users` - Listar usuários
- `POST /api/users` - Criar usuário
- `GET /api/sales` - Listar vendas
- `POST /api/sales` - Criar venda
- `GET /api/proposals` - Listar propostas
- `POST /api/proposals` - Criar proposta
- `GET /api/distributors` - Listar distribuidores
- `POST /api/distributors` - Criar distribuidor
- `GET /api/goals` - Listar metas
- `POST /api/goals` - Criar meta
- `GET /api/events` - Listar eventos
- `POST /api/events` - Criar evento
- `GET /api/notifications` - Listar notificações
- `GET /api/price-list` - Listar lista de preços
- `POST /api/price-list` - Criar lista de preços

## 🔍 Teste de Funcionamento

### Backend
```bash
curl https://backend-sable-eta-89.vercel.app/api/test
```

### Frontend
```bash
curl https://frontend-sigma-rouge-40.vercel.app
```

## 📝 Notas Importantes

1. **CORS**: Configurado para permitir requisições do frontend
2. **MongoDB**: Configuração via variável de ambiente `MONGODB_URI`
3. **Autenticação**: Sistema de autenticação implementado
4. **Logs**: Logs detalhados para debug
5. **Error Handling**: Middleware global de tratamento de erros

## 🚨 Problemas Resolvidos

1. ✅ Erro 404 no backend - Corrigido configuração do Vercel
2. ✅ Comunicação frontend-backend - URLs atualizadas
3. ✅ Build do frontend no Windows - Scripts corrigidos
4. ✅ CORS - Configurado corretamente
5. ✅ Deploy protection - URLs funcionais identificadas

## 📞 Suporte

Em caso de problemas:
1. Verificar logs do Vercel: `vercel logs [deployment-url]`
2. Testar endpoints individualmente
3. Verificar variáveis de ambiente
4. Re-deploy se necessário: `vercel redeploy [deployment-url]`
