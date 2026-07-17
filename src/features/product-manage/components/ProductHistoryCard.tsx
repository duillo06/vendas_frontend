import type { ProductAdminDetail } from "@/features/catalog/api/catalogAdminApi";

type ProductHistoryCardProps = {
  product: ProductAdminDetail & { created_at?: string; updated_at?: string };
};

export function ProductHistoryCard({ product }: ProductHistoryCardProps) {
  const events = [
    product.created_at
      ? { label: "Criado", at: product.created_at }
      : null,
    product.updated_at
      ? { label: "Última alteração", at: product.updated_at }
      : null,
    {
      label: "Última atualização de preço",
      at: product.updated_at,
      soft: true,
    },
    {
      label: "Última venda",
      at: null as string | null,
      soon: true,
    },
  ].filter(Boolean) as Array<{
    label: string;
    at?: string | null;
    soft?: boolean;
    soon?: boolean;
  }>;

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Histórico</h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Timeline do produto. Eventos de venda entram aqui depois.
        </p>
      </div>
      <ol className="relative space-y-4 border-l border-[hsl(var(--border))] pl-4">
        {events.map((event) => (
          <li key={event.label} className="relative">
            <span className="absolute top-1.5 -left-[1.325rem] h-2.5 w-2.5 rounded-full border-2 border-brand bg-white" />
            <p className="text-sm font-medium">{event.label}</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              {event.soon
                ? "Em breve"
                : event.at
                  ? formatDateTime(event.at)
                  : "—"}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function formatDateTime(iso: string) {
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
