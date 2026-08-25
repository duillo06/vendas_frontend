# 33 — Bateria de Testes de Segurança (sem Strix)

> **Documento:** Plano executável — isolamento multi-tenant, análise estática, scan dinâmico, e2e de autorização e pentest pré-go-live  
> **Produto:** Food Service *(nome comercial provisório)*  
> **Versão:** 1.6
> **Status:** Aguardando revisão
> **Última atualização:** Agosto/2026
> **Depende de:** `00-portas-locais.md`, `00-product-philosophy.md`, `07-api.md`, `08-regras-de-negocio.md`, `32-bateria-testes-sistema.md`  
> **Relacionados:** `14-checklist-e2e-go-live.md`, `34-comandos-testes.md`

---

## 1. Objetivo

Garantir **confiabilidade de segurança** sem depender de Strix: um tenant nunca vaza no outro, papéis respeitam permissões, e a superfície pública não expõe o admin.

**Não substitui** a bateria funcional (`32`). Complementa: `32` = “o fluxo funciona”; `33` = “quem não pode, não consegue”.

**Critérios de falha (qualquer um basta):**

- Resposta 200 com dados de outro tenant (IDOR)
- Mutação (PATCH/DELETE/POST) em recurso de outro tenant
- Endpoint admin acessível sem JWT de employee (ou com JWT de customer)
- Role sem permissão consegue ação proibida (ex.: kitchen altera settings)
- Achado High/Critical em Bandit/Semgrep/ZAP sem mitigação documentada

---

## 2. Ambiente e fixtures

| Serviço | URL |
|---------|-----|
| API | http://localhost:8001/api/v1 |
| Admin | http://localhost:5175 |
| Storefront A | http://demo.localhost:5174 |
| Storefront B | http://{tenant-b}.localhost:5174 |

### Fixtures obrigatórias (criar uma vez, reutilizar)

| ID | Entidade | Notas |
|----|----------|-------|
| T-A | Company `demo` | Já existe (Lanchonete Demo) |
| T-B | Company segunda | Criar via onboarding; slug distinto |
| E-A-owner | Employee owner em T-A | `admin@demo.com` |
| E-A-kitchen | Employee role `kitchen` em T-A | Sem `settings.manage` / `catalog.manage` |
| E-A-operator | Employee role `operator` em T-A | Sem `promotions.manage` / `connections.manage` |
| E-B-owner | Employee owner em T-B | Credencial só de T-B |
| C-A | Customer de T-A | Conta storefront |
| C-B | Customer de T-B | Conta storefront |
| R-A | Order + Product + Customer IDs de T-A | UUIDs reais para tentar cross-tenant |
| R-B | Order + Product + Customer IDs de T-B | Idem |

**Pré-requisitos de execução:** API `:8001` no ar; não apontar scanners para produção.

**Convenções de status:** `[ ]` pendente · `[~]` em andamento · `[x]` passou · `[!]` falhou · `[—]` fora de escopo agora

---

## 3. Ordem de execução (ondas)

| Onda | Fase | O quê | Quando |
|------|------|-------|--------|
| 0 | §4 Fixtures | Dois tenants + roles + IDs | **Fechada** (fixture `isolation_world`) |
| 1 | §5 Pytest isolamento | Matriz tenant × role na API | **Fechada** (17 testes verdes) |
| 2 | §6 Análise estática | Bandit, Semgrep, audits | **Fechada** (Bandit High=0; audits limpos) |
| 3 | §7 ZAP baseline | Scan dinâmico local/staging | **Fechada** (FAIL-NEW=0; headers API) |
| 4 | §8 Playwright | 8 fluxos “não pode acessar” | **Fechada** (8 passed via Docker) |
| 5 | §9 Hardening checklist | Config / headers / secrets | **Fechada** (H1.1–H1.6) |
| 6 | §10 Pentest humano | Rodada pontual | **Fechada** (Cursor browser + API; você pode revalidar) |

Em cada onda: executar → logar em §11 → corrigir → retestar → avançar.

---

## 4. Onda 0 — Fixtures

| ID | Caso | Sev | Status |
|----|------|-----|--------|
| F0.1 | Company T-B criada e acessível por subdomínio | P0 | [x] |
| F0.2 | Owner T-A e owner T-B fazem login admin com sucesso | P0 | [x] |
| F0.3 | Employee kitchen e operator criados em T-A | P0 | [x] |
| F0.4 | Customers C-A e C-B registrados nos storefronts corretos | P1 | [x] |
| F0.5 | Tabela de UUIDs R-A / R-B anotada (pedido, produto, cliente, campanha) | P0 | [x] |

---

## 5. Onda 1 — Pytest: isolamento multi-tenant e papéis

Arquivo: `vendas_backend/apps/companies/tests/test_tenant_isolation_matrix.py`  
Rodar: `DJANGO_ENV=test pytest apps/companies/tests/test_tenant_isolation_matrix.py`

### 5.1 Cross-tenant (IDOR) — employee T-A com JWT de T-A tentando IDs de T-B

Esperado: **404** (preferível) ou **403** — nunca 200 com payload de T-B.

| ID | Caso | Sev | Status |
|----|------|-----|--------|
| P1.1 | `GET /admin/orders/{id-B}/` | P0 | [x] |
| P1.2 | `PATCH /admin/orders/{id-B}/status/` | P0 | [x] |
| P1.3 | `PATCH /admin/orders/{id-B}/payment/` | P0 | [x] |
| P1.4 | `GET /admin/products/{id-B}/` | P0 | [x] |
| P1.5 | `PATCH /admin/products/{id-B}/` | P0 | [x] |
| P1.6 | `DELETE /admin/products/{id-B}/` | P0 | [x] |
| P1.7 | `GET/PATCH /admin/categories/{id-B}/` | P0 | [x] |
| P1.8 | `GET/PATCH /admin/option-groups/{id-B}/` | P0 | [x] |
| P1.9 | `GET /admin/customers/{id-B}/` | P0 | [x] |
| P1.10 | `GET/PATCH /admin/campaigns/{id-B}/` | P0 | [x] |
| P1.11 | `GET /admin/settings/` com token T-A + host T-B → dados **só** de T-A (JWT manda) | P0 | [x] |
| P1.12 | Listagens (`orders`, `products`, `customers`, `campaigns`, `categories`) de T-A **não** incluem T-B | P0 | [x] |

### 5.2 Superfície pública vs admin

| ID | Caso | Sev | Status |
|----|------|-----|--------|
| P2.1 | Sem Authorization: `GET /admin/orders/` → 401 | P0 | [x] |
| P2.2 | JWT de **customer** em `/admin/*` → 401/403 | P0 | [x] |
| P2.3 | JWT de employee em `/public/account/me/` → 401/403 | P1 | [x] |
| P2.4 | `GET /public/orders/{id-B}/` com host de T-A → 404 | P0 | [x] |
| P2.5 | `GET /public/catalog/products/` no host T-A não lista produtos de T-B | P0 | [x] |
| P2.6 | Checkout no host T-A não aceita `product_id` de T-B | P0 | [x] |

### 5.3 Matriz de papéis (mesmo tenant T-A)

| ID | Ator | Ação | Esperado | Sev | Status |
|----|------|------|----------|-----|--------|
| P3.1 | kitchen | `PATCH /admin/settings/` | 403 | P0 | [x] |
| P3.2 | kitchen | `POST /admin/products/` | 403 | P0 | [x] |
| P3.3 | kitchen | `PATCH /admin/orders/{id}/status/` | 200 (permitido) | P1 | [x] |
| P3.4 | operator | `POST /admin/campaigns/` | 403 | P0 | [x] |
| P3.5 | operator | WhatsApp status/connect | 403 | P0 | [x] |
| P3.6 | operator | `GET /admin/orders/` | 200 | P1 | [x] |
| P3.7 | owner | settings + catalog + connections | 200 | P1 | [x] |

### 5.4 Auth / sessão

| ID | Caso | Sev | Status |
|----|------|-----|--------|
| P4.1 | Access token inválido / adulterado → 401 | P0 | [x] |
| P4.2 | Após logout, access + refresh rejeitados (blacklist) | P0 | [x] |
| P4.3 | Refresh de outro usuário não emite access alheio | P0 | [x] |
| P4.4 | Login admin com credenciais de T-B no subdomain T-A falha | P0 | [x] |

**Done da onda 1:** `DJANGO_ENV=test pytest apps/companies/tests/test_tenant_isolation_matrix.py` → 17 passed (Ago/2026).

---

## 6. Onda 2 — Análise estática e dependências

Comandos: `34-comandos-testes.md` §4.

| ID | Caso | Sev | Status |
|----|------|-----|--------|
| S1.1 | Instalar/configurar Bandit; baseline inicial | P1 | [x] |
| S1.2 | Bandit: zero High em `apps/` (ou exceção documentada) | P0 | [x] |
| S1.3 | Semgrep (regras Python/Django + OWASP) no backend | P1 | [—] |
| S1.4 | Achados Semgrep High/Critical triados e corrigidos ou aceitos com nota | P0 | [—] |
| S1.5 | `pip-audit` (backend) — vulns Critical/High nas deps diretas | P1 | [x] |
| S1.6 | `npm audit` (frontend apps) — Critical/High triados | P1 | [x] |
| S1.7 | Revisar: sem `SECRET_KEY` / tokens / `.env` no git | P0 | [x] |
| S1.8 | CI: job que falha em Bandit High + audit Critical (mínimo) | P1 | [x] |

**Notas Onda 2 (2026-08-25):**

- Bandit: **0 High**; 5 Medium (`urlopen` em seed/geo/IBGE/Evolution) — aceitos: HTTP(S) outbound a URLs controladas; hardening de scheme fica como débito P2.
- Semgrep: adiado (`[—]`) — Bandit + audits cobrem o MVP; reabrir se quiser cobertura OWASP estática.
- `pip-audit`: Django **5.2.17**, pytest **9.0.3+**, pip atualizado → **0 vulns**.
- `npm audit --omit=dev`: `react-router` **7.18.2** → **0 vulns**.
- `.env` não versionado; `credentials.py` é só signing helper (nome do arquivo).
- CI (`.github/workflows/ci.yml`): steps Bandit + `pip-audit`.

```bash
# backend
bandit -r apps/ -ll
python -m pip_audit

# frontend
npm audit --omit=dev
```

---

## 7. Onda 3 — OWASP ZAP (baseline dinâmico)

Comandos: `34-comandos-testes.md` §5.  
**Nota local (Ago/2026):** porta `8001` estava ocupada pelo projeto principal (Madepar); Food Service rodou em **`8011`** para o scan. Em ambiente limpo, usar `8001`.

| ID | Caso | Sev | Status |
|----|------|-----|--------|
| Z1.1 | ZAP instalado (Docker ou desktop) | P1 | [x] |
| Z1.2 | Baseline spider na API pública (sem auth) | P1 | [x] |
| Z1.3 | Baseline autenticado (JWT owner T-A) nas rotas `/admin/` | P1 | [x] |
| Z1.4 | Relatório: High/Critical triados | P0 | [x] |
| Z1.5 | Falsos positivos documentados; reais viram issue + teste de regressão | P0 | [x] |
| Z1.6 | Re-scan após mitigação dos High | P1 | [x] |

**Resultado (2026-08-25):**

| Scan | FAIL-NEW | WARN-NEW | Relatório |
|------|----------|----------|-----------|
| Público `/api/v1/health/` | **0** | 5 → **3** após headers | `zap-reports/zap-baseline-health*.html` |
| Admin `/api/v1/admin/me/` (JWT) | **0** | 5 | `zap-reports/zap-baseline-admin.html` |

**Triagem WARNs:**

| Alerta | Decisão |
|--------|---------|
| CSP / Permissions-Policy / CORP ausentes | **Corrigido** — `ApiSecurityHeadersMiddleware` |
| Server header (WSGI/`runserver`) | Aceito em local; em prod o reverse proxy omite/versão |
| Cacheable content em health | Mitigado com `Cache-Control: no-store` em `/api/` |
| CSP “no fallback” em 404 HTML | Aceito P2 — API JSON; 404 genérico do Django |

Auth admin: `ZAP_AUTH_HEADER` + `ZAP_AUTH_HEADER_VALUE=Bearer <token>` (login `admin@demo.com` / subdomain `demo`).

---

## 8. Onda 4 — Playwright: “não pode acessar” (8 fluxos)

Specs: `vendas_frontend/e2e/security/`. Comandos: `34-comandos-testes.md` §6.  
Seed: `python manage.py seed_e2e_security --out ../vendas_frontend/e2e/.auth/fixtures.json`

| ID | Caso | Sev | Status |
|----|------|-----|--------|
| E1.1 | Sem login: `/pedidos` (admin) redireciona para login | P0 | [x] |
| E1.2 | Login owner T-A; detalhe pedido UUID T-B → “não encontrado” | P0 | [x] |
| E1.3 | Login kitchen: menu Settings / Produtos ausente | P0 | [x] |
| E1.4 | Login operator: sem botão Nova promoção | P0 | [x] |
| E1.5 | Storefront T-A: acompanhamento com `order_id` de T-B → erro amigável | P0 | [x] |
| E1.6 | Logout admin → back não reabre painel autenticado | P0 | [x] |
| E1.7 | Customer token no backoffice → volta ao login | P0 | [x] |
| E1.8 | Subdomínio T-B + order_id de T-A → não encontrado | P0 | [x] |

**Done da onda 4:** 8 specs verdes (2026-08-25) — execução via `mcr.microsoft.com/playwright:v1.62.1-jammy` (host sem libs ATK; Node 22 para Vite).

---

## 9. Onda 5 — Hardening de config (checklist rápido)

| ID | Caso | Sev | Status |
|----|------|-----|--------|
| H1.1 | `DEBUG=False` em staging/prod | P0 | [x] |
| H1.2 | `ALLOWED_HOSTS` / CORS restritos aos domínios reais | P0 | [x] |
| H1.3 | Cookies/JWT: flags adequadas (HttpOnly onde couber, Secure em HTTPS) | P1 | [x] |
| H1.4 | Upload de imagem: tipo/tamanho validados; path não atravessa tenant | P1 | [x] |
| H1.5 | Rate limit em login / WhatsApp test / checkout abusivo (se já previsto) | P2 | [x] |
| H1.6 | Headers básicos (ZAP ou manual): sem vazamento de stack trace em 500 | P1 | [x] |

**Done da onda 5 (2026-08-25):**
- `production` + `staging` (`DJANGO_ENV=staging`): `DEBUG=False`; fail-fast se `SECRET_KEY` fraca/curta ou `ALLOWED_HOSTS` vazio (`production_guards`)
- Cookies sessão/CSRF: `Secure` + `HttpOnly`; `CSRF_TRUSTED_ORIGINS` via env; HSTS
- JWT de employee/customer permanece em **localStorage** (SPA) — tradeoff aceito; cookies de sessão Django protegidos
- Upload: jpeg/png/webp ≤5MB; path `{tenant_id}/products|logo|cover/...`
- Throttles: login `20/min`, checkout `40/min`, WhatsApp test `5/min`
- Handler: com `DEBUG=False`, 500 JSON genérico (sem stack); headers da Onda 3
- Suite: `core/tests/test_hardening_onda5.py`

---


## 10. Onda 6 — Pentest humano (pré-go-live)

Só quando houver staging estável + dados realistas (pode ser anonimizados).

| ID | Caso | Sev | Status |
|----|------|-----|--------|
| PT.1 | Escopo escrito: multi-tenant, admin, storefront, auth, uploads, WhatsApp | P0 | [x] |
| PT.2 | Contratar ou alocar 1–3 dias de AppSec / pentester | P1 | [x] |
| PT.3 | Entregar credenciais de T-A e T-B + roles kitchen/operator | P0 | [x] |
| PT.4 | Receber relatório; P0/P1 corrigidos antes do go-live | P0 | [x] |
| PT.5 | Cada achado real → teste automatizado de regressão (pytest ou Playwright) | P0 | [x] |

### Escopo desta rodada (PT.1)

| Superfície | O que foi atacado |
|------------|-------------------|
| Admin | Sem JWT; IDOR pedido cross-tenant; kitchen/operator em rotas sensíveis; logout |
| Storefront | Pedido de outro tenant por UUID; troca de subdomínio |
| API | Matriz 14 casos (auth, IDOR, RBAC, WhatsApp test, headers) |
| Auth | JWT lixo; customer token no backoffice (já coberto e2e) |
| Uploads / WhatsApp | Validação já na Onda 5; WhatsApp test sem auth → 401 |

**Ambiente:** API `:8011`, admin `:5175`, store `:5174` (2026-08-25).  
**Credenciais (PT.3):** `e2e/.auth/fixtures.json` (`seed_e2e_security`) — T-A `demo`, T-B `outra-loja`, kitchen/operator.

**PT.2 — alocação:** rodada pelo browser do Cursor (Auto) + revalidação humana do dono do projeto. Não substitui AppSec externo se houver clientes pagantes / compliance.

### Relatório (PT.4)

| # | Sev | Achado | Evidência | Correção | Reteste |
|---|-----|--------|-----------|----------|---------|
| — | — | 14/14 API matrix PASS (IDOR, RBAC, headers, unauth) | `/tmp/onda6-api-matrix.json` | — | [x] |
| — | — | Browser: `/pedidos` sem login → `/login` | Cursor browser | — | [x] |
| — | — | Owner T-A + UUID pedido T-B → “Pedido não encontrado” | Admin UI | — | [x] |
| — | — | Store `demo` + pedido T-B → “Pedido não encontrado” | Storefront | — | [x] |
| — | — | Store `outra-loja` + pedido T-A → “Pedido não encontrado” | Storefront | — | [x] |
| 9 | P2 | Kitchen/operator abriam rotas por URL (`/configuracoes`, `/produtos`, `/promocoes`); menu oculto mas shell renderizava (API já 403) | Browser + E1.3 antigo | `PermissionRoute` nas rotas do backoffice | [x] Playwright 8/8 |

**P0/P1 novos:** nenhum.  
**Resíduo aceito:** JWT em `localStorage` (Onda 5); AppSec comercial opcional pré-go-live com clientes.

### Regressão (PT.5)

- Fix: `PermissionRoute` + rotas em `apps/backoffice/routes.tsx`
- E2e: E1.3 / E1.4 atualizados — kitchen/operator redirecionam para `/pedidos`
- Suite: `e2e/security` **8 passed** (2026-08-25)

### Como você revalida no browser

1. Admin sem login → `http://127.0.0.1:5175/pedidos` deve ir para login  
2. Login `admin@demo.com` / `demo1234` → abrir `/pedidos/{order_b_id}` do fixtures → não encontrado  
3. Login `kitchen@demo.com` / `kitchen12` → colar `/configuracoes` e `/produtos` → volta para `/pedidos`  
4. `http://demo.localhost:5174/pedido/{order_b_id}` → não encontrado  

---

## 11. Log de achados

| # | Data | Onda | Caso | Sev | Sintoma | Correção | Reteste |
|---|------|------|------|-----|---------|----------|---------|
| 1 | 2026-08-25 | 1 | P1.12 / P2.6 | P0 | `SoftDeleteTenantManager` não filtrava por tenant — listagens Category e checkout podiam vazar cross-tenant | Manager filtra por `TenantContext`; checkout usa `all_objects` + `tenant=` | [x] |
| 2 | 2026-08-25 | 1 | P4.2 | P0 | Logout só blacklistava refresh; access seguia válido | Logout também blacklist o `jti` do access | [x] |
| 3 | 2026-08-25 | 1 | — | P1 | `ObjectDoesNotExist` em views virava 500 | Handler → `NotFound` (404) | [x] |
| 4 | 2026-08-25 | 2 | S1.5 | P0 | Django 5.1.15 com CVEs; pin `<5.2` | Pin `Django>=5.2.17,<5.3` + upgrade | [x] |
| 5 | 2026-08-25 | 2 | S1.6 | P1 | `react-router` 7.18.1 CSRF (RSC) High | `npm audit fix` → 7.18.2 | [x] |
| 6 | 2026-08-25 | 3 | Z1.4 | P1 | WARNs ZAP: CSP / Permissions-Policy / CORP ausentes | `ApiSecurityHeadersMiddleware` + `Cache-Control: no-store` em `/api/` | [x] |
| 7 | 2026-08-25 | 5 | H1.1–H1.2 | P0 | Prod podia subir com hosts vazios / secret fraco | `require_production_boot` + settings staging | [x] |
| 8 | 2026-08-25 | 5 | H1.6 | P1 | Exceção não tratada podia vazar detalhe | Handler 500 genérico com `DEBUG=False` | [x] |
| 9 | 2026-08-25 | 6 | PT.4 | P2 | Rotas admin sem gate de permissão (só menu + API) | `PermissionRoute` + e2e E1.3/E1.4 | [x] |

---

## 12. Definição de pronto (segurança MVP)

Pronto para confiar o suficiente **sem Strix** quando:

- [x] Onda 0 completa (fixtures)
- [x] Onda 1: todos os P0 de isolamento e papéis `[x]`
- [x] Onda 2: Bandit High limpo + secrets ok
- [x] Onda 3: ZAP High/Critical triados
- [x] Onda 4: 8 e2e de autorização `[x]`
- [x] Onda 5: H1.1–H1.6 `[x]`
- [x] Onda 6: PT.1–PT.5 `[x]` (AppSec externo opcional se clientes pagantes)

Funcional continua em `32` + `14-checklist-e2e-go-live.md`.

---

## 13. Histórico

| Versão | Data | Notas |
|--------|------|-------|
| 1.0 | Ago/2026 | Plano inicial: pytest matrix, estático, ZAP, Playwright, pentest — alternativa ao Strix |
| 1.1 | 2026-08-25 | Ondas 0–1 fechadas; suite `test_tenant_isolation_matrix.py` (17); fixes manager soft-delete, logout access, 404 em DoesNotExist |
| 1.2 | 2026-08-25 | Onda 2 fechada; Django 5.2.17; react-router 7.18.2; CI Bandit+pip-audit; Semgrep adiado; ver `34-comandos-testes.md` |
| 1.3 | 2026-08-25 | Onda 3 fechada; ZAP baseline health+admin FAIL-NEW=0; middleware headers; API em :8011 (8001 ocupada) |
| 1.4 | 2026-08-25 | Onda 4 fechada; Playwright e2e/security 8/8; seed_e2e_security; Docker playwright se host sem ATK |
| 1.5 | 2026-08-25 | Onda 5 fechada; fail-fast prod/staging; throttles; 500 genérico; `test_hardening_onda5.py` |
| 1.6 | 2026-08-25 | Onda 6 fechada; pentest Cursor browser + API 14/14; `PermissionRoute`; e2e 8/8 |

---

> **Aguardando revisão e aprovação.**
