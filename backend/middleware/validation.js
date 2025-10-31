const { body, param, query, validationResult } = require('express-validator');

// Middleware para verificar erros de validação
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Validações para usuários
const validateUser = [
  body('name')
    .notEmpty()
    .withMessage('Nome é obrigatório')
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres')
    .escape(), // Sanitiza contra XSS

  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(), // Sanitiza email

  body('password')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula e 1 número'),

  body('role')
    .optional()
    .isIn(['admin', 'vendedor', 'cliente'])
    .withMessage('Role deve ser: admin, vendedor ou cliente'),

  body('phone')
    .optional()
    .isMobilePhone('pt-BR')
    .withMessage('Telefone inválido'),

  handleValidationErrors
];

// Validações para login
const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Senha é obrigatória')
    .isLength({ min: 1 })
    .withMessage('Senha não pode estar vazia'),

  handleValidationErrors
];

// Validações para clientes
const validateClient = [
  body('name')
    .notEmpty()
    .withMessage('Nome do cliente é obrigatório')
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres')
    .escape(),

  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),

  body('phone')
    .optional()
    .isMobilePhone('pt-BR')
    .withMessage('Telefone inválido'),

  body('address.street')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Rua deve ter no máximo 200 caracteres')
    .escape(),

  body('address.city')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Cidade deve ter no máximo 100 caracteres')
    .escape(),

  body('address.state')
    .optional()
    .isLength({ max: 2 })
    .withMessage('Estado deve ter 2 caracteres')
    .escape(),

  body('address.zipCode')
    .optional()
    .isPostalCode('BR')
    .withMessage('CEP inválido'),

  handleValidationErrors
];

// Validações para produtos
const validateProduct = [
  body('name')
    .notEmpty()
    .withMessage('Nome do produto é obrigatório')
    .isLength({ min: 2, max: 200 })
    .withMessage('Nome deve ter entre 2 e 200 caracteres')
    .escape(),

  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Descrição deve ter no máximo 1000 caracteres')
    .escape(),

  body('price')
    .isFloat({ min: 0 })
    .withMessage('Preço deve ser um número positivo'),

  body('category')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Categoria deve ter no máximo 100 caracteres')
    .escape(),

  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Estoque deve ser um número inteiro não negativo'),

  handleValidationErrors
];

// Validações para propostas
const validateProposal = [
  body('client.name')
    .notEmpty()
    .withMessage('Nome do cliente é obrigatório')
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres')
    .escape(),

  body('client.email')
    .isEmail()
    .withMessage('Email do cliente inválido')
    .normalizeEmail(),

  body('client.phone')
    .optional({ checkFalsy: true })
    .custom((value) => {
      // Se o telefone está presente e não é vazio, deve ser válido
      if (value && value.trim() !== '') {
        const phoneRegex = /^[\d\s\(\)\-]+$/;
        if (!phoneRegex.test(value) || value.replace(/\D/g, '').length < 10) {
          throw new Error('Telefone do cliente inválido');
        }
      }
      return true;
    }),

  body('seller._id')
    .isMongoId()
    .withMessage('ID do vendedor inválido'),

  body('seller.name')
    .notEmpty()
    .withMessage('Nome do vendedor é obrigatório')
    .escape(),

  body('distributor._id')
    .isMongoId()
    .withMessage('ID do distribuidor inválido'),

  body('items')
    .isArray({ min: 1 })
    .withMessage('Pelo menos um item é obrigatório'),

  body('items.*.product._id')
    .isMongoId()
    .withMessage('ID do produto inválido'),

  body('items.*.product.name')
    .notEmpty()
    .withMessage('Nome do produto é obrigatório')
    .escape(),

  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantidade deve ser um número inteiro positivo'),

  body('items.*.unitPrice')
    .isFloat({ min: 0 })
    .withMessage('Preço unitário deve ser um número positivo'),

  body('subtotal')
    .isFloat({ min: 0 })
    .withMessage('Subtotal deve ser um número positivo'),

  body('discount')
    .isFloat({ min: 0 })
    .withMessage('Desconto deve ser um número positivo'),

  body('total')
    .isFloat({ min: 0 })
    .withMessage('Total deve ser um número positivo'),

  body('paymentCondition')
    .notEmpty()
    .withMessage('Condição de pagamento é obrigatória')
    .isLength({ max: 500 })
    .withMessage('Condição de pagamento deve ter no máximo 500 caracteres')
    .escape(),

  body('observations')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Observações devem ter no máximo 1000 caracteres')
    .escape(),

  body('validUntil')
    .isISO8601()
    .withMessage('Data de validade inválida')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Data de validade deve ser futura');
      }
      return true;
    }),

  body('status')
    .optional()
    .isIn(['negociacao', 'aprovada', 'venda_perdida', 'venda_fechada'])
    .withMessage('Status deve ser: negociacao, aprovada, venda_perdida ou venda_fechada'),

  handleValidationErrors
];

// Validações para listas de preços
const validatePriceList = [
  body('distributorId')
    .isMongoId()
    .withMessage('ID do distribuidor inválido'),

  body('products')
    .isArray({ min: 1 })
    .withMessage('Pelo menos um produto é obrigatório'),

  body('products.*.product')
    .isMongoId()
    .withMessage('ID do produto inválido'),

  body('products.*.pricing.aVista')
    .isFloat({ min: 0 })
    .withMessage('Preço à vista deve ser um número positivo'),

  body('products.*.validFrom')
    .optional()
    .isISO8601()
    .withMessage('Data de início inválida'),

  body('products.*.validUntil')
    .optional()
    .isISO8601()
    .withMessage('Data de fim inválida'),

  body('products.*.notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notas devem ter no máximo 500 caracteres')
    .escape(),

  handleValidationErrors
];

// Validações para avisos
const validateNotice = [
  body('title')
    .notEmpty()
    .withMessage('Título é obrigatório')
    .isLength({ min: 2, max: 200 })
    .withMessage('Título deve ter entre 2 e 200 caracteres')
    .escape(),

  body('content')
    .notEmpty()
    .withMessage('Conteúdo é obrigatório')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Conteúdo deve ter entre 10 e 2000 caracteres')
    .escape(),

  body('priority')
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Prioridade deve ser: low, medium, high ou urgent'),

  body('targetRoles')
    .isArray({ min: 1 })
    .withMessage('Pelo menos um público-alvo é obrigatório'),

  body('targetRoles.*')
    .isIn(['admin', 'vendedor', 'all'])
    .withMessage('Público-alvo deve ser: admin, vendedor ou all'),

  body('expiresAt')
    .optional()
    .isISO8601()
    .withMessage('Data de expiração inválida'),

  body('imageUrl')
    .optional()
    .isURL()
    .withMessage('URL da imagem inválida'),

  handleValidationErrors
];

// Validações para metas
const validateGoal = [
  body('title')
    .notEmpty()
    .withMessage('Título é obrigatório')
    .isLength({ min: 2, max: 200 })
    .withMessage('Título deve ter entre 2 e 200 caracteres')
    .escape(),

  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Descrição deve ter no máximo 1000 caracteres')
    .escape(),

  body('type')
    .isIn(['daily', 'weekly', 'monthly', 'quarterly', 'yearly'])
    .withMessage('Tipo deve ser: daily, weekly, monthly, quarterly ou yearly'),

  body('category')
    .isIn(['sales', 'revenue', 'clients', 'proposals', 'calls', 'visits', 'custom'])
    .withMessage('Categoria inválida'),

  body('targetValue')
    .isFloat({ min: 0 })
    .withMessage('Valor alvo deve ser um número positivo'),

  body('unit')
    .isIn(['quantity', 'currency', 'percentage', 'hours', 'calls', 'visits'])
    .withMessage('Unidade inválida'),

  body('period.startDate')
    .isISO8601()
    .withMessage('Data de início inválida'),

  body('period.endDate')
    .isISO8601()
    .withMessage('Data de fim inválida')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.period.startDate)) {
        throw new Error('Data de fim deve ser posterior à data de início');
      }
      return true;
    }),

  body('assignedTo')
    .optional()
    .isMongoId()
    .withMessage('ID do usuário atribuído inválido'),

  handleValidationErrors
];

// Validações para parâmetros de rota
const validateMongoId = [
  param('id')
    .isMongoId()
    .withMessage('ID inválido'),

  handleValidationErrors
];

// Validações para queries de paginação
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página deve ser um número inteiro positivo'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limite deve ser um número entre 1 e 100'),

  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUser,
  validateLogin,
  validateClient,
  validateProduct,
  validateProposal,
  validatePriceList,
  validateNotice,
  validateGoal,
  validateMongoId,
  validatePagination
};
