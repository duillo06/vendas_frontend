---
name: foodservice-local-dev
description: >-
  Run Food Service locally with alternate ports (API 8001, storefront 5174,
  backoffice 5175) alongside the user's main project. Use when starting dev
  servers, configuring .env, CORS, Docker, or when port conflicts appear.
---

# Food Service — Desenvolvimento Local

## Portas (não usar as do projeto principal)

| Serviço | Porta | Comando |
|---------|-------|---------|
| API Django | **8001** | `python manage.py runserver 8001` |
| Storefront | **5174** | `npm run dev` |
| Backoffice | **5175** | `npm run dev:admin` |

Reservadas para o **projeto principal**: Django `8000`, Vite `5173`.

Fonte de verdade: `docs/00-portas-locais.md`

## Repositórios

| Repo | Caminho |
|------|---------|
| Backend | `vendas_backend` |
| Frontend | `vendas_frontend` |
| Documentação | `vendas_frontend/docs/` |

## Startup (4 terminais)

```bash
# 1 — Infra
cd vendas_backend && docker compose -f docker-compose.dev.yml up -d

# 2 — API
cd vendas_backend && source .venv/bin/activate
export DJANGO_ENV=development
python manage.py migrate
python manage.py runserver 8001

# 3 — Storefront
cd vendas_frontend && npm run dev

# 4 — Backoffice (opcional)
cd vendas_frontend && npm run dev:admin
```

## Variáveis obrigatórias

**`vendas_frontend/.env`**
```bash
VITE_API_BASE_URL=http://localhost:8001/api/v1
```

**`vendas_backend/.env`** — copiar de `.env.example`

## Verificação

```bash
curl http://localhost:8001/api/v1/health/
# {"status":"ok",...}
```

## Subdomínio local (multi-tenant)

Padrão: `{tenant}.localhost:5174` (ex: `pizzaria-joao.localhost:5174`)

## Conflitos comuns

| Erro | Solução |
|------|---------|
| Porta 8000 em uso | Usar **8001** — não matar o projeto principal |
| Porta 5173 em uso | Storefront já está em **5174** via `vite.config.ts` |
| CORS bloqueado | Conferir `config/settings/development.py` (5174, 5175) |
| Postgres 5432 em uso | Parar container conflitante ou ajustar `POSTGRES_PORT` no `.env` |
