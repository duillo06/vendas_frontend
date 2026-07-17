import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, Layers, Pencil, Plus, Search, Sparkles, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";

import { catalogAdminApi, type OptionGroupAdmin } from "@/features/catalog/api/catalogAdminApi";
import { CustomizationAssistant } from "@/features/catalog/components/CustomizationAssistant";
import { catalogAdminKeys } from "@/features/catalog/constants/catalog-admin-keys";
import { summarizeGroup } from "@/features/catalog/utils/conversationalOptions";
import {
  createCustomizationFromDraft,
  updateCustomizationFromDraft,
} from "@/features/catalog/utils/saveCustomization";
import type { CustomizationDraft } from "@/features/catalog/utils/conversationalOptions";
import { UiHint } from "@/shared/components/UiHint";
import { BackLink, PageHeader } from "@/shared/components/visual";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useConfirm } from "@/shared/hooks/useConfirm";
import { adminCopy } from "@/shared/copy/admin";
import { cn } from "@/shared/lib/utils";

type DialogMode = "closed" | "create" | "edit";

export function OptionGroupsPage() {
  const queryClient = useQueryClient();
  const { confirm } = useConfirm();
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState<DialogMode>("closed");
  const [editing, setEditing] = useState<OptionGroupAdmin | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: catalogAdminKeys.optionGroups(),
    queryFn: () => catalogAdminApi.listOptionGroups(),
  });

  const groups = data ?? [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter((group) => group.name.toLowerCase().includes(q));
  }, [groups, search]);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: catalogAdminKeys.optionGroups() });
  };

  const saveMutation = useMutation({
    mutationFn: async ({
      draft,
      existing,
    }: {
      draft: CustomizationDraft;
      existing?: OptionGroupAdmin;
    }) => {
      if (existing) return updateCustomizationFromDraft(existing, draft);
      return createCustomizationFromDraft(draft, groups.length);
    },
    onSuccess: (_result, variables) => {
      invalidate();
      toast.success(
        variables.existing ? adminCopy.optionGroups.editor.saved : "Personalização criada",
      );
      setDialog("closed");
      setEditing(null);
    },
    onError: (err: Error) => toast.error(err.message || "Não deu pra salvar."),
  });

  const duplicate = useMutation({
    mutationFn: (id: string) => catalogAdminApi.duplicateOptionGroup(id),
    onSuccess: () => {
      invalidate();
      toast.success("Cópia criada");
    },
    onError: () => toast.error("Não deu pra duplicar."),
  });

  const remove = useMutation({
    mutationFn: (id: string) => catalogAdminApi.deleteOptionGroup(id),
    onSuccess: () => {
      invalidate();
      toast.success("Personalização removida");
    },
    onError: () => toast.error("Não deu pra excluir. Ela pode estar em uso em produtos."),
  });

  return (
    <div className="space-y-6">
      <BackLink to="/" label="Dashboard" />

      <PageHeader
        title="Personalizações salvas"
        subtitle={adminCopy.optionGroups.subtitle}
        icon={Layers}
      />

      <UiHint icon={Sparkles} tone="warm">
        {adminCopy.optionGroups.guidance}
        <Link to="/produtos" className="ml-1 font-medium text-brand underline">
          Ir para produtos
        </Link>
      </UiHint>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar personalização…"
            className="h-11 pl-9"
          />
        </div>
        <Button
          type="button"
          className="gap-2 bg-brand hover:brightness-95"
          onClick={() => {
            setEditing(null);
            setDialog("create");
          }}
        >
          <Plus className="h-4 w-4" />
          Nova personalização
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[hsl(var(--border))] px-6 py-16 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--muted))]">
            <Layers className="h-6 w-6 text-[hsl(var(--muted-foreground))]" />
          </div>
          <p className="font-medium">
            {search.trim() ? "Nada encontrado" : adminCopy.optionGroups.empty.title}
          </p>
          <p className="mt-1 max-w-sm text-sm text-[hsl(var(--muted-foreground))]">
            {search.trim()
              ? "Tente outro nome ou limpe a busca."
              : adminCopy.optionGroups.empty.description}
          </p>
          {!search.trim() ? (
            <Button
              type="button"
              className="mt-4 gap-2 bg-brand hover:brightness-95"
              onClick={() => setDialog("create")}
            >
              <Plus className="h-4 w-4" />
              Criar a primeira
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((group) => {
            const count = group.options_count || group.options.length;
            return (
              <Card
                key={group.id}
                className={cn(
                  "border-[hsl(var(--border))] bg-white transition hover:border-[hsl(var(--primary)/0.3)]",
                  !group.is_active && "opacity-60",
                )}
              >
                <CardContent className="flex flex-col gap-3 pt-5">
                  <div>
                    <p className="font-semibold leading-snug">{group.name}</p>
                    <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                      {count} escolha{count === 1 ? "" : "s"} · {summarizeGroup(group)}
                    </p>
                    {!group.is_active ? (
                      <p className="mt-1 text-xs text-amber-700">Inativa</p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={() => {
                        setEditing(group);
                        setDialog("edit");
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Editar
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="gap-1"
                      onClick={() => duplicate.mutate(group.id)}
                      disabled={duplicate.isPending}
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Duplicar
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="gap-1 text-red-600"
                      onClick={async () => {
                        const ok = await confirm({
                          title: "Excluir personalização?",
                          description: `“${group.name}” some da biblioteca. Produtos que usam podem ficar sem essa escolha.`,
                          confirmLabel: "Excluir",
                          destructive: true,
                        });
                        if (ok) remove.mutate(group.id);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog
        open={dialog !== "closed"}
        onOpenChange={(open) => {
          if (!open) {
            setDialog("closed");
            setEditing(null);
          }
        }}
        className="max-w-2xl"
      >
        <DialogContent
          onClose={() => {
            setDialog("closed");
            setEditing(null);
          }}
          className="max-h-[min(90vh,720px)] overflow-y-auto"
        >
          <DialogHeader>
            <DialogTitle>
              {dialog === "edit" ? "Editar personalização" : "Nova personalização"}
            </DialogTitle>
            <DialogDescription>
              Depois é só vincular nos produtos — ou criar direto lá.
            </DialogDescription>
          </DialogHeader>
          {dialog !== "closed" ? (
            <CustomizationAssistant
              mode={dialog === "edit" ? "edit" : "create"}
              initialGroup={editing}
              availableGroups={groups}
              pending={saveMutation.isPending}
              confirmLabel={dialog === "edit" ? "Salvar alterações" : "Salvar personalização"}
              onCancel={() => {
                setDialog("closed");
                setEditing(null);
              }}
              onSave={async (draft, existing) => {
                await saveMutation.mutateAsync({ draft, existing });
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
