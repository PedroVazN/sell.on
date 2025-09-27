// Teste completo da API
const https = require('https');

const BASE_URL = 'https://backend-sable-eta-89.vercel.app';

console.log('🧪 Testando API do SellOne...\n');

function testEndpoint(endpoint, description) {
  return new Promise((resolve) => {
    const url = `${BASE_URL}${endpoint}`;
    console.log(`🔍 Testando: ${description}`);
    console.log(`   URL: ${url}`);
    
    const req = https.request(url, { method: 'GET' }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`   Status: ${res.statusCode}`);
        if (res.statusCode === 200) {
          try {
            const jsonData = JSON.parse(data);
            console.log(`   ✅ Resposta: ${jsonData.message || 'Sucesso'}`);
            if (jsonData.endpoints) {
              console.log(`   📋 Endpoints disponíveis: ${Object.keys(jsonData.endpoints).length}`);
            }
          } catch (e) {
            console.log(`   ✅ Resposta: ${data.substring(0, 100)}...`);
          }
          console.log('');
          resolve(true);
        } else {
          console.log(`   ❌ Erro ${res.statusCode}: ${data.substring(0, 100)}...`);
          console.log('');
          resolve(false);
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`   ❌ Erro de conexão: ${error.message}`);
      console.log('');
      resolve(false);
    });
    
    req.setTimeout(15000, () => {
      console.log('   ❌ Timeout (15s)');
      console.log('');
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

async function runTests() {
  console.log('🚀 Iniciando testes da API...\n');
  
  const tests = [
    { endpoint: '/', description: 'Rota raiz' },
    { endpoint: '/api', description: 'API principal (/api)' },
    { endpoint: '/api/test', description: 'Teste da API' },
    { endpoint: '/health', description: 'Health check' }
  ];
  
  let successCount = 0;
  
  for (const test of tests) {
    const success = await testEndpoint(test.endpoint, test.description);
    if (success) successCount++;
    
    // Aguardar 1 segundo entre testes
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('📊 Resultado dos Testes:');
  console.log(`   ✅ Sucessos: ${successCount}/${tests.length}`);
  console.log(`   ❌ Falhas: ${tests.length - successCount}/${tests.length}`);
  
  if (successCount === tests.length) {
    console.log('\n🎉 API funcionando perfeitamente!');
    console.log(`   🌐 Frontend: https://sellonn.vercel.app`);
    console.log(`   🔗 Backend: ${BASE_URL}`);
    console.log(`   📡 API: ${BASE_URL}/api`);
  } else if (successCount > 0) {
    console.log('\n⚠️  API parcialmente funcionando.');
    console.log('   Alguns endpoints podem estar com problemas.');
  } else {
    console.log('\n❌ API não está respondendo.');
    console.log('   Verifique se o deploy foi feito corretamente.');
  }
}

runTests().catch(console.error);
