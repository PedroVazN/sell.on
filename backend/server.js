const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

const app = express();

// Middlewares CORS - Configuração simplificada e permissiva
app.use((req, res, next) => {
  // Permitir todas as origins
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'false');
  res.header('Access-Control-Max-Age', '86400');
  
  // Responder imediatamente para requisições OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Middleware CORS adicional usando a biblioteca cors
app.use(cors({
  origin: '*', // Permitir todas as origins
  credentials: false,
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
      console.log('💡 Configure MONGODB_URI na Vercel ou no arquivo .env');
      if (process.env.NODE_ENV === 'production') {
        console.log('⚠️  Continuando sem conexão com MongoDB em produção');
        return;
      }
      process.exit(1);
    }
    
    const conn = await mongoose.connect(atlasUri);
    console.log(`✅ MongoDB Atlas conectado: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ Erro ao conectar com MongoDB:', error.message);
    if (process.env.NODE_ENV === 'production') {
      console.log('⚠️  Continuando sem conexão com MongoDB em produção');
    } else {
      process.exit(1);
    }
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

// ROTAS SIMPLES DE POST PARA TESTE (ANTES DAS ROTAS PRINCIPAIS)
// Rota simples para criar produto
app.post('/api/products', async (req, res) => {
  try {
    console.log('Dados recebidos para criar produto:', JSON.stringify(req.body, null, 2));
    
    const Product = require('./models/Product');
    const product = new Product(req.body);
    await product.save();
    
    res.status(201).json({
      success: true,
      message: 'Produto criado com sucesso',
      data: product
    });
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// Rota simples para criar cliente
app.post('/api/clients', async (req, res) => {
  try {
    console.log('Dados recebidos para criar cliente:', JSON.stringify(req.body, null, 2));
    
    const Client = require('./models/Client');
    const client = new Client(req.body);
    await client.save();
    
    res.status(201).json({
      success: true,
      message: 'Cliente criado com sucesso',
      data: client
    });
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
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
    message: 'Backend funcionando!', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rota de teste para verificar conexão com MongoDB
app.get('/api/test-db', async (req, res) => {
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

// ROTAS SIMPLES DE POST PARA TESTE
// Rota simples para criar produto
app.post('/api/products', async (req, res) => {
  try {
    console.log('Dados recebidos para criar produto:', JSON.stringify(req.body, null, 2));
    
    const Product = require('./models/Product');
    const product = new Product(req.body);
    await product.save();
    
    res.status(201).json({
      success: true,
      message: 'Produto criado com sucesso',
      data: product
    });
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// Rota simples para criar cliente
app.post('/api/clients', async (req, res) => {
  try {
    console.log('Dados recebidos para criar cliente:', JSON.stringify(req.body, null, 2));
    
    const Client = require('./models/Client');
    const client = new Client(req.body);
    await client.save();
    
    res.status(201).json({
      success: true,
      message: 'Cliente criado com sucesso',
      data: client
    });
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor SellOne funcionando na porta ${PORT}`);
  console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Frontend: http://localhost:${PORT}`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
  console.log(`🔐 Login: admin@sellone.com / 123456`);
});

module.exports = app;
