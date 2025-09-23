# 🚀 Sell.On - Sistema de Gestão de Vendas

Sistema completo de CRM e gestão de vendas com frontend React e backend Node.js.

## 📋 Funcionalidades

### 🎯 Dashboard
- Visão geral das vendas e métricas
- Gráficos de performance
- Indicadores de metas

### 👥 Clientes
- Cadastro completo de clientes
- Filtros por UF, classificação e status
- Histórico de interações

### 🏢 Distribuidores
- Gestão de distribuidores
- Controle de preços e condições
- Acompanhamento de performance

### 📦 Produtos
- Catálogo de produtos
- Controle de estoque
- Categorização

### 💰 Propostas
- Criação de propostas comerciais
- Templates personalizáveis
- Acompanhamento de status

### 📊 Vendas
- Registro de vendas
- Relatórios detalhados
- Análise de performance

### 📋 Lista de Preços
- Preços por distribuidor
- Validação de vigência
- Histórico de alterações

## 🛠️ Tecnologias

### Frontend
- **React 18** com TypeScript
- **Styled Components** para estilização
- **React Router** para navegação
- **Axios** para requisições HTTP

### Backend
- **Node.js** com Express
- **MongoDB** com Mongoose
- **CORS** para comunicação
- **JWT** para autenticação

## 🚀 Instalação e Configuração

### Pré-requisitos
- Node.js 16+ 
- MongoDB (local ou Atlas)
- Git

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd Sales
```

### 2. Instale as dependências do backend
```bash
npm install
```

### 3. Instale as dependências do frontend
```bash
cd sales-crm
npm install
```

### 4. Configure o banco de dados

#### Opção A: MongoDB Local (Recomendado)
1. Execute o script de instalação:
```bash
.\install-mongodb-local.bat
```
2. Siga as instruções na tela
3. O sistema se conectará automaticamente

#### Opção B: MongoDB Atlas
1. Crie uma conta no MongoDB Atlas
2. Crie um cluster
3. Configure o IP whitelist
4. Crie um arquivo `.env` com:
```env
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/sellone
```

### 5. Execute o sistema

#### Modo Completo (com banco de dados)
```bash
node complete-server.js
```

#### Modo Demo (sem banco de dados)
```bash
node demo-server.js
```

## 🌐 Acesso

- **Frontend:** http://localhost:3002
- **API:** http://localhost:3002/api
- **Login:** admin@sellone.com / 123456

## 📁 Estrutura do Projeto

```
Sales/
├── complete-server.js          # Servidor principal
├── demo-server.js              # Servidor demo
├── config/
│   └── database.js             # Configuração do banco
├── models/                     # Modelos do MongoDB
├── routes/                     # Rotas da API
├── middleware/                 # Middlewares
├── sales-crm/                  # Frontend React
│   ├── src/
│   │   ├── components/         # Componentes React
│   │   ├── pages/             # Páginas
│   │   ├── services/          # Serviços de API
│   │   └── styles/            # Estilos
│   └── build/                 # Build de produção
├── install-mongodb-local.bat   # Script de instalação MongoDB
└── public/                    # Arquivos estáticos
```

## 🔧 Scripts Disponíveis

### Backend
- `node complete-server.js` - Inicia servidor completo
- `node demo-server.js` - Inicia servidor demo

### Frontend
- `npm start` - Inicia em modo desenvolvimento
- `npm run build` - Gera build de produção

## 🐛 Solução de Problemas

### Erro de conexão com MongoDB
1. Verifique se o MongoDB está rodando
2. Execute `.\install-mongodb-local.bat` para instalar MongoDB local
3. Confirme as credenciais do Atlas (se usando)

### Erro de CORS
1. Verifique se o frontend está na porta correta
2. Confirme as configurações de CORS no servidor

### Erro de build do frontend
1. Execute `npm install` na pasta sales-crm
2. Verifique se todas as dependências estão instaladas

## 📝 Licença

Este projeto é de uso interno e proprietário.

## 👥 Suporte

Para suporte técnico, entre em contato com a equipe de desenvolvimento.