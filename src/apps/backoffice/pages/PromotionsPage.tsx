import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Percent, Sparkles } from "lucide-react";
import { useState } from "react";

import { CampaignAssistant } from "@/features/promotions/components/CampaignAssistant";
import { promotionsAdminApi, type CampaignAdmin } from "@/features/promotions";
import { Can } from "@/features/auth";
import { EmptyState } from "@/shared/components/EmptyState";
import { PriceDisplay } from "@/shared/components/PriceDisplay";
import { UiHint } from "@/shared/components/UiHint";
import { BackLink, PageHeader } from "@/shared/components/visual";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { formatCurrency } from "@/shared/lib/format";

export function PromotionsPage() {
  const [creating, setCreating] = useState(false);
  const queryClient = useQueryClient();

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ["admin", "campaigns"],
    queryFn: () => promotionsAdminApi.list(),
  });

  const pauseMutation = useMutation({
    mutationFn: (campaign: CampaignAdmin) =>
      promotionsAdminApi.update(campaign.id, {
        status: campaign.status === "active" ? "paused" : "active",
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "campaigns"] }),
  });

  if (creating) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => setCreating(false)}
          className="text-sm font-medium text-brand hover:underline"
        >
          ← Voltar para promoções
        </button>
        <PageHeader
          title="Vender mais"
          subtitle="Responda algumas perguntas — em menos de um minuto sua oferta está no ar."
          icon={Sparkles}
        />
        <CampaignAssistant
          onCancel={() => setCreating(false)}
          onCreated={() => {
            void queryClient.invalidateQueries({ queryKey: ["admin", "campaigns"] });
            setCreating(false);
          }}
        />
      </div>
    );
  }

  const list = campaigns ?? [];

  return (
    <div className="space-y-6">
      <BackLink to="/" label="Dashboard" />
      <PageHeader
        title="Promoções"
        subtitle="Ajude o cardápio a vender mais — sem planilha de regras."
        icon={Percent}
        action={
          <Can permission="promotions.manage">
            <Button type="button" className="bg-brand" onClick={() => setCreating(true)}>
              Nova promoção
            </Button>
          </Can>
        }
      />

      <UiHint tone="warm">
        Comece pelo que você quer aumentar (vendas, ticket, um produto…). O sistema monta a oferta.
      </UiHint>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : list.length === 0 ? (
        <EmptyState
          icon={Percent}
          title="Nenhuma promoção ainda"
          description="Crie a primeira em menos de um minuto — preço especial em um produto, com destaque na Home."
          action={
            <Can permission="promotions.manage">
              <Button type="button" className="bg-brand" onClick={() => setCreating(true)}>
                Criar promoção
              </Button>
            </Can>
          }
        />
      ) : (
        <ul className="space-y-3">
          {list.map((campaign) => (
            <li key={campaign.id}>
              <Card className="interactive-card">
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold">{campaign.title || campaign.product_name}</p>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                      De {formatCurrency(campaign.reference_price)} · Por{" "}
                      <PriceDisplay value={campaign.promo_price} className="font-medium text-brand" />
                      {campaign.discount_percent != null
                        ? ` · −${campaign.discount_percent}%`
                        : ""}
                    </p>
                    <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                      {statusLabel(campaign.status)}
                      {campaign.badges?.length ? ` · ${campaign.badges.slice(0, 2).join(" · ")}` : ""}
                    </p>
                  </div>
                  <Can permission="promotions.manage">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={pauseMutation.isPending}
                      onClick={() => pauseMutation.mutate(campaign)}
                    >
                      {campaign.status === "active" ? "Pausar" : "Reativar"}
                    </Button>
                  </Can>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function statusLabel(status: CampaignAdmin["status"]) {
  switch (status) {
    case "active":
      return "Ativa";
    case "paused":
      return "Pausada";
    case "ended":
      return "Encerrada";
    default:
      return "Rascunho";
  }
}
