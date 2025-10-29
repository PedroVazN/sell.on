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

// Rota especial de recálculo de metas SEM autenticação
app.post('/api/goals/recalculate', async (req, res) => {
  try {
    const Goal = require('./models/Goal');
    const Proposal = require('./models/Proposal');
    
    console.log('🔄 Iniciando recálculo de metas...');
    
    const goals = await Goal.find({
      category: 'sales',
      unit: 'currency'
    });

    console.log(`📊 Encontradas ${goals.length} metas para recalcular`);

    const results = [];

    for (const goal of goals) {
      const vendorId = goal.assignedTo;
      
      const closedProposals = await Proposal.find({
        $or: [
          { 'createdBy._id': vendorId },
          { createdBy: vendorId }
        ],
        status: 'venda_fechada',
        createdAt: {
          $gte: new Date(goal.period.startDate),
          $lte: new Date(goal.period.endDate)
        }
      });

      const totalValue = closedProposals.reduce((sum, p) => sum + (p.total || 0), 0);
      const proposalIds = closedProposals.map(p => p._id.toString());

      const oldValue = goal.currentValue;
      goal.currentValue = totalValue;
      goal.progress.percentage = Math.min(100, (totalValue / goal.targetValue) * 100);
      goal.progress.countedProposals = proposalIds;
      
      goal.progress.milestones.push({
        date: new Date().toISOString().split('T')[0],
        value: totalValue,
        description: `Recálculo: ${closedProposals.length} vendas totalizando R$ ${totalValue.toLocaleString('pt-BR')}`
      });

      if (goal.currentValue >= goal.targetValue && goal.status === 'active') {
        goal.status = 'completed';
      }

      await goal.save();

      results.push({
        goalId: goal._id,
        title: goal.title,
        vendorId,
        oldValue,
        newValue: totalValue,
        proposalsCount: closedProposals.length,
        percentage: goal.progress.percentage
      });

      console.log(`✅ Meta "${goal.title}": R$ ${oldValue} → R$ ${totalValue} (${closedProposals.length} vendas)`);
    }

    res.json({
      success: true,
      message: 'Metas recalculadas com sucesso',
      data: results
    });
  } catch (error) {
    console.error('Erro ao recalcular metas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao recalcular metas',
      error: error.message
    });
  }
});

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

const aiRouter = require('./routes/ai');
app.use('/api/ai', aiRouter);

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
    let connectionError = null;
    
    // Se não estiver conectado, tentar conectar
    if (!isConnected && process.env.MONGODB_URI) {
      console.log('🔄 Tentando reconectar ao MongoDB...');
      try {
        await connectDB();
        console.log('✅ Reconexão bem-sucedida!');
      } catch (reconnectError) {
        console.log('❌ Falha na reconexão:', reconnectError.message);
        connectionError = reconnectError.message;
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
      connectionError: connectionError,
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

// Rota para testar conexão MongoDB diretamente
app.get('/api/force-connect', async (req, res) => {
  try {
    console.log('🔄 Forçando conexão MongoDB...');
    console.log('🔍 MONGODB_URI existe:', !!process.env.MONGODB_URI);
    console.log('🔍 NODE_ENV:', process.env.NODE_ENV);
    
    if (!process.env.MONGODB_URI) {
      return res.json({
        success: false,
        message: 'MONGODB_URI não configurada',
        error: 'Variável de ambiente MONGODB_URI não encontrada'
      });
    }

    // Tentar conectar diretamente
    const mongoose = require('mongoose');
    
    // Fechar conexão existente se houver
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    
    // Conectar novamente
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false
    });
    
    res.json({
      success: true,
      message: 'Conexão MongoDB estabelecida com sucesso!',
      connected: true,
      host: conn.connection.host,
      database: conn.connection.name,
      state: mongoose.connection.readyState
    });
    
  } catch (error) {
    console.error('❌ Erro na conexão:', error);
    res.json({
      success: false,
      message: 'Erro ao conectar com MongoDB',
      error: error.message,
      code: error.code,
      name: error.name
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
