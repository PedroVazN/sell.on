const fs = require('fs');
const path = require('path');

// Função para sanitizar dados sensíveis
const sanitizeData = (data) => {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const sensitiveFields = [
    'password',
    'token',
    'authToken',
    'accessToken',
    'refreshToken',
    'secret',
    'key',
    'apiKey',
    'privateKey',
    'creditCard',
    'cvv',
    'ssn',
    'cpf',
    'cnpj',
    'phone',
    'email'
  ];

  const sanitized = { ...data };

  // Sanitizar campos sensíveis
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      if (field === 'email') {
        // Para email, mostrar apenas parte do domínio
        const [user, domain] = sanitized[field].split('@');
        sanitized[field] = `${user.substring(0, 2)}***@${domain}`;
      } else if (field === 'phone') {
        // Para telefone, mostrar apenas últimos 4 dígitos
        const phone = sanitized[field].toString();
        sanitized[field] = phone.length > 4 ? 
          '***' + phone.slice(-4) : '***';
      } else {
        // Para outros campos sensíveis, substituir por asteriscos
        sanitized[field] = '***';
      }
    }
  });

  // Sanitizar objetos aninhados
  Object.keys(sanitized).forEach(key => {
    if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeData(sanitized[key]);
    }
  });

  return sanitized;
};

// Função para criar log estruturado
const createLogEntry = (level, message, data = {}, req = null) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    data: sanitizeData(data),
    ...(req && {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      method: req.method,
      url: req.url,
      userId: req.user?._id
    })
  };

  return logEntry;
};

// Função para escrever log em arquivo
const writeLogFile = (logEntry) => {
  const logDir = path.join(__dirname, '../../logs');
  
  // Criar diretório de logs se não existir
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const logFile = path.join(logDir, `security-${new Date().toISOString().split('T')[0]}.log`);
  
  try {
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
  } catch (error) {
    console.error('Erro ao escrever log:', error);
  }
};

// Middleware de logging seguro - OTIMIZADO
const secureLogger = (req, res, next) => {
  // Apenas em desenvolvimento logar tudo
  if (process.env.NODE_ENV === 'development') {
    const startTime = Date.now();
    
    // Interceptar resposta apenas para logging de erros
    const originalSend = res.send;
    res.send = function(data) {
      const duration = Date.now() - startTime;
      
      // Log apenas erros e requisições lentas (> 1s)
      if (res.statusCode >= 400 || duration > 1000) {
        const errorLog = createLogEntry('warn', res.statusCode >= 400 ? 'Error response' : 'Slow response', {
          statusCode: res.statusCode,
          duration: `${duration}ms`,
          url: req.url,
          method: req.method
        }, req);
        
        console.log('⚠️ Issue:', JSON.stringify(errorLog, null, 2));
        writeLogFile(errorLog);
      }

      originalSend.call(this, data);
    };
  } else {
    // Em produção, logar apenas erros críticos
    const originalSend = res.send;
    res.send = function(data) {
      if (res.statusCode >= 500) {
        const errorLog = createLogEntry('error', 'Critical error', {
          statusCode: res.statusCode,
          url: req.url,
          method: req.method
        }, req);
        
        writeLogFile(errorLog);
      }

      originalSend.call(this, data);
    };
  }

  next();
};

// Middleware para detectar tentativas de ataque - OTIMIZADO
const securityMonitor = (req, res, next) => {
  // Apenas monitorar em desenvolvimento ou rotas críticas
  const criticalRoutes = ['/api/users/login', '/api/users/register', '/api/proposals', '/api/clients'];
  const shouldMonitor = process.env.NODE_ENV === 'development' || criticalRoutes.some(route => req.url.includes(route));
  
  if (!shouldMonitor) {
    return next();
  }

  // Padrões mais críticos apenas
  const attackPatterns = [
    // SQL Injection
    { pattern: /union.*select/i, type: 'SQL_INJECTION', severity: 'HIGH' },
    { pattern: /drop.*table/i, type: 'SQL_INJECTION', severity: 'HIGH' },
    
    // XSS
    { pattern: /<script[^>]*>.*?<\/script>/i, type: 'XSS', severity: 'HIGH' },
    
    // Command Injection
    { pattern: /;.*rm/i, type: 'COMMAND_INJECTION', severity: 'CRITICAL' },
    
    // NoSQL Injection
    { pattern: /\$where/i, type: 'NOSQL_INJECTION', severity: 'HIGH' }
  ];

  const checkForAttacks = (data, context) => {
    const dataString = JSON.stringify(data).toLowerCase();
    
    attackPatterns.forEach(({ pattern, type, severity }) => {
      if (pattern.test(dataString)) {
        const attackLog = createLogEntry('alert', `Security attack detected: ${type}`, {
          attackType: type,
          severity,
          context,
          pattern: pattern.toString(),
          data: sanitizeData(data),
          timestamp: new Date().toISOString()
        }, req);

        console.warn('🚨 SECURITY ALERT:', JSON.stringify(attackLog, null, 2));
        writeLogFile(attackLog);

        // Em produção, você pode enviar alertas para serviços como Slack, Discord, etc.
        if (process.env.NODE_ENV === 'production' && severity === 'CRITICAL') {
          // Aqui você pode implementar notificações críticas
          console.error('🚨 CRITICAL SECURITY ALERT - Immediate attention required!');
        }
      }
    });
  };

  // Verificar apenas body em POST/PUT (mais crítico)
  if ((req.method === 'POST' || req.method === 'PUT') && req.body && Object.keys(req.body).length > 0) {
    checkForAttacks({ body: req.body }, 'REQUEST_BODY');
  }

  next();
};

// Middleware para logging de autenticação - OTIMIZADO
const authLogger = (req, res, next) => {
  // Apenas logar tentativas de login
  if (req.path === '/api/users/login' && req.method === 'POST') {
    const originalSend = res.send;
    
    res.send = function(data) {
      const isSuccess = res.statusCode === 200;
      
      // Logar apenas falhas de login
      if (!isSuccess) {
        const authLog = createLogEntry('warn', 'Login failed', {
          email: req.body?.email,
          statusCode: res.statusCode,
          ip: req.ip
        }, req);
        
        writeLogFile(authLog);
        console.log('🔐 Failed Auth:', JSON.stringify(authLog, null, 2));
      }

      originalSend.call(this, data);
    };
  }

  next();
};

// Função para limpar logs antigos (executar diariamente)
const cleanupOldLogs = () => {
  const logDir = path.join(__dirname, '../../logs');
  const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 dias em ms
  
  if (fs.existsSync(logDir)) {
    const files = fs.readdirSync(logDir);
    
    files.forEach(file => {
      const filePath = path.join(logDir, file);
      const stats = fs.statSync(filePath);
      
      if (Date.now() - stats.mtime.getTime() > maxAge) {
        fs.unlinkSync(filePath);
        console.log(`🗑️ Log antigo removido: ${file}`);
      }
    });
  }
};

// Executar limpeza de logs diariamente
setInterval(cleanupOldLogs, 24 * 60 * 60 * 1000); // 24 horas

module.exports = {
  secureLogger,
  securityMonitor,
  authLogger,
  sanitizeData,
  createLogEntry,
  writeLogFile,
  cleanupOldLogs
};
