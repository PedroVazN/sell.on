# 🔧 Sell.On - Backend API

Backend do sistema Sell.On - API REST completa para gestão comercial.

## 🎯 Sobre

API RESTful desenvolvida em Node.js + Express + MongoDB que fornece todos os endpoints necessários para o funcionamento do sistema Sell.On.

## ✨ Características

- 🔐 **Autenticação JWT** com expiração de 24h
- 🛡️ **Segurança robusta** (Rate limiting, Helmet, XSS protection)
- ✅ **Validação de dados** com express-validator
- 📊 **MongoDB** com Mongoose ODM
- 🚀 **Serverless** ready (Vercel)
- 📝 **Logs sanitizados** para auditoria
- ⚡ **Performance otimizada**

## 📋 Recursos da API

### 🎯 Dashboard
- Métricas em tempo real
- Estatísticas de propostas
- Dados de vendas agregados
- Performance de vendedores

### 👥 Clientes
- CRUD completo de clientes
- Filtros avançados (UF, status, classificação)
- Histórico de propostas por cliente
- Validação de CNPJ/CPF

### 🏢 Distribuidores
- Gestão de distribuidores
- Controle de preços especiais
- Performance por distribuidor

### 📦 Produtos
- Catálogo de produtos
- Ativação/desativação
- Categorização
- Histórico de alterações

### 💰 Propostas
- Criação e edição de propostas
- Controle de status
- Múltiplas listas de preços
- Motivos de perda categorizados

### 🎯 Metas
- Definição de objetivos
- Cálculo automático de progresso
- Histórico de marcos
- Relatórios de atingimento

### 📊 Vendas
- Registro de vendas fechadas
- Relatórios detalhados
- Análise de conversão
- Funil de vendas

### 📋 Lista de Preços
- Preços por distribuidor
- Múltiplas opções de pagamento
- Validação de vigência
- Histórico completo

### 📢 Avisos e Notificações
- Sistema de comunicados
- Notificações em tempo real
- Priorização de mensagens
- Upload de imagens Base64

## 🛠️ Stack Tecnológico

### Core
- **Node.js 18+** - Runtime JavaScript
- **Express 4.18.2** - Framework web minimalista
- **MongoDB 6+** - Banco de dados NoSQL
- **Mongoose 7.5.0** - ODM para MongoDB

### Segurança
- **jsonwebtoken** - Autenticação JWT
- **bcryptjs** - Hash de senhas
- **helmet** - Headers de segurança HTTP
- **express-rate-limit** - Rate limiting
- **express-validator** - Validação e sanitização

### Utilitários
- **cors** - Cross-Origin Resource Sharing
- **dotenv** - Variáveis de ambiente
- **morgan** - Logger HTTP

## 🚀 Instalação e Configuração

### Pré-requisitos
- Node.js 18+ instalado
- MongoDB (local ou Atlas)
- npm ou yarn

### 1. Instale as dependências

```bash
npm install
```

### 2. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz:

```env
# MongoDB
MONGODB_URI=mongodb://127.0.0.1:27017/vendas-db
# ou para MongoDB Atlas:
# MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/sellone

# JWT
JWT_SECRET=sua_chave_secreta_super_segura_aqui

# Servidor
PORT=3001
NODE_ENV=development

# CORS (opcional)
ALLOWED_ORIGINS=http://localhost:3000,https://sell-on-dt.vercel.app
```

### 3. Execute o servidor

#### Desenvolvimento
```bash
node server.js
```

#### Produção (Vercel)
```bash
vercel --prod
```

## 🌐 Acesso

- **API Local:** http://localhost:3001/api
- **API Produção:** https://backend-sable-eta-89.vercel.app/api
- **Health Check:** GET `/api/health`

## 📁 Estrutura do Projeto

```
backend/
├── api/
│   ├── index.js              # Entry point Vercel
│   └── test.js               # API de teste
│
├── config/
│   └── database.js           # Configuração MongoDB
│
├── middleware/
│   ├── auth.js               # Autenticação JWT
│   ├── security.js           # Rate limiting, helmet
│   ├── validation.js         # Validação de dados
│   └── secureLogging.js      # Logs sanitizados
│
├── models/
│   ├── Client.js             # Schema de clientes
│   ├── Distributor.js        # Schema de distribuidores
│   ├── Event.js              # Schema de eventos
│   ├── Goal.js               # Schema de metas
│   ├── Notice.js             # Schema de avisos
│   ├── Notification.js       # Schema de notificações
│   ├── PriceList.js          # Schema de lista de preços
│   ├── Product.js            # Schema de produtos
│   ├── Proposal.js           # Schema de propostas
│   ├── Sale.js               # Schema de vendas
│   ├── User.js               # Schema de usuários
│   └── index.js              # Export de todos os models
│
├── routes/
│   ├── clients.js            # Rotas de clientes
│   ├── distributors.js       # Rotas de distribuidores
│   ├── events.js             # Rotas de eventos
│   ├── goals.js              # Rotas de metas
│   ├── notices.js            # Rotas de avisos
│   ├── notifications.js      # Rotas de notificações
│   ├── priceList.js          # Rotas de lista de preços
│   ├── products.js           # Rotas de produtos
│   ├── proposals.js          # Rotas de propostas
│   ├── sales.js              # Rotas de vendas
│   └── users.js              # Rotas de usuários
│
├── logs/                     # Logs de segurança
├── public/                   # Arquivos estáticos
├── server.js                 # Servidor Express principal
├── recalculate-goals.js      # Script de recálculo de metas
├── package.json
├── vercel.json              # Configuração Vercel
└── README.md
```

## 📜 Scripts Disponíveis

```bash
# Iniciar servidor de desenvolvimento
node server.js

# Testar conexão MongoDB
node test-mongodb.js

# Testar API
node test-api.js

# Recalcular metas manualmente
node recalculate-goals.js

# Deploy para Vercel
vercel --prod
```

## 📡 Endpoints Principais

### Autenticação
```
POST   /api/users/login          # Login do usuário
POST   /api/users/register       # Registro de novo usuário
GET    /api/users/me             # Dados do usuário logado
```

### Propostas
```
GET    /api/proposals            # Listar todas as propostas
GET    /api/proposals/:id        # Detalhes de uma proposta
POST   /api/proposals            # Criar nova proposta
PUT    /api/proposals/:id        # Atualizar proposta
DELETE /api/proposals/:id        # Deletar proposta
```

### Clientes
```
GET    /api/clients              # Listar clientes
POST   /api/clients              # Criar cliente
PUT    /api/clients/:id          # Atualizar cliente
DELETE /api/clients/:id          # Deletar cliente
```

### Metas
```
GET    /api/goals                # Listar metas
POST   /api/goals                # Criar meta
PUT    /api/goals/:id            # Atualizar meta
GET    /api/goals/vendor/:id     # Metas de um vendedor
```

*Ver documentação completa da API no README principal*

## 🔒 Segurança

### Middlewares Implementados

✅ **Autenticação JWT** - Todas as rotas protegidas exigem token válido  
✅ **Rate Limiting** - 100 requisições por 15 minutos por IP  
✅ **Helmet** - Headers de segurança HTTP  
✅ **XSS Protection** - Sanitização de entrada  
✅ **CORS** - Apenas origins permitidas  
✅ **Validação** - express-validator em todos os endpoints  
✅ **Logs Sanitizados** - Sem exposição de dados sensíveis  

### Proteção Contra

❌ Injection (SQL, NoSQL, XSS)  
❌ Brute Force (rate limiting)  
❌ CSRF (tokens)  
❌ Exposição de dados sensíveis  
❌ Acesso não autorizado  

## 🐛 Solução de Problemas

### Erro: "Cannot connect to MongoDB"
```bash
# Verifique a string de conexão
echo $MONGODB_URI

# Teste a conexão
node test-mongodb.js
```

### Erro: "JWT must be provided"
```bash
# Certifique-se de enviar o token no header
Authorization: Bearer SEU_TOKEN_AQUI
```

### Erro: "Too many requests"
```bash
# Rate limit atingido, aguarde 15 minutos ou ajuste em:
# middleware/security.js
```

### Meta não atualiza
```bash
# Execute o script de recálculo manualmente
node recalculate-goals.js
```

## 📝 Licença

Este projeto é **proprietário** e de uso interno.

## 👥 Suporte

Para suporte técnico:
- **GitHub**: [@PedroVazN](https://github.com/PedroVazN)
- **Repositório**: [sell.on](https://github.com/PedroVazN/sell.on)

---

**Sell.On Backend** - API robusta e segura para gestão comercial 🚀