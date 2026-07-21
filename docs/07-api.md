# 07 — API REST

> **Documento:** Contrato da API REST  
> **Produto:** Food Service *(nome comercial provisório)*  
> **Versão:** 1.0  
> **Status:** Aprovado  
> **Última atualização:** Julho/2026  
> **Depende de:** `03-modelagem-do-banco.md`, `05-frontend.md`, `06-backend.md` (aprovados)  
> **Base URL:** `https://api.foodservice.app/api/v1` *(produção)* | `http://localhost:8001/api/v1` *(dev — ver `00-portas-locais.md`)*

---

## Sumário

1. [Visão Geral](#1-visão-geral)
2. [Convenções](#2-convenções)
3. [Autenticação](#3-autenticação)
4. [Multi-Tenant](#4-multi-tenant)
5. [Formato de Erros](#5-formato-de-erros)
6. [Paginação, Filtros e Ordenação](#6-paginação-filtros-e-ordenação)
7. [Tipos e Enums](#7-tipos-e-enums)
8. [Health Check](#8-health-check)
9. [Auth](#9-auth)
10. [API Pública — Empresa](#10-api-pública--empresa)
11. [API Pública — Catálogo](#11-api-pública--catálogo)
12. [API Pública — Pedidos](#12-api-pública--pedidos)
13. [API Admin — Pedidos](#13-api-admin--pedidos)
14. [API Admin — Catálogo](#14-api-admin--catálogo)
15. [API Admin — Categorias](#15-api-admin--categorias)
16. [API Admin — Grupos de Opções](#16-api-admin--grupos-de-opções)
17. [API Admin — Configurações](#17-api-admin--configurações)
18. [API Admin — Dashboard](#18-api-admin--dashboard)
19. [Endpoints Futuros](#19-endpoints-futuros)
20. [Rate Limiting](#20-rate-limiting)
21. [Versionamento](#21-versionamento)
22. [Próximos Documentos](#22-próximos-documentos)

---

## 1. Visão Geral

### 1.1 Objetivo

Este documento é o **contrato oficial** entre frontend e backend do Food Service. Toda integração deve seguir estes endpoints, payloads e respostas.

### 1.2 Prefixos

| Prefixo | Contexto | Auth | Tenant |
|---------|----------|------|--------|
| `/api/v1/health/` | Infraestrutura | Não | Não |
| `/api/v1/auth/` | Autenticação | Variável | Não |
| `/api/v1/public/` | Storefront | Opcional | Subdomínio |
| `/api/v1/admin/` | Backoffice | JWT obrigatório | JWT + header |

### 1.3 Diagrama de Contextos

```mermaid
graph LR
    subgraph STOREFRONT["Storefront"]
        SF[React App]
    end

    subgraph BACKOFFICE["Backoffice"]
        BO[React App]
    end

    subgraph API["API v1"]
        PUB["/public/*"]
        ADM["/admin/*"]
        AUTH["/auth/*"]
    end

    SF -->|subdomínio| PUB
    BO -->|JWT| ADM
    BO --> AUTH
    SF -.->|futuro| AUTH
```

### 1.4 Escopo por Fase

| Fase | Endpoints documentados |
|------|------------------------|
| **MVP** | Seções 8–18 (completo para operação inicial) |
| **V1** | Clientes, cupons, funcionários, relatórios |
| **V2** | Entregadores, fidelidade, pagamento gateway |

---

## 2. Convenções

### 2.1 Protocolo

| Aspecto | Padrão |
|---------|--------|
| Protocolo | HTTPS (produção) |
| Formato | `application/json` |
| Charset | UTF-8 |
| IDs | UUID v4 (`550e8400-e29b-41d4-a716-446655440000`) |
| Datas | ISO 8601 UTC (`2026-07-06T18:30:00Z`) |
| Horários | ISO 8601 ou `HH:MM` para business hours |
| Moeda | `BRL` (implícito; campo `currency` quando relevante) |
| Valores monetários | `number` com 2 casas decimais (`45.90`) |
| Null | `null` (nunca omitir campos obrigatórios na resposta) |

### 2.2 Métodos HTTP

| Método | Uso |
|--------|-----|
| `GET` | Leitura |
| `POST` | Criação |
| `PUT` | Substituição completa (raro) |
| `PATCH` | Atualização parcial |
| `DELETE` | Remoção (soft delete quando aplicável) |

### 2.3 Status Codes

| Code | Significado | Quando |
|------|-------------|--------|
| `200` | OK | GET, PATCH, PUT com corpo |
| `201` | Created | POST com recurso criado |
| `204` | No Content | DELETE sem corpo |
| `400` | Bad Request | Validação de formato |
| `401` | Unauthorized | Token ausente/inválido |
| `403` | Forbidden | Sem permissão |
| `404` | Not Found | Recurso ou tenant inexistente |
| `422` | Unprocessable Entity | Regra de negócio violada |
| `429` | Too Many Requests | Rate limit |
| `500` | Internal Server Error | Erro não tratado |

### 2.4 Headers Comuns

| Header | Direção | Valor | Obrigatório |
|--------|---------|-------|-------------|
| `Content-Type` | Request | `application/json` | Sim (com body) |
| `Accept` | Request | `application/json` | Recomendado |
| `Authorization` | Request | `Bearer {access_token}` | Admin |
| `X-Tenant-ID` | Request | UUID do tenant | Admin (redundância) |
| `Host` | Request | `{subdomain}.foodservice.app` | Public (tenant) |

---

## 3. Autenticação

### 3.1 JWT (Backoffice)

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Claims no token:**

| Claim | Tipo | Descrição |
|-------|------|-----------|
| `employee_id` | UUID | ID do funcionário |
| `tenant_id` | UUID | ID do tenant |
| `exp` | timestamp | Expiração (15 min access) |
| `jti` | string | ID único do token |

### 3.2 Fluxo

```mermaid
sequenceDiagram
    participant C as Client
    participant API as API

    C->>API: POST /auth/login/
    API-->>C: access + refresh + user + tenant

    C->>API: GET /admin/orders/ + Bearer access
    API-->>C: 200

    Note over C,API: Access expirado
    C->>API: POST /auth/refresh/ { refresh }
    API-->>C: novo access

    C->>API: POST /auth/logout/ + Bearer
    API-->>C: 204
```

### 3.3 Storefront (MVP)

Rotas `/public/*` são **AllowAny**. Tenant resolvido por subdomínio.

Login de consumidor (`/auth/customer/`) é escopo **V1**.

---

## 4. Multi-Tenant

### 4.1 Storefront

```
GET https://pizzaria-joao.foodservice.app/api/v1/public/catalog/products/
Host: pizzaria-joao.foodservice.app
```

O backend extrai `pizzaria-joao` do `Host` e resolve o tenant.

### 4.2 Backoffice

```
GET https://api.foodservice.app/api/v1/admin/orders/
Authorization: Bearer {token}
X-Tenant-ID: 550e8400-e29b-41d4-a716-446655440000
```

`tenant_id` vem do JWT; header `X-Tenant-ID` é validação redundante.

### 4.3 Erro de Tenant

```json
// 404 Not Found
{
  "detail": "Estabelecimento não encontrado",
  "code": "TENANT_NOT_FOUND"
}
```

---

## 5. Formato de Erros

### 5.1 Estrutura Padrão

```json
{
  "detail": "Mensagem legível para o usuário",
  "code": "ERROR_CODE",
  "fields": {
    "customer_phone": ["Telefone inválido"],
    "items": ["Carrinho vazio"]
  }
}
```

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `detail` | string | Sim | Mensagem principal |
| `code` | string | Não | Código machine-readable |
| `fields` | object | Não | Erros por campo (validação) |

### 5.2 Códigos de Erro Comuns

| Code | HTTP | Descrição |
|------|------|-----------|
| `VALIDATION_ERROR` | 400 | Payload inválido |
| `AUTHENTICATION_FAILED` | 401 | Login falhou |
| `TOKEN_EXPIRED` | 401 | JWT expirado |
| `PERMISSION_DENIED` | 403 | Sem permissão |
| `TENANT_NOT_FOUND` | 404 | Subdomínio inválido |
| `NOT_FOUND` | 404 | Recurso não existe |
| `EMPTY_CART` | 422 | Checkout sem itens |
| `PRODUCT_UNAVAILABLE` | 422 | Produto indisponível |
| `INVALID_ORDER_TRANSITION` | 422 | Status inválido |
| `STORE_CLOSED` | 422 | Loja fechada |
| `MIN_ORDER_VALUE` | 422 | Abaixo do pedido mínimo |
| `NETWORK_ERROR` | — | *(frontend only)* |

---

## 6. Paginação, Filtros e Ordenação

### 6.1 Paginação

```
GET /api/v1/admin/orders/?page=2&page_size=20
```

**Resposta:**

```json
{
  "count": 156,
  "next": "https://api.foodservice.app/api/v1/admin/orders/?page=3&page_size=20",
  "previous": "https://api.foodservice.app/api/v1/admin/orders/?page=1&page_size=20",
  "results": [ ... ]
}
```

| Parâmetro | Default | Máximo |
|-----------|---------|--------|
| `page` | 1 | — |
| `page_size` | 20 | 100 |

### 6.2 Filtros

Via query params. Exemplos:

```
?status=pending
?status=pending,confirmed
?created_after=2026-07-01
?created_before=2026-07-31
?category=pizzas
?is_available=true
?search=calabresa
```

### 6.3 Ordenação

```
?ordering=-created_at
?ordering=total
?ordering=name
```

Prefixo `-` = descendente.

### 6.4 Busca

```
?search=termo
```

Campos pesquisáveis definidos por endpoint (documentados em cada seção).

---

## 7. Tipos e Enums

### 7.1 Tipos Reutilizáveis

```typescript
// Referência TypeScript para frontend

type UUID = string;
type ISODateTime = string;   // "2026-07-06T18:30:00Z"
type Money = number;         // 45.90
type Phone = string;         // "(11) 99999-9999"
type Slug = string;          // "pizza-calabresa"
```

### 7.2 Enums

#### OrderStatus

| Valor | Label |
|-------|-------|
| `pending` | Pendente |
| `confirmed` | Confirmado |
| `preparing` | Em preparo |
| `ready` | Pronto |
| `out_for_delivery` | Saiu para entrega |
| `completed` | Concluído |
| `cancelled` | Cancelado |

#### DeliveryType

| Valor | Label |
|-------|-------|
| `delivery` | Entrega |
| `pickup` | Retirada |
| `dine_in` | Consumo no local *(futuro)* |

#### PaymentMethod

| Valor | Label | Fase |
|-------|-------|------|
| `cash` | Dinheiro | MVP |
| `pix` | PIX na entrega | MVP |
| `card_on_delivery` | Cartão na entrega | MVP |
| `credit_card` | Cartão online | V2 |
| `debit_card` | Débito online | V2 |

#### PaymentStatus

| Valor | Label |
|-------|-------|
| `pending` | Pendente |
| `paid` | Pago |
| `failed` | Falhou |
| `refunded` | Estornado |

#### OptionSelectionType

| Valor | Descrição |
|-------|-----------|
| `single` | Uma opção |
| `multiple` | Múltiplas opções |

#### OptionPriceType

| Valor | Descrição |
|-------|-----------|
| `fixed` | Valor fixo em R$ |
| `percentage` | Percentual sobre preço base |

#### CompanyStatus

| Valor | Descrição |
|-------|-----------|
| `active` | Ativo |
| `inactive` | Inativo |
| `suspended` | Suspenso |
| `trial` | Período de teste |

---

## 8. Health Check

### `GET /api/v1/health/`

Verifica se a API está operacional.

**Auth:** Não  
**Tenant:** Não

**Response `200`:**

```json
{
  "status": "ok",
  "version": "1.0.0",
  "timestamp": "2026-07-06T18:30:00Z"
}
```

---

## 9. Auth

### 9.1 `POST /api/v1/auth/login/`

Login do funcionário (backoffice).

**Auth:** Não  
**Rate limit:** 5/min por IP

**Request:**

```json
{
  "email": "admin@demo.com",
  "password": "senha123"
}
```

| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| `email` | string | Sim |
| `password` | string | Sim |

**Response `200`:**

```json
{
  "access": "eyJhbGciOiJIUzI1NiIs...",
  "refresh": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "admin@demo.com",
    "first_name": "João",
    "last_name": "Silva",
    "is_owner": true,
    "permissions": [
      "dashboard.view",
      "orders.view",
      "orders.manage",
      "catalog.view",
      "catalog.manage",
      "settings.manage"
    ]
  },
  "tenant": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "trade_name": "Pizzaria do João",
    "slug": "pizzaria-joao",
    "subdomain": "pizzaria-joao"
  }
}
```

**Errors:**

| Code | HTTP | Quando |
|------|------|--------|
| `AUTHENTICATION_FAILED` | 401 | Credenciais inválidas |
| `VALIDATION_ERROR` | 400 | Campos ausentes |

---

### 9.2 `POST /api/v1/auth/refresh/`

Renova o access token.

**Request:**

```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response `200`:**

```json
{
  "access": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

### 9.3 `POST /api/v1/auth/logout/`

Invalida o refresh token.

**Auth:** Bearer  
**Response `204`:** Sem corpo

---

## 10. API Pública — Empresa

### 10.1 `GET /api/v1/public/company/`

Dados públicos do estabelecimento (storefront).

**Auth:** Não  
**Tenant:** Subdomínio

**Response `200`:**

```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "trade_name": "Pizzaria do João",
  "slug": "pizzaria-joao",
  "description": "A melhor pizza da região",
  "logo_url": "https://cdn.foodservice.app/media/.../logo.webp",
  "cover_url": "https://cdn.foodservice.app/media/.../cover.webp",
  "phone": "(11) 3456-7890",
  "is_open": true,
  "settings": {
    "min_order_value": 25.00,
    "delivery_fee": 5.00,
    "free_delivery_above": 80.00,
    "estimated_prep_time": 30,
    "estimated_delivery_time": 45,
    "accepts_delivery": true,
    "accepts_pickup": true,
    "payment_methods": ["cash", "pix", "card_on_delivery"]
  },
  "business_hours": [
    {
      "day_of_week": 0,
      "day_name": "Segunda",
      "opens_at": "18:00",
      "closes_at": "23:00",
      "is_closed": false
    },
    {
      "day_of_week": 1,
      "day_name": "Terça",
      "opens_at": "18:00",
      "closes_at": "23:00",
      "is_closed": false
    }
  ]
}
```

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `is_open` | boolean | Combina settings + horário |
| `business_hours` | array | 7 dias (0=Segunda) |
| `settings.payment_methods` | string[] | Formas aceitas no MVP |

---

## 11. API Pública — Catálogo

### 11.1 `GET /api/v1/public/catalog/categories/`

Lista categorias ativas do cardápio.

**Response `200`:**

```json
[
  {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "name": "Pizzas",
    "slug": "pizzas",
    "description": "Pizzas artesanais",
    "image_url": "https://cdn.foodservice.app/.../pizzas.webp",
    "sort_order": 0,
    "product_count": 12
  },
  {
    "id": "770e8400-e29b-41d4-a716-446655440003",
    "name": "Bebidas",
    "slug": "bebidas",
    "description": null,
    "image_url": null,
    "sort_order": 1,
    "product_count": 8
  }
]
```

---

### 11.2 `GET /api/v1/public/catalog/products/`

Lista produtos disponíveis.

**Query params:**

| Param | Tipo | Descrição |
|-------|------|-----------|
| `category` | slug | Filtrar por categoria |
| `search` | string | Busca por nome/descrição/tags |
| `page` | int | Paginação |
| `page_size` | int | Itens por página |

**Response `200`:** Paginado

```json
{
  "count": 12,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": "880e8400-e29b-41d4-a716-446655440004",
      "name": "Pizza Calabresa",
      "slug": "pizza-calabresa",
      "description": "Molho, mussarela e calabresa",
      "base_price": 45.00,
      "compare_price": null,
      "image_url": "https://cdn.foodservice.app/.../calabresa.webp",
      "category": {
        "id": "770e8400-e29b-41d4-a716-446655440002",
        "name": "Pizzas",
        "slug": "pizzas"
      },
      "is_available": true,
      "tags": ["mais-vendida"],
      "has_options": true
    }
  ]
}
```

---

### 11.3 `GET /api/v1/public/catalog/products/{slug}/`

Detalhe do produto com grupos de opções.

**Response `200`:**

```json
{
  "id": "880e8400-e29b-41d4-a716-446655440004",
  "name": "Pizza Calabresa",
  "slug": "pizza-calabresa",
  "description": "Molho de tomate, mussarela e calabresa fatiada",
  "base_price": 45.00,
  "compare_price": 52.00,
  "is_available": true,
  "prep_time": 25,
  "tags": ["mais-vendida"],
  "images": [
    {
      "id": "990e8400-e29b-41d4-a716-446655440005",
      "image_url": "https://cdn.foodservice.app/.../calabresa.webp",
      "alt_text": "Pizza Calabresa",
      "is_primary": true
    }
  ],
  "option_groups": [
    {
      "id": "aa0e8400-e29b-41d4-a716-446655440006",
      "name": "Tamanho",
      "description": "Escolha o tamanho",
      "selection_type": "single",
      "min_selections": 1,
      "max_selections": 1,
      "is_required": true,
      "sort_order": 0,
      "options": [
        {
          "id": "bb0e8400-e29b-41d4-a716-446655440007",
          "name": "Pequena",
          "price_modifier": 0.00,
          "price_type": "fixed",
          "is_available": true
        },
        {
          "id": "bb0e8400-e29b-41d4-a716-446655440008",
          "name": "Média",
          "price_modifier": 8.00,
          "price_type": "fixed",
          "is_available": true
        },
        {
          "id": "bb0e8400-e29b-41d4-a716-446655440009",
          "name": "Grande",
          "price_modifier": 15.00,
          "price_type": "fixed",
          "is_available": true
        }
      ]
    },
    {
      "id": "aa0e8400-e29b-41d4-a716-446655440010",
      "name": "Borda",
      "description": "Opcional",
      "selection_type": "single",
      "min_selections": 0,
      "max_selections": 1,
      "is_required": false,
      "sort_order": 2,
      "options": [
        {
          "id": "bb0e8400-e29b-41d4-a716-446655440011",
          "name": "Catupiry",
          "price_modifier": 7.00,
          "price_type": "fixed",
          "is_available": true
        }
      ]
    }
  ]
}
```

**Response `404`:** Produto não encontrado ou inativo

---

## 12. API Pública — Pedidos

### 12.1 `POST /api/v1/public/orders/checkout/`

Cria um novo pedido (checkout).

**Auth:** Não  
**Tenant:** Subdomínio

**Request:**

```json
{
  "customer_name": "Maria Santos",
  "customer_phone": "(11) 98765-4321",
  "customer_email": "maria@email.com",
  "delivery_type": "delivery",
  "payment_method": "pix",
  "notes": "Interfone 102",
  "change_for": null,
  "address": {
    "street": "Rua das Flores",
    "number": "123",
    "complement": "Apto 102",
    "neighborhood": "Centro",
    "city": "São Paulo",
    "state": "SP",
    "zip_code": "01310-100",
    "reference": "Próximo ao mercado"
  },
  "items": [
    {
      "product_id": "880e8400-e29b-41d4-a716-446655440004",
      "quantity": 1,
      "notes": "Bem assada",
      "options": [
        { "option_id": "bb0e8400-e29b-41d4-a716-446655440008" },
        { "option_id": "bb0e8400-e29b-41d4-a716-446655440011" }
      ]
    },
    {
      "product_id": "880e8400-e29b-41d4-a716-446655440012",
      "quantity": 2,
      "options": []
    }
  ]
}
```

| Campo | Tipo | Obrigatório | Regras |
|-------|------|-------------|--------|
| `customer_name` | string | Sim | min 2 chars |
| `customer_phone` | string | Sim | Formato BR |
| `customer_email` | string | Não | E-mail válido |
| `delivery_type` | enum | Sim | `delivery` \| `pickup` |
| `payment_method` | enum | Sim | Ver PaymentMethod |
| `address` | object | Condicional | Obrigatório se `delivery` |
| `change_for` | number | Condicional | Obrigatório se `cash` |
| `items` | array | Sim | min 1 item |
| `items[].product_id` | UUID | Sim | Produto ativo |
| `items[].quantity` | int | Sim | 1–99 |
| `items[].options` | array | Não | IDs de opções selecionadas |
| `items[].notes` | string | Não | max 255 |

**Response `201`:**

```json
{
  "id": "cc0e8400-e29b-41d4-a716-446655440013",
  "order_number": "#0001",
  "status": "pending",
  "delivery_type": "delivery",
  "customer_name": "Maria Santos",
  "customer_phone": "(11) 98765-4321",
  "subtotal": 73.00,
  "discount": 0.00,
  "delivery_fee": 5.00,
  "total": 78.00,
  "currency": "BRL",
  "payment": {
    "method": "pix",
    "status": "pending",
    "amount": 78.00
  },
  "items": [
    {
      "id": "dd0e8400-e29b-41d4-a716-446655440014",
      "product_name": "Pizza Calabresa",
      "quantity": 1,
      "unit_price": 60.00,
      "total_price": 60.00,
      "options": [
        {
          "option_group_name": "Tamanho",
          "option_name": "Média",
          "price_modifier": 8.00
        },
        {
          "option_group_name": "Borda",
          "option_name": "Catupiry",
          "price_modifier": 7.00
        }
      ],
      "notes": "Bem assada"
    }
  ],
  "estimated_prep_at": "2026-07-06T19:00:00Z",
  "estimated_delivery_at": "2026-07-06T19:30:00Z",
  "created_at": "2026-07-06T18:30:00Z"
}
```

**Errors:**

| Code | HTTP | Quando |
|------|------|--------|
| `EMPTY_CART` | 422 | Sem itens |
| `PRODUCT_UNAVAILABLE` | 422 | Produto indisponível |
| `INVALID_OPTIONS` | 422 | Opções inválidas para o produto |
| `STORE_CLOSED` | 422 | Loja fechada |
| `MIN_ORDER_VALUE` | 422 | Subtotal < mínimo |
| `VALIDATION_ERROR` | 400 | Campos inválidos |

**Regras de negócio (backend):**
- Preços calculados no servidor (não confiar no frontend)
- Opções validadas contra grupos do produto (min/max/required)
- `delivery_fee` aplicado conforme settings do tenant
- `customer` criado ou encontrado por telefone

---

### 12.2 `GET /api/v1/public/orders/{id}/`

Acompanhamento de pedido (tracking).

**Auth:** Não (ID UUID não adivinhável)  
**Tenant:** Subdomínio

**Response `200`:**

```json
{
  "id": "cc0e8400-e29b-41d4-a716-446655440013",
  "order_number": "#0001",
  "status": "preparing",
  "delivery_type": "delivery",
  "subtotal": 73.00,
  "delivery_fee": 5.00,
  "total": 78.00,
  "items": [
    {
      "product_name": "Pizza Calabresa",
      "quantity": 1,
      "unit_price": 60.00,
      "total_price": 60.00,
      "options": [
        { "option_group_name": "Tamanho", "option_name": "Média" }
      ]
    }
  ],
  "status_history": [
    {
      "status": "pending",
      "created_at": "2026-07-06T18:30:00Z"
    },
    {
      "status": "confirmed",
      "created_at": "2026-07-06T18:32:00Z"
    },
    {
      "status": "preparing",
      "created_at": "2026-07-06T18:35:00Z"
    }
  ],
  "estimated_delivery_at": "2026-07-06T19:30:00Z",
  "created_at": "2026-07-06T18:30:00Z"
}
```

> **V1:** Polling recomendado a cada 10s. WebSocket/SSE em V2.

---

## 13. API Admin — Pedidos

**Auth:** Bearer JWT  
**Permissão base:** `orders.view`

### 13.1 `GET /api/v1/admin/orders/`

Lista pedidos do tenant.

**Query params:**

| Param | Tipo | Descrição |
|-------|------|-----------|
| `status` | enum \| CSV | Filtrar por status |
| `delivery_type` | enum | `delivery` \| `pickup` |
| `created_after` | date | `2026-07-01` |
| `created_before` | date | `2026-07-31` |
| `search` | string | Número, nome, telefone |
| `ordering` | string | `-created_at` (default) |
| `active` | boolean | Excluir completed/cancelled |

**Response `200`:** Paginado

```json
{
  "count": 45,
  "next": "...",
  "previous": null,
  "results": [
    {
      "id": "cc0e8400-e29b-41d4-a716-446655440013",
      "order_number": "#0001",
      "status": "pending",
      "customer_name": "Maria Santos",
      "customer_phone": "(11) 98765-4321",
      "delivery_type": "delivery",
      "total": 78.00,
      "items_count": 2,
      "created_at": "2026-07-06T18:30:00Z"
    }
  ]
}
```

---

### 13.2 `GET /api/v1/admin/orders/{id}/`

Detalhe completo do pedido.

**Response `200`:**

```json
{
  "id": "cc0e8400-e29b-41d4-a716-446655440013",
  "order_number": "#0001",
  "status": "pending",
  "delivery_type": "delivery",
  "customer": {
    "id": "ee0e8400-e29b-41d4-a716-446655440015",
    "name": "Maria Santos",
    "phone": "(11) 98765-4321",
    "email": "maria@email.com"
  },
  "subtotal": 73.00,
  "discount": 0.00,
  "delivery_fee": 5.00,
  "total": 78.00,
  "currency": "BRL",
  "notes": "Interfone 102",
  "internal_notes": "",
  "delivery_address": {
    "street": "Rua das Flores",
    "number": "123",
    "complement": "Apto 102",
    "neighborhood": "Centro",
    "city": "São Paulo",
    "state": "SP",
    "zip_code": "01310-100",
    "reference": "Próximo ao mercado"
  },
  "payment": {
    "method": "pix",
    "status": "pending",
    "amount": 78.00,
    "change_for": null,
    "paid_at": null
  },
  "items": [
    {
      "id": "dd0e8400-e29b-41d4-a716-446655440014",
      "product_id": "880e8400-e29b-41d4-a716-446655440004",
      "product_name": "Pizza Calabresa",
      "quantity": 1,
      "unit_price": 60.00,
      "total_price": 60.00,
      "notes": "Bem assada",
      "options": [
        {
          "option_group_name": "Tamanho",
          "option_name": "Média",
          "price_modifier": 8.00
        },
        {
          "option_group_name": "Borda",
          "option_name": "Catupiry",
          "price_modifier": 7.00
        }
      ]
    }
  ],
  "status_history": [
    {
      "from_status": null,
      "to_status": "pending",
      "changed_by": null,
      "notes": null,
      "created_at": "2026-07-06T18:30:00Z"
    }
  ],
  "confirmed_at": null,
  "completed_at": null,
  "created_at": "2026-07-06T18:30:00Z",
  "updated_at": "2026-07-06T18:30:00Z"
}
```

---

### 13.3 `PATCH /api/v1/admin/orders/{id}/status/`

Atualiza status do pedido.

**Permissão:** `orders.manage` ou `orders.update_status`

**Request:**

```json
{
  "status": "confirmed",
  "notes": "Confirmado pelo atendente"
}
```

| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| `status` | OrderStatus | Sim |
| `notes` | string | Não (obrigatório em cancel) |

**Response `200`:** Order detail (mesmo formato do GET)

**Transições válidas:**

```mermaid
stateDiagram-v2
    pending --> confirmed
    pending --> cancelled
    confirmed --> preparing
    confirmed --> cancelled
    preparing --> ready
    preparing --> cancelled
    ready --> out_for_delivery
    ready --> completed
    ready --> cancelled
    out_for_delivery --> completed
    out_for_delivery --> cancelled
```

**Errors:**

| Code | HTTP | Quando |
|------|------|--------|
| `INVALID_ORDER_TRANSITION` | 422 | Transição não permitida |

---

### 13.4 `PATCH /api/v1/admin/orders/{id}/payment/`

Marca pagamento como recebido.

**Permissão:** `orders.manage`

**Request:**

```json
{
  "status": "paid"
}
```

**Response `200`:** Order detail atualizado

---

## 14. API Admin — Catálogo

**Permissão base:** `catalog.view` (leitura) | `catalog.manage` (escrita)

### 14.1 `GET /api/v1/admin/products/`

Lista produtos (inclui inativos).

**Query params:** `category`, `is_active`, `is_available`, `search`, `ordering`

**Response `200`:** Paginado (lista resumida)

```json
{
  "results": [
    {
      "id": "880e8400-e29b-41d4-a716-446655440004",
      "name": "Pizza Calabresa",
      "slug": "pizza-calabresa",
      "base_price": 45.00,
      "category": { "id": "...", "name": "Pizzas", "slug": "pizzas" },
      "is_active": true,
      "is_available": true,
      "sort_order": 0,
      "image_url": "https://...",
      "created_at": "2026-07-01T10:00:00Z"
    }
  ]
}
```

---

### 14.2 `POST /api/v1/admin/products/`

Cria produto.

**Permissão:** `catalog.manage`

**Request:**

```json
{
  "name": "Pizza Calabresa",
  "slug": "pizza-calabresa",
  "description": "Molho, mussarela e calabresa",
  "base_price": 45.00,
  "compare_price": null,
  "category_id": "770e8400-e29b-41d4-a716-446655440002",
  "sku": "PIZ-001",
  "is_active": true,
  "is_available": true,
  "sort_order": 0,
  "prep_time": 25,
  "tags": ["mais-vendida"],
  "option_group_ids": [
    "aa0e8400-e29b-41d4-a716-446655440006",
    "aa0e8400-e29b-41d4-a716-446655440010"
  ],
  "option_prices": [
    { "option_id": "bb0e8400-e29b-41d4-a716-446655440001", "price": 12.0 }
  ]
}
```

> **Fase 1:** `option_prices` é a fonte da verdade do preço da opção **neste** produto. Opções na base do cardápio ficam com `price_modifier = 0` na autoria nova. Detalhe admin e público resolvem dual-read (`product_option_prices` → fallback legado).

**Response `201`:** Product detail

---

### 14.3 `GET /api/v1/admin/products/{id}/`

Detalhe do produto (admin — inclui metadados internos).

---

### 14.4 `PATCH /api/v1/admin/products/{id}/`

Atualiza produto parcialmente.

**Request:** Campos opcionais (mesmos do POST)

**Response `200`:** Product detail

---

### 14.5 `DELETE /api/v1/admin/products/{id}/`

Soft delete do produto.

**Response `204`**

> Produto com pedidos associados: soft delete (não remove do banco).

---

### 14.6 `POST /api/v1/admin/products/{id}/images/`

Upload de imagem.

**Content-Type:** `multipart/form-data`

| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| `image` | file | Sim |
| `alt_text` | string | Não |
| `is_primary` | boolean | Não |

**Response `201`:**

```json
{
  "id": "990e8400-e29b-41d4-a716-446655440005",
  "image_url": "https://cdn.foodservice.app/.../calabresa.webp",
  "alt_text": "Pizza Calabresa",
  "is_primary": true,
  "sort_order": 0
}
```

---

### 14.7 `DELETE /api/v1/admin/products/{id}/images/{image_id}/`

Remove imagem do produto.

**Response `204`**

---

## 15. API Admin — Categorias

### 15.1 `GET /api/v1/admin/categories/`

**Response `200`:** Array (não paginado no MVP; paginar se > 50)

```json
[
  {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "name": "Pizzas",
    "slug": "pizzas",
    "description": "Pizzas artesanais",
    "image_url": null,
    "parent_id": null,
    "sort_order": 0,
    "is_active": true,
    "product_count": 12
  }
]
```

---

### 15.2 `POST /api/v1/admin/categories/`

**Request:**

```json
{
  "name": "Pizzas",
  "slug": "pizzas",
  "description": "Pizzas artesanais",
  "parent_id": null,
  "sort_order": 0,
  "is_active": true
}
```

**Response `201`:** Category object

---

### 15.3 `PATCH /api/v1/admin/categories/{id}/`

**Response `200`:** Category object

---

### 15.4 `DELETE /api/v1/admin/categories/{id}/`

Soft delete. **Erro 422** se categoria tem produtos ativos.

---

## 16. API Admin — Grupos de Opções

### 16.1 `GET /api/v1/admin/option-groups/`

**Response `200`:**

```json
[
  {
    "id": "aa0e8400-e29b-41d4-a716-446655440006",
    "name": "Tamanho",
    "description": "Escolha o tamanho",
    "selection_type": "single",
    "min_selections": 1,
    "max_selections": 1,
    "is_required": true,
    "is_active": true,
    "options_count": 3,
    "products_count": 8
  }
]
```

---

### 16.2 `POST /api/v1/admin/option-groups/`

**Request:**

```json
{
  "name": "Tamanho",
  "description": "Escolha o tamanho",
  "selection_type": "single",
  "min_selections": 1,
  "max_selections": 1,
  "is_required": true,
  "options": [
    { "name": "Pequena", "price_modifier": 0, "price_type": "fixed" },
    { "name": "Média", "price_modifier": 8, "price_type": "fixed" },
    { "name": "Grande", "price_modifier": 15, "price_type": "fixed" }
  ]
}
```

**Response `201`:** OptionGroup com options aninhadas

---

### 16.3 `GET /api/v1/admin/option-groups/{id}/`

Detalhe com todas as options.

---

### 16.4 `PATCH /api/v1/admin/option-groups/{id}/`

Atualiza grupo (não substitui options — usar endpoints de options).

---

### 16.5 `POST /api/v1/admin/option-groups/{id}/options/`

Adiciona opção ao grupo.

**Request:**

```json
{
  "name": "Catupiry",
  "price_modifier": 7.00,
  "price_type": "fixed",
  "is_available": true
}
```

---

### 16.6 `PATCH /api/v1/admin/option-groups/{group_id}/options/{id}/`

Atualiza opção.

---

### 16.7 `DELETE /api/v1/admin/option-groups/{group_id}/options/{id}/`

Remove opção (soft ou hard se sem pedidos).

---

## 17. API Admin — Configurações

**Permissão:** `settings.manage`

### 17.1 `GET /api/v1/admin/settings/`

**Response `200`:**

```json
{
  "company": {
    "legal_name": "Pizzaria do João LTDA",
    "trade_name": "Pizzaria do João",
    "document": "12.345.678/0001-90",
    "email": "contato@pizzaria.com",
    "phone": "(11) 3456-7890",
    "description": "A melhor pizza da região"
  },
  "settings": {
    "min_order_value": 25.00,
    "delivery_fee": 5.00,
    "free_delivery_above": 80.00,
    "estimated_prep_time": 30,
    "estimated_delivery_time": 45,
    "accepts_delivery": true,
    "accepts_pickup": true,
    "is_open": true,
    "auto_close_outside_hours": true,
    "payment_methods": ["cash", "pix", "card_on_delivery"]
  },
  "business_hours": [
    {
      "day_of_week": 0,
      "opens_at": "18:00",
      "closes_at": "23:00",
      "is_closed": false
    }
  ]
}
```

---

### 17.2 `PATCH /api/v1/admin/settings/`

Atualização parcial de company + settings + business_hours.

**Request:**

```json
{
  "settings": {
    "min_order_value": 30.00,
    "is_open": false
  },
  "business_hours": [
    {
      "day_of_week": 0,
      "opens_at": "17:00",
      "closes_at": "23:30",
      "is_closed": false
    }
  ]
}
```

**Response `200`:** Settings completo

---

### 17.3 `POST /api/v1/admin/settings/logo/`

Upload de logo (`multipart/form-data`).

**Response `200`:**

```json
{
  "logo_url": "https://cdn.foodservice.app/.../logo.webp"
}
```

---

## 18. API Admin — Dashboard

**Permissão:** `dashboard.view`

### 18.1 `GET /api/v1/admin/dashboard/`

KPIs do dia atual.

**Response `200`:**

```json
{
  "today": {
    "date": "2026-07-06",
    "total_orders": 23,
    "pending_orders": 3,
    "preparing_orders": 5,
    "completed_orders": 14,
    "cancelled_orders": 1,
    "revenue": 1847.50,
    "average_ticket": 80.33
  },
  "recent_orders": [
    {
      "id": "cc0e8400-e29b-41d4-a716-446655440013",
      "order_number": "#0023",
      "status": "pending",
      "customer_name": "Maria Santos",
      "total": 78.00,
      "created_at": "2026-07-06T18:30:00Z"
    }
  ]
}
```

---

## 19. Endpoints Futuros

### 19.1 V1 — Clientes

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/admin/customers/` | Listar clientes |
| GET | `/api/v1/admin/customers/{id}/` | Detalhe + histórico |
| POST | `/api/v1/auth/customer/register/` | Cadastro consumidor |
| POST | `/api/v1/auth/customer/login/` | Login consumidor |
| GET | `/api/v1/public/account/orders/` | Histórico (auth) |

### 19.2 V1 — Cupons

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| CRUD | `/api/v1/admin/coupons/` | Gestão de cupons |
| POST | `/api/v1/public/coupons/validate/` | Validar cupom no checkout |

### 19.3 V1 — Funcionários

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| CRUD | `/api/v1/admin/employees/` | Gestão de equipe |
| POST | `/api/v1/admin/employees/invite/` | Convite por e-mail |

### 19.4 V1 — Relatórios

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/admin/reports/sales/` | Vendas por período |
| GET | `/api/v1/admin/reports/products/` | Produtos mais vendidos |

### 19.5 V2 — Entrega

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| CRUD | `/api/v1/admin/drivers/` | Entregadores |
| PATCH | `/api/v1/admin/orders/{id}/delivery/` | Atribuir entregador |

### 19.6 V2 — Pagamento Online

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/v1/public/orders/checkout/payment/` | Iniciar pagamento |
| POST | `/api/v1/webhooks/mercadopago/` | Webhook gateway |

---

## 20. Rate Limiting

| Escopo | Limite | Headers de resposta |
|--------|--------|---------------------|
| Anônimo | 100/hour | `X-RateLimit-Limit`, `X-RateLimit-Remaining` |
| Autenticado | 1000/hour | Idem |
| Login | 5/minute | Idem |
| Checkout | 10/minute por IP | Idem |

**Response `429`:**

```json
{
  "detail": "Muitas requisições. Tente novamente em alguns instantes.",
  "code": "RATE_LIMIT_EXCEEDED"
}
```

Header: `Retry-After: 60`

---

## 21. Versionamento

### 21.1 Estratégia

| Aspecto | Decisão |
|---------|---------|
| Versionamento | URL path (`/api/v1/`) |
| Breaking changes | Nova versão (`/api/v2/`) |
| Deprecation | Header `Sunset` + 6 meses de aviso |
| Documentação | OpenAPI 3.0 via `drf-spectacular` (V1) |

### 21.2 OpenAPI (Futuro)

```
GET /api/v1/schema/          # OpenAPI JSON
GET /api/v1/docs/            # Swagger UI
GET /api/v1/redoc/           # ReDoc
```

### 21.3 Changelog

| Versão | Data | Alterações |
|--------|------|------------|
| v1.0 | Jul/2026 | Versão inicial MVP |

---

## 22. Próximos Documentos

| # | Documento | Relação |
|---|-----------|---------|
| 08 | `08-regras-de-negocio.md` | Regras por trás dos endpoints |
| 10 | `10-padroes-de-codigo.md` | Convenções de implementação |
| 12 | `12-checklist-mvp.md` | Endpoints obrigatórios no MVP |

---

## Histórico de Revisões

| Versão | Data | Autor | Alterações |
|--------|------|-------|------------|
| 1.0 | Jul/2026 | — | Versão inicial — aprovado |

---

## Apêndice A — Mapa Completo MVP

| # | Método | Endpoint | Auth | Permissão |
|---|--------|----------|------|-----------|
| 1 | GET | `/health/` | — | — |
| 2 | POST | `/auth/login/` | — | — |
| 3 | POST | `/auth/refresh/` | — | — |
| 4 | POST | `/auth/logout/` | JWT | — |
| 5 | GET | `/public/company/` | — | — |
| 6 | GET | `/public/catalog/categories/` | — | — |
| 7 | GET | `/public/catalog/products/` | — | — |
| 8 | GET | `/public/catalog/products/{slug}/` | — | — |
| 9 | POST | `/public/orders/checkout/` | — | — |
| 10 | GET | `/public/orders/{id}/` | — | — |
| 11 | GET | `/admin/dashboard/` | JWT | `dashboard.view` |
| 12 | GET | `/admin/orders/` | JWT | `orders.view` |
| 13 | GET | `/admin/orders/{id}/` | JWT | `orders.view` |
| 14 | PATCH | `/admin/orders/{id}/status/` | JWT | `orders.manage` |
| 15 | PATCH | `/admin/orders/{id}/payment/` | JWT | `orders.manage` |
| 16 | GET | `/admin/products/` | JWT | `catalog.view` |
| 17 | POST | `/admin/products/` | JWT | `catalog.manage` |
| 18 | GET | `/admin/products/{id}/` | JWT | `catalog.view` |
| 19 | PATCH | `/admin/products/{id}/` | JWT | `catalog.manage` |
| 20 | DELETE | `/admin/products/{id}/` | JWT | `catalog.manage` |
| 21 | POST | `/admin/products/{id}/images/` | JWT | `catalog.manage` |
| 22 | DELETE | `/admin/products/{id}/images/{img}/` | JWT | `catalog.manage` |
| 23 | GET | `/admin/categories/` | JWT | `catalog.view` |
| 24 | POST | `/admin/categories/` | JWT | `catalog.manage` |
| 25 | PATCH | `/admin/categories/{id}/` | JWT | `catalog.manage` |
| 26 | DELETE | `/admin/categories/{id}/` | JWT | `catalog.manage` |
| 27 | GET | `/admin/option-groups/` | JWT | `catalog.view` |
| 28 | POST | `/admin/option-groups/` | JWT | `catalog.manage` |
| 29 | GET | `/admin/option-groups/{id}/` | JWT | `catalog.view` |
| 30 | PATCH | `/admin/option-groups/{id}/` | JWT | `catalog.manage` |
| 31 | POST | `/admin/option-groups/{id}/options/` | JWT | `catalog.manage` |
| 32 | PATCH | `/admin/option-groups/{g}/options/{o}/` | JWT | `catalog.manage` |
| 33 | DELETE | `/admin/option-groups/{g}/options/{o}/` | JWT | `catalog.manage` |
| 34 | GET | `/admin/settings/` | JWT | `settings.manage` |
| 35 | PATCH | `/admin/settings/` | JWT | `settings.manage` |
| 36 | POST | `/admin/settings/logo/` | JWT | `settings.manage` |

**Total MVP: 36 endpoints**

## Apêndice B — Exemplo cURL

```bash
# Health
curl https://api.foodservice.app/api/v1/health/

# Cardápio (storefront)
curl -H "Host: pizzaria-joao.foodservice.app" \
  https://api.foodservice.app/api/v1/public/catalog/products/

# Checkout
curl -X POST \
  -H "Host: pizzaria-joao.foodservice.app" \
  -H "Content-Type: application/json" \
  -d '{"customer_name":"Maria","customer_phone":"(11) 98765-4321","delivery_type":"pickup","payment_method":"pix","items":[{"product_id":"...","quantity":1,"options":[]}]}' \
  https://api.foodservice.app/api/v1/public/orders/checkout/

# Login backoffice
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@demo.com","password":"senha123"}' \
  https://api.foodservice.app/api/v1/auth/login/

# Listar pedidos
curl -H "Authorization: Bearer {token}" \
  -H "X-Tenant-ID: {tenant_id}" \
  https://api.foodservice.app/api/v1/admin/orders/
```

---

> **Documento aprovado.** Próximo: `08-regras-de-negocio.md`.
