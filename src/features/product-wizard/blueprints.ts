import type { BuilderFieldsState } from "@/features/catalog/components/OptionGroupBuilderFields";
import type { Blueprint, GroupSpec, WizardGroup } from "./types";

// default cru de um grupo — o blueprint sobrescreve só o que importa
const BASE_FIELDS: BuilderFieldsState = {
  description: "",
  selection_type: "single",
  selection_mode: "pick",
  display_type: "cards",
  visibility: "always",
  min_selections: 1,
  max_selections: 1,
  is_required: true,
  icon: "",
  ui_hint: "",
  show_when_group_id: "",
  show_when_option_ids: [],
  pricing_config: { strategy: "additive" },
};

// junta o parcial do blueprint com o default e devolve fields completo
export function resolveFields(partial: Partial<BuilderFieldsState>): BuilderFieldsState {
  return { ...BASE_FIELDS, ...partial, icon: partial.icon ?? "" };
}

// materializa um GroupSpec (do blueprint) num WizardGroup (estado de trabalho)
export function specToGroup(spec: GroupSpec, questionId: string): WizardGroup {
  return {
    key: `${questionId}:${spec.key}`,
    name: spec.name,
    emoji: spec.emoji,
    optionsPrompt: spec.optionsPrompt,
    optionsHelp: spec.optionsHelp,
    suggestions: spec.suggestions ?? [],
    fields: resolveFields({ ...spec.fields, icon: spec.emoji ?? spec.fields.icon }),
  };
}

// ---- presets de config pra deixar os blueprints curtos e legíveis ----

// escolha única obrigatória (ex: tamanho, tipo de massa)
const pickOneRequired: Partial<BuilderFieldsState> = {
  selection_type: "single",
  min_selections: 1,
  max_selections: 1,
  is_required: true,
  display_type: "cards",
};

// escolha única opcional
const pickOneOptional: Partial<BuilderFieldsState> = {
  selection_type: "single",
  min_selections: 0,
  max_selections: 1,
  is_required: false,
  display_type: "cards",
};

// várias opções, livre (adicionais)
const pickManyOptional: Partial<BuilderFieldsState> = {
  selection_type: "multiple",
  selection_mode: "quantity",
  min_selections: 0,
  max_selections: 0,
  is_required: false,
  display_type: "stepper",
};

// sabores comuns sugeridos (chips) — usado nas escolhas de sabor da pizza
const PIZZA_FLAVORS = ["Mussarela", "Calabresa", "Frango c/ catupiry", "Portuguesa", "Marguerita"];

// ---- blueprints ----

const pizza: Blueprint = {
  id: "pizza",
  emoji: "🍕",
  label: "Pizza",
  tagline: "Sabores, borda e adicionais",
  intro: "Boa escolha! Vamos deixar sua pizza do jeitinho que o cliente ama.",
  rootQuestions: ["sabores", "borda", "adicionais"],
  questions: {
    sabores: {
      id: "sabores",
      emoji: "🍕",
      title: "Como seus clientes escolhem os sabores?",
          subtitle: "Isso libera as próximas perguntas no cadastro.",
      choices: [
        {
          key: "fixo",
          label: "É um sabor fixo",
          emoji: "🍕",
          description: "Este produto já é um sabor específico (ex: Frango c/ catupiry). O cliente não escolhe sabor.",
        },
        {
          key: "um",
          label: "Cliente escolhe 1 sabor",
          emoji: "1️⃣",
          description: "Uma pizza; o cliente escolhe 1 sabor da sua lista.",
          produces: [
            {
              key: "sabores",
              name: "Sabores",
              emoji: "🍕",
              optionsPrompt: "Quais sabores você oferece?",
              optionsHelp: "Liste todos os sabores do seu cardápio. O cliente vai escolher 1 deles.",
              suggestions: PIZZA_FLAVORS,
              fields: { ...pickOneRequired, ui_hint: "Escolha o sabor" },
            },
          ],
        },
        {
          key: "dois",
          label: "Cliente pode combinar até 2 sabores",
          emoji: "2️⃣",
          description:
            "Opcional: este produto já é 1 sabor; o cliente pode acrescentar outro se quiser (meio a meio).",
          composition: {
            label: "Escolher 2º sabor (opcional)",
            min_parts: 1,
            max_parts: 2,
            pricing_rule: "highest",
          },
        },
        {
          key: "tres",
          label: "Cliente pode combinar até 3 sabores",
          emoji: "3️⃣",
          description:
            "Opcional: este produto é 1 sabor e o cliente pode acrescentar até mais 2 cadastrados.",
          composition: {
            label: "Escolher outros sabores (opcional)",
            min_parts: 1,
            max_parts: 3,
            pricing_rule: "highest",
          },
        },
        {
          key: "quatro",
          label: "Cliente combina até 4 sabores",
          emoji: "4️⃣",
          description: "Este produto é 1 sabor e o cliente pode adicionar até mais 3 já cadastrados.",
          composition: {
            label: "Escolher outros sabores",
            min_parts: 1,
            max_parts: 4,
            pricing_rule: "highest",
          },
        },
        {
          key: "custom",
          label: "Quero personalizar",
          emoji: "✨",
          description: "O cliente combina quantos sabores quiser (todos já cadastrados).",
          composition: {
            label: "Escolher outros sabores",
            min_parts: 1,
            max_parts: 6,
            pricing_rule: "highest",
          },
        },
      ],
    },
    borda: {
      id: "borda",
      emoji: "🧀",
      title: "Sua pizza tem borda recheada?",
      choices: [
        {
          key: "sim",
          label: "Sim",
          emoji: "✅",
          produces: [
            {
              key: "borda",
              name: "Borda recheada",
              emoji: "🧀",
              optionsPrompt: "Quais bordas você oferece?",
              suggestions: ["Catupiry", "Cheddar", "Chocolate", "Sem borda"],
              fields: { ...pickOneOptional, ui_hint: "Escolha a borda (opcional)" },
            },
          ],
        },
        { key: "nao", label: "Não", emoji: "🚫" },
      ],
    },
    adicionais: {
      id: "adicionais",
      emoji: "🥓",
      title: "Deseja oferecer adicionais?",
      choices: [
        {
          key: "sim",
          label: "Sim",
          emoji: "✅",
          produces: [
            {
              key: "adicionais",
              name: "Adicionais",
              emoji: "🥓",
              optionsPrompt: "Quais adicionais você oferece?",
              suggestions: ["Bacon", "Catupiry extra", "Cheddar", "Borda extra"],
              fields: { ...pickManyOptional, ui_hint: "Turbine sua pizza" },
            },
          ],
        },
        { key: "nao", label: "Não", emoji: "🚫" },
      ],
    },
  },
};

const hamburguer: Blueprint = {
  id: "hamburguer",
  emoji: "🍔",
  label: "Hambúrguer",
  tagline: "Pronto ou o cliente monta",
  intro: "Show! Vamos montar seu hambúrguer.",
  rootQuestions: ["modo"],
  questions: {
    modo: {
      id: "modo",
      emoji: "🍔",
      title: "Como deseja vender este hambúrguer?",
      choices: [
        {
          key: "pronto",
          label: "Produto pronto",
          emoji: "🍔",
          description: "Você define a receita; o cliente só pode adicionar extras.",
          unlocks: ["extras"],
        },
        {
          key: "monta",
          label: "O cliente monta",
          emoji: "🧑‍🍳",
          description: "O cliente escolhe pão, carne, queijo e o resto.",
          produces: [
            { key: "pao", name: "Pão", emoji: "🍞", optionsPrompt: "Quais pães você oferece?", suggestions: ["Brioche", "Australiano", "Tradicional"], fields: { ...pickOneRequired } },
            { key: "carne", name: "Carne", emoji: "🥩", optionsPrompt: "Quais carnes você oferece?", suggestions: ["Bovina 120g", "Bovina 180g", "Frango", "Vegana"], fields: { ...pickOneRequired } },
            { key: "queijo", name: "Queijo", emoji: "🧀", optionsPrompt: "Quais queijos você oferece?", suggestions: ["Cheddar", "Mussarela", "Prato", "Sem queijo"], fields: { ...pickOneOptional } },
            { key: "vegetais", name: "Vegetais", emoji: "🥬", optionsPrompt: "Quais vegetais você oferece?", suggestions: ["Alface", "Tomate", "Cebola", "Picles"], fields: { ...pickManyOptional, selection_mode: "pick", display_type: "checkbox" } },
            { key: "molhos", name: "Molhos", emoji: "🥫", optionsPrompt: "Quais molhos você oferece?", suggestions: ["Barbecue", "Maionese da casa", "Mostarda e mel"], fields: { ...pickManyOptional, selection_mode: "pick", display_type: "checkbox" } },
            { key: "adicionais", name: "Adicionais", emoji: "🥓", optionsPrompt: "Quais adicionais você oferece?", suggestions: ["Bacon", "Ovo", "Carne extra", "Cheddar extra"], fields: { ...pickManyOptional } },
          ],
        },
      ],
    },
    extras: {
      id: "extras",
      emoji: "🥓",
      title: "Quer oferecer adicionais?",
      choices: [
        {
          key: "sim",
          label: "Sim",
          emoji: "✅",
          produces: [
            { key: "adicionais", name: "Adicionais", emoji: "🥓", optionsPrompt: "Quais adicionais você oferece?", suggestions: ["Bacon", "Ovo", "Carne extra", "Cheddar extra"], fields: { ...pickManyOptional } },
          ],
        },
        { key: "nao", label: "Não", emoji: "🚫" },
      ],
    },
  },
};

const pastel: Blueprint = {
  id: "pastel",
  emoji: "🥟",
  label: "Pastel",
  tagline: "Pronto ou monte o seu",
  intro: "Vamos configurar seu pastel!",
  rootQuestions: ["modo"],
  questions: {
    modo: {
      id: "modo",
      emoji: "🥟",
      title: "Como deseja vender?",
      choices: [
        { key: "pronto", label: "Pastel pronto", emoji: "🥟", unlocks: ["molhos"] },
        {
          key: "monta",
          label: "Monte seu pastel",
          emoji: "🧑‍🍳",
          produces: [
            { key: "massa", name: "Tipo da massa", emoji: "🌾", optionsPrompt: "Quais massas você oferece?", suggestions: ["Tradicional", "Integral"], fields: { ...pickOneRequired } },
            { key: "recheios", name: "Recheios", emoji: "🧀", optionsPrompt: "Quais recheios você oferece?", suggestions: ["Carne", "Queijo", "Frango c/ catupiry", "Pizza"], fields: { selection_type: "multiple", min_selections: 1, max_selections: 3, is_required: true, display_type: "cards", ui_hint: "Escolha os recheios" } },
            { key: "extras", name: "Recheios extras", emoji: "➕", optionsPrompt: "Quais recheios extras?", suggestions: ["Bacon", "Catupiry", "Cheddar"], fields: { ...pickManyOptional } },
            { key: "molhos", name: "Molhos", emoji: "🥫", optionsPrompt: "Quais molhos você oferece?", suggestions: ["Alho", "Pimenta", "Maionese"], fields: { ...pickManyOptional, selection_mode: "pick", display_type: "checkbox" } },
          ],
        },
      ],
    },
    molhos: {
      id: "molhos",
      emoji: "🥫",
      title: "Quer oferecer molhos ou bebidas?",
      choices: [
        {
          key: "sim",
          label: "Sim",
          emoji: "✅",
          produces: [
            { key: "molhos", name: "Molhos", emoji: "🥫", optionsPrompt: "Quais molhos você oferece?", suggestions: ["Alho", "Pimenta", "Maionese"], fields: { ...pickManyOptional, selection_mode: "pick", display_type: "checkbox" } },
            { key: "bebidas", name: "Bebidas", emoji: "🥤", optionsPrompt: "Quais bebidas você oferece?", suggestions: ["Refrigerante lata", "Suco", "Água"], fields: { ...pickManyOptional } },
          ],
        },
        { key: "nao", label: "Não", emoji: "🚫" },
      ],
    },
  },
};

const acai: Blueprint = {
  id: "acai",
  emoji: "🥤",
  label: "Açaí",
  tagline: "Tamanho, frutas e complementos",
  intro: "Bora montar um açaí irresistível!",
  rootQuestions: ["modo"],
  questions: {
    modo: {
      id: "modo",
      emoji: "🥤",
      title: "Como o cliente monta o açaí?",
      choices: [
        { key: "pronto", label: "Açaí pronto", emoji: "🥤", unlocks: ["complementos"] },
        {
          key: "monta",
          label: "Cliente monta",
          emoji: "🧑‍🍳",
          produces: [
            { key: "tamanho", name: "Tamanho", emoji: "📏", optionsPrompt: "Quais tamanhos você oferece?", suggestions: ["300ml", "500ml", "700ml"], fields: { ...pickOneRequired } },
            { key: "frutas", name: "Frutas", emoji: "🍓", optionsPrompt: "Quais frutas você oferece?", suggestions: ["Morango", "Banana", "Kiwi", "Manga"], fields: { ...pickManyOptional, selection_mode: "pick", display_type: "checkbox" } },
            { key: "coberturas", name: "Coberturas", emoji: "🍫", optionsPrompt: "Quais coberturas você oferece?", suggestions: ["Leite condensado", "Chocolate", "Mel"], fields: { ...pickManyOptional, selection_mode: "pick", display_type: "checkbox" } },
            { key: "cremes", name: "Cremes", emoji: "🍨", optionsPrompt: "Quais cremes você oferece?", suggestions: ["Ninho", "Ovomaltine", "Nutella"], fields: { ...pickManyOptional } },
            { key: "complementos", name: "Complementos", emoji: "🥣", optionsPrompt: "Quais complementos você oferece?", suggestions: ["Granola", "Paçoca", "Leite em pó", "Bis"], fields: { ...pickManyOptional } },
          ],
        },
      ],
    },
    complementos: {
      id: "complementos",
      emoji: "🥣",
      title: "Quer oferecer complementos?",
      choices: [
        {
          key: "sim",
          label: "Sim",
          emoji: "✅",
          produces: [
            { key: "complementos", name: "Complementos", emoji: "🥣", optionsPrompt: "Quais complementos você oferece?", suggestions: ["Granola", "Paçoca", "Leite em pó", "Bis"], fields: { ...pickManyOptional } },
          ],
        },
        { key: "nao", label: "Não", emoji: "🚫" },
      ],
    },
  },
};

const marmita: Blueprint = {
  id: "marmita",
  emoji: "🍱",
  label: "Marmita",
  tagline: "Tamanho, proteínas e acompanhamentos",
  intro: "Vamos configurar sua marmita!",
  rootQuestions: ["modo"],
  questions: {
    modo: {
      id: "modo",
      emoji: "🍱",
      title: "Como funciona a marmita?",
      choices: [
        { key: "pronta", label: "Marmita pronta", emoji: "🍱", unlocks: ["adicionais"] },
        {
          key: "monta",
          label: "Cliente escolhe tamanho e itens",
          emoji: "🧑‍🍳",
          produces: [
            { key: "tamanho", name: "Tamanho", emoji: "📏", optionsPrompt: "Quais tamanhos você oferece?", suggestions: ["P", "M", "G"], fields: { ...pickOneRequired } },
            { key: "proteinas", name: "Proteínas", emoji: "🍗", optionsPrompt: "Quais proteínas você oferece?", suggestions: ["Frango grelhado", "Carne", "Peixe", "Ovo"], fields: { selection_type: "multiple", min_selections: 1, max_selections: 2, is_required: true, display_type: "cards", ui_hint: "Escolha as proteínas" } },
            { key: "acompanhamentos", name: "Acompanhamentos", emoji: "🍚", optionsPrompt: "Quais acompanhamentos você oferece?", suggestions: ["Arroz", "Feijão", "Salada", "Farofa"], fields: { ...pickManyOptional, selection_mode: "pick", display_type: "checkbox" } },
            { key: "adicionais", name: "Adicionais", emoji: "➕", optionsPrompt: "Quais adicionais você oferece?", suggestions: ["Ovo frito", "Bacon", "Queijo"], fields: { ...pickManyOptional } },
          ],
        },
      ],
    },
    adicionais: {
      id: "adicionais",
      emoji: "➕",
      title: "Quer oferecer adicionais?",
      choices: [
        {
          key: "sim",
          label: "Sim",
          emoji: "✅",
          produces: [
            { key: "adicionais", name: "Adicionais", emoji: "➕", optionsPrompt: "Quais adicionais você oferece?", suggestions: ["Ovo frito", "Bacon", "Queijo"], fields: { ...pickManyOptional } },
          ],
        },
        { key: "nao", label: "Não", emoji: "🚫" },
      ],
    },
  },
};

const cafeteria: Blueprint = {
  id: "cafeteria",
  emoji: "☕",
  label: "Cafeteria",
  tagline: "Tamanho, leite e extras",
  intro: "Vamos preparar seu café!",
  rootQuestions: ["modo"],
  questions: {
    modo: {
      id: "modo",
      emoji: "☕",
      title: "Como o cliente escolhe?",
      choices: [
        {
          key: "tamanho",
          label: "Escolhe tamanho e extras",
          emoji: "☕",
          produces: [
            { key: "tamanho", name: "Tamanho", emoji: "📏", optionsPrompt: "Quais tamanhos você oferece?", suggestions: ["Pequeno", "Médio", "Grande"], fields: { ...pickOneRequired } },
            { key: "leite", name: "Tipo de leite", emoji: "🥛", optionsPrompt: "Quais tipos de leite?", suggestions: ["Integral", "Desnatado", "Vegetal"], fields: { ...pickOneOptional } },
            { key: "extras", name: "Extras", emoji: "✨", optionsPrompt: "Quais extras você oferece?", suggestions: ["Dose extra", "Chantilly", "Calda de caramelo"], fields: { ...pickManyOptional } },
          ],
        },
        { key: "simples", label: "Produto simples", emoji: "🥐", description: "Sem escolhas — só o item." },
      ],
    },
  },
};

const sobremesas: Blueprint = {
  id: "sobremesas",
  emoji: "🍰",
  label: "Sobremesas",
  tagline: "Pronta ou monte a sua",
  intro: "Hora do doce! Vamos configurar.",
  rootQuestions: ["modo"],
  questions: {
    modo: {
      id: "modo",
      emoji: "🍰",
      title: "Como deseja vender?",
      choices: [
        { key: "pronta", label: "Sobremesa pronta", emoji: "🍰", unlocks: ["caldas"] },
        {
          key: "monta",
          label: "Cliente monta",
          emoji: "🧑‍🍳",
          produces: [
            { key: "tamanho", name: "Tamanho", emoji: "📏", optionsPrompt: "Quais tamanhos você oferece?", suggestions: ["Individual", "Para dividir"], fields: { ...pickOneRequired } },
            { key: "sabores", name: "Sabores", emoji: "🍫", optionsPrompt: "Quais sabores você oferece?", suggestions: ["Chocolate", "Morango", "Ninho"], fields: { ...pickOneRequired } },
            { key: "caldas", name: "Caldas", emoji: "🍯", optionsPrompt: "Quais caldas você oferece?", suggestions: ["Chocolate", "Caramelo", "Morango"], fields: { ...pickManyOptional, selection_mode: "pick", display_type: "checkbox" } },
            { key: "complementos", name: "Complementos", emoji: "✨", optionsPrompt: "Quais complementos você oferece?", suggestions: ["Granulado", "Confete", "Frutas"], fields: { ...pickManyOptional } },
          ],
        },
      ],
    },
    caldas: {
      id: "caldas",
      emoji: "🍯",
      title: "Quer oferecer caldas ou complementos?",
      choices: [
        {
          key: "sim",
          label: "Sim",
          emoji: "✅",
          produces: [
            { key: "caldas", name: "Caldas", emoji: "🍯", optionsPrompt: "Quais caldas você oferece?", suggestions: ["Chocolate", "Caramelo", "Morango"], fields: { ...pickManyOptional, selection_mode: "pick", display_type: "checkbox" } },
          ],
        },
        { key: "nao", label: "Não", emoji: "🚫" },
      ],
    },
  },
};

const outro: Blueprint = {
  id: "outro",
  emoji: "🍽️",
  label: "Outro",
  tagline: "Monte do seu jeito",
  intro: "Sem problema! Vamos entender como seu produto funciona.",
  rootQuestions: ["modo"],
  questions: {
    modo: {
      id: "modo",
      emoji: "🍽️",
      title: "Como seu cliente escolhe este produto?",
      subtitle: "A partir daqui eu monto a estrutura pra você.",
      choices: [
        {
          key: "uma",
          label: "Escolhe apenas uma opção",
          emoji: "🎯",
          description: "Ex: tamanho, sabor único.",
          produces: [
            { key: "opcoes", name: "Opções", emoji: "🎯", optionsPrompt: "Quais opções o cliente escolhe?", suggestions: [], fields: { ...pickOneRequired } },
          ],
        },
        {
          key: "varias",
          label: "Escolhe várias opções",
          emoji: "✅",
          description: "Ex: adicionais, acompanhamentos.",
          produces: [
            { key: "opcoes", name: "Opções", emoji: "✅", optionsPrompt: "Quais opções o cliente pode escolher?", suggestions: [], fields: { ...pickManyOptional } },
          ],
        },
        {
          key: "tamanho_extras",
          label: "Tem tamanhos e adicionais",
          emoji: "🧩",
          description: "O cliente escolhe um tamanho e adiciona extras.",
          produces: [
            { key: "tamanho", name: "Tamanho", emoji: "📏", optionsPrompt: "Quais tamanhos você oferece?", suggestions: [], fields: { ...pickOneRequired } },
            { key: "adicionais", name: "Adicionais", emoji: "➕", optionsPrompt: "Quais adicionais você oferece?", suggestions: [], fields: { ...pickManyOptional } },
          ],
        },
        {
          key: "simples",
          label: "Produto simples",
          emoji: "📦",
          description: "Sem escolhas — só nome e preço.",
        },
      ],
    },
  },
};

export const BLUEPRINTS: Blueprint[] = [
  pizza,
  hamburguer,
  pastel,
  acai,
  marmita,
  cafeteria,
  sobremesas,
  outro,
];

export function getBlueprint(id: string | null): Blueprint | undefined {
  if (!id) return undefined;
  return BLUEPRINTS.find((bp) => bp.id === id);
}
