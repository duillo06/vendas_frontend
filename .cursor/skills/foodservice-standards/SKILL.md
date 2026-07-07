---
name: foodservice-standards
description: >-
  Food Service coding and UX standards for maintainable, well-commented code and
  modern guided interfaces. Use when implementing features, reviewing code, or
  when the user asks for clean code, comments, UX, or project philosophy.
---

# Food Service — Padrões de Qualidade

Complementa `docs/10-padroes-de-codigo.md` e `docs/11-guia-ui-ux.md` com o que o **dono do projeto** prioriza: código que ele mesmo consiga manter e UX que guia o usuário.

## Filosofia de código

| Princípio | Prática |
|-----------|---------|
| Legível > esperto | Nomes longos e claros; funções curtas |
| Comentários como nota sua | Curto, português informal; pode ser óbvio |
| Tom humano | Como lembrete que você escreveu — **não** cara de IA |
| Sem excesso | Uma linha; não comentar tudo; sem parágrafos |
| Otimizado com juízo | Índices, cache onde docs indicam; sem micro-otimização prematura |
| Manutenível | Seguir estrutura existente; um conceito por arquivo quando possível |

### Tom dos comentários

Escreva como **você** anotaria no código — direto, informal, sem formalidade de tutorial.

| ✅ Seu tom | ❌ Cara de IA |
|-----------|---------------|
| `# pega tenant pelo subdomínio` | `# Este método resolve o tenant a partir do Host` |
| `# loja fechada, bloqueia` | `# Regra E-15: loja fechada bloqueia checkout` |
| `// zera carrinho depois do ok` | `// Este hook envia o pedido e limpa o carrinho em caso de sucesso` |
| `# salva no banco` | `# Persiste a entidade no repositório` |

Evitar: “Este/Essa…”, “Responsável por…”, listas `1) 2) 3)`, referência a doc em todo comentário, inglês misturado sem motivo.

### Onde comentar (backend)

- O que você ainda não domina: uma linha no seu tom
- Início de service complexo: `# monta pedido: carrinho → total → salva`
- Regra importante: `# pedido mínimo R$ 20` (não precisa citar “Regra K-12” no código)

### Onde comentar (frontend)

- Hooks e efeitos: `// busca cardápio do tenant`
- JSX confuso: `// skeleton enquanto carrega`

## Filosofia de UX

| Princípio | Prática |
|-----------|---------|
| Bonito e moderno | Emerald, Inter, espaçamento generoso, `docs/04-design-system.md` |
| Interativo | Hover, feedback, animações sutis (Framer Motion com moderação) |
| Guiar o usuário | Stepper no checkout; empty states com CTA; erros com correção |
| Encontrar funcionalidades | Nav clara, busca (V1), ícones + labels no admin |
| Confiança | Preços visíveis, confirmação antes de ações destrutivas |

### Checklist rápido por tela

- [ ] Título diz o que é a tela
- [ ] Próxima ação óbvia (botão primário)
- [ ] Loading não deixa tela em branco
- [ ] Erro não perde dados do formulário
- [ ] Mobile: alvos de toque ≥ 44px no storefront

## Equilíbrio com a documentação oficial

- Comentários curtos no **seu tom** (informal, lembrete) — compatível com código claro em `10-padroes-de-codigo.md`
- Escopo fechado nos checklists — não adicionar feature fora do sprint
- Pagamento MVP manual; tenant por subdomínio — decisões fixas

## Para novos chats

Não é necessário repetir estas preferências: as **Cursor Rules** (`foodservice-core.mdc`) já aplicam automaticamente. Mencione só exceções (“neste PR sem comentários” / “sprint só backend”).
