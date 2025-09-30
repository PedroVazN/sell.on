const https = require('https');

function testVercelAPI() {
  console.log('🧪 Testando API no Vercel...\n');

  const options = {
    hostname: 'backend-sable-eta-89.vercel.app',
    port: 443,
    path: '/api',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const req = https.request(options, (res) => {
    let data = '';
    
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers:`, res.headers);
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response:', data);
      
      if (res.statusCode === 200) {
        console.log('✅ API funcionando!');
      } else {
        console.log('❌ API com problemas');
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Erro na requisição:', error.message);
  });

  req.setTimeout(10000, () => {
    req.destroy();
    console.log('❌ Timeout na requisição');
  });

  req.end();
}

testVercelAPI();
