# 🚀 Instruções de Deploy - SellOne Backend

## ✅ Configuração Completa para Vercel

### 1. Pré-requisitos
- Node.js instalado
- Conta no Vercel
- MongoDB Atlas configurado

### 2. Instalação do Vercel CLI
```bash
npm install -g vercel
```

### 3. Configuração das Variáveis de Ambiente
No painel da Vercel, configure:
- `MONGODB_URI` - String de conexão do MongoDB Atlas
- `JWT_SECRET` - Chave secreta para JWT (opcional)
- `NODE_ENV` - production

### 4. Deploy Automático
Execute o script de deploy:
```bash
# Windows
deploy-vercel.bat

# Linux/Mac
vercel login
vercel --prod
```

### 5. Testando a API
Após o deploy, teste as rotas:

```bash
# Teste básico
curl https://seu-projeto.vercel.app/api/test

# Teste de conexão com MongoDB
curl https://seu-projeto.vercel.app/api/test-db

# Lista de rotas disponíveis
curl https://seu-projeto.vercel.app/api/routes

# Health check
curl https://seu-projeto.vercel.app/health
```

### 6. Rotas da API Disponíveis

#### 🔐 Autenticação
- `GET /api/test` - Teste do servidor
- `GET /api/test-db` - Teste do MongoDB
- `GET /api/routes` - Lista de rotas

#### 👥 Clientes
- `GET /api/clients` - Listar clientes
- `POST /api/clients` - Criar cliente
- `GET /api/clients/:id` - Buscar cliente
- `PUT /api/clients/:id` - Atualizar cliente
- `DELETE /api/clients/:id` - Deletar cliente

#### 📦 Produtos
- `GET /api/products` - Listar produtos
- `POST /api/products` - Criar produto
- `GET /api/products/:id` - Buscar produto
- `PUT /api/products/:id` - Atualizar produto
- `DELETE /api/products/:id` - Deletar produto

#### 👤 Usuários
- `GET /api/users` - Listar usuários
- `POST /api/users` - Criar usuário
- `GET /api/users/:id` - Buscar usuário
- `PUT /api/users/:id` - Atualizar usuário
- `DELETE /api/users/:id` - Deletar usuário

#### 💰 Vendas
- `GET /api/sales` - Listar vendas
- `POST /api/sales` - Criar venda
- `GET /api/sales/:id` - Buscar venda
- `PUT /api/sales/:id/status` - Atualizar status

#### 📋 Propostas
- `GET /api/proposals` - Listar propostas
- `POST /api/proposals` - Criar proposta
- `GET /api/proposals/:id` - Buscar proposta
- `PUT /api/proposals/:id` - Atualizar proposta
- `DELETE /api/proposals/:id` - Deletar proposta

#### 🏢 Distribuidores
- `GET /api/distributors` - Listar distribuidores
- `POST /api/distributors` - Criar distribuidor
- `GET /api/distributors/:id` - Buscar distribuidor
- `PUT /api/distributors/:id` - Atualizar distribuidor
- `DELETE /api/distributors/:id` - Deletar distribuidor

#### 🎯 Metas
- `GET /api/goals` - Listar metas
- `POST /api/goals` - Criar meta

#### 📅 Eventos
- `GET /api/events` - Listar eventos
- `POST /api/events` - Criar evento

#### 🔔 Notificações
- `GET /api/notifications` - Listar notificações

#### 💲 Lista de Preços
- `GET /api/price-list` - Listar preços
- `POST /api/price-list` - Criar lista de preços

### 7. Solução de Problemas

#### Erro 404
- Verifique se o `vercel.json` está correto
- Confirme se o arquivo `api/index.js` existe
- Verifique se todas as rotas estão registradas no `server.js`

#### Erro de CORS
- O CORS está configurado para aceitar todas as origins do Vercel
- Verifique se o frontend está usando a URL correta da API

#### Erro de Conexão com MongoDB
- Verifique se a `MONGODB_URI` está configurada
- Confirme se o IP está liberado no MongoDB Atlas
- Teste a conexão com `/api/test-db`

### 8. Monitoramento
```bash
# Ver logs em tempo real
vercel logs --follow

# Ver status do projeto
vercel ls

# Ver detalhes de um deploy
vercel inspect [deployment-url]
```

### 9. Estrutura do Projeto
```
backend/
├── api/
│   └── index.js          # Ponto de entrada para Vercel
├── routes/               # Rotas da API
├── models/               # Modelos do MongoDB
├── middleware/           # Middlewares
├── config/               # Configurações
├── server.js             # Servidor principal
├── vercel.json           # Configuração do Vercel
├── package.json          # Dependências
└── deploy-vercel.bat     # Script de deploy
```

### 10. URLs de Exemplo
- **API Base**: `https://seu-projeto.vercel.app`
- **Teste**: `https://seu-projeto.vercel.app/api/test`
- **Health**: `https://seu-projeto.vercel.app/health`
- **Rotas**: `https://seu-projeto.vercel.app/api/routes`

---

## 🎉 Sucesso!
Sua API está pronta para ser consumida pelo frontend! Todas as rotas estão funcionando e retornando dados em JSON.
