import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

import { catalogAdminApi } from "@/features/catalog/api/catalogAdminApi";
import {
  promotionsAdminApi,
  type CampaignAdmin,
  type CampaignCreatePayload,
  type CommercialGoal,
  type RecurrenceType,
} from "@/features/promotions/api/promotionsApi";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";
import { formatCurrency } from "@/shared/lib/format";

type Props = {
  /** se vier, abre já preenchido pra ajustar */
  campaign?: CampaignAdmin;
  onSaved: () => void;
  onCancel: () => void;
};

const GOALS: { id: CommercialGoal; emoji: string; label: string }[] = [
  { id: "increase_sales", emoji: "📈", label: "Aumentar as vendas" },
  { id: "raise_ticket", emoji: "💰", label: "Aumentar o ticket médio" },
  { id: "attract_new", emoji: "👥", label: "Atrair novos clientes" },
  { id: "bring_back", emoji: "🔁", label: "Trazer clientes antigos de volta" },
  { id: "sell_category", emoji: "🍕", label: "Vender mais de um produto específico" },
  { id: "encourage_combo", emoji: "👨‍👩‍👧", label: "Incentivar combos" },
  { id: "order_threshold", emoji: "🚚", label: "Aumentar pedidos acima de um valor" },
];

const WEEKDAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"] as const;

const stepMotion = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const },
};

function calcImpact(reference: number, promo: number) {
  const save = Math.max(0, Math.round((reference - promo) * 100) / 100);
  const pct = reference > 0 ? Math.round((save / reference) * 100) : 0;
  return { save, pct };
}

function weightToIntensity(weight: number): 10 | 100 | 200 {
  if (weight >= 200) return 200;
  if (weight >= 100) return 100;
  return 10;
}

function toDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function goalSupportsDirectPath(goal: CommercialGoal) {
  return (
    goal === "increase_sales" ||
    goal === "sell_category" ||
    goal === "attract_new" ||
    goal === "bring_back"
  );
}

export function CampaignAssistant({ campaign, onSaved, onCancel }: Props) {
  const isEdit = Boolean(campaign);

  const [goal, setGoal] = useState<CommercialGoal | null>(campaign?.commercial_goal ?? null);
  const [acceptedPath, setAcceptedPath] = useState(
    () => Boolean(campaign) || (campaign?.commercial_goal ? goalSupportsDirectPath(campaign.commercial_goal) : false),
  );
  const [productId, setProductId] = useState<string | null>(campaign?.product_id ?? null);
  const [promoPrice, setPromoPrice] = useState(
    campaign?.promo_price != null ? String(campaign.promo_price) : "",
  );
  const [recurrence, setRecurrence] = useState<RecurrenceType>(
    campaign?.recurrence_type ?? "once",
  );
  const [weekdays, setWeekdays] = useState<number[]>(campaign?.weekdays ?? []);
  const [endsAt, setEndsAt] = useState(() => toDatetimeLocal(campaign?.ends_at));
  const [showHome, setShowHome] = useState(campaign?.show_on_home ?? true);
  const [showMenu, setShowMenu] = useState(campaign?.show_on_menu ?? true);
  const [showProduct, setShowProduct] = useState(campaign?.show_on_product ?? true);
  const [linkOnly, setLinkOnly] = useState(campaign?.link_only ?? false);
  const [intensity, setIntensity] = useState<10 | 100 | 200>(() =>
    weightToIntensity(campaign?.weight ?? 10),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState("");

  const { data: productsPage } = useQuery({
    queryKey: ["admin", "products", "campaign-picker"],
    queryFn: () => catalogAdminApi.listProducts({ page_size: "100", is_active: "true" }),
    enabled: acceptedPath || isEdit,
  });

  const products = productsPage?.results ?? [];
  const selected = products.find((p) => p.id === productId) ?? null;
  const promoNum = Number(promoPrice.replace(",", "."));

  // "De" da campanha: referência travada se for o mesmo produto
  const referencePrice = (() => {
    if (!selected) return campaign?.reference_price ?? 0;
    if (campaign && productId === campaign.product_id) {
      return Number(campaign.reference_price);
    }
    return Number(selected.base_price);
  })();

  const impact =
    selected && Number.isFinite(promoNum) && promoNum > 0
      ? calcImpact(referencePrice, promoNum)
      : null;

  const filtered = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    return products.filter((p) => !q || p.name.toLowerCase().includes(q));
  }, [products, productSearch]);

  const pathReady = Boolean(goal) && (goalSupportsDirectPath(goal!) || acceptedPath);

  const canSave =
    productId &&
    Number.isFinite(promoNum) &&
    (selected || (isEdit && productId === campaign?.product_id)) &&
    promoNum > 0 &&
    promoNum < referencePrice &&
    (recurrence !== "weekdays" || weekdays.length > 0);

  const handleSave = async () => {
    if (!goal || !productId || !canSave) return;
    setSaving(true);
    setError(null);
    const payload: CampaignCreatePayload = {
      commercial_goal: goal,
      product_id: productId,
      promo_price: promoNum,
      recurrence_type: recurrence,
      weekdays: recurrence === "weekdays" ? weekdays : [],
      ends_at: endsAt ? new Date(endsAt).toISOString() : null,
      show_on_home: linkOnly ? false : showHome,
      show_on_menu: linkOnly ? false : showMenu,
      show_on_product: showProduct,
      link_only: linkOnly,
      weight: intensity,
    };
    try {
      if (campaign) {
        await promotionsAdminApi.update(campaign.id, payload);
      } else {
        await promotionsAdminApi.create(payload);
      }
      onSaved();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : campaign
            ? "Não foi possível salvar as alterações"
            : "Não foi possível criar a promoção",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <QuestionBlock
        title={isEdit ? "O que você quer reforçar com essa oferta?" : "O que você deseja aumentar hoje?"}
      >
        <div className="grid gap-2 sm:grid-cols-2">
          {GOALS.map((g) => (
            <OptionCard
              key={g.id}
              label={`${g.emoji} ${g.label}`}
              selected={goal === g.id}
              onSelect={() => {
                setGoal(g.id);
                setAcceptedPath(isEdit || goalSupportsDirectPath(g.id));
              }}
            />
          ))}
        </div>
      </QuestionBlock>

      <AnimatePresence initial={false}>
        {goal && !acceptedPath ? (
          <motion.div key="path" {...stepMotion}>
            <QuestionBlock
              title="Para isso, nesta versão vamos criar um preço especial em um produto"
              description="Combo, frete grátis e brinde chegam em seguida — por enquanto o caminho mais rápido é baixar o preço de um item."
            >
              <OptionCard
                label="🔥 Vender um produto por um preço menor"
                description="Ideal pra começar a vender mais hoje."
                selected={acceptedPath}
                onSelect={() => setAcceptedPath(true)}
              />
            </QuestionBlock>
          </motion.div>
        ) : null}

        {pathReady && acceptedPath ? (
          <motion.div key="flow" className="space-y-8" {...stepMotion}>
            <QuestionBlock title="Qual produto ficará em promoção?">
              <Input
                placeholder="Buscar produto…"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="mb-2"
              />
              <div className="max-h-56 space-y-2 overflow-y-auto">
                {filtered.map((p) => (
                  <OptionCard
                    key={p.id}
                    label={p.name}
                    description={`Hoje: ${formatCurrency(p.base_price)}`}
                    selected={productId === p.id}
                    onSelect={() => setProductId(p.id)}
                  />
                ))}
                {/* se o produto da campanha ainda não veio na lista */}
                {isEdit &&
                campaign &&
                productId === campaign.product_id &&
                !products.some((p) => p.id === campaign.product_id) ? (
                  <OptionCard
                    label={campaign.product_name}
                    description={`De: ${formatCurrency(campaign.reference_price)}`}
                    selected
                    onSelect={() => setProductId(campaign.product_id)}
                  />
                ) : null}
              </div>
            </QuestionBlock>

            {productId ? (
              <QuestionBlock title="Qual será o novo preço?">
                <Input
                  type="number"
                  min={0.01}
                  step="0.01"
                  inputMode="decimal"
                  placeholder="Ex.: 59,00"
                  value={promoPrice}
                  onChange={(e) => setPromoPrice(e.target.value)}
                  className="h-12 max-w-[12rem] text-lg font-semibold"
                />
                {impact && promoNum < referencePrice ? (
                  <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
                    De {formatCurrency(referencePrice)} · Por {formatCurrency(promoNum)} · Desconto
                    de {impact.pct}% · Economia de {formatCurrency(impact.save)}
                  </p>
                ) : null}
              </QuestionBlock>
            ) : null}

            {productId && impact && promoNum < referencePrice ? (
              <>
                <QuestionBlock title="Esta promoção acontece…">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <OptionCard
                      label="Apenas uma vez"
                      selected={recurrence === "once"}
                      onSelect={() => setRecurrence("once")}
                    />
                    <OptionCard
                      label="Em dias específicos da semana"
                      selected={recurrence === "weekdays"}
                      onSelect={() => setRecurrence("weekdays")}
                    />
                  </div>
                  {recurrence === "weekdays" ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {WEEKDAY_LABELS.map((label, index) => {
                        const on = weekdays.includes(index);
                        return (
                          <button
                            key={label}
                            type="button"
                            onClick={() =>
                              setWeekdays((prev) =>
                                on ? prev.filter((d) => d !== index) : [...prev, index],
                              )
                            }
                            className={cn(
                              "min-h-11 rounded-xl border-2 px-3 text-sm font-medium",
                              on
                                ? "border-[hsl(var(--primary)/0.45)] bg-[hsl(var(--primary-soft))]"
                                : "border-[hsl(var(--border))]",
                            )}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                  <label className="mt-3 block space-y-1.5">
                    <span className="text-sm text-[hsl(var(--muted-foreground))]">
                      Até quando? (opcional)
                    </span>
                    <Input
                      type="datetime-local"
                      value={endsAt}
                      onChange={(e) => setEndsAt(e.target.value)}
                      className="max-w-xs"
                    />
                  </label>
                </QuestionBlock>

                <QuestionBlock
                  title="Quão especial é essa oferta?"
                  description="Isso define o destaque na vitrine da loja."
                >
                  <div className="grid gap-2">
                    <OptionCard
                      label="Do dia a dia"
                      description="Aparece junto com as outras promoções."
                      selected={intensity === 10}
                      onSelect={() => setIntensity(10)}
                    />
                    <OptionCard
                      label="Campanha especial / do mês"
                      description="Ganha mais prioridade no carrossel."
                      selected={intensity === 100}
                      onSelect={() => setIntensity(100)}
                    />
                    <OptionCard
                      label="Oferta relâmpago"
                      description="Vai na frente — urgência e destaque."
                      selected={intensity === 200}
                      onSelect={() => setIntensity(200)}
                    />
                  </div>
                </QuestionBlock>

                <QuestionBlock title="Onde deseja mostrar esta promoção?">
                  <div className="space-y-2">
                    <ToggleRow
                      label="Home"
                      checked={showHome && !linkOnly}
                      onChange={setShowHome}
                      disabled={linkOnly}
                    />
                    <ToggleRow
                      label="Cardápio"
                      checked={showMenu && !linkOnly}
                      onChange={setShowMenu}
                      disabled={linkOnly}
                    />
                    <ToggleRow label="Página do produto" checked={showProduct} onChange={setShowProduct} />
                    <ToggleRow
                      label="Apenas pelo link"
                      checked={linkOnly}
                      onChange={(v) => setLinkOnly(v)}
                    />
                  </div>
                </QuestionBlock>

                <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 p-4">
                  <p className="text-sm font-medium">Resumo</p>
                  <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                    {(selected?.name ?? campaign?.product_name) || "Produto"} por{" "}
                    {formatCurrency(promoNum)} (de {formatCurrency(referencePrice)})
                    {impact ? ` · −${impact.pct}% · economize ${formatCurrency(impact.save)}` : ""}
                  </p>
                </div>

                {error ? <p className="text-sm text-[hsl(var(--destructive))]">{error}</p> : null}

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    type="button"
                    size="lg"
                    className="h-12 flex-1 bg-brand font-semibold"
                    disabled={!canSave || saving}
                    onClick={() => void handleSave()}
                  >
                    {saving
                      ? isEdit
                        ? "Salvando…"
                        : "Criando…"
                      : isEdit
                        ? "Salvar alterações"
                        : "Criar promoção"}
                  </Button>
                  <Button type="button" variant="outline" size="lg" className="h-12" onClick={onCancel}>
                    Cancelar
                  </Button>
                </div>
              </>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function QuestionBlock({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-base font-semibold leading-snug tracking-tight">{title}</h3>
        {description ? (
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function OptionCard({
  label,
  description,
  selected,
  onSelect,
}: {
  label: string;
  description?: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.985 }}
      onClick={onSelect}
      className={cn(
        "flex min-h-11 w-full items-start gap-3 rounded-xl border-2 px-3.5 py-3 text-left transition-colors",
        selected
          ? "border-[hsl(var(--primary)/0.45)] bg-[hsl(var(--primary-soft))] shadow-sm"
          : "border-[hsl(var(--border))] bg-white hover:border-[hsl(var(--primary)/0.28)] hover:bg-[hsl(var(--muted))]/40",
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
          selected ? "border-brand bg-brand text-white" : "border-[hsl(var(--border))]",
        )}
        aria-hidden
      >
        {selected ? <Check className="h-3 w-3" /> : null}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium leading-snug">{label}</span>
        {description ? (
          <span className="mt-0.5 block text-xs text-[hsl(var(--muted-foreground))]">{description}</span>
        ) : null}
      </span>
    </motion.button>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label
      className={cn(
        "flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-xl border px-3 py-2",
        disabled && "opacity-50",
      )}
    >
      <span className="text-sm font-medium">{label}</span>
      <input
        type="checkbox"
        className="h-5 w-5 accent-[hsl(var(--primary))]"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
}
