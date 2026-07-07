# Food Service — Frontend

Interface **Storefront** (consumidor) e **Backoffice** (operadores) do Food Service.

**Stack:** React 19, Vite, TypeScript, Tailwind CSS, TanStack Query, React Router, Zustand.

Documentação em [`docs/`](./docs/) — portas locais em [`docs/00-portas-locais.md`](./docs/00-portas-locais.md).

Skills Cursor em [`.cursor/skills/`](./.cursor/skills/).

## Portas locais (projeto secundário)

Portas **alternativas** para rodar em paralelo ao projeto principal (Vite `5173`, Django `8000`):

| App | Porta | URL |
|-----|-------|-----|
| Storefront | **5174** | http://localhost:5174 |
| Backoffice | **5175** | http://localhost:5175 |
| API (backend) | **8001** | http://localhost:8001/api/v1 |

Subdomínio em dev (futuro): `{tenant}.localhost:5174` (ex: `pizzaria-joao.localhost:5174`)

## Pré-requisitos

- Node.js 20+
- npm 9+

## Setup

```bash
npm install
cp .env.example .env
```

## Desenvolvimento

```bash
# Storefront — http://localhost:5174
npm run dev

# Backoffice — http://localhost:5175
npm run dev:admin
```

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Storefront (porta 5174) |
| `npm run dev:admin` | Backoffice (porta 5175) |
| `npm run build` | Build storefront |
| `npm run build:admin` | Build backoffice |
| `npm run typecheck` | Verificação TypeScript |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

## Estrutura

```
src/
├── app/           # Providers globais
├── apps/
│   ├── storefront/
│   └── backoffice/
├── features/      # Domínios (Sprint 4+)
├── shared/        # UI, lib, hooks
└── styles/        # Design tokens (Emerald + Inter)
```

## Sprint atual

**Sprint 5 — Storefront: Cardápio** (`docs/09-roadmap.md`)

- [x] `useCompanyPublic()`, `useCategories()`, `useProducts()`, `useProduct()`
- [x] HomePage, MenuPage, CategoryPage, ProductPage
- [x] `OptionGroupSelector` com preço em tempo real
- [x] Navbar com logo, status aberto/fechado
- [x] Skeleton loading states
- [x] API tenant via subdomínio (`demo.localhost:8001` em dev)

**Dev:** http://localhost:5174 ou http://demo.localhost:5174 — backend em `8001` com `seed_dev`

Próximo: **Sprint 6** — carrinho (Zustand + persistência).
