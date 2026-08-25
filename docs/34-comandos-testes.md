# 34 — Comandos de Testes

> **Documento:** Receita rápida — pytest, segurança e scans (copiar e colar)  
> **Produto:** Food Service *(nome comercial provisório)*  
> **Versão:** 1.5  
> **Status:** Aguardando revisão  
> **Última atualização:** Agosto/2026  
> **Depende de:** `00-portas-locais.md`, `32-bateria-testes-sistema.md`, `33-bateria-testes-seguranca.md`

---

## 1. Pré-requisitos

```bash
# backend
cd ~/projetos/vendas_backend
source .venv/bin/activate
export DJANGO_ENV=test

# frontend (quando for npm audit / Playwright)
cd ~/projetos/vendas_frontend
```

Portas locais: API `8001`, storefront `5174`, admin `5175` — ver `00-portas-locais.md`.  
Pytest **não** precisa do `runserver` (usa SQLite em memória).

---

## 2. Pytest — isolamento multi-tenant (Onda 1 · doc 33)

```bash
cd ~/projetos/vendas_backend
source .venv/bin/activate
export DJANGO_ENV=test

# suite completa da matriz (17 testes)
pytest apps/companies/tests/test_tenant_isolation_matrix.py -q

# verbose / um caso
pytest apps/companies/tests/test_tenant_isolation_matrix.py -vv
pytest apps/companies/tests/test_tenant_isolation_matrix.py -k cross_tenant -vv
```

---

## 3. Pytest — regressão backend (apps críticos)

```bash
cd ~/projetos/vendas_backend
source .venv/bin/activate
export DJANGO_ENV=test

# bloco usado na Onda 1 (auth, companies, orders, catalog, promotions)
pytest \
  apps/accounts/tests/ \
  apps/companies/tests/ \
  apps/orders/tests/ \
  apps/promotions/tests/ \
  apps/catalog/tests/test_admin_category_api.py \
  apps/catalog/tests/test_catalog_api.py \
  core/tests/ \
  -q

# suite inteira do backend
pytest -q

# só um app
pytest apps/orders/tests/ -q
pytest apps/communications/tests/ -q
```

---

## 4. Análise estática e dependências (Onda 2 · doc 33)

Já no venv via `requirements/development.txt` (`bandit`, `pip-audit`).

```bash
cd ~/projetos/vendas_backend
source .venv/bin/activate

# Bandit — High e acima em apps/ (deve sair 0 High)
bandit -r apps/ -ll -f txt

# Dependências Python (0 vulns esperadas após Django 5.2.17+)
python -m pip_audit

# Frontend — vulnerabilidades npm (prod)
cd ~/projetos/vendas_frontend
npm audit --omit=dev
```

Secrets no git (checagem rápida):

```bash
cd ~/projetos/vendas_backend
git ls-files | grep -E '\.env$' || echo "ok: nenhum .env versionado"
cd ~/projetos/vendas_frontend
git ls-files | grep -E '\.env$' || echo "ok: nenhum .env versionado"
```

Semgrep (opcional / adiado na Onda 2):

```bash
pip install semgrep
semgrep --config p/owasp-top-ten --config p/python apps/
```

---

## 5. OWASP ZAP baseline (Onda 3 · doc 33)

API precisa estar no ar. Preferir **`8001`**; se ocupada (outro projeto), use **`8011`**.

```bash
cd ~/projetos/vendas_backend
source .venv/bin/activate
export DJANGO_ENV=development
# exemplo se 8001 estiver ocupada:
python manage.py runserver 8011

mkdir -p zap-reports
API=http://127.0.0.1:8011   # ou :8001

# público
docker run --rm --network host \
  -v "$(pwd)/zap-reports:/zap/wrk:rw" \
  ghcr.io/zaproxy/zaproxy:stable \
  zap-baseline.py -t ${API}/api/v1/health/ -r zap-baseline-health.html -J zap-baseline-health.json

# autenticado (admin)
TOKEN=$(curl -s -X POST ${API}/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@demo.com","password":"demo1234","subdomain":"demo"}' \
  | python -c "import sys,json; print(json.load(sys.stdin)['access'])")

docker run --rm --network host \
  -v "$(pwd)/zap-reports:/zap/wrk:rw" \
  -e ZAP_AUTH_HEADER=Authorization \
  -e "ZAP_AUTH_HEADER_VALUE=Bearer ${TOKEN}" \
  ghcr.io/zaproxy/zaproxy:stable \
  zap-baseline.py -t ${API}/api/v1/admin/me/ \
  -r zap-baseline-admin.html -J zap-baseline-admin.json
```

Relatórios em `vendas_backend/zap-reports/` (pasta no `.gitignore`).  
Esperado: `FAIL-NEW: 0`. **Não** apontar para produção.

---

## 6. Playwright — “não pode acessar” (Onda 4 · doc 33)

Pré-requisitos: API no ar (`8001` ou `8011`), seed, Node **≥ 22** no PATH (Vite 8/rolldown).

```bash
# seed fixtures
cd ~/projetos/vendas_backend
source .venv/bin/activate
export DJANGO_ENV=development
python manage.py seed_e2e_security --out ../vendas_frontend/e2e/.auth/fixtures.json

# API (se 8001 ocupada)
python manage.py runserver 8011

# frontends — Node 22 (nvm) se o shell default for o Node do Cursor
export PATH="$HOME/.nvm/versions/node/v22.23.2/bin:$PATH"
cd ~/projetos/vendas_frontend
VITE_API_PORT=8011 npm run dev:admin   # :5175
VITE_API_PORT=8011 npm run dev         # :5174

# rodar (host com libs do Chromium)
VITE_API_PORT=8011 npm run test:e2e:security

# OU via Docker (recomendado neste servidor — sem libatk no host)
docker run --rm --network host \
  -v "$HOME/projetos/vendas_frontend:/work" -w /work \
  -e VITE_API_PORT=8011 -e HOME=/tmp \
  mcr.microsoft.com/playwright:v1.62.1-jammy \
  npx playwright test e2e/security
```

---

## 7. Servidores locais (bateria manual / ZAP / Playwright)

```bash
# 1 — infra
cd ~/projetos/vendas_backend
docker compose -f docker-compose.dev.yml up -d

# 2 — API
source .venv/bin/activate
export DJANGO_ENV=development
python manage.py runserver 8001

# 3 — storefront
cd ~/projetos/vendas_frontend && npm run dev

# 4 — admin
cd ~/projetos/vendas_frontend && npm run dev:admin

# health
curl -s http://localhost:8001/api/v1/health/
```

Bateria funcional (browser): checklist em `32-bateria-testes-sistema.md`.

---

## 8. Hardening de config (Onda 5 · doc 33)

```bash
cd ~/projetos/vendas_backend
source .venv/bin/activate
export DJANGO_ENV=test

# suite da onda 5 (fail-fast prod, upload, 500 genérico, throttle)
pytest core/tests/test_hardening_onda5.py -q
```

Checklist H1.* em `33` §9. Staging: `DJANGO_ENV=staging` (mesmas travas de `production`).

---

## 9. Pentest humano / revalidação (Onda 6 · doc 33)

Credenciais: `e2e/.auth/fixtures.json`. Checklist visual em `33` §10 (“Como você revalida”).

```bash
# regressão automatizada pós-achado PermissionRoute
cd ~/projetos/vendas_frontend
docker run --rm --network host \
  -v "$HOME/projetos/vendas_frontend:/work" -w /work \
  -e VITE_API_PORT=8011 -e HOME=/tmp \
  mcr.microsoft.com/playwright:v1.62.1-jammy \
  npx playwright test e2e/security
```

---

## 10. Atalhos úteis

| Objetivo | Comando |
|----------|---------|
| Só isolamento | `DJANGO_ENV=test pytest apps/companies/tests/test_tenant_isolation_matrix.py -q` |
| Hardening onda 5 | `DJANGO_ENV=test pytest core/tests/test_hardening_onda5.py -q` |
| E2e segurança | §6 Playwright / §9 Docker |
| Regressão rápida pós-fix | §3 bloco “apps críticos” |
| Bandit | `bandit -r apps/ -ll` |
| pip-audit | `pip-audit` |
| npm audit | `npm audit --omit=dev` (no frontend) |

---

## 11. Histórico

| Versão | Data | Notas |
|--------|------|-------|
| 1.0 | Ago/2026 | Comandos das Ondas 0–1 + stubs 2–4 e startup local |
| 1.1 | 2026-08-25 | Onda 2: Bandit/pip-audit no development.txt; Django 5.2.17; npm audit limpo |
| 1.2 | 2026-08-25 | Onda 3: comandos ZAP público + JWT admin; porta alternativa 8011 |
| 1.3 | 2026-08-25 | Onda 4: Playwright security + seed + Docker fallback Node 22 |
| 1.4 | 2026-08-25 | Onda 5: `test_hardening_onda5.py` + atalho |
| 1.5 | 2026-08-25 | Onda 6: revalidação browser + Playwright pós-`PermissionRoute` |

---

> **Aguardando revisão e aprovação.**
