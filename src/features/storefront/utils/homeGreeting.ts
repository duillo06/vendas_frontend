export type HomeGreeting = {
  title: string;
  subtitle: string;
};

/** saudação leve pelo horário / fim de semana — sem inventar clima */
export function getHomeGreeting(now = new Date()): HomeGreeting {
  const day = now.getDay(); // 0 dom
  const hour = now.getHours();
  const isWeekend = day === 0 || day === 5 || day === 6; // sex–dom

  if (day === 5 && hour >= 16) {
    return {
      title: "Sextou!",
      subtitle: "Hoje é dia de pedir o que você mais ama.",
    };
  }

  if (isWeekend && hour >= 11 && hour < 15) {
    return {
      title: "Fim de semana gostoso",
      subtitle: "Combos e clássicos esperando por você.",
    };
  }

  if (hour >= 5 && hour < 11) {
    return {
      title: "Bom dia!",
      subtitle: "Que tal começar com algo especial?",
    };
  }

  if (hour >= 11 && hour < 15) {
    return {
      title: "Boa tarde!",
      subtitle: "Hora do almoço — monte o pedido sem pressa.",
    };
  }

  if (hour >= 15 && hour < 18) {
    return {
      title: "Boa tarde!",
      subtitle: "Uma pausa doce ou um café cairiam bem.",
    };
  }

  if (hour >= 18 && hour < 23) {
    return {
      title: "Boa noite!",
      subtitle: "As melhores escolhas estão saindo quentinhas.",
    };
  }

  return {
    title: "Ainda acordado?",
    subtitle: "Tem delícia pra quem pede a qualquer hora.",
  };
}

export type DayPart = "morning" | "lunch" | "afternoon" | "evening" | "late";

export function getDayPart(now = new Date()): DayPart {
  const hour = now.getHours();
  if (hour >= 5 && hour < 11) return "morning";
  if (hour >= 11 && hour < 15) return "lunch";
  if (hour >= 15 && hour < 18) return "afternoon";
  if (hour >= 18 && hour < 23) return "evening";
  return "late";
}

/** prioriza categorias do momento sem esconder as outras */
export function categoryPriorityScore(name: string, dayPart: DayPart): number {
  const n = name.toLowerCase();
  const rules: Record<DayPart, RegExp[]> = {
    morning: [/caf[eé]/i, /bebida/i, /p[aã]o/i, /bolo/i, /suco/i],
    lunch: [/executivo/i, /prato/i, /marmita/i, /almo[cç]o/i, /lanche/i, /combo/i],
    afternoon: [/caf[eé]/i, /sobremesa/i, /doce/i, /a[cç]a[ií]/i, /sorvete/i],
    evening: [/pizza/i, /hamb[uú]rguer/i, /lanche/i, /por[cç][aã]o/i, /cerveja/i],
    late: [/pizza/i, /lanche/i, /por[cç][aã]o/i, /bebida/i],
  };

  return rules[dayPart].some((re) => re.test(n)) ? 1 : 0;
}

export function getMoodLine(dayPart: DayPart): string {
  switch (dayPart) {
    case "morning":
      return "Feito com carinho pela nossa cozinha.";
    case "lunch":
      return "Esse lanche está fazendo sucesso hoje.";
    case "afternoon":
      return "Uma pausa que vale cada pedaço.";
    case "evening":
      return "Saindo quentinho pra sua mesa.";
    default:
      return "Sempre tem algo bom esperando por você.";
  }
}
