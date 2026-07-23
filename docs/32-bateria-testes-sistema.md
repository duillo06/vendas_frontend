# 32 — Bateria de Testes do Sistema

> **Documento:** Plano de testes exploratórios + regressão (Admin → Storefront)  
> **Produto:** Food Service *(nome comercial provisório)*  
> **Versão:** 1.0  
> **Status:** Em execução  
> **Última atualização:** Julho/2026  
> **Depende de:** `00-portas-locais.md`, `00-product-philosophy.md`, `11-guia-ui-ux.md`, `17-modelo-categoria-produto.md`

---

## 1. Objetivo

Forçar o sistema pelo browser (IDE Agent) até achar bugs reais: fluxos felizes, bordas, validações, erros de API/console e regressões de UI. Cada bug encontrado entra no log, é corrigido e revalidado.

**Ordem:**

1. **Fase A — Admin (backoffice)**  
2. **Fase B — Storefront**  
3. **Fase C — Cruzado** (admin altera → storefront reflete)  
4. **Onda 8 — Débitos A** — fechada (A2.6–A2.7, A3.7–A3.8, A3.10)

---

## 2. Ambiente local

| Serviço | URL |
|---------|-----|
| Admin | http://localhost:5175 |
| Storefront | http://localhost:5174 (tenant: `{subdomain}.localhost:5174`) |
| API | http://localhost:8001/api/v1 |
| Tenant demo | Lanchonete Demo / `admin@demo.com` |

**Pré-requisitos:** API `:8001` + admin `:5175` no ar; Browser Automation = Browser Tab.

**Como executar (agente):** abrir URL → snapshot → fluxo → console + rede → anotar falha → corrigir → retestar o caso.

**Critérios de falha (qualquer um basta):**

- Console com `Error` / exception (exceto avisos irrelevantes de DevTools)
- Request API 4xx/5xx inesperado
- UI travada, botão morto, estado inconsistente
- Texto quebrado / jargão técnico na UI
- Dados salvos não refletem na tela / lista

---

## 3. Convenções do checklist

| Marca | Significado |
|-------|-------------|
| `[ ]` | Pendente |
| `[~]` | Em andamento |
| `[x]` | Passou |
| `[!]` | Falhou — ver log de bugs |
| `[—]` | Bloqueado / fora de escopo agora |

**Severidade:** `P0` bloqueia uso · `P1` fluxo importante · `P2` cosmético / edge

---

## 4. Fase A — Admin (backoffice)

### A0. Smoke & shell

| ID | Caso | Sev | Status |
|----|------|-----|--------|
| A0.1 | Abrir `/login` — formulário carrega | P0 | [x] |
| A0.2 | Login inválido — mensagem clara, não quebra | P1 | [x] |
| A0.3 | Login válido → Dashboard | P0 | [x] |
| A0.4 | Sidebar: todos os itens navegáveis sem erro | P0 | [x] |
| A0.5 | Colapsar / expandir menu | P2 | [x] |
| A0.6 | Som de pedidos on/off persiste | P2 | [x] |
| A0.7 | Notificações abre sem crash | P1 | [x] |
| A0.8 | Sair → volta ao login; rota protegida redireciona | P0 | [x] |
| A0.9 | Refresh em rota autenticada mantém sessão | P0 | [x] |

### A1. Dashboard

| ID | Caso | Sev | Status |
|----|------|-----|--------|
| A1.1 | `/` carrega métricas / cards sem erro | P0 | [x] |
| A1.2 | CTA “criar produto” (se empty) leva ao wizard | P1 | [—] |
| A1.3 | Links rápidos (pedidos, etc.) funcionam | P1 | [x] |
| A1.4 | Console limpo após load | P1 | [x] |

### A2. Categorias

| ID | Caso | Sev | Status |
|----|------|-----|--------|
| A2.1 | Lista / empty state | P0 | [x] |
| A2.2 | Criar categoria (nome + emoji) | P0 | [x] |
| A2.3 | Chip de exemplo preenche e salva | P1 | [x] |
| A2.4 | Contagem plural correta (`1 produto` / `N produtos`) | P1 | [x] |
| A2.5 | Editar nome | P0 | [x] |
| A2.6 | Configurar “como funciona” (receita da categoria) — fluxo completo | P0 | [x] |
| A2.7 | Ver receita já configurada | P1 | [x] |
| A2.8 | Excluir categoria **sem** produtos | P1 | [x] |
| A2.9 | Excluir categoria **com** produtos — confirma com mensagem clara (não bloqueia) | P1 | [x] |
| A2.10 | Nome vazio — botão Adicionar desabilitado | P2 | [x] |

### A3. Produtos — lista & wizard

| ID | Caso | Sev | Status |
|----|------|-----|--------|
| A3.1 | `/produtos` lista / empty state | P0 | [x] |
| A3.2 | Abrir produto da lista → gerenciar | P0 | [x] |
| A3.3 | Pausar / despausar na lista | P1 | [x] |
| A3.4 | Wizard: sem categoria — Continuar bloqueado + aviso | P0 | [x] |
| A3.5 | Wizard feliz: Básico → Tipo → Detalhes → Preço → Criar | P0 | [x] |
| A3.6 | Auto-avanço em Tipo/perguntas **não** pula etapa | P0 | [x] |
| A3.7 | Voltar entre passos mantém dados | P1 | [x] |
| A3.8 | Preço 0 / vazio — Continuar bloqueado | P1 | [x] |
| A3.9 | Sucesso → “Ver produto” abre gerenciar | P0 | [x] |
| A3.10 | Atalho Configurações avançadas → form clássico | P1 | [x] |
| A3.11 | Console: sem `ellipse rx undefined` no mascote | P1 | [x] |
| A3.12 | Criar produto tipo Pizza / Outro (caminhos diferentes do burger) | P1 | [x] |

### A4. Produtos — gerenciar (intents)

Usar o produto de teste (ex.: X-Burger Premium).

| ID | Caso | Sev | Status |
|----|------|-----|--------|
| A4.1 | Página gerenciar carrega header + painel | P0 | [x] |
| A4.2 | Busca de intent filtra atalhos | P1 | [x] |
| A4.3 | Alterar preço (ask → confirm → salva; texto sem espaço antes do `.`) | P0 | [x] |
| A4.4 | Renomear produto | P0 | [x] |
| A4.5 | Editar descrição | P0 | [x] |
| A4.6 | Trocar / adicionar foto (upload + capa) | P0 | [x] |
| A4.7 | Alterar categoria | P1 | [x] |
| A4.8 | Disponibilidade (aparece / aceita pedidos) | P1 | [x] |
| A4.9 | Destaques na vitrine (tags) | P1 | [x] |
| A4.10 | Como você vende (opções / biblioteca) | P0 | [x] |
| A4.11 | Permitir meio a meio (composição) | P1 | [x] |
| A4.12 | Pausar vendas / retomar | P0 | [x] |
| A4.13 | Duplicar produto | P1 | [x] |
| A4.14 | Arquivar produto | P1 | [x] |
| A4.15 | Excluir produto (confirmação) | P1 | [x] |
| A4.16 | Promoção “em breve” — não quebra | P2 | [x] |
| A4.17 | Editor completo (avançado) salva campos | P1 | [x] |
| A4.18 | Cancelar fluxo no meio — estado limpo | P2 | [x] |

### A5. Pedidos

| ID | Caso | Sev | Status |
|----|------|-----|--------|
| A5.1 | `/pedidos` lista / empty / filtros | P0 | [x] |
| A5.2 | Abrir detalhe do pedido | P0 | [x] |
| A5.3 | Transição de status (pending → … → completed) | P0 | [x] |
| A5.4 | Cancelar com motivo | P1 | [x] |
| A5.5 | Registrar pagamento | P1 | [x] |
| A5.6 | Som / badge com pedido novo (se houver) | P1 | [x] |
| A5.7 | Pedido inválido / id inexistente — UX clara | P2 | [x] |

> Se não houver pedidos: criar via storefront (Fase C) ou seed; senão marcar `[—]` e seguir.

### A6. Clientes

| ID | Caso | Sev | Status |
|----|------|-----|--------|
| A6.1 | `/clientes` lista / busca | P0 | [x] |
| A6.2 | Detalhe do cliente | P1 | [x] |
| A6.3 | Histórico de pedidos do cliente (se existir) | P1 | [x] |
| A6.4 | Empty / sem resultados — mensagem clara | P2 | [x] |

### A7. Promoções

| ID | Caso | Sev | Status |
|----|------|-----|--------|
| A7.1 | `/promocoes` carrega | P0 | [x] |
| A7.2 | Criar promoção via assistente (fluxo feliz) | P0 | [x] |
| A7.3 | Editar / desativar promoção | P1 | [x] |
| A7.4 | Validação (sem produto, preço inválido) | P1 | [x] |
| A7.5 | Empty state CTA | P2 | [x] |

### A8. Conexões

| ID | Caso | Sev | Status |
|----|------|-----|--------|
| A8.1 | Hub `/conexoes` carrega | P0 | [x] |
| A8.2 | WhatsApp — tela de conexão (modos simples / Evolution) | P1 | [x] |
| A8.3 | Templates — listar / abrir editor | P1 | [x] |
| A8.4 | Prévia de template | P1 | [x] |
| A8.5 | Providers “Em breve” não quebram | P2 | [x] |

> QR / Evolution real: opcional se infra não estiver no ar — anotar `[—]`.  
> Demo já estava conectada: A8.2 validou o painel (status, templates, teste, desconectar). Wizard hosted/Evolution + QR não reexecutados — `[—]` para pareamento real.

### A9. Configurações

| ID | Caso | Sev | Status |
|----|------|-----|--------|
| A9.1 | `/configuracoes` carrega | P0 | [x] |
| A9.2 | Alterar nome / dados da loja e salvar | P0 | [x] |
| A9.3 | Logo upload (se houver) | P1 | [x] |
| A9.4 | Horários de funcionamento | P1 | [x] |
| A9.5 | Taxa de entrega / pedido mínimo | P1 | [x] |
| A9.6 | Tema / cores | P1 | [x] |
| A9.7 | Cancelar edição — não persiste lixo | P2 | [x] |

### A10. Regressões já vistas (smoke)

| ID | Caso | Sev | Status |
|----|------|-----|--------|
| A10.1 | Mascote Flow sem erro SVG `rx` | P1 | [x] |
| A10.2 | Wizard Tipo/pergunta: Continuar não compete com auto-avanço | P0 | [x] |
| A10.3 | Plural categorias | P1 | [x] |
| A10.4 | Confirm preço: `De R$ X para R$ Y.` (sem espaço antes do `.`) | P2 | [x] |

---

## 5. Fase B — Storefront

> **Porta:** `http://demo.localhost:5174` (ou `localhost:5174` + tenant demo)  
> Critério: qualquer falha no caminho até o pedido é P0 até corrigir.

| ID | Caso | Sev | Status |
|----|------|-----|--------|
| B1.1 | Home carrega (vitrine / saudação / aberto-fechado) | P0 | [x] |
| B1.2 | Cardápio / categorias / busca | P0 | [x] |
| B1.3 | Detalhe do produto (preço, foto, opções) | P0 | [x] |
| B1.4 | Add ao carrinho com opção (demo: Adicionais opcional) | P0 | [x] |
| B1.5 | Carrinho: qty / remover / total / empty | P0 | [x] |
| B2.1 | Checkout retirada — fluxo feliz | P0 | [x] |
| B2.2 | Checkout entrega (+ taxa) — fluxo feliz | P0 | [x] |
| B2.3 | Validação: telefone inválido / campos vazios | P0 | [x] |
| B2.4 | Pedido mínimo (frontend ou API) | P0 | [x] |
| B2.5 | Entrega em cidade fora da área | P1 | [x] |
| B2.6 | Confirmação + acompanhamento do pedido | P0 | [x] |
| B3.1 | Produto indisponível não vende | P0 | [x] |
| B3.2 | Promo ativa: preço riscado (se houver) | P1 | [x] |
| B3.3 | Mobile viewport estreito — CTA de compra usável | P1 | [x] |
| B3.4 | Console sem erros críticos no happy path | P1 | [x] |

> Loja fechada / horário: preferir Fase C (C5) ou forçar `is_open` no admin se precisar nesta onda.  
> **Onda 6:** promo do X-Burger estava pausada → B3.2 validado como “sem preço riscado” (base R$ 32,50). Área de entrega foi setada temporariamente a SP para B2.5 e restaurada vazia.

---

## 6. Fase C — Cruzado Admin ↔ Storefront

> **Admin:** `http://localhost:5175` — `admin@demo.com` / `demo1234`  
> **Storefront:** `http://demo.localhost:5174`  
> Critério: alteração no admin deve refletir no storefront (e pedido no storefront no admin) sem refresh “mágico” além do esperado (reload/navegação ok).

| ID | Caso | Sev | Status |
|----|------|-----|--------|
| C1 | Novo produto no admin → aparece no storefront | P0 | [x] |
| C2 | Pausar / arquivar → some do cardápio (ou CTA indisponível) | P0 | [x] |
| C3 | Preço alterado → storefront atualiza | P0 | [x] |
| C4 | Promoção ativa → preço riscado / destaque | P1 | [x] |
| C5 | Loja fechada (`is_open` / horário) → checkout bloqueado | P0 | [x] |
| C6 | Pedido no storefront → aparece no admin (lista/detalhe) | P0 | [x] |

---

## 7. Log de bugs

| # | Data | Fase | Caso | Sev | Sintoma | Correção | Reteste |
|---|------|------|------|-----|---------|----------|---------|
| 1 | 2026-07-23 | A | A3 / A4 | P1 | SVG `ellipse rx undefined` (FlowMascot) | Animar `scaleX` | [x] |
| 2 | 2026-07-23 | A | A3.6 | P0 | Continuar + auto-avanço pulava etapa | Continuar off em segment/question; timers limpos | [x] |
| 3 | 2026-07-23 | A | A2.4 | P2 | “0 produto s” | String única de plural | [x] |
| 4 | 2026-07-23 | A | A4.3 / A10.4 | P2 | Espaço antes do `.` no confirm de preço | Template `formatCurrency(price).` | [x] |
| 5 | 2026-07-23 | A | A1.1 | P2 | Progresso do dia: `1/1 em andamento` com pedido concluído | Texto → `fora da fila` | [x] |
| 6 | 2026-07-23 | A | A1.1 | P2 | KPI faturamento: `1 concluídos` | Plural: `1 concluído` | [x] |
| 7 | 2026-07-23 | A | A2.6 | P2 | Pergunta da receita: “esta categoria… vendido” | Capitalize + `vendida` | [x] |
| 8 | 2026-07-23 | A | A4.12 | P2 | Card “Pausar as vendas” com produto pausado: “Já está pausado” sem CTA Retomar | Label/emoji dinâmicos + fluxo abre em “Disponível” | [x] |
| 9 | 2026-07-23 | A | A4.10 | P0 | Dialog aninhado do assistente fechava o IntentFlow pai (Chromium) — vínculo local sumia | `assistantPresentation="panel"` no OptionsIntentFlow | [x] |
| 10 | 2026-07-23 | A | A4.10 | P0 | “Salvar e usar neste produto” gravava biblioteca/preços mas não `product_option_groups` | Assistente persiste vínculo + preços no PATCH do produto | [x] |
| 11 | 2026-07-23 | A | A4.10 | P2 | Item criado na hora não aparecia na checklist da biblioteca | `libraryItems` inclui choices do rascunho | [x] |
| 12 | 2026-07-23 | A | A4.10 | P2 | KPI “Como vende”: `1 itens` | Plural: `1 item` | [x] |
| 13 | 2026-07-23 | A | A5.2 | P2 | Timeline: `por <uuid>` em vez do nome | `changed_by` = nome do employee no serializer | [x] |
| 14 | 2026-07-23 | A | A5.7 | P2 | Pedido inexistente: skeleton infinito | Separar loading vs `isError` + “Pedido não encontrado” | [x] |
| 15 | 2026-07-23 | A | A6.1 | P2 | Lista de clientes: `1 pedidos` | Plural: `1 pedido` | [x] |
| 16 | 2026-07-23 | A | A6.2 | P2 | Cliente inexistente: skeleton infinito | Mesmo padrão do pedido + “Cliente não encontrado” | [x] |
| 17 | 2026-07-23 | B | B1.3 / B3.3 | P0 | Barra fixa “Adicionar” cobria checkboxes de adicionais | `pb`/`scroll-mb` maiores no detalhe + grupos | [x] |
| 18 | 2026-07-23 | B | B2.5 | P2 | Aviso fora da área: espaço antes do `.` (`Campinas .` / `(SP) .`) | Mensagem em template string única | [x] |
| 19 | 2026-07-23 | C | C5 | P0 | Loja fechada: API bloqueava, mas checkout ainda abria o formulário | EmptyState no checkout quando `!is_open` | [x] |
| 20 | | | | | | | |

---

## 8. Ordem de execução sugerida (ondas)

Para forçar o sistema sem ficar andando em círculos:

1. **Onda 1 — Fundação:** A0 → A1 → A2 → A3 (smoke + catálogo base)  
2. **Onda 2 — Autoria profunda:** A4 (todos os intents) + A3.12  
3. **Onda 3 — Operação:** A5 → A6  
4. **Onda 4 — Crescimento:** A7 → A8 → A9  
5. **Onda 5 — Regressão rápida:** A10  
6. **Onda 6 — Storefront:** Fase B  
7. **Onda 7 — Cruzado:** Fase C  
8. **Onda 8 — Débitos A:** A2.6–A2.7, A3.7–A3.8, A3.10 — **fechada**  

Em cada onda: executar → logar bugs → corrigir → retestar casos falhos → só então avançar.

---

## 9. Dados de teste sugeridos

| Entidade | Valor sugerido |
|----------|----------------|
| Categoria | 🍔 Lanches (já pode existir) |
| Produto A | X-Burger Especial |
| Produto B | (criar) Pizza Teste / Suco Teste |
| Preço | valores ≠ 0; mudança perceptível (ex. 29,90 → 32,50) |
| Não destruir | evitar excluir o único produto até ter B |

---

## 10. Histórico

| Versão | Data | Notas |
|--------|------|-------|
| 1.0 | Jul/2026 | Documento criado; Fase A detalhada; bugs 1–4 já corrigidos em sessão anterior |
| 1.1 | 2026-07-23 | Onda 1 executada (A0–A3 smoke); bugs 5–7 corrigidos |
| 1.2 | 2026-07-23 | Onda 2 parcial: A3.12 + A4 (preço, rename, disponibilidade, busca); bug 8 aberto |
| 1.3 | 2026-07-23 | Bug 8 corrigido; A4.12 pausar/retomar retestado OK |
| 1.4 | 2026-07-23 | Onda 2 quase fechada: A4 restante (desc, foto, cat, vitrine, meio a meio, dup/arch/del, editor); A4.10 [~] |
| 1.5 | 2026-07-23 | A4.10 fechado: bugs 9–12 (dialog aninhado, vínculo no assistente, checklist, plural); Onda 2 completa |
| 1.6 | 2026-07-23 | Onda 3 (A5–A6) fechada; bugs 13–16 (timeline nome, 404 pedido/cliente, plural clientes) |
| 1.7 | 2026-07-23 | Onda 4 (A7–A9) fechada sem bugs novos; promo X-Burger criada; settings demo atualizados (taxa/mínimo/horário/slogan) |
| 1.8 | 2026-07-23 | Onda 5 (A10) re-smoke OK: mascote sem SVG rx; Continuar off em tipo/pergunta; plural `1 produto`; confirm preço sem espaço antes do `.` |
| 1.9 | 2026-07-23 | Onda 6 (Fase B) fechada: retirada #0004 R$37,50; entrega #0005 R$38,00 (+taxa 5,50); min order 422; cidade fora da área; indisponível CTA off; promo pausada sem riscado; mobile CTA OK; bugs 17–18 |
| 1.10 | 2026-07-23 | Onda 7 (Fase C) fechada: C1 Suco Onda Sete; C2 arquivado some do cardápio; C3 preço 34,90; C4 promo 22,90/34,90; C5 fechado UI+API; C6 #0006 no admin; bug 19 |
| 1.11 | 2026-07-23 | Onda 8 (débitos A) fechada: A2.6 receita Pizzas (Média/Grande) + aplicar “Decido depois”; A2.7 árvore só leitura; A3.7 Voltar mantém dados; A3.8 preço R$0 Continuar off; A3.10 → `/produtos/novo/avancado`; sem bugs novos |
