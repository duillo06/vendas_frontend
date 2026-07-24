# Frontend — Deploy

O storefront + backoffice entram na imagem Nginx buildada pelo
`vendas_backend/deploy/docker-compose.prod.yml` (contexto `../vendas_frontend`).

## Na VPS

Os dois repos ficam lado a lado:

```text
/opt/foodservice/
├── vendas_backend/
└── vendas_frontend/
```

Deploy (puxa Git + rebuild):

```bash
cd /opt/foodservice/vendas_backend
bash deploy/scripts/remote-deploy.sh
```

## CI/CD (GitHub Actions)

Workflow: `.github/workflows/deploy-production.yml`

- Trigger: push em `main` ou `workflow_dispatch`
- Faz SSH na VPS e roda o `remote-deploy.sh` do backend

Secrets no environment **production** (iguais ao backend):

| Secret | Exemplo |
|--------|---------|
| `PRODUCTION_HOST` | IP da VPS Hostinger |
| `PRODUCTION_USER` | `root` ou usuário com Docker |
| `PRODUCTION_SSH_KEY` | chave privada SSH |

Guia completo: `../vendas_backend/deploy/DEPLOY.md`
