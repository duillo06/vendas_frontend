import { useEffect, useState } from "react";

import {
  DAY_LABELS,
  DEFAULT_THEME,
  hasLowContrast,
  hexToHslComponents,
  hslComponentsToHex,
  useSettings,
  useTenantTheme,
  useUpdateSettings,
  useUploadLogo,
  type SettingsData,
} from "@/features/settings";
import type { BusinessHoursAdmin, TenantTheme } from "@/features/settings/types/settings.types";
import { UiHint } from "@/shared/components/UiHint";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { adminCopy } from "@/shared/copy/admin";
import { cn } from "@/shared/lib/utils";

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-[hsl(var(--border))] p-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {description ? (
          <p className="text-xs text-[hsl(var(--muted-foreground))]">{description}</p>
        ) : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={cn(
          "relative h-7 w-12 rounded-full transition-colors",
          checked ? "bg-[hsl(var(--primary))]" : "bg-[hsl(var(--muted))]",
        )}
        onClick={() => onChange(!checked)}
      >
        <span
          className={cn(
            "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-5" : "translate-x-0.5",
          )}
        />
      </button>
    </div>
  );
}

export function SettingsForm() {
  const { data, isLoading } = useSettings();
  const { mutate: saveSettings, isPending } = useUpdateSettings();
  const { mutate: uploadLogo, isPending: uploadingLogo } = useUploadLogo();

  const [form, setForm] = useState<SettingsData | null>(null);
  const [contrastWarning, setContrastWarning] = useState(false);

  useEffect(() => {
    if (data) {
      setForm(data);
    }
  }, [data]);

  useEffect(() => {
    const theme = form?.settings.theme;
    if (!theme?.primary || !theme.primary_foreground) {
      setContrastWarning(false);
      return;
    }
    setContrastWarning(hasLowContrast(theme.primary, theme.primary_foreground));
  }, [form?.settings.theme]);

  useTenantTheme(form?.settings.theme);

  if (isLoading || !form) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const updateCompany = (field: keyof SettingsData["company"], value: string) => {
    setForm((current) =>
      current
        ? {
            ...current,
            company: { ...current.company, [field]: value },
          }
        : current,
    );
  };

  const updateSettings = (
    field: keyof SettingsData["settings"],
    value: string | number | boolean | null,
  ) => {
    setForm((current) =>
      current
        ? {
            ...current,
            settings: { ...current.settings, [field]: value },
          }
        : current,
    );
  };

  const updateHour = (day: number, patch: Partial<BusinessHoursAdmin>) => {
    setForm((current) => {
      if (!current) return current;
      return {
        ...current,
        business_hours: current.business_hours.map((row) =>
          row.day_of_week === day ? { ...row, ...patch } : row,
        ),
      };
    });
  };

  const primaryHex =
    hslComponentsToHex(form.settings.theme?.primary ?? DEFAULT_THEME.primary) ?? "#10b981";
  const accentHex =
    hslComponentsToHex(form.settings.theme?.accent ?? DEFAULT_THEME.accent) ?? "#eab308";

  const patchTheme = (patch: Partial<NonNullable<SettingsData["settings"]["theme"]>>) => {
    setForm((current) =>
      current
        ? {
            ...current,
            settings: {
              ...current.settings,
              theme: {
                ...current.settings.theme,
                primary: current.settings.theme?.primary ?? DEFAULT_THEME.primary,
                primary_foreground:
                  current.settings.theme?.primary_foreground ?? DEFAULT_THEME.primary_foreground,
                accent: current.settings.theme?.accent ?? DEFAULT_THEME.accent,
                accent_foreground:
                  current.settings.theme?.accent_foreground ?? DEFAULT_THEME.accent_foreground,
                radius: current.settings.theme?.radius ?? DEFAULT_THEME.radius,
                ...patch,
              },
            },
          }
        : current,
    );
  };

  const patchStorefront = (patch: Partial<NonNullable<TenantTheme["storefront"]>>) => {
    const currentTheme = form?.settings.theme;
    patchTheme({
      storefront: {
        ...currentTheme?.storefront,
        ...patch,
      },
    });
  };

  const handleSave = () => {
    saveSettings({
      company: {
        legal_name: form.company.legal_name,
        trade_name: form.company.trade_name,
        document: form.company.document,
        email: form.company.email,
        phone: form.company.phone,
        description: form.company.description,
      },
      settings: {
        min_order_value: Number(form.settings.min_order_value),
        delivery_fee: Number(form.settings.delivery_fee),
        free_delivery_above: form.settings.free_delivery_above
          ? Number(form.settings.free_delivery_above)
          : null,
        estimated_prep_time: Number(form.settings.estimated_prep_time),
        estimated_delivery_time: Number(form.settings.estimated_delivery_time),
        accepts_delivery: form.settings.accepts_delivery,
        accepts_pickup: form.settings.accepts_pickup,
        is_open: form.settings.is_open,
        auto_close_outside_hours: form.settings.auto_close_outside_hours,
        theme: form.settings.theme,
      },
      business_hours: form.business_hours,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Empresa</CardTitle>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {adminCopy.settings.sections.company}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {form.company.logo_url ? (
              <img
                src={form.company.logo_url}
                alt="Logo"
                className="h-16 w-16 rounded-lg border border-[hsl(var(--border))] object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-[hsl(var(--border))] text-xs text-[hsl(var(--muted-foreground))]">
                Sem logo
              </div>
            )}
            <div>
              <Label htmlFor="logo-upload">Logo</Label>
              <Input
                id="logo-upload"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="mt-1 max-w-xs"
                disabled={uploadingLogo}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    uploadLogo(file, {
                      onSuccess: (result) => {
                        updateCompany("logo_url", result.logo_url);
                      },
                    });
                  }
                }}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="trade_name">Nome fantasia</Label>
              <Input
                id="trade_name"
                value={form.company.trade_name}
                onChange={(event) => updateCompany("trade_name", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="legal_name">Razão social</Label>
              <Input
                id="legal_name"
                value={form.company.legal_name}
                onChange={(event) => updateCompany("legal_name", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={form.company.phone ?? ""}
                onChange={(event) => updateCompany("phone", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={form.company.email}
                onChange={(event) => updateCompany("email", event.target.value)}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                value={form.company.description ?? ""}
                onChange={(event) => updateCompany("description", event.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Operação</CardTitle>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {adminCopy.settings.sections.operation}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <ToggleRow
            label="Loja aberta"
            description="Quando fechada, novos pedidos são bloqueados"
            checked={form.settings.is_open}
            onChange={(value) => updateSettings("is_open", value)}
          />
          <ToggleRow
            label="Fechar fora do horário"
            description="Respeita os horários de funcionamento"
            checked={form.settings.auto_close_outside_hours}
            onChange={(value) => updateSettings("auto_close_outside_hours", value)}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="min_order_value">Pedido mínimo (R$)</Label>
              <Input
                id="min_order_value"
                type="number"
                step="0.01"
                min="0"
                value={form.settings.min_order_value}
                onChange={(event) => updateSettings("min_order_value", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="delivery_fee">Taxa de entrega (R$)</Label>
              <Input
                id="delivery_fee"
                type="number"
                step="0.01"
                min="0"
                value={form.settings.delivery_fee}
                onChange={(event) => updateSettings("delivery_fee", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="free_delivery_above">Entrega grátis acima de (R$)</Label>
              <Input
                id="free_delivery_above"
                type="number"
                step="0.01"
                min="0"
                value={form.settings.free_delivery_above ?? ""}
                onChange={(event) =>
                  updateSettings(
                    "free_delivery_above",
                    event.target.value ? event.target.value : null,
                  )
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Horários</CardTitle>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {adminCopy.settings.sections.hours}
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {form.business_hours.map((row) => (
            <div
              key={row.day_of_week}
              className="grid gap-2 rounded-lg border border-[hsl(var(--border))] p-3 sm:grid-cols-[7rem_1fr_1fr_auto]"
            >
              <p className="text-sm font-medium">{DAY_LABELS[row.day_of_week]}</p>
              <Input
                type="time"
                value={row.opens_at}
                disabled={row.is_closed}
                onChange={(event) => updateHour(row.day_of_week, { opens_at: event.target.value })}
              />
              <Input
                type="time"
                value={row.closes_at}
                disabled={row.is_closed}
                onChange={(event) => updateHour(row.day_of_week, { closes_at: event.target.value })}
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={row.is_closed}
                  onChange={(event) =>
                    updateHour(row.day_of_week, { is_closed: event.target.checked })
                  }
                />
                Fechado
              </label>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Aparência</CardTitle>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {adminCopy.settings.sections.appearance}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
            <div className="space-y-2">
              <Label htmlFor="primary_color">Cor principal</Label>
              <Input
                id="primary_color"
                type="color"
                value={primaryHex}
                className="h-11 w-full max-w-[8rem] cursor-pointer p-1"
                onChange={(event) => {
                  const hsl = hexToHslComponents(event.target.value);
                  if (!hsl) return;
                  patchTheme({ primary: hsl });
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accent_color">Cor de destaque</Label>
              <Input
                id="accent_color"
                type="color"
                value={accentHex}
                className="h-11 w-full max-w-[8rem] cursor-pointer p-1"
                onChange={(event) => {
                  const hsl = hexToHslComponents(event.target.value);
                  if (!hsl) return;
                  patchTheme({ accent: hsl });
                }}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setForm((current) =>
                  current
                    ? {
                        ...current,
                        settings: {
                          ...current.settings,
                          theme: { ...DEFAULT_THEME },
                        },
                      }
                    : current,
                )
              }
            >
              Resetar padrão
            </Button>
          </div>

          <div className="overflow-hidden rounded-xl border border-brand-soft shadow-sm">
            <div className="gradient-hero px-4 py-5 text-[hsl(var(--primary-foreground))]">
              <p className="text-sm font-medium opacity-90">Preview do cardápio</p>
              <p className="mt-1 text-lg font-bold">{form.company.trade_name || "Sua loja"}</p>
            </div>
            <div className="grid gap-3 bg-white p-4 sm:grid-cols-3">
              <div className="tile-brand flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium">
                <span className="h-2 w-2 rounded-full bg-brand" />
                Botão principal
              </div>
              <div className="tile-chart-2 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium">
                <span className="h-2 w-2 rounded-full bg-[hsl(var(--accent))]" />
                Destaque
              </div>
              <div className="tile-chart-3 rounded-lg px-3 py-2 text-sm font-medium">Ícones e cards</div>
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-[hsl(var(--border))] p-4">
            <p className="text-sm font-medium">Vitrine do cardápio (opcional)</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Slogan, avaliação e promoções aparecem no hero da home. Use a descrição da empresa como texto de apoio.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="storefront_slogan">Slogan curto</Label>
                <Input
                  id="storefront_slogan"
                  placeholder="Ex: A melhor pizza da cidade"
                  value={form.settings.theme?.storefront?.slogan ?? ""}
                  onChange={(event) => patchStorefront({ slogan: event.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="storefront_rating">Avaliação (ex: 4.9)</Label>
                <Input
                  id="storefront_rating"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={form.settings.theme?.storefront?.rating ?? ""}
                  onChange={(event) =>
                    patchStorefront({
                      rating: event.target.value ? Number(event.target.value) : undefined,
                      show_rating: Boolean(event.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="storefront_orders">Pedidos entregues</Label>
                <Input
                  id="storefront_orders"
                  type="number"
                  min="0"
                  value={form.settings.theme?.storefront?.orders_count ?? ""}
                  onChange={(event) =>
                    patchStorefront({
                      orders_count: event.target.value ? Number(event.target.value) : undefined,
                      show_orders_count: Boolean(event.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="promo_label">Botão de promoção</Label>
                <Input
                  id="promo_label"
                  placeholder="Ver promoções"
                  value={form.settings.theme?.storefront?.promo_label ?? ""}
                  onChange={(event) => patchStorefront({ promo_label: event.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="promo_url">Link da promoção</Label>
                <Input
                  id="promo_url"
                  placeholder="/cardapio"
                  value={form.settings.theme?.storefront?.promo_url ?? ""}
                  onChange={(event) => patchStorefront({ promo_url: event.target.value })}
                />
              </div>
            </div>
          </div>

          {contrastWarning ? (
            <UiHint tone="warm" className="text-xs">
              {adminCopy.settings.contrastWarning}
            </UiHint>
          ) : null}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="button" disabled={isPending} onClick={handleSave}>
          {isPending ? "Salvando..." : "Salvar configurações"}
        </Button>
      </div>
    </div>
  );
}
