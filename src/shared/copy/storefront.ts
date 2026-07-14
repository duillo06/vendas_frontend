/** Microcopies do storefront — tom acolhedor, conversão e emoção */

export const storefrontCopy = {
  home: {
    welcome: (tradeName: string) => ({
      title: `Bem-vindo à ${tradeName}`,
      subtitle: "Hoje é um ótimo dia para experimentar algo delicioso.",
    }),
    highlights: "Escolhas que a galera mais pede por aqui.",
    heroCta: "Ver cardápio",
    heroPromo: "Ver promoções",
    deliveryEstimate: (minutes: number) => `Entrega média em ${minutes} min`,
    ordersDelivered: (count: number) =>
      count >= 1000 ? `Mais de ${Math.floor(count / 100) / 10}k pedidos entregues` : `${count}+ pedidos entregues`,
    rating: (value: number) => `${value.toFixed(1)} de avaliação`,
    reviewsApprox: (count: number) =>
      count >= 1000
        ? `+${(Math.floor(count / 100) / 10).toFixed(1).replace(".0", "")}k avaliações`
        : `+${count} avaliações`,
    greetingHint: "Personalize o pedido do seu jeito.",
  },
  product: {
    favorite: "Um dos favoritos da casa — vale cada mordida.",
    unavailable: "Este item está indisponível no momento. Que tal outra opção do cardápio?",
    prepTime: (minutes: number) => `Pronto em ~${minutes} min`,
    highlightsTitle: "O que torna especial",
    relatedTitle: "Você também pode gostar",
    addToCart: "Adicionar ao carrinho",
    added: "Adicionado!",
    favoriteSaved: "Salvo nos favoritos",
    favoriteRemoved: "Removido dos favoritos",
  },
  menu: {
    subtitle: "Navegue pelas categorias ou busque o que está com vontade.",
    searchPlaceholder: "Buscar pratos, bebidas...",
    clearSearch: "Limpar",
    searchResults: (count: number, term: string) =>
      count === 0
        ? `Nenhum resultado para «${term}»`
        : count === 1
          ? `1 resultado para «${term}»`
          : `${count} resultados para «${term}»`,
    count: (total: number) =>
      total === 1 ? "1 produto disponível" : `${total} produtos disponíveis`,
    categoryFallback: "Escolha um item e monte do seu jeito.",
    empty: {
      title: "Cardápio em preparação",
      description: "Ainda não temos produtos aqui — mas estamos preparando novidades!",
    },
    searchEmpty: {
      title: "Nenhum produto encontrado",
      description: "Tente buscar outro nome ou explore as categorias.",
    },
  },
  cart: {
    empty: {
      title: "Seu carrinho está esperando por uma delícia",
      description: "Explore o cardápio e monte seu pedido — estamos prontos quando você estiver.",
      emoji: "🍕",
    },
    withItems: "Excelente escolha! Você está quase concluindo.",
    almostThere: "Estamos quase lá — só falta confirmar no checkout.",
    freeDeliveryUnlocked: "Você ganhou frete grátis neste pedido.",
    freeDeliveryHint: (remaining: number) =>
      `Faltam apenas R$ ${remaining.toFixed(2).replace(".", ",")} para ganhar frete grátis.`,
    upsellTitle: "Complete seu pedido com",
    upsellHint: "Combinações que a galera mais pede junto.",
  },
  checkout: {
    title: "Estamos quase lá",
    subtitle: "Só falta confirmar seu pedido — em poucos passos está na mesa.",
    progress: (step: number, total: number) => `Passo ${step} de ${total}`,
    summaryTitle: "Seu pedido",
    itemCount: (count: number) =>
      count === 1 ? "1 item no carrinho" : `${count} itens no carrinho`,
    confirmReassurance:
      "Ao confirmar, enviamos seu pedido direto para a cozinha. Você acompanha cada etapa em tempo real.",
    secureNote: "Seus dados são usados apenas para este pedido.",
    empty: {
      title: "Seu carrinho ainda está vazio",
      description: "Adicione itens do cardápio antes de finalizar o pedido.",
    },
    steps: {
      1: "Precisamos só dos seus dados para manter você informado sobre o pedido.",
      2: "Escolha como prefere receber — entrega ou retirada na loja.",
      3: "Selecione a forma de pagamento que for mais prática para você.",
      4: "Confira tudo com atenção. Se precisar, volte e ajuste antes de confirmar.",
    },
  },
  order: {
    confirmed: {
      title: "Pedido recebido!",
      subtitle: "Nossa equipe já começou a preparar tudo com carinho.",
      detail: "Avisaremos você quando houver novidades sobre o andamento.",
      emoji: "🎉",
    },
    delivered: "Esperamos que tenha gostado. Sua próxima visita será bem-vinda.",
    tracking: "Acompanhe cada etapa do seu pedido em tempo real.",
  },
  addToCart: {
    default: (name: string) => `Boa escolha — ${name} foi para o carrinho.`,
    returning: "Mais um item incrível no carrinho.",
  },
  account: {
    loginTitle: "Bem-vindo de volta",
    loginSubtitle: "Entre com seu telefone para ver pedidos e endereços salvos.",
    registerTitle: "Criar conta",
    registerSubtitle: "Salve seus dados e acompanhe pedidos com mais facilidade.",
    hubTitle: "Minha conta",
    hubSubtitle: "Gerencie seu perfil, pedidos e endereços.",
    ordersTitle: "Meus pedidos",
    ordersEmpty: "Você ainda não fez pedidos com esta conta.",
    addressesTitle: "Meus endereços",
    addressesEmpty: "Cadastre um endereço para agilizar suas próximas entregas.",
    guestCheckout: "Prefere não criar conta? Continue como visitante no checkout.",
    checkoutLoggedIn: (name: string) =>
      `Logado como ${name}. Seus dados e endereço padrão já foram preenchidos — você pode editar se quiser.`,
    checkoutLoginLink: "Entrar para agilizar",
  },
} as const;

export function getFreeDeliveryHint(
  subtotal: number,
  freeDeliveryAbove: number | null | undefined,
  deliveryFee: number,
): { type: "unlocked" | "hint" | null; message: string } | null {
  if (!freeDeliveryAbove || freeDeliveryAbove <= 0 || deliveryFee <= 0) {
    return null;
  }

  if (subtotal >= freeDeliveryAbove) {
    return { type: "unlocked", message: storefrontCopy.cart.freeDeliveryUnlocked };
  }

  const remaining = freeDeliveryAbove - subtotal;
  if (remaining > 0) {
    return { type: "hint", message: storefrontCopy.cart.freeDeliveryHint(remaining) };
  }

  return null;
}
