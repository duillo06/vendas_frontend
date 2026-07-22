# 22 — Arquitetura de Promoções (Fase 1)

> **Documento:** Modelagem técnica do módulo de Campanhas — fatia produto em oferta  
> **Produto:** Food Service *(nome comercial provisório)*  
> **Versão:** 1.0  
> **Status:** Aprovado  
> **Última atualização:** Julho/2026  
> **Depende de:** `00-product-philosophy.md`, `20-promotions-philosophy.md`, `21-marketing-engine.md`  
> **Natureza:** Arquitetura — nomes de tabela/campo são **internos** (nunca na UI)

---

## Sumário

1. [Escopo da Fase 1](#1-escopo-da-fase-1)
2. [Conceito: Campanha](#2-conceito-campanha)
3. [Modelo de dados](#3-modelo-de-dados)
4. [Objetivo comercial → mecanismo](#4-objetivo-comercial--mecanismo)
5. [Recorrência](#5-recorrência)
6. [Superfícies](#6-superfícies)
7. [Resolução de preço (runtime)](#7-resolução-de-preço-runtime)
8. [Indicadores e selos](#8-indicadores-e-selos)
9. [APIs](#9-apis)
10. [Checkout](#10-checkout)
11. [Fora desta fase](#11-fora-desta-fase)
12. [Histórico](#12-histórico)

---

## 1. Escopo da Fase 1

**Um mecanismo:** `product_price` — vender um produto por preço menor.

Inclui:

- Assistente conversacional (objetivo → produto → preço → recorrência → onde mostrar)
- Schema de recorrência (UI: uma vez + dias da semana)
- `CampaignResolver` no servidor
- Destaques Home / Cardápio / produto
- Indicadores automáticos (−% / Economize R$)

**Não inclui:** combo, frete grátis, brinde, cupom, calendário, campanhas prontas, proativo, margem.

---

## 2. Conceito: Campanha

Uma **Campanha** é a unidade persistida. O comerciante nunca vê esse nome técnico — vê “promoção” / “oferta”.

Campos lógicos:

| Conceito | Papel |
|----------|-------|
| Objetivo comercial | 1º passo da conversa |
| Mecanismo | Como o benefício se aplica (`product_price` na Fase 1) |
| Alvo | Produto + `promo_price` + `reference_price` (snapshot do “De”) |
| Recorrência / janela | Quando vale |
| Superfícies | Onde mostrar |
| Status | `draft` / `active` / `paused` / `ended` |

---

## 3. Modelo de dados

Tabela: `campaigns` (app `promotions`).

| Coluna | Tipo | Notas |
|--------|------|-------|
| `id` | UUID | PK |
| `tenant_id` | UUID | FK companies |
| `commercial_goal` | VARCHAR(40) | ex.: `increase_sales`, `sell_category` |
| `mechanism` | VARCHAR(40) | Fase 1: só `product_price` |
| `status` | VARCHAR(20) | `draft` / `active` / `paused` / `ended` |
| `title` | VARCHAR(200) | rótulo interno / lista admin |
| `product_id` | UUID | FK products (obrigatório se `product_price`) |
| `promo_price` | NUMERIC(10,2) | preço “Por” |
| `reference_price` | NUMERIC(10,2) | preço “De” no momento da criação |
| `recurrence_type` | VARCHAR(20) | `once` / `daily` / `weekdays` / `hours` / `commemorative` |
| `weekdays` | JSONB | lista 0–6 (seg=0) quando `weekdays` |
| `starts_at` | TIMESTAMPTZ | início da validade |
| `ends_at` | TIMESTAMPTZ | nullable |
| `time_start` / `time_end` | TIME | nullable — happy hour futuro |
| `show_on_home` | BOOL | |
| `show_on_menu` | BOOL | |
| `show_on_product` | BOOL | |
| `link_only` | BOOL | se true, não entra em carrosséis |
| `show_as_banner` | BOOL | Fase 1: aceito no schema, UI opcional |
| `created_at` / `updated_at` | TIMESTAMPTZ | |

Índices: `(tenant, status)`, `(tenant, product_id, status)`, `(tenant, starts_at, ends_at)`.

Cupons (`coupons`) permanecem **separados** (V1 em `03` / `13`).

---

## 4. Objetivo comercial → mecanismo

Na Fase 1, vários objetivos comerciais convergem para `product_price` (o assistente sugere “preço menor neste produto”).

| Objetivo (UI) | `commercial_goal` | Mecanismo Fase 1 |
|---------------|-------------------|------------------|
| Aumentar as vendas | `increase_sales` | `product_price` |
| Vender mais [categoria] | `sell_category` | `product_price` |
| Aumentar ticket / combo / frete… | — | fora da Fase 1 (caminhos futuros) |

---

## 5. Recorrência

| `recurrence_type` | UI Fase 1 | Elegibilidade |
|-------------------|-----------|---------------|
| `once` | Apenas uma vez | `starts_at ≤ now ≤ ends_at` (ends opcional) |
| `weekdays` | Dias da semana | dentro da janela **e** weekday ∈ `weekdays` |
| `daily` | (schema) | dentro da janela, qualquer dia |
| `hours` / `commemorative` | schema só | UI depois |

Timezone: timezone do tenant / settings Django (`America/Sao_Paulo` típico em food service BR).

---

## 6. Superfícies

| Flag | Efeito |
|------|--------|
| `show_on_home` | entra em `GET /public/promotions/offers/` e carrossel |
| `show_on_menu` | enriquece listagem do cardápio |
| `show_on_product` | enriquece detalhe |
| `link_only` | se true, **não** aparece em home/menu carrosséis |
| `show_as_banner` | reservado |

---

## 7. Resolução de preço (runtime)

`CampaignResolver`:

1. Busca campanhas `active` do tenant para o produto.  
2. Filtra por janela + recorrência “agora”.  
3. Se `link_only`, ainda vale no **checkout** se o item estiver no pedido (preço); só some das vitrines.  
4. Em conflito (2 ativas no mesmo produto): escolhe a de **menor `promo_price`** (melhor para o cliente) — regra simples Fase 1.  
5. Retorna `promo_price`, `reference_price`, indicadores.

**Produto.base_price** no banco = preço de catálogo (não é sobrescrito pela campanha).

**API pública (list/detail):** quando há oferta elegível e superfície ok:

- `base_price` na resposta = `promo_price` (Por)  
- `compare_price` na resposta = `reference_price` (De)  
- campo `promotion` com metadados / badges  

Assim a UI atual de De/Por continua funcionando.

---

## 8. Indicadores e selos

Calculados no resolver (nunca cadastrados pelo comerciante):

- `save_amount` = reference − promo  
- `discount_percent` = arredondamento amigável  
- Badges exemplo: `Oferta`, `−15%`, `Economize R$ 11`, `Termina hoje`

---

## 9. APIs

| Método | Path | Auth |
|--------|------|------|
| GET/POST | `/api/v1/admin/campaigns/` | `promotions.manage` |
| GET/PATCH | `/api/v1/admin/campaigns/{id}/` | `promotions.manage` |
| GET | `/api/v1/public/promotions/offers/` | público (tenant host) |

Permissão `promotions.manage` em `ALL_PERMISSIONS` (owner sempre; manager na matriz).

---

## 10. Checkout

`CartValidationService`: base efetiva = `CampaignResolver.effective_base_price(product)` (promo se elegível, senão `product.base_price`). Opções e composição somam em cima como hoje.

---

## 11. Fora desta fase

Combo, frete, brinde, order discount, cupom, calendário, campanhas prontas, sugestões proativas, custo/margem — ver `20` / `21`.

---

## 12. Histórico

| Versão | Data | Descrição |
|--------|------|-----------|
| 1.0 | Jul/2026 | **Aprovado** com Fase 1 — Campanha `product_price`, resolver, APIs |

---

> **Documento aprovado** como guia da implementação Fase 1.
