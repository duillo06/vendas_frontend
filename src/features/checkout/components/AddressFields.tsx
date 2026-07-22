import { LocateFixed, Loader2 } from "lucide-react";

import { useGeolocationCity } from "@/features/checkout/hooks/useGeolocationCity";
import { isInDeliveryArea } from "@/shared/lib/geo";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { cn } from "@/shared/lib/utils";

export type AddressFieldsValue = {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  reference?: string;
  latitude?: number | null;
  longitude?: number | null;
  fromGeo?: boolean;
};

type AddressFieldsErrors = Partial<Record<keyof AddressFieldsValue, { message?: string }>>;

type AddressFieldsProps = {
  value: AddressFieldsValue;
  onChange: (next: AddressFieldsValue) => void;
  errors?: AddressFieldsErrors;
  /** cidade/UF da loja — aviso se o endereço sair da área */
  deliveryCity?: string | null;
  deliveryState?: string | null;
  showLabel?: boolean;
  className?: string;
};

/** campos de endereço — com GPS esconde CEP e trava cidade/UF */
export function AddressFields({
  value,
  onChange,
  errors,
  deliveryCity,
  deliveryState,
  showLabel = true,
  className,
}: AddressFieldsProps) {
  const geo = useGeolocationCity();
  const fromGeo = Boolean(value.fromGeo);
  const outOfArea =
    value.city && value.state
      ? !isInDeliveryArea({
          city: value.city,
          state: value.state,
          deliveryCity,
          deliveryState,
        })
      : false;

  const patch = (partial: Partial<AddressFieldsValue>) => {
    onChange({ ...value, ...partial });
  };

  const handleUseLocation = async () => {
    const result = await geo.request();
    if (!result) return;
    onChange({
      ...value,
      city: result.city,
      state: result.state,
      zipCode: "",
      latitude: result.latitude,
      longitude: result.longitude,
      fromGeo: true,
    });
  };

  const handleClearGeo = () => {
    geo.clear();
    onChange({
      ...value,
      city: "",
      state: "",
      zipCode: "",
      latitude: null,
      longitude: null,
      fromGeo: false,
    });
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {showLabel ? (
          <p className="text-sm font-medium text-[hsl(var(--foreground))]">Endereço</p>
        ) : (
          <span />
        )}
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-10 gap-1.5"
            disabled={geo.status === "prompting"}
            onClick={() => void handleUseLocation()}
          >
            {geo.status === "prompting" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LocateFixed className="h-4 w-4" />
            )}
            Usar minha localização
          </Button>
          {fromGeo ? (
            <Button type="button" variant="ghost" size="sm" className="h-10" onClick={handleClearGeo}>
              Preencher na mão
            </Button>
          ) : null}
        </div>
      </div>

      {geo.error && !fromGeo ? (
        <p className="text-xs text-[hsl(var(--muted-foreground))]">{geo.error}</p>
      ) : null}

      {fromGeo ? (
        <p className="rounded-lg bg-brand-soft px-3 py-2 text-xs text-brand">
          Cidade e estado pela sua localização — CEP não é necessário.
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="addr-street">Rua</Label>
          <Input
            id="addr-street"
            value={value.street}
            onChange={(e) => patch({ street: e.target.value })}
            autoComplete="street-address"
          />
          {errors?.street?.message ? (
            <p className="text-xs text-red-600">{errors.street.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="addr-number">Número</Label>
          <Input
            id="addr-number"
            value={value.number}
            onChange={(e) => patch({ number: e.target.value })}
          />
          {errors?.number?.message ? (
            <p className="text-xs text-red-600">{errors.number.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="addr-complement">Complemento</Label>
          <Input
            id="addr-complement"
            value={value.complement ?? ""}
            onChange={(e) => patch({ complement: e.target.value })}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="addr-neighborhood">Bairro</Label>
          <Input
            id="addr-neighborhood"
            value={value.neighborhood}
            onChange={(e) => patch({ neighborhood: e.target.value })}
          />
          {errors?.neighborhood?.message ? (
            <p className="text-xs text-red-600">{errors.neighborhood.message}</p>
          ) : null}
        </div>

        {!fromGeo ? (
          <div className="space-y-2">
            <Label htmlFor="addr-zip">CEP</Label>
            <Input
              id="addr-zip"
              placeholder="01310-100"
              value={value.zipCode}
              onChange={(e) => patch({ zipCode: e.target.value })}
              autoComplete="postal-code"
            />
            {errors?.zipCode?.message ? (
              <p className="text-xs text-red-600">{errors.zipCode.message}</p>
            ) : null}
          </div>
        ) : null}

        <div className={cn("space-y-2", fromGeo && "sm:col-span-1")}>
          <Label htmlFor="addr-city">Cidade</Label>
          <Input
            id="addr-city"
            value={value.city}
            readOnly={fromGeo}
            onChange={(e) => patch({ city: e.target.value })}
            className={fromGeo ? "bg-[hsl(var(--muted))]/40" : undefined}
          />
          {errors?.city?.message ? (
            <p className="text-xs text-red-600">{errors.city.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="addr-state">UF</Label>
          <Input
            id="addr-state"
            maxLength={2}
            value={value.state}
            readOnly={fromGeo}
            onChange={(e) => patch({ state: e.target.value.toUpperCase() })}
            className={fromGeo ? "bg-[hsl(var(--muted))]/40" : undefined}
          />
          {errors?.state?.message ? (
            <p className="text-xs text-red-600">{errors.state.message}</p>
          ) : null}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="addr-reference">Referência</Label>
          <Input
            id="addr-reference"
            value={value.reference ?? ""}
            onChange={(e) => patch({ reference: e.target.value })}
          />
        </div>
      </div>

      {outOfArea && deliveryCity ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          Não entregamos em {value.city}. Nossa entrega é só em {deliveryCity}
          {deliveryState ? ` (${deliveryState})` : ""}.
        </p>
      ) : null}
    </div>
  );
}
