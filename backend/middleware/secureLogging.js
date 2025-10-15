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

// Middleware de logging seguro
const secureLogger = (req, res, next) => {
  const startTime = Date.now();
  req.startTime = startTime;

  // Log da requisição
  const requestLog = createLogEntry('info', 'Request received', {
    body: req.body,
    query: req.query,
    params: req.params
  }, req);

  console.log('📥 Request:', JSON.stringify(requestLog, null, 2));

  // Interceptar resposta para logging
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - startTime;
    
    // Log da resposta
    const responseLog = createLogEntry('info', 'Response sent', {
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      responseSize: data ? data.length : 0
    }, req);

    console.log('📤 Response:', JSON.stringify(responseLog, null, 2));

    // Log de segurança para status de erro
    if (res.statusCode >= 400) {
      const errorLog = createLogEntry('warn', 'Error response', {
        statusCode: res.statusCode,
        error: data,
        duration: `${duration}ms`
      }, req);
      
      writeLogFile(errorLog);
    }

    originalSend.call(this, data);
  };

  next();
};

// Middleware para detectar tentativas de ataque
const securityMonitor = (req, res, next) => {
  const attackPatterns = [
    // SQL Injection
    { pattern: /union.*select/i, type: 'SQL_INJECTION', severity: 'HIGH' },
    { pattern: /drop.*table/i, type: 'SQL_INJECTION', severity: 'HIGH' },
    { pattern: /insert.*into/i, type: 'SQL_INJECTION', severity: 'HIGH' },
    { pattern: /delete.*from/i, type: 'SQL_INJECTION', severity: 'HIGH' },
    
    // XSS
    { pattern: /<script[^>]*>.*?<\/script>/i, type: 'XSS', severity: 'HIGH' },
    { pattern: /javascript:/i, type: 'XSS', severity: 'HIGH' },
    { pattern: /onload\s*=/i, type: 'XSS', severity: 'HIGH' },
    { pattern: /onerror\s*=/i, type: 'XSS', severity: 'HIGH' },
    
    // Path Traversal
    { pattern: /\.\./, type: 'PATH_TRAVERSAL', severity: 'HIGH' },
    { pattern: /\.\.%2f/i, type: 'PATH_TRAVERSAL', severity: 'HIGH' },
    { pattern: /\.\.%5c/i, type: 'PATH_TRAVERSAL', severity: 'HIGH' },
    
    // Command Injection
    { pattern: /;.*ls/i, type: 'COMMAND_INJECTION', severity: 'CRITICAL' },
    { pattern: /;.*cat/i, type: 'COMMAND_INJECTION', severity: 'CRITICAL' },
    { pattern: /;.*rm/i, type: 'COMMAND_INJECTION', severity: 'CRITICAL' },
    { pattern: /\|.*ls/i, type: 'COMMAND_INJECTION', severity: 'CRITICAL' },
    
    // NoSQL Injection
    { pattern: /\$where/i, type: 'NOSQL_INJECTION', severity: 'HIGH' },
    { pattern: /\$ne/i, type: 'NOSQL_INJECTION', severity: 'HIGH' },
    { pattern: /\$gt/i, type: 'NOSQL_INJECTION', severity: 'HIGH' },
    { pattern: /\$regex/i, type: 'NOSQL_INJECTION', severity: 'HIGH' },
    
    // LDAP Injection
    { pattern: /\(.*=.*\)/i, type: 'LDAP_INJECTION', severity: 'HIGH' },
    
    // XML Injection
    { pattern: /<!DOCTYPE/i, type: 'XML_INJECTION', severity: 'HIGH' },
    { pattern: /<!ENTITY/i, type: 'XML_INJECTION', severity: 'HIGH' },
    
    // SSRF
    { pattern: /localhost/i, type: 'SSRF', severity: 'MEDIUM' },
    { pattern: /127\.0\.0\.1/i, type: 'SSRF', severity: 'MEDIUM' },
    { pattern: /192\.168\./i, type: 'SSRF', severity: 'MEDIUM' },
    { pattern: /10\./i, type: 'SSRF', severity: 'MEDIUM' }
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

  // Verificar URL
  checkForAttacks({ url: req.url }, 'URL');
  
  // Verificar query parameters
  if (Object.keys(req.query).length > 0) {
    checkForAttacks({ query: req.query }, 'QUERY_PARAMS');
  }
  
  // Verificar body
  if (req.body && Object.keys(req.body).length > 0) {
    checkForAttacks({ body: req.body }, 'REQUEST_BODY');
  }
  
  // Verificar headers suspeitos
  const suspiciousHeaders = ['x-forwarded-for', 'x-real-ip', 'x-originating-ip'];
  const headerData = {};
  suspiciousHeaders.forEach(header => {
    if (req.headers[header]) {
      headerData[header] = req.headers[header];
    }
  });
  
  if (Object.keys(headerData).length > 0) {
    checkForAttacks({ headers: headerData }, 'HEADERS');
  }

  next();
};

// Middleware para logging de autenticação
const authLogger = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Log tentativas de login
    if (req.path === '/api/users/login' && req.method === 'POST') {
      const isSuccess = res.statusCode === 200;
      const authLog = createLogEntry(
        isSuccess ? 'info' : 'warn',
        isSuccess ? 'Login successful' : 'Login failed',
        {
          email: req.body?.email,
          success: isSuccess,
          statusCode: res.statusCode,
          userAgent: req.headers['user-agent'],
          ip: req.ip
        },
        req
      );
      
      writeLogFile(authLog);
      console.log('🔐 Auth:', JSON.stringify(authLog, null, 2));
    }

    // Log tentativas de acesso a rotas protegidas
    if (req.path.startsWith('/api/') && req.method !== 'GET') {
      const accessLog = createLogEntry('info', 'Protected route accessed', {
        path: req.path,
        method: req.method,
        statusCode: res.statusCode,
        userId: req.user?._id,
        userRole: req.user?.role
      }, req);
      
      writeLogFile(accessLog);
    }

    originalSend.call(this, data);
  };

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
