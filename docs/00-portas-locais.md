# 00 — Portas e Ambiente Local

> **Documento:** Referência de portas para desenvolvimento local  
> **Produto:** Food Service *(nome comercial provisório)*  
> **Versão:** 1.0  
> **Status:** Aprovado  
> **Última atualização:** Julho/2026

---

## Por que portas alternativas?

O Food Service é um **projeto secundário** e roda em paralelo ao projeto principal de trabalho. As portas padrão ficam reservadas para o outro projeto:

| Porta padrão | Uso típico | Reservada para |
|--------------|------------|----------------|
| `8000` | Django `runserver` | Projeto principal |
| `5173` | Vite (React) | Projeto principal |
| `5432` | PostgreSQL | Projeto principal |
| `6379` | Redis | Projeto principal |

Este repositório usa **portas alternativas fixas** abaixo.

---

## Mapa de portas — Food Service

| Serviço | Repositório | Porta | URL local |
|---------|-------------|-------|-----------|
| **API Django** | `vendas_backend` | **8001** | http://localhost:8001/api/v1 |
| **Health check** | `vendas_backend` | **8001** | http://localhost:8001/api/v1/health/ |
| **Storefront** | `vendas_frontend` | **5174** | http://localhost:5174 |
| **Backoffice** | `vendas_frontend` | **5175** | http://localhost:5175 |
| PostgreSQL (Docker) | `vendas_backend` | **5433** | `localhost:5433` |
| Redis (Docker) | `vendas_backend` | **6380** | `localhost:6380` |

### Subdomínio em desenvolvimento (multi-tenant)

| Padrão | Exemplo |
|--------|---------|
| `{subdomain}.localhost:{storefront_port}` | `pizzaria-joao.localhost:5174` |

O backend resolve o tenant pelo header `Host` (middleware). Em dev, apontar o subdomínio para `127.0.0.1` no `/etc/hosts` se necessário.

---

## Variáveis de ambiente

### Backend (`vendas_backend/.env`)

```bash
DJANGO_ENV=development
POSTGRES_HOST=localhost
POSTGRES_PORT=5433
REDIS_URL=redis://localhost:6380/0
```

### Frontend (`vendas_frontend/.env`)

```bash
VITE_API_BASE_URL=http://localhost:8001/api/v1
```

---

## Comandos rápidos

```bash
# Terminal 1 — Infra
cd vendas_backend && docker compose -f docker-compose.dev.yml up -d

# Terminal 2 — API (porta 8001)
cd vendas_backend && source .venv/bin/activate
python manage.py runserver 8001

# Terminal 3 — Storefront (porta 5174)
cd vendas_frontend && npm run dev

# Terminal 4 — Backoffice (porta 5175) [opcional]
cd vendas_frontend && npm run dev:admin
```

---

## CORS (backend)

Origens permitidas em `config/settings/development.py`:

- `http://localhost:5174`
- `http://localhost:5175`
- `http://127.0.0.1:5174`
- `http://127.0.0.1:5175`

---

## Produção vs desenvolvimento

| Contexto | API | Storefront |
|----------|-----|------------|
| **Dev local** | `localhost:8001` | `localhost:5174` |
| **Produção** | `api.foodservice.app` | `{subdomain}.foodservice.app` |

Em Docker de produção, o Gunicorn pode escutar na porta **8000** *dentro* do container — isso não conflita com o `runserver` local na 8001.

---

## Histórico de Revisões

| Versão | Data | Alterações |
|--------|------|------------|
| 1.0 | Jul/2026 | Portas alternativas definidas (projeto secundário) |
