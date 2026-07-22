# 28 — Templates de Mensagens

> **Documento:** Modelo, variáveis, sandbox, situações ativas e seeds — voz do restaurante no Motor de Comunicação  
> **Produto:** Food Service *(nome comercial provisório)*  
> **Versão:** 1.0  
> **Status:** Aprovado  
> **Última atualização:** Julho/2026  
> **Depende de:** `00-product-philosophy.md`, `25-conexoes-philosophy.md`, `26-communication-engine.md`, `27-conexoes-providers.md` *(aprovados)*  
> **Relacionados:** `11-guia-ui-ux.md`, `04-design-system.md`, `21-marketing-engine.md`, `29-whatsapp-conexao-fluxo.md`  
> **Série Conexões:** `29-whatsapp-conexao-fluxo.md` · `30-conexoes-roadmap.md`  
> **Natureza:** Produto + arquitetura leve. Nomes técnicos **internos**; UI segue `25` §7.

---

## Sumário

1. [Por que este documento existe](#1-por-que-este-documento-existe)
2. [Princípios](#2-princípios)
3. [Situação × template × envio](#3-situação--template--envio)
4. [Catálogo de situações (Fase 1)](#4-catálogo-de-situações-fase-1)
5. [Experiência do comerciante](#5-experiência-do-comerciante)
6. [Sandbox: editar → visualizar → testar → salvar](#6-sandbox-editar--visualizar--testar--salvar)
7. [Variáveis](#7-variáveis)
8. [Sintaxe do corpo](#8-sintaxe-do-corpo)
9. [Seeds e defaults](#9-seeds-e-defaults)
10. [Assistente pós-conexão](#10-assistente-pós-conexão)
11. [Renderização no Motor](#11-renderização-no-motor)
12. [Modelo de dados](#12-modelo-de-dados)
13. [APIs admin (contrato lógico)](#13-apis-admin-contrato-lógico)
14. [Validação e limites](#14-validação-e-limites)
15. [Multi-canal e multi-número (preparação)](#15-multi-canal-e-multi-número-preparação)
16. [Futuro](#16-futuro)
17. [Anti-padrões](#17-anti-padrões)
18. [Checklist de conformidade](#18-checklist-de-conformidade)
19. [Histórico de Revisões](#19-histórico-de-revisões)

---

## 1. Por que este documento existe

O Motor (`26`) sabe **quando** e **por qual provedor** enviar.  
Este documento define **o que** o cliente lê — e como o comerciante controla isso **sem** jargão.

> Templates não são “configuração de integração”.  
> São a **voz do restaurante** nas mensagens automáticas.

Desde a Fase 1 do WhatsApp: textos editáveis, prévia e teste. Nada engessado só no código.

---

## 2. Princípios

| # | Princípio | Implicação |
|---|-----------|------------|
| 1 | **Humanos primeiro** | Situações com nomes de negócio; variáveis em chips (`cliente`), não `order.customer.full_name` |
| 2 | **Poucas decisões** | Seeds bons; assistente liga tudo por padrão (`25` §11) |
| 3 | **Nunca no escuro** | Sandbox obrigatório no caminho de edição (`25` §18) |
| 4 | **Separação** | Ligar/desligar situação ≠ editar texto (podem viver na mesma tela, conceitos distintos) |
| 5 | **Um motor** | Render único; provedor só recebe string final |
| 6 | **Fail soft** | Template inválido não quebra pedido; alert + fallback de seed se possível |
| 7 | **Princípio de Valor** | Editor existe para melhorar experiência do cliente e reduzir trabalho (`25` §4) |

---

## 3. Situação × template × envio

```text
Evento de domínio (order.confirmed)
        │
        ▼
Situação ativa?  ──não──► no-op
        │ sim
        ▼
Template do canal (whatsapp) para essa situação
        │
        ▼
Renderer (variáveis do payload)
        │
        ▼
Adapter.send_text(body)
```

| Conceito | Interno | UI |
|----------|---------|-----|
| Situação | `event_key` + `is_enabled` | Checkbox / toggle “Pedido confirmado” |
| Template | `message_templates.body` | Editor de texto |
| Variável | chave estável no renderer | Chip “cliente”, “pedido”… |

Desligar a situação **para** o envio automático.  
O template pode continuar existindo para quando religar.

---

## 4. Catálogo de situações (Fase 1)

Alinhado a `25` §11 e `26` §6:

| `event_key` | Título UI | Quando dispara (negócio) | Variáveis típicas |
|-------------|-----------|--------------------------|-------------------|
| `order.received` | Pedido recebido | Pedido criado / recebido pela loja | cliente, pedido, valor |
| `order.confirmed` | Pedido confirmado | Loja confirmou | cliente, pedido, valor, tempo |
| `order.preparing` | Pedido em preparo | Status preparo | cliente, pedido, tempo |
| `order.out_for_delivery` | Pedido saiu para entrega | Saiu para entrega | cliente, pedido, tempo |
| `order.delivered` | Pedido entregue | Entregue / finalizado | cliente, pedido |
| `payment.approved` | Pagamento aprovado | Pagamento ok | cliente, pedido, valor |
| `payment.rejected` | Pagamento recusado | Pagamento falhou | cliente, pedido, valor |

Cancelamento e outras situações: mesmo mecanismo; entram no catálogo quando o produto pedir.

Cada situação tem:

- título e descrição curta na UI (“Avisamos o cliente quando você confirmar o pedido”);  
- lista de variáveis **permitidas** (chips);  
- seed de corpo padrão.

---

## 5. Experiência do comerciante

### 5.1 Lista

```text
Templates de Mensagens

Pedido confirmado          Ativa  ●
Pedido saiu para entrega   Ativa  ●
Pagamento recusado         Pausada ○
…
```

- Uma linha por situação do catálogo (não “arquivos” técnicos).  
- Indicador claro: ativa / pausada.  
- Toque → editor.

### 5.2 Editor

```text
Pedido confirmado

Quando enviamos: quando você confirma o pedido.

[ corpo multilinha ]

Variáveis disponíveis:
[ cliente ] [ pedido ] [ valor ] [ tempo ]

Prévia
────────────────
Olá Maria
Recebemos seu pedido!
…
────────────────
[ Enviar teste ]     [ Salvar ]
```

Tom de assistente. Sem “event_key”, sem “Mustache”, sem “payload”.

### 5.3 Onde mora no hub

`Conexões → Comunicação → WhatsApp → Templates` (`25` §9).

Também acessível após o assistente pós-conexão (“Ajustar textos depois”).

---

## 6. Sandbox: editar → visualizar → testar → salvar

Fluxo de confiança (`25` §18.2):

```text
1. Editar          rascunho local (estado da tela)
2. Visualizar      prévia com dados de exemplo (sempre visível ou 1 toque)
3. Enviar teste    opcional; usa rascunho atual; NÃO persiste
4. Salvar          só então grava no banco
```

### 6.1 Prévia

- Usa **fixture de exemplo** do tenant ou defaults globais:

| Chip | Exemplo |
|------|---------|
| cliente | Maria |
| pedido | #1042 |
| valor | R$ 89,90 |
| tempo | 40–50 minutos |
| restaurante | Nome fantasia do tenant |

- Atualiza ao digitar (debounce leve).  
- Mostra aviso se houver placeholder desconhecido: “Remova ou corrija: {{xyz}}”.

### 6.2 Enviar teste

- Destino: número da conexão WhatsApp (próprio comerciante) — Fase 1.  
- Corpo = rascunho renderizado com os mesmos exemplos da prévia (ou payload de teste explícito).  
- Passa pelo Motor `send_test` (`26` §14) → mesmo adapter.  
- Feedback: “Mensagem de teste enviada” / erro humano via diagnóstico.  
- **Não** cria template novo; **não** marca situação; registro pode ir na Central como tipo `test` (filtrável / excluído das stats “clientes” se desejado).

### 6.3 Salvar

- Valida sintaxe e tamanho.  
- Persiste `body` + `updated_at`.  
- Toast humano: “Mensagem atualizada”.  
- Opcional: perguntar se quer enviar teste depois de salvar (não obrigatório).

---

## 7. Variáveis

### 7.1 Camadas

| Camada | Exemplo | Onde vive |
|--------|---------|-----------|
| **Chip UI** | `cliente` | Label do botão / inserção |
| **Token no texto** | `{{cliente}}` | O que o comerciante vê e salva |
| **Chave interna** | `customer_name` | Renderer / payload do evento |

Tabela de mapeamento (código versionado — fonte da verdade):

| Token UI (`{{…}}`) | Chave payload | Origem típica |
|--------------------|---------------|---------------|
| `cliente` | `customer_name` | Pedido / cliente |
| `pedido` | `order_number` | Pedido |
| `valor` | `total_formatted` | Pedido (já formatado BRL) |
| `tempo` | `eta_text` | Pedido / settings |
| `restaurante` | `company_name` | Tenant |
| `endereco` | `delivery_address` | Pedido (quando fizer sentido) |
| `pagamento` | `payment_method_label` | Pedido / pagamento |

Fase 1 pode expor só o subconjunto relevante por situação (chips filtrados).  
Tokens não listados na situação → inválidos na validação.

### 7.2 Formatação

- Valores monetários e datas **já formatados** no payload do evento (pt-BR).  
- Renderer não calcula frete nem regra de preço — só substitui.  
- Ausência de valor: string vazia ou fallback curto (`"—"`) definido por variável; nunca crash.

### 7.3 Inserção na UI

Toque no chip → insere `{{cliente}}` na posição do cursor.  
Não exigir que o comerciante memorize a sintaxe.

---

## 8. Sintaxe do corpo

- Delimitador: `{{token}}` (simples, familiar).  
- Sem lógica no template na Fase 1: sem `{{#if}}`, loops ou filtros.  
- Texto livre + quebras de linha; emojis permitidos.  
- HTML **não** suportado no WhatsApp texto; escapar/ignorar tags se coladas.

Se no futuro Meta exigir “templates oficiais” aprovados, isso será **outro modo** no adapter — o comerciante continua editando situações humanas; o doc `27`/`30` cobre a ponte.

---

## 9. Seeds e defaults

No provisionamento da conexão WhatsApp (ou no primeiro acesso a Templates):

1. Para cada `event_key` do catálogo Fase 1: criar `message_templates` com corpo seed.  
2. Criar `communication_situation_settings` com `is_enabled=true`.  
3. Idempotente: não sobrescrever template que o tenant já editou.

### 9.1 Exemplo de seed — Pedido confirmado

```text
Olá {{cliente}}!

Recebemos seu pedido!

Pedido: {{pedido}}
Valor: {{valor}}
Tempo estimado: {{tempo}}

Obrigado ❤️
{{restaurante}}
```

Seeds dos demais eventos: tom semelhante, só o que muda a mensagem (saiu para entrega, pagamento recusado, etc.).  
Tom profissional e caloroso — alinhado a food service BR.

### 9.2 Reset

Ação opcional em Configurações / editor: “Restaurar texto sugerido”.  
Pede confirmação. Não é default do caminho feliz.

---

## 10. Assistente pós-conexão

Após QR com sucesso (`25` §11):

- Lista as situações com checkbox (todas marcadas).  
- Confirmar → grava `is_enabled` conforme seleção.  
- Templates seed já existem; o assistente **não** pede para editar texto (pode oferecer “Ver templates” depois).  
- Em seguida: CTA mensagem de teste de **conexão** (texto fixo de sistema — distinto do sandbox de template).

Separação:

| Teste | Objetivo |
|-------|----------|
| Mensagem de teste (conexão) | “WhatsApp funciona?” |
| Enviar teste (sandbox) | “Este texto ficou bom?” |

---

## 11. Renderização no Motor

```text
TemplateResolver.get(tenant_id, channel, event_key)
  → body + meta

Renderer.render(body, payload, variable_catalog)
  1. Validar tokens ⊆ permitidos (warn se não)
  2. Substituir {{token}} → valor formatado
  3. Retornar body final
```

- Channel Fase 1: `whatsapp`.  
- Se template missing: re-seed silencioso ou fallback global + alert interno.  
- Se situação `is_enabled=false`: não renderiza / não envia.  
- Logging: guardar snapshot do body enviado no `message_dispatches` (auditoria), não só o template_id.

---

## 12. Modelo de dados

Consolida `26` §15 com detalhe de templates.

### 12.1 `message_templates`

| Coluna | Notas |
|--------|-------|
| id, tenant_id | |
| channel | `whatsapp` |
| event_key | FK lógica ao catálogo |
| body | TEXT |
| is_system_seed | bool — true até primeira edição (opcional) |
| updated_at, created_at | |

Unique: `(tenant_id, channel, event_key)`.

### 12.2 `communication_situation_settings`

| Coluna | Notas |
|--------|-------|
| tenant_id, channel, event_key | |
| is_enabled | default true |
| connection_id | null Fase 1; futuro: número específico |
| updated_at | |

Unique: `(tenant_id, channel, event_key)` (e connection quando multi).

### 12.3 Catálogo em código

`SITUATION_CATALOG` / `VARIABLE_CATALOG` versionados no app `communications` — não editáveis pelo comerciante como “criar event_key novo” na Fase 1.

---

## 13. APIs admin (contrato lógico)

Prefixo ilustrativo: `/api/v1/admin/communications/…`  
(Detalhe OpenAPI em `07` na implementação.)

| Método | Recurso | Uso |
|--------|---------|-----|
| GET | `/situations/` | Lista situações + enabled + resumo do template |
| PATCH | `/situations/{event_key}/` | `{ is_enabled }` |
| GET | `/templates/{event_key}/` | body + variáveis permitidas |
| PUT | `/templates/{event_key}/` | salvar body |
| POST | `/templates/{event_key}/preview/` | `{ body? }` → texto renderizado exemplo |
| POST | `/templates/{event_key}/test/` | envia teste com body rascunho opcional |
| POST | `/situations/bulk/` | assistente pós-conexão (mapa enabled) |

Permissão: alinhada a settings/conexões (ex. `settings.manage` ou `connections.manage` — decidir no checklist).

---

## 14. Validação e limites

| Regra | Valor sugerido Fase 1 |
|-------|------------------------|
| Tamanho máximo do body | ~3500–4096 chars (folga WhatsApp) |
| Tokens desconhecidos | Bloquear save com mensagem humana |
| Body vazio | Bloquear save |
| Só espaços | Bloquear |
| Rate limit teste | Evitar spam (ex. N/min por tenant) |

Erros de API → mensagens humanas no toast/campo.

---

## 15. Multi-canal e multi-número (preparação)

| Evolução | Como o modelo aguenta |
|----------|------------------------|
| Email/SMS | Novo `channel` + seeds próprios; mesma situação pode ter N templates |
| Vários WhatsApp | `connection_id` em settings; template pode permanecer por canal ou por conexão depois |
| Templates por role | Evitar na Fase 1; policy no resolver (`26`) |

Não implementar agora; não unique global “um template no mundo”.

---

## 16. Futuro

**Não implementar agora** — só não bloquear:

- Variáveis condicionais leves (“se tiver tempo estimado”)  
- Biblioteca de tons / sugestão por IA (`25` §24, `21`)  
- A/B de texto  
- Templates de campanha / cupom / aniversário (mesmas situações novas + Marketing Engine)  
- Mídia (imagem) no template  
- Aprovação Meta Cloud templates oficiais

Tudo continua no Motor + catálogo de situações.

---

## 17. Anti-padrões

| Anti-padrão | Por quê |
|-------------|---------|
| Mensagens só hardcoded no Python | Comerciante sem voz da marca |
| Salvar sem prévia | Editar no escuro |
| Expor `event_key` / JSON na UI | Viola filosofia |
| Lógica de negócio no template | Difícil de debugar; fora do escopo Fase 1 |
| Teste de template que não usa o Motor | Dois caminhos de envio |
| Sobrescrever seed a cada deploy | Apaga edição do cliente |
| Uma situação = um provider template ID na UX | Confunde Meta Cloud com nosso editor |

---

## 18. Checklist de conformidade

- [ ] Catálogo Fase 1 com 7 situações + seeds  
- [ ] Assistente pós-conexão grava `is_enabled` (default on)  
- [ ] Editor com chips, prévia e enviar teste antes/sem salvar  
- [ ] Tokens UI mapeados para payload interno  
- [ ] Sem lógica condicional no body (Fase 1)  
- [ ] Unique (tenant, channel, event_key)  
- [ ] Renderer único no Motor; adapter só recebe texto  
- [ ] Stats podem distinguir envio `test` vs real  
- [ ] Copy e erros humanos (`25`)  
- [ ] Princípio de Valor atendido

---

## 19. Histórico de Revisões

| Versão | Data | Descrição |
|--------|------|-----------|
| 1.0 | Jul/2026 | **Aprovado** — situações, variáveis, sandbox, seeds, assistente, modelo e APIs lógicas |

---

> **Documento aprovado.** Próximo: `29-whatsapp-conexao-fluxo.md` — Fluxo de Conexão do WhatsApp.
