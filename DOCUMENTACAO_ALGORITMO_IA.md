# 🤖 Documentação: Algoritmo de Score Preditivo de IA

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Fluxo do Algoritmo](#fluxo-do-algoritmo)
3. [Análise Histórica Completa](#análise-histórica-completa)
4. [Os 10 Fatores de Análise](#os-10-fatores-de-análise)
5. [Como o Score Final é Calculado](#como-o-score-final-é-calculado)
6. [Exemplos Práticos](#exemplos-práticos)
7. [Sistema de Confiança](#sistema-de-confiança)

---

## 🎯 Visão Geral

O algoritmo de **Score Preditivo de IA v2.0** analisa todas as propostas históricas do sistema para prever a probabilidade de uma proposta em negociação ser fechada com sucesso.

**Objetivo:** Atribuir um score de 0 a 100% indicando a probabilidade de fechamento de uma proposta.

**Método:** Machine Learning básico através de análise estatística e aprendizado contínuo baseado em dados reais.

---

## 🔄 Fluxo do Algoritmo

### Passo 1: Coleta de Dados Históricos
```
┌─────────────────────────────────────┐
│  1. Buscar TODAS as propostas dos  │
│     últimos 12 meses               │
│     (fechadas, perdidas, em        │
│     negociação, expiradas)          │
└─────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  2. Calcular estatísticas gerais:  │
│     - Taxa de conversão global     │
│     - Percentis de valores         │
│     - Tempo médio de fechamento    │
│     - Padrões por vendedor         │
│     - Padrões por cliente          │
│     - Padrões por produto          │
└─────────────────────────────────────┘
```

### Passo 2: Análise da Proposta Atual
```
┌─────────────────────────────────────┐
│  Para cada proposta em negociação: │
│                                     │
│  1. Identificar vendedor            │
│  2. Identificar cliente             │
│  3. Extrair características         │
│  4. Comparar com histórico          │
└─────────────────────────────────────┘
```

### Passo 3: Cálculo dos 10 Fatores
```
┌─────────────────────────────────────┐
│  Cada fator calcula um score 0-100 │
│  e é multiplicado pelo seu peso    │
└─────────────────────────────────────┘
```

### Passo 4: Score Final e Classificação
```
┌─────────────────────────────────────┐
│  Score Final = Soma ponderada      │
│  Nível = Baseado em percentis      │
│  Ação = Gerada inteligentemente    │
└─────────────────────────────────────┘
```

---

## 📊 Análise Histórica Completa

Antes de calcular qualquer score, o algoritmo faz uma **análise completa** de TODAS as propostas históricas:

### Dados Coletados:

1. **Estatísticas Globais:**
   ```javascript
   - Total de propostas: X
   - Fechadas: Y
   - Perdidas: Z
   - Taxa de conversão global: Y/(Y+Z) * 100%
   - Tempo médio de fechamento: N dias
   - Valor médio: R$ X
   ```

2. **Percentis de Valores:**
   ```javascript
   - P10 (10% menores valores): R$ X
   - P25 (25% menores valores): R$ Y
   - P50 (MEDIANA): R$ Z
   - P75 (75% menores valores): R$ W
   - P90 (90% menores valores): R$ V
   ```
   *Usado para determinar se o valor está na "zona ideal"*

3. **Por Vendedor:**
   ```javascript
   vendedor_id: {
     total: X propostas,
     fechadas: Y,
     perdidas: Z,
     taxa_conversao: Y/(Y+Z),
     receita_total: R$ X,
     tendencia_recente: +X% ou -X%
   }
   ```

4. **Por Cliente:**
   ```javascript
   client_email: {
     total: X propostas,
     fechadas: Y,
     receita_total: R$ X,
     tempo_medio_fechamento: N dias,
     taxa_conversao: Y/X
   }
   ```

5. **Por Produto:**
   ```javascript
   product_id: {
     vezes_cotado: X,
     vezes_fechado: Y,
     taxa_conversao: Y/X
   }
   ```

---

## 🔍 Os 10 Fatores de Análise

### FATOR 1: Vendedor (Peso: 15-25%)

**O que analisa:**
- Taxa de conversão histórica do vendedor
- Tendência recente (últimos 3 meses vs anteriores)
- Volume de propostas históricas

**Como calcula:**
```javascript
1. Busca todas as propostas do vendedor (últimos 6 meses)
2. Calcula taxa = fechadas / (fechadas + perdidas)
3. Compara taxa recente (3 meses) vs antiga (6-3 meses)
4. Score base = taxa * 100
5. Ajusta por tendência:
   - Se tendência > +5%: +10 pontos
   - Se tendência > 0: +5 pontos
   - Se tendência < -10%: -15 pontos
   - Se tendência < 0: -5 pontos
```

**Exemplo:**
- Vendedor João tem 80% de conversão histórica
- Tendência recente: +12% (melhorou!)
- Score final: 80 + 10 = **90 pontos**

---

### FATOR 2: Cliente (Peso: 20-30%)

**O que analisa:**
- Histórico de compras do cliente
- Taxa de conversão do cliente
- Volume de receita histórica
- Tempo médio de fechamento
- Score de lealdade (múltiplas compras)

**Como calcula:**
```javascript
1. Busca todas as propostas do cliente
2. Calcula taxa = fechadas / total_propostas
3. Calcula score de volume: (receita / 50.000) * 10 (máx 30 pts)
4. Calcula score de lealdade: fechadas > 1 ? (fechadas * 5) : 0 (máx 20 pts)
5. Score final = (taxa * 70) + score_volume + score_lealdade
```

**Exemplo:**
- Cliente Maria: 5 propostas, 4 fechadas (80% taxa)
- Receita histórica: R$ 120.000
- Score base: 80 * 0.7 = 56
- Score volume: (120.000 / 50.000) * 10 = 24 (limitado a 20) = 20
- Score lealdade: 4 * 5 = 20
- Score final: 56 + 20 + 20 = **96 pontos**

---

### FATOR 3: Valor (Peso: 10-20%)

**O que analisa:**
- Valor da proposta
- Percentil estatístico do valor
- Zona ideal baseada em histórico

**Como calcula:**
```javascript
1. Determina percentil do valor (P10, P25, P50, P75, P90)
2. Zona ideal: Percentil 25-75 (valores médios)
3. Score base:
   - P10: 40 pontos (muito baixo)
   - P25-P75: 90 pontos (zona ideal)
   - P90: 65 pontos (muito alto, mais difícil)
4. Ajuste fino por faixas:
   - R$ 1.000-5.000: 75 pts
   - R$ 5.000-20.000: 90 pts (ideal)
   - R$ 20.000-50.000: 85 pts
   - R$ 50.000-100.000: 75 pts
   - > R$ 100.000: 65 pts
```

**Exemplo:**
- Proposta de R$ 15.000
- Está no percentil 50 (mediana)
- Faixa: R$ 5.000-20.000
- Score final: **90 pontos**

---

### FATOR 4: Tempo (Peso: 10-18%)

**O que analisa:**
- Dias desde criação
- Dias até expiração
- Estágio do ciclo de vida
- Timing ótimo baseado em histórico

**Como calcula:**
```javascript
1. Calcula dias desde criação
2. Calcula dias até expiração
3. Determina estágio:
   - early: ≤ 3 dias (score 95)
   - active: ≤ tempo_médio (score 85)
   - late: ≤ tempo_médio * 1.5 (score 60)
   - stale: > tempo_médio * 2 (score 40)
4. Penaliza por expiração:
   - Já expirada: -40
   - Expira em <3 dias: -25
   - Expira em <7 dias: -15
   - Expira em >14 dias: +5
```

**Exemplo:**
- Proposta criada há 5 dias
- Expira em 20 dias
- Tempo médio histórico: 15 dias
- Estágio: active (5 < 15)
- Score base: 85
- Bônus expiração: +5 (tempo suficiente)
- Score final: **90 pontos**

---

### FATOR 5: Produtos (Peso: 8-15%)

**O que analisa:**
- Quantidade de produtos na proposta
- Taxa de conversão histórica por quantidade
- Se são produtos "top" (alta taxa de venda)

**Como calcula:**
```javascript
1. Conta produtos na proposta
2. Busca taxa histórica por quantidade
3. Verifica se produtos são "top":
   - Para cada produto, busca taxa de conversão
   - Se taxa > 60%: produto top
4. Score produtos top: 70 + (quantidade_top * 5)
5. Score mix ideal: baseado em quantidade:
   - 1 produto: 70
   - 2-5 produtos: 90 (ideal)
   - 6-10 produtos: 75
   - >10 produtos: 60
6. Score final = (taxa_qtd * 0.4) + (top_score * 0.35) + (mix_score * 0.25)
```

**Exemplo:**
- Proposta com 3 produtos
- 2 produtos são "top" (taxa > 60%)
- Taxa histórica para 3 produtos: 75%
- Score taxa: 75 * 0.4 = 30
- Score top: (70 + 2*5) * 0.35 = 80 * 0.35 = 28
- Score mix: 90 * 0.25 = 22.5
- Score final: 30 + 28 + 22.5 = **80.5 pontos**

---

### FATOR 6: Pagamento (Peso: 8-15%)

**O que analisa:**
- Tipo de condição de pagamento
- Taxa de conversão histórica por tipo

**Como calcula:**
```javascript
Taxa de conversão por tipo (baseado em histórico):
- À vista: 85% (score: 85)
- Crédito 1x: 80% (score: 80)
- Crédito 2-3x: 75% (score: 75)
- Crédito 4-6x: 65% (score: 65)
- Crédito >6x: 55% (score: 55)
- Boleto: 70% (score: 70)
```

**Exemplo:**
- Condição: "Crédito - 3x"
- Taxa histórica: 75%
- Score final: **75 pontos**

---

### FATOR 7: Desconto (Peso: 5-10%)

**O que analisa:**
- Percentual de desconto aplicado
- Padrão histórico: desconto muito alto = dificuldade

**Como calcula:**
```javascript
1. Calcula % desconto = (subtotal - total) / subtotal * 100
2. Score baseado em padrões:
   - Sem desconto: 85 (melhor - cliente aceita preço)
   - 0-5% desconto: 90 (pequeno desconto ajuda)
   - 5-10% desconto: 75
   - 10-20% desconto: 60 (médio - pode indicar necessidade)
   - >20% desconto: 40 (alto - indica dificuldade)
```

**Exemplo:**
- Proposta sem desconto
- Score final: **85 pontos**

---

### FATOR 8: Sazonalidade (Peso: 5-8%)

**O que analisa:**
- Mês do ano em que foi criada
- Taxa de conversão histórica por mês

**Como calcula:**
```javascript
Taxa de conversão mensal (padrão histórico):
- Janeiro: 55% (pós-natal)
- Fevereiro-Março: 60-65%
- Abril-Julho: 65-70%
- Agosto-Setembro: 70-75%
- Outubro: 75%
- Novembro: 80% (Black Friday)
- Dezembro: 85% (Natal)

Score = taxa_mensal * 100
```

**Exemplo:**
- Proposta criada em Novembro
- Taxa mensal: 80%
- Score final: **80 pontos**

---

### FATOR 9: Engajamento (Peso: 5-8%)

**O que analisa:**
- Velocidade de resposta (última atualização)
- Frequência de atualizações

**Como calcula:**
```javascript
1. Calcula dias desde última atualização
2. Score velocidade:
   - Atualizada hoje: 95
   - Atualizada <3 dias: 85
   - Atualizada <7 dias: 70
   - Atualizada >7 dias: 50
3. Calcula frequência = dias_atualização / dias_criação
4. Score frequência:
   - Frequência >0.5: 60 (pouco atualizada)
   - Frequência 0.3-0.5: 75
   - Frequência <0.3: 85 (bem atualizada)
5. Score final = (velocidade * 0.6) + (frequência * 0.4)
```

**Exemplo:**
- Proposta criada há 10 dias
- Atualizada há 2 dias (velocidade: 85)
- Frequência: 2/10 = 0.2 (bem atualizada: 85)
- Score final: (85 * 0.6) + (85 * 0.4) = **85 pontos**

---

### FATOR 10: Padrões Complexos (Peso: 3-5%)

**O que analisa:**
- Propostas similares (mesmo vendedor + cliente + valor similar)
- Taxa de conversão de propostas similares

**Como calcula:**
```javascript
1. Busca propostas similares:
   - Mesmo cliente OU mesmo vendedor
   - Valor entre 70% e 130% do valor atual
2. Calcula taxa de conversão das similares
3. Score = taxa_similares * 100
```

**Exemplo:**
- Encontrou 15 propostas similares
- 12 fechadas com sucesso (80%)
- Score final: **80 pontos**

---

## 🧮 Como o Score Final é Calculado

### Fórmula:
```
Score Final = Σ (Fator_i × Peso_i) / 100

Onde:
- Fator_i: Score do fator (0-100)
- Peso_i: Peso do fator em % (soma = 100%)
```

### Exemplo Completo:

**Proposta exemplo:**
- Vendedor: 90 pontos (peso 20%)
- Cliente: 96 pontos (peso 25%)
- Valor: 90 pontos (peso 15%)
- Tempo: 90 pontos (peso 15%)
- Produtos: 80 pontos (peso 10%)
- Pagamento: 75 pontos (peso 10%)
- Desconto: 85 pontos (peso 5%)
- Sazonalidade: 80 pontos (peso 5%)
- Engajamento: 85 pontos (peso 5%)
- Padrões: 80 pontos (peso 5%)

**Cálculo:**
```
Score = (90×20 + 96×25 + 90×15 + 90×15 + 80×10 + 75×10 + 85×5 + 80×5 + 85×5 + 80×5) / 100
      = (1800 + 2400 + 1350 + 1350 + 800 + 750 + 425 + 400 + 425 + 400) / 100
      = 9100 / 100
      = 91 pontos
```

**Classificação:**
- **91 pontos = Nível ALTO**
- **Ação:** "🎯 EXCELENTE OPORTUNIDADE! Priorizar follow-up imediato"

---

## 📈 Sistema de Confiança

O algoritmo também calcula um **nível de confiança** (0-100%) indicando quão confiável é o score:

### Como calcula:
```javascript
Confiança = Média das confianças de cada fator
```

### Confiança por fator:
- **Vendedor:** 50 + (total_propostas_vendedor × 2) → máx 95
- **Cliente:** 40 + (total_propostas_cliente × 3) → máx 95
- **Valor:** Sempre 70 (dados sempre disponíveis)
- **Tempo:** Sempre 80 (dados sempre disponíveis)
- **Outros:** 50-70 (dependendo de dados históricos)

**Exemplo:**
- Vendedor com 20 propostas: confiança 90
- Cliente com 5 propostas: confiança 55
- Outros fatores: média 65
- **Confiança final: ~75%**

---

## 🎯 Classificação de Níveis

### Alto (80-100 pontos):
- **Significa:** Alta probabilidade de fechar
- **Características:** 
  - Vendedor experiente com boa taxa
  - Cliente com histórico positivo
  - Valor na zona ideal
  - Timing bom
  - Produtos top

### Médio (60-79 pontos):
- **Significa:** Probabilidade moderada
- **Características:**
  - Alguns fatores positivos
  - Alguns fatores neutros ou negativos
  - Requer acompanhamento

### Baixo (35-59 pontos):
- **Significa:** Risco de não fechar
- **Características:**
  - Múltiplos fatores negativos
  - Requer atenção

### Muito Baixo (0-34 pontos):
- **Significa:** Alto risco de perda
- **Características:**
  - Maioria dos fatores negativos
  - Requer ação imediata

---

## 🔄 Aprendizado Contínuo

O algoritmo **aprende continuamente** porque:

1. **Análise Histórica Atualizada:**
   - Sempre usa os últimos 12 meses
   - A cada nova proposta fechada/perdida, os padrões se atualizam

2. **Pesos Dinâmicos:**
   - Se houver muitos vendedores, aumenta peso do fator vendedor
   - Se houver muitos clientes recorrentes, aumenta peso do fator cliente

3. **Ajustes por Correlação:**
   - Identifica quais fatores mais predizem sucesso
   - Ajusta pesos automaticamente

---

## 💡 Dicas de Interpretação

### Score Alto com Baixa Confiança:
- Dados históricos insuficientes
- Tomar decisão com cuidado
- Considerar fatores individuais

### Score Médio com Alta Confiança:
- Proposta realmente em zona intermediária
- Acompanhar de perto
- Pequenos ajustes podem melhorar

### Score Baixo com Alta Confiança:
- Risco real confirmado
- Ação corretiva necessária
- Considerar desconto ou renegociação

---

## 🚀 Melhorias Futuras Planejadas

1. **Machine Learning Avançado:**
   - TensorFlow.js para modelos mais complexos
   - Regressão logística
   - Redes neurais simples

2. **Análise de Sentimento:**
   - Análise de observações/comentários
   - Detectar urgência/clima positivo

3. **Previsão de Tempo:**
   - Prever quantos dias até fechamento
   - Prever melhor momento para follow-up

4. **Análise de Churn:**
   - Prever se cliente vai comprar novamente
   - Score de lealdade avançado

---

**Última atualização:** Janeiro 2025  
**Versão do Algoritmo:** 2.0-advanced  
**Desenvolvedor:** Sistema Sell.On CRM

