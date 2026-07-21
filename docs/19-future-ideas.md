# 19 — Ideias Futuras (Backlog Estratégico)

> **Documento:** Backlog de ideias fora do MVP  
> **Produto:** Food Service *(nome comercial provisório)*  
> **Versão:** 1.0  
> **Status:** Aprovado  
> **Última atualização:** Julho/2026  
> **Depende de:** `00-product-philosophy.md`, `18-domain-rules.md`  
> **Regra:** Se não for MVP → registra aqui. Não interrompe a implementação.

---

## Sumário

1. [Para que serve](#1-para-que-serve)
2. [Como usar](#2-como-usar)
3. [Filtro MVP First](#3-filtro-mvp-first)
4. [Ideias registradas](#4-ideias-registradas)
5. [Histórico de Revisões](#5-histórico-de-revisões)

---

## 1. Para que serve

Este documento **só** guarda ideias boas que **não** entram no MVP agora.

Objetivo: não deixar uma ideia nova descarrilar o foco de construir o MVP mais intuitivo do mercado.

Relacionado (mais estruturado por horizonte): `15-futuras-funcionalidades.md`.  
Este arquivo (`19`) é o **caderno rápido** de captura.

---

## 2. Como usar

Quando surgir uma ideia:

1. Perguntar: **faz parte do MVP?**  
2. Se **não** → adicionar uma linha na seção 4 (data + ideia + nota curta).  
3. Seguir implementando o MVP.

Não abrir discussão de remodelagem de arquitetura por ideia futura (Architecture Freeze — ver `00` / `17`).

---

## 3. Filtro MVP First

| Pergunta | Se “não”… |
|----------|-----------|
| Indispensável para o 1º cliente? | → backlog |
| Aumenta muito a simplicidade? | → reavaliar / backlog |
| Deixa o cadastro mais rápido? | → provavelmente backlog |
| Mantém a filosofia? | → redesenhar ou descartar |

---

## 4. Ideias registradas

| Data | Ideia | Nota |
|------|-------|------|
| Jul/2026 | Assistente de 1ª configuração do estabelecimento | **Feito (Fase 4)** — presets; IA real fica no stub `/admin/ai/suggestions/` |
| Jul/2026 | IA sugerindo categorias / receita | Pós-MVP; hook stub em `/admin/ai/suggestions/` |
| Jul/2026 | IA copiando produtos semelhantes | Pós-MVP |
| Jul/2026 | Cadastro por voz | Futuro |
| Jul/2026 | Importação de cardápio PDF | Futuro |
| Jul/2026 | Importação via imagem | Futuro |
| Jul/2026 | Sugestão automática de preços | Futuro |
| Jul/2026 | Dashboard inteligente | V1+ |
| Jul/2026 | Programa de fidelidade | V2+ (`15`) |
| Jul/2026 | Clube de assinatura | Futuro |
| Jul/2026 | Cashback | Futuro |
| Jul/2026 | WhatsApp com IA | Futuro |
| Jul/2026 | Autoatendimento / totem | Futuro |
| Jul/2026 | Marketplace | Futuro |
| Jul/2026 | Franquias / multi-loja avançado | V3+ |
| Jul/2026 | BI / analytics avançado | Futuro |
| Jul/2026 | Integrações (iFood, ERP, fiscal) | V2–V4 |
| Jul/2026 | Sistema de recomendações no pedido | Futuro |
| Jul/2026 | Nome definitivo do catálogo reutilizável | Decisão de produto (UI); hoje provisório “Base do cardápio” |

*(Novas linhas sempre no topo da tabela ou ao final — manter data.)*

---

## 5. Histórico de Revisões

| Versão | Data | Descrição |
|--------|------|-----------|
| 1.0 | Jul/2026 | Criação — backlog estratégico + filtro MVP First |

---

> **Documento aprovado.** Ideias novas fora do MVP entram aqui — não no código do MVP.
