require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // MongoDB Atlas - usar apenas variável de ambiente
    const atlasUri = process.env.MONGODB_URI;
    
    if (!atlasUri) {
      console.error('❌ MONGODB_URI não encontrada no arquivo .env');
      console.log('💡 Crie um arquivo .env com: MONGODB_URI=sua_string_de_conexao');
      process.exit(1);
    }
    
    // MongoDB local como fallback
    const localUri = 'mongodb://localhost:27017/sellone';
    
    // Tentar primeiro MongoDB Atlas
    try {
      const conn = await mongoose.connect(atlasUri);
      console.log(`✅ MongoDB Atlas conectado: ${conn.connection.host}`);
      return;
    } catch (atlasError) {
      console.log('⚠️  MongoDB Atlas não disponível, tentando local...');
      console.log(`   Erro Atlas: ${atlasError.message}`);
    }
    
    // Tentar conectar com MongoDB local como fallback
    const conn = await mongoose.connect(localUri);
    console.log(`✅ MongoDB local conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Erro ao conectar com MongoDB:', error.message);
    console.log('💡 Dicas para resolver:');
    console.log('   1. Verifique se as credenciais do Atlas estão corretas no .env');
    console.log('   2. Configure o IP no MongoDB Atlas: https://www.mongodb.com/docs/atlas/security-whitelist/');
    console.log('   3. Ou instale MongoDB local: https://www.mongodb.com/try/download/community');
    console.log('   4. Verifique se a string MONGODB_URI está correta');
    process.exit(1);
  }
};

module.exports = connectDB;
