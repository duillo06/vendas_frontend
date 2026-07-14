export const adminCopy = {
  wizard: {
    pageTitle: "Novo produto",
    pageSubtitle: "Vou te guiar passo a passo — sem formulário gigante.",
    advancedLink: "Configurações avançadas",
    advancedHint: "Prefere o formulário técnico completo? Abra o modo avançado.",
    basics: {
      title: "Vamos configurar este produto",
      subtitle: "Primeiro, conte um pouco sobre ele.",
    },
    segment: {
      title: "Como este produto é vendido?",
      subtitle: "Escolha o tipo mais parecido — é só pra eu sugerir o melhor caminho.",
    },
    price: {
      title: "Qual o preço base?",
      subtitle: "🚀 Falta pouco! Só o valor inicial do produto.",
    },
    review: {
      title: "Excelente! Seu produto está quase pronto",
      subtitle: "Revise o resumo abaixo e publique quando quiser.",
    },
    optionsSubtitle: "Adicione os itens que o cliente vai ver. Dá pra usar as sugestões.",
    success: "🎉 Produto criado com sucesso!",
    error: "Não foi possível criar o produto. Tente novamente.",
  },
  products: {
    subtitle: "Organize o cardápio que seus clientes veem no app.",
    empty: {
      title: "Seu cardápio ainda está começando",
      description:
        "Cadastre o primeiro produto com foto, preço e categoria. Em minutos ele aparece no storefront.",
    },
    tip: "Dica: produtos com foto e descrição clara convertem mais no delivery.",
    form: {
      titleNew: "Novo produto",
      titleEdit: "Editar produto",
      subtitleNew: "Vamos cadastrar um item completo para vender melhor.",
      subtitleEdit: "Ajuste as informações e mantenha o cardápio atualizado.",
      guidance: "Preencha os campos abaixo e, no final, revise se nome, preço e categoria estão corretos.",
      checklistTitle: "Checklist rápido",
      checklist: {
        photo: "Foto ajuda a aumentar cliques e pedidos.",
        name: "Nome claro facilita a decisão do cliente.",
        price: "Preço correto evita atrito no checkout.",
        category: "Categoria mantém o cardápio organizado.",
      },
      noCategories: {
        title: "Cadastre uma categoria primeiro",
        description: "Sem categoria, o produto não pode ser salvo. Crie uma em poucos segundos.",
      },
      optionGroupsHelp:
        "Vincule grupos como Tamanho e Adicionais para o cliente montar o item sem erro.",
      successNew: "Produto cadastrado com sucesso",
      successEdit: "Produto atualizado com sucesso",
      imagesHelp:
        "Adicione até 5 fotos. Toque em «Capa» na foto que deve aparecer no cardápio e na listagem.",
      imageLimit: "Limite de 5 fotos por produto. Remova uma para adicionar outra.",
      imageUploaded: "Foto adicionada",
      imageDeleted: "Foto removida",
      primarySet: "Capa atualizada",
      previewTitle: "Prévia no cardápio",
      previewHint: "É assim que o cliente vê o produto na vitrine.",
    },
  },
  optionGroups: {
    subtitle: "Monte variações que o cliente escolhe no pedido — tamanho, borda, adicionais.",
    guidance:
      "Crie um grupo, adicione as opções e vincule aos produtos. O cliente vê tudo organizado no cardápio.",
    createTitle: "Criar novo grupo",
    createHint: "Exemplos: Tamanho, Borda recheada, Adicionais. Depois expanda o grupo para cadastrar as opções.",
    examples: ["Tamanho", "Borda", "Adicionais", "Ponto da carne"],
    empty: {
      title: "Nenhum grupo ainda",
      description:
        "Comece com algo simples como Tamanho (P, M, G). Depois vincule o grupo no cadastro de produtos.",
    },
    linkProducts: "Próximo passo: vincule estes grupos aos produtos em Produtos → editar item.",
    editor: {
      expandHint: "Expanda para editar nome, opções e acréscimos.",
      requiredHelp:
        "Obrigatório: o cliente precisa escolher (ex: tamanho da pizza). Opcional: pode pular (ex: borda extra).",
      optionsEmpty: "Adicione pelo menos uma opção — Pequena, Média, Grande...",
      priceHelp: "R$ 0,00 = sem acréscimo no preço base do produto.",
      saveReminder: "Alterações só entram no cardápio após clicar em Salvar alterações.",
      optionAdded: "Opção adicionada ao grupo",
      saved: "Grupo atualizado com sucesso",
      created: "Grupo criado — agora cadastre as opções",
    },
  },
  orders: {
    subtitle: "Acompanhe pedidos em tempo real e avance cada etapa com um clique.",
    guidance:
      "A lista atualiza sozinha. Toque em um pedido para ver itens, endereço e registrar pagamento.",
    searchHint: "Busque por número do pedido, nome ou telefone do cliente.",
    activeOnlyHelp: "Desmarque para ver pedidos concluídos e cancelados do dia.",
    empty: {
      title: "Nenhum pedido por aqui",
      filtered: "Nenhum pedido com esses filtros. Tente outro status ou limpe a busca.",
      waiting: "Quando chegar o primeiro pedido do dia, ele aparece aqui automaticamente.",
    },
    detail: {
      actionsTitle: "Próximo passo",
      cancelHint: "Informe o motivo do cancelamento — o cliente pode ver essa observação.",
      paymentPending: "Pagamento ainda pendente. Registre quando receber na entrega ou retirada.",
      paymentPaid: "Pagamento confirmado.",
      statusHints: {
        pending: "Pedido novo — confirme para avisar a cozinha e o cliente.",
        confirmed: "Confirmado. Agora envie para produção.",
        preparing: "A cozinha está trabalhando. Marque pronto quando finalizar.",
        ready: "Pronto! Entrega: envie ao motoboy. Retirada: aguarde o cliente.",
        out_for_delivery: "A caminho — conclua quando chegar ao cliente.",
        completed: "Pedido concluído. Mais um cliente feliz!",
        cancelled: "Pedido cancelado.",
      },
      toastCompleted: "Mais um cliente feliz — pedido concluído!",
    },
    toasts: {
      statusUpdated: "Status atualizado",
      paymentRegistered: "Pagamento registrado",
      orderCompleted: "Mais um cliente feliz!",
    },
  },
  categories: {
    subtitle: "Organize o cardápio em seções — o cliente navega por elas no app.",
    guidance: "Crie categorias antes dos produtos. Nomes curtos funcionam melhor no mobile.",
    createTitle: "Nova categoria",
    createHint: "Exemplos: Pizzas 🍕, Bebidas 🥤. O emoji aparece na navegação do cardápio.",
    emojiLabel: "Emoji (opcional)",
    emojiPlaceholder: "Ex: 🍕",
    emojiHelp: "Toque em um emoji abaixo ou cole o seu — deixa a categoria mais visual no app.",
    examples: [
      { name: "Pizzas", emoji: "🍕" },
      { name: "Bebidas", emoji: "🥤" },
      { name: "Sobremesas", emoji: "🍰" },
      { name: "Combos", emoji: "🍱" },
    ] as const,
    emojiSuggestions: ["🍕", "🍔", "🌮", "🍟", "🍣", "🥤", "☕", "🍰", "🍱", "🥗", "🍗", "🌭"],
    empty: {
      title: "Nenhuma categoria ainda",
      description: "Comece com as principais do seu cardápio. Em seguida, cadastre os produtos.",
    },
    linkProducts: "Próximo passo: cadastre produtos e escolha a categoria de cada um.",
    deleteConfirm: "Produtos desta categoria não serão excluídos — só a organização muda.",
    toasts: {
      created: "Categoria criada",
      updated: "Categoria atualizada",
      removed: "Categoria removida",
    },
  },
  dashboard: {
    subtitle: (greeting: string) => `${greeting}! Aqui está o resumo do dia.`,
    guidance: "Pedidos novos aparecem em tempo real. Clique em um card para ir direto ao detalhe.",
    pendingAlert: (count: number) =>
      count === 1
        ? "Você tem 1 pedido aguardando confirmação."
        : `Você tem ${count} pedidos aguardando confirmação.`,
    progressLabel: "Progresso do dia",
    insights: {
      title: "Resumo inteligente",
      noOrdersYet: "Ainda não chegou pedido hoje — tudo pronto para quando a fila começar.",
      ordersToday: (count: number) =>
        count === 1 ? "Hoje já entrou 1 pedido." : `Hoje já entraram ${count} pedidos.`,
      pending: (count: number) =>
        count === 1
          ? "1 pedido em atraso de confirmação precisa de atenção."
          : `${count} pedidos pendentes precisam de atenção.`,
      ticket: (value: string) => `Ticket médio de ${value} nos pedidos concluídos.`,
      revenueUp: (diff: string) => `Você faturou ${diff} a mais que ontem.`,
      revenueDown: (diff: string) => `Faturamento ${diff} abaixo de ontem — vale revisar o ritmo.`,
      revenueSame: "Faturamento no mesmo patamar de ontem.",
      vsYesterdayOrders: (diff: number) =>
        diff > 0
          ? `${diff} pedido${diff === 1 ? "" : "s"} a mais que ontem.`
          : diff < 0
            ? `${Math.abs(diff)} pedido${Math.abs(diff) === 1 ? "" : "s"} a menos que ontem.`
            : "Mesmo volume de pedidos que ontem.",
    },
    emptyOrders: {
      title: "Dia tranquilo por aqui",
      description: "Quando chegar o primeiro pedido, ele aparece nesta lista automaticamente.",
    },
    metrics: {
      ordersToday: "Total de pedidos recebidos hoje.",
      revenue: "Soma dos pedidos concluídos hoje.",
      ticket: "Valor médio por pedido concluído.",
      cancelled: "Cancelamentos do dia — vale revisar se subir.",
    },
  },
  settings: {
    subtitle: "Dados da loja, horários, taxas e aparência do cardápio para seus clientes.",
    guidance:
      "Alterações aqui refletem no storefront. Revise horários e taxas antes de abrir a loja.",
    sections: {
      company: "Nome e contato aparecem no cardápio e nas confirmações de pedido.",
      operation: "Defina quando aceitar pedidos e as regras de entrega.",
      hours: "Marque os dias fechados ou ajuste abertura e fechamento.",
      appearance:
        "Cor principal e destaque personalizam o cardápio e o painel. As mudanças aparecem ao vivo antes de salvar.",
    },
    contrastWarning: "Contraste baixo entre cor principal e texto — pode prejudicar a leitura.",
    toasts: {
      saved: "Configurações salvas",
      logoUploaded: "Logo atualizada",
      coverUploaded: "Capa atualizada",
    },
  },
  customers: {
    subtitle: "Veja quem compra na sua loja e o histórico de cada cliente.",
    guidance: "Clientes com conta aparecem com telefone vinculado. Busque por nome ou telefone.",
    searchHint: "Busque por nome, telefone ou e-mail.",
    empty: {
      title: "Nenhum cliente ainda",
      description: "Quando chegarem pedidos, os clientes aparecem aqui automaticamente.",
      filtered: "Nenhum cliente com essa busca.",
    },
    detail: {
      metrics: "Resumo de compras deste cliente na sua loja.",
      orders: "Pedidos recentes — clique para ver detalhes no painel de pedidos.",
      addresses: "Endereços salvos na conta do cliente.",
    },
  },
} as const;
