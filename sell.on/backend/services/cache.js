/**
 * Sistema simples de cache em memória para resultados de IA/ML
 * Usado para evitar recálculos desnecessários do dashboard
 */

class SimpleCache {
  constructor() {
    this.cache = new Map();
    this.timers = new Map(); // Para limpar TTL
  }

  /**
   * Armazena um valor no cache com TTL
   * @param {string} key - Chave do cache
   * @param {any} value - Valor a ser armazenado
   * @param {number} ttlSeconds - Tempo de vida em segundos (padrão: 300 = 5 minutos)
   */
  set(key, value, ttlSeconds = 300) {
    // Limpar timer anterior se existir
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    // Armazenar valor
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl: ttlSeconds * 1000
    });

    // Configurar timer para limpar após TTL
    const timer = setTimeout(() => {
      this.delete(key);
    }, ttlSeconds * 1000);

    this.timers.set(key, timer);
  }

  /**
   * Recupera um valor do cache
   * @param {string} key - Chave do cache
   * @returns {any|null} Valor armazenado ou null se não existir/expirado
   */
  get(key) {
    const cached = this.cache.get(key);
    
    if (!cached) {
      return null;
    }

    // Verificar se expirou
    const age = Date.now() - cached.timestamp;
    if (age > cached.ttl) {
      this.delete(key);
      return null;
    }

    return cached.value;
  }

  /**
   * Verifica se uma chave existe e está válida
   * @param {string} key - Chave do cache
   * @returns {boolean}
   */
  has(key) {
    const cached = this.cache.get(key);
    if (!cached) return false;

    const age = Date.now() - cached.timestamp;
    if (age > cached.ttl) {
      this.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Remove uma chave do cache
   * @param {string} key - Chave a ser removida
   */
  delete(key) {
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
    this.cache.delete(key);
  }

  /**
   * Limpa todo o cache
   */
  clear() {
    // Limpar todos os timers
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
    this.cache.clear();
  }

  /**
   * Limpa entradas expiradas (garbage collection)
   */
  cleanup() {
    const now = Date.now();
    const keysToDelete = [];

    this.cache.forEach((cached, key) => {
      const age = now - cached.timestamp;
      if (age > cached.ttl) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.delete(key));
    
    if (keysToDelete.length > 0) {
      console.log(`🧹 Cache cleanup: removidas ${keysToDelete.length} entradas expiradas`);
    }
  }

  /**
   * Retorna estatísticas do cache
   */
  stats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  /**
   * Retorna o timestamp de uma entrada do cache (para calcular idade)
   * @param {string} key - Chave do cache
   * @returns {number|null} Timestamp ou null
   */
  getTimestamp(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    // Verificar se expirou
    const age = Date.now() - cached.timestamp;
    if (age > cached.ttl) {
      return null; // Já expirado
    }
    
    return cached.timestamp;
  }
}

// Instância singleton
const cache = new SimpleCache();

// Limpeza automática a cada 10 minutos
setInterval(() => {
  cache.cleanup();
}, 10 * 60 * 1000);

module.exports = cache;

