/**
 * Formata um número para o padrão brasileiro
 * Exemplo: 90000.00 -> 90.000,00
 */
export const formatCurrency = (value: number | string | undefined | null): string => {
  if (value === undefined || value === null) return 'R$ 0,00';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return 'R$ 0,00';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(numValue);
};

/**
 * Formata um número sem símbolo de moeda
 * Exemplo: 90000.00 -> 90.000,00
 */
export const formatNumber = (value: number | string | undefined | null, decimals: number = 2): string => {
  if (value === undefined || value === null) return '0';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '0';
  
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(numValue);
};

/**
 * Formata um número inteiro sem casas decimais
 * Exemplo: 90000 -> 90.000
 */
export const formatInteger = (value: number | string | undefined | null): string => {
  if (value === undefined || value === null) return '0';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '0';
  
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numValue);
};

/**
 * Formata uma porcentagem
 * Exemplo: 0.85 -> 85%
 */
export const formatPercentage = (value: number | string | undefined | null, decimals: number = 0): string => {
  if (value === undefined || value === null) return '0%';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '0%';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(numValue / 100);
};

