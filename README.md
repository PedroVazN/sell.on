# Sell.On - Sistema de Gestão Comercial

CRM para gestão de vendas, desenvolvido para um time comercial: propostas, clientes, distribuidores, produtos, metas e dashboard de desempenho. Aplicação full stack em React, TypeScript, Node.js e MongoDB, em uso em produção por um time de 5 vendedores.

**Demo:** [sell-on-dt.vercel.app](https://sell-on-dt.vercel.app) (o acesso à demonstração é fornecido sob solicitação)

<!-- Adicione aqui 2 a 4 prints das telas principais (Dashboard, Criar Proposta, Metas), por exemplo em docs/screenshots/ -->

## Índice

- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Arquitetura](#arquitetura)
- [Instalação](#instalação)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Endpoints da API](#endpoints-da-api)
- [Segurança](#segurança)
- [Deploy](#deploy)
- [Testes](#testes)
- [Roadmap](#roadmap)
- [Licença e contato](#licença-e-contato)

## Funcionalidades

**Propostas**
- Criação de propostas a partir de clientes, distribuidores e listas de preços (À Vista, Boleto e Cartão)
- Geração de proposta em PDF
- Controle de status: Aberta, Negociação, Fechada e Perdida
- Registro categorizado do motivo de perda

**Clientes e distribuidores**
- Cadastro com validação de dados
- Filtros por UF, classificação e status
- Histórico de propostas por cliente
- Cadastro de distribuidores com preços e condições especiais

**Produtos e listas de preços**
- Catálogo de produtos com categorias
- Controle de preços por lista
- Ativação e desativação de produtos

**Metas e desempenho**
- Definição de metas por vendedor
- Cálculo do atingimento com base nas vendas fechadas
- Dashboard com propostas, vendas, conversão e ranking de produtos
- Dashboard específico para o vendedor

**Administração**
- Perfis de acesso: Admin e Vendedor
- Avisos administrativos com prioridade, imagem e data de expiração
- Notificações dentro do sistema

## Tecnologias

| Camada | Tecnologias |
|---|---|
| Front-end | React 18, TypeScript, Styled Components, React Router 6, Axios, Recharts, jsPDF |
| Back-end | Node.js 18+, Express 4, MongoDB, Mongoose |
| Segurança | JWT, bcrypt, express-validator, express-rate-limit, Helmet |
| Infraestrutura | Vercel (front-end e API), MongoDB Atlas |

## Arquitetura

Aplicação em duas partes: um front-end React que consome uma API REST em Node.js e Express, com persistência em MongoDB.

```
React (frontend)  --HTTP/JSON-->  Express (backend)  --Mongoose-->  MongoDB Atlas
  Auth Context                      Middleware JWT
  API service (Axios)               Rate limit, Helmet, validação
  Rotas protegidas                  Rotas por domínio
```

Estrutura resumida:

```
frontend/
  src/
    components/   # Componentes reutilizáveis e modais
    pages/        # Telas (Dashboard, Proposals, Clients, Goals, ...)
    contexts/     # AuthContext, ToastContext
    services/     # Cliente da API (Axios)
    utils/        # Formatadores e geração de PDF
    styles/       # Tema e estilos globais
backend/
  api/            # Entry point serverless (Vercel)
  config/         # Conexão com o banco
  middleware/     # auth, security, validation, secureLogging
  models/         # Client, Distributor, Goal, Notice, Product, Proposal, Sale, User, ...
  routes/         # Uma rota por domínio
  server.js       # Servidor Express
```

## Instalação

**Pré-requisitos:** Node.js 18+, npm e uma instância do MongoDB (local ou Atlas).

```bash
git clone https://github.com/PedroVazN/sell.on.git
```

Entre na pasta do projeto que contém `frontend/` e `backend/` e siga os passos.

**1. Back-end**

```bash
cd backend
npm install
# crie o arquivo .env conforme a seção "Variáveis de ambiente"
node server.js
```

A API fica disponível em `http://localhost:3001/api`.

**2. Front-end**

```bash
cd frontend
npm install
# crie o arquivo .env com REACT_APP_API_URL
npm start
```

O front-end fica disponível em `http://localhost:3000`.

**3. Primeiro acesso**

O projeto não possui credenciais padrão. Crie o primeiro usuário pelo endpoint de autenticação (veja [Endpoints da API](#endpoints-da-api)) e use-o para acessar o sistema.

## Variáveis de ambiente

Back-end (`backend/.env`):

```env
MONGODB_URI=mongodb://127.0.0.1:27017/vendas-db
JWT_SECRET=defina_uma_chave_longa_e_aleatoria
PORT=3001
NODE_ENV=development
```

Front-end (`frontend/.env`):

```env
REACT_APP_API_URL=http://localhost:3001/api
```

Nunca versione arquivos `.env`. Em produção, configure as variáveis diretamente no painel da Vercel.

## Endpoints da API

<details>
<summary>Ver endpoints principais</summary>

```
# Autenticação
POST   /api/users/login
POST   /api/users/register
GET    /api/users/me

# Usuários
GET    /api/users
GET    /api/users/:id
POST   /api/users
PUT    /api/users/:id
DELETE /api/users/:id

# Clientes
GET    /api/clients
GET    /api/clients/:id
POST   /api/clients
PUT    /api/clients/:id
DELETE /api/clients/:id

# Propostas
GET    /api/proposals
GET    /api/proposals/:id
POST   /api/proposals
PUT    /api/proposals/:id
DELETE /api/proposals/:id

# Produtos
GET    /api/products
GET    /api/products/:id
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id

# Metas
GET    /api/goals
GET    /api/goals/:id
POST   /api/goals
PUT    /api/goals/:id
DELETE /api/goals/:id
```

Há também rotas para distribuidores, listas de preços, vendas, eventos, avisos e notificações, seguindo o mesmo padrão.

</details>

## Segurança

- Autenticação com JWT (expiração de 24 horas) nas rotas protegidas
- Controle de acesso por perfil (Admin e Vendedor)
- Senhas armazenadas com hash bcrypt
- Validação de entrada com express-validator
- Limite de requisições (100 por 15 minutos)
- Headers de segurança com Helmet
- CORS restrito aos domínios do front-end
- Logs com remoção de dados sensíveis (middleware `secureLogging`)
- Credenciais e chaves somente em variáveis de ambiente

## Deploy

Front-end e API são publicados na Vercel, com banco no MongoDB Atlas.

```bash
cd frontend && vercel --prod
cd backend && vercel --prod
```

Variáveis necessárias no painel da Vercel (back-end): `MONGODB_URI`, `JWT_SECRET` e `NODE_ENV=production`.

## Testes

O repositório inclui scripts de verificação manual (`backend/test-api.js` e `backend/test-mongodb.js`). Testes automatizados estão no roadmap.

## Roadmap

- [ ] Testes automatizados no back-end (Jest e Supertest)
- [ ] Exportação de relatórios para Excel
- [ ] Filtros avançados em todas as telas
- [ ] Histórico de alterações
- [ ] Integração com WhatsApp Business (envio de propostas e follow-ups)
- [ ] Aplicativo mobile

## Licença e contato

Projeto proprietário, de uso interno. Todos os direitos reservados.

Desenvolvido por Pedro Vaz Nascimento - [GitHub](https://github.com/PedroVazN) | [LinkedIn](https://www.linkedin.com/in/pedro-vaz-n/)
