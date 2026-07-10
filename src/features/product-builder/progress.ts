import type { OptionGroup } from "@/features/catalog/types/catalog.types";

import type { ProductBuilderState } from "./types";
import { countGroupSelections, isGroupComplete } from "./validation";
import { getVisibleGroups } from "./visibility";

export function computeBuilderProgress(
  groups: OptionGroup[],
  selections: ProductBuilderState,
): { completed: number; total: number; show: boolean } {
  const visible = getVisibleGroups(groups, selections);
  const total = visible.length;
  const hasRequired = visible.some((group) => group.is_required);
  const show = total >= 2 || hasRequired;

  if (!show || total === 0) {
    return { completed: 0, total: 0, show: false };
  }

  const completed = visible.filter((group) =>
    isGroupComplete(group, countGroupSelections(group, selections)),
  ).length;

  return { completed, total, show };
}
