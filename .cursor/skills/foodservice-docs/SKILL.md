---
name: foodservice-docs
description: >-
  Create or update Food Service documentation in vendas_frontend/docs following
  established format, approval workflow, and cross-references. Use when writing
  or revising product docs, checklists, or architecture documents.
---

# Food Service — Documentação

## Localização

Todos os docs em `vendas_frontend/docs/` — numeração `00-` a `17+`.

**Documento fundador de produto:** `00-product-philosophy.md` — prevalece em conflitos de UX/produto.

## Formato padrão (cabeçalho)

```markdown
# NN — Título

> **Documento:** ...
> **Produto:** Food Service *(nome comercial provisório)*
> **Versão:** X.Y
> **Status:** Aprovado | Aguardando revisão
> **Última atualização:** Mês/Ano
> **Depende de:** `doc-aprovado.md`
```

## Workflow de aprovação

1. Escrever **um documento por vez**
2. Rodapé: `> **Aguardando revisão e aprovação.**`
3. Após aprovação do usuário: `Status: Aprovado` + `> **Documento aprovado.** Próximo: \`NN-...\``
4. Histórico de revisões com linha `— aprovado`

## Tipos de documento

| Tipo | Exemplos | Natureza |
|------|----------|----------|
| Referência | 02–11 | Especificação aprovada |
| Checklist | 12–14 | Escopo **fechado** — checkboxes |
| Backlog | 15 | Estratégico — sem escopo fechado |
| Dev local | 00 | Portas, comandos, `.env` |

## Portas locais (sempre que citar dev)

Usar valores de `00-portas-locais.md`:

- API: `http://localhost:8001/api/v1`
- Storefront: `localhost:5174`
- Backoffice: `localhost:5175`
- Subdomínio: `{tenant}.localhost:5174`

**Não** usar `8000` ou `5173` para este projeto (reservados ao projeto principal).

## Cross-reference

Ao adicionar feature nova, atualizar:

- `07-api.md` (endpoints)
- `08-regras-de-negocio.md` (regras)
- `03-modelagem-do-banco.md` (tabelas)
- Checklist da fase correspondente

## Não criar docs não solicitados

README e skills são exceção operacional; specs de produto só quando o usuário pedir o próximo da série.
