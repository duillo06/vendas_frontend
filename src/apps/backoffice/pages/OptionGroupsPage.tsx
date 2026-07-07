import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Layers, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { OptionGroupEditor } from "@/features/catalog/components/OptionGroupEditor";
import { catalogAdminApi } from "@/features/catalog/api/catalogAdminApi";
import { catalogAdminKeys } from "@/features/catalog/constants/catalog-admin-keys";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Skeleton } from "@/shared/components/ui/skeleton";

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
      toast.success("Grupo criado");
      setGroupName("");
      void queryClient.invalidateQueries({ queryKey: catalogAdminKeys.optionGroups() });
    },
    onError: () => toast.error("Não foi possível criar o grupo"),
  });

  const groups = data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Grupos de opções</h1>
        <p className="text-[hsl(var(--muted-foreground))]">
          Tamanhos, bordas, adicionais e outras variações do cardápio
        </p>
      </div>

      <Card className="border-[hsl(var(--primary))]/20 bg-[hsl(var(--primary))]/5">
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]">
              <Plus className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="font-medium">Criar novo grupo</p>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Depois de criar, expanda o grupo para cadastrar as opções
              </p>
            </div>
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
          <p className="font-medium">Nenhum grupo cadastrado</p>
          <p className="mt-1 max-w-sm text-sm text-[hsl(var(--muted-foreground))]">
            Crie grupos como Tamanho, Borda ou Adicionais e vincule aos produtos no cadastro de
            produtos.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map((group, index) => (
            <OptionGroupEditor key={group.id} group={group} defaultExpanded={index === 0} />
          ))}
        </div>
      )}
    </div>
  );
}
