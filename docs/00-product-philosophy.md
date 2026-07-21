# 00 — Filosofia do Produto

> **Documento:** Filosofia de Produto e Princípios Invioláveis  
> **Produto:** Food Service *(nome comercial provisório)*  
> **Versão:** 1.2  
> **Status:** Aprovado  
> **Última atualização:** Julho/2026  
> **Depende de:** — (documento fundador; todos os demais devem respeitá-lo)  
> **Relacionados:** `01-visao-do-produto.md`, `02-arquitetura.md`, `11-guia-ui-ux.md`, `17-modelo-categoria-produto.md`, `18-domain-rules.md`, `19-future-ideas.md`

---

## Sumário

1. [Por que este documento existe](#1-por-que-este-documento-existe)
2. [Quem é o usuário](#2-quem-é-o-usuário)
3. [A Regra de Ouro](#3-a-regra-de-ouro)
4. [O sistema nunca deve](#4-o-sistema-nunca-deve)
5. [O sistema sempre deve](#5-o-sistema-sempre-deve)
6. [Princípios de arquitetura e UX](#6-princípios-de-arquitetura-e-ux)
7. [Vocabulário: o que o usuário vê vs. o que o sistema usa](#7-vocabulário-o-que-o-usuário-vê-vs-o-que-o-sistema-usa)
8. [Modelo mental: Receita da Categoria](#8-modelo-mental-receita-da-categoria)
9. [Camadas (invisíveis ao usuário)](#9-camadas-invisíveis-ao-usuário)
10. [Assistentes, não CRUDs](#10-assistentes-não-cruds)
11. [Confirmações e confiança](#11-confirmações-e-confiança)
12. [Preparação para inteligência futura](#12-preparação-para-inteligência-futura)
13. [Como usar este documento no dia a dia](#13-como-usar-este-documento-no-dia-a-dia)
14. [Histórico de Revisões](#14-histórico-de-revisões)

---

## 1. Por que este documento existe

Este é o **documento mais importante do Food Service**.

Ele não descreve endpoints nem tabelas. Ele define **como pensamos o produto**.

Toda decisão de arquitetura, UX, copy, sprint e pull request deve ser filtrada por esta filosofia.

> Nosso objetivo não é criar um ERP completo.  
> É construir a plataforma de gestão para food service **mais intuitiva do mercado**, onde a tecnologia trabalha para o comerciante — e nunca o contrário.

Se um doc técnico, uma tela ou um nome de campo conflitar com este arquivo, **este arquivo vence**.

---

## 2. Quem é o usuário

O usuário típico **não** é desenvolvedor nem analista de sistemas.

Na maioria das vezes é:

- dono de pizzaria, hamburgueria, lanchonete ou açaíteria;
- pessoa responsável pelo atendimento ou pelo cardápio;
- alguém que **nunca** usou (ou quase nunca) um sistema de gestão.

Ele pensa assim:

- “Minha pizza tem tamanhos.”
- “Tem borda recheada.”
- “Aceita meio a meio.”
- “O lanche tem adicionais.”

Ele **não** pensa em grupos, vínculos, overrides, templates ou features.

---

## 3. A Regra de Ouro

Toda funcionalidade nova (e toda revisão de tela existente) responde a **uma** pergunta:

> **Um dono de uma pequena pizzaria, sem conhecimento técnico, conseguiria concluir essa tarefa apenas respondendo perguntas simples?**

| Resposta | Ação |
|----------|------|
| **Sim** | Pode seguir |
| **Não** | Redesenhar a experiência antes de implementar |

Não negociar. Não “deixar avançado escondido no caminho feliz”. O caminho feliz é a conversa.

---

## 4. O sistema nunca deve

1. **Ensinar conceitos técnicos** ao usuário (Option Group, Feature, Override, Template, JSON, Materialização…).
2. **Exigir treinamento** ou manual para cadastrar o básico.
3. **Exibir telas complexas** cheias de campos sem narrativa.
4. **Obrigar a repetir** a mesma configuração em cada produto.
5. **Fazer cadastrar duas vezes** a mesma informação (ex.: Catupiry em 40 pizzas).
6. **Surpreender** com mudanças em massa sem perguntar.
7. **Expor a arquitetura interna** em labels, tooltips ou mensagens de erro.

---

## 5. O sistema sempre deve

1. **Conversar** — uma pergunta clara por vez, linguagem humana.
2. **Ensinar** — com exemplos curtos (“Ex.: Broto, Média, Grande”).
3. **Sugerir** — atalhos e modelos prontos quando fizer sentido.
4. **Automatizar** — montar a estrutura técnica sozinho.
5. **Herdar** — o produto nasce da receita da categoria.
6. **Confirmar** — alterações que afetam muitos produtos.
7. **Reutilizar** — tudo criado uma vez serve em centenas de produtos.
8. **Antecipar** — próximos passos óbvios (“Agora só os preços que mudam neste produto”).

---

## 6. Princípios de arquitetura e UX

Estes princípios são **base de todo o sistema** daqui para frente.

### 6.1 Esconder a arquitetura

Toda estrutura poderosa (tabelas, capabilities, materialização, pricing engine) existe **só internamente**.

O usuário responde perguntas. O backend monta o resto.

### 6.2 Conversação acima de configuração

Preferir assistente guiado a formulário administrativo.

Categoria = **assistente / onboarding**, não CRUD de campos.

### 6.3 Herança acima de repetição

O que puder vir da **Receita da Categoria** deve vir automaticamente.

### 6.4 Exceções acima de reconfiguração

O produto altera **só o que for diferente** (ex.: “não usa todas as bordas”).

Nunca pede para montar a estrutura do zero de novo.

### 6.5 Zero curva de aprendizado

Se precisar explicar o que é um “grupo”, a UX falhou.

### 6.6 Backend poderoso, frontend simples

Complexidade no service / materialização / engine.  
UI: perguntas, cartões, resumos, confirmações.

### 6.7 Reutilização máxima

Itens de identidade (tamanhos, bordas, adicionais…) cadastram-se uma vez na base.

**Preços:** o que é igual para a categoria → na categoria; o que varia por produto (ex.: tamanhos) → no produto. Herança + personalização discreta — ver `17` §3–§4 e `18` §3–§5.

### 6.8 Cadastro mínimo (não repetir)

Se o comerciante digita o mesmo valor em todo produto da categoria, esse dado está no lugar errado.

### 6.9 Escalabilidade silenciosa

Novos tipos (ponto da carne, temperatura, gelo…) = novas perguntas e kinds internos — **sem** redesenhar o cardápio nem o checkout.

### 6.10 Hierarquia acima de quantidade

Cada tela tem **um protagonista**. Remover ruído que não ajuda a concluir a tarefa.  
*(Alinha ao 11º mandamento do Design System.)*

---

## 7. Vocabulário: o que o usuário vê vs. o que o sistema usa

| Interno (devs / docs técnicos) | Usuário (UI / copy) |
|--------------------------------|---------------------|
| OptionGroup, Library | Em avaliação — ver §7.1 |
| Capability / Feature | “Possui tamanhos?”, “Possui bordas?” |
| Template | “Tipo de categoria” / modelo pronto (sem jargão) |
| Override | “Personalizar somente neste produto” |
| Herança | “Preço herdado da categoria” / “Já deixamos pronto” |
| Materialização | Invisível (“Preparando o cadastro…”) |
| ProductOptionGroup | Invisível |
| PricingEngine | Invisível |

### 7.1 Nome do catálogo reutilizável (em aberto)

Evitar “Biblioteca” (soará técnico).

| Candidatos (decidir em revisão de produto):

- Ingredientes e Opções  
- Base do Cardápio ← **provisório atual na UI** (`catalogLabels`)  
- Cadastros Base  
- Opções do Restaurante  
- Itens Reutilizáveis  

Até a decisão definitiva, a UI usa o rótulo provisório **desacoplado** da lógica interna (constante de copy). Trocar o nome = só copy.

---

## 8. Modelo mental: Receita da Categoria

Conceito de produto (não de banco):

> Cada **categoria** tem uma **Receita** — o jeito padrão de vender aqueles produtos.

Exemplo — Receita da Pizza:

```
Pizza
  → Tamanhos (Broto, Média, Grande…)
  → Sabores / meio a meio (até 2, maior preço)
  → Bordas (Catupiry, Cheddar…)
  → Adicionais (Bacon, Milho…)
```

Quando o usuário cria **Pizza Calabresa**, o sistema **usa a receita**.  
Não fala em herança, template ou configuração avançada.

Internamente a receita mapeia para capabilities + vínculos com o catálogo + composition — ver `17-modelo-categoria-produto.md`.

---

## 9. Camadas (invisíveis ao usuário)

```text
┌─────────────────────────────────────────────┐
│  UX: perguntas, resumos, fluxograma visual  │  ← único lugar que o comerciante vive
├─────────────────────────────────────────────┤
│  Autoria: Receita + preços padrão + produto │  ← herança, exclusões, overrides
├─────────────────────────────────────────────┤
│  Runtime (já existente):                    │
│  OptionGroup → ProductOptionGroup → Engine  │  ← storefront + checkout intactos
│  ProductComposition                         │
└─────────────────────────────────────────────┘
```

**Regra:** evoluir a camada de autoria sem quebrar o runtime. O cardápio e o pedido continuam falando a língua do motor atual.

---

## 10. Assistentes, não CRUDs

### 10.1 Categoria

Fluxo em conversa → **resumo visual** → salvar.  
Depois: tela de **visualização** (fluxograma só leitura) da receita — não um formulário denso.

### 10.2 Produto

Após escolher a categoria, momento “mágico” (preparação):

```text
Preparando o cadastro…
✓ Carregando tamanhos
✓ Carregando bordas
✓ Carregando adicionais
✓ Configurando meio a meio
Tudo pronto. Agora só os preços que mudam nesta pizza (tamanhos).
Bordas e adicionais já vêm da categoria — personalize só se for exceção.
```

### 10.3 Catálogo reutilizável

Cadastro mínimo: nome (+ ícone/descrição). Sem preço de venda na identidade. Criável **sem sair** do fluxo. Preço padrão de opções compartilhadas entra na conversa da **categoria**.

---

## 11. Confirmações e confiança

Ao alterar a receita da categoria (nova borda, novo tamanho…):

```text
Você alterou: Cream Cheese (borda)

Como deseja aplicar?
( ) Apenas novos produtos
( ) Atualizar todos os produtos
( ) Decidirei depois
```

Nunca aplicar em massa sem pergunta explícita.

---

## 12. Preparação para inteligência futura

A arquitetura e os fluxos devem permitir, **sem remodelar tudo**, ideias como:

- “Encontramos uma pizza parecida. Copiar estrutura/preços?”
- “Categoria Milk Shake: configurar tamanhos, coberturas e complementos automaticamente?”
- Assistente de primeira configuração do estabelecimento (segmento → modelo pronto).

Detalhes de escopo futuro: `15-futuras-funcionalidades.md` e `17-modelo-categoria-produto.md` § Assistente inicial / IA.

---

## 13. Como usar este documento no dia a dia

| Papel | Obrigação |
|-------|-----------|
| **Produto / UX** | Toda tela nova passa na Regra de Ouro |
| **Backend** | Services materializam; erros de API com mensagem humana |
| **Frontend** | Copy sem jargão; um passo por vez; resumo antes de salvar |
| **Code review** | Recusar PR que exponha conceitos internos no caminho feliz |
| **Docs técnicos** | Referenciar este arquivo no cabeçalho quando tratar de cadastro/cardápio |

### 13.1 Architecture Freeze

A arquitetura principal do MVP está **congelada** (`17-modelo-categoria-produto.md`).

Não remodelar conceitos centrais (Receita → Produto → materialização → runtime) salvo **impedimento técnico grave**. Nesse caso: registrar o problema, propor alternativas, só então mudar.

### 13.2 MVP First

Antes de implementar:

1. Indispensável para o 1º cliente?  
2. Aumenta a simplicidade?  
3. Acelera o cadastro?  
4. Mantém esta filosofia?

Se não → `19-future-ideas.md`.

Checklist rápido antes de merge:

- [ ] Usuário responde perguntas (não “configura features”)?
- [ ] Há herança / receita quando fizer sentido?
- [ ] Alteração em massa pede confirmação?
- [ ] Runtime do cardápio permanece estável?
- [ ] Nome na UI passaria no teste da pizzaria pequena?

---

## 14. Histórico de Revisões

| Versão | Data | Descrição |
|--------|------|-----------|
| 1.2 | Jul/2026 | **Aprovado** — herança de preços (categoria vs produto); §6.8 cadastro mínimo |
| 1.1 | Jul/2026 | **Aprovado** — Architecture Freeze + MVP First |
| 1.0 | Jul/2026 | Criação — filosofia fundadora, Regra de Ouro, receita da categoria, vocabulário |

---

> **Documento aprovado.** Fonte oficial da verdade de produto. Próximo: implementação **Fase 5** (`17`).
