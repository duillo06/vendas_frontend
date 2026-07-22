# 29 — Fluxo de Conexão do WhatsApp

> **Documento:** Wireflow ponta a ponta — onboarding, QR, assistente, teste, painel, reconexão e erros  
> **Produto:** Food Service *(nome comercial provisório)*  
> **Versão:** 1.0  
> **Status:** Aprovado  
> **Última atualização:** Julho/2026  
> **Depende de:** `00-product-philosophy.md`, `25-conexoes-philosophy.md`, `26-communication-engine.md`, `27-conexoes-providers.md`, `28-message-templates.md` *(aprovados)*  
> **Relacionados:** `11-guia-ui-ux.md`, `04-design-system.md`, `30-conexoes-roadmap.md`  
> **Série Conexões:** `30-conexoes-roadmap.md`  
> **Natureza:** UX + estados — copy humana; Evolution só como 1ª forma de conectar. Sem jargão na UI (`25` §7).

---

## Sumário

1. [Por que este documento existe](#1-por-que-este-documento-existe)
2. [Objetivo da jornada](#2-objetivo-da-jornada)
3. [Mapa geral do fluxo](#3-mapa-geral-do-fluxo)
4. [Entrada no hub](#4-entrada-no-hub)
5. [Passo a passo: primeira conexão](#5-passo-a-passo-primeira-conexão)
6. [Estados da conexão (UI ↔ interno)](#6-estados-da-conexão-ui--interno)
7. [QR Code: regras de UX](#7-qr-code-regras-de-ux)
8. [Assistente de mensagens + teste](#8-assistente-de-mensagens--teste)
9. [Painel conectado](#9-painel-conectado)
10. [Reconexão e desconexão](#10-reconexão-e-desconexão)
11. [Fluxos de erro](#11-fluxos-de-erro)
12. [Polling, tempo real e timeouts](#12-polling-tempo-real-e-timeouts)
13. [Mobile e backoffice](#13-mobile-e-backoffice)
14. [Telas satélite (resumo)](#14-telas-satélite-resumo)
15. [Critérios de pronto da jornada](#15-critérios-de-pronto-da-jornada)
16. [Anti-padrões de fluxo](#16-anti-padrões-de-fluxo)
17. [Checklist de implementação UX](#17-checklist-de-implementação-ux)
18. [Histórico de Revisões](#18-histórico-de-revisões)

---

## 1. Por que este documento existe

`25`–`28` definem filosofia, motor, providers e templates.  
Este documento é o **roteiro de telas e estados** que o time implementa no backoffice — a jornada que o comerciante percorre para “conectar o WhatsApp”.

Se uma tela conflitar com este fluxo **na experiência**, redesenhar a tela (não “explicar API” na UI).

Provedor da Fase 1: **Evolution** (`27`). A jornada já prevê um passo “Como deseja conectar?” expansível.

---

## 2. Objetivo da jornada

Em **uma sessão curta**, o comerciante deve:

1. Entender o benefício  
2. Informar só o essencial (endereço + chave)  
3. Escanear o QR  
4. Escolher o que enviar (tudo ligado por padrão)  
5. Enviar uma mensagem de teste  
6. Chegar ao painel com confiança (diagnóstico verde)

Mantra: **Poucas decisões. Máximo resultado.** (`25` §3)

Meta de percepção: “em menos de alguns minutos meu WhatsApp já fala com os clientes.”

---

## 3. Mapa geral do fluxo

```text
[Hub Conexões]
      │
      ▼
[WhatsApp — sem conexão]
      │
      ▼
① Boas-vindas
      │
      ▼
② Como deseja conectar?     (Evolution)
      │
      ▼
③ Localizar servidor         (URL + chave)
      │
      ▼
④ Progresso                  (validando… preparando…)
      │
      ▼
⑤ QR Code                    ◄── refresh se expirar
      │  (scan)
      ▼
⑥ Sucesso (microcelebração)
      │
      ▼
⑦ Assistente: quais mensagens?
      │
      ▼
⑧ Mensagem de teste          (oferecida; pode pular)
      │
      ▼
⑨ Painel conectado
```

Atalhos depois do primeiro sucesso:

- Hub → WhatsApp → Painel (⑨)  
- Desconectado → Reconectar → (④–⑤) ou (③) se credencial inválida  
- Templates / Mensagens / Diagnóstico a partir de ⑨  

---

## 4. Entrada no hub

### 4.1 Menu

Item de navegação do backoffice: **Conexões** (não “Integrações”, não “Evolution”).

### 4.2 Hub (Fase 1)

Família **Comunicação** em destaque:

| Card | Status | Ação |
|------|--------|------|
| WhatsApp | Não conectado / Conectado / Atenção | Entrar no canal |
| Email, SMS, … | Em breve | Desabilitado ou tooltip “Em breve” |

Outras famílias (Pagamentos, Fiscal…) podem aparecer como Em breve (`25` §8).

### 4.3 Deep link

Se o comerciante abrir WhatsApp sem conexão → vai direto para ① (não para formulário vazio).

Se já conectado → ⑨.

Se `awaiting_qr` / sessão interrompida → retomar ⑤ ou ④ com contexto (“Vamos continuar de onde parou”).

---

## 5. Passo a passo: primeira conexão

### ① Boas-vindas

**Layout:** uma composição — título, 2 frases, um CTA grande. Sem formulário.

```text
Vamos conectar seu WhatsApp?

Conectando seu número você poderá enviar
automaticamente mensagens para seus clientes.

Seu restaurante ficará muito mais profissional.

[ Conectar WhatsApp ]
```

- Progresso visual opcional: “Passo 1 de …” só se não poluir; preferir narrativa sem numeração técnica.  
- Secondary: “Como funciona?” (accordion curto: celular → QR → mensagens automáticas) — sem jargão.

### ② Como deseja conectar?

```text
Como deseja conectar?

🟢 Evolution
   Ideal se você já tem a Evolution instalada.

○  Outras opções — em breve

[ Continuar ]
```

- Um card selecionável (Evolution).  
- Lista preparada para Meta / Z-API depois (`27` §3).  
- Se só um disponível, ainda assim mostrar o passo (educa o modelo mental) **ou** pular com copy “Conectando via Evolution” — **preferência:** mostrar o passo para deixar claro que outras formas virão.

### ③ Localizar servidor

```text
Vamos localizar seu servidor

Informe apenas duas informações.

Endereço da Evolution
[ https://…                    ]
É o endereço onde sua Evolution está instalada.

Chave de acesso
[ •••••••••••••••••••••••••••• ]
A chave permite que nosso sistema converse com seu WhatsApp.

[ Voltar ]  [ Conectar ]
```

- Validação leve no client: URL com aparência de endereço; chave não vazia.  
- Submit → loading no botão + transição para ④.  
- Erros de campo: sob o input, linguagem humana (`25` §7.1).

### ④ Progresso

Tela full de etapas (não spinner mudo):

```text
Conectando…

✓ Validando acesso
… Preparando sua conexão
○ Preparando QR Code
```

Mapeamento interno (invisível):

| Copy | Operação (`27`) |
|------|-----------------|
| Validando acesso | `validate_credentials` |
| Preparando sua conexão | `provision` + webhook |
| Preparando QR Code | `get_qr` |

Falha em qualquer etapa → §11 (não avançar para QR vazio).

### ⑤ QR Code

```text
Abra o WhatsApp no celular
1. Configurações
2. Dispositivos conectados
3. Conectar dispositivo

Escaneie o QR Code abaixo.

[ QR grande ]

Atualiza automaticamente · [ Gerar novo QR ]
```

Ver §7.

### ⑥ Sucesso

```text
✓ Seu WhatsApp foi conectado com sucesso!

Agora vamos escolher quais mensagens
seu restaurante enviará automaticamente.

[ Continuar ]
```

- Confetes / check verde **discretos** (`04` / `11`).  
- Auto-avançar para ⑦ após ~1,5s **ou** botão Continuar (acessível).  
- Exibir número conectado se já disponível: “Conectado: (31) 9…”.

### ⑦ Assistente de mensagens

Ver §8.1.

### ⑧ Mensagem de teste

Ver §8.2.

### ⑨ Painel

Ver §9.

---

## 6. Estados da conexão (UI ↔ interno)

| Status interno (`26`) | O que o comerciante vê | Tela típica |
|----------------------|------------------------|-------------|
| — (sem row) | Não conectado | ① |
| `pending` | Configurando… | ③–④ |
| `awaiting_qr` | Aguardando leitura do QR | ⑤ |
| `connected` | WhatsApp conectado / Online | ⑨ |
| `disconnected` | WhatsApp desconectado | Banner + Reconectar |
| `error` | Precisa da sua atenção | Diagnóstico vermelho + ação |

Badge no hub WhatsApp:

- Cinza: não conectado  
- Verde: conectado  
- Âmbar: desconectado / degradado  
- Vermelho: erro de acesso  

---

## 7. QR Code: regras de UX

1. **Tamanho:** dominante na viewport; legível a ~40–50 cm do celular.  
2. **Contraste:** QR escuro em fundo claro; sem overlay de badges (`user` design rules do storefront não se aplicam igual, mas evitar stickers em cima do QR).  
3. **Instruções:** lista numerada curta (WhatsApp → Configurações → Dispositivos → Conectar).  
4. **Expiração:** detectar `qr_expired` / timeout → mensagem + botão “Gerar novo QR” (e/ou auto-refresh com aviso).  
5. **Atualização:** poll ou evento (`27` webhook `qr_updated` / `connection_update`) — UI nunca “morta”.  
6. **Sucesso:** ao `connected`, ir para ⑥ sem exigir clique extra se seguro.  
7. **Abortar:** “Cancelar” volta ao hub ou ①; cleanup best-effort no backend (não deixar orphan confuso).  
8. **Mobile do backoffice:** se a tela for pequena, instruir “Abra este painel no computador para ver o QR” **ou** permitir ampliar QR em tela cheia — preferir full-screen QR no mobile.

---

## 8. Assistente de mensagens + teste

### 8.1 Assistente (⑦)

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

Todos ligados por padrão — desmarque só o que não quiser.

[ Confirmar e ativar ]
```

- PATCH bulk `situations` (`28` §13).  
- Não editar textos aqui (link discreto: “Você poderá ajustar os textos depois”).  
- Voltar não desfaz a conexão WhatsApp.

### 8.2 Mensagem de teste (⑧)

```text
Tudo certo para um teste rápido?

Vamos enviar uma mensagem para o seu próprio WhatsApp
para você ver funcionando na hora.

[ Enviar mensagem de teste ]   [ Fazer isso depois ]
```

Corpo fixo de sistema (exemplo):

```text
Olá! 🎉 Seu WhatsApp foi conectado com sucesso ao sistema.
```

Estados:

| Resultado | UI |
|-----------|-----|
| Enviando | Botão loading |
| OK | “Mensagem enviada — confira no celular” → ⑨ |
| Falha | Erro humano + “Ver diagnóstico” + retry; ainda pode ir ao painel |

“Fazer isso depois” → ⑨ com CTA persistente no painel.

---

## 9. Painel conectado

```text
🟢 WhatsApp conectado

Número                 (31) 99999-9999
Status                 Online
Mensagens hoje         152
Última verificação     há poucos segundos

── Diagnóstico ──
🟢 Servidor conectado
🟢 Evolution respondendo
🟢 WhatsApp conectado
🟢 Comunicação funcionando
[ Verificar novamente ]

── Ações ──
[ Enviar mensagem de teste ]
[ Templates ]  [ Mensagens ]
[ Configurações ]
```

- Diagnóstico compacto (accordion no mobile).  
- Stats do dia (`25` §17; `26` §11).  
- Se algum step vermelho: banner no topo do painel + item âmbar/vermelho no diagnóstico (§11).

---

## 10. Reconexão e desconexão

### 10.1 Desconectado (detectado por webhook / health)

```text
⚠ Seu WhatsApp foi desconectado.

Os pedidos continuam no sistema — só as mensagens
automáticas pausam até reconectar.

[ Reconectar WhatsApp ]
```

- Gera/atualiza MerchantAlert (`26` §13).  
- Reconectar: se credenciais ok → ④–⑤; senão → ③.

### 10.2 Desconectar manual (Configurações)

```text
Deseja desconectar este WhatsApp?

Você poderá conectar de novo quando quiser.
Mensagens automáticas deixarão de ser enviadas.

[ Cancelar ]  [ Desconectar ]
```

Confirmação explícita (`00` confiança).

### 10.3 Atualizar chave / endereço

Fluxo curto em Configurações → revalida → health check → toast.

---

## 11. Fluxos de erro

| Momento | Causa típica | UI |
|---------|--------------|-----|
| ③ submit | URL inválida (client) | Erro no campo |
| ④ validar | chave inválida | Volta ③ com “Não conseguimos acessar com essa chave…” |
| ④ validar | servidor inacessível | Volta ③ com “Não encontramos o servidor…” |
| ④ provision | timeout / erro vendor | “Sua Evolution demorou…” + Tentar de novo |
| ⑤ | QR expirou | “Vamos gerar outro?” + botão |
| ⑤ | usuário desistiu | Cancelar limpo |
| ⑧ / envio | sessão caiu | Diagnóstico + Reconectar |
| Painel | health fail parcial | Step vermelho + ação |

Nunca exibir stack, status HTTP ou JSON.

Botão padrão de recuperação: **Tentar de novo** / **Verificar novamente** / **Reconectar**.

---

## 12. Polling, tempo real e timeouts

| Fase | Mecanismo sugerido | Timeout UX |
|------|--------------------|------------|
| ④ Progresso | Request longo ou steps via API | ~30–60s por step → erro humano |
| ⑤ QR | Poll status a cada 2–3s **ou** SSE/websocket se já existir no projeto | QR refresh ~40–60s ou evento `qr_updated` |
| ⑤ → connected | Poll / webhook-driven | Assim que `connected`, avançar |
| Health no painel | Beat no server + fetch ao abrir / botão | — |

Indicador “Atualizando…” sutil durante poll.  
Se a aba ficar em background, retomar poll ao focar.

---

## 13. Mobile e backoffice

- Mobile first no layout das etapas (`foodservice` rules).  
- CTA polegar: botões full-width no mobile.  
- QR: modo imersivo (tela cheia) se viewport estreita.  
- Evitar pedir para digitar URL longa no mobile sem paste amigável (input `type` adequado, autocomplete off na chave).  
- Diagnóstico e stats: stack vertical; sem tabela densa.

---

## 14. Telas satélite (resumo)

Não são o onboarding, mas fecham a experiência do canal:

| Tela | Entrada | Ref |
|------|---------|-----|
| Templates | Painel / menu | `28` |
| Central de Mensagens | Painel | `25` §19 |
| Notificações | Bell global ou menu | `25` §16 |
| Configurações | Endereço, chave, desconectar | este §10 |

Onboarding **não** deve despejar essas telas antes de ⑦–⑨.

---

## 15. Critérios de pronto da jornada

A jornada Fase 1 está “pronta” quando:

- [ ] Comerciante conclui ①→⑨ sem ver termo proibido (`25` §7.1)  
- [ ] Defaults de mensagens todos on; confirmação em um toque  
- [ ] Teste de conexão disponível e confiável  
- [ ] QR com instruções, refresh e sucesso automático  
- [ ] Painel mostra número, diagnóstico e stats básicas  
- [ ] Desconexão gera aviso + caminho de reconexão  
- [ ] Erros recuperáveis com próximo passo  
- [ ] Mobile usável (QR legível / full-screen)  
- [ ] Provider = Evolution atrás da port (`27`); UI diz “Evolution” só onde faz sentido  

---

## 16. Anti-padrões de fluxo

| Anti-padrão | Preferir |
|-------------|---------|
| Formulário URL+chave na primeira tela | ① boas-vindas |
| Pular assistente de mensagens | ⑦ obrigatório no 1º connect |
| Spinner sem etapas no provision | ④ checklist |
| QR pequeno no canto | QR protagonista |
| “Webhook configured successfully” | Silêncio / progresso humano |
| Encerrar em ⑥ sem ⑦ | Assistente logo após sucesso |
| Forçar editar templates antes de ativar | Seeds + assistente |

---

## 17. Checklist de implementação UX

- [ ] Rotas backoffice: hub → whatsapp → wizard / panel  
- [ ] Wizard steps ①–⑧ com state machine alinhada a status interno  
- [ ] Componentes: progress steps, QR stage, situation checklist, diagnostic list  
- [ ] Poll/SSE status durante QR  
- [ ] Microcopy revisada contra `25` §7  
- [ ] Confetes/sucesso discretos e acessíveis (respeitar `prefers-reduced-motion`)  
- [ ] Analytics interno opcional: funil ①→⑨ (sem PII)  
- [ ] Testes e2e felizes + QR expirado + chave inválida  

Detalhe de API: `07` na implementação; adapters: `27`.

---

## 18. Histórico de Revisões

| Versão | Data | Descrição |
|--------|------|-----------|
| 1.0 | Jul/2026 | **Aprovado** — wireflow ①–⑨; estados; QR; assistente; teste; painel; reconexão; erros; mobile |

---

> **Documento aprovado.** Próximo: `30-conexoes-roadmap.md` — Roadmap futuro das integrações.
