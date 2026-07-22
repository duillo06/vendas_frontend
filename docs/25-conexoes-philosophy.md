# 25 — Filosofia do Módulo Conexões

> **Documento:** Filosofia, UX conversacional e visão expansível da Central Inteligente de Conexões  
> **Produto:** Food Service *(nome comercial provisório)*  
> **Versão:** 1.1  
> **Status:** Aprovado  
> **Última atualização:** Julho/2026  
> **Depende de:** `00-product-philosophy.md`, `01-visao-do-produto.md`, `11-guia-ui-ux.md`  
> **Relacionados:** `02-arquitetura.md`, `15-futuras-funcionalidades.md`, `19-future-ideas.md`, `21-marketing-engine.md`, `26-communication-engine.md`  
> **Série Conexões:** `26-communication-engine.md` · `27-conexoes-providers.md` · `28-message-templates.md` · `29-whatsapp-conexao-fluxo.md` · `30-conexoes-roadmap.md` *(aprovados)*  
> **Natureza:** Filosofia + produto — **sem código na UI**. Nomes técnicos abaixo são **internos**.

---

## Sumário

1. [Por que este documento existe](#1-por-que-este-documento-existe)
2. [Visão de longo prazo](#2-visão-de-longo-prazo)
3. [Princípio número 1](#3-princípio-número-1)
4. [Princípio de Valor](#4-princípio-de-valor)
5. [A Regra de Ouro aplicada a Conexões](#5-a-regra-de-ouro-aplicada-a-conexões)
6. [O que o módulo é (e o que não é)](#6-o-que-o-módulo-é-e-o-que-não-é)
7. [Vocabulário: o que o usuário vê](#7-vocabulário-o-que-o-usuário-vê)
8. [Organização do hub (hoje e amanhã)](#8-organização-do-hub-hoje-e-amanhã)
9. [Estrutura do canal WhatsApp](#9-estrutura-do-canal-whatsapp)
10. [Primeira experiência: conectar WhatsApp](#10-primeira-experiência-conectar-whatsapp)
11. [Assistente de primeira configuração](#11-assistente-de-primeira-configuração)
12. [Mensagem de teste](#12-mensagem-de-teste)
13. [Painel principal](#13-painel-principal)
14. [Painel de diagnóstico](#14-painel-de-diagnóstico)
15. [Health check automático](#15-health-check-automático)
16. [Central de Notificações](#16-central-de-notificações)
17. [Estatísticas](#17-estatísticas)
18. [Templates de Mensagens e sandbox](#18-templates-de-mensagens-e-sandbox)
19. [Central de Mensagens](#19-central-de-mensagens)
20. [Múltiplos números (preparação)](#20-múltiplos-números-preparação)
21. [Motor de Comunicação](#21-motor-de-comunicação)
22. [Provedores](#22-provedores)
23. [Comunicação baseada em eventos](#23-comunicação-baseada-em-eventos)
24. [Evolução: Comunicação Inteligente](#24-evolução-comunicação-inteligente)
25. [Regras de UX](#25-regras-de-ux)
26. [Regras de produto](#26-regras-de-produto)
27. [Anti-padrões](#27-anti-padrões)
28. [Série de documentos e ordem de aprovação](#28-série-de-documentos-e-ordem-de-aprovação)
29. [Checklist antes de implementar](#29-checklist-antes-de-implementar)
30. [Histórico de Revisões](#30-histórico-de-revisões)

---

## 1. Por que este documento existe

Este é a **referência oficial** de qualquer evolução relacionada a integrações, canais de comunicação, WhatsApp, templates de mensagem e o hub que o comerciante vê como **Conexões**.

Ele não descreve endpoints nem tabelas. Ele define **como pensamos conexões** — e como o comerciante as ativa.

Se uma tela, um PR ou um doc técnico conflitar com este arquivo **na experiência do comerciante**, **este arquivo vence** (em conjunto com `00-product-philosophy.md`).

> Nosso objetivo não é criar “integrações”.  
> É criar uma **Central Inteligente de Conexões**, onde qualquer serviço possa ser conectado de forma simples, guiada e intuitiva.

A Evolution API será apenas o **primeiro passo** dessa jornada.  
No futuro, o mesmo módulo acomoda novos canais, novos provedores e novas automações — **sem** mudar a experiência do usuário nem a arquitetura central do sistema.

---

## 2. Visão de longo prazo

Não estamos criando “só uma integração com WhatsApp”.

Estamos construindo uma **Plataforma Inteligente de Comunicação**.

| Hoje | Amanhã |
|------|--------|
| Mensagens automáticas via Evolution | Múltiplos provedores no mesmo canal |
| Um número por empresa | Vários números / papéis (delivery, financeiro…) |
| Envio reativo a eventos de pedido | Automações, campanhas, fluxos com atraso |
| Templates editáveis | Sandbox + IA sugerindo textos |
| Diagnóstico simples | Monitoramento proativo + notificações |

Toda decisão de arquitetura e experiência deste módulo deve ser tomada **pensando nessa visão** — sem implementar o futuro cedo demais, mas sem projetar de forma que o futuro exija redesign.

Filosofia permanente:

> Esconder a complexidade.  
> Experiência guiada.  
> O comerciante cuida do negócio — o sistema cuida da conexão.

---

## 3. Princípio número 1

O comerciante **não** quer “configurar a Evolution API”.

O comerciante quer **conectar o WhatsApp**.

Parece nuance. Muda tudo:

| Errado | Certo |
|--------|-------|
| Módulo “Evolution API” | Módulo **Conexões** → canal **WhatsApp** |
| “Informe o webhook e o token” | “Vamos conectar seu WhatsApp?” |
| Formulário técnico | Conversa guiada, um passo por vez |
| Status HTTP, payloads, providers | Online, conectado, mensagens de hoje |
| O usuário entende APIs | O **sistema** conversa com a API |

A complexidade fica **escondida na arquitetura**.  
O usuário só **conecta serviços que já usa**.

Mantra do fluxo:

> **Poucas decisões. Máximo resultado.**

---

## 4. Princípio de Valor

**Princípio fundador** deste módulo — e filtro recomendado para toda evolução futura do produto (alinha e aprofunda `00` §13.3 e `21`).

Nenhuma funcionalidade entra no sistema **só porque é tecnicamente interessante**.

Toda funcionalidade nova precisa cumprir **pelo menos um** destes objetivos:

| Objetivo | Exemplo em Conexões |
|----------|---------------------|
| **Reduzir trabalho** do comerciante | Mensagens automáticas; health check sem ele ficar checando |
| **Aumentar as vendas** | Campanhas e recuperação via mesmo motor (futuro) |
| **Melhorar a experiência do cliente** | Status do pedido no WhatsApp, tom humano nos templates |
| **Reduzir erros operacionais** | Diagnóstico + aviso antes do cliente reclamar |
| **Aumentar a automação** do negócio | Eventos → motor → envio; assistente pós-conexão |

| Resposta | Ação |
|----------|------|
| Cumpre ≥ 1 com clareza | Pode seguir (ainda passando na Regra de Ouro) |
| Não cumpre nenhum | Não entra — ou vai para `19-future-ideas.md` |

Pergunta rápida em review:

> **Isso reduz trabalho, vende mais, melhora o cliente, evita erro ou automatiza o negócio?**  
> Se a resposta for só “é legal tecnicamente” → recusar.

---

## 5. A Regra de Ouro aplicada a Conexões

Toda tela e todo fluxo deste módulo respondem:

> **Um dono de uma pequena pizzaria, sem conhecimento técnico, conseguiria conectar o WhatsApp apenas respondendo perguntas simples — sem saber o que é API, webhook, token ou provider?**

| Resposta | Ação |
|----------|------|
| **Sim** | Pode seguir |
| **Não** | Redesenhar a experiência antes de implementar |

Não negociar. Não “deixar o avançado escondido no caminho feliz”. O caminho feliz é a conversa.

Depois da Regra de Ouro, aplicar o **Princípio de Valor** (§4).

---

## 6. O que o módulo é (e o que não é)

### 6.1 É

- O **hub** de tudo que o restaurante conecta ao sistema
- Uma experiência **acolhedora e guiada** na primeira vez — inclusive **depois** do QR
- Um painel **limpo**, com diagnóstico e estatísticas que geram confiança
- A porta de entrada para Comunicação, Pagamentos, Fiscal, Marketplaces, IA…
- A superfície humana sobre o **Motor de Comunicação** (interno)
- O embrião de uma **Plataforma Inteligente de Comunicação**

### 6.2 Não é

- Um módulo chamado “Evolution API”
- Uma tela de “Integrações REST”
- Um painel de webhooks, tokens genéricos ou logs técnicos
- Um formulário administrativo denso na primeira visita
- Algo que o restante do sistema chame pelo nome do provedor
- Um fim de fluxo no “conectado com sucesso” sem escolher o que enviar

**Regra:** o resto do sistema fala com o **Motor de Comunicação**.  
Nunca com a Evolution API (nem com Meta, Z-API, etc.) diretamente.

---

## 7. Vocabulário: o que o usuário vê

| Interno (devs / docs técnicos) | Usuário (UI / copy) |
|--------------------------------|---------------------|
| Integration / Connection hub | **Conexões** |
| Channel category | Comunicação, Pagamentos, Fiscal… |
| Channel | WhatsApp, Email, SMS… |
| Provider / Adapter | “Como deseja conectar?” / nome amigável (ex.: Evolution) |
| API Key / Token | **Chave de acesso** |
| Base URL / Endpoint | **Endereço do servidor** |
| Instance | Invisível (“Preparando…”) |
| Webhook | Invisível (sistema configura sozinho) |
| QR Code session | “Escaneie o QR Code” |
| Health check | “Verificando conexão…” / painel de status |
| Communication Engine | Invisível |
| Event bus / domain events | Situações: “Pedido confirmado” |
| Message template | **Templates de Mensagens** |
| Template sandbox / dry-run | **Visualizar** / **Enviar teste** |
| Delivery receipt / ACK | Entregue / Pendente / Erro |
| Connection role (delivery, finance…) | Rótulos humanos do número (futuro) |
| Notification center | **Notificações** (avisos do sistema) |

### 7.1 Termos proibidos na UI

Nunca no caminho feliz (labels, títulos, tooltips, erros):

- API, REST, HTTP, JSON, Webhook, Token (como jargão), Provider, Adapter, Payload, Endpoint, Instance ID, Bearer, CORS, Callback URL, Health check (como label técnico), Sandbox (preferir “teste” / “enviar teste”)

Erros externos **traduzidos**:

| Técnico (interno/log) | Usuário vê |
|-----------------------|------------|
| 401 Unauthorized | “Não conseguimos acessar com essa chave. Confira e tente de novo.” |
| Connection refused | “Não encontramos o servidor nesse endereço.” |
| QR expired | “Este QR Code expirou. Vamos gerar outro?” |
| Instance already exists | “Já existe uma conexão em andamento. Quer continuar de onde parou?” |
| Provider timeout | “Sua Evolution demorou para responder. Tentar de novo?” |

**Exceção de copy:** no painel de diagnóstico, pode aparecer o nome **Evolution** (serviço que o comerciante instalou), mas **não** “Evolution API respondendo 200 OK”. Preferir: “Evolution respondendo” / “Servidor acessível”.

---

## 8. Organização do hub (hoje e amanhã)

O hub se chama **Conexões**. A navegação cresce por **famílias** — não por vendor.

```text
Conexões
│
├── Comunicação
│   ├── WhatsApp          ← primeira implementação
│   ├── Email             ← previsto
│   └── SMS               ← previsto
│
├── Pagamentos
│   ├── Asaas             ← previsto
│   ├── Mercado Pago      ← previsto
│   └── Stripe            ← previsto
│
├── Fiscal
│   ├── NFC-e             ← previsto
│   └── SAT               ← previsto
│
├── Marketplaces
│   ├── iFood             ← previsto
│   └── Delivery Much     ← previsto
│
└── Inteligência Artificial
    ├── OpenAI            ← previsto
    ├── Google            ← previsto
    └── Anthropic         ← previsto
```

Mapas, Automação e outros slots entram na mesma lógica (família → serviço).

### 8.1 Experiência do hub

Não é grade técnica de “conectores”.  
É vitrine: “Quais serviços você quer ligar ao seu restaurante?”

Cada item:

- ícone claro;
- nome humano;
- frase de benefício;
- status: **Não conectado** / **Conectado** / **Em breve**.

No primeiro corte, só **WhatsApp** (em Comunicação) está ativo.  
Os demais podem aparecer como **Em breve** — educam a visão, sem parecer bug.

---

## 9. Estrutura do canal WhatsApp

```text
Conexões → Comunicação → WhatsApp
    ├── Status / Painel     ← conexão + diagnóstico + estatísticas
    ├── Conectar            ← fluxo guiado (1ª vez ou reconectar)
    ├── Templates           ← editar + sandbox (prévia + teste)
    ├── Mensagens           ← Central de Mensagens (resumo → detalhe)
    ├── Notificações        ← avisos do canal (ou feed global do backoffice)
    └── Configurações       ← mínimo necessário, linguagem humana
```

Nomes de menu podem ajustar na implementação; a intenção permanece: **conectar → escolher o que envia → confiar (diagnóstico/teste) → editar voz → acompanhar**.

---

## 10. Primeira experiência: conectar WhatsApp

### 10.1 Boas-vindas (zero formulários)

```text
Vamos conectar seu WhatsApp?

Conectando seu número você poderá enviar
automaticamente mensagens para seus clientes.

Seu restaurante ficará muito mais profissional.

[ Conectar WhatsApp ]
```

Botão **grande**, protagonista. Tom de assistente (`00` §10).

### 10.2 Como deseja conectar?

```text
Como deseja conectar?

Por enquanto nosso sistema suporte:

🟢 Evolution

Mais opções estarão disponíveis em breve.
```

- Nome que o comerciante reconhece (Evolution), sem “REST v2”.
- UI já prevê lista de formas de conectar.

### 10.3 Localizar o servidor

```text
Vamos localizar seu servidor

Informe apenas duas informações.

• Endereço da Evolution
  “É o endereço onde sua Evolution está instalada.”

• Chave de acesso
  “A chave permite que nosso sistema converse com seu WhatsApp.”

[ Conectar ]
```

### 10.4 Feedback em tempo real

```text
Conectando…
Validando acesso…
Preparando sua conexão…
Preparando QR Code…
```

Cada etapa com check visual. Nada de spinner mudo.

### 10.5 QR Code

```text
Abra o WhatsApp no celular
→ Configurações
→ Dispositivos conectados
→ Conectar dispositivo

Escaneie o QR Code abaixo.
```

QR **grande**, central, legível também no mobile do backoffice.

### 10.6 Sucesso — não encerra o fluxo

Animação discreta. Ícone verde. Em seguida **obrigatório** o assistente (§11) — não saltar direto ao painel “vazio” de decisões.

### 10.7 Desconexão / reconexão

“WhatsApp desconectado”, “Reconectar”, “Gerar novo QR Code”.  
Nunca “session expired” / “logout instance”.

---

## 11. Assistente de primeira configuração

Após conectar com sucesso, um **assistente curto** finaliza a configuração.

```text
Seu WhatsApp já está conectado!

Agora vamos escolher quais mensagens
seu restaurante enviará automaticamente.

☑ Pedido recebido
☑ Pedido confirmado
☑ Pedido em preparo
☑ Pedido saiu para entrega
☑ Pedido entregue
☑ Pagamento aprovado
☑ Pagamento recusado

[ Confirmar e ativar ]
```

### 11.1 Regras

- **Todos marcados por padrão** — poucas decisões, máximo resultado.
- O comerciante só desmarca o que não quiser e confirma.
- Em **menos de um minuto**, o sistema está operacional.
- Não é “configurar eventos”; é “escolher o que enviar aos clientes”.
- Depois: oferecer **mensagem de teste** (§12) e só então o painel principal.

Pode revisitir isso em Configurações / Templates (“Quais mensagens estão ativas?”).

---

## 12. Mensagem de teste

Após o assistente (ou a qualquer momento no painel):

```text
[ Enviar mensagem de teste ]
```

Objetivo: o comerciante **confirma na hora** que tudo funciona.

Exemplo de conteúdo:

```text
Olá! 🎉 Seu WhatsApp foi conectado com sucesso ao sistema.
```

- Destino: o próprio número conectado (ou número informado no fluxo, se necessário).
- Feedback imediato: “Mensagem enviada” / “Não conseguimos enviar — veja o diagnóstico”.
- Aumenta confiança e reduz ticket de suporte.

---

## 13. Painel principal

Depois do onboarding, a tela vira **status elegante** + atalhos:

```text
🟢 WhatsApp conectado

Número                 (31) 99999-9999
Status                 Online
Mensagens hoje         152
Última sincronização   há poucos segundos

[ Enviar mensagem de teste ]
[ Ver templates ]  [ Ver mensagens ]
```

Inclui (ou linka) o **diagnóstico** (§14) e o resumo de **estatísticas** (§17).  
Sem debug, sem webhooks.

---

## 14. Painel de diagnóstico

O comerciante **não** deve descobrir problemas só quando o cliente não recebe mensagem.

Painel **extremamente simples** — linguagem humana, sem códigos HTTP:

```text
🟢 Servidor conectado
🟢 Evolution respondendo
🟢 WhatsApp conectado
🟢 Comunicação funcionando

Última verificação: há poucos segundos
```

Se algo falhar, apontar **onde**:

```text
⚠ Não conseguimos acessar sua Evolution.

[ Verificar novamente ]
```

Outros exemplos humanos:

- “Seu WhatsApp foi desconectado. Escaneie um novo QR Code.”
- “A chave de acesso parece inválida. Atualize nas configurações.”
- “O servidor não respondeu a tempo.”

Diagnóstico ≠ tela de logs. Um olhar, um problema, uma ação.

---

## 15. Health check automático

A arquitetura **prevê** um monitor periódico (detalhe técnico em `26`).

Periodicamente o sistema verifica, em cascata:

```text
Servidor → acesso Evolution → instância → WhatsApp → envio possível
```

Se alguma etapa falhar:

1. Atualiza o painel de diagnóstico  
2. Gera aviso na **Central de Notificações** (§16)  
3. (Opcional futuro) destaca no header do backoffice  

Objetivo: **evitar chamadas ao suporte** e falhas silenciosas.

O comerciante não “liga o monitor”. Ele só vê status e avisos.

---

## 16. Central de Notificações

Problemas importantes chegam ao comerciante de forma clara.

Exemplos:

| Situação | Aviso (exemplo) |
|----------|-----------------|
| WhatsApp caiu | “Seu WhatsApp foi desconectado.” |
| QR expirou | “O QR Code expirou. Gere um novo para reconectar.” |
| Evolution indisponível | “Não estamos conseguindo falar com sua Evolution.” |
| Chave inválida | “A chave de acesso precisa ser atualizada.” |

Princípios:

- Linguagem humana, com próximo passo quando possível  
- Pode viver no canal WhatsApp **e/ou** no feed global de notificações do backoffice  
- Não confundir com a Central de Mensagens (histórico de envios aos clientes)

---

## 17. Estatísticas

Desde o início: **espaço** para estatísticas simples (mesmo que os números sejam básicos).

```text
Hoje

152 mensagens enviadas
150 entregues
2 falharam

Tempo médio de envio     ~1s
Último envio             há 3 minutos
```

- Aumenta percepção de qualidade e controle  
- Alimenta a Central de Mensagens  
- Evolui depois: por template, por dia, taxa de erro, etc.  
- Sem dashboard de engenharia (latência p99, status codes…)

---

## 18. Templates de Mensagens e sandbox

Desde a **primeira versão** do canal: textos editáveis. Nada engessado só no código.

### 18.1 Exemplo

```text
Pedido confirmado

Olá {{cliente}}

Recebemos seu pedido!

Pedido:
{{pedido}}

Valor:
{{valor}}

Tempo estimado:
{{tempo}}

Obrigado ❤️
```

### 18.2 Sandbox (nunca editar “no escuro”)

Fluxo obrigatório de confiança:

```text
Editar
  ↓
Visualizar (prévia com dados de exemplo)
  ↓
Enviar teste   ← opcional mas oferecido com clareza
  ↓
Salvar
```

- Variáveis em chips humanos (`cliente`, `pedido`, `valor`, `tempo`)  
- Prévia antes de persistir  
- “Enviar teste” usa o número conectado (ou destino de teste)  
- O comerciante nunca altera a voz da marca sem ver/sentir o resultado  

Detalhe: `28-message-templates.md`.

---

## 19. Central de Mensagens

Espaço reservado desde o dia 1 (Histórico / Mensagens).

### 19.1 Primeiro corte

```text
Hoje

112 mensagens enviadas
109 entregues
2 pendentes
1 erro
```

Alinha às estatísticas (§17). Visual, calmo. Sem tabela densa obrigatória no dia 1.

### 19.2 Futuro

Filtros, pesquisa, reenvio, detalhe por envio, linha do tempo por pedido/cliente.  
Arquitetura de log nasce preparada; UI completa pode esperar.

---

## 20. Múltiplos números (preparação)

**Hoje:** uma empresa → **um** número de WhatsApp.

**Amanhã (não implementar agora):** várias conexões no mesmo canal, com papéis:

```text
WhatsApp
├── Delivery        (31) 9xxxx-1111
├── Financeiro      (31) 9xxxx-2222
├── Suporte         (31) 9xxxx-3333
└── Loja física     (31) 9xxxx-4444
```

Implicações de produto (só documentar):

- Modelo mental: **conexão** (número + provedor + papel), não “um slot global”  
- Templates / eventos podem escolher **qual número** fala (ex.: status de pedido → Delivery)  
- Diagnóstico e estatísticas por conexão  
- UX do hub lista conexões do canal, com “Adicionar outro número” quando a fase existir  

A Fase 1 modela dados de forma que um segundo número **não** exija migração destrutiva. Detalhe em `26` / `27` / `30`.

---

## 21. Motor de Comunicação

### 21.1 Por que existe

O restante do sistema **não** conhece Evolution, Meta, Z-API…

```text
Pedido confirmado
        ↓
Motor de Comunicação
        ↓
Resolver canal + conexão + provedor + template
        ↓
WhatsApp → adapter (Evolution / Meta / …)
        ↓
Enviar mensagem
```

### 21.2 Consequência

Trocar provedor **não** altera regra de negócio de pedidos, promoções ou checkout.  
Só o adapter muda.

Documento dedicado: `26-communication-engine.md`.

---

## 22. Provedores

```text
WhatsApp
└── Forma de conectar
    ├── Evolution          ← primeira
    ├── Meta Cloud API     ← futuro
    ├── Z-API              ← futuro
    ├── Uazapi             ← futuro
    └── Twilio             ← futuro
```

| Camada | Responsabilidade |
|--------|------------------|
| **Canal** | O que conectar (WhatsApp) |
| **Conexão** | Qual número / papel |
| **Provedor** | Como o sistema fala com esse WhatsApp |
| **Motor** | Quando, o quê, para quem; chama o provedor |

Documento: `27-conexoes-providers.md`.

---

## 23. Comunicação baseada em eventos

O sistema **gera eventos**. O Motor decide o que fazer.  
O comerciante escolhe **quais situações geram mensagem** (§11) e **o texto** (§18) — nunca o wiring.

| Evento (interno) | Situação na UI |
|------------------|----------------|
| Pedido recebido / criado | Pedido recebido |
| Pedido confirmado | Pedido confirmado |
| Pedido em preparo | Pedido em preparo |
| Pedido saiu para entrega | Pedido saiu para entrega |
| Pedido entregue | Pedido entregue |
| Pedido cancelado | Pedido cancelado |
| Pagamento aprovado | Pagamento aprovado |
| Pagamento recusado | Pagamento recusado |

---

## 24. Evolução: Comunicação Inteligente

**Não implementar agora.** O Motor nasce como envio reativo — e a documentação já prevê virar um verdadeiro **Motor de Comunicação Inteligente**.

Exemplos futuros (mesmo engine):

```text
Pedido entregue
        ↓
30 minutos depois
        ↓
Solicitar avaliação
```

```text
Cliente sem comprar há 30 dias
        ↓
Enviar cupom automaticamente
```

```text
Aniversário do cliente
        ↓
Enviar parabéns
```

```text
Nova campanha / promoção começou
        ↓
Enviar divulgação
```

Capacidades que a arquitetura deve **permitir** (sem UI agora):

- atrasos e janelas (“30 min depois”);  
- audiências (inativos, aniversariantes);  
- ligação com Marketing Engine (`21`) e promoções (`20`);  
- múltiplos canais na mesma jornada (WhatsApp hoje; Email/SMS depois).

Detalhe de fases: `30-conexoes-roadmap.md`.

---

## 25. Regras de UX

1. **Zero telas técnicas** no caminho feliz.  
2. **Zero curva de aprendizado** — se precisar explicar API, falhou.  
3. **Fluxo guiado** — um passo por vez.  
4. **Conversação** — assistente, não DevOps.  
5. **Poucas decisões, máximo resultado** — defaults inteligentes (§11).  
6. **Explicações humanas** em cada campo.  
7. **Feedback em tempo real** — conexão, diagnóstico, teste.  
8. **Confiança imediata** — mensagem de teste + diagnóstico visível.  
9. **Sandbox em templates** — editar → visualizar → testar → salvar.  
10. **Celebrar o sucesso** — microinteração discreta no “conectado”.  
11. **Avisar cedo** — notificações antes do cliente reclamar.  
12. **Um protagonista por tela**.  
13. Visual moderno (`04` / `11`); mobile first no backoffice.

---

## 26. Regras de produto

1. O módulo se chama **Conexões**, não o nome de nenhum provedor.  
2. Organização por **famílias** (Comunicação, Pagamentos…) — §8.  
3. WhatsApp é o **primeiro canal**; Evolution o **primeiro provedor**.  
4. Pedidos / pagamentos / marketing **não** importam SDK de provedor.  
5. Pós-QR: assistente de mensagens ativas (§11) faz parte do caminho feliz.  
6. Mensagem de teste disponível após configurar.  
7. Diagnóstico + health check previstos na arquitetura.  
8. Notificações humanas para falhas de conexão.  
9. Estatísticas simples desde o dia 1.  
10. Templates com sandbox (prévia + teste).  
11. Modelo preparado para **múltiplos números** (§20) — um número na Fase 1.  
12. Eventos disparam o motor; comerciante edita textos e liga/desliga situações.  
13. Toda feature passa no **Princípio de Valor** (§4).  
14. Multi-tenant: cada estabelecimento tem suas conexões.  
15. Credenciais sensíveis: nunca logar chave completa; nunca expor à toa.

---

## 27. Anti-padrões

| Anti-padrão | Por que falha |
|-------------|----------------|
| Menu “Integrações → Evolution API” | Ensina jargão; amarra a um vendor |
| Encerrar no “conectado!” sem escolher mensagens | Sistema “ligado” mas mudo — frustra |
| Templates sem prévia/teste | Comerciante edita no escuro |
| Descobrir falha só pelo cliente | Falta diagnóstico + health check |
| PedidoService → EvolutionClient | Acoplamento; troca de provedor dói |
| “Configure seus eventos / webhooks” | Arquitetura vazou |
| Logs HTTP como “painel” | Não é UX de comerciante |
| Feature “porque a API permite” | Viola Princípio de Valor |
| Um único slot rígido de número no banco | Bloqueia múltiplos números depois |
| Hub plano só com vendors | Dificulta crescimento por família |

---

## 28. Série de documentos e ordem de aprovação

Antes de **qualquer linha de código** desta feature, aprovar a série:

| Doc | Título | Foco |
|-----|--------|------|
| **25** (este) | Filosofia do módulo Conexões | Produto, UX, valor, anti-padrões |
| **26** | Motor de Comunicação | Engine, eventos, health check, multi-conexão |
| **27** | Arquitetura de Providers | Canal × conexão × provedor × adapters |
| **28** | Templates de Mensagens | Modelo, variáveis, sandbox, ativos por situação |
| **29** | Fluxo de Conexão do WhatsApp | UX ponta a ponta (assistente + teste + QR) |
| **30** | Roadmap futuro das integrações | Famílias do hub, automações, fases |

**Implementação** (Evolution como primeiro provedor) só após **25–30** aprovados — ou corte explícito acordado.

Checklist de implementação (quando for a hora): `31-checklist-conexoes-fase1.md` — **não** criar agora.

---

## 29. Checklist antes de implementar

Antes do primeiro PR de Conexões / WhatsApp:

- [ ] Este documento (**25**) aprovado  
- [ ] Série **26–30** aprovada (ou escopo reduzido acordado)  
- [ ] Nenhuma tela do caminho feliz usa termo da §7.1  
- [ ] Fluxo: boas-vindas → provedor → 2 campos → progresso → QR → **assistente de mensagens** → **teste** → painel  
- [ ] Defaults: todas as situações de mensagem **ligadas**  
- [ ] Painel com diagnóstico simples (§14)  
- [ ] Health check previsto na arquitetura (§15)  
- [ ] Notificações humanas para falhas (§16)  
- [ ] Estatísticas básicas (§17)  
- [ ] Templates com editar → visualizar → testar → salvar (§18)  
- [ ] Modelo preparado para múltiplos números (§20)  
- [ ] Nenhum service de domínio chama provedor direto (§21)  
- [ ] Adapter Evolution isolado (§22)  
- [ ] Passa na Regra de Ouro (§5) e no Princípio de Valor (§4)

---

## 30. Histórico de Revisões

| Versão | Data | Descrição |
|--------|------|-----------|
| 1.1 | Jul/2026 | **Aprovado** — revisão de produto (assistente, teste, diagnóstico, health check, notificações, estatísticas, multi-número, sandbox, Comunicação Inteligente, hub por famílias, Princípio de Valor) |
| 1.0 | Jul/2026 | Criação — Central Inteligente de Conexões; WhatsApp como 1º canal; Evolution como 1º provedor; Motor, templates, eventos e roadmap da série 26–30 |

---

> **Documento aprovado.** Fonte da filosofia do módulo Conexões.  
> Série `25`–`30` completa. Próximo (quando autorizar): `31-checklist-conexoes-fase1.md`.
