import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import {
  AddressFields,
  type AddressFieldsValue,
} from "@/features/checkout/components/AddressFields";
import { useCompanyPublic } from "@/features/company";
import { customerAuthApi, type CustomerAddressPayload } from "@/features/customer-auth";
import { useConfirm } from "@/shared/hooks/useConfirm";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { storefrontCopy } from "@/shared/copy/storefront";
import { roundGeoCoordinate } from "@/shared/lib/geo";

const emptyAddress: AddressFieldsValue = {
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
  zipCode: "",
  reference: "",
  fromGeo: false,
};

export function AccountAddressesPage() {
  const queryClient = useQueryClient();
  const { confirm } = useConfirm();
  const { data: company } = useCompanyPublic();
  const [label, setLabel] = useState("");
  const [address, setAddress] = useState<AddressFieldsValue>(emptyAddress);
  const [showForm, setShowForm] = useState(false);

  const { data: addresses, isLoading } = useQuery({
    queryKey: ["account", "addresses"],
    queryFn: () => customerAuthApi.listAddresses(),
  });

  const createAddress = useMutation({
    mutationFn: () => {
      const payload: CustomerAddressPayload = {
        label,
        street: address.street,
        number: address.number,
        complement: address.complement,
        neighborhood: address.neighborhood,
        city: address.city,
        state: address.state.toUpperCase(),
        zip_code: address.fromGeo ? "" : address.zipCode,
        reference: address.reference,
        latitude:
          address.latitude != null ? roundGeoCoordinate(address.latitude) : null,
        longitude:
          address.longitude != null ? roundGeoCoordinate(address.longitude) : null,
        is_default: false,
      };
      return customerAuthApi.createAddress(payload);
    },
    onSuccess: () => {
      toast.success("Endereço salvo");
      setLabel("");
      setAddress(emptyAddress);
      setShowForm(false);
      void queryClient.invalidateQueries({ queryKey: ["account", "addresses"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const setDefault = useMutation({
    mutationFn: (id: string) => customerAuthApi.updateAddress(id, { is_default: true }),
    onSuccess: () => {
      toast.success("Endereço padrão atualizado");
      void queryClient.invalidateQueries({ queryKey: ["account", "addresses"] });
    },
  });

  const removeAddress = useMutation({
    mutationFn: (id: string) => customerAuthApi.deleteAddress(id),
    onSuccess: () => {
      toast.success("Endereço removido");
      void queryClient.invalidateQueries({ queryKey: ["account", "addresses"] });
    },
  });

  const handleDelete = async (id: string, addressLabel: string) => {
    const confirmed = await confirm({
      title: "Remover endereço",
      description: `Remover "${addressLabel || "este endereço"}"?`,
      confirmLabel: "Remover",
      destructive: true,
    });
    if (confirmed) removeAddress.mutate(id);
  };

  const canSave =
    address.street.trim() &&
    address.number.trim() &&
    address.neighborhood.trim() &&
    address.city.trim() &&
    address.state.trim().length === 2 &&
    (address.fromGeo || /^\d{5}-?\d{3}$/.test(address.zipCode));

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">{storefrontCopy.account.addressesTitle}</h1>
        <Button
          type="button"
          onClick={() => {
            setShowForm((value) => !value);
            if (showForm) {
              setLabel("");
              setAddress(emptyAddress);
            }
          }}
        >
          {showForm ? "Cancelar" : "Novo endereço"}
        </Button>
      </div>

      {showForm ? (
        <Card>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="label">Apelido (Casa, Trabalho...)</Label>
              <Input id="label" value={label} onChange={(e) => setLabel(e.target.value)} />
            </div>
            <AddressFields
              value={address}
              onChange={setAddress}
              deliveryCity={company?.settings.delivery_city}
              deliveryState={company?.settings.delivery_state}
              showLabel={false}
            />
            <Button
              type="button"
              className="w-full"
              disabled={createAddress.isPending || !canSave}
              onClick={() => createAddress.mutate()}
            >
              Salvar endereço
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {isLoading ? (
        <Skeleton className="h-24 w-full" />
      ) : addresses?.length ? (
        <ul className="space-y-3">
          {addresses.map((row) => (
            <li key={row.id}>
              <Card>
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">
                        {row.label || "Endereço"}
                        {row.is_default ? (
                          <span className="ml-2 rounded-full bg-brand-soft px-2 py-0.5 text-xs text-brand">
                            Padrão
                          </span>
                        ) : null}
                      </p>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">
                        {row.street}, {row.number}
                        {row.complement ? ` — ${row.complement}` : ""}
                      </p>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">
                        {row.neighborhood} · {row.city}/{row.state}
                        {row.zip_code ? ` · ${row.zip_code}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {!row.is_default ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setDefault.mutate(row.id)}
                      >
                        Tornar padrão
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => void handleDelete(row.id, row.label)}
                    >
                      Remover
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-xl border border-dashed border-[hsl(var(--border))] px-6 py-12 text-center">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {storefrontCopy.account.addressesEmpty}
          </p>
        </div>
      )}
    </div>
  );
}
