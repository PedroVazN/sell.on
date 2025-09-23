// Configuração da API
const API_BASE_URL = 'http://localhost:3000/api';

// Estado da aplicação
let currentUser = null;
let authToken = null;

// Elementos DOM
const loginPage = document.getElementById('loginPage');
const registerPage = document.getElementById('registerPage');
const dashboardPage = document.getElementById('dashboardPage');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const toast = document.getElementById('toast');

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se há token salvo
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('currentUser');
    
    if (savedToken && savedUser) {
        authToken = savedToken;
        currentUser = JSON.parse(savedUser);
        showDashboard();
    } else {
        showLogin();
    }
    
    // Event listeners
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
});

// Funções de navegação
function showLogin() {
    hideAllPages();
    loginPage.classList.add('active');
}

function showRegister() {
    hideAllPages();
    registerPage.classList.add('active');
}

function showDashboard() {
    hideAllPages();
    dashboardPage.classList.add('active');
    loadDashboardData();
}

function hideAllPages() {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
}

// Função de login
async function handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(loginForm);
    const loginData = {
        email: formData.get('email'),
        password: formData.get('password')
    };
    
    setButtonLoading(loginForm.querySelector('.login-btn'), true);
    
    try {
        const response = await fetch(`${API_BASE_URL}/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            currentUser = result.data;
            authToken = 'dummy-token'; // Em produção, usar JWT real
            
            // Salvar no localStorage
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            localStorage.setItem('authToken', authToken);
            
            showToast('Login realizado com sucesso!', 'success');
            showDashboard();
        } else {
            showToast(result.message || 'Erro no login', 'error');
        }
    } catch (error) {
        console.error('Erro no login:', error);
        showToast('Erro de conexão. Tente novamente.', 'error');
    } finally {
        setButtonLoading(loginForm.querySelector('.login-btn'), false);
    }
}

// Função de registro
async function handleRegister(e) {
    e.preventDefault();
    
    const formData = new FormData(registerForm);
    const registerData = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        role: formData.get('role')
    };
    
    setButtonLoading(registerForm.querySelector('.login-btn'), true);
    
    try {
        const response = await fetch(`${API_BASE_URL}/users/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(registerData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast('Conta criada com sucesso! Faça login.', 'success');
            showLogin();
            // Limpar formulário
            registerForm.reset();
        } else {
            showToast(result.message || 'Erro no cadastro', 'error');
        }
    } catch (error) {
        console.error('Erro no registro:', error);
        showToast('Erro de conexão. Tente novamente.', 'error');
    } finally {
        setButtonLoading(registerForm.querySelector('.login-btn'), false);
    }
}

// Função de logout
function logout() {
    currentUser = null;
    authToken = null;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    showToast('Logout realizado com sucesso!', 'info');
    showLogin();
}

// Carregar dados do dashboard
async function loadDashboardData() {
    if (!currentUser) return;
    
    // Atualizar nome do usuário
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userRole').textContent = currentUser.role;
    
    try {
        // Carregar estatísticas reais
        await loadStats();
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
    }
}

// Carregar estatísticas
async function loadStats() {
    try {
        // Carregar contadores reais
        const [usersResponse, productsResponse, salesResponse] = await Promise.all([
            fetch(`${API_BASE_URL}/users`),
            fetch(`${API_BASE_URL}/products`),
            fetch(`${API_BASE_URL}/sales`)
        ]);
        
        const usersData = await usersResponse.json();
        const productsData = await productsResponse.json();
        const salesData = await salesResponse.json();
        
        document.getElementById('totalUsers').textContent = usersData.pagination?.total || 0;
        document.getElementById('totalProducts').textContent = productsData.pagination?.total || 0;
        document.getElementById('totalSales').textContent = salesData.pagination?.total || 0;
        
        // Calcular receita total
        let totalRevenue = 0;
        if (salesData.data) {
            totalRevenue = salesData.data.reduce((sum, sale) => sum + (sale.total || 0), 0);
        }
        document.getElementById('totalRevenue').textContent = `R$ ${totalRevenue.toLocaleString('pt-BR')}`;
        
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
        // Valores padrão em caso de erro
        document.getElementById('totalUsers').textContent = '0';
        document.getElementById('totalProducts').textContent = '0';
        document.getElementById('totalSales').textContent = '0';
        document.getElementById('totalRevenue').textContent = 'R$ 0';
    }
}

// Navegação entre seções
function showSection(sectionName) {
    // Ocultar todas as seções
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Ocultar todos os botões de navegação
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Mostrar seção selecionada
    document.getElementById(`${sectionName}Section`).classList.add('active');
    
    // Ativar botão de navegação
    event.target.classList.add('active');
    
    // Carregar dados da seção
    switch(sectionName) {
        case 'products':
            loadProducts();
            break;
        case 'sales':
            loadSales();
            break;
        case 'users':
            loadUsers();
            break;
    }
}

// Carregar produtos
async function loadProducts() {
    const productsGrid = document.getElementById('productsGrid');
    productsGrid.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i><br>Carregando produtos...</div>';
    
    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        const data = await response.json();
        
        if (data.success && data.data) {
            productsGrid.innerHTML = '';
            
            if (data.data.length === 0) {
                productsGrid.innerHTML = '<div class="loading">Nenhum produto encontrado</div>';
                return;
            }
            
            data.data.forEach(product => {
                const productCard = createProductCard(product);
                productsGrid.appendChild(productCard);
            });
            
            // Animar cards após carregamento
            setTimeout(() => animateCards(), 100);
        } else {
            productsGrid.innerHTML = '<div class="loading">Erro ao carregar produtos</div>';
        }
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        productsGrid.innerHTML = '<div class="loading">Erro de conexão</div>';
    }
}

// Criar card de produto
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'item-card';
    
    card.innerHTML = `
        <h3>${product.name}</h3>
        <p><strong>Categoria:</strong> ${product.category}</p>
        <p><strong>Estoque:</strong> ${product.stock?.current || 0}</p>
        <p class="price">R$ ${(product.price || 0).toLocaleString('pt-BR')}</p>
        <div class="item-actions">
            <button class="btn-edit" onclick="editProduct('${product._id}')">
                <i class="fas fa-edit"></i> Editar
            </button>
            <button class="btn-delete" onclick="deleteProduct('${product._id}')">
                <i class="fas fa-trash"></i> Excluir
            </button>
        </div>
    `;
    
    return card;
}

// Carregar vendas
async function loadSales() {
    const salesGrid = document.getElementById('salesGrid');
    salesGrid.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i><br>Carregando vendas...</div>';
    
    try {
        const response = await fetch(`${API_BASE_URL}/sales`);
        const data = await response.json();
        
        if (data.success && data.data) {
            salesGrid.innerHTML = '';
            
            if (data.data.length === 0) {
                salesGrid.innerHTML = '<div class="loading">Nenhuma venda encontrada</div>';
                return;
            }
            
            data.data.forEach(sale => {
                const saleCard = createSaleCard(sale);
                salesGrid.appendChild(saleCard);
            });
            
            // Animar cards após carregamento
            setTimeout(() => animateCards(), 100);
        } else {
            salesGrid.innerHTML = '<div class="loading">Erro ao carregar vendas</div>';
        }
    } catch (error) {
        console.error('Erro ao carregar vendas:', error);
        salesGrid.innerHTML = '<div class="loading">Erro de conexão</div>';
    }
}

// Criar card de venda
function createSaleCard(sale) {
    const card = document.createElement('div');
    card.className = 'item-card';
    
    const statusClass = sale.status === 'finalizada' ? 'completed' : 'pending';
    
    card.innerHTML = `
        <h3>Venda #${sale.saleNumber}</h3>
        <p><strong>Cliente:</strong> ${sale.customer?.name || 'N/A'}</p>
        <p><strong>Vendedor:</strong> ${sale.seller?.name || 'N/A'}</p>
        <p><strong>Itens:</strong> ${sale.items?.length || 0}</p>
        <p class="price">R$ ${(sale.total || 0).toLocaleString('pt-BR')}</p>
        <span class="status ${statusClass}">${sale.status || 'Pendente'}</span>
        <div class="item-actions">
            <button class="btn-edit" onclick="viewSale('${sale._id}')">
                <i class="fas fa-eye"></i> Ver
            </button>
        </div>
    `;
    
    return card;
}

// Carregar usuários
async function loadUsers() {
    const usersGrid = document.getElementById('usersGrid');
    usersGrid.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i><br>Carregando usuários...</div>';
    
    try {
        const response = await fetch(`${API_BASE_URL}/users`);
        const data = await response.json();
        
        if (data.success && data.data) {
            usersGrid.innerHTML = '';
            
            if (data.data.length === 0) {
                usersGrid.innerHTML = '<div class="loading">Nenhum usuário encontrado</div>';
                return;
            }
            
            data.data.forEach(user => {
                const userCard = createUserCard(user);
                usersGrid.appendChild(userCard);
            });
            
            // Animar cards após carregamento
            setTimeout(() => animateCards(), 100);
        } else {
            usersGrid.innerHTML = '<div class="loading">Erro ao carregar usuários</div>';
        }
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        usersGrid.innerHTML = '<div class="loading">Erro de conexão</div>';
    }
}

// Criar card de usuário
function createUserCard(user) {
    const card = document.createElement('div');
    card.className = 'item-card';
    
    const statusClass = user.isActive ? 'active' : 'inactive';
    
    card.innerHTML = `
        <h3>${user.name}</h3>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Role:</strong> ${user.role}</p>
        <p><strong>Telefone:</strong> ${user.phone || 'N/A'}</p>
        <span class="status ${statusClass}">${user.isActive ? 'Ativo' : 'Inativo'}</span>
        <div class="item-actions">
            <button class="btn-edit" onclick="editUser('${user._id}')">
                <i class="fas fa-edit"></i> Editar
            </button>
            <button class="btn-delete" onclick="deleteUser('${user._id}')">
                <i class="fas fa-trash"></i> Excluir
            </button>
        </div>
    `;
    
    return card;
}

// Funções de ação (placeholder)
function showProductForm() {
    showToast('Funcionalidade em desenvolvimento', 'info');
}

function showSaleForm() {
    showToast('Funcionalidade em desenvolvimento', 'info');
}

function showUserForm() {
    showToast('Funcionalidade em desenvolvimento', 'info');
}

function editProduct(id) {
    showToast(`Editando produto ${id}`, 'info');
}

function deleteProduct(id) {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
        showToast(`Produto ${id} excluído`, 'success');
    }
}

function viewSale(id) {
    showToast(`Visualizando venda ${id}`, 'info');
}

function editUser(id) {
    showToast(`Editando usuário ${id}`, 'info');
}

function deleteUser(id) {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
        showToast(`Usuário ${id} excluído`, 'success');
    }
}

// Utilitários
function setButtonLoading(button, loading) {
    const btnText = button.querySelector('.btn-text');
    const btnLoader = button.querySelector('.btn-loader');
    
    if (loading) {
        btnText.style.display = 'none';
        btnLoader.style.display = 'block';
        button.disabled = true;
    } else {
        btnText.style.display = 'block';
        btnLoader.style.display = 'none';
        button.disabled = false;
    }
}

function showToast(message, type = 'info') {
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function togglePassword(inputId = 'password') {
    const input = document.getElementById(inputId);
    const icon = input.parentElement.querySelector('.toggle-password i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Validações de formulário
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePassword(password) {
    return password.length >= 6;
}

// Adicionar validações em tempo real
document.addEventListener('DOMContentLoaded', function() {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            if (this.value && !validateEmail(this.value)) {
                this.style.borderColor = '#ff4757';
            } else {
                this.style.borderColor = '#e1e5e9';
            }
        });
    }
    
    if (passwordInput) {
        passwordInput.addEventListener('blur', function() {
            if (this.value && !validatePassword(this.value)) {
                this.style.borderColor = '#ff4757';
            } else {
                this.style.borderColor = '#e1e5e9';
            }
        });
    }
});

// Animações de entrada
function animateIn(element) {
    element.style.opacity = '0';
    element.style.transform = 'translateY(30px) scale(0.95)';
    
    setTimeout(() => {
        element.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        element.style.opacity = '1';
        element.style.transform = 'translateY(0) scale(1)';
    }, 100);
}

// Animação de entrada para cards
function animateCards() {
    const cards = document.querySelectorAll('.item-card, .stat-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// Aplicar animações quando as páginas são mostradas
document.addEventListener('DOMContentLoaded', function() {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.addEventListener('transitionend', function() {
            if (this.classList.contains('active')) {
                animateIn(this);
            }
        });
    });
});
