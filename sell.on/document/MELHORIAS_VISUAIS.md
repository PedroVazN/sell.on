# Melhorias visuais – Sell.On

Sugestões práticas para evoluir a interface sem mudar a estrutura do sistema.

---

## 1. Carteira (página atual)

- **StatsCard:** Ícone ao lado do número (ex.: ícone de pessoas), borda sutil com cor primária no hover, sombra leve.
- **Botão "Transferir clientes":** Estado de hover mais marcado (leve scale ou brilho), possível ícone de seta após o texto no hover.
- **Tabela:** Linhas com hover mais suave; primeira coluna (Razão Social) com peso de fonte um pouco maior; zebra opcional (linhas alternadas com fundo 2–3% mais claro).
- **Modal Transferir:** Entrada do modal com animação (ex.: `scaleIn` ou `slideUp` já existentes no GlobalStyles); lista com hover por item mais claro; contador "X selecionado(s)" em destaque (badge ou cor primária).

---

## 2. Tema e consistência

- **Tipografia:** Garantir uso de `theme.spacing` e `theme.borderRadius` nas páginas que ainda usam valores fixos (ex.: Carteira com `32px`, `12px`).
- **Cores:** Trocar hex fixos (ex.: `#0a0a0f`, `#111827`) por `theme.colors.background.*` onde fizer sentido.
- **Transições:** Usar `theme.transitions.normal` em hovers de cards e botões para deixar as interações mais uniformes.

---

## 3. Tabelas (geral)

- **Header:** Texto em uppercase com letter-spacing e cor um pouco mais suave.
- **Células:** Padding consistente (ex.: `theme.spacing.md`).
- **Ações:** Botões de ação com hover que muda cor de ícone + fundo (ex.: fundo primário 10% e ícone primário).
- **Empty state:** Ilustração ou ícone maior + texto explicativo + CTA se existir ação principal.

---

## 4. Cards e listas

- **Cards:** Sombra leve no repouso e sombra média no hover (`theme.shadows.small` / `medium`).
- **Listas:** Espaçamento entre itens consistente; divisor sutil entre itens (borda ou linha).
- **Badges (status):** Bordes arredondadas (pill) e contraste suficiente (WCAG).

---

## 5. Modais

- **Overlay:** Backdrop com `backdrop-filter: blur(4px)` para sensação de profundidade.
- **Conteúdo:** Animação de entrada (ex.: `animation: slideUp` ou `scaleIn` do GlobalStyles).
- **Footer:** Botões com hierarquia clara (secundário outline, primário preenchido).

---

## 6. Formulários e inputs

- **Labels:** Sempre visíveis, cor `text.secondary` ou `text.tertiary`.
- **Focus:** Manter e reforçar o `focus-visible` já definido no GlobalStyles em todos os inputs/selects.
- **Erro:** Borda vermelha suave + mensagem abaixo do campo com `theme.colors.error`.

---

## 7. Feedback visual

- **Loading:** Skeleton nas listagens (retângulos animados com `shimmer`) em vez de só spinner.
- **Toasts:** Posição fixa (ex.: canto superior direito), animação de entrada/saída.
- **Botões com loading:** Spinner pequeno ao lado do texto ou no lugar do texto, sem mudar tamanho do botão.

---

## 8. Responsividade

- **Carteira:** Em mobile, tabela em cards (uma linha vira um card) ou scroll horizontal com header fixo.
- **Modais:** `max-height: 90vh` + scroll interno; padding reduzido em telas pequenas.
- **Header da página:** Título e ações em coluna em mobile (stack vertical).

---

## 9. Microinterações

- **Botões:** `transform: scale(0.98)` no `:active` para sensação de clique.
- **Links/ícones clicáveis:** Transição de cor em 0,2s.
- **Checkbox (modal Transferir):** Transição suave ao marcar/desmarcar.

---

## 10. Acessibilidade

- **Contraste:** Revisar textos em `rgba(255,255,255,0.5)` e garantir ratio ≥ 4.5:1 onde for texto principal.
- **Foco:** Manter e testar navegação por teclado (Tab) em modais e formulários.
- **Ária:** Botões só de ícone com `aria-label`; listas com `role="list"` onde apropriado.

---

## Ordem sugerida de implementação

1. Carteira: StatsCard + hover da tabela + animação do modal Transferir.  
2. Tema: trocar valores fixos por `theme` na Carteira.  
3. Modais: backdrop blur + animação de entrada.  
4. Botões: `:active` scale e transições do tema.  
5. Loading: skeleton em uma listagem principal (ex.: Propostas ou Carteira).

Se quiser, podemos começar por um item específico (ex.: só Carteira ou só modais) e eu te passo os trechos de código.
