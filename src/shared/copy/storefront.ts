/** Microcopies do storefront — tom acolhedor, sem exagero */

export const storefrontCopy = {
  home: {
    welcome: (tradeName: string) => ({
      title: `Bem-vindo à ${tradeName}`,
      subtitle: "Hoje é um ótimo dia para experimentar algo delicioso.",
    }),
    highlights: "Escolhas que a galera mais pede por aqui.",
  },
  product: {
    favorite: "Um dos favoritos da casa.",
    unavailable: "Este item está indisponível no momento. Que tal outra opção do cardápio?",
  },
  menu: {
    subtitle: "Navegue pelas categorias ou busque o que está com vontade.",
    searchPlaceholder: "Buscar pratos, bebidas...",
    count: (total: number) =>
      total === 1 ? "1 produto disponível" : `${total} produtos disponíveis`,
    categoryFallback: "Escolha um item e monte do seu jeito.",
  },
  cart: {
    empty: {
      title: "Seu carrinho está esperando por uma delícia",
      description: "Explore o cardápio e monte seu pedido com calma — estamos aqui para ajudar.",
    },
    withItems: (count: number) =>
      count === 1
        ? "Ótima escolha. Só falta mais um passo para concluir."
        : "Seu carrinho está ficando incrível. Revise os itens e siga para o checkout.",
    freeDeliveryUnlocked: "Você ganhou frete grátis neste pedido.",
    freeDeliveryHint: (remaining: number) =>
      `Faltam R$ ${remaining.toFixed(2).replace(".", ",")} para frete grátis.`,
  },
  checkout: {
    title: "Estamos quase lá",
    subtitle: "Revise seus dados com calma — em poucos passos seu pedido estará confirmado.",
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
      title: "Pedido confirmado!",
      subtitle: "Nossa equipe já começou a preparar tudo com cuidado.",
      detail: "Avisaremos você quando houver novidades sobre o andamento.",
    },
    delivered: "Esperamos que tenha gostado. Sua próxima visita será bem-vinda.",
    tracking: "Acompanhe cada etapa do seu pedido em tempo real.",
  },
  addToCart: {
    default: (name: string) => `Boa escolha — ${name} foi para o carrinho.`,
    returning: "Que bom ter você de volta. Item adicionado ao carrinho.",
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
  if (remaining > 0 && remaining <= freeDeliveryAbove * 0.5) {
    return { type: "hint", message: storefrontCopy.cart.freeDeliveryHint(remaining) };
  }

  return null;
}
