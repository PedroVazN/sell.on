# Esquema: IA no Sell.On usando API externa (dentro das limitações)

Este documento esquematiza como implementar **Score, Previsão, Recomendação e Sentimento** usando uma API de IA (ex.: OpenAI), sem treinar modelos próprios e mantendo o que já existe no sistema.

---

## 1. O que já existe no projeto

| Recurso | Onde está | Tipo |
|--------|-----------|------|
| **Score preditivo** | `backend/services/proposalScore.js` + `DOCUMENTACAO_ALGORITMO_IA.md` | Algoritmo estatístico (10 fatores, histórico) |
| **Recomendação de produtos** | `backend/services/productRecommendation.js` | Regras + histórico |
| **Previsão de vendas** | `backend/services/salesForecast.js` | Estatístico |
| **Detecção de anomalias** | `backend/services/anomalyDetection.js` | Estatístico |
| **Rotas de IA** | `backend/routes/ai.js` | Dashboard, cache, score em lote |

Ou seja: **não é obrigatório** substituir isso por API. A ideia é **complementar** com IA quando fizer sentido e for viável (custo, latência).

---

## 2. Abordagem “dentro das limitações”

- **Sem** treinar modelo próprio (sem TensorFlow, sem dataset de treino).
- **Com** chamadas a API externa (ex.: OpenAI GPT) para:
  - texto (explicações, resumos, análise de sentimento),
  - enriquecer números com interpretação em linguagem natural.
- **Manter** o score e as recomendações atuais como “fonte principal”; a API entra como camada opcional (ex.: “explicar” o score, “sugerir próxima ação”).

---

## 3. Mapeamento: item do roadmap → implementação

### 3.1 Score (já existe + opcional: “explicação IA”)

| O quê | Hoje | Com API externa (opcional) |
|-------|------|----------------------------|
| Cálculo do score 0–100% | `proposalScore.js` (10 fatores) | **Manter.** Não substituir por LLM. |
| Explicação em texto | Pouco ou nenhum | Chamar API com: score, nível, fatores resumidos; pedir 2–3 frases “por que esse score” e “uma sugestão de ação”. |
| Onde mostrar | Dashboard / lista de propostas | Mesmo lugar; adicionar campo `scoreExplanation` (texto da API). |

Fluxo sugerido:

```
[Proposta] → proposalScore.calculateProposalScore() → score + fatores
       → (opcional) montar prompt com score + resumo da proposta
       → POST OpenAI (ou similar) → "explique em 2 frases e sugira uma ação"
       → guardar em proposta ou em cache (ex.: 1h) → exibir no frontend
```

---

### 3.2 Previsão (probabilidade + tempo até fechamento)

| O quê | Com API externa |
|-------|------------------|
| Objetivo | “Qual a chance de fechar?” e “Em quantos dias?” (ordem de grandeza). |
| Entrada | Proposta atual (resumo): valor, cliente, vendedor, produtos, condição de pagamento, dias em aberto, observações (texto). |
| Saída | `{ probability: "alta|média|baixa", estimatedDays: "7-14" ou null, summary: "..." }`. |
| Onde guardar | Campo em proposta (ex.: `aiPrediction`) ou resposta sob demanda (sem persistir). |

Prompt sugerido (exemplo):

```
Contexto: proposta comercial. Valor R$ X, cliente Y, N dias em aberto.
Observações do vendedor: "[texto]".
Responda em JSON: { "probability": "alta|média|baixa", "estimatedDays": "número ou faixa", "summary": "uma frase" }.
```

Limitação: LLM não tem seus dados históricos; por isso a “previsão” é mais qualitativa. Para número de dias, pode-se **combinar**: seu histórico (tempo médio de fechamento) + LLM para ajuste por texto (ex.: “cliente pediu urgência”).

---

### 3.3 Recomendação (produtos + texto)

| O quê | Hoje | Com API externa (opcional) |
|-------|------|----------------------------|
| Quais produtos sugerir | `productRecommendation.js` (regras/histórico) | **Manter** como lista principal. |
| Frase de recomendação | Possivelmente fixa ou simples | API gera 1 frase personalizada: “Sugerir produto X porque …” com base em cliente/proposta. |

Fluxo:

```
[Proposta ou contexto] → getProductRecommendations() → lista de IDs/nomes
       → (opcional) montar prompt: "Cliente Z, proposta com A,B. Produtos sugeridos: C,D. Gere uma frase de recomendação para o vendedor."
       → POST API → texto → exibir junto da lista
```

---

### 3.4 Sentimento (análise de texto)

| O quê | Com API externa |
|-------|------------------|
| Objetivo | Detectar tom/urgência nas observações e notas da proposta. |
| Entrada | Campo de texto (ex.: `observations`, notas). |
| Saída | `{ sentiment: "positivo|neutro|negativo|urgente", summary: "..." }`. |
| Uso | Badge ou tooltip na proposta; filtrar “propostas com tom urgente”; enriquecer o score (fator extra opcional). |

Prompt sugerido:

```
Analise o texto do vendedor sobre a proposta. Retorne JSON: { "sentiment": "positivo|neutro|negativo|urgente", "summary": "uma frase" }.
Texto: "[observations]"
```

Chamada: ao salvar proposta com observações, ou sob demanda ao abrir a proposta (com cache por proposta para não gastar token toda vez).

---

## 4. Pipeline técnico (genérico)

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐     ┌─────────────────┐
│  Dados      │     │  Montar prompt   │     │  Chamar     │     │  Parse +        │
│  (proposta, │ ──► │  (template +     │ ──► │  API        │ ──► │  validar JSON   │
│   cliente)  │     │   dados)         │     │  (OpenAI)   │     │  ou texto       │
└─────────────┘     └──────────────────┘     └─────────────┘     └────────┬────────┘
                                                                           │
                                                                           ▼
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐     ┌─────────────────┐
│  Frontend  │ ◄── │  Guardar         │ ◄── │  Opcional:  │ ◄── │  Retorno        │
│  exibe     │     │  (cache ou DB)   │     │  salvar no  │     │  da API         │
│            │     │                  │     │  Proposal   │     │                 │
└─────────────┘     └──────────────────┘     └─────────────┘     └─────────────────┘
```

- **Backend:** um módulo `backend/services/aiOpenAI.js` (ou nome genérico) com funções:
  - `getScoreExplanation(proposal, scoreResult)`
  - `getPrediction(proposal)`
  - `getRecommendationPhrase(proposal, productIds)`
  - `getSentiment(observationsText)`
- Cada função: monta o prompt, chama a API, trata erro e timeout, devolve objeto estruturado.
- **Variável de ambiente:** `OPENAI_API_KEY` (ou equivalente). Se não existir, as rotas que dependem da API retornam “IA não configurada” e o sistema continua funcionando com score/recomendação atuais.

---

## 5. Fases de implementação sugeridas

| Fase | O quê | Depende de | Esforço (ordem) |
|------|--------|------------|------------------|
| **1** | Configurar cliente da API (ex.: OpenAI) no backend e variável de ambiente. Endpoint de teste “health” (ex.: uma pergunta fixa). | Conta API + chave | Pequeno |
| **2** | **Sentimento:** análise de `observations`. Endpoint `POST /api/ai/sentiment` (body: `{ text }`). Opcional: salvar em proposta ou só retornar. | Fase 1 | Pequeno |
| **3** | **Explicação do score:** após calcular score com `proposalScore.js`, chamar API para gerar 2–3 frases; retornar junto do score no dashboard/lista. | Fase 1 + score atual | Pequeno |
| **4** | **Previsão:** endpoint que recebe proposta (ou id) e devolve `probability` + `estimatedDays` + `summary`. Sem substituir lógica existente. | Fase 1 | Médio |
| **5** | **Recomendação em texto:** dado lista de produtos sugeridos, chamar API para frase de recomendação; exibir na tela de proposta. | Fase 1 + productRecommendation | Pequeno |

Ordem recomendada: **1 → 2 → 3 → 5 → 4** (sentimento e explicação dão retorno rápido; previsão pode ser mais refinada depois).

---

## 6. Limitações e cuidados

| Limitação | O que fazer |
|-----------|-------------|
| **Custo por token** | Chamar API só quando necessário (ex.: ao abrir proposta, ao salvar observações); usar cache (ex.: 1h por proposta). |
| **Timeout (Vercel serverless)** | Timeout de 10–60 s; prompts curtos; se a API demorar, retornar “indisponível” e manter fluxo sem IA. |
| **Dados sensíveis** | Não enviar dados pessoais desnecessários; em observações, considerar mascarar nomes/emails se a política exigir. |
| **Resposta da API não é estruturada** | Pedir JSON no prompt e validar/parse no backend; em caso de falha, não quebrar a tela. |
| **API fora do ar** | Tratar erro e retornar mensagem amigável; score e recomendações atuais seguem funcionando. |

---

## 7. Resumo

- **Score:** manter algoritmo atual; usar API só para “explicação em texto”.
- **Previsão:** nova camada via API (probabilidade + dias), sem substituir estatísticas existentes.
- **Recomendação:** manter lista de produtos atual; usar API para “frase de recomendação”.
- **Sentimento:** novo: análise do texto das observações com API.

Tudo isso pode ser feito **incrementalmente**, com um único módulo de chamada à API e rotas opcionais, sem mudar o comportamento atual do sistema quando a chave da API não estiver configurada ou a API falhar.
