import { useMemo, type ReactNode } from "react";

import type { OptionGroup } from "@/features/catalog/types/catalog.types";

import { GroupSection } from "./GroupSection";
import { isSizeLikeGroup, orderGroupsForFocus } from "./sizeFocus";
import type { OptionSelectionItem, ProductBuilderState } from "./types";
import { getVisibleGroups } from "./visibility";

type ProductBuilderProps = {
  groups: OptionGroup[];
  selections: ProductBuilderState;
  basePrice: number;
  invalidGroupId?: string | null;
  /** sem tamanho escolhido, trava o resto */
  lockUntilSize?: boolean;
  /** entra logo depois do tamanho (ex.: escolher sabor) */
  afterSize?: ReactNode;
  onChange: (groupId: string, items: OptionSelectionItem[]) => void;
};

export function ProductBuilder({
  groups,
  selections,
  basePrice,
  invalidGroupId,
  lockUntilSize = false,
  afterSize,
  onChange,
}: ProductBuilderProps) {
  const visibleGroups = useMemo(
    () => orderGroupsForFocus(getVisibleGroups(groups, selections)),
    [groups, selections],
  );

  const sizeGroups = useMemo(
    () => visibleGroups.filter(isSizeLikeGroup),
    [visibleGroups],
  );
  const otherGroups = useMemo(
    () => visibleGroups.filter((group) => !isSizeLikeGroup(group)),
    [visibleGroups],
  );

  const sizeSelected = useMemo(() => {
    if (sizeGroups.length === 0) return true;
    return sizeGroups.some((group) => Boolean(selections[group.id]?.length));
  }, [sizeGroups, selections]);

  if (visibleGroups.length === 0 && !afterSize) return null;

  let stepIndex = 0;

  return (
    <div className="space-y-5 sm:space-y-6">
      {sizeGroups.map((group) => {
        const index = stepIndex++;
        return (
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
              emphasized
              onChange={(items) => onChange(group.id, items)}
            />
          </div>
        );
      })}

      {afterSize ? (
        <div
          className="animate-fade-up scroll-mb-[calc(11rem+env(safe-area-inset-bottom,0px))] sm:scroll-mb-[calc(9rem+env(safe-area-inset-bottom,0px))]"
          style={{ animationDelay: `${stepIndex++ * 60}ms` }}
        >
          {afterSize}
        </div>
      ) : null}

      {otherGroups.map((group) => {
        const index = stepIndex++;
        const locked = lockUntilSize && !sizeSelected;
        return (
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
              lockedHint={
                locked ? "Escolha o tamanho primeiro para liberar esta opção." : null
              }
              onChange={(items) => onChange(group.id, items)}
            />
          </div>
        );
      })}
    </div>
  );
}

export function scrollToOptionGroup(groupId: string) {
  const el = document.getElementById(`option-group-${groupId}`);
  el?.scrollIntoView({ behavior: "smooth", block: "center" });
}
