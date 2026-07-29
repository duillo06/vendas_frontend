import { LocateFixed, Loader2, LockKeyhole } from "lucide-react";
import { useEffect } from "react";

import { useGeolocationCity } from "@/features/checkout/hooks/useGeolocationCity";
import { isInDeliveryArea } from "@/shared/lib/geo";
import { useBrazilianCities, useBrazilianStates } from "@/shared/hooks/useLocations";
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
  cityId?: number | null;
  stateId?: number | null;
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
  deliveryCityId?: number | null;
  deliveryStateId?: number | null;
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
  deliveryCityId,
  deliveryStateId,
  showLabel = true,
  className,
}: AddressFieldsProps) {
  const geo = useGeolocationCity();
  const fromGeo = Boolean(value.fromGeo);
  const locationLocked = Boolean(
    deliveryCity && deliveryState && deliveryCityId && deliveryStateId,
  );
  const { data: states = [], isLoading: statesLoading } = useBrazilianStates();
  const { data: cities = [], isLoading: citiesLoading } = useBrazilianCities(value.stateId);
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

  useEffect(() => {
    if (
      !locationLocked ||
      (value.cityId === deliveryCityId && value.stateId === deliveryStateId)
    ) {
      return;
    }
    const sameCity = isInDeliveryArea({
      city: value.city,
      state: value.state,
      deliveryCity,
      deliveryState,
    });
    onChange({
      ...value,
      street: sameCity ? value.street : "",
      number: sameCity ? value.number : "",
      complement: sameCity ? value.complement : "",
      neighborhood: sameCity ? value.neighborhood : "",
      zipCode: sameCity ? value.zipCode : "",
      reference: sameCity ? value.reference : "",
      city: deliveryCity ?? "",
      state: deliveryState ?? "",
      cityId: deliveryCityId,
      stateId: deliveryStateId,
      fromGeo: sameCity ? value.fromGeo : false,
      latitude: sameCity ? value.latitude : null,
      longitude: sameCity ? value.longitude : null,
    });
  }, [
    deliveryCity,
    deliveryCityId,
    deliveryState,
    deliveryStateId,
    locationLocked,
    onChange,
    value,
  ]);

  const handleUseLocation = async () => {
    const result = await geo.request();
    if (!result) return;
    onChange({
      ...value,
      city: result.city,
      state: result.state,
      cityId: result.cityId,
      stateId: result.stateId,
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
      cityId: null,
      stateId: null,
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
          {locationLocked ? (
            <span className="inline-flex h-10 items-center gap-1.5 rounded-md bg-[hsl(var(--muted))]/60 px-3 text-xs text-[hsl(var(--muted-foreground))]">
              <LockKeyhole className="h-3.5 w-3.5" />
              Cidade definida pela loja
            </span>
          ) : null}
          {!locationLocked ? (
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
          ) : null}
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
          <select
            id="addr-city"
            value={value.cityId ?? (value.city ? "current" : "")}
            disabled={fromGeo || locationLocked || !value.stateId || citiesLoading}
            onChange={(event) => {
              const city = cities.find((item) => item.id === Number(event.target.value));
              patch({ city: city?.name ?? "", cityId: city?.id ?? null });
            }}
            className={cn(
              "flex h-10 w-full rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm",
              (fromGeo || locationLocked) && "bg-[hsl(var(--muted))]/40",
            )}
          >
            {locationLocked && deliveryCityId ? (
              <option value={deliveryCityId}>{deliveryCity}</option>
            ) : fromGeo && value.cityId ? (
              <option value={value.cityId}>{value.city}</option>
            ) : (
              <>
                {!value.cityId && value.city ? (
                  <option value="current">{value.city}</option>
                ) : null}
                <option value="">{citiesLoading ? "Carregando..." : "Escolha a cidade"}</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </>
            )}
          </select>
          {errors?.city?.message ? (
            <p className="text-xs text-red-600">{errors.city.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="addr-state">UF</Label>
          <select
            id="addr-state"
            value={value.stateId ?? (value.state ? "current" : "")}
            disabled={fromGeo || locationLocked || statesLoading}
            onChange={(event) => {
              const state = states.find((item) => item.id === Number(event.target.value));
              patch({
                state: state?.acronym ?? "",
                stateId: state?.id ?? null,
                city: "",
                cityId: null,
              });
            }}
            className={cn(
              "flex h-10 w-full rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm",
              (fromGeo || locationLocked) && "bg-[hsl(var(--muted))]/40",
            )}
          >
            {locationLocked && deliveryStateId ? (
              <option value={deliveryStateId}>{deliveryState}</option>
            ) : fromGeo && value.stateId ? (
              <option value={value.stateId}>{value.state}</option>
            ) : (
              <>
                {!value.stateId && value.state ? (
                  <option value="current">{value.state}</option>
                ) : null}
                <option value="">{statesLoading ? "Carregando..." : "Escolha o estado"}</option>
                {states.map((state) => (
                  <option key={state.id} value={state.id}>
                    {state.name} ({state.acronym})
                  </option>
                ))}
              </>
            )}
          </select>
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
          {`Não entregamos em ${value.city}. Nossa entrega é só em ${deliveryCity}${
            deliveryState ? ` (${deliveryState})` : ""
          }.`}
        </p>
      ) : null}
    </div>
  );
}
