// Teste simples do backend
const https = require('https');

const BACKEND_URL = 'https://backend-sable-eta-89.vercel.app';

console.log('🧪 Testando Backend...\n');

function testEndpoint(endpoint, description) {
  return new Promise((resolve) => {
    const url = `${BACKEND_URL}${endpoint}`;
    console.log(`Testando: ${description}`);
    console.log(`URL: ${url}`);
    
    const req = https.request(url, { method: 'GET' }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        if (res.statusCode === 200) {
          try {
            const jsonData = JSON.parse(data);
            console.log(`Resposta: ${JSON.stringify(jsonData, null, 2)}`);
          } catch (e) {
            console.log(`Resposta: ${data}`);
          }
          console.log('✅ Sucesso!\n');
          resolve(true);
        } else {
          console.log(`❌ Erro ${res.statusCode}: ${data}\n`);
          resolve(false);
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ Erro de conexão: ${error.message}\n`);
      resolve(false);
    });
    
    req.setTimeout(10000, () => {
      console.log('❌ Timeout\n');
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

async function runTests() {
  const tests = [
    { endpoint: '/', description: 'Rota raiz' },
    { endpoint: '/api', description: 'API principal' },
    { endpoint: '/health', description: 'Health check' },
    { endpoint: '/api/test', description: 'Teste da API' }
  ];
  
  let successCount = 0;
  
  for (const test of tests) {
    const success = await testEndpoint(test.endpoint, test.description);
    if (success) successCount++;
  }
  
  console.log(`📊 Resultado: ${successCount}/${tests.length} testes passaram`);
  
  if (successCount === 0) {
    console.log('\n❌ Backend não está respondendo. Verifique se o deploy foi feito corretamente.');
  } else if (successCount < tests.length) {
    console.log('\n⚠️  Alguns endpoints não estão funcionando.');
  } else {
    console.log('\n🎉 Backend funcionando perfeitamente!');
  }
}

runTests().catch(console.error);
