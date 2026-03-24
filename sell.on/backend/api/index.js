const express = require('express');
const mongoose = require('mongoose');
const { 
  securityHeaders, 
  generalLimiter, 
  corsConfig, 
  additionalSecurityHeaders, 
  securityLogger 
} = require('../middleware/security');
const { 
  secureLogger, 
  securityMonitor, 
  authLogger 
} = require('../middleware/secureLogging');

const app = express();

// Middleware de segurança (aplicar primeiro)
app.use(securityHeaders);
app.use(securityLogger);
app.use(additionalSecurityHeaders);

// Middleware de logging seguro
app.use(secureLogger);
app.use(securityMonitor);
app.use(authLogger);

// Rate limiting geral
app.use('/api', generalLimiter);

// CORS configurado adequadamente
app.use(corsConfig);

// Parsers de body
app.use(express.json({ limit: '10mb' })); // Limite de 10MB para uploads
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Carregar variáveis de ambiente
require('dotenv').config();

// Conexão com MongoDB
const connectDB = async () => {
  try {
    console.log('🔄 Iniciando conexão com MongoDB...');
    console.log('🔍 Estado atual:', mongoose.connection.readyState);
    console.log('🔍 MONGODB_URI existe:', !!process.env.MONGODB_URI);
    
    if (mongoose.connection.readyState === 1) {
      console.log('✅ MongoDB já conectado');
      return;
    }

    const atlasUri = process.env.MONGODB_URI;
    
    console.log('🔍 Verificando variáveis de ambiente:');
    console.log('🔍 NODE_ENV:', process.env.NODE_ENV);
    console.log('🔍 MONGODB_URI existe:', !!atlasUri);
    console.log('🔍 MONGODB_URI length:', atlasUri ? atlasUri.length : 0);
    
    if (!atlasUri) {
      console.log('⚠️  MONGODB_URI não configurada - continuando sem banco de dados');
      console.log('💡 Configure MONGODB_URI no Vercel ou crie um arquivo .env');
      return;
    }
    
    console.log('🔍 String de conexão configurada:', !!atlasUri);
    
    // Fechar conexão existente se houver
    if (mongoose.connection.readyState !== 0) {
      console.log('🔄 Fechando conexão existente...');
      await mongoose.disconnect();
    }
    
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000, // Aumentar timeout
      socketTimeoutMS: 45000,
      bufferCommands: false,
      retryWrites: true,
      w: 'majority'
    };
    
    console.log('🔄 Tentando conectar com opções:', options);
    const conn = await mongoose.connect(atlasUri, options);
    console.log(`✅ MongoDB Atlas conectado: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`📊 Estado: ${mongoose.connection.readyState}`);
  } catch (error) {
    console.error('❌ Erro ao conectar com MongoDB:', error.message);
    console.error('📋 Detalhes do erro:', error);
  }
};

// Conectar ao MongoDB
(async () => {
  try {
    await connectDB();
  } catch (error) {
    console.error('❌ Erro ao conectar com MongoDB:', error);
  }
})();

// Middleware para garantir conexão com MongoDB em cada requisição
app.use(async (req, res, next) => {
  console.log('🔍 Middleware - Estado MongoDB:', mongoose.connection.readyState);
  console.log('🔍 Middleware - MONGODB_URI existe:', !!process.env.MONGODB_URI);
  
  // Se não estiver conectado, tentar conectar
  if (mongoose.connection.readyState !== 1 && process.env.MONGODB_URI) {
    try {
      console.log('🔄 Middleware - Tentando reconectar ao MongoDB...');
      await connectDB();
      console.log('✅ Middleware - Reconexão bem-sucedida!');
    } catch (error) {
      console.log('❌ Middleware - Falha na reconexão:', error.message);
    }
  }
  next();
});

// Rota da API
app.get('/api', (req, res) => {
  console.log('🔍 Rota /api chamada');
  res.json({
    message: 'Bem-vindo ao SellOne API',
    version: '1.0.0',
    status: 'online',
    timestamp: new Date().toISOString()
  });
});

// Rota na raiz para evitar 404
app.get('/', (req, res) => {
  console.log('🔍 Rota raiz / chamada');
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
      priceList: '/api/price-list',
      ai: '/api/ai',
      funnel: '/api/funnel'
    }
  });
});

// Rota de teste
app.get('/api/test', (req, res) => {
  console.log('🔍 Rota /api/test chamada');
  res.json({ 
    success: true,
    message: 'Backend funcionando perfeitamente!', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    status: 'online'
  });
});

// Rota de teste para verificar conexão com MongoDB (APENAS DESENVOLVIMENTO)
app.get('/api/test-db', (req, res, next) => {
  // Bloquear em produção
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      message: 'Esta rota está desabilitada em produção'
    });
  }
  next();
}, async (req, res) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    
    res.json({
      success: true,
      message: 'Teste de conexão com MongoDB',
      connected: isConnected,
      state: mongoose.connection.readyState,
      host: '***',
      database: '***',
      mongodbUri: '***',
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

// Rota para forçar reconexão com MongoDB (APENAS DESENVOLVIMENTO)
app.get('/api/force-connect', (req, res, next) => {
  // Bloquear em produção
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      message: 'Esta rota está desabilitada em produção'
    });
  }
  next();
}, async (req, res) => {
  try {
    console.log('🔄 Forçando conexão MongoDB...');
    console.log('🔍 Estado atual:', mongoose.connection.readyState);
    
    if (!process.env.MONGODB_URI) {
      return res.json({
        success: false,
        message: 'MONGODB_URI não configurada',
        error: 'Variável de ambiente MONGODB_URI não encontrada'
      });
    }

    // Fechar conexão existente se houver
    if (mongoose.connection.readyState !== 0) {
      console.log('🔄 Fechando conexão existente...');
      await mongoose.disconnect();
    }
    
    // Conectar novamente com configurações otimizadas
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 15000, // Aumentar timeout
      socketTimeoutMS: 45000,
      bufferCommands: false,
      retryWrites: true,
      w: 'majority'
    });
    
    console.log('✅ Conexão estabelecida com sucesso!');
    
    // Testar uma consulta simples
    const User = require('../models/User');
    const userCount = await User.countDocuments();
    console.log('👥 Total de usuários encontrados:', userCount);
    
    res.json({
      success: true,
      message: 'Conexão MongoDB estabelecida com sucesso!',
      connected: true,
      host: '***',
      database: '***',
      state: mongoose.connection.readyState,
      userCount: userCount
    });
    
  } catch (error) {
    console.error('❌ Erro na conexão:', error);
    res.json({
      success: false,
      message: 'Erro ao conectar com MongoDB',
      error: error.message,
      code: error.code,
      name: error.name,
      stack: error.stack
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

const proposalChatsRouter = require('../routes/proposalChats');
app.use('/api/proposal-chats', proposalChatsRouter);

let aiRouter;
try {
  aiRouter = require('../routes/ai');
} catch (error) {
  console.error('❌ Erro ao carregar rotas de IA:', error);
  console.error('Stack:', error.stack);
  // Criar um router vazio para evitar crash do servidor
  const express = require('express');
  aiRouter = express.Router();
  aiRouter.get('*', (req, res) => {
    res.status(500).json({
      success: false,
      error: 'Rotas de IA temporariamente indisponíveis',
      message: error.message
    });
  });
}
app.use('/api/ai', aiRouter);

const priceListRouter = require('../routes/priceList');
app.use('/api/price-list', priceListRouter);

const funnelRouter = require('../routes/funnel');
app.use('/api/funnel', funnelRouter);

const noticesRouter = require('../routes/notices');
app.use('/api/notices', noticesRouter);

const verseRouter = require('../routes/verse');
app.use('/api/verse', verseRouter);

const checklistRouter = require('../routes/checklist');
app.use('/api/checklist', checklistRouter);

const cnpjRouter = require('../routes/cnpj');
app.use('/api/cnpj', cnpjRouter);

const videoRouter = require('../routes/video');
app.use('/api/video', videoRouter);

const analysisRouter = require('../routes/analysis');
app.use('/api/analysis', analysisRouter);

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