import { useMemo } from "react";

import type { OptionGroup } from "@/features/catalog/types/catalog.types";

import { GroupSection } from "./GroupSection";
import { ProductBuilderProgress } from "./ProductBuilderProgress";
import { computeBuilderProgress } from "./progress";
import type { OptionSelectionItem, ProductBuilderState } from "./types";
import { getVisibleGroups } from "./visibility";

type ProductBuilderProps = {
  groups: OptionGroup[];
  selections: ProductBuilderState;
  basePrice: number;
  invalidGroupId?: string | null;
  onChange: (groupId: string, items: OptionSelectionItem[]) => void;
};

export function ProductBuilder({
  groups,
  selections,
  basePrice,
  invalidGroupId,
  onChange,
}: ProductBuilderProps) {
  const visibleGroups = useMemo(
    () => getVisibleGroups(groups, selections),
    [groups, selections],
  );

  const progress = useMemo(
    () => computeBuilderProgress(visibleGroups, selections),
    [visibleGroups, selections],
  );

  if (visibleGroups.length === 0) return null;

  return (
    <div className="space-y-6">
      <ProductBuilderProgress progress={progress} />

      <div className="space-y-5 sm:space-y-6">
        {visibleGroups.map((group, index) => (
          <div
            key={group.id}
            className="animate-fade-up scroll-mb-[calc(11rem+env(safe-area-inset-bottom,0px))] sm:scroll-mb-[calc(9rem+env(safe-area-inset-bottom,0px))]"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <GroupSection
              group={group}
              items={selections[group.id] ?? []}
              allSelections={selections}
              basePrice={basePrice}
              invalid={invalidGroupId === group.id}
              onChange={(items) => onChange(group.id, items)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function scrollToOptionGroup(groupId: string) {
  const el = document.getElementById(`option-group-${groupId}`);
  el?.scrollIntoView({ behavior: "smooth", block: "center" });
}
