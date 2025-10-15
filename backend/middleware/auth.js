const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    // Se não há token, retornar erro
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acesso obrigatório'
      });
    }

    // Verificar se é um token temporário (manter para compatibilidade temporária)
    if (token === 'dummy-token' || token === 'fake-token' || token.startsWith('temp-token-')) {
      // Apenas para desenvolvimento - remover em produção
      if (process.env.NODE_ENV === 'development') {
        req.user = {
          _id: '68c1afbcf906c14a8e7e8ff7',
          id: '68c1afbcf906c14a8e7e8ff7',
          name: 'Usuário Temporário',
          email: 'temp@example.com',
          role: 'admin'
        };
        return next();
      } else {
        return res.status(401).json({
          success: false,
          message: 'Token temporário não permitido em produção'
        });
      }
    }

    // Verificar JWT válido
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      
      if (!decoded.id) {
        return res.status(401).json({
          success: false,
          message: 'Token inválido - ID do usuário não encontrado'
        });
      }

      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Usuário inativo'
        });
      }

      req.user = user;
      next();
    } catch (jwtError) {
      console.log('Erro na validação JWT:', jwtError.message);
      return res.status(401).json({
        success: false,
        message: 'Token inválido ou expirado'
      });
    }
  } catch (error) {
    console.error('Erro na autenticação:', error);
    res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

// Middleware para verificar roles específicas
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Permissão insuficiente'
      });
    }

    next();
  };
};

module.exports = { auth, authorize };
