// Teste de integração entre frontend e backend
const https = require('https');

const BACKEND_URL = 'https://backend-sable-eta-89.vercel.app';
const FRONTEND_URL = 'https://sellonn.vercel.app';

console.log('🧪 Testando integração entre Frontend e Backend...\n');

// Função para fazer requisições HTTPS
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', reject);
    req.setTimeout(10000, () => reject(new Error('Timeout')));
    req.end();
  });
}

async function testBackend() {
  console.log('🔍 Testando Backend...');
  
  try {
    // Teste 1: Health Check
    console.log('  ✓ Testando health check...');
    const health = await makeRequest(`${BACKEND_URL}/health`);
    console.log(`    Status: ${health.status} - ${health.data.message}`);
    
    // Teste 2: API Test
    console.log('  ✓ Testando API...');
    const api = await makeRequest(`${BACKEND_URL}/api/test`);
    console.log(`    Status: ${api.status} - ${api.data.message}`);
    
    // Teste 3: CORS Headers
    console.log('  ✓ Testando CORS...');
    const corsTest = await makeRequest(`${BACKEND_URL}/api`, {
      headers: {
        'Origin': FRONTEND_URL,
        'Access-Control-Request-Method': 'GET'
      }
    });
    console.log(`    Status: ${corsTest.status}`);
    
    console.log('✅ Backend funcionando corretamente!\n');
    return true;
  } catch (error) {
    console.log(`❌ Erro no Backend: ${error.message}\n`);
    return false;
  }
}

async function testFrontend() {
  console.log('🔍 Testando Frontend...');
  
  try {
    const response = await makeRequest(FRONTEND_URL);
    console.log(`    Status: ${response.status}`);
    
    if (response.status === 200) {
      console.log('✅ Frontend funcionando corretamente!\n');
      return true;
    } else {
      console.log('❌ Frontend com problemas!\n');
      return false;
    }
  } catch (error) {
    console.log(`❌ Erro no Frontend: ${error.message}\n`);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Iniciando testes de integração...\n');
  
  const backendOk = await testBackend();
  const frontendOk = await testFrontend();
  
  console.log('📊 Resultado dos Testes:');
  console.log(`  Backend: ${backendOk ? '✅ OK' : '❌ FALHOU'}`);
  console.log(`  Frontend: ${frontendOk ? '✅ OK' : '❌ FALHOU'}`);
  
  if (backendOk && frontendOk) {
    console.log('\n🎉 Integração funcionando perfeitamente!');
    console.log(`   Frontend: ${FRONTEND_URL}`);
    console.log(`   Backend: ${BACKEND_URL}`);
  } else {
    console.log('\n⚠️  Alguns testes falharam. Verifique as configurações.');
  }
}

runTests().catch(console.error);
