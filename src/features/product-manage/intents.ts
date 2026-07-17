export type ProductIntentId =
  | "price"
  | "image"
  | "description"
  | "name"
  | "category"
  | "availability"
  | "composition"
  | "options"
  | "pause"
  | "duplicate"
  | "archive"
  | "delete"
  | "promo"
  | "advanced";

export type ProductIntentCategory = "essentials" | "personalize" | "sales" | "danger";

export type ProductIntent = {
  id: ProductIntentId;
  label: string;
  shortLabel: string;
  description: string;
  emoji: string;
  category: ProductIntentCategory;
  /** termos pra busca do campo "o que deseja fazer" */
  keywords: string[];
  /** fluxo ainda não implementado / placeholder */
  comingSoon?: boolean;
};

export const PRODUCT_INTENTS: ProductIntent[] = [
  {
    id: "price",
    label: "Alterar o preço",
    shortLabel: "Preço",
    description: "Atualize o valor base em poucos segundos.",
    emoji: "💰",
    category: "essentials",
    keywords: ["preço", "preco", "valor", "precar", "barato", "caro"],
  },
  {
    id: "image",
    label: "Trocar a foto",
    shortLabel: "Foto",
    description: "Substitua ou adicione imagens do produto.",
    emoji: "📷",
    category: "essentials",
    keywords: ["foto", "imagem", "imagem", "capa", "picture"],
  },
  {
    id: "description",
    label: "Editar descrição",
    shortLabel: "Descrição",
    description: "Ajuste o texto que o cliente lê no cardápio.",
    emoji: "📝",
    category: "essentials",
    keywords: ["descrição", "descricao", "texto", "detalhe"],
  },
  {
    id: "name",
    label: "Renomear produto",
    shortLabel: "Nome",
    description: "Mude o nome exibido no cardápio.",
    emoji: "✏️",
    category: "essentials",
    keywords: ["nome", "renomear", "título", "titulo"],
  },
  {
    id: "category",
    label: "Alterar categoria",
    shortLabel: "Categoria",
    description: "Mova o produto para outra seção do cardápio.",
    emoji: "📁",
    category: "essentials",
    keywords: ["categoria", "seção", "secao", "grupo"],
  },
  {
    id: "availability",
    label: "Disponibilidade",
    shortLabel: "Disponível",
    description: "Defina se aparece e se aceita pedidos.",
    emoji: "🟢",
    category: "sales",
    keywords: ["disponível", "disponivel", "ativo", "venda", "pedido"],
  },
  {
    id: "composition",
    label: "Permitir meio a meio",
    shortLabel: "Sabores",
    description: "Deixe o cliente combinar sabores — meio a meio, 3 ou 4.",
    emoji: "🍕",
    category: "personalize",
    keywords: ["meio", "meio a meio", "sabor", "sabores", "composição", "composicao", "pizza"],
  },
  {
    id: "options",
    label: "Gerenciar personalizações",
    shortLabel: "Personalizar",
    description: "Tamanho, borda, adicionais — perguntas simples pro cliente.",
    emoji: "🧀",
    category: "personalize",
    keywords: ["adicional", "adicionais", "borda", "massa", "opção", "opcao", "extra", "grupo", "personalização", "personalizacao", "tamanho"],
  },
  {
    id: "promo",
    label: "Colocar em promoção",
    shortLabel: "Promoção",
    description: "Preço riscado e destaque — em breve.",
    emoji: "📈",
    category: "sales",
    keywords: ["promoção", "promocao", "desconto", "oferta"],
    comingSoon: true,
  },
  {
    id: "pause",
    label: "Pausar as vendas",
    shortLabel: "Pausar",
    description: "Tira temporariamente do pedido sem apagar o produto.",
    emoji: "⏸️",
    category: "sales",
    keywords: ["pausar", "pause", "indisponível", "indisponivel", "parar"],
  },
  {
    id: "duplicate",
    label: "Duplicar produto",
    shortLabel: "Duplicar",
    description: "Crie uma cópia para variar preço ou sabores.",
    emoji: "⧉",
    category: "essentials",
    keywords: ["duplicar", "copiar", "clone", "cópia", "copia"],
  },
  {
    id: "archive",
    label: "Arquivar produto",
    shortLabel: "Arquivar",
    description: "Esconde do cardápio mantendo o histórico.",
    emoji: "📦",
    category: "danger",
    keywords: ["arquivar", "ocultar", "inativar", "desativar"],
  },
  {
    id: "delete",
    label: "Excluir produto",
    shortLabel: "Excluir",
    description: "Remove o produto. Use com cuidado.",
    emoji: "🗑️",
    category: "danger",
    keywords: ["excluir", "apagar", "deletar", "remover"],
  },
  {
    id: "advanced",
    label: "Editor completo",
    shortLabel: "Avançado",
    description: "Visão clássica com todos os campos de uma vez.",
    emoji: "⚙️",
    category: "essentials",
    keywords: ["avançado", "avancado", "completo", "formulario", "formulário"],
  },
];

export const INTENT_CATEGORY_LABELS: Record<ProductIntentCategory, string> = {
  essentials: "Essenciais",
  personalize: "Personalização",
  sales: "Vendas",
  danger: "Zona de risco",
};

export function filterIntents(query: string): ProductIntent[] {
  const q = query.trim().toLowerCase();
  if (!q) return PRODUCT_INTENTS.filter((i) => !i.comingSoon || true).slice(0, 8);

  return PRODUCT_INTENTS.filter((intent) => {
    const hay = `${intent.label} ${intent.description} ${intent.keywords.join(" ")}`.toLowerCase();
    return hay.includes(q);
  });
}

export function getIntent(id: ProductIntentId): ProductIntent | undefined {
  return PRODUCT_INTENTS.find((intent) => intent.id === id);
}
