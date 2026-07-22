import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router";

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
import { formatCurrency } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";

type Props = {
  company?: CompanyPublic | null;
  products?: ProductListItem[];
  className?: string;
};

function buildMessages(
  company: CompanyPublic | null | undefined,
  products: ProductListItem[],
  now = new Date(),
): string[] {
  const messages: string[] = [];
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
    messages.push(`🔥 Mais pedida: ${champion.name}`);
  }

  const novelty = products.find(
    (p) => p.is_available && p.tags.some((t) => /^novo$|novidade|lan[cç]amento/i.test(t)),
  );
  if (novelty) {
    messages.push(`🎉 Novidade: ${novelty.name}`);
  }

  const combo = products.find(
    (p) => p.is_available && p.tags.some((t) => /combo|kit|fam[ií]lia/i.test(t)),
  );
  if (combo) {
    messages.push(`👨‍👩‍👧 Combo em alta: ${combo.name}`);
  }

  const deal = products.find(
    (p) =>
      p.is_available &&
      p.compare_price != null &&
      Number(p.compare_price) > Number(p.base_price),
  );
  if (deal) {
    messages.push(`💥 Oferta em ${deal.name}`);
  }

  return messages;
}

/** ticker vivo — uma mensagem por vez, sem card grosso */
export function HomeMessageTicker({ company, products = [], className }: Props) {
  const messages = useMemo(() => buildMessages(company, products), [company, products]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (messages.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % messages.length);
    }, 3800);
    return () => window.clearInterval(id);
  }, [messages.length]);

  if (!messages.length) return null;

  const current = messages[index % messages.length];
  const linkMatch = products.find((p) => current.includes(p.name));

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-[hsl(var(--border)/0.8)] bg-gradient-to-r from-[hsl(var(--muted)/0.55)] via-[hsl(var(--primary)/0.06)] to-[hsl(var(--muted)/0.45)] px-3.5 py-2.5",
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.p
          key={current}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="truncate text-[13px] font-medium text-[hsl(var(--foreground))]"
        >
          {linkMatch ? (
            <Link to={`/produto/${linkMatch.slug}`} className="hover:text-brand">
              {current}
            </Link>
          ) : (
            current
          )}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
