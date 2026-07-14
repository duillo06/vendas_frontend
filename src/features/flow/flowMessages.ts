import type { FlowMood } from "./FlowMascot";

// A "voz" do Flow. Sempre leve, humana e animada — nunca robótica.
export type FlowLine = {
  emoji?: string;
  title?: string;
  text: string;
  mood?: FlowMood;
};

export const flowMessages = {
  wizard: {
    basics: {
      emoji: "👋",
      title: "Olá! Vamos montar esse produto juntos",
      text: "Será rapidinho. Me conta um pouco sobre ele pra começar.",
      mood: "happy" as FlowMood,
    },
    segment: {
      emoji: "✨",
      title: "Que tipo de produto é esse?",
      text: "Isso me ajuda a preparar toda a estrutura automaticamente pra você.",
      mood: "thinking" as FlowMood,
    },
    question: {
      emoji: "🙂",
      title: "Só mais algumas perguntas",
      text: "Vou cuidando dos detalhes técnicos nos bastidores. Você só escolhe.",
      mood: "idle" as FlowMood,
    },
    options: {
      emoji: "📝",
      title: "Agora os itens que o cliente vê",
      text: "Quanto mais completo ficar, melhor será a experiência do seu cliente.",
      mood: "happy" as FlowMood,
    },
    price: {
      emoji: "🚀",
      title: "Estamos quase lá!",
      text: "Só o preço base e pronto. Você foi muito bem até aqui.",
      mood: "happy" as FlowMood,
    },
    review: {
      emoji: "🎉",
      title: "Ficou incrível!",
      text: "Dá uma última conferida e é só publicar no cardápio.",
      mood: "celebrating" as FlowMood,
    },
  },

  // fala especial quando o Flow "percebe" o segmento escolhido
  segmentIntro: {
    pizza: { emoji: "🍕", text: "Legal! Percebi que você vende pizzas. Vou preparar tudo pra você." },
    hamburguer: { emoji: "🍔", text: "Ótima escolha! Bora montar esse hambúrguer do jeito certo." },
    pastel: { emoji: "🥟", text: "Perfeito! Já já a gente configura os recheios." },
    acai: { emoji: "🥤", text: "Amei! Açaí combina com muitas opções — vou te ajudar." },
    marmita: { emoji: "🍱", text: "Show! Marmita boa é marmita bem montada." },
    cafeteria: { emoji: "☕", text: "Que aconchego! Vamos deixar seu café perfeito." },
    sobremesas: { emoji: "🍰", text: "Hmm, doçura! Vamos caprichar nessa sobremesa." },
    outro: { emoji: "🍽️", text: "Sem problema! Me conta como funciona que eu monto pra você." },
  } as Record<string, FlowLine>,

  // frases de incentivo ao avançar (rotativas)
  encouragement: [
    { emoji: "✅", text: "Excelente! Mais uma etapa concluída." },
    { emoji: "🚀", text: "Estamos avançando muito bem." },
    { emoji: "🎉", text: "Seu catálogo está ficando incrível." },
    { emoji: "✨", text: "Está ficando muito profissional." },
    { emoji: "👏", text: "Boa! Você manja disso." },
  ] as FlowLine[],

  empty: {
    options: {
      emoji: "🥬",
      title: "Nenhum item por aqui ainda",
      text: "Que tal adicionar o primeiro? Use as sugestões ou escreva o seu.",
      mood: "thinking" as FlowMood,
    },
    groups: {
      emoji: "✨",
      title: "Vamos criar o primeiro grupo juntos?",
      text: "Grupos são as escolhas que o cliente faz — tamanho, sabor, adicionais.",
      mood: "happy" as FlowMood,
    },
    generic: {
      emoji: "🌱",
      title: "Ainda está vazio por aqui",
      text: "Quando você adicionar algo, ele aparece bem aqui.",
      mood: "idle" as FlowMood,
    },
  },

  error: {
    emoji: "😕",
    title: "Ops...",
    text: "Não consegui salvar agora. Tente novamente em alguns segundos.",
    mood: "sad" as FlowMood,
  },

  loading: {
    emoji: "⏳",
    title: "Só um instante...",
    text: "Estou preparando tudo pra você.",
    mood: "loading" as FlowMood,
  },

  success: {
    emoji: "🎉",
    title: "Produto criado com sucesso!",
    text: "Agora seus clientes já podem personalizar esse produto.",
    mood: "celebrating" as FlowMood,
  },

  // passos do onboarding de boas-vindas (primeira visita)
  onboarding: [
    {
      emoji: "👋",
      title: "Bem-vindo ao FoodFlow!",
      text: "Eu sou o Flow e vou te acompanhar por aqui. Prazer!",
      mood: "happy" as FlowMood,
    },
    {
      emoji: "🍽️",
      title: "Vou ajudar a montar seu cardápio",
      text: "Sempre que precisar configurar algo, é só me seguir. Prometo que é simples.",
      mood: "idle" as FlowMood,
    },
    {
      emoji: "🚀",
      title: "Bora começar?",
      text: "Crie seu primeiro produto e eu cuido da parte chata pra você.",
      mood: "celebrating" as FlowMood,
    },
  ] as FlowLine[],
} as const;

// pega uma frase de incentivo estável para um índice (evita re-sortear a cada render)
export function encouragementFor(index: number): FlowLine {
  const list = flowMessages.encouragement;
  return list[index % list.length];
}
