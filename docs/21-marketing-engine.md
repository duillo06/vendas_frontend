# 21 — Marketing Engine (Visão de Produto)

> **Documento:** Visão estratégica de marketing na plataforma — vender mais, com menos esforço  
> **Produto:** Food Service *(nome comercial provisório)*  
> **Versão:** 1.0  
> **Status:** Aprovado  
> **Última atualização:** Julho/2026  
> **Depende de:** `00-product-philosophy.md`, `20-promotions-philosophy.md`  
> **Relacionados:** `01-visao-do-produto.md`, `11-guia-ui-ux.md`, `15-futuras-funcionalidades.md`, `19-future-ideas.md`  
> **Natureza:** Documento de **produto** — não técnico. Sem endpoints, sem tabelas, sem jargão na UI.

---

## Sumário

1. [Por que este documento existe](#1-por-que-este-documento-existe)
2. [Filosofia do Marketing Engine](#2-filosofia-do-marketing-engine)
3. [A pergunta que governa tudo](#3-a-pergunta-que-governa-tudo)
4. [Objetivos comerciais](#4-objetivos-comerciais)
5. [Camadas do Marketing Engine](#5-camadas-do-marketing-engine)
6. [Promoções e campanhas](#6-promoções-e-campanhas)
7. [Campanhas prontas e datas comemorativas](#7-campanhas-prontas-e-datas-comemorativas)
8. [Promoções recorrentes](#8-promoções-recorrentes)
9. [Home viva e superfícies de venda](#9-home-viva-e-superfícies-de-venda)
10. [Cross-selling e upselling](#10-cross-selling-e-upselling)
11. [Combos inteligentes](#11-combos-inteligentes)
12. [Produtos campeões e pouco vendidos](#12-produtos-campeões-e-pouco-vendidos)
13. [Recuperação de clientes](#13-recuperação-de-clientes)
14. [Sugestões inteligentes e sistema proativo](#14-sugestões-inteligentes-e-sistema-proativo)
15. [Indicadores e decisões melhores](#15-indicadores-e-decisões-melhores)
16. [Calendário de campanhas](#16-calendário-de-campanhas)
17. [Futuras integrações com IA](#17-futuras-integrações-com-ia)
18. [O que não é Marketing Engine](#18-o-que-não-é-marketing-engine)
19. [Fases sugeridas (orientação)](#19-fases-sugeridas-orientação)
20. [Anti-padrões](#20-anti-padrões)
21. [Como usar este documento](#21-como-usar-este-documento)
22. [Histórico de Revisões](#22-histórico-de-revisões)

---

## 1. Por que este documento existe

Este arquivo é o **guia estratégico** de todas as evoluções de marketing na plataforma: promoções, campanhas, Home que vende, combos, sugestões, recuperação de clientes e, no futuro, IA.

Ele **não** substitui:

- `00-product-philosophy.md` — filosofia geral (prevalece em conflitos de UX)  
- `20-promotions-philosophy.md` — detalhe do módulo de promoções (assistente, selos, Home de ofertas)

Ele **une** a visão: o Food Service não é só cadastro e pedidos — é um **consultor de vendas** para o comerciante.

---

## 2. Filosofia do Marketing Engine

> **ERP cadastra. Consultor vende.**

O Marketing Engine é a camada (de produto) que:

1. Entende **objetivos comerciais** do comerciante.  
2. Traduz isso em **ações simples** (conversas, campanhas prontas, sugestões).  
3. Usa o **cardápio e os pedidos** para recomendar o próximo passo.  
4. Mantém a **complexidade escondida**.  
5. Mede e comunica **impacto** de forma humana.

O comerciante não “configura marketing”.  
Ele responde: **o que quer aumentar** — e o sistema ajuda a chegar lá.

---

## 3. A pergunta que governa tudo

Sempre que uma funcionalidade nova for criada (em qualquer módulo), perguntar:

> **Como essa funcionalidade ajuda o comerciante a vender mais, economizar tempo ou tomar melhores decisões?**

| Resposta | Ação |
|----------|------|
| Responde com clareza a pelo menos um dos três | Pode seguir (ainda passando na Regra de Ouro do `00`) |
| Não responde | Repensar a experiência — ou mandar para `19-future-ideas.md` |

Essa pergunta é **filosofia de produto** e diferencial competitivo.  
Espelhada em `00` e reforçada aqui como norte do Marketing Engine.

---

## 4. Objetivos comerciais

O ponto de partida de qualquer ação de marketing no painel:

| Objetivo | Exemplos de alavancas |
|----------|----------------------|
| Aumentar as vendas | Ofertas, campanhas do dia, destaques na Home |
| Aumentar o ticket médio | Combos, frete grátis com limiar, brinde a partir de valor, upsell |
| Atrair novos clientes | Oferta de boas-vindas, 1ª compra (futuro) |
| Trazer clientes de volta | Reativação, “sentimos sua falta” (futuro) |
| Empurrar categoria / produto | Pizza, hambúrguer, bebida, sobremesa |
| Incentivar combos | Bundle conversacional + sugestão por co-ocorrência |
| Pedidos acima de um valor | Frete grátis, brinde, desconto no pedido |

Detalhe do assistente de promoções: `20` §5.

---

## 5. Camadas do Marketing Engine

Visão em camadas (conceito de produto — não schema):

```text
Objetivo comercial do comerciante
        ↓
Sugestão / campanha pronta / conversa guiada
        ↓
Campanha (mecanismo + condições + recorrência + onde mostrar)
        ↓
Runtime (preço, elegibilidade, selos) — servidor
        ↓
Superfícies: Home viva · Cardápio · Produto · Checkout · (futuro: WhatsApp)
```

O comerciante só vive os dois primeiros degraus. O resto é invisível.

---

## 6. Promoções e campanhas

Fonte oficial de UX e regras do módulo: **`20-promotions-philosophy.md`**.

Aqui só o papel no Marketing Engine:

- Promoções são a **ferramenta tática** mais frequente.  
- Sempre conversacionais.  
- Sempre ligadas a um **objetivo**.  
- Sempre com **impacto** visível (%, economize; depois margem).

---

## 7. Campanhas prontas e datas comemorativas

Biblioteca futura de atalhos. O sistema conduz; o comerciante ajusta.

Exemplos:

| Campanha | Momento |
|----------|---------|
| 🍕 Terça da Pizza | Recorrente semanal |
| 🍔 Festival do Hambúrguer | Empurrar categoria |
| 🥤 Refrigerante em Dobro | Empurrar bebida |
| 👨‍👩‍👧 Combo Família | Ticket médio |
| 🎁 Compre e Ganhe | Brinde |
| 🚚 Frete Grátis | Ticket / conversão entrega |
| ❤️ Dia dos Namorados | Calendário BR |
| 🎄 Natal | Sazonal |
| ⚫ Black Friday | Sazonal |
| 🎉 Aniversário da Loja | Data do estabelecimento |
| 👨 Dia dos Pais / 👩 Dia das Mães | Calendário BR |

O Marketing Engine deve **lembrar** datas relevantes e oferecer ativar campanha pronta (proativo — §14).

---

## 8. Promoções recorrentes

Padrão do food service: dia da semana, happy hour, festival.

Toda campanha nasce apta a:

- Apenas uma vez  
- Todos os dias  
- Dias específicos da semana  
- Horários determinados  
- Datas comemorativas  

Detalhe: `20` §9.  
Calendário visual: §16 neste doc e `20` §16.

---

## 9. Home viva e superfícies de venda

A Home do storefront é a **vitrine dinâmica** do Marketing Engine.

- Com promoção → mostra promoções.  
- Sem promoção → fortalece mais vendidos / outros blocos.  
- Com sazonal / lançamento → destaca o momento.

Outras superfícies:

| Superfície | Papel |
|------------|-------|
| Cardápio | Ofertas no contexto da busca |
| Página do produto | Selo + De/Por |
| Checkout | Upsell / “complete o pedido” (futuro) |
| Carrinho | Sugestões de combo / adicionais (já há upsell leve; evoluir) |

Filosofia visual: chamar atenção **sem poluir** (`20` §12).

---

## 10. Cross-selling e upselling

| Conceito | Em linguagem do comerciante |
|----------|----------------------------|
| Cross-sell | “Quem pede X costuma pedir Y” → sugerir Y |
| Upsell | “Leve o tamanho maior / borda / combo e leve vantagem” |

Exemplos futuros:

- No produto: “Complete com refrigerante?”  
- No carrinho: “Falta pouco para frete grátis” (já alinhado a hint de frete)  
- Pós-add: combo sugerido com base em co-ocorrência real de pedidos  

Sempre **opcional**, nunca popup agressivo que bloqueia o pedido.

---

## 11. Combos inteligentes

Além do combo cadastrado na conversa de promoções:

- Sugerir combos a partir de **pares frequentes** (“hambúrguer + refri”).  
- Sugerir preço de combo com base na soma dos itens (com margem saudável — quando houver custo).  
- Oferecer “criar combo em 1 minuto” quando o estabelecimento ainda não tem nenhum.

---

## 12. Produtos campeões e pouco vendidos

O Marketing Engine usa o cardápio **com inteligência de desempenho**:

| Sinal | Ação sugerida (futuro) |
|-------|------------------------|
| Campeão de vendas sem promoção há X dias | “Quer dar um empurrão com oferta?” |
| Pouco vendido | “Destacar na Home?” / “Criar promoção?” / “Revisar preço?” |
| Novo produto | Selo lançamento + faixa novidades |
| Sem foto | Prioridade operacional (vende menos) — fora de marketing puro, mas o consultor pode lembrar |

Nunca culpar o comerciante. Sempre **oferecer o próximo passo**.

---

## 13. Recuperação de clientes

Visão futura (não MVP de promoções):

- Clientes que não pedem há N dias.  
- “Sentimos sua falta” + cupom / oferta simples.  
- Primeira compra vs cliente recorrente.  

Tom humano, canal a definir (app, e-mail, WhatsApp — ver §17).  
Sem spam; frequência e opt-in respeitados.

---

## 14. Sugestões inteligentes e sistema proativo

**Inversão de iniciativa:** o sistema vem até o comerciante.

Gatilhos (exemplos):

| Gatilho | Sugestão |
|---------|----------|
| Segunda historicamente fraca | Criar promoção em &lt; 1 min |
| Campeão sem oferta | Oferta rápida |
| Sem combos | Criar primeiro combo |
| Co-ocorrência forte | Criar combo inteligente |
| Véspera de data comemorativa | Ativar campanha pronta |
| Pedido médio abaixo da meta | Frete grátis / brinde com limiar |

Onde aparece: Home do backoffice, banner discreto, fim de fluxos de cardápio — **nunca** modal bloqueante interminável.

Detalhe de copy e fluxos de promoção: `20` §17.

---

## 15. Indicadores e decisões melhores

O consultor mostra impacto **em linguagem de venda**:

| Agora (promoções) | Depois |
|-------------------|--------|
| −15% · Economize R$ 11 | Impacto na margem (com custo) |
| Pedidos na oferta (relatório simples) | Ticket médio antes/depois |
| | Clientes reativados |

Decisão melhor = ver o efeito **sem** dashboard de BI complexo no caminho feliz.

---

## 16. Calendário de campanhas

Visão futura: mês visual com campanhas recorrentes e pontuais.

Objetivo: o comerciante **enxerga** Terça da Pizza e Sábado Especial sem abrir dez telas.

Alimenta e é alimentado pelo modelo de recorrência (`20` §9).

---

## 17. Futuras integrações com IA

A arquitetura de produto deve permitir, sem remodelar a filosofia:

- Sugerir objetivo comercial com base no movimento da semana.  
- Gerar copy de card (“Economize R$ 11 na Calabresa”).  
- Propor preço promocional “seguro” (margem).  
- Detectar pares para combo.  
- Lembrar datas e montar campanha pronta.  
- Assistente por WhatsApp (visão longa — `15` / `19`).  

IA **ajuda a conversar e sugerir**. Não substitui a Regra de Ouro nem cria telas técnicas.

Stub já previsto em outros docs (`/admin/ai/suggestions/`) pode evoluir para alimentar o Marketing Engine.

---

## 18. O que não é Marketing Engine

| Não é | Por quê |
|-------|---------|
| CRM enterprise completo | Escopo explode; fora do MVP |
| Automação de marketing estilo HubSpot | Complexidade demais para o usuário-alvo |
| Popup agressivo no storefront | Viola `00` / `11` |
| Trocar o Pricing Engine / Receita da categoria | Domínio de cardápio (`17` / `18`) |
| Substituir o módulo de pedidos | Pedidos operam; marketing **impulsiona** |

---

## 19. Fases sugeridas (orientação)

Não é checklist fechado — só ordem mental:

| Fase | Foco |
|------|------|
| **A** | Promoções conversacionais (`20`) + Home com faixa de ofertas |
| **B** | Recorrência rica + indicadores + calendário simples |
| **C** | Campanhas prontas + datas BR |
| **D** | Sugestões proativas no painel |
| **E** | Cross/upsell no storefront + combos inteligentes |
| **F** | Recuperação de clientes + IA generativa |

MVP First (`00`): só avançar fase se ajudar o 1º cliente a **vender mais** com **menos configuração**.

---

## 20. Anti-padrões

| Evitar | Por quê |
|--------|---------|
| “Central de Marketing” com 40 menus | Assusta o pizzaiolo |
| Métricas sem próximo passo | Não ajuda a decidir |
| Forçar campanha pronta sem contexto | Barulho, não consultoria |
| Cross-sell que atrasa o checkout | Vende menos |
| Implementar fidelidade/cashback antes da conversa de promoção básica | Prioridade invertida |
| Docs técnicos substituindo este guia | Este arquivo é produto |

---

## 21. Como usar este documento

| Papel | Uso |
|-------|------|
| Produto / UX | Filtrar features com a pergunta §3 |
| Engenharia | Não expor conceitos deste doc na UI; implementar conversas do `20` |
| Roadmap | Priorizar fases §19 sem descarrilar o MVP |
| Code review | Recusar marketing que vire CRUD técnico |

Conflito UX: `00` &gt; `20` / `21`.  
Conflito só de promoções: `20` detalha; `21` contextualiza.

---

## 22. Histórico de Revisões

| Versão | Data | Descrição |
|--------|------|-----------|
| 1.0 | Jul/2026 | **Aprovado** — criação: filosofia do Marketing Engine, objetivos, proativo, campanhas prontas, cross/upsell, fases |

---

> **Documento aprovado.** Guia estratégico de marketing da plataforma.  
> Implementação tática de promoções: seguir `20-promotions-philosophy.md`.  
> Próximo passo natural: modelagem de arquitetura do módulo de promoções (MVP conversacional).
