import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";

import { PriceDisplay } from "@/shared/components/PriceDisplay";
import { storefrontCopy } from "@/shared/copy/storefront";
import { cn } from "@/shared/lib/utils";

export type OrderSummaryLine = {
  id: string;
  label: string;
  detail?: string;
};

type ProductOrderSummaryProps = {
  productName: string;
  lines: OrderSummaryLine[];
  total: number;
  className?: string;
};

/** resumo vivo do que o cliente montou — discreto, apoia o protagonista */
export function ProductOrderSummary({
  productName,
  lines,
  total,
  className,
}: ProductOrderSummaryProps) {
  if (lines.length === 0) return null;

  return (
    <aside
      className={cn(
        "rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/35 px-4 py-3.5",
        className,
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
        {storefrontCopy.product.orderSummaryTitle}
      </p>
      <p className="mt-1.5 flex items-center gap-1.5 text-sm font-semibold">
        <Check className="h-3.5 w-3.5 text-brand" aria-hidden />
        {productName}
      </p>

      <ul className="mt-2 space-y-1 border-t border-[hsl(var(--border))]/70 pt-2">
        <AnimatePresence initial={false}>
          {lines.map((line) => (
            <motion.li
              key={line.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.18 }}
              className="flex items-baseline justify-between gap-3 text-sm text-[hsl(var(--muted-foreground))]"
            >
              <span className="min-w-0 truncate">
                {line.label}
                {line.detail ? (
                  <span className="text-[hsl(var(--muted-foreground))]/80"> · {line.detail}</span>
                ) : null}
              </span>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      <div className="mt-3 flex items-center justify-between border-t border-[hsl(var(--border))]/70 pt-2.5">
        <span className="text-sm font-medium">Total</span>
        <PriceDisplay value={total} className="text-base font-bold text-brand" />
      </div>
    </aside>
  );
}
