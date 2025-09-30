const mongoose = require('mongoose');
require('dotenv').config();

async function testMongoDB() {
  try {
    console.log('🔍 Testando conexão com MongoDB...');
    console.log('🔍 MONGODB_URI existe:', !!process.env.MONGODB_URI);
    
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI não configurada');
      return;
    }
    
    // Conectar ao MongoDB
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false
    });
    
    console.log('✅ MongoDB conectado com sucesso!');
    console.log('📊 Host:', conn.connection.host);
    console.log('📊 Database:', conn.connection.name);
    console.log('📊 State:', mongoose.connection.readyState);
    
    // Testar uma consulta simples
    const User = require('./models/User');
    const userCount = await User.countDocuments();
    console.log('👥 Total de usuários:', userCount);
    
    // Fechar conexão
    await mongoose.disconnect();
    console.log('✅ Conexão fechada');
    
  } catch (error) {
    console.error('❌ Erro ao conectar com MongoDB:', error.message);
    console.error('📋 Detalhes:', error);
  }
}

testMongoDB();
