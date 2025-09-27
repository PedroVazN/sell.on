// Rota específica para /api
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// Middlewares CORS
app.use(cors({
  origin: [
    'https://sellonn.vercel.app',
    'https://sell.on',
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Carregar variáveis de ambiente
require('dotenv').config({ path: './.env' });

// Conexão com MongoDB
const connectDB = async () => {
  try {
    const atlasUri = process.env.MONGODB_URI;
    
    if (!atlasUri) {
      console.error('❌ MONGODB_URI não encontrada nas variáveis de ambiente');
      if (process.env.NODE_ENV === 'production') {
        console.log('⚠️  Continuando sem conexão com MongoDB em produção');
        return;
      }
      process.exit(1);
    }
    
    const conn = await mongoose.connect(atlasUri);
    console.log(`✅ MongoDB Atlas conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Erro ao conectar com MongoDB:', error.message);
    if (process.env.NODE_ENV === 'production') {
      console.log('⚠️  Continuando sem conexão com MongoDB em produção');
    }
  }
};

// Conectar ao MongoDB
connectDB();

// Rota principal da API
app.get('/', (req, res) => {
  res.json({
    message: 'Bem-vindo ao SellOne API',
    version: '1.0.0',
    status: 'online',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      test: '/test',
      testDb: '/test-db',
      clients: '/clients',
      products: '/products',
      distributors: '/distributors',
      sales: '/sales',
      proposals: '/proposals',
      events: '/events',
      goals: '/goals',
      users: '/users',
      notifications: '/notifications',
      priceList: '/price-list'
    }
  });
});

// Rota de teste
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Backend funcionando!', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rota de teste do banco
app.get('/test-db', async (req, res) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    
    res.json({
      message: 'Teste de conexão com MongoDB',
      connected: isConnected,
      state: mongoose.connection.readyState,
      host: mongoose.connection.host || 'N/A',
      database: mongoose.connection.name || 'N/A',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      message: 'Erro ao testar conexão com MongoDB',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Importar e usar as rotas
const clientsRouter = require('../routes/clients');
app.use('/clients', clientsRouter);

const eventsRouter = require('../routes/events');
app.use('/events', eventsRouter);

const goalsRouter = require('../routes/goals');
app.use('/goals', goalsRouter);

const notificationsRouter = require('../routes/notifications');
app.use('/notifications', notificationsRouter);

const usersRouter = require('../routes/users');
app.use('/users', usersRouter);

const productsRouter = require('../routes/products');
app.use('/products', productsRouter);

const distributorsRouter = require('../routes/distributors');
app.use('/distributors', distributorsRouter);

const salesRouter = require('../routes/sales');
app.use('/sales', salesRouter);

const proposalsRouter = require('../routes/proposals');
app.use('/proposals', proposalsRouter);

const priceListRouter = require('../routes/priceList');
app.use('/price-list', priceListRouter);

module.exports = app;
