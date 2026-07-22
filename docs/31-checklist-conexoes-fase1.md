# 31 — Checklist Conexões Fase 1

> **Documento:** Escopo fechado — WhatsApp + Evolution + Motor de Comunicação  
> **Produto:** Food Service *(nome comercial provisório)*  
> **Versão:** 1.0  
> **Status:** Em implementação  
> **Última atualização:** Julho/2026  
> **Depende de:** `25`–`30` *(aprovados)*

---

## Backend

- [x] App `communications` + models (`Connection`, `SituationSetting`, `MessageTemplate`, `MessageDispatch`, `MerchantAlert`) + migration
- [x] Domain: `event_key` catalog, ports `WhatsAppProvider`, exceptions
- [x] `EvolutionWhatsAppAdapter` + registry + Fake adapter
- [x] `CommunicationEngine` (handle event, render, enqueue send)
- [x] `ConnectionService` (conectar, QR, status, desconectar, health)
- [x] Celery: `send_dispatch` + health check task
- [x] Admin API: connections, situations, templates, preview/test, diagnostics, stats
- [x] Webhook: `POST /api/v1/webhooks/communications/{provider}/`
- [x] Emitir eventos em `OrderService.update_status`
- [x] Permissão `connections.manage` + roles (owner/manager)
- [x] Seeds de templates no provisionamento
- [x] Testes pytest (engine, renderer, fake provider) — 5 passing

## Frontend backoffice

- [x] Nav + rotas `/conexoes`, `/conexoes/whatsapp`, `/conexoes/whatsapp/templates`
- [x] Hub Conexões (WhatsApp ativo; Email/SMS Em breve)
- [x] Dois modos de conexão: **simples (hospedada)** e **Já tenho Evolution**
- [x] `EVOLUTION_HOSTED_*` no `.env` / options API
- [x] Painel: status, diagnóstico, stats, CTAs
- [x] Templates: lista, editor, prévia, enviar teste, salvar
- [x] Permissão `connections.manage` no `<Can>`

## Docs (durante/após)

- [ ] Cross-refs leves em `03` / `07` / `08` (não bloquear código)

## Validação local (pendente)

- [x] `migrate` no Postgres local
- [x] Re-sincronizar roles (`connections.manage` no owner/manager)
- [x] Celery worker `celery -A config worker` (envio async)
- [ ] Conectar Evolution real + escanear QR
- [ ] Confirmar pedido → mensagem no WhatsApp do cliente
- [ ] Se o menu Conexões não aparecer: sair e entrar de novo no backoffice

## Fora do escopo (Fases 2+)

- [ ] Meta Cloud / Z-API / multi-número
- [ ] Comunicação Inteligente (atrasos, cupom, aniversário)
- [ ] Email / SMS / Push
- [ ] Central de Mensagens com reenvio/filtros densos
- [ ] Inbox / chatbot
- [ ] Celery Beat periódico de health (task existe; schedule ainda não)

---

> Marcar itens ao validar em ambiente local (API **8001**, backoffice **5175**).  
> Filosofia: zero jargão na UI (`25` §7). Pedidos nunca importam Evolution (`26`).
