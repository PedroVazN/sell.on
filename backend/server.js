const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

const app = express();

// Middleware CORS otimizado para Vercel
app.use(cors({
  origin: function (origin, callback) {
    // Permitir requisições sem origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://sellonn.vercel.app',
      'https://sell.on',
      'http://localhost:3000',
      'http://localhost:3001',
      'https://sell-on-frontend.vercel.app',
      'https://sell-on-frontend-git-main.vercel.app'
    ];
    
    // Permitir todas as origins do Vercel
    if (origin.includes('vercel.app') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Permitir todas as origins por enquanto
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Carregar variáveis de ambiente
require('dotenv').config();

// Conexão com MongoDB otimizada para Vercel
const connectDB = async () => {
  try {
    // Verificar se já está conectado
    if (mongoose.connection.readyState === 1) {
      console.log('✅ MongoDB já conectado');
      return;
    }

    const atlasUri = process.env.MONGODB_URI;
    
    if (!atlasUri) {
      console.error('❌ MONGODB_URI não encontrada nas variáveis de ambiente');
      console.log('💡 Configure MONGODB_URI na Vercel ou no arquivo .env');
      if (process.env.NODE_ENV === 'production') {
        console.log('⚠️  Continuando sem conexão com MongoDB em produção');
        return;
      }
      throw new Error('MONGODB_URI não configurada');
    }
    
    // Configurações otimizadas para Vercel
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false
    };
    
    const conn = await mongoose.connect(atlasUri, options);
    console.log(`✅ MongoDB Atlas conectado: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ Erro ao conectar com MongoDB:', error.message);
    if (process.env.NODE_ENV === 'production') {
      console.log('⚠️  Continuando sem conexão com MongoDB em produção');
    } else {
      throw error;
    }
  }
};

// Conectar ao MongoDB sempre que possível
connectDB().catch((error) => {
  console.log('⚠️  MongoDB não conectado, mas servidor continuará funcionando');
  console.log('💡 Para conectar ao MongoDB, configure MONGODB_URI');
  console.log('🔍 Erro:', error.message);
});

// Rota da API
app.get('/api', (req, res) => {
  res.json({
    message: 'Bem-vindo ao SellOne API',
    version: '1.0.0',
    status: 'online',
    timestamp: new Date().toISOString()
  });
});


// Importar e usar as rotas
const clientsRouter = require('./routes/clients');
app.use('/api/clients', clientsRouter);

const eventsRouter = require('./routes/events');
app.use('/api/events', eventsRouter);

const goalsRouter = require('./routes/goals');
app.use('/api/goals', goalsRouter);

const notificationsRouter = require('./routes/notifications');
app.use('/api/notifications', notificationsRouter);

const usersRouter = require('./routes/users');
app.use('/api/users', usersRouter);

const productsRouter = require('./routes/products');
app.use('/api/products', productsRouter);

const distributorsRouter = require('./routes/distributors');
app.use('/api/distributors', distributorsRouter);

const salesRouter = require('./routes/sales');
app.use('/api/sales', salesRouter);

const proposalsRouter = require('./routes/proposals');
app.use('/api/proposals', proposalsRouter);

const priceListRouter = require('./routes/priceList');
app.use('/api/price-list', priceListRouter);

// Rota de health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'API funcionando' });
});

// Rota de teste para verificar se o servidor está funcionando
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true,
    message: 'Backend funcionando perfeitamente!', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    status: 'online'
  });
});

// Rota de teste para verificar conexão com MongoDB
app.get('/api/test-db', async (req, res) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    
    // Se não estiver conectado, tentar conectar
    if (!isConnected && process.env.MONGODB_URI) {
      console.log('🔄 Tentando reconectar ao MongoDB...');
      try {
        await connectDB();
        console.log('✅ Reconexão bem-sucedida!');
      } catch (reconnectError) {
        console.log('❌ Falha na reconexão:', reconnectError.message);
      }
    }
    
    res.json({
      success: true,
      message: 'Teste de conexão com MongoDB',
      connected: mongoose.connection.readyState === 1,
      state: mongoose.connection.readyState,
      host: mongoose.connection.host || 'N/A',
      database: mongoose.connection.name || 'N/A',
      mongodbUri: process.env.MONGODB_URI ? 'Configurada' : 'Não configurada',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao testar conexão com MongoDB',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Rota de teste para verificar todas as rotas da API
app.get('/api/routes', (req, res) => {
  const routes = [
    { method: 'GET', path: '/api', description: 'Informações da API' },
    { method: 'GET', path: '/api/test', description: 'Teste do servidor' },
    { method: 'GET', path: '/api/test-db', description: 'Teste do MongoDB' },
    { method: 'GET', path: '/api/routes', description: 'Lista de rotas' },
    { method: 'GET', path: '/health', description: 'Health check' },
    { method: 'GET', path: '/api/clients', description: 'Listar clientes' },
    { method: 'POST', path: '/api/clients', description: 'Criar cliente' },
    { method: 'GET', path: '/api/products', description: 'Listar produtos' },
    { method: 'POST', path: '/api/products', description: 'Criar produto' },
    { method: 'GET', path: '/api/users', description: 'Listar usuários' },
    { method: 'POST', path: '/api/users', description: 'Criar usuário' },
    { method: 'GET', path: '/api/sales', description: 'Listar vendas' },
    { method: 'POST', path: '/api/sales', description: 'Criar venda' },
    { method: 'GET', path: '/api/proposals', description: 'Listar propostas' },
    { method: 'POST', path: '/api/proposals', description: 'Criar proposta' },
    { method: 'GET', path: '/api/distributors', description: 'Listar distribuidores' },
    { method: 'POST', path: '/api/distributors', description: 'Criar distribuidor' },
    { method: 'GET', path: '/api/goals', description: 'Listar metas' },
    { method: 'POST', path: '/api/goals', description: 'Criar meta' },
    { method: 'GET', path: '/api/events', description: 'Listar eventos' },
    { method: 'POST', path: '/api/events', description: 'Criar evento' },
    { method: 'GET', path: '/api/notifications', description: 'Listar notificações' },
    { method: 'GET', path: '/api/price-list', description: 'Listar lista de preços' },
    { method: 'POST', path: '/api/price-list', description: 'Criar lista de preços' }
  ];
  
  res.json({
    success: true,
    message: 'Rotas disponíveis na API',
    total: routes.length,
    routes: routes,
    timestamp: new Date().toISOString()
  });
});


// Middleware de tratamento de erro global
app.use((err, req, res, next) => {
  console.error('Erro capturado pelo middleware global:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Para Vercel - não usar app.listen() em produção
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Servidor SellOne funcionando na porta ${PORT}`);
    console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Frontend: http://localhost:${PORT}`);
    console.log(`🔗 API: http://localhost:${PORT}/api`);
    console.log(`🔐 Login: admin@sellone.com / 123456`);
  });
}

module.exports = app;
