# 30 — Roadmap futuro das Conexões

> **Documento:** Fases, canais, provedores e Comunicação Inteligente — o que vem depois do WhatsApp + Evolution  
> **Produto:** Food Service *(nome comercial provisório)*  
> **Versão:** 1.0  
> **Status:** Aprovado  
> **Última atualização:** Julho/2026  
> **Depende de:** `00-product-philosophy.md`, `25-conexoes-philosophy.md`, `26-communication-engine.md`, `27-conexoes-providers.md`, `28-message-templates.md`, `29-whatsapp-conexao-fluxo.md` *(aprovados)*  
> **Relacionados:** `09-roadmap.md`, `15-futuras-funcionalidades.md`, `19-future-ideas.md`, `21-marketing-engine.md`  
> **Natureza:** Roadmap de produto — **sem escopo fechado de sprint** (exceto Fase 1, que terá checklist próprio). Não é compromisso de data.

---

## Sumário

1. [Por que este documento existe](#1-por-que-este-documento-existe)
2. [Relação com outros roadmaps](#2-relação-com-outros-roadmaps)
3. [Visão: Plataforma Inteligente de Comunicação](#3-visão-plataforma-inteligente-de-comunicação)
4. [Filtros obrigatórios](#4-filtros-obrigatórios)
5. [Fase 1 — WhatsApp + Evolution (implementar após série)](#5-fase-1--whatsapp--evolution-implementar-após-série)
6. [Fase 2 — Madureza do canal WhatsApp](#6-fase-2--madureza-do-canal-whatsapp)
7. [Fase 3 — Outros provedores WhatsApp](#7-fase-3--outros-provedores-whatsapp)
8. [Fase 4 — Comunicação Inteligente](#8-fase-4--comunicação-inteligente)
9. [Fase 5 — Omnicanal (Email, SMS, Push)](#9-fase-5--omnicanal-email-sms-push)
10. [Fase 6 — Hub além de Comunicação](#10-fase-6--hub-além-de-comunicação)
11. [Mapa do hub (alvo)](#11-mapa-do-hub-alvo)
12. [Alinhamento com `15` (COM / INT / FIS)](#12-alinhamento-com-15-com--int--fis)
13. [Dependências entre iniciativas](#13-dependências-entre-iniciativas)
14. [O que explicitamente não fazer cedo](#14-o-que-explicitamente-não-fazer-cedo)
15. [Critérios para promover uma fase](#15-critérios-para-promover-uma-fase)
16. [Próximo passo após aprovação desta série](#16-próximo-passo-após-aprovação-desta-série)
17. [Histórico de Revisões](#17-histórico-de-revisões)

---

## 1. Por que este documento existe

A série `25`–`29` descreve **como** construir Conexões.  
Este documento descreve **em que ordem** evoluir — sem virar “módulo Evolution” nem redesenhar o hub a cada vendor.

> Hoje: mensagens automáticas via WhatsApp (Evolution).  
> Amanhã: múltiplos provedores, canais, automações e o hub completo — **mesma filosofia**.

Não substitui `09-roadmap.md` (sprints do produto) nem `15` (backlog V3/V4).  
**Especializa** o eixo Conexões / Comunicação.

---

## 2. Relação com outros roadmaps

| Documento | Papel |
|-----------|--------|
| `09-roadmap.md` | Quando encaixa no calendário geral de sprints |
| `15-futuras-funcionalidades.md` | Backlog V3/V4 (COM-*, INT-*, FIS-*, IA-*) |
| `19-future-ideas.md` | Captura rápida de ideias |
| `21-marketing-engine.md` | Objetivos comerciais que **disparam** o Motor |
| `25`–`29` | Filosofia e arquitetura já aprovadas |
| **30 (este)** | Sequência recomendada **dentro** de Conexões |

Ideia nova de integração:

1. Passa na Regra de Ouro + Princípio de Valor (`25` §4–§5)  
2. Entra aqui (fase) ou em `19` se ainda for nebulosa  
3. Só vira checklist/sprint quando promovida (§15)

---

## 3. Visão: Plataforma Inteligente de Comunicação

```text
                    ┌─────────────────────────────┐
                    │     Hub Conexões (UX)        │
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │   Motor de Comunicação      │
                    │   eventos · templates ·     │
                    │   schedule · health         │
                    └──────────────┬──────────────┘
           ┌───────────┬───────────┼───────────┬───────────┐
           ▼           ▼           ▼           ▼           ▼
       WhatsApp      Email        SMS        Push     (outros)
           │
     Evolution · Meta · Z-API · …
```

O comerciante só vê **Conexões** e benefícios.  
O sistema cresce por **adapters** e **novas situações** — não por novos “módulos de API”.

---

## 4. Filtros obrigatórios

Antes de qualquer item deste roadmap virar implementação:

| Filtro | Pergunta |
|--------|----------|
| Regra de Ouro | Dono de pizzaria conclui sem jargão? |
| Princípio de Valor | Reduz trabalho, vende mais, melhora cliente, reduz erro ou automatiza? (`25` §4) |
| Motor único | Passa pelo Communication Engine? (`26`) |
| Port existente ou nova | Adapter novo, não ifs no domínio? (`27`) |
| UX guiada | Fluxo conversacional / assistente quando for 1ª conexão? (`29`) |

Se falhar qualquer um → redesign ou adiamento.

---

## 5. Fase 1 — WhatsApp + Evolution (implementar após série)

**Objetivo:** primeiro valor real — status de pedido no WhatsApp do cliente.

| Inclui | Não inclui |
|--------|------------|
| Hub Conexões (WhatsApp ativo; demais Em breve) | Meta Cloud, Z-API… |
| Fluxo `29` ①→⑨ | Chatbot / inbox bidirecional |
| Motor + adapter Evolution | Multi-número |
| Templates + sandbox + assistente | Automações com atraso |
| Diagnóstico + health + alerts | Email / SMS |
| Stats e Central resumidas | Hub Pagamentos / Fiscal / iFood |

**Critério de sucesso:** comerciante conecta, recebe teste, cliente recebe “pedido confirmado” sem o dono configurar webhook.

**Checklist de implementação (criar após aprovação deste doc):**  
`31-checklist-conexoes-fase1.md`

Alinha e **substitui na prática** a intenção de `15` COM-01 / COM-04 para o caminho Conexões (naming e UX atualizados).

---

## 6. Fase 2 — Madureza do canal WhatsApp

Depois que a Fase 1 está estável em produção com o 1º cliente.

| ID | Item | Valor |
|----|------|-------|
| C2-01 | Central de Mensagens com lista + reenvio | Recuperar falhas |
| C2-02 | Filtros / busca no histórico | Operação |
| C2-03 | Opt-in / opt-out LGPD no canal (`15` COM-05) | Compliance |
| C2-04 | Mais situações (cancelado, pronto para retirada…) | Cobertura |
| C2-05 | Health + notificações polidos (badge global) | Menos suporte |
| C2-06 | Múltiplos números / roles (`25` §20) | Delivery vs financeiro |
| C2-07 | Relatório simples por período | Percepção de qualidade |

Ainda **um** provedor (Evolution), a menos que demanda force Fase 3 cedo.

---

## 7. Fase 3 — Outros provedores WhatsApp

Mesma UX de canal; novo card em “Como deseja conectar?”.

| Ordem sugerida | Provedor | Motivo |
|----------------|----------|--------|
| 1 | Meta Cloud API | Oficial, escala, compliance |
| 2 | Z-API / Uazapi | Base instalada BR |
| 3 | Twilio | Internacional / já clientes Twilio |

Cada um = adapter + `credential_schema` + flags no catálogo (`27`).  
**Zero** mudança no Motor além de registro.

Templates Meta “aprovados” (HSM): modo adicional no adapter — comerciante continua vendo situações humanas (`28` §8).

---

## 8. Fase 4 — Comunicação Inteligente

O Motor deixa de ser só reativo imediato (`25` §24, `26` §19).

| ID | Jornada | Disparo |
|----|---------|---------|
| CI-01 | Avaliação 30 min após entregue | `scheduled_communications` |
| CI-02 | Cliente inativo 30 dias → cupom | Beat + segmento + Marketing |
| CI-03 | Aniversário → parabéns | Beat diário |
| CI-04 | Campanha / promoção começou → divulgação | Evento marketing (`20`/`21`) |
| CI-05 | Fluxos multi-passo (lembrete se não abrir) | Sequências |

**Dono da regra comercial:** Marketing Engine / domínio de clientes.  
**Dono da entrega:** Communication Engine.

Não criar “módulo de automação” paralelo que fale com Evolution direto.

---

## 9. Fase 5 — Omnicanal (Email, SMS, Push)

| Canal | Uso típico | Ref `15` |
|-------|------------|----------|
| Email | Recibo, marketing, recuperação | COM / MKT |
| SMS | OTP, alertas críticos | COM-02 |
| Push web/app | Status em tempo real | COM-03, APP-02 |

Cada canal:

- card no hub (família Comunicação);  
- port própria (`EmailProvider`, …);  
- templates por `channel` (`28` §15);  
- mesma lista de situações quando fizer sentido.

Preferência de canal por situação (ex.: OTP → SMS; status → WhatsApp) = policy no Motor, não if no pedido.

---

## 10. Fase 6 — Hub além de Comunicação

O hub Conexões cresce por **famílias** (`25` §8). Ordem sugerida (ajustável à demanda):

| Família | Primeiros serviços | Notas |
|---------|-------------------|--------|
| **Pagamentos** | Asaas, Mercado Pago, Stripe | Port `PaymentGateway` (`02`); UX “Conectar recebimentos” |
| **Marketplaces** | iFood, Delivery Much | `15` INT-*; hub de pedidos unificado |
| **Fiscal** | NFC-e, SAT | `15` FIS-*; regulatório |
| **Mapas** | Geocode / distância | Frete e áreas |
| **Inteligência Artificial** | OpenAI, Google, Anthropic | Sugestão de texto, assistente — sem expor API keys como “integração REST” |
| **Automação** | (visão) | Preferir CI Fase 4 dentro do Motor; família só se UX pedir |

Cada família reutiliza o padrão: **boas-vindas → conectar → diagnóstico → valor**.  
Nunca “cole sua secret e o endpoint OpenAPI”.

---

## 11. Mapa do hub (alvo)

Estado visual de longo prazo (itens Em breve até a fase correspondente):

```text
Conexões
├── Comunicação
│   ├── WhatsApp          ← Fases 1–3
│   ├── Email             ← Fase 5
│   ├── SMS               ← Fase 5
│   └── Push              ← Fase 5
├── Pagamentos
│   ├── Asaas
│   ├── Mercado Pago
│   └── Stripe
├── Fiscal
│   ├── NFC-e
│   └── SAT
├── Marketplaces
│   ├── iFood
│   └── Delivery Much
├── Mapas
├── Inteligência Artificial
│   ├── OpenAI
│   ├── Google
│   └── Anthropic
└── Automação             ← ou absorvido pela Comunicação Inteligente
```

---

## 12. Alinhamento com `15` (COM / INT / FIS)

| ID em `15` | Como ler com Conexões |
|------------|------------------------|
| COM-01 WhatsApp Business API | Fase 1 via Evolution; Meta Cloud = Fase 3 (oficial) |
| COM-02 SMS | Fase 5 |
| COM-03 Push | Fase 5 |
| COM-04 Templates por tenant | Fase 1 (`28`) — **antecipado** |
| COM-05 Opt-in LGPD | Fase 2 |
| COM-06 Chat widget | Fora do Motor de envio; avaliar depois |
| INT-* Marketplaces | Fase 6 família Marketplaces |
| FIS-* Fiscal | Fase 6 família Fiscal |
| IA-04 Chatbot WhatsApp | Pós Fase 4; inbound + NLP; mesmo canal |
| MKT-05 / recuperação | Fase 4 (dispara Motor) |

Atualizar `15` com ponte “ver série 25–30” quando conveniente (após este aprovado) — não bloqueia Fase 1.

---

## 13. Dependências entre iniciativas

```text
Fase 1 (WhatsApp + Evolution + Motor)
    │
    ├──► Fase 2 (madureza, LGPD, multi-número)
    │         │
    │         └──► Fase 4 (Comunicação Inteligente)  ← também precisa Marketing/Customers
    │
    ├──► Fase 3 (outros provedores WhatsApp)  ← paralelo a 2 se demanda
    │
    └──► Fase 5 (Email/SMS/Push)  ← reusa Motor + templates

Fase 6 (Pagamentos / Fiscal / Marketplaces / IA)
    └── independentes entre si; cada uma com port própria
         recomendado: Pagamentos antes de Marketplaces se checkout online depender
```

---

## 14. O que explicitamente não fazer cedo

| Tentação | Por que adiar |
|----------|----------------|
| Chatbot completo no dia 1 | Escopo explode; Fase 1 é **envio** |
| Inbox WhatsApp tipo atendimento | Produto diferente; Motor primeiro |
| Multi-provedor antes do 1º cliente estável | Custo sem aprendizado |
| Colorir o hub com 20 cards “ativos” vazios | Ruído; Em breve com parcimônia |
| Automação de cupom sem Marketing Engine | Regra comercial no lugar errado |
| Expor webhooks “para o avançado” | Viola filosofia |
| Módulo separado “Evolution” no menu | Viola `25` |

---

## 15. Critérios para promover uma fase

Promover Fase N → checklist/sprint quando:

1. Fase anterior estável (erros e suporte sob controle)  
2. Há demanda real (cliente ou go-to-market)  
3. Passa nos filtros §4  
4. Não atrasa o compromisso atual do `09` sem decisão explícita  
5. Existe dono de UX (fluxo guiado esboçado)

Senão: permanece neste doc como horizonte.

---

## 16. Próximo passo após aprovação desta série

Com `25`–`30` aprovados:

1. **Criar** `31-checklist-conexoes-fase1.md` — escopo fechado com checkboxes (backend, frontend, e2e)  
2. Atualizar pontualmente `03`, `07`, `08` **durante** a implementação (não antes em bloco)  
3. Opcional: nota em `15` §4.6 apontando para Conexões  
4. **Só então** escrever código — Evolution como primeiro adapter  

Ordem de build sugerida (orientação, detalhe no 31):

```text
Modelos + ports + Evolution adapter
  → Engine + events de pedido
  → Admin API conexão / QR / health
  → Wizard UX (`29`)
  → Templates + assistente (`28`)
  → Stats / alerts
  → E2E com Evolution de staging
```

---

## 17. Histórico de Revisões

| Versão | Data | Descrição |
|--------|------|-----------|
| 1.0 | Jul/2026 | **Aprovado** — fases 1–6; hub alvo; alinhamento `15`; Comunicação Inteligente; critérios de promoção; ponte para checklist 31 |

---

> **Documento aprovado.**  
> Série Conexões `25`–`30` completa.  
> Próximo artefato (quando autorizar): `31-checklist-conexoes-fase1.md` — depois implementação Evolution.
