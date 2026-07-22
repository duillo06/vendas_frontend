export type HomeGreeting = {
  title: string;
  subtitle: string;
};

export type DayPart = "morning" | "lunch" | "afternoon" | "evening" | "late";

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

export function getDayPart(now = new Date()): DayPart {
  const hour = now.getHours();
  if (hour >= 5 && hour < 11) return "morning";
  if (hour >= 11 && hour < 15) return "lunch";
  if (hour >= 15 && hour < 18) return "afternoon";
  if (hour >= 18 && hour < 23) return "evening";
  return "late";
}

function isWeekend(now: Date) {
  const d = now.getDay();
  return d === 0 || d === 5 || d === 6;
}

/** datas especiais leves — sobe sazonal sem UI de calendário */
export function isSeasonalWindow(now = new Date()): boolean {
  const m = now.getMonth();
  const day = now.getDate();
  // Natal / virada
  if (m === 11 && day >= 20) return true;
  if (m === 0 && day <= 2) return true;
  // Dia dos Namorados BR
  if (m === 5 && day >= 10 && day <= 12) return true;
  return false;
}

/** prioriza categorias do momento — score graduado (não só 0/1) */
export function categoryPriorityScore(name: string, dayPart: DayPart, now = new Date()): number {
  const n = name.toLowerCase();
  const rules: Record<DayPart, RegExp[]> = {
    morning: [/caf[eé]/i, /bebida/i, /p[aã]o/i, /bolo/i, /suco/i, /vitamina/i],
    lunch: [/executivo/i, /prato/i, /marmita/i, /almo[cç]o/i, /lanche/i, /combo/i, /salada/i],
    afternoon: [/caf[eé]/i, /sobremesa/i, /doce/i, /a[cç]a[ií]/i, /sorvete/i, /milkshake/i],
    evening: [/pizza/i, /hamb[uú]rguer/i, /lanche/i, /por[cç][aã]o/i, /cerveja/i, /combo/i],
    late: [/pizza/i, /lanche/i, /por[cç][aã]o/i, /bebida/i, /hamb[uú]rguer/i],
  };

  let score = 0;
  rules[dayPart].forEach((re, index) => {
    if (re.test(n)) score += rules[dayPart].length - index;
  });

  // fim de semana à noite: pizza/lanche sobem mais
  if (isWeekend(now) && (dayPart === "evening" || dayPart === "late")) {
    if (/pizza|hamb|lanche|por[cç]/i.test(n)) score += 4;
  }
  if (isSeasonalWindow(now) && /natal|especial|festa|promo/i.test(n)) {
    score += 6;
  }

  return score;
}

/** produto combina com o momento? (tags + categoria) */
export function productMomentScore(
  product: { name: string; tags: string[]; category?: { name: string } | null },
  dayPart: DayPart,
  now = new Date(),
): number {
  const blob = `${product.name} ${product.category?.name ?? ""} ${product.tags.join(" ")}`.toLowerCase();
  const tagBoosts: Record<DayPart, RegExp[]> = {
    morning: [/caf[eé]/i, /manhã/i, /breakfast/i, /p[aã]o/i],
    lunch: [/almo[cç]o/i, /executivo/i, /marmita/i, /combo/i],
    afternoon: [/sobremesa/i, /doce/i, /a[cç]a[ií]/i, /sorvete/i],
    evening: [/jantar/i, /noite/i, /pizza/i, /hamb/i],
    late: [/noite/i, /madrugada/i, /pizza/i],
  };

  let score = categoryPriorityScore(product.category?.name ?? "", dayPart, now);
  tagBoosts[dayPart].forEach((re, i) => {
    if (re.test(blob)) score += 3 + (tagBoosts[dayPart].length - i);
  });
  if (isSeasonalWindow(now) && /natal|especial|festa/i.test(blob)) score += 8;
  return score;
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

export function momentBlockCopy(dayPart: DayPart): { title: string; description: string } {
  switch (dayPart) {
    case "morning":
      return { title: "Pro manhã", description: "Começos leves e cheios de sabor." };
    case "lunch":
      return { title: "Pro almoço", description: "Escolhas certeiras pra essa hora." };
    case "afternoon":
      return { title: "Pro lanche da tarde", description: "Uma pausa que cai bem agora." };
    case "evening":
      return { title: "Pro jantar", description: "Clássicos pra noite." };
    default:
      return { title: "Pro agora", description: "Opções que combinam com essa hora." };
  }
}

/** filas extras do ticker conforme o momento */
export function dayPartTickerHints(dayPart: DayPart, now = new Date()): string[] {
  const hints: string[] = [];
  const mood = getMoodLine(dayPart);
  hints.push(`💬 ${mood}`);

  switch (dayPart) {
    case "morning":
      hints.push("☀️ Manhã perfeita pra um café ou algo leve");
      break;
    case "lunch":
      hints.push("🍽️ Hora do almoço — executivos e combos te esperam");
      break;
    case "afternoon":
      hints.push("🍰 Tarde pedindo sobremesa ou um café");
      break;
    case "evening":
      hints.push(isWeekend(now) ? "🌙 Sextou/fim de semana — pizza e lanches em alta" : "🌙 Noite boa pra um clássico da casa");
      break;
    default:
      hints.push("🌃 Ainda dá tempo de pedir algo gostoso");
  }

  if (isSeasonalWindow(now)) {
    hints.push("🎄 Tem clima de data especial por aqui");
  }

  return hints;
}
