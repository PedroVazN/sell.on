# Sales Funnel (CRM) — Especificação Técnica e Guia de Implementação

## 1. Visão geral

Módulo de funil de vendas integrado ao sistema de vendas existente (sell.on), com pipeline configurável, oportunidades (deals) vinculadas a clientes, drag-and-drop, histórico de auditoria, atividades e conversão em venda.

---

## 2. Estrutura de pastas sugerida (React)

```
frontend/src/
├── components/
│   ├── Base/                    # Já existente
│   ├── Funnel/
│   │   ├── PipelineBoard/       # Kanban principal
│   │   │   ├── index.tsx
│   │   │   └── styles.ts
│   │   ├── PipelineColumn/     # Coluna por estágio
│   │   │   ├── index.tsx
│   │   │   └── styles.ts
│   │   ├── DealCard/            # Card de oportunidade
│   │   │   ├── index.tsx
│   │   │   └── styles.ts
│   │   ├── DealModal/           # Criar/editar oportunidade
│   │   │   ├── index.tsx
│   │   │   └── styles.ts
│   │   ├── StageModal/          # CRUD estágios
│   │   │   ├── index.tsx
│   │   │   └── styles.ts
│   │   ├── LossReasonModal/     # Motivo de perda (obrigatório)
│   │   │   ├── index.tsx
│   │   │   └── styles.ts
│   │   ├── ActivityList/        # Atividades e follow-ups
│   │   │   ├── index.tsx
│   │   │   └── styles.ts
│   │   └── FunnelFilters/       # Filtros (vendedor, estágio, data, status)
│   │       ├── index.tsx
│   │       └── styles.ts
│   └── ... (demais existentes)
├── contexts/
│   ├── FunnelContext.tsx        # Estado do funil (pipelines, deals, filtros)
│   └── ...
├── hooks/
│   ├── useFunnel.ts             # Hook para dados do funil + optimistic updates
│   └── ...
├── pages/
│   └── Funnel/
│       ├── index.tsx            # Página principal (Kanban + toggle Lista)
│       └── styles.ts
├── services/
│   └── api.ts                   # Adicionar endpoints do funil
└── types/
    └── funnel.ts                # Tipos: PipelineStage, Opportunity, Activity, etc.
```

---

## 3. Hierarquia de componentes

```
Funnel (page)
├── FunnelFilters
├── ViewToggle (Kanban | Lista)
├── PipelineBoard (Kanban)
│   └── PipelineColumn[] (por estágio)
│       └── DealCard[] (por oportunidade)
│           └── [click] → DealModal
├── DealListView (tabela alternativa)
│   └── DealRow[] → [click] → DealModal
├── DealModal
│   ├── Form (client, stage, value, probability, date, source, etc.)
│   └── ActivityList → ActivityItem (task, call, message)
├── StageModal (admin: CRUD estágios)
└── LossReasonModal (ao marcar como perdida)
```

---

## 4. Contrato da API (REST)

Base URL: `/api/funnel` (ou `/api/pipelines` + `/api/opportunities` separados, conforme preferência).

### 4.1 Estágios do pipeline (Pipeline Stages)

| Método | Endpoint | Descrição | Acesso |
|--------|----------|-----------|--------|
| GET | `/api/funnel/stages` | Listar estágios (ordenados por `order`) | admin, vendedor |
| POST | `/api/funnel/stages` | Criar estágio | admin |
| PUT | `/api/funnel/stages/:id` | Atualizar estágio | admin |
| DELETE | `/api/funnel/stages/:id` | Soft delete estágio | admin |
| PATCH | `/api/funnel/stages/reorder` | Reordenar estágios | admin |

**Payload POST/PUT Stage:**
```json
{
  "name": "Proposta enviada",
  "order": 2,
  "color": "#3b82f6",
  "isWon": false,
  "isLost": false
}
```

**Resposta lista:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "Qualificação",
      "order": 1,
      "color": "#6b7280",
      "isWon": false,
      "isLost": false,
      "isDeleted": false,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

### 4.2 Oportunidades (Deals)

| Método | Endpoint | Descrição | Acesso |
|--------|----------|-----------|--------|
| GET | `/api/funnel/opportunities` | Listar (filtros: seller, stage, status, dateFrom, dateTo) | admin vê todas; vendedor só as suas |
| GET | `/api/funnel/opportunities/:id` | Detalhe (com atividades e histórico) | admin ou responsável |
| POST | `/api/funnel/opportunities` | Criar oportunidade | admin, vendedor |
| PUT | `/api/funnel/opportunities/:id` | Atualizar | admin ou responsável |
| PATCH | `/api/funnel/opportunities/:id/stage` | Mover estágio (drag-and-drop) | admin ou responsável |
| PATCH | `/api/funnel/opportunities/:id/status` | Marcar won/lost (lost exige lossReasonId) | admin ou responsável |
| POST | `/api/funnel/opportunities/:id/convert` | Converter em venda (one-click) | admin ou responsável |
| DELETE | `/api/funnel/opportunities/:id` | Soft delete | admin |

**Payload POST/PUT Opportunity:**
```json
{
  "client_id": "ObjectId",
  "responsible_user_id": "ObjectId",
  "stage_id": "ObjectId",
  "title": "Negócio Empresa X - Licenças",
  "estimated_value": 15000.50,
  "win_probability": 60,
  "expected_close_date": "2025-03-15",
  "lead_source": "site",
  "description": "opcional",
  "next_activity_at": "2025-02-20T14:00:00Z"
}
```

**Resposta oportunidade (com populates):**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "client": { "_id": "...", "razaoSocial": "...", "contato": { ... } },
    "responsible_user": { "_id": "...", "name": "...", "email": "..." },
    "stage": { "_id": "...", "name": "...", "order": 2, "color": "..." },
    "title": "...",
    "estimated_value": 15000.50,
    "win_probability": 60,
    "expected_close_date": "2025-03-15",
    "lead_source": "site",
    "status": "open",
    "loss_reason": null,
    "converted_sale_id": null,
    "activities": [...],
    "history": [...],
    "createdAt": "...",
    "updatedAt": "...",
    "deletedAt": null
  }
}
```

**PATCH /opportunities/:id/status (perdida):**
```json
{
  "status": "lost",
  "loss_reason_id": "ObjectId"
}
```

### 4.3 Atividades e follow-ups

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/funnel/opportunities/:id/activities` | Listar atividades da oportunidade |
| POST | `/api/funnel/opportunities/:id/activities` | Criar atividade (task, call, message) |
| PUT | `/api/funnel/activities/:activityId` | Atualizar atividade |
| DELETE | `/api/funnel/activities/:activityId` | Soft delete atividade |

**Payload POST Activity:**
```json
{
  "type": "task",
  "title": "Enviar proposta revisada",
  "due_at": "2025-02-20T14:00:00Z",
  "completed_at": null,
  "notes": "opcional"
}
```
`type`: `task` | `call` | `message`

### 4.4 Motivos de perda (Loss Reasons)

| Método | Endpoint | Descrição | Acesso |
|--------|----------|-----------|--------|
| GET | `/api/funnel/loss-reasons` | Listar (ativos) | admin, vendedor |
| POST | `/api/funnel/loss-reasons` | Criar | admin |
| PUT | `/api/funnel/loss-reasons/:id` | Atualizar | admin |
| DELETE | `/api/funnel/loss-reasons/:id` | Soft delete | admin |

**Payload Loss Reason:**
```json
{
  "name": "Preço acima do orçamento",
  "order": 1
}
```

### 4.5 Histórico (audit trail)

- Gerado automaticamente pelo backend em toda mudança de estágio, status ou campos relevantes.
- GET `/api/funnel/opportunities/:id` já retorna `history[]` com: `user`, `action`, `oldValue`, `newValue`, `createdAt`.

---

## 5. Schema do banco de dados (MongoDB / Mongoose)

### 5.1 PipelineStage

| Campo      | Tipo     | Obrigatório | Índices | Observação |
|------------|----------|-------------|---------|------------|
| name       | String   | sim         | -       | Nome do estágio |
| order      | Number   | sim         | sim     | Ordem no Kanban |
| color      | String   | não         | -       | Hex (ex: #3b82f6) |
| isWon      | Boolean  | -           | -       | default false |
| isLost     | Boolean  | -           | -       | default false |
| isDeleted  | Boolean  | -           | sim     | default false (soft delete) |
| deletedAt  | Date     | não         | -       | |
| createdAt  | Date     | auto        | -       | |
| updatedAt  | Date     | auto        | -       | |

### 5.2 Opportunity

| Campo               | Tipo     | Obrigatório | Índices | Observação |
|---------------------|----------|-------------|---------|------------|
| client              | ObjectId ref Client | sim | sim | FK cliente |
| responsible_user    | ObjectId ref User   | sim | sim | Vendedor responsável |
| stage               | ObjectId ref PipelineStage | sim | sim | Estágio atual |
| title               | String   | sim         | text    | |
| estimated_value     | Number   | sim         | sim     | |
| win_probability     | Number   | não         | -       | 0–100 |
| expected_close_date | Date     | não         | sim     | |
| lead_source         | String   | não         | sim     | site, indicacao, evento, etc. |
| description         | String   | não         | -       | |
| next_activity_at    | Date     | não         | sim     | Próxima atividade |
| status              | String   | sim         | sim     | open \| won \| lost |
| loss_reason         | ObjectId ref LossReason | não | - | Obrigatório se status=lost |
| converted_sale      | ObjectId ref Sale   | não | sim | Preenchido ao converter |
| isDeleted           | Boolean  | -           | sim     | default false |
| deletedAt           | Date     | não         | -       | |
| createdAt           | Date     | auto        | sim     | |
| updatedAt           | Date     | auto        | -       | |

### 5.3 OpportunityActivity

| Campo        | Tipo     | Obrigatório | Índices | Observação |
|--------------|----------|-------------|---------|------------|
| opportunity  | ObjectId ref Opportunity | sim | sim | FK |
| type         | String   | sim         | sim     | task \| call \| message |
| title        | String   | sim         | -       | |
| due_at       | Date     | não         | sim     | |
| completed_at | Date     | não         | -       | |
| notes        | String   | não         | -       | |
| createdBy    | ObjectId ref User | sim | - | |
| isDeleted    | Boolean  | -           | sim     | default false |
| deletedAt    | Date     | não         | -       | |
| createdAt    | Date     | auto        | -       | |
| updatedAt    | Date     | auto        | -       | |

### 5.4 OpportunityHistory (audit trail)

| Campo       | Tipo     | Obrigatório | Índices | Observação |
|-------------|----------|-------------|---------|------------|
| opportunity | ObjectId ref Opportunity | sim | sim | FK |
| user        | ObjectId ref User | sim | - | Quem fez a ação |
| action      | String   | sim         | -       | stage_changed, status_changed, created, updated |
| field       | String   | não         | -       | Nome do campo alterado |
| oldValue    | Mixed    | não         | -       | |
| newValue    | Mixed    | não         | -       | |
| createdAt   | Date     | auto        | sim     | |

### 5.5 LossReason

| Campo     | Tipo    | Obrigatório | Índices | Observação |
|-----------|---------|-------------|---------|------------|
| name      | String  | sim         | -       | |
| order     | Number  | não         | sim     | Ordem na lista |
| isDeleted | Boolean | -           | sim     | default false |
| deletedAt | Date    | não         | -       | |
| createdAt | Date    | auto        | -       | |
| updatedAt | Date    | auto        | -       | |

### 5.6 Ajuste no modelo Sale (existente)

- Adicionar campo opcional: `opportunity` (ObjectId ref Opportunity), para rastrear venda originada do funil.
- Na conversão “one-click”: criar documento Sale a partir da Opportunity (cliente da oportunidade → customer da venda; responsible_user → seller; total inicial pode vir de estimated_value ou ser editável no modal de conversão).

---

## 6. Controle de acesso (RBAC)

- **admin**: CRUD estágios, CRUD motivos de perda, ver todas as oportunidades, editar qualquer oportunidade, converter em venda.
- **vendedor**: Ver estágios e motivos de perda (somente leitura). Ver/editar apenas oportunidades em que `responsible_user_id` seja ele; criar oportunidades; mover estágio, marcar won/lost (com motivo obrigatório se lost), converter suas oportunidades em venda.
- Rotas protegidas com `auth` + `authorize('admin','vendedor')`; em GET opportunities filtrar por `responsible_user` quando role === 'vendedor'.

---

## 7. UI/UX — Diretrizes

- Interface limpa no estilo CRM: cards compactos, cores por estágio, boa hierarquia visual.
- **Deals parados**: indicar visualmente (ex.: borda ou ícone de alerta) quando `expected_close_date` já passou e status ainda é `open`, ou quando não há atividade recente (ex. > 7 dias).
- Nos cards: exibir **valor estimado**, **próxima atividade** (data/tipo) e **probabilidade** de forma clara.
- Filtros sempre visíveis (vendedor, estágio, período, status) com contagem de deals por estágio.
- Kanban: lazy loading por coluna (carregar deals da coluna ao entrar no viewport ou ao expandir).
- Tabela/lista como alternativa ao Kanban: mesmos filtros, ordenação por valor, data, estágio.
- Conversão em venda: botão “Converter em venda” no DealModal; abrir fluxo (modal ou página) para confirmar dados da venda e então POST em `/api/funnel/opportunities/:id/convert` e redirecionar para a venda criada.

---

## 8. Estado no frontend (Context API recomendado)

- **FunnelContext**: listas de `stages`, `opportunities` (agrupadas por stage para Kanban), `lossReasons`, `filters` (seller, stageId, status, dateFrom, dateTo), `viewMode` (kanban | list).
- Ações: `fetchStages`, `fetchOpportunities`, `updateFilters`, `moveDeal(stageId)`, `createDeal`, `updateDeal`, `markWon`, `markLost`, `convertToSale`.
- **Optimistic updates**: ao arrastar card, atualizar estado local imediatamente; em caso de erro na API, reverter e exibir toast.

---

## 9. MVP (escopo mínimo) + roadmap de evolução

### MVP (Fase 1)
- [ ] CRUD estágios (admin).
- [ ] CRUD oportunidades com campos mínimos (client_id, responsible_user_id, stage_id, title, estimated_value, win_probability, expected_close_date, lead_source, status).
- [ ] Kanban com drag-and-drop entre estágios.
- [ ] Filtros: vendedor, estágio, status.
- [ ] Histórico automático (mudança de estágio e status).
- [ ] Motivo de perda obrigatório ao marcar como perdida; CRUD motivos (admin).
- [ ] Conversão oportunidade → venda (one-click) com vínculo Sale.opportunity.
- [ ] Lista/tabela alternativa à visualização Kanban.
- [ ] Atividades (tasks) básicas: criar e listar por oportunidade.

### Fase 2
- [ ] Atividades: tipos call e message; due_at e completed_at.
- [ ] Lazy loading no Kanban (virtualização ou paginação por coluna).
- [ ] Indicadores visuais de deal parado (data de fechamento passada, sem atividade).
- [ ] Relatório de funil (quantidade e valor por estágio).

### Fase 3
- [ ] Metas por estágio ou por vendedor.
- [ ] Notificações (próxima atividade, deal parado).
- [ ] Exportação (CSV/Excel) do funil.
- [ ] Campos customizáveis por estágio (opcional).

---

## 10. Comandos úteis (não executar automaticamente)

```bash
# Backend - instalar dependências (se necessário)
cd backend && npm install

# Frontend - instalar dependências para drag-and-drop (ex.: @dnd-kit ou react-beautiful-dnd)
cd frontend && npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

Documento pronto para guiar a implementação do módulo Sales Funnel no sell.on.
