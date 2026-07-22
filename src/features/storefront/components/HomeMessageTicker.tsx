import { useMemo } from "react";

import type { CompanyPublic } from "@/features/company/types/company.types";
import {
  getEstimatedDeliveryMinutes,
  getStorefrontMarketing,
} from "@/features/company/utils/storefrontTheme";
import type { ProductListItem } from "@/features/catalog/types/catalog.types";
import {
  dayPartTickerHints,
  getDayPart,
  getHomeGreeting,
} from "@/features/storefront/utils/homeGreeting";
import { MessageTicker, type TickerMessage } from "@/shared/components/MessageTicker";
import { formatCurrency } from "@/shared/lib/format";

type Props = {
  company?: CompanyPublic | null;
  products?: ProductListItem[];
  className?: string;
};

function buildMessages(
  company: CompanyPublic | null | undefined,
  products: ProductListItem[],
  now = new Date(),
): TickerMessage[] {
  const messages: TickerMessage[] = [];
  const greeting = getHomeGreeting(now);
  const dayPart = getDayPart(now);
  messages.push(`✨ ${greeting.title}`);
  messages.push(...dayPartTickerHints(dayPart, now));

  const marketing = getStorefrontMarketing(company);
  if (marketing.promo_label) {
    messages.push(`🎉 ${marketing.promo_label}`);
  }

  const freeAbove = company?.settings.free_delivery_above;
  if (freeAbove != null && Number(freeAbove) > 0) {
    messages.push(`🚚 Frete grátis acima de ${formatCurrency(freeAbove)}`);
  }

  const mins = getEstimatedDeliveryMinutes(company);
  if (mins) {
    messages.push(`⏱️ Entrega média de ~${mins} minutos`);
  }

  const methods = company?.settings.payment_methods ?? [];
  if (methods.some((m) => /pix/i.test(m))) {
    messages.push("💳 Aceitamos Pix");
  }

  const champion = products.find(
    (p) => p.is_available && p.tags.some((t) => /mais vendido|destaque|popular/i.test(t)),
  );
  if (champion) {
    messages.push({ text: `🔥 Mais pedida: ${champion.name}`, to: `/produto/${champion.slug}` });
  }

  const novelty = products.find(
    (p) => p.is_available && p.tags.some((t) => /^novo$|novidade|lan[cç]amento/i.test(t)),
  );
  if (novelty) {
    messages.push({ text: `🎉 Novidade: ${novelty.name}`, to: `/produto/${novelty.slug}` });
  }

  const combo = products.find(
    (p) => p.is_available && p.tags.some((t) => /combo|kit|fam[ií]lia/i.test(t)),
  );
  if (combo) {
    messages.push({ text: `👨‍👩‍👧 Combo em alta: ${combo.name}`, to: `/produto/${combo.slug}` });
  }

  const deal = products.find(
    (p) =>
      p.is_available &&
      p.compare_price != null &&
      Number(p.compare_price) > Number(p.base_price),
  );
  if (deal) {
    messages.push({ text: `💥 Oferta em ${deal.name}`, to: `/produto/${deal.slug}` });
  }

  return messages;
}

/** ticker da home — mensagens da loja numa linha só */
export function HomeMessageTicker({ company, products = [], className }: Props) {
  const messages = useMemo(() => buildMessages(company, products), [company, products]);
  return <MessageTicker messages={messages} className={className} />;
}
