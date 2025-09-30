const https = require('https');

const BASE_URL = 'https://backend-sable-eta-89.vercel.app';

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'backend-sable-eta-89.vercel.app',
      port: 443,
      path: path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

async function testAPI() {
  console.log('🧪 Testando API no Vercel...\n');

  const endpoints = [
    '/api',
    '/api/test',
    '/api/products',
    '/api/clients',
    '/api/users'
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`🔍 Testando ${endpoint}...`);
      const result = await makeRequest(endpoint);
      
      if (result.status === 200) {
        console.log(`✅ ${endpoint}: ${result.status} - Success`);
        if (result.data.success) {
          console.log(`   📊 Success: ${result.data.success}`);
        }
        if (result.data.message) {
          console.log(`   📝 Message: ${result.data.message}`);
        }
      } else {
        console.log(`❌ ${endpoint}: ${result.status} - Error`);
        console.log(`   📝 Response: ${JSON.stringify(result.data, null, 2)}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint}: Error - ${error.message}`);
    }
    
    console.log('');
  }

  console.log('🏁 Teste concluído!');
}

testAPI().catch(console.error);
