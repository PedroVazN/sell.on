# Otimização de performance – Sell.on

## O que impacta a rapidez do site

### 1. **Bundle inicial (first load)**
- **Problema:** Todas as páginas são importadas no `App.tsx` de forma síncrona. O navegador baixa Dashboard, Proposals, AIDashboard, Recharts, etc. antes de mostrar a primeira tela.
- **Solução:** Lazy loading das rotas com `React.lazy()` + `Suspense`. Cada página vira um chunk separado; só o chunk da rota acessada é baixado.
- **Ganho:** Primeira carga bem mais rápida; troca de rota pode ter um pequeno atraso só na primeira vez que a rota é acessada.

### 2. **Requisições pesadas (limit 1000)**
- **Problema:** Proposals, CreateProposal, EditProposal, PriceList e CreatePriceList pedem `getProducts(1, 1000)`, `getDistributors(1, 1000)`, `getUsers(1, 1000)`. Payloads grandes deixam a tela lenta.
- **Solução:**
  - Manter paginação no backend e pedir menos itens por página (ex.: 100 ou 200) e “carregar mais” ou buscar ao digitar.
  - Para selects (vendedor, distribuidor, produto), considerar endpoint de busca (ex.: `GET /products?search=&limit=50`) em vez de trazer 1000 de uma vez.
- **Ganho:** Resposta da API mais rápida e menos uso de memória no front.

### 3. **Sem cache de API**
- **Problema:** Cada ida para Proposals, CreateProposal, etc. refaz as mesmas chamadas (products, distributors, users).
- **Solução:** Cache em memória com TTL curto (ex.: 1–2 min) para listas que mudam pouco (produtos, distribuidores, usuários). Só refazer a requisição quando o TTL expirar ou após criar/editar.
- **Ganho:** Navegação entre telas que usam as mesmas listas fica mais rápida.

### 4. **Bibliotecas pesadas**
- **recharts:** Usado em Dashboard, VendedorDashboard e AIDashboard. Com lazy das rotas, o código do Recharts já fica em chunks separados e não atrasa o primeiro carregamento.
- **jspdf / html2canvas:** Usados na geração de PDF. Podem ficar em dynamic import só no fluxo de “Exportar PDF”.
- **Ganho:** Menos peso no bundle inicial; PDF continua funcionando quando necessário.

### 5. **Re-renders e listas grandes**
- **Problema:** Tabelas com muitas linhas (Proposals, Clientes, etc.) re-renderizam a lista inteira a cada atualização.
- **Solução:**
  - Usar `React.memo` em linhas de tabela quando o componente for “puro”.
  - Para listas muito grandes (centenas de linhas), considerar virtualização (ex.: `react-window`) para renderizar só o que está visível.
- **Ganho:** Interface mais fluida ao rolar e ao atualizar dados.

### 6. **Múltiplos useEffects na mesma tela**
- **Problema:** Várias telas disparam várias requisições em sequência (vários `useEffect` no mount).
- **Solução:** Agrupar em um único `useEffect` e usar `Promise.all` onde as chamadas forem independentes (já feito em parte em Proposals e CreateProposal). Evitar efeitos em cascata (um efeito que depende do resultado de outro) quando puder ser uma única chamada ou um fluxo mais direto.
- **Ganho:** Menos “waterfall” de requests; tempo até a tela pronta menor.

### 7. **Backend**
- Índices no MongoDB nos campos usados em filtros e ordenação (ex.: `status`, `createdAt`, `assignedTo`).
- Compressão gzip no servidor para respostas JSON.
- **Ganho:** Respostas da API mais rápidas.

---

## Ordem sugerida de implementação

1. **Lazy loading das rotas** – maior ganho no primeiro carregamento.
2. **Reduzir limits (1000 → 100/200) ou buscar sob demanda** – melhora tempo de resposta e sensação de fluidez.
3. **Cache simples para products/distributors/users** – melhora navegação entre telas.
4. **React.memo em linhas de tabela** – ganho em listas grandes.
5. **Virtualização** – só se as listas tiverem muitas linhas (ex.: > 100) e ainda estiverem lentas.

---

## Implementado

- **Lazy loading das rotas** – `App.tsx`: páginas carregadas com `React.lazy()` e `<Suspense>`; primeiro carregamento mais leve.
- **Redução de limits (1000 → 200)** – Proposals, CreateProposal, EditProposal, PriceList e CreatePriceList passaram a usar `getProducts(1, 200)`, `getDistributors(1, 200)` e `getUsers(1, 200)`.
- **Cache em memória (TTL 2 min)** – Em `api.ts`: `getProducts`, `getDistributors` e `getUsers` usam cache; invalidação automática em create/update/delete de produto, distribuidor e usuário.
- **React.memo em linhas de tabela** – Componentes memoizados: `ProposalRow` (Proposals), `ClientRow` (Clients), `ProductRow` (Products), `DistributorRow` (Distributors); handlers estáveis com `useCallback` para evitar re-renders desnecessários.
- **Virtualização** – Não implementada; considerar só se listas > 100 linhas continuarem lentas.
