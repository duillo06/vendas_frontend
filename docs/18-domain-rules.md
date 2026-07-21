# 18 — Regras de Domínio (Cardápio)

> **Documento:** Regras de negócio do cardápio — como cada tipo de produto funciona  
> **Produto:** Food Service *(nome comercial provisório)*  
> **Versão:** 1.0  
> **Status:** Aprovado  
> **Última atualização:** Julho/2026  
> **Depende de:** `00-product-philosophy.md`, `17-modelo-categoria-produto.md`  
> **Natureza:** Domínio puro — **sem código**, sem nomes de tabela na UI, sem detalhes de implementação

---

## Sumário

1. [Como ler este documento](#1-como-ler-este-documento)
2. [Regras universais](#2-regras-universais)
3. [Categoria (Receita)](#3-categoria-receita)
4. [Base reutilizável (nome UI provisório)](#4-base-reutilizável-nome-ui-provisório)
5. [Produto](#5-produto)
6. [Pizza](#6-pizza)
7. [Hambúrguer](#7-hambúrguer)
8. [Pastel](#8-pastel)
9. [Açaí](#9-açaí)
10. [Bebidas](#10-bebidas)
11. [Outros tipos](#11-outros-tipos)
12. [Meio a meio / sabores](#12-meio-a-meio--sabores)
13. [Caminho até o cardápio (runtime)](#13-caminho-até-o-cardápio-runtime)
14. [MVP First](#14-mvp-first)
15. [Histórico de Revisões](#15-histórico-de-revisões)

---

## 1. Como ler este documento

Este arquivo responde só:

> **Como funciona cada tipo de produto no Food Service?**

Qualquer pessoa do time (produto, suporte, novo desenvolvedor) deve entender o domínio **só com este texto**.

Detalhes técnicos de tabelas e APIs: `03`, `07`, `17`.  
Filosofia de UX: `00-product-philosophy.md`.

---

## 2. Regras universais

1. **Preço de venda vive no produto.** Nunca na categoria. Nunca na base reutilizável.  
2. **A categoria define o comportamento padrão** (a “receita”). O produto usa essa receita.  
3. **O produto pode ter exceções** (não usar todas as bordas, preços próprios). Isso **não altera** a categoria.  
4. **Itens de identidade** (Catupiry, Broto, Bacon…) cadastram-se **uma vez** e reaparecem em todo o cardápio.  
5. **O comerciante não configura “grupos” ou “features”.** Ele responde perguntas.  
6. **Mudança na receita da categoria** que afete produtos existentes **sempre pergunta** como aplicar.  
7. **O que o cliente vê no app** é o resultado final do produto já montado — sem ver a receita.

---

## 3. Categoria (Receita)

A categoria funciona como **modelo / receita** dos produtos daquela seção.

| Pode | Não pode |
|------|----------|
| Definir se trabalha com tamanhos, bordas, adicionais, meio a meio, etc. | Guardar preços de venda |
| Escolher quais itens da base reutilizável entram na receita | Ser um formulário técnico de “features” |
| Servir de padrão para **novos** produtos | Surpreender produtos antigos sem confirmação |
| Oferecer “atualizar todos” / “só novos” / “decidir depois” | |

Configuração = **assistente conversacional** + resumo + visão em fluxograma (só leitura).

---

## 4. Base reutilizável (nome UI provisório)

**Nome provisório na interface:** “Base do cardápio”  
*(Fácil de trocar depois — não amarrar copy ao código interno.)*

| É | Não é |
|---|-------|
| Catálogo de identidades: tamanhos, bordas, adicionais, massas, molhos, volumes… | Lugar de preço |
| Criável no meio do fluxo sem sair da conversa | “Biblioteca técnica” |

Exemplos de itens: Broto, Catupiry, Bacon, Massa fina, 600 ml.

---

## 5. Produto

| Regra | Detalhe |
|-------|---------|
| Herda a receita da categoria | Estrutura pronta ao escolher a categoria |
| Define preços | Matriz simples (ex.: preço por tamanho) |
| Pode sobrescrever o que usa | “Usa todas as bordas?” → Sim / escolher |
| Nunca altera a categoria | Exceção é só deste produto |
| Cadastro seguinte é mais rápido | Copiar preços / % / fixo / manual |

Momento esperado após escolher categoria: o sistema “prepara” o cadastro e pede o que falta (em geral preços).

---

## 6. Pizza

- Pode possuir vários tamanhos.  
- Pode possuir vários sabores / combinação de sabores.  
- Pode permitir **meio a meio** (ou mais sabores).  
- Cálculo do meio a meio pode ser: **maior preço**, **média**, **proporcional** (soma).  
- Pode possuir bordas.  
- Pode possuir adicionais.  
- Pode remover opções herdadas da categoria (exceção no produto).  
- **Preço sempre no produto.**  

---

## 7. Hambúrguer

- Pode possuir adicionais.  
- Pode possuir ponto da carne.  
- Pode possuir molhos.  
- Pode possuir combos (MVP: só se estiver no escopo fechado da sprint; senão → backlog).  
- Pode possuir observações.  
- Preço no produto; estrutura na receita da categoria.

---

## 8. Pastel

- Pode possuir massas.  
- Pode possuir recheios.  
- Pode possuir adicionais.  
- Preço no produto.

---

## 9. Açaí

- Pode possuir tamanhos.  
- Pode possuir coberturas.  
- Pode possuir frutas.  
- Pode possuir complementos.  
- Preço no produto (incluindo por tamanho).

---

## 10. Bebidas

- Pode possuir volumes.  
- Pode possuir temperatura.  
- Pode possuir gelo.  
- Pode possuir limão / extras simples.  
- Muitos produtos de bebida **não** precisam de receita rica — cadastro curto é válido e desejável.

---

## 11. Outros tipos

Marmitas, doces, porções, sushi, cafés, drinks, etc. seguem o mesmo padrão:

> A receita da categoria diz o que perguntar.  
> A base reutilizável guarda os itens.  
> O produto guarda os preços e as exceções.

Novos tipos **não** exigem remodelar o cardápio — só novas perguntas e kinds internos.

---

## 12. Meio a meio / sabores

- É capacidade da **receita da categoria** (e depois do produto).  
- O cliente combina sabores no cardápio.  
- Regras de preço (maior / média / proporcional) fazem parte da conversa da categoria.  
- Não misturar com “adicional” na cabeça do usuário: é “pode escolher mais de um sabor?”.

---

## 13. Caminho até o cardápio (runtime)

Visão de domínio (nomes internos só para o time técnico):

```text
Categoria (Receita)
    ↓
Produto (preços + exceções)
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

## 14. MVP First

Antes de implementar qualquer coisa nova:

1. É indispensável para o **primeiro cliente** usar o sistema?  
2. Aumenta de verdade a **simplicidade**?  
3. Deixa o **cadastro mais rápido**?  
4. Respeita a **filosofia** (`00`)?

Se a resposta for “não” na maior parte → `19-future-ideas.md`.

---

## 15. Histórico de Revisões

| Versão | Data | Descrição |
|--------|------|-----------|
| 1.0 | Jul/2026 | Criação — regras por tipo + caminho até o cardápio + MVP First |

---

> **Documento aprovado.** Fonte oficial de regras de domínio do cardápio.
