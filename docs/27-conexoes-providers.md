# 27 — Arquitetura de Providers (Conexões)

> **Documento:** Canal × conexão × provedor × adapters — contrato interno e primeiro adapter (Evolution)  
> **Produto:** Food Service *(nome comercial provisório)*  
> **Versão:** 1.0  
> **Status:** Aprovado  
> **Última atualização:** Julho/2026  
> **Depende de:** `00-product-philosophy.md`, `25-conexoes-philosophy.md`, `26-communication-engine.md` *(aprovados)*  
> **Relacionados:** `02-arquitetura.md` (§16 Ports & Adapters), `03-modelagem-do-banco.md`, `07-api.md`, `10-padroes-de-codigo.md`, `28-message-templates.md`  
> **Série Conexões:** `28-message-templates.md` · `29-whatsapp-conexao-fluxo.md` · `30-conexoes-roadmap.md`  
> **Natureza:** Arquitetura — nomes técnicos **internos**. UI segue vocabulário de `25` §7.

---

## Sumário

1. [Por que este documento existe](#1-por-que-este-documento-existe)
2. [Camadas: canal, conexão, provedor](#2-camadas-canal-conexão-provedor)
3. [Catálogo de provedores (visão)](#3-catálogo-de-provedores-visão)
4. [Port: contrato WhatsAppProvider](#4-port-contrato-whatsappprovider)
5. [Registry e seleção do adapter](#5-registry-e-seleção-do-adapter)
6. [Ciclo de vida da conexão](#6-ciclo-de-vida-da-conexão)
7. [Credenciais e segredos](#7-credenciais-e-segredos)
8. [Webhooks de entrada](#8-webhooks-de-entrada)
9. [Mapeamento de erros → copy humana](#9-mapeamento-de-erros--copy-humana)
10. [Health check por provedor](#10-health-check-por-provedor)
11. [Adapter Fase 1: Evolution](#11-adapter-fase-1-evolution)
12. [Provedores futuros (esqueleto)](#12-provedores-futuros-esqueleto)
13. [Organização de código](#13-organização-de-código)
14. [Testes](#14-testes)
15. [Anti-padrões](#15-anti-padrões)
16. [Fora deste documento](#16-fora-deste-documento)
17. [Checklist de conformidade](#17-checklist-de-conformidade)
18. [Histórico de Revisões](#18-histórico-de-revisões)

---

## 1. Por que este documento existe

`26` define o Motor. Este documento define **como plugar vendors** sem o Motor (nem o domínio) conhecer detalhes de cada um.

Regra de ouro técnica:

> Trocar Evolution por Meta Cloud (ou Z-API) = **novo adapter** + registro no catálogo.  
> Zero mudança em `OrderService`, templates de negócio ou pipeline do Motor.

A Evolution é o **primeiro** adapter WhatsApp — não um módulo de produto.

---

## 2. Camadas: canal, conexão, provedor

```text
Canal (whatsapp)
  └── Conexão (tenant + número + role + status)
        └── Provedor (evolution | meta_cloud | zapi | …)
              └── Adapter (código que fala HTTP/SDK com o vendor)
```

| Camada | Responsável por | Exemplo Fase 1 |
|--------|-----------------|----------------|
| **Canal** | Tipo de meio | `whatsapp` |
| **Conexão** | Instância do tenant (creds, telefone, role) | 1 row `role=default` |
| **Provedor** | Qual stack externa | `evolution` |
| **Adapter** | Implementação da port | `EvolutionWhatsAppAdapter` |

O comerciante escolhe o **canal** e, se houver mais de uma forma, **como conectar** (nome amigável do provedor).  
Ele não escolhe “adapter” nem “port”.

---

## 3. Catálogo de provedores (visão)

Metadados internos (código ou tabela de config — não CRUD na UI na Fase 1):

| `provider_key` | Canal | Label UI | Fase |
|----------------|-------|----------|------|
| `evolution` | whatsapp | Evolution | **1 — implementar** |
| `meta_cloud` | whatsapp | Meta (WhatsApp Business) | futuro |
| `zapi` | whatsapp | Z-API | futuro |
| `uazapi` | whatsapp | Uazapi | futuro |
| `twilio` | whatsapp | Twilio | futuro |

Campos úteis no catálogo:

- `supports_qr` — onboarding por QR (Evolution sim; Meta Cloud em geral não)
- `credential_schema` — quais campos pedir na conversa de conexão
- `webhook_events` — o que o adapter espera receber
- `is_available` — controla “Em breve” vs ativo na UI

Email/SMS/Pagamentos terão **ports próprias** (`EmailProvider`, `PaymentGateway` já previsto em `02`) — mesmo padrão, outro contrato.

---

## 4. Port: contrato WhatsAppProvider

Interface interna (ABC / Protocol). Nomes ilustrativos:

```text
WhatsAppProvider
├── validate_credentials(creds) -> ValidationResult
├── provision(connection_ctx) -> ProvisionResult
│     # cria/garante instância no vendor; configura webhook
├── get_qr(connection_ctx) -> QrPayload | None
│     # base64 / string; None se já conectado ou N/A
├── get_session_status(connection_ctx) -> SessionStatus
│     # connected | disconnected | pending_qr | error
├── send_text(connection_ctx, to_e164, body) -> SendResult
├── disconnect(connection_ctx) -> None   # opcional
├── delete_remote(connection_ctx) -> None  # opcional / cleanup
└── parse_webhook(headers, raw_body) -> list[ProviderEvent]
```

### 4.1 Tipos de resultado (lógicos)

| Tipo | Campos essenciais |
|------|-------------------|
| `ValidationResult` | ok, error_code |
| `ProvisionResult` | provider_metadata (instance name/id, tokens de instância se houver) |
| `QrPayload` | image_base64 ou code, expires_at opcional |
| `SessionStatus` | state, phone_e164 opcional, raw_state interno |
| `SendResult` | provider_message_id, accepted_at |
| `ProviderEvent` | kind (`connection_update`, `qr_updated`, `message_ack`, …), payload normalizado |

O Motor só consome esses tipos. **Nunca** JSON cru do Evolution.

### 4.2 O que a port **não** inclui

- Regras de “pedido confirmado”  
- Templates de negócio  
- Decisão de qual role/número usar  
- Tradução de copy para o comerciante (fica num mapper compartilhado alimentado por `error_code`)

---

## 5. Registry e seleção do adapter

```text
ProviderRegistry
  .register("evolution", EvolutionWhatsAppAdapter)
  .get("evolution") -> WhatsAppProvider
```

Seleção:

```text
connection.provider_key → registry.get(...) → adapter
```

Fase 1: um registro. Testes usam `FakeWhatsAppAdapter`.

Injeção: factory por request/task com `base_url` + credenciais da **conexão**, não globals de settings do Django para dados do tenant (settings só para URL pública de webhook nossa, secrets de cifração, etc.).

---

## 6. Ciclo de vida da conexão

Estados internos da `communication_connections.status` (`26` §15):

```text
pending
  → (credenciais ok + provision)
awaiting_qr          # se supports_qr
  → (webhook CONNECTION / scan)
connected
  → (logout / falha sessão)
disconnected
  → (usuário reconecta → QR de novo)
error                # credencial inválida, etc.
```

### 6.1 Quem muda o estado

| Origem | Transições típicas |
|--------|--------------------|
| Fluxo UX / admin API | pending → awaiting_qr; pedido de reconnect |
| Adapter.provision / get_qr | preenche metadata, QR |
| Webhook `connection_update` | awaiting_qr → connected; connected → disconnected |
| Health check | confirma ou degrada status |
| Admin “desconectar” | chama adapter + status disconnected |

### 6.2 Número do telefone

Preenchido quando a sessão conectar (`phone_e164` / display).  
Até lá, UI não inventa número.

---

## 7. Credenciais e segredos

### 7.1 Schema por provedor (Evolution Fase 1)

O que o comerciante informa (`25` §10.3):

| Campo UI | Campo interno | Notas |
|----------|---------------|-------|
| Endereço da Evolution | `base_url` | HTTPS preferível; normalizar trailing slash |
| Chave de acesso | `api_key` | Header `apikey` típico da Evolution |

Gerado/guardado pelo sistema (nunca pedido na UI):

| Campo | Notas |
|-------|-------|
| `instance_name` | Determinístico por tenant/connection (ex. `fs_{tenant_short}_{role}`) |
| `instance_token` / hash | Se o vendor devolver token de instância |
| `webhook_secret` | Para validar callbacks nossos |

### 7.2 Regras

- Cifrar em repouso (Fernet / KMS / campo encrypted) — detalhe na implementação.  
- Nunca logar `api_key` completa (máscara `****`).  
- APIs admin de leitura: **não** devolver chave; só `has_credentials: true` + base_url mascarada se necessário.  
- Rotação: fluxo “atualizar chave” na Configuração, linguagem humana.

---

## 8. Webhooks de entrada

### 8.1 Endpoint nosso

```text
POST /api/v1/webhooks/communications/{provider_key}/
```

- Sem JWT de usuário; autenticação por assinatura / secret / header do vendor.  
- Resolver `connection` via metadata (instance name, token, path auxiliar se preciso).  
- Responder 200 rápido; processar pesado em Celery se necessário.

**Nunca** mostrar essa URL na UI do comerciante. O adapter configura o webhook **no provision**.

### 8.2 Eventos normalizados (ProviderEvent.kind)

| Kind | Uso no Motor |
|------|----------------|
| `qr_updated` | Atualizar QR na sessão de onboarding (SSE/poll) |
| `connection_update` | connected / disconnected + telefone |
| `message_ack` | pending → sent → delivered (quando disponível) |
| `message_inbound` | Fase 1: ignorar ou só log; chatbot = futuro |
| `provider_error` | health + MerchantAlert |

Cada adapter implementa `parse_webhook` → lista de `ProviderEvent`.  
O Motor/handlers não leem payload Evolution cru.

---

## 9. Mapeamento de erros → copy humana

Camada compartilhada (não dentro de cada botão de UI):

| `error_code` interno | Copy (`25`) |
|----------------------|-------------|
| `credentials_invalid` | Não conseguimos acessar com essa chave… |
| `server_unreachable` | Não encontramos o servidor nesse endereço. |
| `provider_timeout` | Sua Evolution demorou para responder… |
| `session_disconnected` | Seu WhatsApp foi desconectado. |
| `qr_expired` | Este QR Code expirou. Vamos gerar outro? |
| `send_failed` | Não conseguimos enviar a mensagem. |
| `rate_limited` | Muitas tentativas. Aguarde um momento. |
| `unknown` | Algo deu errado. Tente de novo. |

Adapters traduzem HTTP/body do vendor → `error_code`.  
UI e MerchantAlert só conhecem o código / mensagem humana.

---

## 10. Health check por provedor

O Motor orquestra a cascata (`26` §12). O adapter expõe operações usadas nos steps:

| Step | Chamada típica ao adapter |
|------|---------------------------|
| `server` | TCP/HTTPS reachability em `base_url` (pode ser util compartilhado) |
| `credentials` | `validate_credentials` |
| `provider` | ping leve (ex. fetch instance status) |
| `session` | `get_session_status` → connected? |
| `messaging` | opcional: último send ok ou probe |

Resultados alimentam `HealthSnapshot` e copy do painel de diagnóstico.

---

## 11. Adapter Fase 1: Evolution

### 11.1 Escopo

- Autenticação por `apikey` (global do servidor Evolution do cliente).  
- Criar/garantir **instance** por conexão.  
- QR Code (Baileys / WhatsApp Web).  
- Envio de texto.  
- Webhook: conexão, QR, ACKs de mensagem quando disponíveis.  
- Configurar webhook **automaticamente** no provision (URL nossa + eventos necessários).

Versões da Evolution variam (`/instance/create`, formato de webhook). O adapter isola isso; pinamos uma versão documentada no README do adapter na implementação e tratamos diferenças com testes de contrato.

### 11.2 Operações ↔ endpoints (referência)

Referência típica Evolution (ajustar à versão pinada):

| Operação da port | Endpoint típico |
|------------------|-----------------|
| validate / fetch status | `GET /instance/connectionState/{instance}` ou fetchInstances |
| provision | `POST /instance/create` (+ webhook config) |
| get_qr | create com `qrcode: true` ou `GET /instance/connect/{instance}` |
| send_text | `POST /message/sendText/{instance}` |
| disconnect | logout / delete instance conforme produto |

Payloads e headers ficam **só** no pacote `infrastructure/providers/evolution/`.

### 11.3 Naming de instância

Estável e único por conexão, para reconectar sem órfãos:

```text
fs_{tenant_slug_or_shortid}_{connection_shortid}
```

Evitar nomes digitados pelo comerciante.

### 11.4 Webhook Evolution → ProviderEvent

| Evento Evolution (ex.) | ProviderEvent |
|------------------------|---------------|
| `QRCODE_UPDATED` | `qr_updated` |
| `CONNECTION_UPDATE` | `connection_update` |
| `MESSAGES_UPDATE` / ACK | `message_ack` |
| `SEND_MESSAGE` | opcional / correlacionar envio |

### 11.5 O que **não** fazer no adapter Evolution

- Não conhecer `order.confirmed`  
- Não renderizar template de negócio  
- Não escrever copy de UI  
- Não ser importado por `orders`

---

## 12. Provedores futuros (esqueleto)

Todos implementam a **mesma** `WhatsAppProvider`. Diferenças só no adapter + `credential_schema` + flags do catálogo.

| Provedor | Onboarding típico | Credenciais típicas (internas) |
|----------|-------------------|--------------------------------|
| Meta Cloud | Token + Phone Number ID (sem QR) | access_token, phone_number_id, waba_id |
| Z-API | Token / instance id (fluxo próprio) | conforme vendor |
| Uazapi | Similar a APIs BR de instância | conforme vendor |
| Twilio | Account SID + API key + sender | conforme Twilio |

UI “Como deseja conectar?” só lista `is_available=true`.  
Demais: “Em breve”.

Pagamentos / Fiscal / IA: **outra port**, mesmo espírito Ports & Adapters — fora do escopo deste doc de WhatsApp, mas o hub Conexões (`25` §8) já prevê a família.

---

## 13. Organização de código

```text
apps/communications/
├── domain/
│   └── ports.py                 # WhatsAppProvider + DTOs
├── infrastructure/
│   └── providers/
│       ├── registry.py
│       ├── errors.py            # map vendor → error_code
│       ├── evolution/
│       │   ├── adapter.py
│       │   ├── client.py        # HTTP fino
│       │   ├── webhooks.py      # parse
│       │   └── constants.py
│       └── _fake/
│           └── adapter.py       # testes
├── api/
│   └── webhooks.py              # POST .../communications/{provider}/
└── ...
```

Um arquivo/cliente HTTP por vendor. Sem “utils genéricos” que vazem shape Evolution para o Motor.

---

## 14. Testes

| Camada | O que testar |
|--------|--------------|
| Adapter Evolution | parse webhook → ProviderEvent; map HTTP errors → error_code (VCR/mocks) |
| Registry | resolve provider_key |
| Motor + FakeWhatsAppAdapter | pipeline completo sem rede |
| Contrato | Fake e Evolution respeitam a mesma port |
| Isolamento | `orders` tests não importam `evolution` |

Teste de fumaça manual: conectar QR em staging com Evolution real (fora do CI obrigatório).

---

## 15. Anti-padrões

| Anti-padrão | Por quê |
|-------------|---------|
| `OrderService` → `EvolutionClient` | Viola `26` |
| If `provider == "evolution"` no Motor | Registry + polimorfismo |
| Expor URL de webhook / instance name na UI | Jargão + superfície de ataque |
| Credencial em texto plano em log | Segurança |
| Um adapter “Deus” com Meta+Evolution | Separar pacotes |
| Pedir 12 campos na conexão Evolution | Viola filosofia (`25`) — só URL + chave |
| Tratar Meta como segundo módulo de produto | Continua sendo Conexões → WhatsApp |

---

## 16. Fora deste documento

| Tema | Doc |
|------|-----|
| Pipeline do Motor, events, health orquestrado | `26` |
| Templates e variáveis | `28` |
| Wireflow UX conexão + QR + assistente | `29` |
| Roadmap de canais/provedores | `30` |
| OpenAPI / paths admin | Atualizar `07` na implementação |
| DDL final | Atualizar `03` na implementação |

---

## 17. Checklist de conformidade

- [ ] Existe port `WhatsAppProvider` única  
- [ ] Evolution é **um** adapter registrado; Motor não importa `client.py` Evolution  
- [ ] Credenciais: URL + chave na UX; resto automático  
- [ ] Webhook configurado no provision; URL não aparece na UI  
- [ ] `parse_webhook` normaliza eventos  
- [ ] Erros viram `error_code` + copy humana  
- [ ] Health check usa métodos da port  
- [ ] Catálogo prevê Meta/Z-API/… com `is_available=false`  
- [ ] Fake adapter nos testes do Motor  
- [ ] Multi-conexão: adapter não assume “só um WhatsApp no mundo” — opera por `connection_ctx`

---

## 18. Histórico de Revisões

| Versão | Data | Descrição |
|--------|------|-----------|
| 1.0 | Jul/2026 | **Aprovado** — camadas canal/conexão/provedor; port WhatsApp; registry; credenciais; webhooks; Evolution como 1º adapter; esqueleto futuros |

---

> **Documento aprovado.** Próximo: `28-message-templates.md` — Templates de Mensagens.
