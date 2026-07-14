import { Info } from "lucide-react";

import { OptionListEditor } from "../components/OptionListEditor";
import type { ProductWizard } from "../useProductWizard";

type OptionBuilderStepProps = {
  wizard: ProductWizard;
  groupKey: string;
};

export function OptionBuilderStep({ wizard, groupKey }: OptionBuilderStepProps) {
  const { state, dispatch, groupByKey } = wizard;
  const group = groupByKey(groupKey);
  if (!group) return null;

  const options = state.optionsByGroup[groupKey] ?? [];

  return (
    <div className="space-y-4">
      {group.optionsHelp ? (
        <div className="flex items-start gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 p-3 text-sm text-[hsl(var(--foreground))]">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
          <span>{group.optionsHelp}</span>
        </div>
      ) : null}

      <OptionListEditor
        options={options}
        suggestions={group.suggestions}
        onChange={(next) => dispatch({ type: "SET_GROUP_OPTIONS", groupKey, options: next })}
      />
    </div>
  );
}
