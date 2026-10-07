# 35 — Pedidos na Mesa (Salão)

> **Documento:** Filosofia, fluxos e regras de pedidos no salão (`dine_in`)  
> **Produto:** Food Service *(nome comercial provisório)*  
> **Versão:** 1.0  
> **Status:** Aprovado  
> **Última atualização:** Outubro/2026  
> **Depende de:** `00-product-philosophy.md`, `01-visao-do-produto.md`, `11-guia-ui-ux.md`  
> **Relacionados:** `03-modelagem-do-banco.md`, `07-api.md`, `08-regras-de-negocio.md`, `09-roadmap.md` (Sprint 21), `14-checklist-v2.md`  
> **Natureza:** Filosofia + produto — **sem código na UI**. Nomes técnicos abaixo são **internos**.

---

## Sumário

1. [Por que este documento existe](#1-por-que-este-documento-existe)
2. [Visão](#2-visão)
3. [O que é (e o que não é)](#3-o-que-é-e-o-que-não-é)
4. [Vocabulário](#4-vocabulário)
5. [Princípios](#5-princípios)
6. [Ativação no estabelecimento](#6-ativação-no-estabelecimento)
7. [Fluxo do cliente (storefront)](#7-fluxo-do-cliente-storefront)
8. [QR Code da mesa](#8-qr-code-da-mesa)
9. [Painel (backoffice)](#9-painel-backoffice)
10. [Status do pedido](#10-status-do-pedido)
11. [Pagamento](#11-pagamento)
12. [Cadastro de mesas](#12-cadastro-de-mesas)
13. [Regras de negócio](#13-regras-de-negócio)
14. [Modelo mental de dados](#14-modelo-mental-de-dados)
15. [Fora de escopo (fase 1)](#15-fora-de-escopo-fase-1)
16. [Anti-padrões](#16-anti-padrões)
17. [Alinhamento com roadmap](#17-alinhamento-com-roadmap)
18. [Checklist antes de implementar](#18-checklist-antes-de-implementar)
19. [Histórico de Revisões](#19-histórico-de-revisões)

---

## 1. Por que este documento existe

O Food Service já vende por **entrega** e **retirada**.  
A lanchonete também precisa atender quem **está sentado no salão**.

Este documento define **como pensamos pedidos na mesa** — experiência do cliente, visão no painel e regras — **antes** de detalhar endpoints ou telas finais.

Se uma tela, um PR ou um doc técnico conflitar com este arquivo **na experiência**, **este arquivo vence** (junto com `00-product-philosophy.md`).

> O cliente pede pelo celular.  
> A cozinha prepara.  
> O garçom leva até a mesa.  
> O comerciante vê tudo no mesmo painel — junto ou separado, como preferir.

---

## 2. Visão

Não estamos criando “um segundo sistema de pedidos”.

Estamos adicionando um **canal de atendimento no salão**, no mesmo pedido que o comerciante já conhece.

| Hoje (MVP/V1) | Com pedidos na mesa |
|---------------|---------------------|
| Entrega e retirada | + consumo no local |
| Endereço / balcão | Número da mesa |
| Fila única de pedidos | Mesma fila, com filtro por canal |
| Taxa de entrega | Sem taxa de entrega |

A meta de produto:

> Um dono de lanchonete consegue ligar “pedido na mesa”, cadastrar as mesas e receber o primeiro pedido do salão **só respondendo perguntas simples** — sem aprender um módulo novo com nome técnico.

---

## 3. O que é (e o que não é)

### 3.1 É

- Pedido feito pelo cliente **no celular**, enquanto está no estabelecimento
- Identificação da **mesa** (preferencialmente por QR)
- Pedido aparece no **painel** com destaque da mesa
- Equipe confirma → prepara → avisa quando está pronto → marca concluído quando entregue na mesa
- Visão no painel: **Tudo** · **Entrega** · **Retirada** · **Mesas** (nomes amigáveis)

### 3.2 Não é

- Um ERP de restaurante completo (comandas infinitas, split de conta, mapa de salão drag-and-drop)
- Substituto do garçom (ele continua levando o prato)
- Mistura automática com delivery sem filtro — o operador **escolhe** ver junto ou separado
- PDV de balcão (isso é fluxo paralelo na Sprint 21; ver §17)

> **Interno:** um único modelo `orders` com `delivery_type = dine_in`.  
> **UI:** “Pedido na mesa” / “Mesas” — nunca “dine_in” ou “módulo fulfillment”.

---

## 4. Vocabulário

| O comerciante / cliente vê | O sistema usa (interno) |
|----------------------------|-------------------------|
| Pedido na mesa / No salão | `delivery_type = dine_in` |
| Mesa 12 | `dining_tables` + `table_number` / `table_id` |
| QR da mesa | `qr_token` |
| Aceita pedido na mesa? | `accepts_dine_in` |
| Entrega · Retirada · Mesas · Tudo | filtro por `delivery_type` (+ “all”) |
| Pronto para a mesa | status `ready` (mesmo enum; copy diferente) |
| Entregue na mesa | status `completed` |

Nunca exibir na UI: `dine_in`, `fulfillment`, `channel`, `QR token`, `FK`.

---

## 5. Princípios

### 5.1 Um pedido, canais diferentes

Delivery, retirada e mesa compartilham cardápio, itens, preços e painel.  
O que muda: **contexto** (endereço vs. mesa), **taxa**, **copy de status** e **filtro na lista**.

### 5.2 Separar na cabeça, unir quando quiser

O operador precisa:

1. Ver **só mesas** no rush do salão  
2. Ver **só entrega** quando o entregador liga  
3. Ver **tudo** no fim do expediente / visão geral  

Isso é **filtro de visualização**, não dois bancos de pedidos.

### 5.3 Mesa sempre visível

Enquanto o pedido for do salão, o **número da mesa** é o sinal principal — maior que o nome do cliente na listagem do painel.

### 5.4 Regra de Ouro

> “Qual mesa você está?”  
> “O que vai pedir?”  
> “Como prefere pagar?”  

Sem jargão. Sem “selecione o fulfillment channel”.

### 5.5 QR primeiro; digitação como fallback

Caminho feliz: cliente aponta a câmera para o QR colado na mesa.  
Fallback: escolher “Estou na loja” e informar o número da mesa (quando a loja permitir).

---

## 6. Ativação no estabelecimento

Pergunta no painel (Settings / assistente):

> **Aceita pedidos nas mesas?**  
> Sim / Não

| Resposta | Efeito |
|----------|--------|
| Não (padrão) | Storefront não oferece “Estou na loja”; QRs inativos |
| Sim | Exige ao menos **1 mesa ativa** antes de publicar o canal; aparece opção no storefront |

Perguntas seguintes (assistente curto):

1. Quantas mesas? (ou cadastrar uma a uma)  
2. Quer gerar os QRs para imprimir?  
3. Pagamento na mesa: dinheiro / PIX / cartão (reutiliza formas já aceitas, com labels adequados)

Sem tela de “módulo avançado”. Um interruptor + lista de mesas.

---

## 7. Fluxo do cliente (storefront)

### 7.1 Entrada por QR (caminho feliz)

```text
Cliente escaneia QR da Mesa 12
        ↓
Abre cardápio já no contexto “Mesa 12”
        ↓
Monta pedido (mesmo cardápio do delivery)
        ↓
Checkout sem endereço / sem taxa de entrega
        ↓
Confirma → “Pedido enviado · Mesa 12”
        ↓
Acompanha status (“Em preparo”, “Saindo para a mesa”…)
```

Badge persistente no topo: **Mesa 12** — não pode sumir no meio do fluxo.

### 7.2 Entrada pelo site (sem QR)

Só se `accepts_dine_in` e houver mesas ativas:

```text
Home / início do pedido
        ↓
“Como prefere receber?”
  ○ Entrega
  ○ Retirada no balcão
  ○ Estou na loja (mesa)
        ↓
“Qual é o número da sua mesa?”
        ↓
Cardápio + checkout (igual ao QR)
```

Validação: mesa deve existir e estar **ativa**. Número inválido → mensagem clara: “Não encontramos essa mesa. Confira o número ou peça ajuda ao atendimento.”

### 7.3 O que o checkout NÃO pede (mesa)

- Endereço de entrega  
- Taxa de entrega  
- Tempo estimado de entrega na rua  

### 7.4 Checkout express da mesa

Com contexto de mesa (QR ou número confirmado), o checkout **pula** dados pessoais, canal e pagamento:

- Sem WhatsApp / e-mail  
- Sem “como prefere receber?” (já é mesa)  
- Sem forma de pagamento → `pay_at_venue` (paga no local; operador marca pago)  
- Nome padrão: `Mesa N`  
- Só revisão dos itens + observação opcional + **Enviar pedido**

### 7.5 Após o pedido

Tela de acompanhamento com:

- Número do pedido  
- **Mesa** em destaque  
- Status em linguagem de salão (ver §10)  
- Sem mapa de entregador  

---

## 8. QR Code da mesa

### 8.1 Comportamento

| Regra | Detalhe |
|-------|---------|
| Um QR por mesa | Token único, opaco, não adivinhável |
| URL pública | Ex.: `{tenant}.…/mesa/{token}` — abre contexto da mesa |
| Mesa inativa / inexistente | Não abre cardápio; mensagem amigável |
| Impressão | Painel gera PDF/folha com QR + “Mesa N” legível |

### 8.2 Segurança de produto (simples)

- Token não é o número da mesa (número 12 ≠ token)  
- Trocar QR (regenerar) invalida o anterior  
- Pedido sempre amarra `tenant` + mesa válida  

### 8.3 UX do QR impresso

Texto sugerido no cartão impresso:

> **Mesa 12**  
> Aponte a câmera do celular e peça por aqui.

Sem URL feia em destaque; o QR basta.

---

## 9. Painel (backoffice)

### 9.1 Lista de pedidos — filtros

Controle primário (chips ou abas):

| Filtro (UI) | Interno |
|-------------|---------|
| **Tudo** | sem filtro de tipo |
| **Entrega** | `delivery` |
| **Retirada** | `pickup` |
| **Mesas** | `dine_in` |

Padrão sugerido no rush: lembrar a última escolha do operador (local).  
Contadores opcionais por filtro (ex.: Mesas · 3) quando houver pedidos ativos.

### 9.2 Card do pedido na mesa

Na listagem e no detalhe, prioridade visual:

1. **Mesa 12** (hero do card)  
2. Número do pedido  
3. Itens / total  
4. Nome do cliente  
5. Status + ações  

Badge de canal: “Mesa” (cor/ícone distintos de “Entrega” e “Retirada”) — sem competir com status do pedido.

### 9.3 Som / destaque

Novos pedidos de mesa entram na mesma mecânica de alerta do painel (toast / som), com copy:

> Novo pedido · Mesa 12

### 9.4 Visão “só salão”

Filtro **Mesas** = fila operacional do garçom/caixa do salão.  
Não exige tela separada no menu lateral na fase 1 — o filtro resolve.  
(Menu “Mesas” no nav = **cadastro de mesas / QRs**, não a fila de pedidos.)

### 9.5 Cozinha

Mesma fila de preparo; item/pedido de mesa pode mostrar “Mesa 12” para o montador saber a prioridade de saída.  
Sem workflow paralelo de KDS na fase 1.

---

## 10. Status do pedido

Fluxo interno (já previsto em `08`):

```text
pending → confirmed → preparing → ready → completed
```

`out_for_delivery` **não** aparece para pedidos de mesa.

### 10.1 Copy por status (salão)

| Status | Cliente vê | Painel / ação típica |
|--------|------------|----------------------|
| `pending` | Pedido enviado | Confirmar |
| `confirmed` | Pedido confirmado | Ir para preparo |
| `preparing` | Em preparo | Marcar pronto |
| `ready` | Saiu para a mesa / A caminho da mesa | Garçom leva → Concluir |
| `completed` | Pedido entregue | — |
| `cancelled` | Pedido cancelado | Motivo interno |

Ajuste fino de copy pode viver no i18n; a ideia é **nunca** dizer “saiu para entrega” em pedido de mesa.

---

## 11. Pagamento

### 11.1 Fase 1 (alinhada ao MVP de pagamento manual)

Pagamento **não** é processado pelo sistema (igual delivery manual):

| Forma | Copy no salão |
|-------|----------------|
| Dinheiro | Pagar na mesa / no caixa |
| PIX | PIX no caixa / na mesa |
| Cartão | Maquininha na mesa / no caixa |

Operador marca **pago** no painel quando receber.

### 11.2 Regras

- `delivery_fee = 0` sempre em `dine_in`  
- Formas aceitas: interseção com `payment_methods` do settings (sem inventar método só de mesa na fase 1)  
- Gateway online (Mercado Pago) pode entrar depois, reutilizando o mesmo pedido — fora do núcleo deste doc

### 11.3 Conta da mesa (fase 1)

**Um pedido = uma comanda simples.**  
Cliente pode fazer **outro** pedido depois (segundo pedido na mesma mesa).  
Não há na fase 1: fechar conta unificada, transferir itens entre mesas, dividir conta.

---

## 12. Cadastro de mesas

Tela no backoffice: **Mesas**

| Ação | Comportamento |
|------|----------------|
| Adicionar mesa | Número (ex.: 1, 2, 12A) + ativa |
| Editar | Número / capacidade opcional / ativa |
| Desativar | Para de aceitar pedidos; QR mostra indisponível |
| Gerar / baixar QR | Por mesa ou lote para impressão |
| Regenerar QR | Invalida token antigo |

Número da mesa: único por estabelecimento, legível para o salão.

Pergunta guiada no primeiro uso:

> “Quantas mesas você tem?” → cria 1..N sequenciais → “Baixar QRs”

---

## 13. Regras de negócio

IDs novos (**DM** = Dine / Mesa). Detalhamento técnico espelha em `08` após aprovação.

| ID | Regra |
|----|-------|
| DM-01 | Pedido na mesa só se `accepts_dine_in = true` |
| DM-02 | Pedido na mesa exige mesa **ativa** do mesmo tenant |
| DM-03 | `delivery_type = dine_in` ⇒ `delivery_fee = 0` e sem endereço de entrega |
| DM-04 | Snapshot: gravar número da mesa no pedido (mesmo se a mesa for renomeada depois) |
| DM-05 | Fluxo de status: pending → confirmed → preparing → ready → completed (sem `out_for_delivery`) |
| DM-06 | Transição para `out_for_delivery` é inválida em `dine_in` |
| DM-07 | QR / token inválido ou mesa inativa ⇒ não cria pedido |
| DM-08 | Listagem admin filtra por tipo: all / delivery / pickup / dine_in |
| DM-09 | Storefront em contexto de mesa não oferece troca silenciosa para delivery no mesmo carrinho (limpar ou confirmar troca de canal) |
| DM-10 | Fonte do pedido: `storefront` (QR ou escolha “Estou na loja”); PDV balcão é outro fluxo (`source = backoffice`) |
| DM-11 | Permissões: gerir mesas em settings/mesas; status de pedido nas permissões já existentes de orders |
| DM-12 | Pedidos de mesa entram nas métricas “por tipo” (relatórios V1/V2) |

---

## 14. Modelo mental de dados

Alinha com `14-checklist-v2.md` — aqui só o mapa de produto:

```text
company_settings.accepts_dine_in
        ↓
dining_tables (número, ativa, qr_token, …)
        ↓
orders.delivery_type = dine_in
orders.table_id (opcional FK)
orders.+ snapshot mesa (número legível)
```

**Interno:** não criar app/pedido paralelo. Expandir `orders` + tabela `dining_tables`.

---

## 15. Fora de escopo (fase 1)

Adiar sem bloquear a fase 1:

| Ideia | Quando pensar |
|-------|----------------|
| Mapa visual do salão (drag mesas) | V3+ |
| Comanda aberta com vários pedidos unidos | Pós fase 1 |
| Divisão de conta / várias formas no mesmo pedido | Pós |
| Chamado de garçom pelo app | Futuro |
| Cardápio diferente só para salão | Futuro (mesmo cardápio na fase 1) |
| Reserva de mesa | Fora |
| Tempo médio “da mesa” com analytics avançado | Relatórios depois |
| Totem / autoatendimento físico | `19` / hardware |

PDV de **balcão** (operador cria pedido) é Sprint 21 **irmão**, mas não é o fluxo do cliente na mesa — não misturar nas mesmas telas do storefront.

---

## 16. Anti-padrões

| Evitar | Preferir |
|--------|----------|
| Menu “Módulo Dine-in” | “Mesas” + filtro na lista de pedidos |
| Dois cadastros de cardápio | Um cardápio, canais diferentes |
| Pedido de mesa sem número visível | Mesa como sinal principal |
| “Saiu para entrega” no salão | “A caminho da mesa” / “Pronto” |
| Exigir endereço “só porque o form é o mesmo” | Checkout específico por canal |
| Forçar ver tudo misturado sem filtro | Tudo / Entrega / Retirada / Mesas |
| QR = número da mesa em texto puro na URL | Token opaco |

---

## 17. Alinhamento com roadmap

| Artefato | Ligação |
|----------|---------|
| `09-roadmap.md` Sprint 21 | PDV + QR mesa + pedido dine-in |
| `14-checklist-v2.md` | §6.2 `dining_tables`, §7.5, §8.9, §9.7, V2-6 |
| `07-api.md` | `DeliveryType.dine_in` *(futuro → ativo)* |
| `08` §9.5 | Fluxo de status dine_in |
| `03` | `accepts_dine_in`, enum `dine_in` |

**Ordem sugerida de implementação (após aprovação deste doc):**

1. Modelagem `dining_tables` + `orders.table_id` / snapshot  
2. Admin CRUD mesas + QR  
3. Storefront `/mesa/{token}` + checkout dine_in  
4. Filtros no painel + copy de status  
5. Entrada “Estou na loja” sem QR (fallback)  
6. (Paralelo ou logo após) PDV balcão — fora do núcleo deste doc

---

## 18. Checklist antes de implementar

- [x] Este documento aprovado  
- [x] Atualizar `03` / `07` / `08` com DM-01… e endpoints de mesas  
- [x] Backend + frontend Sprint 21 (mesas / QR / dine_in / filtros) — Out/2026  
- [ ] Confirmar copy final dos filtros e status com a filosofia `00`  
- [ ] Critérios V2-6 do checklist: pedido real via QR  
- [ ] Teste UX: dono cadastra 5 mesas e imprime QRs sem ajuda técnica  

---

## 19. Histórico de Revisões

| Versão | Data | Descrição |
|--------|------|-----------|
| 1.0 | Out/2026 | Criação — filosofia, fluxos cliente/painel, regras DM, alinhamento Sprint 21 — aprovado |

---

> **Documento aprovado.** Próximo na série técnica: espelho em `03` / `07` / `08` (feito). Implementação: Sprint 21 (`14-checklist-v2.md`).
