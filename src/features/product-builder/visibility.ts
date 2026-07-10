import type { OptionGroup } from "@/features/catalog/types/catalog.types";

import type { ProductBuilderState } from "./types";

export type ShowWhenConfig = {
  group_id: string;
  option_ids?: string[];
};

export function getShowWhen(group: OptionGroup): ShowWhenConfig | null {
  const showWhen = group.ui_config?.show_when;
  if (!showWhen?.group_id) return null;
  return {
    group_id: String(showWhen.group_id),
    option_ids: showWhen.option_ids?.map(String),
  };
}

export function isGroupVisible(group: OptionGroup, selections: ProductBuilderState): boolean {
  if (group.visibility === "hidden") return false;
  if (group.visibility !== "conditional") return true;

  const showWhen = getShowWhen(group);
  if (!showWhen?.group_id) return false;

  const items = selections[showWhen.group_id] ?? [];
  if (items.length === 0) return false;

  if (!showWhen.option_ids?.length) return true;

  const selectedIds = new Set(items.map((item) => item.option_id));
  return showWhen.option_ids.some((optionId) => selectedIds.has(optionId));
}

export function getVisibleGroups(
  groups: OptionGroup[],
  selections: ProductBuilderState,
): OptionGroup[] {
  return groups.filter((group) => isGroupVisible(group, selections));
}

export function pruneHiddenSelections(
  groups: OptionGroup[],
  selections: ProductBuilderState,
): ProductBuilderState {
  const next = { ...selections };
  let changed = false;

  for (const group of groups) {
    if (!isGroupVisible(group, selections) && next[group.id]?.length) {
      delete next[group.id];
      changed = true;
    }
  }

  return changed ? next : selections;
}
