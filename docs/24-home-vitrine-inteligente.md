# 24 — Home: Motor Inteligente de Vitrine

> **Documento:** Filosofia da Home do storefront — Motor Inteligente de Vitrine / Motor de Vendas  
> **Produto:** Food Service *(nome comercial provisório)*  
> **Versão:** 1.5  
> **Status:** Aprovado  
> **Última atualização:** Julho/2026  
> **Depende de:** `00-product-philosophy.md`, `11-guia-ui-ux.md`, `20-promotions-philosophy.md`, `21-marketing-engine.md`  
> **Relacionados:** `22-promotions-architecture.md`  
> **Natureza:** Filosofia + produto — **pilar**. Nomes técnicos abaixo são **internos**.  
> **Arquivo:** `24-home-vitrine-inteligente.md` *(substitui o rascunho `24-home-vitrine-philosophy.md`)*

---

## Sumário

1. [Por que este documento é um pilar](#1-por-que-este-documento-é-um-pilar)
2. [Princípio: o comerciante nunca monta layout](#2-princípio-o-comerciante-nunca-monta-layout)
3. [A Home não é uma lista de componentes](#3-a-home-não-é-uma-lista-de-componentes)
4. [O que a Home deve transmitir](#4-o-que-a-home-deve-transmitir)
5. [Regras invioláveis](#5-regras-invioláveis)
6. [Motor Inteligente de Vitrine](#6-motor-inteligente-de-vitrine)
7. [Motor de Prioridade](#7-motor-de-prioridade)
8. [Prioridade de campanhas / promoções](#8-prioridade-de-campanhas--promoções)
9. [Dedupe (um produto, uma aparição)](#9-dedupe-um-produto-uma-aparição)
10. [Quando não há promoção](#10-quando-não-há-promoção)
11. [Home viva no tempo](#11-home-viva-no-tempo)
12. [Categoria favorita do cliente (futuro)](#12-categoria-favorita-do-cliente-futuro)
13. [Composição visual (shell)](#13-composição-visual-shell)
14. [Hero compacto](#14-hero-compacto)
15. [Barra de mensagens viva](#15-barra-de-mensagens-viva)
16. [Promoções (carrossel de destaque)](#16-promoções-carrossel-de-destaque)
17. [Categorias: chips + trilhos horizontais](#17-categorias-chips--trilhos-horizontais)
18. [Navegação (bottom nav + busca)](#18-navegação-bottom-nav--busca)
19. [Performance](#19-performance)
20. [Anti-padrões](#20-anti-padrões)
21. [Fases de implementação](#21-fases-de-implementação)
22. [Histórico](#22-histórico)

---

## 1. Por que este documento é um pilar

A Home deixa de ser “página inicial bonita” e passa a ser um **Motor Inteligente de Vendas**.

Ela:

- destaca o que importa **agora**;  
- reduz repetição;  
- incentiva descoberta;  
- ajuda o comerciante a **vender mais** sem configurar layout.

Alinha com:

| Doc | Ligação |
|-----|---------|
| `00` | Regra de Ouro; esconder complexidade |
| `20` / `21` | Home viva; marketing como consultor |
| `22` | Campanhas alimentam o motor |

Se um PR de Home conflitar com este arquivo na experiência, **este arquivo vence** (junto com `00`).

---

## 2. Princípio: o comerciante nunca monta layout

Reforço de produto (válido em todo o sistema e **obrigatório** na Home):

> O comerciante **nunca** monta layouts.  
> Ele cadastra produtos, categorias e promoções e responde perguntas simples.  
> O sistema decide **automaticamente** a melhor forma de apresentar tudo.

| Queremos | Não queremos |
|----------|--------------|
| Home **inteligente** | Home **configurável** (drag-and-drop de seções) |
| Decisões no motor | “Escolha quais blocos aparecem” no painel |
| Mesmo shell, conteúdo diferente | Template engessado igual o ano todo |

O comerciante cuida do negócio.  
O sistema cuida da vitrine.

---

## 3. A Home não é uma lista de componentes

**Errado** (mentalidade de página estática):

```text
Header → Hero → Promoções → Categorias → Produtos
```

**Certo** (mentalidade de motor):

A Home é um **Motor Inteligente de Vitrine**.

Ela recebe um **pool** de conteúdos possíveis, por exemplo:

- Promoções e campanhas (com peso)  
- Produtos em destaque / mais vendidos / favoritos da galera  
- Lançamentos  
- Combos  
- Categorias (trilhos)  
- Conteúdo sazonal / eventos especiais  
- (futuro) ofertas por horário, clima, comportamento  

E decide, a cada visita / momento:

| Decisão | Pergunta interna |
|---------|------------------|
| O quê mostrar | Há conteúdo elegível e útil? |
| Em qual ordem | Qual o Motor de Prioridade agora? |
| Qual destaque | Qual campanha tem maior peso? |
| O que esconder | Bloco vazio? Redundante? |
| Quando trocar | Mudou o horário / a campanha / o cliente? |

O layout visual (shell) é estável.  
O **conteúdo e a ordem dos blocos** mudam.

---

## 4. O que a Home deve transmitir

```text
Limpa · Moderna · Elegante · Inteligente
Sem repetições · Fácil de navegar
Comida rápido na tela · Adaptável ao momento
Organizada pelo sistema · Sem layout manual
```

Filtro de cada bloco:

> Isso ajuda o cliente a descobrir um produto ou comprar mais rápido?  
> Se não → não entra na vitrine.

---

## 5. Regras invioláveis

1. **Um produto, no máximo uma aparição** na Home (qualquer bloco de produto).  
2. **Nunca** seção “Todos” / dump do catálogo.  
3. **Nunca** bloco vazio.  
4. **Nunca** Home configurável pelo comerciante no caminho feliz.  
5. **Busca fora da Home** (tela dedicada).  
6. **Primeira dobra = comida** o mais cedo possível (promo ou 1º trilho).  
7. **Sempre** um “primeiro bloco forte” (promo **ou** substituto — §10).  
8. Categorias na Home = **trilhos horizontais** (não lista curta + “Ver todos” escondendo o resto).

---

## 6. Motor Inteligente de Vitrine

Conceito interno (nome de produto para o time): **Vitrine Engine**.

```text
Entradas (pool)
  campanhas, produtos, categorias, contexto (hora, tenant, futuro: cliente)
        ↓
Motor de Prioridade (ordenação de blocos + pesos)
        ↓
Dedupe (claim de productId)
        ↓
Shell (Header, Hero, Ticker, carrosséis, bottom nav)
        ↓
Home renderizada
```

Responsabilidades do motor:

- Escolher blocos elegíveis  
- Ordenar por prioridade contextual  
- Atribuir produtos sem repetir  
- Garantir fallback quando falta promoção  
- Preparar extensão (hora, cliente, sazão) **sem** novo paradigma de UX

Implementação futura: função pura tipo `buildHomeVitrine(context)` — um lugar só; JSX só renderiza o resultado.

---

## 7. Motor de Prioridade

Ordem **base** de famílias de bloco (do mais “vendedor” ao mais estrutural):

```text
1. Campanhas especiais / sazonais (peso alto)
2. Promoções (ofertas de produto)
3. Lançamentos
4. Mais vendidos / Favoritos da galera   ← também fallback do topo (§10)
5. Combos (quando existirem)
6. Trilhos de categoria (ordenados por contexto)
7. Outros blocos futuros
```

Regras:

- Família sem conteúdo elegível → **pula** (não deixa buraco).  
- Dedupe corre **depois** da escolha do bloco: um produto já usado em (2) não entra em (4) nem no trilho.  
- A ordem das **categorias** dentro de (6) muda com o momento (§11) e, no futuro, com o cliente (§12).

A Home **nunca deve parecer a mesma** semana a semana se o conteúdo mudou — o shell é o mesmo; o filme da vitrine muda (Natal ≠ segunda comum).

---

## 8. Prioridade de campanhas / promoções

Nem toda promoção merece o mesmo destaque.

Conceito interno: **peso (weight)** da campanha.

| Exemplo (UI / momento) | Peso ilustrativo |
|------------------------|------------------|
| Promoção comum | 10 |
| Campanha do mês | 100 |
| Oferta relâmpago | 200 |
| Black Friday | 500 |
| Natal / grande sazonal | 600 |

O motor:

- Ordena ofertas do **maior peso** para o menor no carrossel de destaque.  
- Em conflito no mesmo produto, mantém a regra de negócio de preço (ex.: menor `promo_price` no checkout — `22`) e na vitrine prioriza a campanha de **maior peso** para o card em destaque.

Fase 1 de implementação pode usar peso default; o **campo / conceito** nasce na arquitetura para não pintar o time num canto (`20` / `22`).

---

## 9. Dedupe (um produto, uma aparição)

```text
seen = Set<productId>

claim(lista):
  filtra id ∉ seen
  adiciona ao seen
  retorna filtrados
```

Fluxo típico:

1. Bloco de topo (promo ou fallback) → `claim`  
2. Lançamentos / combos → `claim`  
3. Cada trilho de categoria → `claim` dos produtos daquela categoria  

Se, após `claim`, um trilho ficar vazio → **não renderiza** aquele trilho.

O cliente ainda acha o produto na **página da categoria**, na busca ou no detalhe — a Home só não repete.

---

## 10. Quando não há promoção

A Home **nunca** parece vazia no topo.

Se não houver promoção/campanha elegível no bloco de ofertas:

O motor **substitui** automaticamente por um bloco forte, nesta ordem de preferência:

1. Mais vendidos  
2. Favoritos da galera  
3. Novidades / lançamentos  

Sempre existe um **primeiro bloco de descoberta** acima (ou no lugar) do carrossel de promo.

---

## 11. Home viva no tempo

A Home **não** é idêntica o dia inteiro nem o ano inteiro.

Exemplos (documentar agora; implementar por fases):

| Momento | Comportamento do motor |
|---------|------------------------|
| Almoço | Prioriza categorias de refeição / executivos |
| Noite | Prioriza pizzas / lanches da noite |
| Tarde (sorveteria) | Prioriza sorvetes |
| Datas especiais | Sobe campanhas de peso alto (Natal, etc.) |

Futuro (hooks, sem remodelar):

- Horário fino  
- Clima  
- Sazonalidade  
- Comportamento do cliente  

O shell permanece. Só mudam **prioridade e conteúdo**.

---

## 12. Categoria favorita do cliente (futuro)

Se o cliente compra pizza quase sempre, na próxima visita autenticada o motor pode **elevar** o trilho Pizzas na ordem das categorias.

- Arquitetura: sinal de “categoria preferida” no contexto do motor (`preferredCategoryIds`).  
- **Não** é configuração do comerciante.  
- **Fase D (MVP local):** afinidade em `localStorage` (visitas a categoria/produto) + categorias dos favoritos do coração — eleva trilhos sem login.  
- **Futuro:** fundir com histórico autenticado de pedidos no servidor.

---

## 13. Composição visual (shell)

Ordem estável do **chrome** (não confundir com ordem dos blocos de conteúdo do motor):

```text
Header (logo · favoritos · compartilhar · carrinho)
    ↓
Hero compacto (~20% menor que o atual)
    ↓
Barra de mensagens viva (ticker)
    ↓
[ Blocos decididos pelo Motor — ordem dinâmica ]
    ↓
Footer leve
    ↓
Bottom navigation
```

Os blocos do motor tipicamente incluem: destaque de topo (promo ou fallback) → chips de categoria → trilhos horizontais por categoria → (futuro) outros.

---

## 14. Hero compacto

Objetivo: **comida na tela o mais rápido possível**.

- Reduzir cerca de **20%** da altura em relação ao hero atual.  
- Infos essenciais compactas (aberto, tempo, entrega).  
- Não competir com o primeiro bloco de produtos.

---

## 15. Barra de mensagens viva

Não é card. Não é welcome grande. É um **ticker vivo**.

Comportamento:

- Uma mensagem por vez, poucos segundos.  
- Troca natural (fade/slide suave).  
- Ocupa pouca altura; **nunca** compete com carrosséis de comida.

Exemplos de fila:

```text
✨ Hoje tem pizza grande com refrigerante grátis.
🚚 Entrega média de 30 minutos.
🔥 A pizza mais pedida hoje é Calabresa Especial.
💳 Aceitamos Pix.
🎉 Novo sabor disponível.
```

Fonte das mensagens: settings, campanhas ativas, stats leves, horário — montadas pelo sistema.

---

## 16. Promoções (carrossel de destaque)

- Carrossel horizontal, cards **maiores e chamativos**.  
- Ordenados por **peso** (§8).  
- Produtos entram no `seen`.  
- Se vazio → fallback §10 (não some o “topo forte”).

---

## 17. Categorias: chips + trilhos horizontais

### 17.1 Chips (atalho)

- Horizontal, **sem** título “Categorias”.  
- **Sem** “Todos”.  
- Só categorias com ≥1 produto disponível.

### 17.2 Trilho por categoria (decisão de produto)

**Não** usamos lista vertical curta + “Ver todos” escondendo 30 sabores.

Usamos o padrão Netflix / Amazon / App Store:

```text
🍕 Pizzas                    Ver tudo →
[card][card][card][card][card][card]…  → deslizar
```

Vantagens:

- Mostra **muito mais** produtos com pouco espaço vertical  
- Home leve  
- Incentiva exploração  
- Mantém foco na categoria  
- Melhora conversão  

“Ver tudo →” abre a página da categoria (lista completa).

### 17.3 Capa discreta da categoria (enriquecimento visual)

Cada trilho pode ter um **elemento visual leve** (não hero):

```text
🍕 + imagem discreta da categoria
Pizzas · 35 produtos
Ver tudo →
```

- Sem capa enorme.  
- Ajuda reconhecimento e percepção de qualidade.  
- Imagem: da categoria ou fallback do 1º produto / emoji.

---

## 18. Navegação (bottom nav + busca)

### 18.1 Bottom nav

```text
🏠 Início | 🔍 Buscar | 📦 Pedidos | 👤 Conta
```

**Favoritos no header** (junto a Compartilhar) — bottom com 4 itens, mais claro no polegar.

### 18.2 Busca dedicada (`/buscar`)

Campo grande, histórico, sugestões, categorias, recentes/mais pedidos — **fora** da Home.

---

## 19. Performance

- Blocos independentes + skeletons por bloco  
- Lazy de imagens abaixo da dobra  
- Motor puro e memoizado  
- Mesmo com prioridade dinâmica, a Home continua **rápida**

---

## 20. Anti-padrões

| Evitar | Por quê |
|--------|---------|
| Home configurável no backoffice | Viola o princípio do comerciante |
| Pensar a Home como lista fixa de seções | Mata o motor |
| Lista curta vertical por categoria + esconder o resto | Cliente não vê o cardápio real |
| Produto repetido em vários blocos | Polui e enfraquece a vitrine |
| Topo vazio sem promoção | Sempre precisa de bloco forte |
| Welcome / cards de texto grandes | Atrasam a comida |
| Busca na Home | Rouba a 1ª dobra |
| Pill “Todos” | Conceito técnico |

---

## 21. Fases de implementação

Só após **aprovação** deste documento.

| Fase | Entrega | Status |
|------|---------|--------|
| **A** | Motor `buildHomeVitrine` (prioridade + dedupe + fallback sem promo) + shell: hero −20%, ticker vivo, promo carrossel, chips, **trilhos horizontais** por categoria com capa discreta; remover busca/Todos/welcome grosso | ✅ Feita |
| **B** | Bottom nav + `/buscar` + favoritos no header | ✅ Feita |
| **C** | Pesos de campanha na ordenação do carrossel + polish visual | ✅ Feita |
| **D** | Contexto horário rico; categoria preferida do cliente; blocos lançamento/combo no mesmo motor | ✅ Feita |

---

## 22. Histórico

| Versão | Data | Descrição |
|--------|------|-----------|
| 1.5 | Jul/2026 | Fase D: horário rico, afinidade de categoria, lançamentos/combos no motor |
| 1.4 | Jul/2026 | Fase C: `weight` nas campanhas, carrossel por peso, polish visual |
| 1.3 | Jul/2026 | Fase B: bottom nav, `/buscar`, favoritos + share no header |
| 1.2 | Jul/2026 | Aprovado; Fase A implementada no storefront |
| 1.1 | Jul/2026 | Motor Inteligente de Vitrine; prioridade/pesos; trilhos horizontais; fallback sem promo; ticker vivo; hero −20%; capa de categoria; home viva / preferência futura |
| 1.0 | Jul/2026 | Rascunho inicial (vitrine + dedupe) — supersedido |

---

## Filosofia final

Não estamos só fazendo uma tela bonita.

Estamos construindo um sistema que **organiza sozinho a melhor vitrine** para cada estabelecimento — um verdadeiro **vendedor**:

- destaca o estratégico;  
- incentiva descoberta;  
- evita repetição;  
- esconde complexidade;  
- deixa o comerciante cuidar do negócio.

Essa é uma das **grandes assinaturas** do Food Service e um diferencial frente a deliveries que só listam cardápio.

---

> **Aprovado.** Pilar oficial da Home. Fases A–D entregues (§21).
