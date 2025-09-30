const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// Middleware CORS
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Carregar variáveis de ambiente
require('dotenv').config();

// Conexão com MongoDB
const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      console.log('✅ MongoDB já conectado');
      return;
    }

    const atlasUri = process.env.MONGODB_URI;
    
    if (!atlasUri) {
      console.log('⚠️  MONGODB_URI não configurada - continuando sem banco');
      return;
    }
    
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
  } catch (error) {
    console.error('❌ Erro ao conectar com MongoDB:', error.message);
  }
};

// Conectar ao MongoDB
connectDB();

// Rota da API
app.get('/api', (req, res) => {
  res.json({
    message: 'Bem-vindo ao SellOne API',
    version: '1.0.0',
    status: 'online',
    timestamp: new Date().toISOString()
  });
});

// Rota na raiz para evitar 404
app.get('/', (req, res) => {
  res.json({
    message: 'Bem-vindo ao SellOne API',
    version: '1.0.0',
    status: 'online',
    timestamp: new Date().toISOString(),
    endpoints: {
      api: '/api',
      test: '/api/test',
      testDb: '/api/test-db',
      products: '/api/products',
      clients: '/api/clients',
      users: '/api/users',
      sales: '/api/sales',
      proposals: '/api/proposals',
      distributors: '/api/distributors',
      goals: '/api/goals',
      events: '/api/events',
      notifications: '/api/notifications',
      priceList: '/api/price-list'
    }
  });
});

// Rota de teste
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
    
    res.json({
      success: true,
      message: 'Teste de conexão com MongoDB',
      connected: isConnected,
      state: mongoose.connection.readyState,
      host: mongoose.connection.host || 'N/A',
      database: mongoose.connection.name || 'N/A',
      mongodbUri: process.env.MONGODB_URI ? 'Configurada' : 'Não configurada',
      environment: process.env.NODE_ENV,
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

// Importar e usar as rotas
const clientsRouter = require('../routes/clients');
app.use('/api/clients', clientsRouter);

const eventsRouter = require('../routes/events');
app.use('/api/events', eventsRouter);

const goalsRouter = require('../routes/goals');
app.use('/api/goals', goalsRouter);

const notificationsRouter = require('../routes/notifications');
app.use('/api/notifications', notificationsRouter);

const usersRouter = require('../routes/users');
app.use('/api/users', usersRouter);

const productsRouter = require('../routes/products');
app.use('/api/products', productsRouter);

const distributorsRouter = require('../routes/distributors');
app.use('/api/distributors', distributorsRouter);

const salesRouter = require('../routes/sales');
app.use('/api/sales', salesRouter);

const proposalsRouter = require('../routes/proposals');
app.use('/api/proposals', proposalsRouter);

const priceListRouter = require('../routes/priceList');
app.use('/api/price-list', priceListRouter);

// Rota de health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'API funcionando' });
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

module.exports = app;