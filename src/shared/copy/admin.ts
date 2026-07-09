export const adminCopy = {
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
        confirmed: "Confirmado. Inicie o preparo quando começar a montar.",
        preparing: "Em preparo. Marque como pronto quando finalizar.",
        ready: "Pronto! Para entrega, envie ao motoboy; para retirada, aguarde o cliente.",
        out_for_delivery: "Saiu para entrega — conclua quando o pedido chegar ao cliente.",
        completed: "Pedido concluído. Bom trabalho!",
        cancelled: "Pedido cancelado.",
      },
    },
    toasts: {
      statusUpdated: "Status atualizado",
      paymentRegistered: "Pagamento registrado",
    },
  },
  categories: {
    subtitle: "Organize o cardápio em seções — o cliente navega por elas no app.",
    guidance: "Crie categorias antes dos produtos. Nomes curtos funcionam melhor no mobile.",
    createTitle: "Nova categoria",
    createHint: "Exemplos: Pizzas, Bebidas, Sobremesas. Depois cadastre produtos em cada uma.",
    examples: ["Pizzas", "Bebidas", "Sobremesas", "Combos"],
    empty: {
      title: "Nenhuma categoria ainda",
      description: "Comece com as principais do seu cardápio. Em seguida, cadastre os produtos.",
    },
    linkProducts: "Próximo passo: cadastre produtos e escolha a categoria de cada um.",
    deleteConfirm: "Produtos desta categoria não serão excluídos — só a organização muda.",
    toasts: {
      created: "Categoria criada",
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
