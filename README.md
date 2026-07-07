# Food Service — Frontend

Interface **Storefront** (consumidor) e **Backoffice** (operadores) do Food Service.

**Stack:** React 19, Vite, TypeScript, Tailwind CSS, TanStack Query, React Router, Zustand.

Documentação em [`docs/`](./docs/).

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
# Storefront — http://localhost:5173
npm run dev

# Backoffice — http://localhost:5174
npm run dev:admin
```

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Storefront (porta 5173) |
| `npm run dev:admin` | Backoffice (porta 5174) |
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

**Sprint 0 — Fundação** (`docs/09-roadmap.md`)

- [x] Vite + React + TypeScript
- [x] Tailwind + tokens Emerald
- [x] Estrutura `apps/`, `shared/`, `features/` (placeholder)
- [x] TanStack Query + React Router
- [x] Dois entrypoints (storefront + backoffice)
- [x] `api-client` base
- [x] CI (typecheck + build)

Próximo: **Sprint 1** (backend tenant) em paralelo com **Sprint 4** (design system completo).
