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
    tip: "Toque num produto para gerenciar — cada ajuste é um fluxo curto, sem formulário gigante.",
    form: {
      titleNew: "Novo produto",
      titleEdit: "Editor completo",
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
        "Responda como vende o produto (tamanho, borda…). Sem jargão — tudo vai pra biblioteca.",
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
    subtitle: "Tamanhos, bordas, adicionais e ingredientes — criados uma vez, usados em todo o cardápio.",
    guidance:
      "O dia a dia é no cadastro do produto (perguntas simples). Aqui você organiza e ajusta preços da casa — mudar Catupiry aqui atualiza todos os produtos.",
    createTitle: "Novo item na biblioteca",
    createHint: "Ex.: Tamanho, Borda, Adicionais. Depois o produto só escolhe o que usar.",
    examples: ["Tamanho", "Borda", "Adicionais", "Ponto da carne"],
    empty: {
      title: "Biblioteca vazia",
      description:
        "Cadastre um produto e responda as perguntas — ou crie o primeiro item aqui.",
    },
    linkProducts: "Dica: no produto use “Como você vende este produto?”.",
    editor: {
      expandHint: "Edite nome, escolhas e preços.",
      requiredHelp:
        "Obrigatório: o cliente precisa escolher (ex: tamanho). Opcional: pode pular (ex: borda).",
      optionsEmpty: "Adicione pelo menos uma escolha — Pequena, Média, Grande...",
      priceHelp: "R$ 0,00 = sem acréscimo no preço base do produto.",
      saveReminder: "Alterações entram no cardápio após salvar — e valem pra todos os produtos.",
      optionAdded: "Escolha adicionada",
      saved: "Biblioteca atualizada",
      created: "Item criado na biblioteca",
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
    subtitle: (greeting: string, period: "today" | "7d" | "30d" | "custom" = "today") => {
      if (period === "7d") return `${greeting}! Últimos 7 dias.`;
      if (period === "30d") return `${greeting}! Últimos 30 dias.`;
      if (period === "custom") return `${greeting}! Período personalizado.`;
      return `${greeting}! Resumo do dia.`;
    },
    insights: {
      title: "Resumo",
      noOrdersYet: "Ainda sem pedidos hoje",
      noOrdersPeriod: "Nenhum pedido neste período",
      ordersInPeriod: (count: number, period: "today" | "7d" | "30d" | "custom") => {
        const unit = count === 1 ? "pedido" : "pedidos";
        if (period === "today") {
          return count === 1 ? "1 pedido hoje" : `${count} pedidos hoje`;
        }
        if (period === "7d") return `${count} ${unit} em 7 dias`;
        if (period === "30d") return `${count} ${unit} em 30 dias`;
        return `${count} ${unit} no período`;
      },
      pending: (count: number) =>
        count === 1 ? "1 pendente precisa de atenção" : `${count} pendentes precisam de atenção`,
      ticket: (value: string) => `Ticket médio ${value}`,
      revenueUp: (diff: string, period: "today" | "7d" | "30d" | "custom" = "today") => {
        const vs = period === "today" ? "ontem" : "o período anterior";
        return `+${diff} vs ${vs}`;
      },
      revenueDown: (diff: string, period: "today" | "7d" | "30d" | "custom" = "today") => {
        const vs = period === "today" ? "ontem" : "o período anterior";
        return `−${diff} vs ${vs}`;
      },
      revenueSame: (period: "today" | "7d" | "30d" | "custom" = "today") =>
        period === "today" ? "Faturamento igual a ontem" : "Faturamento estável vs período anterior",
    },
    emptyOrders: {
      title: "Dia tranquilo por aqui",
      description: "Quando chegar o primeiro pedido, ele aparece nesta lista automaticamente.",
      ctaCreateProduct: "Criar meu primeiro produto",
      ctaViewOrders: "Ver fila de pedidos",
    },
    metrics: {
      orders: "Fila ao vivo abaixo",
      revenue: "Concluídos no período",
      ticket: "Por pedido concluído",
      cancelled: "Taxa sobre o total de pedidos",
    },
    kpiLabels: (period: "today" | "7d" | "30d" | "custom") => ({
      orders: period === "today" ? "Pedidos hoje" : "Pedidos",
      revenue: "Faturamento",
      ticket: "Ticket médio",
      cancelled: "Cancelamento",
    }),
    pattern: {
      title: "Padrão de vendas",
      subtitle: "Tendência, cardápio, clientes e canais",
      salesTitle: "Vendas",
      hoursTitle: "Horários",
      daysTitle: "Dias da semana",
      paymentsTitle: "Pagamentos",
      topProductsTitle: "Mais vendidos",
      slowProductsTitle: "Quase não vende",
      deliveryTitle: "Entrega × retirada",
      customersTitle: "Clientes",
      emptyTitle: "Ainda sem padrão para mostrar",
      emptyDescription:
        "Quando os pedidos começarem, mostramos horários, tendência e formas de pagamento.",
      emptyCta: "Ver fila de pedidos",
    },
  },
  settings: {
    subtitle: "Dados da loja, horários, taxas e aparência do cardápio para seus clientes.",
    hubSubtitle: "Escolha o que deseja ajustar. Tudo fica organizado por assunto.",
    guidance:
      "Alterações aqui refletem no storefront. Revise horários e taxas antes de abrir a loja.",
    hubGuidance: "Toque em uma opção para abrir só o que você precisa — sem rolar a página inteira.",
    sections: {
      company: "Nome e contato aparecem no cardápio e nas confirmações de pedido.",
      operation: "Defina quando aceitar pedidos e as regras de entrega.",
      hours: "Marque os dias fechados ou ajuste abertura e fechamento.",
      appearance:
        "Cor principal e destaque personalizam o cardápio e o painel. As mudanças aparecem ao vivo antes de salvar.",
      print:
        "Ajuste o tamanho do papel e o que sai na comanda da impressora térmica.",
      password: "Troque a senha de acesso ao painel. Use pelo menos 8 caracteres.",
    },
    contrastWarning: "Contraste baixo entre cor principal e texto — pode prejudicar a leitura.",
    toasts: {
      saved: "Configurações salvas",
      logoUploaded: "Logo atualizada",
      coverUploaded: "Capa atualizada",
      passwordChanged: "Senha alterada",
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
