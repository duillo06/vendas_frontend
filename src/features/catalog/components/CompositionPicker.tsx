import { useQuery } from "@tanstack/react-query";
import { Check, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { catalogApi } from "../api/catalogApi";
import type { CartComponent } from "@/features/cart/types/cart.types";
import type { ProductDetail } from "../types/catalog.types";

import { PriceDisplay } from "@/shared/components/PriceDisplay";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Sheet, SheetContent } from "@/shared/components/ui/sheet";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";

type CompositionPickerProps = {
  product: ProductDetail;
  selected: CartComponent[];
  onChange: (parts: CartComponent[]) => void;
};

export function CompositionPicker({ product, selected, onChange }: CompositionPickerProps) {
  const [open, setOpen] = useState(false);
  const composition = product.composition;

  const { data: candidates, isLoading } = useQuery({
    queryKey: ["catalog", "composition", product.slug],
    queryFn: () => catalogApi.getCompositionOptions(product.slug),
    enabled: open && !!composition?.enabled,
    staleTime: 60_000,
  });

  if (!composition?.enabled) return null;

  const maxAdditional = Math.max(0, composition.max_parts - 1);
  const minAdditional = Math.max(0, composition.min_parts - 1);
  const totalParts = selected.length + 1;
  const pct = Math.round(100 / totalParts);

  const toggle = (candidateId: string) => {
    const item = (candidates ?? []).find((c) => c.id === candidateId);
    if (!item) return;

    const already = selected.find((c) => c.productId === candidateId);
    if (already) {
      onChange(selected.filter((c) => c.productId !== candidateId));
      return;
    }

    const part: CartComponent = {
      productId: item.id,
      productName: item.name,
      imageUrl: item.image_url,
      basePrice: item.base_price,
    };

    if (selected.length < maxAdditional) {
      onChange([...selected, part]);
      return;
    }

    // quando só cabe 1 (meio a meio), trocar direto pelo novo
    if (maxAdditional === 1) {
      onChange([part]);
      return;
    }

    toast.info(`Você pode escolher no máximo ${maxAdditional} sabor(es).`);
  };

  return (
    <div className="space-y-3 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold">{composition.label}</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            {minAdditional > 0
              ? `Escolha ${minAdditional === maxAdditional ? minAdditional : `${minAdditional} a ${maxAdditional}`} sabor(es) para combinar.`
              : `Combine com até ${maxAdditional} sabor(es).`}
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
          <Plus className="mr-1 h-4 w-4" />
          {selected.length > 0 ? "Trocar" : "Escolher"}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-medium shadow-sm">
          {pct}% {product.name}
        </span>
        {selected.map((part) => (
          <span
            key={part.productId}
            className="inline-flex items-center gap-1 rounded-full bg-brand px-3 py-1 text-xs font-medium text-[hsl(var(--primary-foreground))]"
          >
            {pct}% {part.productName}
          </span>
        ))}
      </div>

      <Sheet open={open} onOpenChange={setOpen} side="bottom">
        <SheetContent title={composition.label} onClose={() => setOpen(false)}>
          {isLoading ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl" />
              ))}
            </div>
          ) : (candidates ?? []).length === 0 ? (
            <p className="py-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
              Nenhum sabor disponível para combinar agora.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {(candidates ?? []).map((item) => {
                const isSelected = selected.some((c) => c.productId === item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggle(item.id)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border p-3 text-left transition",
                      isSelected
                        ? "border-[hsl(var(--primary)/0.45)] bg-[hsl(var(--primary-soft))] ring-1 ring-[hsl(var(--primary)/0.2)]"
                        : "border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.3)] hover:bg-[hsl(var(--muted))]",
                    )}
                  >
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[hsl(var(--muted))]">
                      {item.image_url ? (
                        <img src={item.image_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[10px] text-[hsl(var(--muted-foreground))]">
                          Sem foto
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate font-medium">{item.name}</p>
                        {isSelected ? <Check className="h-4 w-4 shrink-0 text-brand" /> : null}
                      </div>
                      {item.description ? (
                        <p className="line-clamp-1 text-xs text-[hsl(var(--muted-foreground))]">
                          {item.description}
                        </p>
                      ) : null}
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <PriceDisplay value={item.base_price} className="text-sm font-semibold text-brand" />
                        {item.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} className="border-0 bg-brand-soft text-[10px] text-brand">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <div className="sticky bottom-0 mt-4 bg-[hsl(var(--background))] pt-2">
            <Button type="button" className="h-11 w-full" onClick={() => setOpen(false)}>
              Confirmar
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

// preço base da composição conforme a regra (espelha o backend)
export function composedBasePrice(product: ProductDetail, parts: CartComponent[]): number {
  const rule = product.composition?.pricing_rule ?? "highest";
  if (parts.length === 0 || rule === "main") return product.base_price;

  const prices = [product.base_price, ...parts.map((p) => p.basePrice)];
  if (rule === "average") {
    const avg = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    return Math.round(avg * 100) / 100;
  }
  return Math.max(...prices);
}
