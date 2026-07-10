import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Layers, Lightbulb, Link2, ListTree, Plus, Sparkles } from "lucide-react";
import { Link } from "react-router";
import { useState } from "react";
import { toast } from "sonner";

import { OptionGroupEditor } from "@/features/catalog/components/OptionGroupEditor";
import { catalogAdminApi } from "@/features/catalog/api/catalogAdminApi";
import { catalogAdminKeys } from "@/features/catalog/constants/catalog-admin-keys";
import { UiHint } from "@/shared/components/UiHint";
import { BackLink, PageHeader } from "@/shared/components/visual";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { adminCopy } from "@/shared/copy/admin";

export function OptionGroupsPage() {
  const queryClient = useQueryClient();
  const [groupName, setGroupName] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: catalogAdminKeys.optionGroups(),
    queryFn: () => catalogAdminApi.listOptionGroups(),
  });

  const createGroup = useMutation({
    mutationFn: () =>
      catalogAdminApi.createOptionGroup({
        name: groupName.trim(),
        selection_type: "single",
        min_selections: 1,
        max_selections: 1,
        is_required: true,
        is_active: true,
        sort_order: data?.length ?? 0,
      }),
    onSuccess: () => {
      toast.success(adminCopy.optionGroups.editor.created);
      setGroupName("");
      void queryClient.invalidateQueries({ queryKey: catalogAdminKeys.optionGroups() });
    },
    onError: () => toast.error("Não foi possível criar o grupo"),
  });

  const groups = data ?? [];

  const applyExample = (example: string) => {
    setGroupName(example);
  };

  return (
    <div className="space-y-6">
      <BackLink to="/" label="Dashboard" />

      <PageHeader
        variant="hero"
        title="Grupos de opções"
        subtitle={adminCopy.optionGroups.subtitle}
        icon={ListTree}
      />

      <UiHint icon={Sparkles} tone="warm">
        {adminCopy.optionGroups.guidance}
      </UiHint>

      <Card className="border-brand-soft bg-brand-soft/40">
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-start gap-3">
            <div className="tile-brand flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
              <Plus className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="font-medium">{adminCopy.optionGroups.createTitle}</p>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                {adminCopy.optionGroups.createHint}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {adminCopy.optionGroups.examples.map((example) => (
              <button
                key={example}
                type="button"
                className="rounded-full border border-[hsl(var(--border))] bg-white px-3 py-1 text-xs font-medium text-[hsl(var(--foreground))] transition hover:border-[hsl(var(--primary)/0.35)] hover:bg-brand-soft"
                onClick={() => applyExample(example)}
              >
                {example}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="new-group-name">Nome do grupo</Label>
              <Input
                id="new-group-name"
                placeholder="Ex: Tamanho da pizza"
                value={groupName}
                onChange={(event) => setGroupName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && groupName.trim()) {
                    event.preventDefault();
                    createGroup.mutate();
                  }
                }}
              />
            </div>
            <Button
              type="button"
              className="gap-2"
              disabled={!groupName.trim() || createGroup.isPending}
              onClick={() => createGroup.mutate()}
            >
              <Plus className="h-4 w-4" />
              Criar grupo
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      ) : groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[hsl(var(--border))] px-6 py-16 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--muted))]">
            <Layers className="h-6 w-6 text-[hsl(var(--muted-foreground))]" />
          </div>
          <p className="font-medium">{adminCopy.optionGroups.empty.title}</p>
          <p className="mt-1 max-w-sm text-sm text-[hsl(var(--muted-foreground))]">
            {adminCopy.optionGroups.empty.description}
          </p>
        </div>
      ) : (
        <>
          <UiHint icon={Lightbulb} tone="neutral">
            {adminCopy.optionGroups.linkProducts}
            <Link to="/produtos" className="ml-1 inline-flex items-center gap-1 font-medium text-brand underline">
              <Link2 className="h-3.5 w-3.5" />
              Ir para produtos
            </Link>
          </UiHint>

          <div className="space-y-3">
            {groups.map((group, index) => (
              <OptionGroupEditor key={group.id} group={group} allGroups={groups} defaultExpanded={index === 0} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
