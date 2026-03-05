# 🎨 Sell.On - Frontend

Interface moderna e intuitiva do sistema Sell.On - CRM completo para gestão comercial.

## 🎯 Sobre

Frontend desenvolvido em React + TypeScript com design dark profissional, oferecendo experiência de usuário otimizada para gestão de vendas.

## ✨ Características

- 🎨 **Design Dark Moderno**: Gradientes, transparências e efeitos visuais profissionais
- 📱 **100% Responsivo**: Adaptável a desktop, tablet e mobile
- ⚡ **Performance Otimizada**: Carregamento rápido e navegação fluida
- 🔐 **Autenticação Segura**: Context API com JWT
- 📊 **Dashboard Interativo**: Métricas em tempo real com gráficos
- 🎯 **Experiência Intuitiva**: Sidebar organizada e navegação clara
- 🔔 **Notificações Toast**: Feedback instantâneo de ações
- 🎭 **Animações Suaves**: Transições e efeitos modernos

## 🛠️ Stack Tecnológico

### Core
- **React 18.3.1** - Biblioteca UI com hooks modernos
- **TypeScript 4.9.5** - Type safety e intellisense
- **React Router 6** - Roteamento SPA

### Estilização
- **Styled Components 6.1.0** - CSS-in-JS com temas
- **Lucide React** - Ícones SVG otimizados

### Visualização de Dados
- **Recharts 2.10.0** - Gráficos interativos e responsivos

### Utilitários
- **Axios 1.5.1** - Cliente HTTP com interceptors
- **jsPDF 2.5.1** - Geração de PDF
- **date-fns** - Manipulação de datas

## 📦 Instalação e Configuração

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### 1. Instale as dependências

```bash
npm install
```

### 2. Configure a API

Edite o arquivo `src/services/api.ts` com a URL da API:

```typescript
const api = axios.create({
  baseURL: 'http://localhost:3001/api', // Desenvolvimento
  // baseURL: 'https://backend-sable-eta-89.vercel.app/api', // Produção
});
```

Ou crie um `.env`:

```env
REACT_APP_API_URL=http://localhost:3001/api
```

### 3. Execute o projeto

#### Desenvolvimento
```bash
npm start
```
Abre em http://localhost:3000

#### Build de Produção
```bash
npm run build
```
Gera build otimizado na pasta `/build`

#### Deploy (Vercel)
```bash
vercel --prod
```

## 🎨 Design System

### Paleta de Cores

```typescript
// Tema Principal
primary: '#00D4AA'      // Verde neon (ações principais)
secondary: '#6366F1'    // Azul (elementos secundários)
background: '#0A0E27'   // Azul escuro profundo
surface: '#1a1d35'      // Superfícies e cards

// Status
success: '#10B981'      // Verde (sucesso)
warning: '#F59E0B'      // Amarelo (atenção)
error: '#EF4444'        // Vermelho (erro)
info: '#3B82F6'         // Azul (informação)
```

### Tipografia
- **Font Family**: Inter (Google Fonts)
- **Pesos**: 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold)

### Efeitos
- **Blur**: backdrop-filter para profundidade
- **Gradientes**: Múltiplos gradientes para hierarquia
- **Sombras**: Box-shadows suaves e multicamadas
- **Bordas**: Border radius 12px para modernidade

## 📱 Módulos e Páginas

### 🏠 Dashboard
- Cards de métricas (Propostas, Vendas, Ticket Médio)
- Gráfico de propostas diárias (Recharts)
- Ranking de produtos mais vendidos
- Widget de metas com progresso
- Atualização em tempo real

### 💼 Propostas
- **Listagem**: Grid responsivo com status visual
- **Criar/Editar**: Formulário multi-etapa
- **PDF**: Geração de proposta profissional
- **Status**: Aberta, Negociação, Fechada, Perdida
- **Motivos de Perda**: Categorização inteligente

### 👥 Gestão de Clientes
- CRUD completo com validação
- Filtros avançados (UF, classificação)
- Histórico de propostas por cliente
- Modal de detalhes

### 🏢 Distribuidores
- Cadastro e gestão
- Vínculo com lista de preços
- Performance por parceiro

### 📦 Produtos
- Catálogo visual
- Categorização
- Ativação/desativação
- Preços por lista

### 🎯 Metas
- Dashboard de objetivos
- Progresso visual com barras
- Histórico de marcos
- Filtro por vendedor

### 📢 Avisos
- **Admin**: Criação de comunicados
- **Vendedor**: Visualização em grid 4x4
- Upload de imagens Base64
- Níveis de prioridade

### 👤 Usuários e Perfil
- Gestão de vendedores
- Sistema de roles
- Perfil editável
- Avatar personalizado

### 🔔 Notificações
- Centro de notificações
- Badge com contador
- Marcar como lida
- Filtros por tipo

## 📜 Scripts Disponíveis

```bash
# Desenvolvimento (localhost:3000)
npm start

# Build de produção
npm run build

# Testes
npm test

# Análise de bundle
npm run build && npx source-map-explorer 'build/static/js/*.js'
```

## 📁 Estrutura Detalhada

```
frontend/
├── public/
│   ├── index.html         # HTML base
│   ├── favicon.ico
│   └── manifest.json      # PWA manifest
│
├── src/
│   ├── components/        # Componentes reutilizáveis
│   │   ├── Base/          # Componentes base (Button, Input, Card)
│   │   ├── Layout/        # Layout principal com Sidebar + Header
│   │   ├── Header/        # Cabeçalho com Clock e NotificationBell
│   │   ├── Sidebar/       # Menu lateral com navegação
│   │   ├── Toast/         # Sistema de notificações toast
│   │   ├── ProtectedRoute/# Proteção de rotas por role
│   │   └── [Modais]/      # Modais específicos (Client, Product, etc)
│   │
│   ├── pages/             # Páginas da aplicação
│   │   ├── Login/         # Autenticação
│   │   ├── Dashboard/     # Dashboard principal
│   │   ├── Proposals/     # Gestão de propostas
│   │   ├── CreateProposal/# Criar proposta
│   │   ├── EditProposal/  # Editar proposta
│   │   ├── Clients/       # Gestão de clientes
│   │   ├── Products/      # Gestão de produtos
│   │   ├── Goals/         # Metas e objetivos
│   │   ├── Users/         # Gestão de usuários
│   │   ├── NoticesAdmin/  # Avisos (Admin)
│   │   ├── NoticesViewer/ # Avisos (Vendedor)
│   │   └── [Outras]/      # Performance, Analysis, etc
│   │
│   ├── contexts/          # Context API
│   │   ├── AuthContext.tsx   # Autenticação e usuário logado
│   │   └── ToastContext.tsx  # Sistema de toasts
│   │
│   ├── hooks/             # Custom hooks
│   │   └── useToast.ts    # Hook para toasts
│   │
│   ├── services/          # Serviços externos
│   │   └── api.ts         # Configuração Axios + interceptors
│   │
│   ├── utils/             # Utilitários
│   │   ├── formatters.ts  # Formatação de moeda, data, CPF/CNPJ
│   │   └── pdfGenerator.ts# Geração de PDF das propostas
│   │
│   ├── styles/            # Estilos globais
│   │   ├── GlobalStyles.ts# Reset e estilos base
│   │   ├── theme.ts       # Tema (cores, fonts, breakpoints)
│   │   └── styled.d.ts    # TypeScript definitions
│   │
│   ├── types/             # TypeScript types
│   │   └── styled.d.ts    # Definições de tema
│   │
│   ├── App.tsx            # Componente raiz com rotas
│   └── index.tsx          # Entry point
│
├── build/                 # Build de produção
├── package.json
├── tsconfig.json          # Configuração TypeScript
└── vercel.json           # Configuração Vercel
```

## 🔐 Autenticação

### Context API

```typescript
// AuthContext gerencia:
- Login/Logout
- Token JWT no localStorage
- Dados do usuário logado
- Verificação de roles (admin/vendedor)
- Proteção automática de rotas
```

### Fluxo de Autenticação

```
Login → API → JWT Token → localStorage → Context → Protected Routes
```

### Protected Routes

```typescript
<ProtectedRoute permission="admin">
  <AdminPage />
</ProtectedRoute>

<ProtectedRoute permission="proposals">
  <ProposalsPage />
</ProtectedRoute>
```

## 🐛 Solução de Problemas

### Erro ao conectar com API

```typescript
// Verifique a URL da API em src/services/api.ts
const api = axios.create({
  baseURL: 'http://localhost:3001/api', // Deve apontar para o backend
});
```

### Erro de CORS

```bash
# O backend precisa permitir a origem do frontend
# Verifique backend/server.js
```

### Build falha

```bash
# Limpe e reinstale
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Token expirado

```typescript
// O sistema redireciona automaticamente para login
// Token JWT expira em 24h
```

## 🚀 Deploy

### Vercel (Recomendado)

```bash
vercel --prod
```

### Variáveis de Ambiente (Vercel Dashboard)

```
REACT_APP_API_URL=https://backend-sable-eta-89.vercel.app/api
```

### Build Manual

```bash
npm run build
# Deploy a pasta /build para qualquer hosting estático
```

## 🌐 URLs

- **Produção**: https://sell-on-dt.vercel.app
- **Backend**: https://backend-sable-eta-89.vercel.app/api

## 📝 Licença

Este projeto é **proprietário** e de uso interno.

## 👥 Suporte

- **GitHub**: [@PedroVazN](https://github.com/PedroVazN)
- **Repositório**: [sell.on](https://github.com/PedroVazN/sell.on)

---

**Sell.On Frontend** - Interface moderna para gestão comercial 🎨🚀