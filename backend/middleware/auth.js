const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    // Se não há token, usar usuário temporário (para desenvolvimento e produção sem auth)
    if (!token) {
      req.user = {
        _id: '68c1afbcf906c14a8e7e8ff7', // ObjectId válido do MongoDB
        id: '68c1afbcf906c14a8e7e8ff7', // Compatibilidade
        name: 'Usuário Temporário',
        email: 'temp@example.com',
        role: 'admin'
      };
      return next();
    }

    // Verificar se é um token temporário válido
    if (token === 'dummy-token' || token === 'fake-token' || token.startsWith('temp-token-')) {
      req.user = {
        _id: '68c1afbcf906c14a8e7e8ff7', // ObjectId válido do MongoDB
        id: '68c1afbcf906c14a8e7e8ff7', // Compatibilidade
        name: 'Usuário Temporário',
        email: 'temp@example.com',
        role: 'admin'
      };
      return next();
    }

    // Tentar verificar como JWT
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Token inválido ou usuário inativo'
        });
      }

      req.user = user;
      next();
    } catch (jwtError) {
      // Se não for um JWT válido, usar usuário temporário
      console.log('Token não é JWT válido, usando usuário temporário:', jwtError.message);
      req.user = {
        _id: '68c1afbcf906c14a8e7e8ff7',
        id: '68c1afbcf906c14a8e7e8ff7',
        name: 'Usuário Temporário',
        email: 'temp@example.com',
        role: 'admin'
      };
      next();
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
