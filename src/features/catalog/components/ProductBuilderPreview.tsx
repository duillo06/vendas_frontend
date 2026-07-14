import { useEffect, useMemo, useState } from "react";

import { buildPreviewOptionGroups } from "@/features/catalog/utils/mergeGroupConfig";
import type { OptionGroupAdmin, ProductOptionGroupLink } from "@/features/catalog/api/catalogAdminApi";
import { ProductBuilder } from "@/features/product-builder/ProductBuilder";
import { buildInitialSelections } from "@/features/product-builder/defaults";
import { calculateBuilderTotal } from "@/features/product-builder/pricingEngine";
import type { ProductBuilderState } from "@/features/product-builder/types";
import { pruneHiddenSelections } from "@/features/product-builder/visibility";
import { formatCurrency } from "@/shared/lib/format";

type ProductBuilderPreviewProps = {
  name: string;
  basePrice: number;
  links: ProductOptionGroupLink[];
  groupsById: Map<string, OptionGroupAdmin>;
};

export function ProductBuilderPreview({
  name,
  basePrice,
  links,
  groupsById,
}: ProductBuilderPreviewProps) {
  const optionGroups = useMemo(
    () => buildPreviewOptionGroups(links, groupsById),
    [links, groupsById],
  );

  const [selections, setSelections] = useState<ProductBuilderState>({});

  useEffect(() => {
    setSelections(buildInitialSelections(optionGroups));
  }, [optionGroups]);

  const total = useMemo(
    () => calculateBuilderTotal(basePrice, optionGroups, selections),
    [basePrice, optionGroups, selections],
  );

  if (optionGroups.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[hsl(var(--border))] px-4 py-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
        Vincule grupos de opções para ver o preview do builder.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
        <p className="text-sm font-semibold">{name.trim() || "Produto"}</p>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          Preview interativo — igual ao cardápio
        </p>
      </div>

      <ProductBuilder
        groups={optionGroups}
        selections={selections}
        basePrice={basePrice}
        onChange={(groupId, items) =>
          setSelections((current) =>
            pruneHiddenSelections(optionGroups, { ...current, [groupId]: items }),
          )
        }
      />

      <div className="sticky bottom-0 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40 px-4 py-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[hsl(var(--muted-foreground))]">Total estimado</span>
          <span className="text-lg font-bold text-brand">{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
}
