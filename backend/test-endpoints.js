const axios = require('axios');

const BASE_URL = 'https://backend-sable-eta-89.vercel.app/api';

async function testEndpoints() {
  console.log('🧪 Testando endpoints da API...\n');

  const endpoints = [
    { method: 'GET', path: '/', name: 'API Info' },
    { method: 'GET', path: '/test', name: 'Test Server' },
    { method: 'GET', path: '/test-db', name: 'Test Database' },
    { method: 'GET', path: '/routes', name: 'List Routes' },
    { method: 'GET', path: '/products', name: 'List Products' },
    { method: 'GET', path: '/clients', name: 'List Clients' },
    { method: 'GET', path: '/users', name: 'List Users' },
    { method: 'GET', path: '/sales', name: 'List Sales' },
    { method: 'GET', path: '/proposals', name: 'List Proposals' },
    { method: 'GET', path: '/distributors', name: 'List Distributors' },
    { method: 'GET', path: '/goals', name: 'List Goals' },
    { method: 'GET', path: '/events', name: 'List Events' },
    { method: 'GET', path: '/notifications', name: 'List Notifications' },
    { method: 'GET', path: '/price-list', name: 'List Price List' }
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`🔍 Testando ${endpoint.name} (${endpoint.method} ${endpoint.path})...`);
      
      const response = await axios({
        method: endpoint.method,
        url: `${BASE_URL}${endpoint.path}`,
        timeout: 10000
      });

      console.log(`✅ ${endpoint.name}: ${response.status} - ${response.data.success ? 'Success' : 'Error'}`);
      
      if (response.data.data && Array.isArray(response.data.data)) {
        console.log(`   📊 Dados encontrados: ${response.data.data.length} itens`);
      }
      
      if (response.data.pagination) {
        console.log(`   📄 Paginação: Página ${response.data.pagination.current} de ${response.data.pagination.pages} (Total: ${response.data.pagination.total})`);
      }

    } catch (error) {
      console.log(`❌ ${endpoint.name}: ${error.response?.status || 'Error'} - ${error.message}`);
      
      if (error.response?.data) {
        console.log(`   📝 Detalhes: ${JSON.stringify(error.response.data, null, 2)}`);
      }
    }
    
    console.log('');
  }

  console.log('🏁 Teste concluído!');
}

// Testar criação de dados
async function testCreateData() {
  console.log('🧪 Testando criação de dados...\n');

  try {
    // Testar criação de produto
    console.log('🔍 Criando produto de teste...');
    const productData = {
      name: 'Produto Teste',
      description: 'Produto criado para teste',
      price: 100.00,
      category: 'Teste',
      stock: {
        current: 10,
        min: 5,
        max: 50
      }
    };

    const productResponse = await axios.post(`${BASE_URL}/products`, productData);
    console.log('✅ Produto criado:', productResponse.data.data._id);

    // Testar criação de cliente
    console.log('🔍 Criando cliente de teste...');
    const clientData = {
      cnpj: '12345678000199',
      razaoSocial: 'Cliente Teste LTDA',
      nomeFantasia: 'Cliente Teste',
      contato: {
        nome: 'João Silva',
        email: 'joao@clienteteste.com',
        telefone: '11999999999'
      },
      endereco: {
        uf: 'SP',
        cidade: 'São Paulo'
      },
      classificacao: 'OUTROS'
    };

    const clientResponse = await axios.post(`${BASE_URL}/clients`, clientData);
    console.log('✅ Cliente criado:', clientResponse.data.data._id);

    // Testar criação de usuário
    console.log('🔍 Criando usuário de teste...');
    const userData = {
      name: 'Usuário Teste',
      email: 'teste@example.com',
      password: '123456',
      role: 'vendedor'
    };

    const userResponse = await axios.post(`${BASE_URL}/users/register`, userData);
    console.log('✅ Usuário criado:', userResponse.data.data._id);

  } catch (error) {
    console.log('❌ Erro ao criar dados:', error.response?.data || error.message);
  }
}

// Executar testes
if (require.main === module) {
  testEndpoints()
    .then(() => testCreateData())
    .catch(console.error);
}

module.exports = { testEndpoints, testCreateData };
