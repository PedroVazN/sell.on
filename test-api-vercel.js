const https = require('https');

function testAPI() {
  console.log('🧪 Testando API no Vercel...\n');

  const testUrls = [
    'https://backend-sable-eta-89.vercel.app/',
    'https://backend-sable-eta-89.vercel.app/api',
    'https://backend-sable-eta-89.vercel.app/api/test',
    'https://backend-sable-eta-89.vercel.app/api/products',
    'https://backend-sable-eta-89.vercel.app/api/clients'
  ];

  testUrls.forEach((url, index) => {
    setTimeout(() => {
      console.log(`🔍 Testando ${url}...`);
      
      const options = {
        hostname: 'backend-sable-eta-89.vercel.app',
        port: 443,
        path: url.replace('https://backend-sable-eta-89.vercel.app', ''),
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
          if (res.statusCode === 200) {
            console.log(`✅ ${url}: ${res.statusCode} - Success`);
            try {
              const jsonData = JSON.parse(data);
              console.log(`   📊 Response:`, JSON.stringify(jsonData, null, 2));
            } catch (e) {
              console.log(`   📝 Response: ${data}`);
            }
          } else {
            console.log(`❌ ${url}: ${res.statusCode} - Error`);
            console.log(`   📝 Response: ${data}`);
          }
          console.log('');
        });
      });

      req.on('error', (error) => {
        console.log(`❌ ${url}: Error - ${error.message}`);
        console.log('');
      });

      req.setTimeout(10000, () => {
        req.destroy();
        console.log(`❌ ${url}: Timeout`);
        console.log('');
      });

      req.end();
    }, index * 2000); // Delay entre requests
  });
}

testAPI();
