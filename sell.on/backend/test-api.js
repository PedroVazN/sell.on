// Script para testar a API localmente
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testAPI() {
  console.log('🧪 Testando API do SellOne...\n');

  const tests = [
    {
      name: 'Teste básico do servidor',
      url: `${BASE_URL}/api/test`,
      method: 'GET'
    },
    {
      name: 'Teste de conexão com MongoDB',
      url: `${BASE_URL}/api/test-db`,
      method: 'GET'
    },
    {
      name: 'Lista de rotas disponíveis',
      url: `${BASE_URL}/api/routes`,
      method: 'GET'
    },
    {
      name: 'Health check',
      url: `${BASE_URL}/health`,
      method: 'GET'
    },
    {
      name: 'Informações da API',
      url: `${BASE_URL}/api`,
      method: 'GET'
    }
  ];

  for (const test of tests) {
    try {
      console.log(`🔍 ${test.name}...`);
      const response = await axios({
        method: test.method,
        url: test.url,
        timeout: 5000
      });
      
      console.log(`✅ ${test.name}: ${response.status} - ${response.data.message || 'OK'}`);
      
      if (test.name === 'Lista de rotas disponíveis') {
        console.log(`   📊 Total de rotas: ${response.data.total}`);
      }
      
    } catch (error) {
      console.log(`❌ ${test.name}: ${error.message}`);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Data: ${JSON.stringify(error.response.data, null, 2)}`);
      }
    }
    console.log('');
  }

  console.log('🎉 Teste concluído!');
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  testAPI().catch(console.error);
}

module.exports = testAPI;
