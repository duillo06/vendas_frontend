import { formatCurrency } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";

type PriceDisplayProps = {
  value: number | string;
  className?: string;
};

export function PriceDisplay({ value, className }: PriceDisplayProps) {
  return <span className={cn("tabular-nums", className)}>{formatCurrency(value)}</span>;
}
