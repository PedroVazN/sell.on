# Funil de Vendas — Status vs Requisitos

## Objetivo
Centralizar negociações em andamento, visualizar em que etapa cada cliente está e acompanhar até o fechamento.

---

## Como funcionam as etapas (Qualificação, Proposta, Negociação, Fechamento)

Cada **coluna** do Kanban é uma **etapa** do pipeline (ex.: Qualificação, Proposta, Negociação, Fechamento). O número em cada coluna é a **quantidade de oportunidades** naquela etapa.

- **Como as oportunidades entram nas colunas**
  - Ao clicar em **Nova oportunidade** e salvar, a oportunidade é criada na **primeira etapa** (ex.: Leads / Contatos iniciais ou Qualificação).
  - Cada oportunidade tem um campo **estágio** (`stage_id`) no banco. O card aparece na coluna cujo estágio é o mesmo desse `stage_id`.

- **Como mover entre as etapas**
  - Clique no **card** da oportunidade para abrir o **detalhe**.
  - No detalhe, use o select **Mover para etapa** e escolha outra etapa (ex.: de Qualificação para Proposta).
  - Ao salvar, o backend atualiza o `stage_id` da oportunidade e o **histórico** registra a mudança. O card passa a aparecer na nova coluna.

- **Resumo**
  - **Qualificação 0** = nenhuma oportunidade com estágio “Qualificação” no momento.
  - Ao criar uma nova oportunidade, ela entra na primeira etapa; ao usar “Mover para etapa” no detalhe, ela passa para a etapa escolhida. Os números das colunas são a contagem de oportunidades por estágio.

---

## Checklist de funcionalidades

| Requisito | Status | Observação |
|-----------|--------|------------|
| **Estrutura** | | |
| Aba Funil no estilo CRM | ✅ | Página `/funnel` com Kanban e Lista |
| Pipeline visual com colunas | ✅ | Kanban com colunas por estágio |
| Etapas: Leads, 1º atendimento, Proposta, Negociação, Fechamento | ⚠️ | Backend usa nomes genéricos; ajustado para seus nomes |
| Etapas personalizáveis | ✅ | CRUD estágios (admin); UI "Estágios" em implementação |
| **Cadastro de oportunidades** | | |
| Nome do cliente / Empresa | ✅ | Via vínculo com cadastro (Client: razaoSocial, nomeFantasia) |
| Telefone / WhatsApp / E-mail | ✅ | Client.contato (exibido no detalhe) |
| Origem do lead | ✅ | lead_source |
| Vendedor responsável | ✅ | responsible_user_id |
| Valor estimado | ✅ | estimated_value |
| Probabilidade de fechamento | ✅ | win_probability |
| Data prevista de fechamento | ✅ | expected_close_date |
| Status da negociação | ✅ | status (open, won, lost) |
| Observações e histórico | ✅ | description + OpportunityHistory + Activities |
| **Gestão da carteira** | | |
| Visualizar por vendedor | ✅ | Filtro no backend; UI de filtros disponível |
| Filtros (etapa, período, vendedor, status) | ✅ | Backend; filtros na tela do funil |
| Busca por nome ou empresa | ✅ | Backend com parâmetro search; campo na tela |
| **Movimentação** | | |
| Arrastar cliente entre etapas | ✅ | Drag-and-drop no Kanban |
| Histórico automático de mudanças | ✅ | OpportunityHistory |
| Motivos de perda | ✅ | loss_reason obrigatório ao marcar perdida |
| **Lembretes e tarefas** | | |
| Follow-ups com data | ✅ | OpportunityActivity (task, call, message) + due_at |
| Alertas de tarefas atrasadas | ⚠️ | Indicador visual no card (opcional) |
| **Integrações** | | |
| Vincular ao cadastro existente | ✅ | client_id → Client |
| Converter em venda ao fechar | ✅ | POST /opportunities/:id/convert |
| **Indicadores (desejável)** | | |
| Valor total do funil / Previsão | ⚠️ | Pode ser adicionado na barra do funil |
| Taxa de conversão / Por vendedor | ⚠️ | Fase 2 |

---

## O que foi implementado nesta entrega

1. **Estágios padrão** alinhados ao seu processo: Leads, Primeiro atendimento, Proposta enviada, Negociação, Fechamento.
2. **Modal Nova oportunidade**: formulário com cliente (busca no cadastro), título, valor, probabilidade, data, origem, vendedor (admin), observações.
3. **Filtros na tela**: vendedor, etapa, período e busca por nome/empresa.
4. **Modal de detalhe** da oportunidade: edição, lista de atividades, adicionar follow-up, marcar ganho/perda (com motivo), converter em venda.
5. **Drag-and-drop** entre colunas no Kanban.
6. **Busca** no backend (GET opportunities?search=).

Com isso o funil fica **funcional** para o dia a dia: cadastrar oportunidades, mover no pipeline, acompanhar e fechar.
