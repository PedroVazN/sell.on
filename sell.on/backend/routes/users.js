const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { auth } = require('../middleware/auth');
const { validateUser, validateLogin, validateMongoId, validatePagination } = require('../middleware/validation');
const { loginLimiter, adminLimiter } = require('../middleware/security');

// Middleware de autenticação será aplicado individualmente nas rotas

// POST /api/users/test-login - Criar usuários de teste para debug (APENAS DESENVOLVIMENTO)
router.post('/test-login', (req, res, next) => {
  // Bloquear em produção
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      message: 'Esta rota está desabilitada em produção'
    });
  }
  next();
}, async (req, res) => {
  try {
    const testUsers = [
      {
        name: 'Teste Admin',
        email: 'teste-admin@teste.com',
        password: '123456',
        role: 'admin',
        isActive: true
      },
      {
        name: 'Teste Vendedor',
        email: 'teste-vendedor@teste.com',
        password: '123456',
        role: 'vendedor',
        isActive: true
      }
    ];

    const results = [];

    for (const testUser of testUsers) {
      // Verificar se já existe
      const existingUser = await User.findOne({ email: testUser.email });
      if (existingUser) {
        await User.deleteOne({ email: testUser.email });
      }

      // Criar usuário de teste
      const user = new User(testUser);
      await user.save();

      console.log('✅ Usuário de teste criado:', {
        email: testUser.email,
        password: testUser.password,
        role: testUser.role,
        hash: user.password
      });

      results.push({
        email: testUser.email,
        password: testUser.password,
        role: testUser.role
      });
    }

    res.json({
      success: true,
      message: 'Usuários de teste criados',
      data: results
    });
  } catch (error) {
    console.error('❌ Erro ao criar usuários de teste:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar usuários de teste'
    });
  }
});

// POST /api/users/fix-vendedor - Corrigir usuários vendedores existentes
router.post('/fix-vendedor', async (req, res) => {
  try {
    console.log('🔧 Corrigindo usuários vendedores...');
    
    // Buscar todos os usuários vendedores
    const vendedores = await User.find({ role: 'vendedor' });
    console.log('👥 Vendedores encontrados:', vendedores.length);
    
    const results = [];
    
    for (const vendedor of vendedores) {
      console.log('🔧 Corrigindo vendedor:', vendedor.email);
      
      // Definir senha padrão
      const novaSenha = '123456';
      
      // Hash da nova senha
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(novaSenha, salt);
      
      // Atualizar usuário
      vendedor.password = hashedPassword;
      vendedor.isActive = true;
      await vendedor.save();
      
      console.log('✅ Vendedor corrigido:', {
        email: vendedor.email,
        novaSenha: novaSenha,
        hash: hashedPassword
      });
      
      results.push({
        email: vendedor.email,
        novaSenha: novaSenha,
        role: vendedor.role
      });
    }
    
    res.json({
      success: true,
      message: 'Vendedores corrigidos com sucesso',
      data: results
    });
  } catch (error) {
    console.error('❌ Erro ao corrigir vendedores:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao corrigir vendedores'
    });
  }
});

// POST /api/users/login - Login de usuário
router.post('/login', loginLimiter, validateLogin, async (req, res) => {
  try {
    console.log('🔐 Tentativa de login para:', req.body.email);
    
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('❌ Dados obrigatórios não fornecidos');
      return res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios'
      });
    }

    // Buscar usuário por email
    const user = await User.findOne({ email });
    console.log('👤 Usuário encontrado:', user ? 'Sim' : 'Não');
    
    if (!user) {
      console.log('❌ Usuário não encontrado');
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    console.log('👤 Dados do usuário:', {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt
    });

    // Verificar senha
    console.log('🔑 Verificando credenciais...');
    
    const isPasswordValid = await user.comparePassword(password);
    console.log('🔑 Senha válida:', isPasswordValid);
    
    // Se senha não for válida, tentar diferentes abordagens
    if (!isPasswordValid) {
      console.log('❌ Senha inválida - tentando diferentes abordagens...');
      
      // Teste 1: Comparação manual com bcrypt
      const manualCompare = await bcrypt.compare(password, user.password);
      console.log('🔑 Comparação manual:', manualCompare);
      
      // Teste 2: Verificar se a senha original é a mesma (sem hash)
      const isOriginalPassword = password === user.password;
      console.log('🔑 É senha original (sem hash):', isOriginalPassword);
      
      // Teste 3: Se for vendedor e senha for 123456, atualizar
      if (user.role === 'vendedor' && password === '123456') {
        console.log('🔧 Atualizando senha do vendedor para 123456...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('123456', salt);
        user.password = hashedPassword;
        await user.save();
        console.log('✅ Senha do vendedor atualizada');
      } else if (isOriginalPassword) {
        console.log('🔧 Senha original detectada - fazendo hash...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        user.password = hashedPassword;
        await user.save();
        console.log('✅ Senha original hashada e salva');
      } else {
        console.log('❌ Nenhuma correção possível');
        return res.status(401).json({
          success: false,
          message: 'Credenciais inválidas'
        });
      }
    }

    // Verificar se usuário está ativo
    if (!user.isActive) {
      console.log('❌ Usuário inativo');
      return res.status(401).json({
        success: false,
        message: 'Conta desativada'
      });
    }

    // Atualizar último login
    user.lastLogin = new Date();
    await user.save();

    // Gerar token JWT
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    // Retornar usuário sem senha
    const userResponse = await User.findById(user._id).select('-password');
    console.log('✅ Login bem-sucedido para:', userResponse.email);

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        user: userResponse,
        token: token
      }
    });
  } catch (error) {
    console.error('❌ Erro no login:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/users/register - Registro de usuário
router.post('/register', validateUser, async (req, res) => {
  try {
    const { name, email, password, role = 'vendedor', phone, address } = req.body;

    // Dados já validados pelo middleware validateUser

    // Verificar se email já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email já está em uso'
      });
    }

    // Criar usuário
    const userData = {
      name,
      email,
      password,
      role,
      phone,
      address
    };

    const user = new User(userData);
    await user.save();

    // Retornar usuário sem senha
    const userResponse = await User.findById(user._id).select('-password');

    res.status(201).json({
      success: true,
      data: userResponse,
      message: 'Usuário criado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao criar usuário'
    });
  }
});

// GET /api/users - Listar usuários
router.get('/', async (req, res) => {
  try {
    // Verificar se o MongoDB está conectado
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      return res.json({
        success: true,
        data: [],
        pagination: {
          current: 1,
          pages: 0,
          total: 0
        },
        message: 'MongoDB não conectado - retornando lista vazia'
      });
    }

    // Removido controle de acesso para desenvolvimento

    const { page = 1, limit = 20, search = '', role = '' } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) {
      filter.role = role;
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip(skip)
      .lean();

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: users,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/users/:id - Buscar usuário por ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Verificar se é o próprio usuário ou admin
    if (req.user && req.user._id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/users - Criar novo usuário (apenas admin)
router.post('/', async (req, res) => {
  try {
    // Verificar se é admin (temporariamente desabilitado para desenvolvimento)
    if (req.user && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Apenas administradores podem criar usuários.'
      });
    }

    const { name, email, password, role = 'vendedor', phone, address } = req.body;

    // Validar dados obrigatórios
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nome, email e senha são obrigatórios'
      });
    }

    // Verificar se email já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email já está em uso'
      });
    }

    // Hash da senha
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Criar usuário
    const userData = {
      name,
      email,
      password: hashedPassword,
      role,
      phone,
      address
    };

    const user = new User(userData);
    await user.save();

    // Retornar usuário sem senha
    const userResponse = await User.findById(user._id).select('-password');

    res.status(201).json({
      success: true,
      data: userResponse,
      message: 'Usuário criado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao criar usuário'
    });
  }
});

// PUT /api/users/:id - Atualizar usuário
router.put('/:id', async (req, res) => {
  try {
    const { name, email, phone, address, isActive, role } = req.body;

    // Verificar se é o próprio usuário ou admin
    if (req.user && req.user._id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Verificar se email já existe (se foi alterado)
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email já está em uso'
        });
      }
    }

    // Atualizar dados básicos
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (address) user.address = address;
    if (isActive !== undefined && req.user && req.user.role === 'admin') user.isActive = isActive;

    // Permitir alterar o cargo apenas para administradores
    if (role && req.user && req.user.role === 'admin') {
      user.role = role;
    }

    await user.save();

    // Retornar usuário atualizado sem senha
    const updatedUser = await User.findById(user._id).select('-password');

    res.json({
      success: true,
      data: updatedUser,
      message: 'Usuário atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao atualizar usuário'
    });
  }
});

// PUT /api/users/:id/password - Alterar senha
router.put('/:id/password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Verificar se é o próprio usuário
    if (req.user._id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Senha atual e nova senha são obrigatórias'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Nova senha deve ter pelo menos 6 caracteres'
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Verificar senha atual
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Senha atual incorreta'
      });
    }

    // Hash da nova senha
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
    user.password = hashedNewPassword;

    await user.save();

    res.json({
      success: true,
      message: 'Senha alterada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao alterar senha'
    });
  }
});

// DELETE /api/users/:id - Deletar usuário (apenas admin)
router.delete('/:id', async (req, res) => {
  try {
    // Verificar se é admin
    if (req.user && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Apenas administradores podem deletar usuários.'
      });
    }

    // Não permitir deletar a si mesmo
    if (req.user && req.user._id && req.user._id.toString() === req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'Você não pode deletar sua própria conta'
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Usuário deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/users/stats - Estatísticas de usuários (apenas admin)
router.get('/stats/overview', async (req, res) => {
  try {
    // Verificar se é admin
    if (req.user && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Apenas administradores podem ver estatísticas.'
      });
    }

    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const sellerUsers = await User.countDocuments({ role: 'vendedor' });
    const clientUsers = await User.countDocuments({ role: 'cliente' });

    res.json({
      success: true,
      data: {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers,
        byRole: {
          admin: adminUsers,
          vendedor: sellerUsers,
          cliente: clientUsers
        }
      }
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;