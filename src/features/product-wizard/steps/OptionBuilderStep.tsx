import { useQuery } from "@tanstack/react-query";
import { Info } from "lucide-react";
import { useMemo } from "react";

import { catalogAdminApi } from "@/features/catalog/api/catalogAdminApi";
import { catalogAdminKeys } from "@/features/catalog/constants/catalog-admin-keys";
import { librarySuggestionsForGroupName } from "@/features/catalog/utils/canonicalLibrary";

import { OptionListEditor } from "../components/OptionListEditor";
import type { ProductWizard } from "../useProductWizard";

type OptionBuilderStepProps = {
  wizard: ProductWizard;
  groupKey: string;
};

export function OptionBuilderStep({ wizard, groupKey }: OptionBuilderStepProps) {
  const { state, dispatch, groupByKey } = wizard;
  const group = groupByKey(groupKey);
  const options = state.optionsByGroup[groupKey] ?? [];

  const { data: library = [] } = useQuery({
    queryKey: catalogAdminKeys.optionGroups(),
    queryFn: () => catalogAdminApi.listOptionGroups(),
  });

  const libraryItems = useMemo(() => {
    if (!group) return [];
    return librarySuggestionsForGroupName(library, group.name);
  }, [library, group]);

  if (!group) return null;

  return (
    <div className="space-y-4">
      {group.optionsHelp ? (
        <div className="flex items-start gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 p-3 text-sm text-[hsl(var(--foreground))]">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
          <span>{group.optionsHelp}</span>
        </div>
      ) : null}

      {libraryItems.length > 0 ? (
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          Itens da biblioteca da casa — marcar reaproveita o mesmo cadastro (preço único).
        </p>
      ) : null}

      <OptionListEditor
        options={options}
        suggestions={group.suggestions}
        libraryItems={libraryItems}
        onChange={(next) => dispatch({ type: "SET_GROUP_OPTIONS", groupKey, options: next })}
      />
    </div>
  );
}
