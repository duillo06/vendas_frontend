import { forwardRef } from "react";

import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";

import { GroupGuidance } from "./GroupGuidance";
import { getGroupGuidance } from "./guidance";
import { resolveDisplayType } from "./resolveDisplayType";
import { resolveDisplayComponent } from "./registry/displayRegistry";
import type { GroupSectionProps } from "./types";
import { countGroupSelections } from "./validation";

export const GroupSection = forwardRef<HTMLElement, GroupSectionProps>(function GroupSection(
  { group, items, basePrice, onChange, invalid, allSelections },
  ref,
) {
  const Display = resolveDisplayComponent(resolveDisplayType(group));
  const guidance = getGroupGuidance(group, allSelections);
  const count = countGroupSelections(group, allSelections);
  const showCounter = group.selection_type === "multiple" && group.max_selections > 1;

  return (
    <section
      ref={ref}
      id={`option-group-${group.id}`}
      className={cn(
        "scroll-mt-28 rounded-2xl border border-[hsl(var(--border))]/70 bg-white/60 p-4 transition-colors duration-200 sm:p-5",
        invalid && "animate-shake border-red-200 bg-red-50/60",
      )}
    >
      <fieldset className="space-y-4">
        <legend className="flex w-full flex-wrap items-center gap-2 text-base font-semibold tracking-tight">
          {group.icon ? <span aria-hidden>{group.icon}</span> : null}
          <span>{group.name}</span>
          {group.is_required ? (
            <Badge variant="outline" className="text-[10px]">
              Obrigatório
            </Badge>
          ) : null}
          {showCounter ? (
            <span
              className={cn(
                "ml-auto text-xs font-normal tabular-nums",
                group.max_selections > 0 && count >= group.max_selections
                  ? "font-medium text-brand"
                  : "text-[hsl(var(--muted-foreground))]",
              )}
            >
              {count} de {group.max_selections}
            </span>
          ) : null}
        </legend>

        <GroupGuidance guidance={guidance} invalid={invalid} />

        <Display group={group} items={items} basePrice={basePrice} onChange={onChange} disabled={false} />
      </fieldset>
    </section>
  );
});
