# Funil de Vendas — Admin x Vendedor

## Quem é quem

- **Admin:** quem comanda o sistema. Cria usuários, configura estágios do funil, motivos de perda e **vê todas as oportunidades de todos os vendedores**.
- **Vendedor:** só vê e mexe nas **próprias oportunidades** (onde ele é o responsável). Não configura o funil.

---

## O que cada um pode fazer

| Ação | Admin | Vendedor |
|------|--------|----------|
| **Ver estágios do pipeline** | ✅ Sim | ✅ Sim (só leitura) |
| **Criar / editar / excluir / reordenar estágios** | ✅ Sim | ❌ Não |
| **Ver motivos de perda** | ✅ Sim | ✅ Sim (só leitura) |
| **Criar / editar / excluir motivos de perda** | ✅ Sim | ❌ Não |
| **Ver oportunidades** | ✅ Todas (de todos os vendedores) | ✅ Só as **suas** (onde ele é responsável) |
| **Criar oportunidade** | ✅ Sim (pode atribuir a qualquer vendedor) | ✅ Sim (só pode se atribuir a **si mesmo**) |
| **Editar oportunidade** | ✅ Qualquer uma | ✅ Só as **suas** |
| **Mover card entre estágios (drag)** | ✅ Qualquer uma | ✅ Só as **suas** |
| **Marcar ganha/perdida** | ✅ Qualquer uma | ✅ Só as **suas** |
| **Converter em venda** | ✅ Qualquer uma | ✅ Só as **suas** |
| **Excluir oportunidade (soft delete)** | ✅ Sim | ❌ Não |
| **Ver/ criar/ editar atividades** | ✅ Em qualquer oportunidade que ele possa editar | ✅ Só nas **suas** oportunidades |

---

## Onde a lógica está no código

### Backend (`backend/routes/funnel.js`)

- **`authorize('admin')`** — só admin: POST/PUT/DELETE de estágios, reordenar estágios, POST/PUT/DELETE de motivos de perda, DELETE de oportunidade.
- **`authorize('admin', 'vendedor')`** — os dois: GET estágios, GET motivos de perda, listar/criar/editar/mover/ganhar/perder/convertir oportunidades e atividades.
- **`buildOpportunityQuery(req)`** — na listagem de oportunidades: se for `vendedor`, filtra por `responsible_user = req.user._id`; admin não tem esse filtro (vê todas).
- **`canEditOpportunity(req, opp)`** — para editar/mover/ganhar/perder/convertir/atividades: admin pode qualquer uma; vendedor só se for o `responsible_user` da oportunidade.
- **POST oportunidade:** se for `vendedor`, o backend só aceita `responsible_user_id` igual ao próprio usuário (senão 403).

### Frontend

- **AuthContext:** vendedor tem permissão `'funnel'`, então acessa a página do Funil.
- **Página Funil:** o botão “Estágios” (configurar estágios) só aparece para **admin** (`isAdmin = user?.role === 'admin'`).
- **Filtro por vendedor:** hoje existe no contexto; na prática só faz sentido para admin (vendedor já vê só as suas). Pode esconder o filtro “Vendedor” quando for vendedor.

---

## Resumo em uma frase

- **Admin:** configura o funil (estágios e motivos de perda) e vê/gerencia **todas** as oportunidades.
- **Vendedor:** usa o funil já configurado e vê/gerencia **só as oportunidades dele** (portfólio do vendedor).
