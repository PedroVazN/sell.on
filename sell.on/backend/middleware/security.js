const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Configuração do Helmet para headers de segurança
const securityHeaders = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "https://backendsellon.vercel.app"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: [],
    },
  },
  
  // HTTP Strict Transport Security
  hsts: {
    maxAge: 31536000, // 1 ano
    includeSubDomains: true,
    preload: true
  },
  
  // X-Frame-Options
  frameguard: {
    action: 'deny'
  },
  
  // X-Content-Type-Options
  noSniff: true,
  
  // X-XSS-Protection
  xssFilter: true,
  
  // Referrer Policy
  referrerPolicy: {
    policy: "strict-origin-when-cross-origin"
  },
  
  // Permissions Policy
  permissionsPolicy: {
    camera: [],
    microphone: [],
    geolocation: [],
    payment: [],
    usb: [],
    magnetometer: [],
    gyroscope: [],
    accelerometer: [],
    ambientLightSensor: [],
    autoplay: [],
    encryptedMedia: [],
    fullscreen: ["self"],
    pictureInPicture: []
  }
});

// Rate limiting geral - OTIMIZADO (mais permissivo)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 500, // aumentado de 100 para 500 requests por IP
  message: {
    success: false,
    message: 'Muitas tentativas, tente novamente em 15 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Pular rate limiting para rotas de leitura (GET) e health checks
    return req.path === '/health' || 
           req.path === '/api/health' || 
           req.method === 'GET';
  }
});

// Rate limiting para login - OTIMIZADO
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // aumentado de 5 para 10 tentativas de login por IP
  message: {
    success: false,
    message: 'Muitas tentativas de login, tente novamente em 15 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true // Não contar requests bem-sucedidos
});

// Rate limiting para criação de propostas - OTIMIZADO
const proposalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 30, // aumentado de 10 para 30 propostas por minuto por IP
  message: {
    success: false,
    message: 'Muitas propostas criadas, aguarde um momento'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting para upload de imagens
const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 5, // máximo 5 uploads por minuto por IP
  message: {
    success: false,
    message: 'Muitos uploads, aguarde um momento'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting para operações administrativas
const adminLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 20, // máximo 20 operações admin por minuto por IP
  message: {
    success: false,
    message: 'Muitas operações administrativas, aguarde um momento'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Middleware para configurar CORS adequadamente
const corsConfig = (req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://sellon-novo.vercel.app',
    'https://sellon-novo-git-main-pedrovazn.vercel.app',
    'https://sell-on-dt.vercel.app',
    'https://sell-on-v2.vercel.app',
    process.env.FRONTEND_URL
  ].filter(Boolean);

  // Verificar se a origem é permitida (inclui qualquer *.vercel.app para previews)
  const isAllowed = allowedOrigins.includes(origin) ||
    (origin && origin.endsWith('.vercel.app'));
  if (isAllowed) {
    res.header('Access-Control-Allow-Origin', origin);
  } else if (process.env.NODE_ENV === 'development') {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  } else {
    res.header('Access-Control-Allow-Origin', 'https://sell-on-v2.vercel.app');
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400'); // 24 horas

  // Responder a requisições OPTIONS
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  next();
};

// Middleware para adicionar headers de segurança adicionais
const additionalSecurityHeaders = (req, res, next) => {
  // Remover header X-Powered-By
  res.removeHeader('X-Powered-By');
  
  // Adicionar header de cache control para APIs
  if (req.path.startsWith('/api/')) {
    res.header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.header('Pragma', 'no-cache');
    res.header('Expires', '0');
  }
  
  // Adicionar header de timing para debugging
  res.header('X-Response-Time', Date.now() - req.startTime);
  
  next();
};

// Middleware para logging de segurança
const securityLogger = (req, res, next) => {
  const startTime = Date.now();
  req.startTime = startTime;
  
  // Log de requisições suspeitas
  const suspiciousPatterns = [
    /\.\./, // Path traversal
    /<script/i, // XSS attempts
    /union.*select/i, // SQL injection
    /javascript:/i, // JavaScript injection
    /onload=/i, // Event handler injection
  ];
  
  const url = req.url;
  const userAgent = req.headers['user-agent'] || '';
  const body = JSON.stringify(req.body || {});
  
  const isSuspicious = suspiciousPatterns.some(pattern => 
    pattern.test(url) || pattern.test(userAgent) || pattern.test(body)
  );
  
  if (isSuspicious) {
    console.warn('🚨 Requisição suspeita detectada:', {
      ip: req.ip,
      method: req.method,
      url: req.url,
      userAgent,
      timestamp: new Date().toISOString()
    });
  }
  
  next();
};

module.exports = {
  securityHeaders,
  generalLimiter,
  loginLimiter,
  proposalLimiter,
  uploadLimiter,
  adminLimiter,
  corsConfig,
  additionalSecurityHeaders,
  securityLogger
};
