# 26 — Motor de Comunicação (Communication Engine)

> **Documento:** Arquitetura interna do Motor de Comunicação — eventos, resolução, envio, saúde e preparação para escala  
> **Produto:** Food Service *(nome comercial provisório)*  
> **Versão:** 1.0  
> **Status:** Aprovado  
> **Última atualização:** Julho/2026  
> **Depende de:** `00-product-philosophy.md`, `25-conexoes-philosophy.md` *(aprovados)*  
> **Relacionados:** `02-arquitetura.md`, `03-modelagem-do-banco.md`, `06-backend.md`, `10-padroes-de-codigo.md`, `21-marketing-engine.md`, `27-conexoes-providers.md`  
> **Série Conexões:** `27-conexoes-providers.md` · `28-message-templates.md` · `29-whatsapp-conexao-fluxo.md` · `30-conexoes-roadmap.md`  
> **Natureza:** Arquitetura — nomes de tabela/campo/classe são **internos** (nunca na UI; ver vocabulário em `25` §7)

---

## Sumário

1. [Por que este documento existe](#1-por-que-este-documento-existe)
2. [Princípios arquiteturais](#2-princípios-arquiteturais)
3. [Visão geral do fluxo](#3-visão-geral-do-fluxo)
4. [Posição no sistema](#4-posição-no-sistema)
5. [Domínio: conceitos internos](#5-domínio-conceitos-internos)
6. [Eventos de domínio](#6-eventos-de-domínio)
7. [Pipeline do Motor](#7-pipeline-do-motor)
8. [Resolução de canal, conexão e provedor](#8-resolução-de-canal-conexão-e-provedor)
9. [Resolução de template e variáveis](#9-resolução-de-template-e-variáveis)
10. [Envio, retries e idempotência](#10-envio-retries-e-idempotência)
11. [Registro de mensagens e estatísticas](#11-registro-de-mensagens-e-estatísticas)
12. [Diagnóstico e health check](#12-diagnóstico-e-health-check)
13. [Notificações ao comerciante](#13-notificações-ao-comerciante)
14. [Mensagem de teste e sandbox](#14-mensagem-de-teste-e-sandbox)
15. [Modelo de dados (lógico)](#15-modelo-de-dados-lógico)
16. [Apps e organização de código](#16-apps-e-organização-de-código)
17. [Contrato com o restante do sistema](#17-contrato-com-o-restante-do-sistema)
18. [Relação com `notification_logs`](#18-relação-com-notification_logs)
19. [Preparação: múltiplos números e Comunicação Inteligente](#19-preparação-múltiplos-números-e-comunicação-inteligente)
20. [Fora deste documento](#20-fora-deste-documento)
21. [Checklist de conformidade](#21-checklist-de-conformidade)
22. [Histórico de Revisões](#22-histórico-de-revisões)

---

## 1. Por que este documento existe

`25-conexoes-philosophy.md` define **o que o comerciante sente**.  
Este documento define **como o sistema pensa por baixo**.

O Motor de Comunicação (Communication Engine) é o **único ponto** pelo qual o domínio (pedidos, pagamentos, marketing futuro) dispara comunicações externas.

Se um PR fizer `OrderService` importar cliente Evolution (ou Meta, Z-API…), **este documento foi violado**.

> Domínio emite evento.  
> Motor decide.  
> Adapter executa.  
> Ninguém no meio conhece o vendor.

---

## 2. Princípios arquiteturais

| # | Princípio | Implicação |
|---|-----------|------------|
| 1 | **Ports & Adapters** | Interface de canal/provedor no domínio; adapters na infraestrutura (`02` §16.2) |
| 2 | **Event-first** | Side effects de comunicação partem de eventos de domínio, não de ifs espalhados |
| 3 | **Um motor** | WhatsApp hoje; Email/SMS amanhã — mesma entrada |
| 4 | **Tenant isolation** | Toda query e toda task carregam `tenant_id` |
| 5 | **Async por padrão** | Envio não bloqueia request de pedido (Celery) |
| 6 | **Fail soft no domínio** | Falha de WhatsApp não reverte pedido confirmado; registra e notifica |
| 7 | **Observabilidade humana** | Logs técnicos + estados traduzíveis para diagnóstico/UI (`25` §14–§16) |
| 8 | **Extensível sem redesign** | Multi-conexão e automações com atraso cabem no modelo (§19) |
| 9 | **Princípio de Valor** | Componentes internos existem para reduzir trabalho, erros ou automatizar (`25` §4) |

---

## 3. Visão geral do fluxo

```text
[ Domínio ]
  OrderService.confirm()
        │
        ▼
  emite CommunicationEvent
  (ex.: order.confirmed)
        │
        ▼
[ Motor de Comunicação ]
  1. Validar tenant + preferências (situação ativa?)
  2. Resolver canal (whatsapp)
  3. Resolver conexão (número / papel — Fase 1: a única)
  4. Resolver provedor + adapter
  5. Resolver template + renderizar variáveis
  6. Enfileirar envio (Celery)
        │
        ▼
[ Adapter ]  ex.: EvolutionWhatsAppAdapter
  send_text / send_template …
        │
        ▼
[ Registro ]
  message_log + métricas + (se falha) aviso ao comerciante
```

O comerciante nunca vê essa cascata. Ele vê: “Pedido confirmado” ligado, texto do template, status Online.

---

## 4. Posição no sistema

```text
┌──────────────────────────────────────────────────────────┐
│  UX Conexões (backoffice)                                │  ← único lugar “humano”
├──────────────────────────────────────────────────────────┤
│  API admin: connections, templates, diagnostics, stats   │
├──────────────────────────────────────────────────────────┤
│  Communication Engine                                    │
│    orchestrator · resolver · renderer · health · notify  │
├──────────────────────────────────────────────────────────┤
│  Ports (interfaces)                                      │
│    WhatsAppProvider · (futuro EmailProvider, Sms…)       │
├──────────────────────────────────────────────────────────┤
│  Adapters                                                │
│    Evolution · (futuro Meta · Z-API · …)                 │
└──────────────────────────────────────────────────────────┘
         ▲
         │ apenas eventos / facade pública do motor
┌────────┴─────────┐
│ orders · payments │  ← sem import de adapters
│ promotions · …    │
└──────────────────┘
```

---

## 5. Domínio: conceitos internos

| Conceito | Significado | UI (`25`) |
|----------|-------------|-----------|
| **Channel** | Família de meio (`whatsapp`, `email`, `sms`…) | WhatsApp, Email… |
| **Connection** | Instância conectada de um canal para um tenant (número + credenciais + papel) | “WhatsApp conectado” / futuro: Delivery, Financeiro… |
| **Provider** | Vendor que implementa o canal (`evolution`, `meta_cloud`, …) | “Evolution” em “Como deseja conectar?” |
| **ProviderAccount / credentials** | URL, chave, metadados cifrados | Endereço + chave de acesso |
| **Situation / event_key** | Situação de negócio que pode disparar mensagem | Checkbox “Pedido confirmado” |
| **MessageTemplate** | Texto + variáveis por situação/canal | Templates de Mensagens |
| **MessageDispatch** | Tentativa de envio (ou registro consolidado) | Central de Mensagens / estatísticas |
| **HealthSnapshot** | Último resultado do monitor | Painel de diagnóstico |
| **MerchantAlert** | Aviso para o comerciante | Notificações |

Fase 1: **um** `Connection` WhatsApp por tenant. O schema já prevê N conexões (§15, §19).

---

## 6. Eventos de domínio

### 6.1 Contrato mínimo

Evento interno (nome ilustrativo — implementação pode ser dataclass, signal Django fino, ou outbox):

| Campo | Papel |
|-------|-------|
| `tenant_id` | Isolamento |
| `event_key` | Situação (`order.confirmed`, …) |
| `occurred_at` | Timestamp |
| `aggregate_type` / `aggregate_id` | Ex.: order + UUID |
| `payload` | Dados tipados para variáveis (cliente, nº pedido, valor, …) |
| `idempotency_key` | Evitar envio duplicado (ex.: `order:{id}:confirmed`) |

### 6.2 Catálogo Fase 1 (WhatsApp)

Alinhado ao assistente pós-conexão (`25` §11):

| `event_key` | Situação (UI) | Default ativo |
|-------------|---------------|---------------|
| `order.received` | Pedido recebido | sim |
| `order.confirmed` | Pedido confirmado | sim |
| `order.preparing` | Pedido em preparo | sim |
| `order.out_for_delivery` | Pedido saiu para entrega | sim |
| `order.delivered` | Pedido entregue | sim |
| `payment.approved` | Pagamento aprovado | sim |
| `payment.rejected` | Pagamento recusado | sim |

Cancelamento e outros entram no catálogo quando o produto pedir; o motor já trata `event_key` genérico.

### 6.3 Quem emite

| Módulo | Emite quando… |
|--------|----------------|
| `orders` | Transições de status relevantes |
| `payments` (quando existir online) | Aprovado / recusado |
| Futuro: marketing, customers | Inativos, aniversário, campanha |

Emissão = chamar facade do motor **ou** signal/outbox que o motor consome.  
**Proibido:** chamar adapter de dentro do service de pedido.

---

## 7. Pipeline do Motor

Orquestrador (nome interno sugerido: `CommunicationEngine` / `dispatch_communication`):

```text
1. Receber evento
2. Se situação desligada para o tenant → no-op (log debug)
3. Se canal WhatsApp sem conexão ativa → no-op + (opcional) alert suave
4. Carregar template da situação + canal
5. Se template inexistente → usar default de sistema (seed) ou alert
6. Renderizar corpo com payload
7. Escolher conexão (Fase 1: unique; futuro: policy por papel/evento)
8. Obter adapter do provider da conexão
9. Criar MessageDispatch (status=pending)
10. Enfileirar task Celery send_message(dispatch_id)
11. Retornar ack ao emissor (não espera provedor)
```

Envio síncrono **só** em fluxos explícitos de UX: mensagem de teste, sandbox de template (com timeout curto).

---

## 8. Resolução de canal, conexão e provedor

### 8.1 Canal

Fase 1: eventos de pedido/pagamento → canal `whatsapp` (fixurado no mapping situação→canal; multi-canal por situação é futuro).

### 8.2 Conexão

```text
ConnectionResolver.resolve(tenant_id, channel, event_key) → Connection | None
```

Fase 1: retorna a única conexão `whatsapp` com status `connected` (ou `None`).

Futuro:

- filtro por `role` (`delivery`, `finance`, `support`, `store`);
- policy: `order.*` → role delivery; `payment.*` → finance; etc.

### 8.3 Provedor

Cada `Connection` aponta para `provider_key` + credenciais.

```text
ProviderRegistry.get(provider_key) → WhatsAppProvider (port)
```

Adapters implementam a port. Detalhe: `27-conexoes-providers.md`.

---

## 9. Resolução de template e variáveis

```text
TemplateResolver.get(tenant_id, channel, event_key) → MessageTemplate
Renderer.render(template, payload) → { body, preview_context }
```

- Variáveis internas: chaves estáveis (`customer_name`, `order_number`, `total`, `eta`…).  
- UI mostra chips humanos (`cliente`, `pedido`, `valor`, `tempo`) — mapeamento em `28`.  
- Template inativo ou situação desligada → não envia.  
- Seed inicial: templates padrão no provisionamento da conexão / assistente.

---

## 10. Envio, retries e idempotência

### 10.1 Task

Celery task (ex.: `communications.send_dispatch`):

1. Lock / claim do `MessageDispatch`  
2. Chama `adapter.send(...)`  
3. Atualiza status: `sent` | `delivered` (se webhook/ACK) | `failed`  
4. Em falha transitória: retry com backoff  
5. Em falha permanente / esgotou retries: `failed` + `MerchantAlert`

### 10.2 Idempotência

- Único por `(tenant_id, idempotency_key)` quando a chave existir.  
- Reprocessar o mesmo evento de “pedido confirmado” não gera segunda mensagem ao cliente.

### 10.3 Fail soft

Confirmar pedido **nunca** falha porque WhatsApp caiu.  
O motor captura, registra, alerta.

---

## 11. Registro de mensagens e estatísticas

Cada tentativa relevante vira registro consultável pela Central de Mensagens / stats (`25` §17–§19):

| Campo lógico | Uso |
|--------------|-----|
| status | `pending`, `sent`, `delivered`, `failed` (e `queued` se útil) |
| channel / connection_id | Filtros futuros |
| event_key / template_id | Auditoria |
| recipient | Telefone mascarado na UI se necessário |
| provider_message_id | Correlação com vendor |
| error_code / error_message | Interno; UI traduz |
| created_at / sent_at / latency_ms | Tempo médio de envio |

Agregações “hoje”: enviadas, entregues, falhas, último envio — query por `tenant_id` + dia (timezone do tenant).

---

## 12. Diagnóstico e health check

### 12.1 Cascata de verificação

```text
1. Servidor alcançável (URL da conexão)
2. Credenciais aceitas (chave válida)
3. Instância/sessão do provedor OK
4. WhatsApp vinculado (estado “conectado”)
5. Comunicação ok (opcional: ping leve ou último send recente)
```

Resultado → `HealthSnapshot` por `connection_id`:

| Step interno | Copy UI (exemplo) |
|--------------|-------------------|
| `server` | Servidor conectado / Não encontramos o servidor |
| `credentials` | Acesso validado / Chave de acesso inválida |
| `provider` | Evolution respondendo / Não acessamos sua Evolution |
| `session` | WhatsApp conectado / WhatsApp desconectado |
| `messaging` | Comunicação funcionando / Não conseguimos enviar |

### 12.2 Gatilhos

| Gatilho | Quando |
|---------|--------|
| Manual | Botão “Verificar novamente” |
| Pós-conexão / pós-QR | Logo após sucesso |
| Periódico | Celery Beat (intervalo configurável; ex. 1–5 min) |
| Pós-falha de envio | Atualiza snapshot e pode abrir alert |

Health check **não** aparece como jargão na UI (`25` §7.1).

---

## 13. Notificações ao comerciante

`MerchantAlert` (ou reutilizar mecanismo global de notificações do backoffice, se já existir):

| Severidade | Exemplos |
|------------|----------|
| critical | WhatsApp desconectado; chave inválida |
| warning | Evolution lenta/indisponível; QR expirou |
| info | Reconectado com sucesso |

Regras:

- Deduplicar alertas iguais enquanto o problema persistir (não spam).  
- Cada alert sugere **próximo passo** (reconectar, atualizar chave, verificar de novo).  
- Separado do histórico de mensagens aos **clientes**.

---

## 14. Mensagem de teste e sandbox

| Fluxo | Comportamento do motor |
|-------|------------------------|
| **Teste de conexão** | Template fixo de sistema → número da própria conexão (ou informado) → sync ou async curto → resultado na UX |
| **Sandbox de template** | Render do rascunho (ainda não salvo) → envio teste → **não** altera template persistido até “Salvar” |
| **Envio real** | Só templates salvos + situação ativa + conexão healthy (ou best-effort com alert) |

Ambos passam pelo **mesmo** adapter — sem atalho que burle o motor.

---

## 15. Modelo de dados (lógico)

Nomes ilustrativos; consolidar em `03` na fase de implementação. Multi-tenant em todas as tabelas.

### 15.1 `communication_connections`

| Coluna | Notas |
|--------|-------|
| id, tenant_id | PK + isolamento |
| channel | `whatsapp` \| … |
| provider_key | `evolution` \| … |
| role | `default` na Fase 1; depois `delivery`, `finance`… |
| display_name | Opcional |
| phone_e164 / phone_display | Preenchido após conectar |
| status | `pending`, `awaiting_qr`, `connected`, `disconnected`, `error` |
| credentials | JSONB cifrado / secret ref — nunca logar raw |
| provider_metadata | instance id, etc. (interno) |
| last_health_at / last_health_status | Denormalizado para painel |
| created_at / updated_at | |

Unique sugerido Fase 1: `(tenant_id, channel, role)` com `role='default'`.  
Não unique rígido em “um whatsapp por tenant” sem `role` — facilita multi-número.

### 15.2 `communication_situation_settings`

| Coluna | Notas |
|--------|-------|
| tenant_id, event_key | |
| channel | |
| connection_id | Nullable na Fase 1 (usa default) |
| is_enabled | Default `true` no assistente |
| updated_at | |

### 15.3 `message_templates`

| Coluna | Notas |
|--------|-------|
| tenant_id, channel, event_key | |
| body | Texto com placeholders |
| is_active | |
| version / updated_at | |

Detalhe e variáveis: `28`.

### 15.4 `message_dispatches` (ou evolução de `notification_logs`)

Ver §18. Campos: status, recipient, event_key, template_id, connection_id, provider_message_id, error_*, timestamps, latency_ms, idempotency_key, payload snapshot.

### 15.5 `connection_health_checks`

Histórico opcional (ou só último snapshot na connection). Steps + ok/fail + message interna + checked_at.

### 15.6 `merchant_alerts`

tenant_id, connection_id nullable, kind, severity, title, body, action_hint, is_read, created_at, resolved_at.

---

## 16. Apps e organização de código

Sugestão alinhada a `02` / `10` (ajustável na implementação):

```text
apps/communications/          # ou connections/ — decidir no checklist
├── domain/
│   ├── events.py             # event_keys, payloads
│   ├── ports.py              # WhatsAppProvider ABC
│   └── errors.py
├── services/
│   ├── engine.py             # orquestração
│   ├── resolvers.py
│   ├── renderer.py
│   ├── health.py
│   └── alerts.py
├── infrastructure/
│   └── providers/
│       └── evolution/        # único adapter Fase 1
├── models/
├── tasks.py                  # Celery send + beat health
├── selectors.py
├── admin_api/                # ViewSets backoffice
└── tests/
```

Domínio de pedidos:

```python
# permitido
communication_engine.handle(OrderConfirmed(...))

# proibido
from apps.communications.infrastructure.providers.evolution import client
```

---

## 17. Contrato com o restante do sistema

### 17.1 API pública do motor (interna ao monólito)

```text
handle(event: CommunicationEvent) -> DispatchAck
send_test(connection_id, body | template_draft) -> TestResult
get_diagnostics(connection_id) -> HealthSnapshot
run_health_check(connection_id) -> HealthSnapshot
```

### 17.2 O que o domínio **não** passa

- Nome do provider  
- URL / API key  
- Detalhes de QR / instância  

Só: tenant, event_key, payload de negócio, idempotency_key.

### 17.3 Webhooks de entrada (provedor → nós)

Callbacks do vendor (status de entrega, desconexão) entram por endpoint interno tipo `POST /api/v1/webhooks/communications/{provider}/` (nunca exposto na UX).  
Validação por provider; atualiza session health + dispatch status. Detalhe em `27`.

---

## 18. Relação com `notification_logs`

Hoje `03` prevê `notification_logs` (email/sms/push/whatsapp) como log genérico.

**Decisão de produto/arquitetura (Fase 1):**

| Opção | Quando |
|-------|--------|
| **A — Evoluir** `notification_logs` | Se couber connection_id, event_key, latency, delivered sem gambiarra |
| **B — Nova tabela** `message_dispatches` + bridge | Se o modelo atual for estreito demais |

Recomendação: **B** (ou A com migration clara), mantendo `notification_logs` para e-mail legado se já em uso.  
O Motor é a fonte de verdade de **comunicações de Conexões**; não criar segundo caminho paralelo de envio WhatsApp.

---

## 19. Preparação: múltiplos números e Comunicação Inteligente

### 19.1 Multi-conexão

- `role` + N rows em `communication_connections`  
- `ConnectionResolver` com policy  
- UI lista conexões (`25` §20) — **não** implementar na Fase 1, só não bloquear

### 19.2 Comunicação Inteligente (futuro)

Mesmo `handle()`, com eventos enriquecidos ou **jobs agendados**:

| Capacidade | Mecanismo interno futuro |
|------------|---------------------------|
| “30 min após entregue → avaliação” | Celery ETA / tabela `scheduled_communications` |
| “30 dias sem comprar → cupom” | Beat + segmentação customers + event `customer.inactive` |
| Aniversário | Beat diário → `customer.birthday` |
| Campanha começou | Marketing emite `campaign.started` |

O motor **não** precisa conhecer cupom ou campanha: recebe event_key + payload.  
Marketing Engine (`21`) continua dono da regra comercial; o motor só entrega a mensagem.

---

## 20. Fora deste documento

| Tema | Documento |
|------|-----------|
| Filosofia / UX | `25` |
| Contrato detalhado dos adapters (Evolution methods, QR) | `27` |
| Schema de variáveis e editor | `28` |
| Wireflow de conexão WhatsApp | `29` |
| Fases / canais futuros | `30` |
| Endpoints REST finais | Atualizar `07` na implementação |
| DDL oficial | Atualizar `03` na implementação |

---

## 21. Checklist de conformidade

Antes de merge de qualquer código do motor:

- [ ] Nenhum app de domínio importa adapter de provider  
- [ ] Envio de pedido/pagamento passa por `handle(event)`  
- [ ] Situações desligáveis; default todas on (`25` §11)  
- [ ] Idempotência nos eventos de status de pedido  
- [ ] Fail soft: falha de envio ≠ rollback de pedido  
- [ ] Health check periódico + manual previstos  
- [ ] Alertas ao comerciante em falhas de conexão  
- [ ] Teste de conexão e sandbox usam o mesmo adapter  
- [ ] Schema de connection admite `role` / N conexões  
- [ ] Credenciais nunca em log nem em response de listagem  
- [ ] Copy de erro mapeada para linguagem humana (`25` §7)  
- [ ] Princípio de Valor (`25` §4) — componente justifica-se

---

## 22. Histórico de Revisões

| Versão | Data | Descrição |
|--------|------|-----------|
| 1.0 | Jul/2026 | **Aprovado** — pipeline event-first; resolução canal/conexão/provedor; templates; dispatches; health; alerts; multi-número e Comunicação Inteligente previstos |

---

> **Documento aprovado.** Próximo: `27-conexoes-providers.md` — Arquitetura de Providers.
