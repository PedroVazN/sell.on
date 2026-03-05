# 🚀 SELL.ON - Sistema de Gestão Comercial

<div align="center">

![Status](https://img.shields.io/badge/status-ativo-success.svg)
![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-proprietário-red.svg)

**Sistema completo de CRM e gestão de vendas com tecnologia moderna**

[Demo](https://sell-on-dt.vercel.app) · [Documentação](#-documentação) · [Suporte](#-suporte)

</div>

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades Principais](#-funcionalidades-principais)
- [Tecnologias](#-tecnologias)
- [Arquitetura](#-arquitetura)
- [Instalação](#-instalação)
- [Uso](#-uso)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Deploy](#-deploy)
- [Segurança](#-segurança)
- [Roadmap](#-roadmap)
- [Documentação](#-documentação)
- [Suporte](#-suporte)

---

## 🎯 Sobre o Projeto

**Sell.On** é uma plataforma completa de gestão comercial desenvolvida para otimizar o processo de vendas, desde a prospecção até o fechamento. Com interface moderna e intuitiva, oferece controle total sobre propostas, clientes, produtos, vendedores e métricas de performance.

### ✨ Destaques

- 🎨 **Interface Moderna**: Design dark com gradientes e efeitos visuais profissionais
- 📊 **Dashboard Analítico**: Métricas em tempo real e gráficos interativos
- 🔐 **Segurança Empresarial**: JWT, rate limiting, proteção XSS e validações robustas
- 📱 **Responsivo**: Experiência otimizada para desktop, tablet e mobile
- ⚡ **Performance**: Carregamento rápido e interface fluida
- 🌐 **Cloud Ready**: Deploy em Vercel com MongoDB Atlas

---

## 🎯 Funcionalidades Principais

### 📊 Dashboard Inteligente
- ✅ Métricas em tempo real (propostas, vendas, conversão)
- ✅ Gráficos interativos de performance
- ✅ Ranking de produtos mais vendidos
- ✅ Acompanhamento de metas e objetivos
- ✅ Indicadores de ticket médio e ROI

### 💼 Gestão de Propostas
- ✅ Criação rápida de propostas personalizadas
- ✅ Múltiplas listas de preços (À Vista, Boleto, Cartão)
- ✅ Geração de PDF profissional
- ✅ Controle de status (Aberta, Negociação, Fechada, Perdida)
- ✅ Histórico completo de interações
- ✅ Motivos de perda categorizados

### 👥 Gestão de Clientes
- ✅ Cadastro completo com validação de dados
- ✅ Enriquecimento automático via CNPJ
- ✅ Filtros avançados (UF, classificação, status)
- ✅ Histórico de propostas por cliente
- ✅ Segmentação e tags

### 🏢 Gestão de Distribuidores
- ✅ Cadastro e controle de parceiros
- ✅ Gestão de preços e condições especiais
- ✅ Acompanhamento de performance
- ✅ Relatórios de vendas por distribuidor

### 📦 Gestão de Produtos
- ✅ Catálogo completo de produtos
- ✅ Categorização e organização
- ✅ Controle de preços por lista
- ✅ Histórico de alterações
- ✅ Ativação/desativação seletiva

### 🎯 Gestão de Metas
- ✅ Definição de objetivos por vendedor
- ✅ Acompanhamento de progresso em tempo real
- ✅ Cálculo automático de atingimento
- ✅ Histórico de marcos
- ✅ Relatórios de performance

### 👤 Gestão de Usuários
- ✅ Sistema de roles (Admin/Vendedor)
- ✅ Autenticação segura com JWT
- ✅ Controle de acesso granular
- ✅ Perfis personalizáveis
- ✅ Auditoria de acessos

### 📢 Sistema de Avisos
- ✅ Criação de comunicados administrativos
- ✅ Upload de imagens e anexos
- ✅ Níveis de prioridade (Baixa, Média, Alta, Urgente)
- ✅ Controle de expiração
- ✅ Visualização em grid 4x4

### 🔔 Notificações em Tempo Real
- ✅ Alertas de novas propostas
- ✅ Lembretes de follow-up
- ✅ Notificações de metas atingidas
- ✅ Avisos administrativos

### 📈 Relatórios e Análises
- ✅ Relatórios de vendas detalhados
- ✅ Análise de performance por vendedor
- ✅ Funil de conversão
- ✅ Análise de produtos
- ✅ Exportação para PDF/Excel

---

## 🛠️ Tecnologias

### Frontend
```
React 18.3.1          - Framework UI
TypeScript 4.9.5      - Tipagem estática
Styled Components     - CSS-in-JS
React Router 6        - Roteamento
Axios                 - HTTP Client
Recharts              - Gráficos
jsPDF                 - Geração de PDF
Lucide React          - Ícones modernos
```

### Backend
```
Node.js 18+           - Runtime JavaScript
Express 4.18.2        - Framework web
MongoDB 6+            - Banco de dados NoSQL
Mongoose 7.5.0        - ODM para MongoDB
JWT                   - Autenticação
Bcrypt                - Hash de senhas
Express Validator     - Validação de dados
Express Rate Limit    - Rate limiting
Helmet                - Segurança HTTP
```

### DevOps & Cloud
```
Vercel                - Hosting (Frontend + Backend)
MongoDB Atlas         - Database cloud
Git & GitHub          - Controle de versão
```

---

## 🏗️ Arquitetura

### Estrutura Geral
```
sell.on/
├── frontend/              # Aplicação React
│   ├── src/
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── contexts/      # Context API (Auth, Toast)
│   │   ├── services/      # Serviços de API
│   │   ├── utils/         # Utilitários e helpers
│   │   ├── styles/        # Estilos globais e tema
│   │   └── types/         # TypeScript definitions
│   └── build/             # Build de produção
│
├── backend/               # API Node.js
│   ├── routes/            # Rotas da API REST
│   ├── models/            # Models do MongoDB
│   ├── middleware/        # Middlewares (auth, security)
│   ├── config/            # Configurações
│   ├── logs/              # Logs de segurança
│   └── api/               # Entry points
│
└── docs/                  # Documentação
```

### Fluxo de Dados

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   React     │ ──────> │  Express    │ ──────> │  MongoDB    │
│  Frontend   │  HTTP   │   Backend   │  Mongoose│   Atlas     │
└─────────────┘ <────── └─────────────┘ <────── └─────────────┘
     │                         │
     │                         │
     ├── Auth Context          ├── JWT Middleware
     ├── Toast Context         ├── Security Middleware
     ├── API Service           ├── Rate Limiting
     └── Protected Routes      └── Validation
```

---

## 📥 Instalação

### Pré-requisitos

- Node.js 18+ ([Download](https://nodejs.org/))
- npm ou yarn
- Git
- MongoDB (local ou Atlas)

### 1. Clone o Repositório

```bash
git clone https://github.com/PedroVazN/sell.on.git
cd sell.on
```

### 2. Configure o Backend

```bash
cd backend
npm install
```

Crie um arquivo `.env` (ou use variáveis de ambiente):
```env
# MongoDB
MONGODB_URI=mongodb://127.0.0.1:27017/vendas-db
# ou
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/sellone

# JWT
JWT_SECRET=sua_chave_secreta_super_segura

# Servidor
PORT=3001
NODE_ENV=development
```

### 3. Configure o Frontend

```bash
cd ../frontend
npm install
```

Crie um arquivo `.env` (ou ajuste em `src/services/api.ts`):
```env
REACT_APP_API_URL=http://localhost:3001/api
```

### 4. Execute o Sistema

#### Desenvolvimento

**Terminal 1 - Backend:**
```bash
cd backend
node server.js
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

#### Produção

```bash
# Build do frontend
cd frontend
npm run build

# Backend serve o frontend
cd ../backend
node server.js
```

### 5. Acesse o Sistema

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **Login padrão**: 
  - Email: `admin@sellone.com`
  - Senha: `123456`

---

## 💻 Uso

### Criando uma Proposta

1. Acesse **Propostas** → **Criar Proposta**
2. Selecione o cliente (ou cadastre novo)
3. Escolha o distribuidor
4. Adicione produtos da lista de preços
5. Ajuste quantidades e valores
6. Salve a proposta
7. Gere o PDF ou compartilhe link

### Acompanhando Metas

1. Acesse **Metas** no menu
2. Visualize progresso de cada vendedor
3. Acompanhe marcos e histórico
4. Sistema calcula automaticamente com base em vendas fechadas

### Gerenciando Avisos

1. Acesse **Avisos Administrativos** (apenas Admin)
2. Crie novo aviso com título, descrição e imagem
3. Defina prioridade e data de expiração
4. Vendedores visualizam em **Avisos**

---

## 📂 Estrutura do Projeto

<details>
<summary>Clique para expandir</summary>

```
sell.on/
│
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   ├── favicon.ico
│   │   └── manifest.json
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── Base/              # Componentes base (Button, Input, Card)
│   │   │   ├── ClientModal/       # Modal de clientes
│   │   │   ├── Clock/             # Relógio do header
│   │   │   ├── DistributorModal/  # Modal de distribuidores
│   │   │   ├── EventModal/        # Modal de eventos
│   │   │   ├── GoalModal/         # Modal de metas
│   │   │   ├── Header/            # Cabeçalho
│   │   │   ├── Layout/            # Layout principal
│   │   │   ├── NotificationBell/  # Sino de notificações
│   │   │   ├── PriceListModal/    # Modal de lista de preços
│   │   │   ├── ProgressModal/     # Modal de progresso
│   │   │   ├── ProposalSuccessModal/
│   │   │   ├── ProtectedRoute/    # Proteção de rotas
│   │   │   ├── Sidebar/           # Menu lateral
│   │   │   ├── Toast/             # Notificações toast
│   │   │   ├── ToastContainer/
│   │   │   └── UserModal/         # Modal de usuários
│   │   │
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx    # Contexto de autenticação
│   │   │   └── ToastContext.tsx   # Contexto de notificações
│   │   │
│   │   ├── hooks/
│   │   │   └── useToast.ts        # Hook de toast
│   │   │
│   │   ├── pages/
│   │   │   ├── Analysis/          # Análises
│   │   │   ├── Calendar/          # Calendário
│   │   │   ├── ClientRegistration/
│   │   │   ├── Clients/           # Gestão de clientes
│   │   │   ├── Configurations/    # Configurações
│   │   │   ├── CreatePriceList/
│   │   │   ├── CreateProduct/
│   │   │   ├── CreateProposal/    # Criar proposta
│   │   │   ├── Dashboard/         # Dashboard principal
│   │   │   ├── DistributorRegistration/
│   │   │   ├── Distributors/      # Gestão de distribuidores
│   │   │   ├── EditProposal/      # Editar proposta
│   │   │   ├── Goals/             # Metas
│   │   │   ├── Leads/             # Leads
│   │   │   ├── Login/             # Login
│   │   │   ├── NoticesAdmin/      # Avisos (Admin)
│   │   │   ├── NoticesViewer/     # Avisos (Vendedor)
│   │   │   ├── Notifications/     # Notificações
│   │   │   ├── Performance/       # Performance
│   │   │   ├── PriceList/         # Lista de preços
│   │   │   ├── Products/          # Produtos
│   │   │   ├── Profile/           # Perfil do usuário
│   │   │   ├── Proposals/         # Propostas
│   │   │   ├── Reports/           # Relatórios
│   │   │   ├── Sales/             # Vendas
│   │   │   ├── UserRegistration/
│   │   │   ├── Users/             # Gestão de usuários
│   │   │   └── VendedorDashboard/ # Dashboard vendedor
│   │   │
│   │   ├── services/
│   │   │   └── api.ts             # Configuração Axios
│   │   │
│   │   ├── styles/
│   │   │   ├── global.ts          # Estilos globais
│   │   │   ├── GlobalStyles.ts
│   │   │   ├── theme.ts           # Tema (cores, fonts)
│   │   │   └── styled.d.ts        # TypeScript definitions
│   │   │
│   │   ├── utils/
│   │   │   ├── formatters.ts      # Formatação (moeda, data)
│   │   │   ├── pdfGenerator.ts    # Geração de PDF
│   │   │   └── testPdf.ts
│   │   │
│   │   ├── App.tsx                # Componente raiz
│   │   └── index.tsx              # Entry point
│   │
│   ├── package.json
│   ├── tsconfig.json
│   └── vercel.json
│
├── backend/
│   ├── api/
│   │   ├── index.js               # Serverless API (Vercel)
│   │   └── test.js
│   │
│   ├── config/
│   │   └── database.js            # Configuração MongoDB
│   │
│   ├── middleware/
│   │   ├── auth.js                # Autenticação JWT
│   │   ├── security.js            # Rate limiting, helmet
│   │   ├── validation.js          # Validação de dados
│   │   └── secureLogging.js       # Logs sanitizados
│   │
│   ├── models/
│   │   ├── Client.js              # Model de clientes
│   │   ├── Distributor.js         # Model de distribuidores
│   │   ├── Event.js               # Model de eventos
│   │   ├── Goal.js                # Model de metas
│   │   ├── Notice.js              # Model de avisos
│   │   ├── Notification.js        # Model de notificações
│   │   ├── PriceList.js           # Model de lista de preços
│   │   ├── Product.js             # Model de produtos
│   │   ├── Proposal.js            # Model de propostas
│   │   ├── Sale.js                # Model de vendas
│   │   ├── User.js                # Model de usuários
│   │   └── index.js
│   │
│   ├── routes/
│   │   ├── clients.js             # Rotas de clientes
│   │   ├── distributors.js        # Rotas de distribuidores
│   │   ├── events.js              # Rotas de eventos
│   │   ├── goals.js               # Rotas de metas
│   │   ├── notices.js             # Rotas de avisos
│   │   ├── notifications.js       # Rotas de notificações
│   │   ├── priceList.js           # Rotas de lista de preços
│   │   ├── products.js            # Rotas de produtos
│   │   ├── proposals.js           # Rotas de propostas
│   │   ├── sales.js               # Rotas de vendas
│   │   └── users.js               # Rotas de usuários
│   │
│   ├── logs/                      # Logs de segurança
│   ├── public/                    # Arquivos estáticos
│   ├── server.js                  # Servidor Express
│   ├── recalculate-goals.js       # Script de recálculo de metas
│   ├── test-api.js
│   ├── test-mongodb.js
│   ├── package.json
│   └── vercel.json
│
├── APRESENTACAO_SELLON.md         # Apresentação executiva
├── APRESENTACAO_RESUMIDA.txt
├── DEPLOYMENT_INFO.md             # Informações de deploy
├── WHATSAPP_INTEGRACOES.txt       # Doc de integração WhatsApp
├── deploy.bat
└── README.md                      # Este arquivo
```

</details>

---

## 🚀 Deploy

### Vercel (Recomendado)

O projeto já está configurado para deploy na Vercel.

#### Frontend

```bash
cd frontend
vercel --prod
```

#### Backend

```bash
cd backend
vercel --prod
```

### Variáveis de Ambiente (Vercel)

Configure no dashboard da Vercel:

```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=sua_chave_secreta
NODE_ENV=production
```

### URLs de Produção

- **Frontend**: https://sell-on-dt.vercel.app
- **Backend**: https://backendsellon.vercel.app

---

## 🔐 Segurança

O Sell.On implementa múltiplas camadas de segurança:

### Autenticação e Autorização
- ✅ JWT obrigatório para todas as rotas protegidas
- ✅ Tokens com expiração de 24 horas
- ✅ Validação de usuário ativo no banco
- ✅ Sistema de roles (Admin/Vendedor)
- ✅ Senhas hashadas com bcrypt (salt rounds: 10)

### Proteção de Dados
- ✅ Validação robusta com express-validator
- ✅ Sanitização XSS em todos os campos de entrada
- ✅ Logs sanitizados sem dados sensíveis
- ✅ Rate limiting em todas as rotas (100 req/15min)
- ✅ Headers de segurança completos (Helmet)

### Monitoramento
- ✅ Detecção de ataques em tempo real
- ✅ Logs estruturados para auditoria
- ✅ Alertas de segurança automáticos
- ✅ Proteção contra injection (SQL, NoSQL, XSS)

### Boas Práticas
- ✅ CORS configurado para domínios específicos
- ✅ Variáveis de ambiente para credenciais
- ✅ Validação de entrada em todas as camadas
- ✅ Tratamento adequado de erros
- ✅ Sanitização de logs

---

## 🗺️ Roadmap

### ✅ Versão 1.0 (Atual)
- [x] Sistema completo de propostas
- [x] Gestão de clientes e distribuidores
- [x] Dashboard com métricas
- [x] Sistema de metas
- [x] Avisos administrativos
- [x] Autenticação e segurança
- [x] Deploy em produção

### 🔄 Versão 1.1 (Em Planejamento)
- [ ] **Integração WhatsApp Business**
  - [ ] Envio de propostas via WhatsApp
  - [ ] Recebimento de respostas
  - [ ] Automação de follow-ups
  - [ ] Chat integrado
  - [ ] Métricas de conversão
- [ ] Relatórios exportáveis (PDF/Excel)
- [ ] Filtros avançados em todas as telas
- [ ] Histórico de alterações

### 🚀 Versão 2.0 (Futuro)
- [ ] **Inteligência Artificial**
  - [ ] Score preditivo de vendas
  - [ ] Previsão de fechamento
  - [ ] Recomendação de produtos
  - [ ] Análise de sentimento
- [ ] App Mobile (React Native)
- [ ] Integração com ERPs
- [ ] API pública
- [ ] Chat interno entre vendedores
- [ ] Gamificação para vendedores

### 💡 Ideias Futuras
- [ ] Comandos de voz
- [ ] Assistente virtual inteligente
- [ ] Videochamadas integradas
- [ ] Enriquecimento automático de dados (CNPJ/CPF)
- [ ] Integração com Google Calendar/Outlook
- [ ] PWA com modo offline

---

## 📚 Documentação

### Arquivos de Documentação

- **APRESENTACAO_SELLON.md** - Apresentação executiva completa (15 slides)
- **APRESENTACAO_RESUMIDA.txt** - Resumo do sistema
- **DEPLOYMENT_INFO.md** - Informações detalhadas de deploy
- **WHATSAPP_INTEGRACOES.txt** - Documentação completa de integração WhatsApp
- **backend/DEPLOY_INSTRUCTIONS.md** - Instruções específicas de deploy do backend

### API Endpoints

<details>
<summary>Ver endpoints disponíveis</summary>

#### Autenticação
```
POST   /api/users/login          # Login
POST   /api/users/register       # Registro
GET    /api/users/me             # Dados do usuário logado
```

#### Usuários
```
GET    /api/users                # Listar usuários
GET    /api/users/:id            # Detalhes do usuário
POST   /api/users                # Criar usuário
PUT    /api/users/:id            # Atualizar usuário
DELETE /api/users/:id            # Deletar usuário
```

#### Clientes
```
GET    /api/clients              # Listar clientes
GET    /api/clients/:id          # Detalhes do cliente
POST   /api/clients              # Criar cliente
PUT    /api/clients/:id          # Atualizar cliente
DELETE /api/clients/:id          # Deletar cliente
```

#### Propostas
```
GET    /api/proposals            # Listar propostas
GET    /api/proposals/:id        # Detalhes da proposta
POST   /api/proposals            # Criar proposta
PUT    /api/proposals/:id        # Atualizar proposta
DELETE /api/proposals/:id        # Deletar proposta
```

#### Produtos
```
GET    /api/products             # Listar produtos
GET    /api/products/:id         # Detalhes do produto
POST   /api/products             # Criar produto
PUT    /api/products/:id         # Atualizar produto
DELETE /api/products/:id         # Deletar produto
```

#### Metas
```
GET    /api/goals                # Listar metas
GET    /api/goals/:id            # Detalhes da meta
POST   /api/goals                # Criar meta
PUT    /api/goals/:id            # Atualizar meta
DELETE /api/goals/:id            # Deletar meta
```

*E mais...*

</details>

---

## 🐛 Solução de Problemas

### Erro de conexão com MongoDB

```bash
# Verifique se o MongoDB está rodando
mongod --version

# Ou use MongoDB Atlas (recomendado)
# Configure a variável MONGODB_URI
```

### Erro de CORS

```javascript
// backend/server.js
// Verifique se o frontend está na lista de origins permitidas
const corsOptions = {
  origin: ['http://localhost:3000', 'https://sell-on-dt.vercel.app'],
  credentials: true
};
```

### Erro de autenticação

```bash
# Verifique se o JWT_SECRET está configurado
echo $JWT_SECRET

# Limpe o localStorage do navegador
localStorage.clear()
```

### Build do frontend falha

```bash
# Limpe o cache e reinstale
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Meta não atualiza automaticamente

```bash
# Execute o script de recálculo
cd backend
node recalculate-goals.js
```

---

## 🤝 Contribuindo

Este é um projeto proprietário, mas melhorias são bem-vindas:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto é **proprietário** e de uso interno. Todos os direitos reservados.

---

## 👥 Suporte

### Contato

- **Email**: suporte@sellone.com
- **GitHub**: [@PedroVazN](https://github.com/PedroVazN)
- **Repositório**: [sell.on](https://github.com/PedroVazN/sell.on)

### Links Úteis

- **Frontend (Produção)**: https://sell-on-dt.vercel.app
- **Backend (Produção)**: https://backendsellon.vercel.app
- **Documentação Adicional**: Ver pasta `/docs`

---

## 🙏 Agradecimentos

Desenvolvido com ❤️ para revolucionar a gestão comercial.

**Sell.On** - Transformando vendas em resultados! 🚀

---

<div align="center">

**Status do Projeto**: ✅ Ativo e em desenvolvimento contínuo

Última atualização: Outubro 2025

</div>

