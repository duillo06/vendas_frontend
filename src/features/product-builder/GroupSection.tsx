import { ChevronDown } from "lucide-react";
import { forwardRef, useEffect, useId, useState } from "react";

import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";

import { GroupGuidance } from "./GroupGuidance";
import { getGroupGuidance } from "./guidance";
import { resolveDisplayType } from "./resolveDisplayType";
import { resolveDisplayComponent } from "./registry/displayRegistry";
import type { GroupSectionProps } from "./types";
import { countGroupSelections } from "./validation";

function isCollapsibleKind(kind?: string) {
  return kind === "crust" || kind === "extras";
}

export const GroupSection = forwardRef<HTMLElement, GroupSectionProps>(function GroupSection(
  { group, items, basePrice, onChange, invalid, allSelections, emphasized, lockedHint },
  ref,
) {
  const Display = resolveDisplayComponent(resolveDisplayType(group));
  const rawGuidance = getGroupGuidance(group, allSelections);
  // tamanho já mostra a escolha no chip — não precisa do “Excelente escolha”
  const guidance =
    (group.kind === "size" || group.kind === "volume") && rawGuidance?.tone === "success"
      ? null
      : rawGuidance;
  const count = countGroupSelections(group, allSelections);
  const showCounter = group.selection_type === "multiple" && group.max_selections > 1;
  const locked = Boolean(lockedHint);
  const collapsible = !emphasized && isCollapsibleKind(group.kind);
  const panelId = useId();
  const [open, setOpen] = useState(!collapsible);

  useEffect(() => {
    if (invalid && collapsible) setOpen(true);
  }, [invalid, collapsible]);

  const selectedNames = group.options
    .filter((option) => items.some((item) => item.option_id === option.id))
    .map((option) => {
      const qty = items.find((item) => item.option_id === option.id)?.quantity ?? 1;
      return qty > 1 ? `${qty}× ${option.name}` : option.name;
    });

  const closedSummary =
    selectedNames.length > 0
      ? selectedNames.join(" · ")
      : lockedHint
        ? lockedHint
        : "Toque para escolher";

  return (
    <section
      ref={ref}
      id={`option-group-${group.id}`}
      className={cn(
        "scroll-mt-28 scroll-mb-[calc(11rem+env(safe-area-inset-bottom,0px))] rounded-2xl border transition-colors duration-200 sm:scroll-mb-[calc(9rem+env(safe-area-inset-bottom,0px))]",
        emphasized
          ? "border-[hsl(var(--primary)/0.3)] bg-[hsl(var(--primary-soft))]/40 p-3 shadow-[var(--shadow-xs)] ring-1 ring-[hsl(var(--primary)/0.1)] sm:p-3.5"
          : "border-[hsl(var(--border))]/70 bg-white/60",
        !emphasized && (collapsible ? "p-0" : "p-4 sm:p-5"),
        locked && "opacity-70",
        invalid && "animate-shake border-red-200 bg-red-50/60",
      )}
    >
      <fieldset
        className={cn(
          emphasized ? "space-y-2.5" : "space-y-4",
          !collapsible && !emphasized && "contents",
        )}
        disabled={locked}
      >
        {collapsible ? (
          <button
            type="button"
            aria-expanded={open}
            aria-controls={panelId}
            disabled={locked}
            onClick={() => setOpen((value) => !value)}
            className="flex w-full items-center gap-3 px-4 py-3.5 text-left sm:px-5 sm:py-4"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {group.icon ? <span aria-hidden>{group.icon}</span> : null}
                <span className="text-base font-semibold tracking-tight">{group.name}</span>
                {group.is_required ? (
                  <Badge variant="outline" className="text-[10px]">
                    Obrigatório
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px]">
                    Opcional
                  </Badge>
                )}
                {showCounter && count > 0 ? (
                  <span className="text-xs font-medium tabular-nums text-brand">
                    {count}
                    {group.max_selections > 0 ? ` de ${group.max_selections}` : ""}
                  </span>
                ) : null}
              </div>
              <p
                className={cn(
                  "mt-1 truncate text-sm",
                  selectedNames.length > 0
                    ? "font-medium text-brand"
                    : "text-[hsl(var(--muted-foreground))]",
                )}
              >
                {closedSummary}
              </p>
            </div>
            <ChevronDown
              className={cn(
                "h-5 w-5 shrink-0 text-[hsl(var(--muted-foreground))] transition-transform duration-200",
                open && "rotate-180",
              )}
            />
          </button>
        ) : (
          <legend className="flex w-full flex-wrap items-center gap-2 text-sm font-semibold tracking-tight sm:text-base">
            {group.icon ? <span aria-hidden>{group.icon}</span> : null}
            <span>{group.name}</span>
            {emphasized ? (
              <Badge className="border-0 bg-brand px-1.5 py-0 text-[10px] text-[hsl(var(--primary-foreground))]">
                Comece por aqui
              </Badge>
            ) : null}
            {group.is_required && !emphasized ? (
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
        )}

        {(!collapsible || open) && (
          <div
            id={panelId}
            className={cn(
              "space-y-4",
              collapsible && "border-t border-[hsl(var(--border))]/70 px-4 pb-4 pt-3 sm:px-5 sm:pb-5",
            )}
          >
            {lockedHint && !collapsible ? (
              <p className="rounded-xl border border-dashed border-[hsl(var(--border))] bg-white/80 px-3 py-2 text-sm text-[hsl(var(--muted-foreground))]">
                {lockedHint}
              </p>
            ) : null}

            {!lockedHint ? <GroupGuidance guidance={guidance} invalid={invalid} /> : null}

            {!locked ? (
              <Display
                group={group}
                items={items}
                basePrice={basePrice}
                onChange={onChange}
                disabled={locked}
              />
            ) : null}
          </div>
        )}
      </fieldset>
    </section>
  );
});
