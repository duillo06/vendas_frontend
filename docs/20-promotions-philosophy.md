# 20 — Filosofia das Promoções

> **Documento:** Filosofia, UX conversacional e arquitetura expansível do módulo de promoções  
> **Produto:** Food Service *(nome comercial provisório)*  
> **Versão:** 1.1  
> **Status:** Aprovado  
> **Última atualização:** Julho/2026  
> **Depende de:** `00-product-philosophy.md`, `01-visao-do-produto.md`, `11-guia-ui-ux.md`, `18-domain-rules.md`  
> **Relacionados:** `08-regras-de-negocio.md`, `09-roadmap.md`, `13-checklist-v1.md`, `15-futuras-funcionalidades.md`, `19-future-ideas.md`, `21-marketing-engine.md`, `22-promotions-architecture.md`, `23-checklist-promotions-fase1.md`  
> **Natureza:** Filosofia + produto — **sem código na UI**. Nomes técnicos abaixo são **internos**.

---

## Sumário

1. [Por que este documento existe](#1-por-que-este-documento-existe)
2. [Princípio número 1](#2-princípio-número-1)
3. [O sistema como consultor de vendas](#3-o-sistema-como-consultor-de-vendas)
4. [Alinhamento com a filosofia do produto](#4-alinhamento-com-a-filosofia-do-produto)
5. [Objetivos comerciais (primeira conversa)](#5-objetivos-comerciais-primeira-conversa)
6. [Vocabulário: o que o usuário vê](#6-vocabulário-o-que-o-usuário-vê)
7. [Fluxos conversacionais](#7-fluxos-conversacionais)
8. [Indicadores automáticos de impacto](#8-indicadores-automáticos-de-impacto)
9. [Recorrência e janelas de tempo](#9-recorrência-e-janelas-de-tempo)
10. [Tipos de campanhas](#10-tipos-de-campanhas)
11. [Controle de exibição](#11-controle-de-exibição)
12. [Home viva (dinâmica)](#12-home-viva-dinâmica)
13. [Destaques e selos automáticos](#13-destaques-e-selos-automáticos)
14. [Arquitetura preparada para expansão](#14-arquitetura-preparada-para-expansão)
15. [Campanhas prontas](#15-campanhas-prontas)
16. [Calendário de campanhas](#16-calendário-de-campanhas)
17. [Sistema proativo (visão de longo prazo)](#17-sistema-proativo-visão-de-longo-prazo)
18. [Regras de UX](#18-regras-de-ux)
19. [Regras de negócio](#19-regras-de-negócio)
20. [Ideias futuras (resumo)](#20-ideias-futuras-resumo)
21. [Anti-padrões](#21-anti-padrões)
22. [Checklist antes de implementar](#22-checklist-antes-de-implementar)
23. [Histórico de Revisões](#23-histórico-de-revisões)

---

## 1. Por que este documento existe

Este é a **referência oficial** de qualquer evolução relacionada a promoções, campanhas, combos promocionais, frete grátis, brindes e destaques na Home/Cardápio.

Ele não descreve endpoints nem tabelas. Ele define **como pensamos promoções** — e como o comerciante as cria.

Visão estratégica mais ampla (marketing, cross-sell, recuperação de clientes): `21-marketing-engine.md`.  
Home como Motor Inteligente de Vitrine: `24-home-vitrine-inteligente.md`.

Se uma tela, um PR ou um doc técnico conflitar com este arquivo **na experiência do comerciante**, **este arquivo vence** (em conjunto com `00-product-philosophy.md`).

> Nosso sistema não é só gestão.  
> É uma ferramenta que **ajuda o comerciante a vender mais** — com o mínimo de tempo configurando.

Toda funcionalidade de promoção (e do produto em geral) responde:

> **Como isso ajuda o comerciante a vender mais, economizar tempo ou tomar melhores decisões?**

Se não contribuir → reavaliar.

---

## 2. Princípio número 1

O comerciante **não** quer “criar uma promoção”.

O comerciante quer **vender mais**.

Parece nuance. Muda tudo:

| Errado | Certo |
|--------|-------|
| “Qual o tipo da promoção?” | “O que você deseja aumentar hoje?” |
| Formulário com selects e regras | Conversa com perguntas simples |
| Comerciante entende desconto %, escopo, stacking | Sistema decide a estrutura interna |
| Tela de configuração | Consultor que orienta |

A complexidade fica **escondida na arquitetura**.  
O usuário só **responde perguntas**.

**Meta de tempo:** criar uma promoção em **menos de 1 minuto**.  
Se demorar mais → a UX precisa melhorar.

---

## 3. O sistema como consultor de vendas

Não basta um assistente de formulário.

O módulo deve **pensar como um consultor de vendas**:

1. Entende o **objetivo comercial** (resultado desejado).  
2. Sugere / escolhe a **estrutura de campanha** adequada.  
3. Conduz a conversa com **poucas perguntas**.  
4. Mostra **impacto** (desconto, economia — depois margem).  
5. No futuro, **vem até o comerciante** com sugestões (ver §17 e `21`).

O comerciante nunca precisa saber “qual tipo de promoção” o sistema usa por baixo.

---

## 4. Alinhamento com a filosofia do produto

| Princípio (`00`) | Como promoções aplicam |
|------------------|------------------------|
| Regra de Ouro | Dono de pizzaria pequena cria oferta só respondendo perguntas |
| Conversação > configuração | Assistente; nunca CRUD de “PromotionRule” |
| Esconder arquitetura | Tipo interno, stacking, escopo — invisíveis |
| Sistema trabalha para o comerciante | Selos, % e “economize” calculados sozinhos |
| Confiança | Resumo claro antes de publicar; datas e onde aparece |
| Preparação para IA | Hooks para sugestões e campanhas prontas |

**Regra de Ouro (promoções):**

> Um dono de lanchonete, sem conhecimento técnico, conseguiria criar uma oferta em menos de um minuto apenas respondendo perguntas simples?

| Resposta | Ação |
|----------|------|
| **Sim** | Pode seguir |
| **Não** | Redesenhar antes de implementar |

---

## 5. Objetivos comerciais (primeira conversa)

A **primeira pergunta** do assistente é de **resultado comercial** — não de tipo técnico, e não de “mecanismo” (combo, %…).

> **O que você deseja aumentar hoje?**

Cartões grandes, um toque. Exemplos:

| Emoji | Objetivo comercial (UI) | Direção interna típica (invisível) |
|-------|-------------------------|-------------------------------------|
| 📈 | Aumentar as vendas | Oferta em produto / campanha do dia |
| 💰 | Aumentar o ticket médio | Combo, brinde a partir de valor, frete grátis com limiar |
| 👥 | Atrair novos clientes | Oferta de boas-vindas / destaque forte (futuro: 1ª compra) |
| 🔁 | Trazer clientes antigos de volta | Campanha de reativação (futuro) |
| 🍔 | Vender mais hambúrgueres | Preço promocional / oferta na categoria |
| 🍕 | Vender mais pizzas | Idem (categoria / produtos) |
| 🥤 | Vender mais bebidas | Idem + cross-sell (ver `21`) |
| 🍰 | Vender mais sobremesas | Idem |
| 👨‍👩‍👧 | Incentivar combos | Fluxo de combo |
| 🚚 | Aumentar pedidos acima de determinado valor | Frete grátis / brinde / desconto no pedido com limiar |

### 5.1 Segunda camada (quando ajudar)

Depois do objetivo comercial, o sistema pode **sugerir** o caminho (ainda em linguagem humana), por exemplo:

```text
Para aumentar o ticket médio, costuma funcionar bem:
○ Criar um combo
○ Oferecer frete grátis a partir de um valor
○ Dar um brinde a partir de um valor
```

Ou ir direto às perguntas do mecanismo escolhido — **sem** expor nomes técnicos.

Mecanismos de exemplo (UI, se precisarem aparecer como cartões secundários):

| Emoji | Caminho (UI) | Interno |
|-------|--------------|---------|
| 🔥 | Vender um produto por um preço menor | Preço promocional |
| 🍔 | Criar um combo | Bundle |
| 🎁 | Oferecer um brinde | Brinde por limiar |
| 🚚 | Oferecer frete grátis | Frete grátis |
| 💰 | Desconto no pedido inteiro | Order-level |
| 📅 | Oferta do dia | Campanha curta |
| 🎉 | Campanha personalizada | Fluxo aberto guiado |

O comerciante pensa em **resultado**.  
O sistema escolhe a **estrutura**.

---

## 6. Vocabulário: o que o usuário vê

| O comerciante vê / fala | O sistema **nunca** mostra |
|-------------------------|----------------------------|
| “Aumentar o ticket” | `order_threshold`, `AOV` |
| “Vender mais barato” | `discount_type`, `PromotionRule` |
| “Combo” | `bundle`, `stacking policy` |
| “Brinde a partir de R$ 80” | `threshold_reward` |
| “Toda terça” | `rrule`, `cron`, `recurrence_policy` |
| “Destacar na Home” | `placement_slots` |
| “Economize R$ X” / “−15%” | Cálculo interno de delta |
| “Termina hoje” | Job de expiração |

Copy do backoffice: linguagem de **venda**, não de ERP.

---

## 7. Fluxos conversacionais

Um passo por vez. Resumo no fim. Sem dezenas de campos na mesma tela.

### 7.1 Produto em promoção

```text
O que você deseja aumentar hoje?
→ Vender mais pizzas   (ou: Aumentar as vendas)

Qual produto ficará em promoção?
↓
Qual será o novo preço?
  → feedback ao vivo: −15% · Economize R$ 11
↓
Esta promoção acontece…?
  ○ Apenas uma vez  ○ Todos os dias  ○ Dias da semana…
↓
(quando for o caso) Quando começa / termina? Ou quais dias / horários?
↓
Onde deseja mostrar esta promoção?
  ☑ Home   ☑ Cardápio   ☑ Página do produto
  ☐ Apenas pelo link   ☐ Banner principal
↓
Pronto. Promoção criada.
```

### 7.2 Combo

```text
→ Incentivar combos  (ou escolha direta do caminho)

O que fará parte do combo?
  (ex.: Hambúrguer, Batata, Refrigerante)
↓
Qual será o preço do combo?
↓
Esta promoção acontece…?
↓
Onde deseja mostrar?
↓
Pronto.
```

### 7.3 Brinde

```text
A partir de qual valor?
  R$ 80
↓
Qual será o brinde?
↓
Recorrência / até quando?
↓
Onde deseja mostrar?
↓
Pronto.
```

### 7.4 Frete grátis

```text
A partir de qual valor?
↓
Vale para qual região?   (ou “toda a área de entrega”)
↓
Recorrência / até quando?
↓
Onde deseja mostrar?
↓
Pronto.
```

### 7.5 Desconto no pedido / oferta do dia / campanha

Mesmo padrão: **objetivo comercial** → caminho sugerido → poucas perguntas → recorrência → onde mostrar → pronto.

Campanha personalizada: ainda é conversa; só abre perguntas extras **quando necessário**.

---

## 8. Indicadores automáticos de impacto

Durante a criação, o sistema dá **feedback inteligente** — sem o comerciante calcular nada.

Exemplo:

```text
Pizza Calabresa
De R$ 70
Por R$ 59

• Desconto de 15%
• Economia para o cliente de R$ 11
```

Regras:

- Calcular **%** e **economia em R$** a partir do De → Por.  
- Mostrar no assistente **e** no card do cliente (quando fizer sentido).  
- Não pedir “informe o percentual” se o preço promocional já foi informado (e vice-versa no caminho feliz).

### 8.1 Futuro: impacto na margem

Quando houver **custo do produto** (cadastro futuro):

- Estimar impacto na margem (“esta oferta reduz a margem em X”).  
- Alertar com tom humano se o desconto for agressivo demais.  

**Não** implementar no primeiro corte. Arquitetura e copy devem **permitir** esse indicador depois. Detalhe estratégico: `21-marketing-engine.md`.

---

## 9. Recorrência e janelas de tempo

Cenário comum no food service: Terça da Pizza, Quarta do Hambúrguer, Happy Hour, Festival do Pastel, Combo de Sexta.

**Toda** promoção deve poder responder:

> **Esta promoção acontece…**

| Opção (UI) | Intenção |
|------------|----------|
| ○ Apenas uma vez | Janela início → fim |
| ○ Todos os dias | Dentro de um período ou contínuo até desligar |
| ○ Em dias específicos da semana | Ex.: toda terça |
| ○ Apenas em determinados horários | Happy hour (pode combinar com dia) |
| ○ Em datas comemorativas | Natal, Dia dos Namorados… (ver campanhas prontas) |

Essa capacidade faz parte da **arquitetura desde o início** — mesmo que o MVP entregue só “apenas uma vez” + “dias da semana” simples.  
O modelo interno **não** nasce só com `starts_at` / `ends_at` engessados sem recorrência.

---

## 10. Tipos de campanhas

### 10.1 Escopo da primeira entrega (MVP de promoções)

1. Objetivo comercial → caminho conversacional  
2. Produto com preço menor + indicadores De/Por  
3. Combo  
4. Frete grátis (limiar simples)  
5. Brinde a partir de valor  
6. Destaque na Home / Cardápio / produto  
7. Recorrência básica (uma vez + dias da semana)  

Desconto no pedido e “oferta do dia” entram cedo se não complicarem o assistente.

### 10.2 Famílias internas (time técnico)

| Família | Exemplos |
|---------|----------|
| Preço de produto | Oferta, categoria em promoção |
| Bundle / combo | Combo família |
| Pedido (order-level) | Desconto, frete grátis, brinde |
| Cupom | Código (roadmap V1 em `13` / `08`) |
| Audiência / fidelidade | Cliente novo, reativação (futuro) |
| Calendário / sazonal | Black Friday, Natal |
| Janela temporal | Happy hour, dia da semana |
| Escopo | Categoria, região, cliente |

Não implementar tudo agora. **Modelar para crescer.**

---

## 11. Controle de exibição

| Opção (UI) | Intenção |
|------------|----------|
| ☑ Home | Carrossel / faixa de destaques |
| ☑ Cardápio | Listagem / categorias |
| ☑ Página do produto | Selo e preço na ficha |
| ☐ Apenas pelo link | Sem empurrar na Home |
| ☐ Banner principal | Slot consciente — não poluir |

A promoção **assina** a experiência — **não** pinta a página inteira.

---

## 12. Home viva (dinâmica)

A Home **nunca** deve ser estática.

Ela reflete o **momento do estabelecimento**.

```text
Existe promoção ativa?
  → Mostrar faixa / carrossel de promoções

Não existem promoções?
  → Enfatizar mais vendidos (e outros blocos úteis)

Existe campanha sazonal / Black Friday?
  → Destacar essa campanha

Existe lançamento?
  → Mostrar novidades / lançamentos
```

### 12.1 Estrutura base (ordem sugerida)

```text
Banner principal da loja
    ↓
Promoções em destaque     ← só se houver o que mostrar
    ↓
Mais vendidos
    ↓
Categorias
    ↓
Produtos
    ↓
Novidades
    ↓
Combos
    ↓
Bebidas / Sobremesas (conforme cardápio)
    ↓
Rodapé
```

Blocos **aparecem ou somem** conforme dados reais. Ordem pode adaptar-se ao segmento (pizzaria vs açaí), mas a filosofia é: **Home que vende o momento**, não um template morto.

### 12.2 Cards de promoção

- Carrossel elegante, cards **menores**.  
- Sem banners enormes competindo com o cardápio.  
- CTA **Adicionar** quando fizer sentido.

```text
🔥 Pizza Calabresa
De R$ 70 · Por R$ 59
Economize R$ 11
[ Adicionar ]
```

---

## 13. Destaques e selos automáticos

O comerciante **não** cria selos.

| Selo (exemplo) | Quando |
|----------------|--------|
| 🔥 Oferta | Preço promocional ativo |
| 💥 Promoção | Campanha em destaque |
| 🏷️ −20% | % calculado |
| 💸 Economize R$ 15 | Delta De → Por |
| ⏰ Termina hoje | Expira hoje |
| ⌛ Últimas horas | Janela curta |
| 🎉 Lançamento | Novidade |

---

## 14. Arquitetura preparada para expansão

### 14.1 Campanha (conceito interno)

- **Objetivo comercial** (1º passo da conversa)  
- **Mecanismo** (como o benefício se aplica)  
- **Condições** (valor mínimo, audiência, região…)  
- **Recorrência / janela** (uma vez, dias, horários, datas)  
- **Superfícies** (onde mostrar)  

Extensões futuras **não** exigem novo paradigma de UX — só novas perguntas no assistente.

### 14.2 Runtime

Preço e elegibilidade **no servidor**.  
Storefront só exibe o resolvido pela API.

---

## 15. Campanhas prontas

**Futuro** (registrar agora; não bloquear o MVP).

Biblioteca de campanhas pré-configuradas. Ao escolher, o sistema **já conduz** a conversa; o comerciante só ajusta.

Exemplos:

| Campanha pronta | Ideia |
|-----------------|-------|
| 🍕 Terça da Pizza | Recorrência terça + produtos/categoria |
| 🍔 Festival do Hambúrguer | Oferta na categoria |
| 🥤 Refrigerante em Dobro | Mecânica leve de “leve 2” (quando existir) |
| 👨‍👩‍👧 Combo Família | Fluxo de combo |
| 🎁 Compre e Ganhe | Brinde |
| 🚚 Frete Grátis | Limiar de frete |
| ❤️ Dia dos Namorados | Sazonal |
| 🎄 Natal | Sazonal |
| ⚫ Black Friday | Sazonal agressiva |
| 🎉 Aniversário da Loja | Data do tenant |

Visão completa: `21-marketing-engine.md`.

---

## 16. Calendário de campanhas

**Futuro.** Visão simples para o comerciante ver o mês:

```text
Julho
SEG  TER  QUA  QUI  SEX  SAB  DOM
     🔥        🍔        🎁
  Terça da   Quinta do  Sábado
   Pizza    Hambúrguer  Especial
```

Objetivo: planejar e enxergar campanhas futuras **sem** planilha.  
Não implementar no primeiro corte. Modelo de recorrência (§9) já prepara os dados.

---

## 17. Sistema proativo (visão de longo prazo)

Hoje: o comerciante abre o módulo de promoções.

Amanhã: o **sistema vem até ele**.

Exemplos:

```text
“Hoje é segunda-feira e historicamente costuma ser um dia de menor movimento.
Deseja criar uma promoção em menos de 1 minuto?”
```

```text
“Seu produto mais vendido está há 30 dias sem promoção.”
```

```text
“Você ainda não possui nenhum combo cadastrado.”
```

```text
“Seus clientes normalmente pedem refrigerante junto com hambúrguer.
Deseja criar um combo?”
```

```text
“Hoje é véspera do Dia dos Pais.
Deseja ativar uma campanha pronta?”
```

Isso transforma o produto de **ERP** em **consultor de vendas**.  
Detalhamento e priorização: `21-marketing-engine.md`. Hooks naturais: Home do painel, pós-login, fim do cadastro de cardápio.

**Não** implementar no MVP de promoções — mas **não** construir telas que impeçam esse futuro.

---

## 18. Regras de UX

1. **Objetivo comercial primeiro** — nunca tipo técnico.  
2. **Cartões grandes** na escolha.  
3. **Uma pergunta por passo** (agrupar só o óbvio: início + fim).  
4. **&lt; 1 minuto** no caminho feliz.  
5. **Indicadores ao vivo** (%, economize).  
6. **Perguntar recorrência** (“esta promoção acontece…”).  
7. **Resumo humano** antes de publicar.  
8. **Selos automáticos**.  
9. **Home viva** — blocos conforme o momento.  
10. **Mobile first**; preview “como o cliente vê”.  
11. **Tom de consultor** — orienta, não examina.

---

## 19. Regras de negócio

1. **Preço promocional &lt; referência** no De/Por.  
2. **Janela / recorrência** respeitada no checkout.  
3. **Servidor calcula** desconto, frete, brinde e indicadores.  
4. **Estoque / disponibilidade** — não prometer o que não tem.  
5. **Uma oferta clara** por produto no caminho feliz.  
6. **Frete grátis** só com entrega habilitada e critérios ok.  
7. **Combos** com preço fechado claro ao cliente.  
8. **“Apenas pelo link”** fora do carrossel da Home.  
9. **Desligar** campanha em um toque + confirmação curta.  
10. **Multi-tenant** isolado.  
11. Conflitos entre campanhas: regra simples + mensagem humana (sem tela de stacking no MVP).

---

## 20. Ideias futuras (resumo)

Espelhar captura rápida em `19-future-ideas.md`. Visão de marketing em `21`.

| Ideia | Onde |
|-------|------|
| Sugestões proativas | §17, `21` |
| Campanhas prontas / sazonais | §15, `21` |
| Calendário visual | §16 |
| Margem / custo do produto | §8.1 |
| Relatório “esta oferta gerou X pedidos” | `21` |
| Cross-sell / upsell / recuperação | `21` |
| A/B de copy do card | Futuro |

---

## 21. Anti-padrões

| Evitar | Por quê |
|--------|---------|
| Começar por “tipo: percent / fixed” | Jargão; mata o consultor |
| Formulário de 20 campos | Viola Regra de Ouro |
| Home estática igual o ano todo | Perde o diferencial |
| Banners gigantes de promoção | Polui |
| Selos manuais | Trabalho do sistema |
| Ignorar recorrência no modelo | Terça da Pizza vira gambiarra |
| Exigir % e preço ao mesmo tempo | Calcule um do outro |
| Popup bloqueando o pedido | Anti-padrão `11` / `01` |
| Fidelidade/cashback no 1º corte | Fora do escopo; só preparar |

---

## 22. Checklist antes de implementar

- [ ] Primeira pergunta é **objetivo comercial**?  
- [ ] Fluxo conversacional (&lt; 1 min)?  
- [ ] Indicadores % / economize automáticos?  
- [ ] Modelo de **recorrência** previsto (mesmo se UI MVP for parcial)?  
- [ ] Home **viva** (blocos condicionais)?  
- [ ] Onde mostrar nas perguntas?  
- [ ] Selos automáticos?  
- [ ] Campanhas prontas / calendário / proativo **documentados**, não forçados no MVP?  
- [ ] Copy passa no teste da pizzaria pequena?  
- [ ] Servidor é fonte da verdade de preço/elegibilidade?

Na implementação, atualizar: `03`, `07`, `08`, `11`, checklist da sprint.  
Estratégia de marketing: seguir `21-marketing-engine.md`.

---

## 23. Histórico de Revisões

| Versão | Data | Descrição |
|--------|------|-----------|
| 1.1 | Jul/2026 | **Aprovado** — consultor de vendas; objetivos comerciais; impacto; recorrência; Home viva; campanhas prontas; calendário; sistema proativo; link `21` |
| 1.0 | Jul/2026 | Criação — filosofia, fluxos, Home, selos, arquitetura expansível |

---

> **Documento aprovado.** Referência oficial do módulo de promoções.  
> Próximo: modelagem de arquitetura + recorte MVP, **sempre** conversacional. Visão de marketing: `21-marketing-engine.md`.
