const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { auth } = require('../middleware/auth');

// Aplicar middleware de autenticação em todas as rotas
router.use(auth);

// GET /api/users - Listar usuários (apenas admin)
router.get('/', async (req, res) => {
  try {
    // Verificar se é admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Apenas administradores podem listar usuários.'
      });
    }

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
      message: 'Erro interno do servidor'
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
    if (req.user._id !== req.params.id && req.user.role !== 'admin') {
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
    // Verificar se é admin
    if (req.user.role !== 'admin') {
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
    const { name, email, phone, address, isActive } = req.body;

    // Verificar se é o próprio usuário ou admin
    if (req.user._id !== req.params.id && req.user.role !== 'admin') {
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

    // Atualizar dados
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (address) user.address = address;
    if (isActive !== undefined && req.user.role === 'admin') user.isActive = isActive;

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
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Apenas administradores podem deletar usuários.'
      });
    }

    // Não permitir deletar a si mesmo
    if (req.user._id === req.params.id) {
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
    if (req.user.role !== 'admin') {
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