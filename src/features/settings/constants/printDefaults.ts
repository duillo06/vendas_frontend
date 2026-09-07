export type PrintPaperWidth = "58" | "80";
export type PrintFontSize = "normal" | "large";

export type PrintSettings = {
  paper_width: PrintPaperWidth;
  font_size: PrintFontSize;
  show_prices: boolean;
  show_payment: boolean;
  show_store_phone: boolean;
  show_customer_phone: boolean;
  show_order_notes: boolean;
  show_internal_notes: boolean;
  show_prep_time: boolean;
  copies: 1 | 2;
  footer_text: string;
  /** versículo opcional — vazio = não imprime */
  verse_text: string;
};

export const DEFAULT_PRINT_SETTINGS: PrintSettings = {
  paper_width: "80",
  font_size: "normal",
  show_prices: true,
  show_payment: true,
  show_store_phone: true,
  show_customer_phone: true,
  show_order_notes: true,
  show_internal_notes: true,
  show_prep_time: true,
  copies: 1,
  footer_text: "Obrigado!",
  verse_text: "",
};

export function normalizePrintSettings(raw?: Partial<PrintSettings> | null): PrintSettings {
  if (!raw) return { ...DEFAULT_PRINT_SETTINGS };

  const paper = raw.paper_width === "58" || raw.paper_width === "80" ? raw.paper_width : "80";
  const font = raw.font_size === "large" || raw.font_size === "normal" ? raw.font_size : "normal";
  const copies = raw.copies === 2 ? 2 : 1;

  return {
    paper_width: paper,
    font_size: font,
    show_prices: raw.show_prices ?? true,
    show_payment: raw.show_payment ?? true,
    show_store_phone: raw.show_store_phone ?? true,
    show_customer_phone: raw.show_customer_phone ?? true,
    show_order_notes: raw.show_order_notes ?? true,
    show_internal_notes: raw.show_internal_notes ?? true,
    show_prep_time: raw.show_prep_time ?? true,
    copies,
    footer_text: (raw.footer_text ?? DEFAULT_PRINT_SETTINGS.footer_text).slice(0, 120),
    // sem trim aqui — senão espaço no fim some enquanto digita
    verse_text: (raw.verse_text ?? "").slice(0, 280),
  };
}
