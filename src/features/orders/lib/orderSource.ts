const ORDER_SOURCE_LABELS: Record<string, string> = {
  storefront: "Cardápio",
  whatsapp: "WhatsApp",
  backoffice: "Painel",
  api: "Sistema",
};

export function orderSourceLabel(source?: string | null): string {
  if (!source) return "Cardápio";
  return ORDER_SOURCE_LABELS[source] ?? "Cardápio";
}

export function isWhatsappOrder(source?: string | null): boolean {
  return source === "whatsapp";
}
