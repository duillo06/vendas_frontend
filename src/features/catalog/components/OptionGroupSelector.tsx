import type { OptionGroup, OptionSelections } from "../types/catalog.types";
import { formatOptionPriceModifier } from "../utils/priceCalculator";

import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";

type OptionGroupSelectorProps = {
  groups: OptionGroup[];
  selections: OptionSelections;
  onChange: (groupId: string, optionIds: string[]) => void;
  basePrice: number;
};

export function OptionGroupSelector({
  groups,
  selections,
  onChange,
  basePrice,
}: OptionGroupSelectorProps) {
  if (groups.length === 0) return null;

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <fieldset key={group.id} className="space-y-3">
          <legend className="flex flex-wrap items-center gap-2 text-base font-semibold">
            {group.name}
            {group.is_required ? (
              <Badge variant="outline" className="text-[10px]">
                Obrigatório
              </Badge>
            ) : null}
            {group.selection_type === "multiple" && group.max_selections > 1 ? (
              <span className="text-xs font-normal text-[hsl(var(--muted-foreground))]">
                Escolha até {group.max_selections}
              </span>
            ) : null}
          </legend>

          {group.description ? (
            <p className="text-sm text-[hsl(var(--muted-foreground))]">{group.description}</p>
          ) : null}

          <div className="space-y-2">
            {group.options.map((option) => {
              const chosen = selections[group.id] ?? [];
              const isSelected = chosen.includes(option.id);
              const inputType = group.selection_type === "single" ? "radio" : "checkbox";
              const priceLabel = formatOptionPriceModifier(option, basePrice);

              return (
                <label
                  key={option.id}
                  className={cn(
                    "flex cursor-pointer items-center justify-between rounded-lg border px-4 py-3 transition-colors",
                    isSelected
                      ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5"
                      : "border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]/50",
                    !option.is_available && "cursor-not-allowed opacity-50",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type={inputType}
                      name={`option-group-${group.id}`}
                      checked={isSelected}
                      disabled={!option.is_available}
                      onChange={() => {
                        if (group.selection_type === "single") {
                          onChange(group.id, [option.id]);
                          return;
                        }

                        if (isSelected) {
                          onChange(
                            group.id,
                            chosen.filter((id) => id !== option.id),
                          );
                          return;
                        }

                        if (chosen.length >= group.max_selections) return;
                        onChange(group.id, [...chosen, option.id]);
                      }}
                      className="h-4 w-4 accent-[hsl(var(--primary))]"
                    />
                    <span className="text-sm font-medium">{option.name}</span>
                  </div>
                  {priceLabel ? (
                    <span className="text-sm text-[hsl(var(--muted-foreground))]">{priceLabel}</span>
                  ) : null}
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}
    </div>
  );
}
