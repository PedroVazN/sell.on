# Melhorias reais para um CRM completo – Sell.On

Documento com **updates reais** alinhados a um sistema CRM completo, com base no que já existe no projeto e no que falta para fechar o ciclo.

---

## 1. O que já existe (resumo)

| Área | Existe no sistema |
|------|--------------------|
| **Contatos/Clientes** | Model `Client` (CNPJ, razão social, contato, endereço, classificação, `assignedTo`). Página Clientes com lista, modal de edição, busca. |
| **Propostas** | Model `Proposal` (status, itens, cliente, vendedor, datas). Listagem, criação, edição, PDF, filtros (status, vendedor, datas), export CSV/Excel/PDF. |
| **Funil/Oportunidades** | Models `Opportunity`, `PipelineStage`, `OpportunityActivity`, `OpportunityHistory`. Página Funnel, integração com propostas (ganho/perda). |
| **Atividades** | Model `OpportunityActivity` (task, call, message) ligado a Opportunity. Backend em funnel. |
| **Leads** | Página Leads. (Verificar se consome API de leads ou é estática.) |
| **Calendário** | Model `Event`. Página Calendar. |
| **Metas** | Model `Goal`. Página Goals. Recálculo por vendas fechadas. |
| **Vendas** | Model `Sale`. Página Sales. |
| **Produtos e listas** | Products, PriceList. Páginas correspondentes. |
| **Usuários e permissões** | User (admin/vendedor). Página Users. Auth JWT. |
| **Notificações e avisos** | Notices, Notifications. |
| **Relatórios e IA** | Reports, AIDashboard, score de proposta, recomendações. |
| **Chat** | Chats (e proposta-chat em algum momento). |

Ou seja: a **base de um CRM** já está (clientes, propostas, funil, atividades, metas, calendário). O que falta é **completar fluxos, visibilidade e consistência** de uso.

---

## 2. Gaps vs CRM completo (por pilar)

### 2.1 Contatos e histórico no cliente

- **Falta:** Timeline única do cliente (propostas + oportunidades + atividades + observações) em um só lugar.
- **Falta:** “Próxima ação” visível por cliente (tarefa/ligação pendente).
- **Falta:** Listar propostas e oportunidades **dentro da ficha do cliente** (não só na lista geral).
- **Falta:** Atividades ligadas ao **cliente** (não só à oportunidade), para histórico de ligações/reuniões mesmo sem proposta aberta.

### 2.2 Pipeline e vendas

- **Falta:** Valor total do pipeline por estágio (previsão de receita).
- **Falta:** Relatório de conversão por estágio (quantos entram/saem de cada etapa).
- **Falta:** Motivos de perda consolidados (já existe em proposta; falta visão analítica no dashboard/relatórios).
- **Falta:** Vínculo explícito Proposta ↔ Oportunidade em toda a jornada (criação, mudança de estágio, ganho/perda).

### 2.3 Atividades e tarefas

- **Falta:** Lista de tarefas do dia/semana do vendedor (a partir de `OpportunityActivity` + `due_at`).
- **Falta:** Lembretes (notificação ou badge) para atividades vencidas ou próximas.
- **Falta:** Criar atividade rápida a partir da ficha do cliente ou da proposta (sem passar só pelo funil).

### 2.4 Comunicação e documentos

- **Falta:** Histórico de interações por cliente (chamada, email, WhatsApp) registrado e exibido em timeline.
- **Falta:** Anexos/documentos por cliente ou por proposta (armazenar referência ou arquivo).
- **Falta:** Log de “quem fez o quê” (quem criou/alterou proposta, estágio, etc.) – auditoria simples.

### 2.5 Relatórios e previsão

- **Falta:** Relatório de previsão de fechamento (valor em aberto por estágio/vendedor + data esperada).
- **Falta:** Relatórios salvos (filtros + período salvos pelo usuário).
- **Falta:** Exportação padronizada (CSV/Excel) em mais telas (Clientes, Oportunidades, Vendas, Metas).

### 2.6 Dados e governança

- **Falta:** Histórico de alterações (auditoria) em entidades críticas: proposta, cliente, oportunidade.
- **Falta:** Detecção (e opcionalmente merge) de clientes duplicados (mesmo CNPJ ou mesmo email).
- **Falta:** Campos obrigatórios e validações consistentes (ex.: telefone em cliente, data esperada em oportunidade).

---

## 3. Updates reais que podemos implementar

Cada item abaixo é implementável no backend + frontend atuais, sem mudar de stack.

### 3.1 Timeline e próxima ação por cliente

| O quê | Backend | Frontend |
|-------|---------|----------|
| **Timeline do cliente** | Endpoint `GET /api/clients/:id/timeline` que agrega: propostas do cliente (com status e data), oportunidades, atividades (OpportunityActivity das oportunidades desse cliente). Ordenar por data. | Na ficha do cliente (modal ou página), abas ou seção “Atividade”: lista cronológica (proposta X em data Y, oportunidade Z, tarefa “Ligação” em data W). |
| **Próxima ação** | Incluir no payload do cliente (ou em endpoint específico) a “próxima atividade” com `due_at` mais próxima (e não concluída) entre as oportunidades desse cliente. | Exibir na lista de clientes (coluna ou tooltip) e no topo da ficha: “Próxima ação: Ligar em 12/03”. |
| **Atividade no cliente** | Opção 1: `ClientActivity` (tipo, título, due_at, notes, client, createdBy). Opção 2: reutilizar OpportunityActivity criando “oportunidade genérica” por cliente. Preferível Opção 1 para não poluir funil. | Botão “Nova tarefa/ligação” na ficha do cliente; lista de atividades na timeline. |

### 3.2 Ficha do cliente rica

| O quê | Backend | Frontend |
|-------|---------|----------|
| **Propostas do cliente** | Já existe ou criar `GET /api/proposals?clientId=...` (ou por email/razão). | Na ficha do cliente: tabela “Propostas” (número, status, valor, data) com link para edição. |
| **Oportunidades do cliente** | `GET /api/funnel/opportunities` (ou equivalente) com filtro `client=:id`. | Na ficha: lista “Oportunidades” (título, estágio, valor, data prevista). |
| **Resumo financeiro** | Endpoint `GET /api/clients/:id/summary`: total propostas fechadas, valor total vendido, ticket médio. | Card “Resumo” na ficha: “3 propostas ganhas, R$ 45.000 no último ano”. |

### 3.3 Tarefas e lembretes do vendedor

| O quê | Backend | Frontend |
|-------|---------|----------|
| **Minhas tarefas** | `GET /api/opportunities/activities/mine?dueFrom=&dueTo=` (atividades das oportunidades do vendedor, filtro por due_at, não concluídas). | Página ou widget “Minhas tarefas” (hoje, esta semana, atrasadas) com link para oportunidade/cliente. |
| **Lembrete** | Ao listar atividades, marcar “atrasadas” (due_at < hoje) e “hoje”. Frontend ou backend pode enviar para o centro de notificações. | Badge no menu “Tarefas” com contagem de atrasadas + hoje; lista com destaque visual. |
| **Criar tarefa na proposta** | Se houver tela de proposta, botão “Agendar follow-up”: cria OpportunityActivity na oportunidade vinculada (ou cria oportunidade se não existir). | Modal “Nova tarefa” (título, tipo, data/hora, notas) ao clicar em “Agendar” na proposta. |

### 3.4 Pipeline com valor e conversão

| O quê | Backend | Frontend |
|-------|---------|----------|
| **Valor por estágio** | Em `GET /api/funnel/...` (ou pipeline), incluir soma de `estimated_value` por estágio (abertas). | No Funnel/Kanban: exibir “R$ 120.000” no cabeçalho de cada estágio. |
| **Conversão por estágio** | Endpoint ou campo em relatório: quantidade/valor que “entrou” e “saiu” (ganho/perda) por estágio em um período. | Dashboard ou Relatórios: gráfico ou tabela “Conversão por estágio (últimos 30 dias)”. |
| **Motivos de perda** | Agregar por `loss_reason` nas propostas (ou oportunidades) perdidas. Já existe modelo LossReason. | Gráfico “Motivos de perda” no Dashboard ou em Relatórios. |

### 3.5 Histórico de alterações (auditoria)

| O quê | Backend | Frontend |
|-------|---------|----------|
| **Log de alterações** | Model `AuditLog` (entity: 'proposal'|'client'|'opportunity', entityId, action: 'create'|'update'|'delete', userId, changedFields, createdAt). Middleware ou hooks em save de Proposal/Client/Opportunity. | Na proposta/cliente/oportunidade: aba ou seção “Histórico” listando “Usuário X alterou status em 12/03 às 14h”. |
| **Quem alterou** | Incluir `updatedBy` (ObjectId User) em Proposal e Client (e Opportunity se ainda não tiver). Preencher no update. | Exibir “Última alteração por João em 12/03” na ficha. |

### 3.6 Relatórios e exportação

| O quê | Backend | Frontend |
|-------|---------|----------|
| **Previsão de fechamento** | Endpoint que agrupa oportunidades abertas por `expected_close_date` (mês) e soma `estimated_value`. | Página ou bloco “Previsão de receita” (por mês) com tabela/gráfico. |
| **Export em outras telas** | Reutilizar padrão de export de Propostas: CSV/Excel (e opcionalmente PDF) para Clientes, Oportunidades, Vendas, Metas (com filtros atuais da tela). | Botão “Exportar” em Clientes, Funnel (oportunidades), Vendas, Metas; mesmo padrão de dropdown (CSV, Excel, PDF onde fizer sentido). |
| **Filtros salvos (futuro)** | Model `SavedFilter` (userId, name, entity, queryParams). Endpoints CRUD. | Dropdown “Salvar filtro atual” / “Carregar filtro” nas listagens. |

### 3.7 Dados e qualidade

| O quê | Backend | Frontend |
|-------|---------|----------|
| **Duplicatas de cliente** | Endpoint `GET /api/clients/duplicates?field=cnpj|email`: agrupar por CNPJ ou email e listar grupos com mais de um registro. | Página ou modal “Possíveis duplicatas”; lista com opção “Mesclar” (escolher qual fica e migrar propostas/oportunidades). |
| **Validações** | Reforçar required e format (telefone, email) em Client e Opportunity no backend. | Mensagens claras no frontend ao salvar (ex.: “Preencha o telefone”). |

### 3.8 Experiência e resiliência

| O quê | Backend | Frontend |
|-------|---------|----------|
| **Página 404** | Nenhum (React Router). | Rota catch-all + página “Página não encontrada” com link para home. |
| **Recuperação de senha** | `POST /api/users/forgot-password` (email → token em memória ou DB, link); `POST /api/users/reset-password` (token, nova senha). | Tela “Esqueci minha senha” (email) e tela “Nova senha” (link com token). |
| **Refresh de token** | Renovar JWT antes de expirar (ou refresh token) no auth. | Interceptor no frontend que renova em background e repete a request em caso de 401. |
| **manifest.json** | N/A. | Corrigir JSON para PWA parar de dar erro no console. |

---

## 4. Priorização sugerida (ordem de implementação)

| Prioridade | Bloco | Motivo |
|------------|--------|--------|
| 1 | **Timeline + próxima ação no cliente** | Dá “cara de CRM” e uso diário: tudo do cliente em um lugar. |
| 2 | **Ficha do cliente com propostas e resumo** | Aproveita dados que já existem; aumenta valor da tela de cliente. |
| 3 | **Minhas tarefas + lembretes** | Aproveita `OpportunityActivity`; melhora execução do vendedor. |
| 4 | **Pipeline com valor por estágio** | Decisão e previsão; pouco esforço se o funnel já retorna oportunidades. |
| 5 | **Histórico de alterações (auditoria)** | Confiança e suporte; começar por Proposta ou Cliente. |
| 6 | **Export (Clientes, Oportunidades, Metas)** | Reutilizar código de Propostas; alto retorno. |
| 7 | **Previsão de fechamento** | Depende de oportunidades com `expected_close_date` preenchido. |
| 8 | **Duplicatas + recuperação de senha + 404 + manifest** | Qualidade e segurança; podem ser feitos em paralelo. |

---

## 5. Resumo executivo

- **Já existe:** Clientes, Propostas, Funil, Oportunidades, Atividades (por oportunidade), Metas, Calendário, Vendas, Produtos, Usuários, notificações, IA/score.
- **Updates reais** que fecham o CRM: **timeline e próxima ação por cliente**, **ficha do cliente com propostas e resumo**, **minhas tarefas e lembretes**, **pipeline com valor e conversão**, **auditoria**, **export em mais telas**, **previsão**, **duplicatas**, **recuperação de senha**, **404 e manifest**.

Tudo isso pode ser implementado de forma incremental no backend (Node/Express/Mongo) e frontend (React) atuais, sem mudar de stack.
