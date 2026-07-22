# 18 — Regras de Domínio (Cardápio)

> **Documento:** Regras de negócio do cardápio — como cada tipo de produto funciona  
> **Produto:** Food Service *(nome comercial provisório)*  
> **Versão:** 1.1  
> **Status:** Aprovado  
> **Última atualização:** Julho/2026  
> **Depende de:** `00-product-philosophy.md`, `17-modelo-categoria-produto.md`  
> **Natureza:** Domínio puro — **sem código**, sem nomes de tabela na UI, sem detalhes de implementação

---

## Sumário

1. [Como ler este documento](#1-como-ler-este-documento)
2. [Regras universais](#2-regras-universais)
3. [Onde vive cada informação](#3-onde-vive-cada-informação)
4. [Dois tipos de preço](#4-dois-tipos-de-preço)
5. [Herança e personalização](#5-herança-e-personalização)
6. [Categoria (Receita)](#6-categoria-receita)
7. [Base reutilizável (nome UI provisório)](#7-base-reutilizável-nome-ui-provisório)
8. [Produto](#8-produto)
9. [Pizza](#9-pizza)
10. [Hambúrguer](#10-hambúrguer)
11. [Pastel](#11-pastel)
12. [Açaí](#12-açaí)
13. [Bebidas](#13-bebidas)
14. [Outros tipos](#14-outros-tipos)
15. [Meio a meio / sabores](#15-meio-a-meio--sabores)
16. [Caminho até o cardápio (runtime)](#16-caminho-até-o-cardápio-runtime)
17. [MVP First](#17-mvp-first)
18. [Histórico de Revisões](#18-histórico-de-revisões)

---

## 1. Como ler este documento

Este arquivo responde só:

> **Como funciona cada tipo de produto no Food Service?**

Qualquer pessoa do time (produto, suporte, novo desenvolvedor) deve entender o domínio **só com este texto**.

Detalhes técnicos de tabelas e APIs: `03`, `07`, `17`.  
Filosofia de UX: `00-product-philosophy.md`.

---

## 2. Regras universais

1. **O sistema trabalha para o comerciante** — nunca o contrário. Cadastro mínimo; sem repetição desnecessária.  
2. **O que é igual para quase todos os produtos da categoria configura-se uma vez** (na categoria).  
3. **O que muda de produto para produto configura-se no produto.**  
4. **A categoria define o comportamento padrão** (a “receita”) **e os preços compartilhados**.  
5. **O produto herda** essa receita e esses preços. Só grava diferença quando for exceção.  
6. **Itens de identidade** (Catupiry, Broto, Bacon…) cadastram-se **uma vez** na base reutilizável.  
7. **O comerciante não configura “grupos” ou “features”.** Ele responde perguntas.  
8. **Mudança na receita** (estrutura ou preço padrão) que afete produtos **sempre comunica** o impacto — estrutura pede como aplicar; preço padrão vale na hora para quem herda.  
9. **O que o cliente vê no app** é o produto já montado, com o preço efetivo — sem ver a receita.

---

## 3. Onde vive cada informação

Pilar arquitetural (espelhado em `17`):

> Tudo que normalmente tem o **mesmo valor** para todos os produtos da categoria → **categoria**.  
> Tudo que **varia** de um produto para outro → **produto**.

| Categoria | Produto |
|-----------|---------|
| Bordas, adicionais, molhos, massas, coberturas… | Nome, foto, descrição |
| **Preço padrão** dessas opções | **Preço dos tamanhos** (e similares) |
| Meio a meio e regra de cálculo | Promoções |
| “Possui X?” / quais itens entram | Quais itens **não** usa (exceção) |
| | Preço **próprio** só quando personalizar |

---

## 4. Dois tipos de preço

### 4.1 Tipo 1 — Pertence ao produto

Exemplo clássico: **tamanhos**. Cada pizza/lanche tem valores diferentes.

Perguntado **no cadastro do produto**.

**O preço do tamanho é o valor do produto naquele tamanho** — não um “mais X reais” em cima de outro preço.  
No cardápio aparece `Grande R$ 80`, não `+ R$ 80`.

### 4.2 Tipo 2 — Pertence à categoria

Exemplo clássico: **bordas e adicionais**. O Catupiry custa o mesmo na Calabresa e na Frango — quase sempre.

Perguntado **na configuração da categoria** (“Quanto custa cada borda normalmente?”).

**Não** se pergunta de novo em cada produto.

### 4.3 Como o preço é escolhido na hora de vender

```text
Este produto tem preço próprio nesta opção?
  → Sim → usa esse preço
  → Não → a categoria tem preço padrão?
        → Sim → usa o da categoria
        → Não → sem preço
```

Detalhe técnico da ordem: `17-modelo-categoria-produto.md` §8.

---

## 5. Herança e personalização

- **Padrão:** o produto usa o preço da categoria (Tipo 2).  
- **Exceção:** ação discreta do tipo “Personalizar somente neste produto” → grava preço só daquele produto.  
- **Voltar ao padrão:** remover a personalização → herda de novo.  
- **Subir o Catupiry na categoria** de R$ 10 para R$ 12 → todas as pizzas **sem** personalização passam a R$ 12. Quem personalizou mantém o valor próprio.

Na interface: nunca falar “override” ou “herança técnica”. Falar como o comerciante fala.

---

## 6. Categoria (Receita)

A categoria funciona como **modelo / receita** dos produtos daquela seção.

| Pode | Não pode |
|------|----------|
| Definir se trabalha com tamanhos, bordas, adicionais, meio a meio, etc. | Guardar preço de **tamanho** (isso é do produto) |
| Escolher quais itens da base entram na receita | Ser um formulário técnico de “features” |
| Guardar **preço padrão** de bordas, adicionais, molhos… | Surpreender produtos com mudança de **estrutura** sem confirmação |
| Servir de padrão para novos e existentes (preço herdado) | Forçar o comerciante a repetir o mesmo preço em 80 produtos |

Configuração = **assistente conversacional** + resumo (com valores padrão) + visão em fluxograma (só leitura).

---

## 7. Base reutilizável (nome UI provisório)

**Nome provisório na interface:** “Base do cardápio”  
*(Fácil de trocar depois — não amarrar copy ao código interno.)*

| É | Não é |
|---|-------|
| Catálogo de identidades: tamanhos, bordas, adicionais, massas, molhos, volumes… | Lugar do preço de venda |
| Criável no meio do fluxo sem sair da conversa | “Biblioteca técnica” |

Preço de venda: na **categoria** (Tipo 2) ou no **produto** (Tipo 1 / personalização) — nunca como “verdade” da identidade isolada.

Exemplos de itens: Broto, Catupiry, Bacon, Massa fina, 600 ml.

---

## 8. Produto

| Regra | Detalhe |
|-------|---------|
| Herda a receita da categoria | Estrutura pronta ao escolher a categoria |
| Define preços Tipo 1 | Matriz por tamanho (e similares) |
| Herda preços Tipo 2 | Bordas/adicionais sem digitar de novo |
| Pode personalizar um preço Tipo 2 | Só neste produto |
| Pode sobrescrever o que usa | “Usa todas as bordas?” → Sim / escolher |
| Nunca altera a categoria | Exceção é só deste produto |
| Cadastro seguinte é mais rápido | Copiar preços de tamanho / % / fixo / manual |

Momento esperado após escolher categoria: o sistema prepara o cadastro e pede **o que falta** — em geral preços de tamanho, não a lista inteira de bordas.

---

## 9. Pizza

- Pode possuir vários tamanhos → **preço no produto**.  
- Pode possuir vários sabores / combinação de sabores.  
- Pode permitir **meio a meio** (ou mais sabores).  
- Cálculo do meio a meio: **maior preço**, **média**, **proporcional** (combinado na categoria).  
- Pode possuir bordas → **preço padrão na categoria**; personalizar no produto se precisar.  
- Pode possuir adicionais → idem.  
- Pode remover opções herdadas (exceção no produto).  

---

## 10. Hambúrguer

- Pode possuir adicionais / ponto da carne / molhos → estrutura e preços padrão na receita da categoria; personalização no produto.  
- Preço do lanche em si (quando houver tamanhos ou valor base do produto) → produto.  
- Combos: só se estiver no escopo fechado da sprint; senão → backlog.

---

## 11. Pastel

- Massas, recheios, adicionais → receita + preços padrão na categoria quando forem compartilhados.  
- Preço por tamanho / valor do pastel → produto.

---

## 12. Açaí

- Tamanhos → preço no produto.  
- Coberturas, frutas, complementos → preço padrão na categoria; personalizar no produto se for exceção.

---

## 13. Bebidas

- Volumes com preço diferente por produto → preço no produto.  
- Extras simples (gelo, limão…) com valor fixo da casa → preço padrão na categoria.  
- Cadastro curto continua válido quando a receita for simples.

---

## 14. Outros tipos

Marmitas, doces, porções, sushi, cafés, drinks, etc. seguem o mesmo padrão:

> A receita da categoria diz o que perguntar e guarda o que é compartilhado (incluindo preços padrão).  
> A base reutilizável guarda os itens.  
> O produto guarda o que varia e as exceções.

Novos tipos **não** exigem remodelar o cardápio — só novas perguntas e a decisão: *compartilhado ou por produto?*

---

## 15. Meio a meio / sabores

- Capacidade da **receita da categoria** (e depois do produto).  
- O cliente combina sabores no cardápio **se quiser**.  
- “Até 2 sabores” (ou 3, 4…) é o **máximo** — **nunca** obriga escolher mais de um. Pedir só o sabor principal é válido.  
- Regras de preço (maior / média / proporcional) fazem parte da conversa da categoria.  
- Não misturar com “adicional” na cabeça do usuário: é “pode escolher mais de um sabor?”.

---

## 16. Caminho até o cardápio (runtime)

Visão de domínio (nomes internos só para o time técnico):

```text
Categoria (Receita + preços padrão compartilhados)
    ↓
Produto (preços que variam + exclusões + personalizações)
    ↓
Resolução de preço (produto → categoria → vazio)
    ↓
Materialização (monta o que o motor já entende)
    ↓
Vínculos de opções do produto
    ↓
Motor de preço
    ↓
Cardápio / Checkout
```

O cliente final só vê o produto montado e o preço certo.

---

## 17. MVP First

Antes de implementar qualquer coisa nova:

1. É indispensável para o **primeiro cliente** usar o sistema?  
2. Aumenta de verdade a **simplicidade**?  
3. Deixa o **cadastro mais rápido**?  
4. Respeita a **filosofia** (`00`)?

Se a resposta for “não” na maior parte → `19-future-ideas.md`.

A herança de preços Tipo 2 **aumenta simplicidade e velocidade de cadastro** — entra no escopo da Fase 5 de `17`, não no backlog estratégico.

---

## 18. Histórico de Revisões

| Versão | Data | Descrição |
|--------|------|-----------|
| 1.1 | Jul/2026 | **Aprovado** — dois tipos de preço; herança categoria → produto; personalização discreta |
| 1.0 | Jul/2026 | Criação — regras por tipo + caminho até o cardápio + MVP First |

---

> **Documento aprovado.** Fonte oficial de regras de domínio do cardápio. Próximo: Fase 5 (`17`).
